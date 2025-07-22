
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getContacts } from '@/lib/data';
import { AddMemberButton } from '@/components/add-member-button';
import { MembersClient } from '@/components/members-client';

export const revalidate = 0; // Ensure dynamic rendering

export default async function MembersPage() {
  const initialMembers = await getContacts();

  return (
    <MainLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Members</CardTitle>
            <CardDescription>Manage your contacts.</CardDescription>
          </div>
          <AddMemberButton />
        </CardHeader>
        <CardContent>
          <MembersClient initialMembers={initialMembers} />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
