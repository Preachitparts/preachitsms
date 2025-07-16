'use client';

import { MainLayout } from '@/components/main-layout';
import { ContactSelector } from '@/components/contact-selector';
import { MessageComposer } from '@/components/message-composer';
import type { Contact, Group } from '@/lib/data';

function DashboardClient({ contacts, groups }: { contacts: Contact[], groups: Group[] }) {
  return (
    <MainLayout>
      <div className="grid h-full gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ContactSelector contacts={contacts} groups={groups} />
        </div>
        <div className="lg:col-span-3">
          <MessageComposer />
        </div>
      </div>
    </MainLayout>
  );
}

import { getContacts, getGroups } from '@/lib/data';

export default async function DashboardPage() {
  const contacts = await getContacts();
  const groups = await getGroups();

  return <DashboardClient contacts={contacts} groups={groups} />;
}
