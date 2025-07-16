'use server';

import { z } from 'zod';

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

    // Here you would integrate with the Hubtel SMS API
    console.log('Sending SMS:', message);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate potential failure
    if (message.toLowerCase().includes('fail')) {
        throw new Error('Hubtel API simulation failed.');
    }

    return { success: true };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred.' };
  }
}
