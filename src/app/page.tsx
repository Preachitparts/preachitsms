
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { ContactSelector } from '@/components/contact-selector';
import { MessageComposer } from '@/components/message-composer';
import type { Contact, Group } from '@/lib/data';
import { getContacts, getGroupsWithMemberCounts } from '@/lib/data';

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  // In a real app, you might fetch this data in a useEffect or use a library like SWR/React Query
  // For now, we'll keep it simple and just fetch it once.
  useState(() => {
    async function fetchData() {
      const [contactsData, groupsData] = await Promise.all([
        getContacts(),
        getGroupsWithMemberCounts()
      ]);
      setContacts(contactsData);
      setGroups(groupsData);
    }
    fetchData();
  });
  

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
