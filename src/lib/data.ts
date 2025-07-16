
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  groups?: string[];
}

export interface Group {
  id: string;
  name: string;
  memberCount: number;
}

export interface SmsRecord {
  id: string;
  recipient: string;
  message: string;
  status: 'Sent' | 'Failed' | 'Pending';
  date: string;
}

export async function getContacts(): Promise<Contact[]> {
  try {
    const contactsCol = collection(db, 'contacts');
    const contactsSnapshot = await getDocs(contactsCol);
    const contactsList = contactsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Contact));
    return contactsList;
  } catch (error) {
    console.error("Error fetching contacts: ", error);
    return [];
  }
}

export async function getGroups(): Promise<Group[]> {
  // This is still mock data. We can connect this to Firestore next if you like.
   const groups: Group[] = [
    { id: 'g1', name: 'VIP Customers', memberCount: 12 },
    { id: 'g2', name: 'New Leads', memberCount: 45 },
    { id: 'g3', name: 'Tier 1 Suppliers', memberCount: 8 },
    { id: 'g4', name: 'All Staff', memberCount: 22 },
  ];
  return groups;
}

export async function getSmsHistory(): Promise<SmsRecord[]> {
  // Mock data for now
  const smsHistory: SmsRecord[] = [
    { id: '1', recipient: 'John Doe', message: 'Hello, this is a test message.', status: 'Sent', date: '2024-05-21' },
    { id: '2', recipient: 'Jane Smith', message: 'Your appointment is confirmed.', status: 'Sent', date: '2024-05-20' },
    { id: '3', recipient: 'Peter Jones', message: 'Failed to deliver message.', status: 'Failed', date: '2024-05-20' },
    { id: '4', recipient: 'Mary Johnson', message: 'Your package is out for delivery.', status: 'Pending', date: '2024-05-21' },
  ];
  return smsHistory;
}
