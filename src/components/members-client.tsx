
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MembersTable } from './members-table';
import type { Contact } from '@/lib/data';

export function MembersClient({ initialMembers }: { initialMembers: Contact[] }) {
    const [members, setMembers] = useState<Contact[]>(initialMembers);

    useEffect(() => {
        const q = query(collection(db, "contacts"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const membersData: Contact[] = [];
            querySnapshot.forEach((doc) => {
                membersData.push({ id: doc.id, ...doc.data() } as Contact);
            });
            setMembers(membersData);
        });

        return () => unsubscribe();
    }, []);

    return <MembersTable members={members} />;
}
