
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
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

export async function getGroups(calculateMembers = false): Promise<Group[]> {
  try {
    const groupsCol = collection(db, 'groups');
    const groupsSnapshot = await getDocs(groupsCol);
    
    let contacts: Contact[] = [];
    if (calculateMembers) {
      // Only fetch all contacts if we need to calculate member counts
      contacts = await getContacts();
    }
    
    const groupsList = groupsSnapshot.docs.map(doc => {
      const groupData = doc.data();
      let memberCount = 0;
      if (calculateMembers) {
         memberCount = contacts.filter(c => c.groups?.includes(doc.id)).length;
      }
      return {
        id: doc.id,
        name: groupData.name,
        memberCount: memberCount,
      } as Group
    });

    return groupsList;
  } catch (error) {
    console.error("Error fetching groups: ", error);
    return [];
  }
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
