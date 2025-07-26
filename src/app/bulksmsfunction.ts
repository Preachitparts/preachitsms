'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const bulkSmsSchema = z.object({
  senderId: z.string().min(1, 'Sender ID cannot be empty.').max(11, 'Sender ID cannot be more than 11 characters.'),
  message: z.string().min(1, 'Message cannot be empty.').max(160, 'Message cannot be more than 160 characters.'),
  recipients: z.array(z.string().regex(/^233\d{9}$/)),
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
    recipients: formData.getAll('recipients').map(String),
  };

  const parsed = bulkSmsSchema.safeParse(smsData);
  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: `Invalid data provided. ${errorMessages}` };
  }

  const { message, senderId, recipients } = parsed.data;

  try {
    const apiKeys = await getApiKeys();
    if (!apiKeys || !apiKeys.clientId || !apiKeys.clientSecret) {
      return { success: false, error: 'API credentials are not configured. Please set them in the Settings page.' };
    }

    if (recipients.length === 0) {
      return { success: false, error: 'No recipients selected.' };
    }

    // Track failures
    const failedRecipients: string[] = [];

    for (const recipient of recipients) {
      const payload = {
        From: senderId,
        To: recipient,
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
      } catch (e) {
        console.error('Hubtel API invalid JSON response:', hubtelResponseText);
        failedRecipients.push(recipient);
        continue;
      }

      if (hubtelResponse.status !== 200 && hubtelResponse.status !== 201) {
        console.error('Hubtel API Error:', hubtelResult);
        failedRecipients.push(recipient);
        continue;
      }

      if (
        (hubtelResult.status !== 0 && hubtelResult.Status !== 0) &&
        !hubtelResult.jobId
      ) {
        console.error('Hubtel API logical error:', hubtelResult);
        failedRecipients.push(recipient);
        continue;
      }
    }

    const status = failedRecipients.length === 0 ? 'Sent' : 'Partially Sent';

    await addDoc(collection(db, 'smsHistory'), {
      senderId,
      recipientCount: recipients.length,
      failedRecipientCount: failedRecipients.length,
      recipientGroups: [],
      message,
      status,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      ...(failedRecipients.length > 0 ? { failedRecipients } : {}),
    });

    revalidatePath('/history');

    return failedRecipients.length === 0
      ? { success: true }
      : {
          success: false,
          error: `Some messages failed to send: ${failedRecipients.join(', ')}`,
        };

  } catch (error) {
    console.error('SMS sending error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';

    await addDoc(collection(db, 'smsHistory'), {
      senderId: smsData.senderId,
      recipientCount: smsData.recipients.length,
      recipientGroups: [],
      message: smsData.message,
      status: 'Failed',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      errorMessage,
    });

    revalidatePath('/history');
    return { success: false, error: errorMessage };
  }
}
