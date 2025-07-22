
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { ContactSelector } from '@/components/contact-selector';
import { MessageComposer } from '@/components/message-composer';
import type { Contact, Group } from '@/lib/data';
import { getContacts, getGroupsWithMemberCounts } from '@/lib/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubContacts = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
      setContacts(contactsData);
    });

    const unsubGroups = onSnapshot(collection(db, 'groups'), (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        memberCount: doc.data().members?.length || 0
      } as Group));
      setGroups(groupsData);
    });

    return () => {
      unsubContacts();
      unsubGroups();
    };
  }, []);
  

  return (
     <MainLayout>
      <div className="grid h-full gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ContactSelector 
            contacts={contacts} 
            groups={groups}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContacts}
            selectedGroups={selectedGroups}
            setSelectedGroups={setSelectedGroups}
          />
        </div>
        <div className="lg:col-span-3">
          <MessageComposer 
             selectedContacts={Array.from(selectedContacts)}
             selectedGroups={Array.from(selectedGroups)}
          />
        </div>
      </div>
    </MainLayout>
  );
}
