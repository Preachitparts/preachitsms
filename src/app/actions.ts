'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
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
});


export async function addMember(formData: FormData) {
  try {
    const parsed = memberSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.format() };
    }
    
    const { name, phone } = parsed.data;

    await addDoc(collection(db, 'contacts'), {
      name,
      phone,
    });

    revalidatePath('/members');
    return { success: true };

  } catch (error) {
    console.error("Error adding member:", error);
    return { success: false, error: { _errors: ["An unexpected error occurred."] } };
  }
}
