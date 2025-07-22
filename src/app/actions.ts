
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, writeBatch, arrayUnion, arrayRemove, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const smsSchema = z.object({
  senderId: z.string().min(1, 'Sender ID cannot be empty.').max(11, 'Sender ID cannot be more than 11 characters.'),
  message: z.string().min(1, 'Message cannot be empty.').max(160, 'Message is too long.'),
  selectedContacts: z.array(z.string()),
  selectedGroups: z.array(z.string()),
});

async function getApiKeys() {
    const docRef = doc(db, 'settings', 'apiCredentials');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

export async function sendSms(formData: FormData) {
  let smsData = {
      senderId: formData.get('senderId') as string,
      message: formData.get('message') as string,
      selectedContacts: formData.getAll('selectedContacts') as string[],
      selectedGroups: formData.getAll('selectedGroups') as string[]
  };

  try {
    const parsed = smsSchema.safeParse(smsData);

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map(e => e.message).join(', ') };
    }

    const { message, senderId, selectedContacts, selectedGroups } = parsed.data;

    // 1. Get API Keys from Firestore
    const apiKeys = await getApiKeys();
    if (!apiKeys || !apiKeys.clientId || !apiKeys.clientSecret) {
        return { success: false, error: "API credentials are not configured. Please set them in the Settings page." };
    }

    // 2. Aggregate all recipient phone numbers
    const contactsSnapshot = await getDocs(collection(db, 'contacts'));
    const contactMap = new Map(contactsSnapshot.docs.map(doc => [doc.id, doc.data()]));
    
    let allRecipientNumbers = new Set<string>();

    selectedContacts.forEach(contactId => {
        const contact = contactMap.get(contactId);
        if (contact?.phone) {
            allRecipientNumbers.add(contact.phone);
        }
    });

    if (selectedGroups.length > 0) {
        const groupsSnapshot = await getDocs(collection(db, 'groups'));
        const groupMap = new Map(groupsSnapshot.docs.map(doc => [doc.id, doc.data()]));

        selectedGroups.forEach(groupId => {
            const group = groupMap.get(groupId);
            if (group && group.members) {
                group.members.forEach((memberId: string) => {
                    const member = contactMap.get(memberId);
                    if (member?.phone) {
                        allRecipientNumbers.add(member.phone);
                    }
                });
            }
        });
    }

    if (allRecipientNumbers.size === 0) {
        return { success: false, error: "No recipients selected or recipients have no phone numbers." };
    }
    
    const recipientCount = allRecipientNumbers.size;
    const recipientGroupsNames = selectedGroups.length > 0 
      ? (await Promise.all(selectedGroups.map(gid => getDoc(doc(db, 'groups', gid)))))
          .map(d => d.data()?.name)
          .filter(Boolean)
      : [];
    
    // 3. Call Hubtel API
    const hubtelResponse = await fetch(`https://sms.hubtel.com/v1/messages/send?clientId=${apiKeys.clientId}&clientSecret=${apiKeys.clientSecret}&from=${senderId}&to=${Array.from(allRecipientNumbers).join(',')}&content=${encodeURIComponent(message)}`, {
        method: 'GET', // Or POST, depending on API. Docs say GET for simple send.
    });
    
    const hubtelResult = await hubtelResponse.json();

    if (!hubtelResponse.ok || hubtelResult.status !== 0) {
         throw new Error(hubtelResult.message || 'Hubtel API request failed.');
    }
    
    // Add to history
    await addDoc(collection(db, 'smsHistory'), {
      senderId,
      recipientCount,
      recipientGroups: recipientGroupsNames,
      message,
      status: 'Sent',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    });

    revalidatePath('/history');
    return { success: true };

  } catch (error) {
    console.error('SMS sending error:', error);
    
    const recipientGroupsNames = smsData.selectedGroups.length > 0 
      ? (await Promise.all(smsData.selectedGroups.map(gid => getDoc(doc(db, 'groups', gid)))))
          .map(d => d.data()?.name)
          .filter(Boolean)
      : [];

    await addDoc(collection(db, 'smsHistory'), {
      senderId: smsData.senderId,
      recipientCount: 0,
      recipientGroups: recipientGroupsNames,
      message: smsData.message,
      status: 'Failed',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    });

    revalidatePath('/history');

    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred.' };
  }
}

