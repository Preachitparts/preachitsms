
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const smsSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.').max(160, 'Message is too long.'),
});

export async function sendSms(formData: FormData) {
  try {
    const parsed = smsSchema.safeParse({
      message: formData.get('message'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map(e => e.message).join(', ') };
    }

    const { message } = parsed.data;

    // TODO: This should be replaced with actual Hubtel API call
    console.log('Sending SMS:', message);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (message.toLowerCase().includes('fail')) {
        throw new Error('Hubtel API simulation failed.');
    }
    
    // Add to history
    await addDoc(collection(db, 'smsHistory'), {
      recipient: 'Selected Recipients', // This needs to be implemented
      message,
      status: 'Sent',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    });

    revalidatePath('/history');

    return { success: true };
  } catch (error) {
    console.error('SMS sending error:', error);
    
    await addDoc(collection(db, 'smsHistory'), {
      recipient: 'Selected Recipients', // This needs to be implemented
      message: formData.get('message'),
      status: 'Failed',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    });

    revalidatePath('/history');

    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred.' };
  }
}

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().regex(/^233\d{9}$/, 'Phone number must be a valid Ghanaian number (e.g., 233241234567).'),
  location: z.string().min(2, 'Location must be at least 2 characters.'),
});


export async function addMember(prevState: any, formData: FormData) {
  try {
    const parsed = memberSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      location: formData.get('location'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.format() };
    }
    
    const { name, phone, location } = parsed.data;

    await addDoc(collection(db, 'contacts'), {
      name,
      phone,
      location
    });

    revalidatePath('/members');
    return { success: true };

  } catch (error) {
    console.error("Error adding member:", error);
    return { success: false, error: { _errors: ["An unexpected error occurred."] } };
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
        });

        if (!parsed.success) {
            return { success: false, error: parsed.error.format() };
        }

        const { id, name, phone, location } = parsed.data;

        const memberRef = doc(db, 'contacts', id);
        await updateDoc(memberRef, { name, phone, location });

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

        await deleteDoc(doc(db, 'contacts', id));

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

        // In a real app, you would save these securely, e.g., in a secure backend or environment variables.
        // For this demo, we'll just log them to the console to show they were received.
        console.log('Saving API Keys...');
        console.log('Client ID:', clientId);
        console.log('Client Secret:', clientSecret.substring(0, 4) + '...');
        
        // Simulate saving
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
    } catch (error) {
        console.error("Error saving API keys:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
