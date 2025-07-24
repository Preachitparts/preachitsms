
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Contact, Group } from '@/lib/data';
import { Search, User, Users, X, Keyboard, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface ContactSelectorProps {
  contacts: Contact[];
  groups: Group[];
  isBulk: boolean;
  // For bulk
  selectedContacts: Set<string>;
  setSelectedContacts: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedGroups: Set<string>;
  setSelectedGroups: React.Dispatch<React.SetStateAction<Set<string>>>;
  // For single
  manualNumber: string;
  setManualNumber: React.Dispatch<React.SetStateAction<string>>;
  selectedContact: Contact | null;
  setSelectedContact: React.Dispatch<React.SetStateAction<Contact | null>>;
}

export function ContactSelector({ 
  contacts, 
  groups,
  isBulk,
  selectedContacts, 
  setSelectedContacts, 
  selectedGroups, 
  setSelectedGroups,
  manualNumber,
  setManualNumber,
  selectedContact,
  setSelectedContact,
}: ContactSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualNumberInput, setManualNumberInput] = useState('');
  
  const filteredContacts = useMemo(() =>
    contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [contacts, searchTerm]
  );

  const filteredGroups = useMemo(() =>
    groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [groups, searchTerm]
  );

  // --- Bulk Selection Handlers ---
  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleSelectAllContacts = (checked: boolean) => {
      if(checked) {
        setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
      } else {
        setSelectedContacts(new Set());
      }
  };

  const handleSelectAllGroups = (checked: boolean) => {
      if(checked) {
        setSelectedGroups(new Set(filteredGroups.map(g => g.id)));
      } else {
        setSelectedGroups(new Set());
      }
  };
  
  // --- Single Selection Handlers ---
  const handleSingleContactSelect = (contact: Contact) => {
      if (selectedContact?.id === contact.id) {
          setSelectedContact(null); // Deselect
      } else {
          setSelectedContact(contact);
          setManualNumber(''); // Clear manual number if a contact is selected
          setManualNumberInput('');
      }
  };

  const handleManualNumberAdd = () => {
    const phoneRegex = /^233\d{9}$/;
    if (phoneRegex.test(manualNumberInput)) {
        setManualNumber(manualNumberInput);
        setSelectedContact(null); // Clear selected contact if a manual number is added
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid Number',
            description: `The number "${manualNumberInput}" is not a valid Ghanaian phone number (e.g., 233241234567).`,
        });
    }
  }

  const totalRecipients = useMemo(() => {
      if (isBulk) {
        const allGroupMembers = new Set<string>();
        selectedGroups.forEach(groupId => {
            const group = groups.find(g => g.id === groupId);
            if (group && group.members) {
                group.members.forEach(memberId => allGroupMembers.add(memberId));
            }
        });
        
        const uniqueNumbers = new Set<string>();
        contacts.forEach(c => {
            if(selectedContacts.has(c.id) || allGroupMembers.has(c.id)) {
                if(c.phone) uniqueNumbers.add(c.phone)
            }
        })
        return uniqueNumbers.size;
    } else {
        return (selectedContact || manualNumber) ? 1 : 0;
    }
  }, [isBulk, selectedContacts, selectedGroups, manualNumber, selectedContact, contacts, groups]);

  const contactMap = useMemo(() => new Map(contacts.map(c => [c.id, c.name])), [contacts]);
  const groupMap = useMemo(() => new Map(groups.map(g => [g.id, g.name])), [groups]);

  const renderBulkSelector = () => (
    <Tabs defaultValue="individuals" className="flex-grow flex flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="individuals">Individuals</TabsTrigger>
        <TabsTrigger value="groups">Groups</TabsTrigger>
      </TabsList>
      <TabsContent value="individuals" className="flex-grow mt-4 overflow-hidden">
         <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b pb-3 mb-3">
                <Checkbox
                    id="select-all-contacts"
                    checked={filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length}
                    onCheckedChange={(checked) => handleSelectAllContacts(Boolean(checked))}
                />
                 <label htmlFor="select-all-contacts" className="text-sm font-medium leading-none">
                    Select All Individuals
                </label>
            </div>
            <ScrollArea className="h-[260px] pr-4">
              {filteredContacts.map(contact => (
                <div key={contact.id} className="flex items-center space-x-3 mb-3">
                  <Checkbox
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.has(contact.id)}
                    onCheckedChange={() => handleContactSelect(contact.id)}
                  />
                  <label htmlFor={`contact-${contact.id}`} className="flex items-center gap-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {contact.name}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
      </TabsContent>
      <TabsContent value="groups" className="flex-grow mt-4 overflow-hidden">
         <div className="space-y-4">
             <div className="flex items-center space-x-3 border-b pb-3 mb-3">
                <Checkbox
                    id="select-all-groups"
                    checked={filteredGroups.length > 0 && selectedGroups.size === filteredGroups.length}
                    onCheckedChange={(checked) => handleSelectAllGroups(Boolean(checked))}
                />
                 <label htmlFor="select-all-groups" className="text-sm font-medium leading-none">
                    Select All Groups
                </label>
            </div>
            <ScrollArea className="h-[260px] pr-4">
              {filteredGroups.map(group => (
                <div key={group.id} className="flex items-center space-x-3 mb-3">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroups.has(group.id)}
                    onCheckedChange={() => handleGroupSelect(group.id)}
                  />
                  <label htmlFor={`group-${group.id}`} className="flex items-center justify-between flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                   <span className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {group.name}
                   </span>
                    <Badge variant="secondary">{group.memberCount} members</Badge>
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
      </TabsContent>
    </Tabs>
  );

  const renderSingleSelector = () => (
     <Tabs defaultValue="individuals" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individuals">Individuals</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          <TabsContent value="individuals" className="flex-grow mt-4 overflow-hidden">
            <ScrollArea className="h-[300px] pr-4">
              {filteredContacts.map(contact => (
                <div 
                    key={contact.id} 
                    onClick={() => handleSingleContactSelect(contact)}
                    className={cn(
                        "flex items-center space-x-3 mb-2 p-2 rounded-md cursor-pointer hover:bg-accent",
                        selectedContact?.id === contact.id && "bg-accent"
                    )}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <label className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    {contact.name}
                  </label>
                  {selectedContact?.id === contact.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="manual" className="flex-grow mt-4 overflow-hidden">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Enter a single valid Ghanaian phone number.
                </p>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g. 233241234567"
                        value={manualNumberInput}
                        onChange={(e) => setManualNumberInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualNumberAdd()}
                    />
                    <Button onClick={handleManualNumberAdd}>Set</Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Keyboard className="h-3 w-3" /> Press Enter to set the number.
                </p>
            </div>
        </TabsContent>
    </Tabs>
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Recipients</CardTitle>
        <CardDescription>
            {isBulk ? 'Select groups or individuals to message.' : 'Select one contact or enter a number manually.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isBulk ? renderBulkSelector() : renderSingleSelector()}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
          <h3 className="text-sm font-medium">{totalRecipients} Recipient(s) Selected</h3>
          <div className="flex flex-wrap gap-2">
            {isBulk ? (
                <>
                {Array.from(selectedContacts).map(id => (
                  <Badge key={`contact-badge-${id}`} variant="outline" className="flex items-center gap-1">
                    {contactMap.get(id) || '...'}
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => handleContactSelect(id)}><X className="h-3 w-3"/></Button>
                  </Badge>
                ))}
                {Array.from(selectedGroups).map(id => (
                  <Badge key={`group-badge-${id}`} variant="outline" className="flex items-center gap-1">
                    {groupMap.get(id) || '...'}
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => handleGroupSelect(id)}><X className="h-3 w-3"/></Button>
                  </Badge>
                ))}
                </>
            ) : (
                <>
                {selectedContact && (
                    <Badge variant="outline" className="flex items-center gap-1">
                        {selectedContact.name}
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setSelectedContact(null)}><X className="h-3 w-3"/></Button>
                    </Badge>
                )}
                {manualNumber && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        {manualNumber}
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setManualNumber('')}><X className="h-3 w-3"/></Button>
                    </Badge>
                )}
                </>
            )}
          </div>
      </CardFooter>
    </Card>
  );
}
