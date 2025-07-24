
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const bulkSmsSchema = z.object({
  senderId: z.string().min(1, 'Sender ID cannot be empty.').max(11, 'Sender ID cannot be more than 11 characters.'),
  message: z.string().min(1, 'Message cannot be empty.').max(160, 'Message cannot be more than 160 characters.'),
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

export async function sendBulkSms(formData: FormData) {
     const smsData = {
      senderId: formData.get('senderId') as string,
      message: formData.get('message') as string,
      selectedContacts: formData.getAll('selectedContacts').map(String),
      selectedGroups: formData.getAll('selectedGroups').map(String),
    };
    
    const parsed = bulkSmsSchema.safeParse(smsData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors.map(e => e.message).join(', ') };
    }
    const { message, senderId, selectedContacts, selectedGroups } = parsed.data;

    let recipientGroupNames: string[] = [];
    if (selectedGroups.length > 0) {
      try {
        const groupsQuery = query(collection(db, 'groups'), where('__name__', 'in', selectedGroups));
        const groupsSnapshot = await getDocs(groupsQuery);
        recipientGroupNames = groupsSnapshot.docs.map(d => d.data().name);
      } catch (e) {
         console.error("Could not fetch group names for logging", e);
      }
    }
    
    try {
        const apiKeys = await getApiKeys();
        if (!apiKeys || !apiKeys.clientId || !apiKeys.clientSecret) {
            return { success: false, error: "API credentials are not configured. Please set them in the Settings page." };
        }

        const allRecipientNumbers = new Set<string>();

        if (selectedContacts.length > 0) {
            const contactsQuery = query(collection(db, 'contacts'), where('__name__', 'in', selectedContacts));
            const contactsSnapshot = await getDocs(contactsQuery);
            contactsSnapshot.forEach(doc => {
                const contact = doc.data();
                if (contact?.phone) {
                    allRecipientNumbers.add(contact.phone);
                }
            });
        }

        if (selectedGroups.length > 0) {
            const groupsQuery = query(collection(db, 'groups'), where('__name__', 'in', selectedGroups));
            const groupsSnapshot = await getDocs(groupsQuery);
            const memberIds = new Set<string>();
            groupsSnapshot.forEach(doc => {
                const group = doc.data();
                if (group?.members) {
                    group.members.forEach((memberId: string) => memberIds.add(memberId));
                }
            });

            if (memberIds.size > 0) {
                const uniqueMemberIds = Array.from(memberIds);
                // Firestore 'in' queries are limited to 30 items.
                // We chunk the memberIds to handle more than 30.
                const memberIdChunks: string[][] = [];
                for (let i = 0; i < uniqueMemberIds.length; i += 30) {
                    memberIdChunks.push(uniqueMemberIds.slice(i, i + 30));
                }
                
                for (const chunk of memberIdChunks) {
                    const membersQuery = query(collection(db, 'contacts'), where('__name__', 'in', chunk));
                    const membersSnapshot = await getDocs(membersQuery);
                    membersSnapshot.forEach(doc => {
                        const member = doc.data();
                        if (member?.phone) {
                            allRecipientNumbers.add(member.phone);
                        }
                    });
                }
            }
        }


        if (allRecipientNumbers.size === 0) {
            return { success: false, error: "No recipients selected or recipients have no phone numbers." };
        }
        
        const recipientsArray = Array.from(allRecipientNumbers);
        const payload = {
            From: senderId,
            To: recipientsArray,
            Content: message,
        };
        const hubtelResponse = await fetch('https://sms.hubtel.com/v1/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + btoa(`${apiKeys.clientId}:${apiKeys.clientSecret}`),
            },
            body: JSON.stringify(payload),
        });

        const hubtelResponseText = await hubtelResponse.text();
        let hubtelResult;
        try {
            hubtelResult = JSON.parse(hubtelResponseText);
        } catch(e) {
            console.error("Hubtel API invalid JSON response:", hubtelResponseText);
            throw new Error(`Hubtel API returned an invalid response. Status: ${hubtelResponse.status}. Response: ${hubtelResponseText}`);
        }
        
        if (hubtelResponse.status !== 200 && hubtelResponse.status !== 201) {
            console.error("Hubtel API Error:", hubtelResult);
            const errorMessage = hubtelResult.message || hubtelResult.Message || `Request failed. Full API Response: ${JSON.stringify(hubtelResult)}`;
            throw new Error(errorMessage);
        }

        if (hubtelResult.status !== 0 && hubtelResult.Status !== 0 && !hubtelResult.jobId) {
            console.error("Hubtel API Error:", hubtelResult);
            const errorMessage = hubtelResult.message || hubtelResult.Message || `Request failed. Full API Response: ${JSON.stringify(hubtelResult)}`;
            throw new Error(errorMessage);
        }
        
        await addDoc(collection(db, 'smsHistory'), {
          senderId,
          recipientCount: allRecipientNumbers.size,
          recipientGroups: recipientGroupNames,
          message,
          status: 'Sent',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
        });

        revalidatePath('/history');
        return { success: true };

    } catch (error) {
        console.error('SMS sending error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';

        await addDoc(collection(db, 'smsHistory'), {
          senderId: smsData.senderId,
          recipientCount: 0, 
          recipientGroups: recipientGroupNames,
          message: smsData.message,
          status: 'Failed',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          errorMessage: errorMessage
        });

        revalidatePath('/history');

        return { success: false, error: errorMessage };
    }
}

    