export async function deleteSmsHistory(ids: string[]) {
    try {
        if (!ids || ids.length === 0) {
            return { success: false, error: 'No history records selected.' };
        }

        const batch = writeBatch(db);
        ids.forEach(id => {
            const docRef = doc(db, 'smsHistory', id);
            batch.delete(docRef);
        });

        await batch.commit();

        revalidatePath('/history');
        return { success: true };
    } catch (error) {
        console.error("Error deleting history:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}


const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().regex(/^233\d{9}$/, 'Phone number must be a valid Ghanaian number (e.g., 233241234567).'),
  location: z.string().min(2, 'Location must be at least 2 characters.'),
  groups: z.array(z.string()).optional(),
});


export async function addMember(prevState: any, formData: FormData) {
  try {
    const parsed = memberSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      groups: formData.getAll('groups'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.format() };
    }
    
    const { name, phone, location, groups = [] } = parsed.data;

    const batch = writeBatch(db);

    const newMemberRef = doc(collection(db, 'contacts'));
    batch.set(newMemberRef, { name, phone, location, groups });

    for (const groupId of groups) {
      const groupRef = doc(db, 'groups', groupId);
      batch.update(groupRef, { members: arrayUnion(newMemberRef.id) });
    }
    
    await batch.commit();


    revalidatePath('/members');
    revalidatePath('/groups');
    return { success: true };

  } catch (error) {
    console.error("Error adding member:", error);
    return { success: false, error: { _errors: ["An unexpected error occurred."] } };
  }
}

const importedMemberSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
});

const importMembersSchema = z.array(importedMemberSchema);

export async function importMembers(contacts: { name: string, phone: string }[]) {
    try {
        const parsed = importMembersSchema.safeParse(contacts);
        if (!parsed.success) {
            return { success: false, error: 'Invalid contact format provided.' };
        }

        const batch = writeBatch(db);

        parsed.data.forEach(contact => {
            const newMemberRef = doc(collection(db, 'contacts'));
            batch.set(newMemberRef, { 
                name: contact.name, 
                phone: contact.phone,
                location: 'Imported', // Default location
                groups: [] 
            });
        });
        
        await batch.commit();

        revalidatePath('/members');
        return { success: true, count: parsed.data.length };

    } catch (error) {
        console.error("Error importing members:", error);
        return { success: false, error: 'An unexpected error occurred during import.' };
    }
}


const updateMemberSchema = memberSchema.extend({
    id: z.string().min(1, 'Member ID is required.'),
});

