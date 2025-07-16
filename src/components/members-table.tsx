
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Contact, Group } from '@/lib/data';
import { EditMemberButton } from './edit-member-button';
import { DeleteMemberButton } from './delete-member-button';
import { Badge } from './ui/badge';

export function MembersTable({ members, groups }: { members: Contact[]; groups: Group[] }) {
    if (members.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <p>No members yet.</p>
                <p className="text-sm">Click &quot;Add Member&quot; to get started.</p>
            </div>
        )
    }

  const getGroupNames = (groupIds: string[] = []) => {
    return groupIds.map(id => groups.find(g => g.id === id)?.name).filter(Boolean);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Groups</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell>{member.phone}</TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {getGroupNames(member.groups).map(name => (
                        <Badge key={name} variant="secondary">{name}</Badge>
                    ))}
                </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <EditMemberButton member={member} groups={groups} />
                  <DeleteMemberButton memberId={member.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
