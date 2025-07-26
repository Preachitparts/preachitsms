
import { db } from './firebase';
import { collection, getDocs, query, orderBy, getDoc, doc, Timestamp, limit,getCountFromServer, where } from 'firebase/firestore';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
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
  senderId?: string;
  recipientCount: number;
  recipientGroups?: string[];
  message: string;
  status: 'Sent' | 'Failed' | 'Pending';
  date: string;
  createdAt: any;
}

export interface DashboardStats {
  smsCount: number;
  lastSentDate: string | null;
}

export interface AdminDoc {
    uid: string;
    email: string;
    fullName: string;
    canSeeSettings: boolean;
    photoURL?: string;
    status?: string;
}


export async function getContacts(options?: { withEmail?: boolean }): Promise<Contact[]> {
  try {
    let q = query(collection(db, 'contacts'), orderBy('name'));
    if (options?.withEmail) {
        q = query(q, where('email', '!=', ''));
    }
    const contactsSnapshot = await getDocs(q);
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
    const groupsSnapshot = await getDocs(query(groupsCol, orderBy('name')));
    
    const groupsList = groupsSnapshot.docs.map(doc => {
      const groupData = doc.data();
      return {
        id: doc.id,
        name: groupData.name,
        description: groupData.description,
        color: groupData.color,
        members: groupData.members || [],
        memberCount: groupData.members?.length || 0,
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
      // Ensure createdAt is a plain object for server->client component communication
      const createdAt = data.createdAt;
      return {
        id: doc.id,
        ...data,
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : createdAt,
      } as SmsRecord
    });
    
    return historyList;
  } catch (error) {
    console.error("Error fetching SMS history: ", error);
    return [];
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const historyCol = collection(db, 'smsHistory');
        
        // Get total count of sent messages
        const countSnapshot = await getCountFromServer(historyCol);
        const smsCount = countSnapshot.data().count;

        // Get the last sent message
        const lastSentQuery = query(historyCol, orderBy('createdAt', 'desc'), limit(1));
        const lastSentSnapshot = await getDocs(lastSentQuery);

        let lastSentDate: string | null = null;
        if (!lastSentSnapshot.empty) {
            const lastSentDoc = lastSentSnapshot.docs[0].data();
            lastSentDate = lastSentDoc.date; // Assuming 'date' is a string like 'YYYY-MM-DD'
        }
        
        return { smsCount, lastSentDate };

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { smsCount: 0, lastSentDate: null };
    }
}