export async function updateMember(prevState: any, formData: FormData) {
    try {
        const parsed = updateMemberSchema.safeParse({
            id: formData.get('id'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            groups: formData.getAll('groups'),
        });

        if (!parsed.success) {
            return { success: false, error: parsed.error.format() };
        }

        const { id, name, phone, location, groups = [] } = parsed.data;

        const batch = writeBatch(db);
        const memberRef = doc(db, 'contacts', id);

        // Get the current groups of the member
        const memberDoc = await getDoc(memberRef);
        const currentGroups = memberDoc.data()?.groups || [];

        const groupsToAdd = groups.filter(g => !currentGroups.includes(g));
        const groupsToRemove = currentGroups.filter((g: string) => !groups.includes(g));

        // Update the member document
        batch.update(memberRef, { name, phone, location, groups });

        // Add member to new groups
        for (const groupId of groupsToAdd) {
          const groupRef = doc(db, 'groups', groupId);
          batch.update(groupRef, { members: arrayUnion(id) });
        }
        
        // Remove member from old groups
        for (const groupId of groupsToRemove) {
          const groupRef = doc(db, 'groups', groupId);
          batch.update(groupRef, { members: arrayRemove(id) });
        }
        
        await batch.commit();


        revalidatePath('/members');
        revalidatePath('/groups');
        return { success: true };

    } catch (error)
    {
        console.error("Error updating member:", error);
        return { success: false, error: { _errors: ["An unexpected error occurred."] } };
    }
}


export async function deleteMember(formData: FormData) {
    try {
        const id = formData.get('id') as string;
        if (!id) {
            return { success: false, error: 'Member ID is missing.' };
        }

        const batch = writeBatch(db);
        const memberRef = doc(db, 'contacts', id);

        // Get the member's groups to remove them from those groups
        const memberDoc = await getDoc(memberRef);
        const groups = memberDoc.data()?.groups || [];
        for (const groupId of groups) {
          const groupRef = doc(db, 'groups', groupId);
          batch.update(groupRef, { members: arrayRemove(id) });
        }

        batch.delete(memberRef);

        await batch.commit();

        revalidatePath('/members');
        revalidatePath('/groups');
        return { success: true };
    } catch (error) {
        console.error("Error deleting member:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

// Group Actions
const groupSchema = z.object({
    name: z.string().min(2, 'Group name must be at least 2 characters.'),
    description: z.string().optional(),
    color: z.string().min(1, 'Please select a color.'),
});

export async function addGroup(prevState: any, formData: FormData) {
    try {
        const parsed = groupSchema.safeParse({
            name: formData.get('name'),
            description: formData.get('description'),
            color: formData.get('color'),
        });

        if (!parsed.success) {
            return { success: false, error: parsed.error.format() };
        }

        const { name, description, color } = parsed.data;

        await addDoc(collection(db, 'groups'), {
            name,
            description: description || '',
            color,
            members: [],
        });

        revalidatePath('/groups');
        return { success: true };

    } catch (error) {
        console.error("Error adding group:", error);
        return { success: false, error: { _errors: ["An unexpected error occurred."] } };
    }
}

const updateGroupSchema = groupSchema.extend({
    id: z.string().min(1, 'Group ID is required.'),
});

export async function updateGroup(prevState: any, formData: FormData) {
    try {
        const parsed = updateGroupSchema.safeParse({
            id: formData.get('id'),
            name: formData.get('name'),
            description: formData.get('description'),
            color: formData.get('color'),
        });

        if (!parsed.success) {
            return { success: false, error: parsed.error.format() };
        }

        const { id, name, description, color } = parsed.data;

        const groupRef = doc(db, 'groups', id);
        await updateDoc(groupRef, { name, description: description || '', color });

        revalidatePath('/groups');
        revalidatePath('/members');
        return { success: true };

    } catch (error) {
        console.error("Error updating group:", error);
        return { success: false, error: { _errors: ["An unexpected error occurred."] } };
    }
}

export async function deleteGroup(formData: FormData) {
    try {
        const id = formData.get('id') as string;
        if (!id) {
            return { success: false, error: 'Group ID is missing.' };
        }
        await deleteDoc(doc(db, 'groups', id));

        revalidatePath('/groups');
        revalidatePath('/members');
        return { success: true };
    } catch (error) {
        console.error("Error deleting group:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

// Settings Action
const settingsSchema = z.object({
    clientId: z.string().min(1, 'Client ID cannot be empty.'),
    clientSecret: z.string().min(1, 'Client Secret cannot be empty.'),
});

export async function saveApiKeys(formData: FormData) {
    try {
        const parsed = settingsSchema.safeParse({
            clientId: formData.get('clientId'),
            clientSecret: formData.get('clientSecret'),
        });

        if (!parsed.success) {
            return { success: false, error: parsed.error.format()._errors.join(', ') };
        }

        const { clientId, clientSecret } = parsed.data;

        const settingsRef = doc(db, 'settings', 'apiCredentials');
        await setDoc(settingsRef, { clientId, clientSecret }, { merge: true });
        
        return { success: true };
    } catch (error) {
        console.error("Error saving API keys:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

    
