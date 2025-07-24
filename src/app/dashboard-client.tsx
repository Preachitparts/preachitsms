
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { ContactSelector } from '@/components/contact-selector';
import { MessageComposer } from '@/components/message-composer';
import type { Contact, Group, DashboardStats, SmsRecord } from '@/lib/data';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Folder, MessageSquareText, Calendar, Loader2 } from 'lucide-react';
import { sendBulkSms, sendDashboardSms } from './actions';

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

interface DashboardClientProps {
  initialContacts: Contact[];
  initialGroups: Group[];
  initialStats: DashboardStats;
  isBulk?: boolean;
}

export function DashboardClient({ initialContacts, initialGroups, initialStats, isBulk = false }: DashboardClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [smsCount, setSmsCount] = useState(initialStats.smsCount);
  const [lastSentDate, setLastSentDate] = useState(initialStats.lastSentDate);
  const [isLoading, setIsLoading] = useState(!initialStats); 
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [manualNumber, setManualNumber] = useState<string>('');
  
  // For single-recipient mode on dashboard
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Live updates from Firestore
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
    
    const historyQuery = query(collection(db, 'smsHistory'), orderBy('createdAt', 'desc'));
    const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
        const historyData = snapshot.docs.map(doc => doc.data() as SmsRecord);
        const newSmsCount = historyData.length;
        const newLastSentDate = historyData.length > 0 ? historyData[0].date : 'N/A';
        
        setSmsCount(newSmsCount);
        setLastSentDate(newLastSentDate);
    });
    
    setIsLoading(false);

    return () => {
      unsubContacts();
      unsubGroups();
      unsubHistory();
    };
  }, []);
  
  const recipient = isBulk ? undefined : manualNumber || selectedContact?.phone;

  return (
     <MainLayout>
      <div className="flex flex-col gap-6">
        {!isBulk && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Sent" value={smsCount} icon={MessageSquareText} isLoading={isLoading} />
              <StatCard title="Total Members" value={contacts.length} icon={Users} isLoading={isLoading} />
              <StatCard title="Total Groups" value={groups.length} icon={Folder} isLoading={isLoading} />
              <StatCard title="Last Sent" value={lastSentDate || 'N/A'} icon={Calendar} isLoading={isLoading} />
          </div>
        )}
        <div className="grid h-full gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ContactSelector 
              contacts={contacts} 
              groups={groups}
              isBulk={isBulk}
              selectedContacts={selectedContacts}
              setSelectedContacts={setSelectedContacts}
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
              manualNumber={manualNumber}
              setManualNumber={setManualNumber}
              selectedContact={selectedContact}
              setSelectedContact={setSelectedContact}
            />
          </div>
          <div className="lg:col-span-3">
            <MessageComposer 
              recipient={recipient}
              selectedContacts={Array.from(selectedContacts)}
              selectedGroups={Array.from(selectedGroups)}
              sendAction={isBulk ? sendBulkSms : sendDashboardSms}
              isBulk={isBulk}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
