
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Contact, Group } from '@/lib/data';
import { Search, User, Users, X, Keyboard } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface ContactSelectorProps {
  contacts: Contact[];
  groups: Group[];
  selectedContacts: Set<string>;
  setSelectedContacts: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedGroups: Set<string>;
  setSelectedGroups: React.Dispatch<React.SetStateAction<Set<string>>>;
  manualNumbers: Set<string>;
  setManualNumbers: React.Dispatch<React.SetStateAction<Set<string>>>;
  allowManualEntry?: boolean;
}

export function ContactSelector({ 
  contacts, 
  groups, 
  selectedContacts, 
  setSelectedContacts, 
  selectedGroups, 
  setSelectedGroups,
  manualNumbers,
  setManualNumbers,
  allowManualEntry = false,
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

  const handleManualNumberAdd = () => {
    const phoneRegex = /^233\d{9}$/;
    const numbers = manualNumberInput.split(/[,;\s\n]+/).map(n => n.trim()).filter(Boolean);
    let addedCount = 0;
    
    numbers.forEach(number => {
        if (phoneRegex.test(number)) {
            setManualNumbers(prev => new Set(prev).add(number));
            addedCount++;
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid Number',
                description: `The number "${number}" is not a valid Ghanaian phone number (e.g., 233241234567).`,
            });
        }
    });

    if (addedCount > 0) {
        setManualNumberInput('');
    }
  }
  
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

  const totalRecipients = useMemo(() => {
    const allGroupMembers = new Set<string>();

    selectedGroups.forEach(groupId => {
        const group = groups.find(g => g.id === groupId);
        if (group && group.members) {
            group.members.forEach(memberId => allGroupMembers.add(memberId));
        }
    });
    
    const uniqueNumbers = new Set(manualNumbers);
    contacts.forEach(c => {
        if(selectedContacts.has(c.id) || allGroupMembers.has(c.id)) {
            uniqueNumbers.add(c.phone)
        }
    })

    return uniqueNumbers.size;
  }, [selectedContacts, selectedGroups, manualNumbers, contacts, groups]);

  const contactMap = useMemo(() => new Map(contacts.map(c => [c.id, c.name])), [contacts]);
  const groupMap = useMemo(() => new Map(groups.map(g => [g.id, g.name])), [groups]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Recipients</CardTitle>
        <CardDescription>Select individuals or groups to message.</CardDescription>
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
        <Tabs defaultValue="individuals" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individuals">Individuals</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            {allowManualEntry && <TabsTrigger value="manual">Manual Entry</TabsTrigger>}
          </TabsList>
          <TabsContent value="individuals" className="flex-grow mt-4 overflow-hidden">
             <div className="space-y-4">
                <div className="flex items-center space-x-3 border-b pb-3 mb-3">
                    <Checkbox
                        id="select-all-contacts"
                        checked={filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length}
                        indeterminate={selectedContacts.size > 0 && selectedContacts.size < filteredContacts.length}
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
                        indeterminate={selectedGroups.size > 0 && selectedGroups.size < filteredGroups.length}
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
           {allowManualEntry && (
             <TabsContent value="manual" className="flex-grow mt-4 overflow-hidden">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Enter phone numbers manually. You can separate multiple numbers with a comma, space, or new line.
                    </p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g. 233241234567, 23355..."
                            value={manualNumberInput}
                            onChange={(e) => setManualNumberInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualNumberAdd()}
                        />
                        <Button onClick={handleManualNumberAdd}>Add</Button>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Keyboard className="h-3 w-3" /> Press Enter to add numbers.
                    </p>
                </div>
            </TabsContent>
           )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
          <h3 className="text-sm font-medium">{totalRecipients} Unique Recipient(s) Selected</h3>
          <div className="flex flex-wrap gap-2">
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
             {Array.from(manualNumbers).map(num => (
              <Badge key={`manual-badge-${num}`} variant="secondary" className="flex items-center gap-1">
                {num}
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setManualNumbers(p => { const n = new Set(p); n.delete(num); return n; })}><X className="h-3 w-3"/></Button>
              </Badge>
            ))}
          </div>
      </CardFooter>
    </Card>
  );
}
