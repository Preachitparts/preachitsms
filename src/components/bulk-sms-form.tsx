'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendBulkSms } from '@/app/bulksmsfunction';
import type { Contact } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';

export function BulkSmsForm({ contacts }: { contacts: Contact[] }) {
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleRecipient = (phone: string) => {
    setSelectedPhones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phone)) {
        newSet.delete(phone);
      } else {
        newSet.add(phone);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhones.size === filteredContacts.length) {
      setSelectedPhones(new Set());
    } else {
      setSelectedPhones(new Set(filteredContacts.map(c => c.phone)));
    }
  }

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );
  
  const handleSubmit = async (formData: FormData) => {
    if (selectedPhones.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No recipients',
        description: 'Please select at least one recipient.',
      });
      return;
    }
    
    // The sendBulkSms action expects selectedContacts (which are IDs)
    // but the UI is selecting phones. We will just pass the phones directly.
    // Let's modify the form data before sending.
    const contactMap = new Map(contacts.map(c => [c.phone, c.id]));
    const selectedContactIds = Array.from(selectedPhones).map(phone => contactMap.get(phone)).filter(Boolean) as string[];

    // Since sendBulkSms is designed to work with groups and contacts, we will pass contact IDs
    selectedContactIds.forEach(id => formData.append('selectedContacts', id));
    
    // We'll also set selectedGroups to empty array
    formData.append('selectedGroups', '');


    startTransition(async () => {
      const result = await sendBulkSms(formData);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your bulk message has been sent.',
        });
        formRef.current?.reset();
        setSelectedPhones(new Set());
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to send',
          description: result.error,
        });
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="senderId">Sender ID</Label>
                <Input
                id="senderId"
                name="senderId"
                placeholder="Max 11 characters"
                maxLength={11}
                required
                defaultValue="Preach It"
                disabled={isPending}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Type your message here..."
                    required
                    disabled={isPending}
                    maxLength={160}
                />
            </div>
       </div>
      
      <div className="space-y-4">
        <Label>Select Recipients ({selectedPhones.size} selected)</Label>
        <div className='flex gap-2'>
            <Input 
                placeholder='Search contacts...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={handleSelectAll}>
              {selectedPhones.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
            </Button>
        </div>
        <ScrollArea className="h-64 rounded-md border p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredContacts.map(contact => (
                <Button
                    type="button"
                    key={contact.id}
                    variant={selectedPhones.has(contact.phone) ? 'default' : 'outline'}
                    onClick={() => toggleRecipient(contact.phone)}
                    className="w-full h-auto py-2 flex flex-col items-start text-left"
                    disabled={isPending}
                >
                    <span className="font-semibold">{contact.name}</span>
                    <span className="text-xs text-muted-foreground">{contact.phone}</span>
                </Button>
                ))}
            </div>
        </ScrollArea>
      </div>

      <Button type="submit" disabled={isPending || selectedPhones.size === 0}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Bulk SMS ({selectedPhones.size})
      </Button>
    </form>
  );
}
