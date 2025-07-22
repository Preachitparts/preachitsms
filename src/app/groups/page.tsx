import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getGroups, getContacts } from '@/lib/data';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AddGroupButton } from '@/components/add-group-button';
import { EditGroupButton } from '@/components/edit-group-button';
import { DeleteGroupButton } from '@/components/delete-group-button';

export default async function GroupsPage() {
  const [groups, contacts] = await Promise.all([
    getGroups(),
    getContacts(),
  ]);

  // Calculate member counts
  const groupsWithCounts = groups.map(group => ({
    ...group,
    memberCount: contacts.filter(c => c.groups?.includes(group.id)).length
  }));

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupsWithCounts.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                     <span 
                        className="h-4 w-4 rounded-full" 
                        style={{ backgroundColor: group.color }}
                      ></span>
                    {group.name}
                  </TableCell>
                   <TableCell className="text-muted-foreground max-w-xs truncate">
                    {group.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{group.memberCount} members</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <EditGroupButton group={group} />
                        <DeleteGroupButton groupId={group.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
