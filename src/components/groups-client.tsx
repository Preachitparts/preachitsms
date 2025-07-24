
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { EditGroupButton } from '@/components/edit-group-button';
import { DeleteGroupButton } from '@/components/delete-group-button';
import { type Group } from '@/lib/data';

export function GroupsClient({ initialGroups }: { initialGroups: Group[] }) {
    const [groups, setGroups] = useState<Group[]>(initialGroups);

    useEffect(() => {
        const q = query(collection(db, "groups"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const groupsData: Group[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                groupsData.push({ 
                    id: doc.id,
                    ...data,
                    memberCount: data.members?.length || 0
                } as Group);
            });
            setGroups(groupsData);
        });

        return () => unsubscribe();
    }, []);

    return (
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
              {groups.map((group) => (
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
    )
}
