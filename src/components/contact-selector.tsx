
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Contact, Group } from '@/lib/data';
import { Search, User, Users, X } from 'lucide-react';
import { Button } from './ui/button';

interface ContactSelectorProps {
  contacts: Contact[];
  groups: Group[];
  selectedContacts: Set<string>;
  setSelectedContacts: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedGroups: Set<string>;
  setSelectedGroups: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function ContactSelector({ contacts, groups, selectedContacts, setSelectedContacts, selectedGroups, setSelectedGroups }: ContactSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  const totalRecipients = useMemo(() => {
    let count = selectedContacts.size;
    const allGroupMembers = new Set<string>();

    selectedGroups.forEach(groupId => {
        const group = groups.find(g => g.id === groupId);
        if (group && group.members) {
            group.members.forEach(memberId => allGroupMembers.add(memberId));
        }
    });

    const uniqueGroupMembers = Array.from(allGroupMembers).filter(memberId => !selectedContacts.has(memberId));
    count += uniqueGroupMembers.length;
    
    return count;
  }, [selectedContacts, selectedGroups, groups]);

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individuals">Individuals</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="individuals" className="flex-grow mt-4 overflow-hidden">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {filteredContacts.map(contact => (
                  <div key={contact.id} className="flex items-center space-x-3">
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
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="groups" className="flex-grow mt-4 overflow-hidden">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {filteredGroups.map(group => (
                  <div key={group.id} className="flex items-center space-x-3">
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
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
          <h3 className="text-sm font-medium">{totalRecipients} Recipient(s) Selected</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedContacts).map(id => (
              <Badge key={id} variant="outline" className="flex items-center gap-1">
                {contactMap.get(id) || '...'}
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => handleContactSelect(id)}><X className="h-3 w-3"/></Button>
              </Badge>
            ))}
            {Array.from(selectedGroups).map(id => (
              <Badge key={id} variant="outline" className="flex items-center gap-1">
                {groupMap.get(id) || '...'}
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => handleGroupSelect(id)}><X className="h-3 w-3"/></Button>
              </Badge>
            ))}
          </div>
      </CardFooter>
    </Card>
  );
}
