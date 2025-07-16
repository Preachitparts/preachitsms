
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

    console.log('Sending SMS:', message);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (message.toLowerCase().includes('fail')) {
        throw new Error('Hubtel API simulation failed.');
    }

    return { success: true };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred.' };
  }
}

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  email: z.string().email('Please enter a valid email.').optional().or(z.literal('')),
  groups: z.array(z.string()).min(1, 'Please select at least one group.'),
});


export async function addMember(formData: FormData) {
  try {
    const parsed = memberSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      groups: formData.getAll('groups'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.format() };
    }
    
    const { name, phone, email, groups } = parsed.data;

    await addDoc(collection(db, 'contacts'), {
      name,
      phone,
      email: email || '',
      groups: groups || [],
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

export async function updateMember(formData: FormData) {
    try {
        const parsed = updateMemberSchema.safeParse({
            id: formData.get('id'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            groups: formData.getAll('groups'),
        });

        if (!parsed.success) {
            return { success: false, error: parsed.error.format() };
        }

        const { id, name, phone, email, groups } = parsed.data;

        const memberRef = doc(db, 'contacts', id);
        await updateDoc(memberRef, { name, phone, email: email || '', groups: groups || [] });

        revalidatePath('/members');
        return { success: true };

    } catch (error) {
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
        return { success: true };
    } catch (error) {
        console.error("Error deleting member:", error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
