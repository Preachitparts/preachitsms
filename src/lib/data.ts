
import { db } from './firebase';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  location?: string;
  groups?: string[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  color?: string;
  memberCount?: number; 
  members?: string[]; // Array of contact IDs
}

export interface SmsRecord {
  id: string;
  recipient: string;
  message: string;
  status: 'Sent' | 'Failed' | 'Pending';
  date: string;
  createdAt: any;
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
  try {
    const groupsCol = collection(db, 'groups');
    const groupsSnapshot = await getDocs(groupsCol);
    
    const groupsList = groupsSnapshot.docs.map(doc => {
      const groupData = doc.data();
      return {
        id: doc.id,
        name: groupData.name,
        description: groupData.description,
        color: groupData.color,
        members: groupData.members || [],
      } as Group
    });

    return groupsList;
  } catch (error) {
    console.error("Error fetching groups: ", error);
    return [];
  }
}

export async function getGroupsWithMemberCounts(): Promise<Group[]> {
    const groups = await getGroups();
    return groups.map(g => ({
        ...g,
        memberCount: g.members?.length || 0,
    }))
}


export async function getSmsHistory(): Promise<SmsRecord[]> {
  try {
    const historyCol = collection(db, 'smsHistory');
    const q = query(historyCol, orderBy('createdAt', 'desc'));
    const historySnapshot = await getDocs(q);
    
    const historyList = historySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as SmsRecord
    });
    
    return historyList;
  } catch (error) {
    console.error("Error fetching SMS history: ", error);
    return [];
  }
}
