
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getContacts, getGroups } from '@/lib/data';
import { AddMemberButton } from '@/components/add-member-button';
import { MembersClient } from '@/components/members-client';
import { ImportCsvButton } from '@/components/import-csv-button';

export const revalidate = 0; // Ensure dynamic rendering

export default async function MembersPage() {
  const [initialMembers, initialGroups] = await Promise.all([
    getContacts(),
    getGroups(),
  ]);

  return (
    <MainLayout>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline">Members</CardTitle>
            <CardDescription>Manage your contacts.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <ImportCsvButton />
            <AddMemberButton groups={initialGroups} />
          </div>
        </CardHeader>
        <CardContent>
          <MembersClient initialMembers={initialMembers} initialGroups={initialGroups} />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
