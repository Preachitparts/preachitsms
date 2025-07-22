
import { MainLayout } from '@/components/main-layout';
import { ContactSelector } from '@/components/contact-selector';
import { MessageComposer } from '@/components/message-composer';
import type { Contact, Group } from '@/lib/data';
import { getContacts, getGroupsWithMemberCounts } from '@/lib/data';

export const revalidate = 0; // Ensure dynamic rendering

export default async function DashboardPage() {
  // Fetch contacts and groups in parallel for better performance
  const [contacts, groups] = await Promise.all([
    getContacts(),
    getGroupsWithMemberCounts()
  ]);

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
