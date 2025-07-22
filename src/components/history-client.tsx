
'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SmsRecord, Group } from '@/lib/data';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Calendar as CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { deleteSmsHistory } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';


export function HistoryClient({ initialHistory, initialGroups }: { initialHistory: SmsRecord[], initialGroups: Group[] }) {
    const [history, setHistory] = useState<SmsRecord[]>(initialHistory);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [date, setDate] = useState<Date | undefined>();
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

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

    const filteredHistory = useMemo(() => {
        return history.filter(record => {
            const dateMatch = !date || record.date === format(date, 'yyyy-MM-dd');
            const groupMatch = groupFilter === 'all' || (record.recipientGroups && record.recipientGroups.includes(groupFilter));
            return dateMatch && groupMatch;
        });
    }, [history, date, groupFilter]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(filteredHistory.map(h => h.id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleDelete = () => {
        if (selectedRows.size === 0) return;
        startTransition(async () => {
            const result = await deleteSmsHistory(Array.from(selectedRows));
            if (result.success) {
                toast({
                    title: 'Success!',
                    description: 'Selected history records have been deleted.',
                });
                setSelectedRows(new Set());
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to delete records',
                    description: result.error || 'An unknown error occurred.',
                });
            }
        });
    };

    if (history.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <p>No messages sent yet.</p>
                <p className="text-sm">Send a message from the dashboard to see its status here.</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Filter by date...</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Filter by group..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {initialGroups.map(group => (
                            <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedRows.size > 0 && (
                     <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete ({selectedRows.size})
                    </Button>
                )}
            </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead padding="checkbox">
                        <Checkbox
                            checked={selectedRows.size === filteredHistory.length && filteredHistory.length > 0}
                            indeterminate={selectedRows.size > 0 && selectedRows.size < filteredHistory.length}
                            onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                        />
                    </TableHead>
                    <TableHead>Sender ID</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Groups</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredHistory.map((record) => (
                    <TableRow key={record.id} data-state={selectedRows.has(record.id) && "selected"}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={selectedRows.has(record.id)}
                                onCheckedChange={() => handleSelectRow(record.id)}
                            />
                        </TableCell>
                        <TableCell className="font-medium">{record.senderId || '-'}</TableCell>
                        <TableCell>{record.recipientCount}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{record.recipientGroups?.join(', ')}</TableCell>
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
        </div>
    )
}
