
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Contact, Group } from '@/lib/data';
import { EditMemberButton } from './edit-member-button';
import { DeleteMemberButton } from './delete-member-button';

interface MemberWithGroupNames extends Contact {
    groupNames?: string;
}

export function MembersTable({ members, allGroups }: { members: MemberWithGroupNames[], allGroups: Group[] }) {
    if (members.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-10">
                <p>No members yet.</p>
                <p className="text-sm">Click &quot;Add Member&quot; to get started.</p>
            </div>
        )
    }

  return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium whitespace-nowrap">{member.name}</TableCell>
                <TableCell className="whitespace-nowrap">{member.phone}</TableCell>
                <TableCell className="whitespace-nowrap">{member.location}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">{member.groupNames}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <EditMemberButton member={member} groups={allGroups} />
                      <DeleteMemberButton memberId={member.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
}
