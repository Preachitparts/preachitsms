
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MembersTable } from './members-table';
import type { Contact, Group } from '@/lib/data';

export function MembersClient({ initialMembers, initialGroups }: { initialMembers: Contact[], initialGroups: Group[] }) {
    const [members, setMembers] = useState<Contact[]>(initialMembers);
    const [groups, setGroups] = useState<Group[]>(initialGroups);

    useEffect(() => {
        const qMembers = query(collection(db, "contacts"));
        const unsubscribeMembers = onSnapshot(qMembers, (querySnapshot) => {
            const membersData: Contact[] = [];
            querySnapshot.forEach((doc) => {
                membersData.push({ id: doc.id, ...doc.data() } as Contact);
            });
            setMembers(membersData);
        });

        const qGroups = query(collection(db, "groups"));
        const unsubscribeGroups = onSnapshot(qGroups, (querySnapshot) => {
            const groupsData: Group[] = [];
            querySnapshot.forEach((doc) => {
                groupsData.push({ id: doc.id, ...doc.data() } as Group);
            });
            setGroups(groupsData);
        });

        return () => {
            unsubscribeMembers();
            unsubscribeGroups();
        };
    }, []);

    const membersWithGroupNames = members.map(member => {
        const memberGroups = member.groups?.map(groupId => {
            return groups.find(g => g.id === groupId)?.name || 'Unknown Group';
        }).join(', ');
        return { ...member, groupNames: memberGroups };
    });

    return <MembersTable members={membersWithGroupNames} allGroups={groups} />;
}
