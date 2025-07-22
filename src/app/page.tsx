

'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { ContactSelector } from '@/components/contact-selector';
import { MessageComposer } from '@/components/message-composer';
import type { Contact, Group, DashboardStats } from '@/lib/data';
import { getDashboardStats } from '@/lib/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Folder, MessageSquareText, Calendar, Loader2 } from 'lucide-react';

function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
      setIsLoading(false);
    }
    fetchStats();

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
    
    const unsubHistory = onSnapshot(collection(db, 'smsHistory'), () => {
        // Refetch stats when history changes
        fetchStats();
    });

    return () => {
      unsubContacts();
      unsubGroups();
      unsubHistory();
    };
  }, []);
  

  return (
     <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Sent" value={stats?.smsCount || 0} icon={MessageSquareText} isLoading={isLoading} />
            <StatCard title="Total Members" value={contacts.length} icon={Users} isLoading={isLoading} />
            <StatCard title="Total Groups" value={groups.length} icon={Folder} isLoading={isLoading} />
            <StatCard title="Last Sent" value={stats?.lastSentDate || 'N/A'} icon={Calendar} isLoading={isLoading} />
        </div>
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
      </div>
    </MainLayout>
  );
}
