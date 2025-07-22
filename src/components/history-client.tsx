
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SmsRecord } from '@/lib/data';

export function HistoryClient({ initialHistory }: { initialHistory: SmsRecord[] }) {
    const [history, setHistory] = useState<SmsRecord[]>(initialHistory);

    useEffect(() => {
        const q = query(collection(db, "smsHistory"), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const historyData: SmsRecord[] = [];
            querySnapshot.forEach((doc) => {
                historyData.push({ id: doc.id, ...doc.data() } as SmsRecord);
            });
            setHistory(historyData);
        });

        return () => unsubscribe();
    }, []);

    if (history.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <p>No messages sent yet.</p>
                <p className="text-sm">Send a message from the dashboard to see its status here.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender ID</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.senderId || '-'}</TableCell>
                  <TableCell>{record.recipient}</TableCell>
                  <TableCell className="max-w-xs truncate">{record.message}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        record.status === 'Sent' ? 'default' : record.status === 'Failed' ? 'destructive' : 'secondary'
                      }
                      className={cn(record.status === 'Sent' && 'bg-green-600 hover:bg-green-700')}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{record.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    )
}
