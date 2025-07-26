
'use client';

import { useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendEmail } from '@/app/actions';
import type { Contact } from '@/lib/data';
import { Loader2, Send, X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { z } from 'zod';

const emailSchema = z.string().email();

export function EmailComposerForm({ contacts }: { contacts: Contact[] }) {
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  const toggleRecipient = (email: string) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(email)) {
        newSet.delete(email);
      } else {
        newSet.add(email);
      }
      return newSet;
    });
  };
  
  const handleManualAdd = () => {
    const result = emailSchema.safeParse(manualEmail);
    if (result.success) {
      toggleRecipient(result.data);
      setManualEmail('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
      });
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.email && (
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const handleSubmit = async (formData: FormData) => {
    if (selectedEmails.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No recipients',
        description: 'Please select or add at least one recipient.',
      });
      return;
    }
    
    Array.from(selectedEmails).forEach(email => formData.append('recipients', email));
    
    startTransition(async () => {
      const result = await sendEmail(formData);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your email has been sent.',
        });
        formRef.current?.reset();
        setSelectedEmails(new Set());
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to send email',
          description: result.error,
        });
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Your email subject"
                  required
                  disabled={isPending}
                />
            </div>
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                    id="body"
                    name="body"
                    placeholder="Type your message here..."
                    required
                    disabled={isPending}
                    className="min-h-48"
                />
            </div>
       </div>
      
      <div className="space-y-4">
        <Label>Recipients ({selectedEmails.size} selected)</Label>
        {selectedEmails.size > 0 && (
          <div className="space-y-2 rounded-md border p-2">
             <Label className="text-xs text-muted-foreground">Selected Emails</Label>
             <div className="flex flex-wrap gap-2">
              {Array.from(selectedEmails).map(email => (
                <Badge key={email} variant="secondary">
                  {email}
                  <button type="button" onClick={() => toggleRecipient(email)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Add email address manually..."
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleManualAdd(); }}}
            />
            <Button type="button" variant="outline" onClick={handleManualAdd}>Add</Button>
        </div>
        <div className='flex gap-2'>
            <Input 
                placeholder='Search contacts by name or email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <ScrollArea className="h-64 rounded-md border p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredContacts.map(contact => (
                  <Button
                    type="button"
                    key={contact.id}
                    variant={selectedEmails.has(contact.email!) ? 'default' : 'outline'}
                    onClick={() => toggleRecipient(contact.email!)}
                    className="w-full h-auto py-2 flex flex-col items-start text-left"
                    disabled={isPending || !contact.email}
                    title={contact.email}
                  >
                    <span className="font-semibold truncate">{contact.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{contact.email}</span>
                  </Button>
                ))}
            </div>
             {filteredContacts.length === 0 && (
                <p className="text-center text-muted-foreground">No contacts with email addresses found.</p>
             )}
        </ScrollArea>
      </div>

      <Button type="submit" disabled={isPending || selectedEmails.size === 0}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Send Email ({selectedEmails.size})
      </Button>
    </form>
  );
}
