
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getGroupsWithMemberCounts } from '@/lib/data';
import { GroupsClient } from '@/components/groups-client';
import { AddGroupButton } from '@/components/add-group-button';

export const revalidate = 0; // Ensure dynamic rendering

export default async function GroupsPage() {
  const groups = await getGroupsWithMemberCounts();

  return (
    <MainLayout>
      <div className="flex flex-col gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Groups</CardTitle>
                <CardDescription>Organize your members into groups.</CardDescription>
              </div>
              <AddGroupButton />
            </CardHeader>
        </Card>
        <Card>
            <CardContent className="p-0">
              <GroupsClient initialGroups={groups} />
            </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
