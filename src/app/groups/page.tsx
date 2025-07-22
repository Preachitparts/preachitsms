import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getGroupsWithMemberCounts } from '@/lib/data';
import { GroupsClient } from '@/components/groups-client';

export const revalidate = 0; // Ensure dynamic rendering

export default async function GroupsPage() {
  const groups = await getGroupsWithMemberCounts();

  return (
    <MainLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Groups</CardTitle>
            <CardDescription>Organize your members into groups.</CardDescription>
          </div>
          <AddGroupButton />
        </CardHeader>
        <CardContent>
          <GroupsClient initialGroups={groups} />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
