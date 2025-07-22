
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Contact, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importMembers } from '@/app/actions';

// Define the structure of the contact data returned by the API
interface ContactData {
  name: string[];
  tel: string[];
}

export function ImportContactsButton() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    // The Contact Picker API is only available in secure contexts (HTTPS)
    // and when the 'navigator.contacts' object is present.
    if ('contacts' in navigator && 'select' in navigator.contacts) {
      setIsSupported(true);
    }
  }, []);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Ghanaian numbers: if it starts with '0', replace with '233'
    if (cleaned.startsWith('0')) {
        cleaned = '233' + cleaned.substring(1);
    }
    // If it starts with '+233', remove the '+'
    else if (cleaned.startsWith('233')) {
        // Already in the correct format
    } else {
        // Assume it's a local number without the leading zero, prepend 233
        // This is a guess, might need adjustment based on common formats
    }

    return cleaned;
  }

  const handleImport = async () => {
    try {
      const contacts: ContactData[] = await (navigator.contacts as any).select(
        ['name', 'tel'],
        { multiple: true }
      );

      if (contacts.length === 0) {
        return;
      }
      
      const formattedContacts = contacts
        .filter(c => c.name && c.name.length > 0 && c.tel && c.tel.length > 0)
        .map(contact => ({
            name: contact.name[0],
            phone: formatPhoneNumber(contact.tel[0]),
        }));

      if (formattedContacts.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No valid contacts found',
            description: 'The selected contacts did not have both a name and a phone number.',
        });
        return;
      }

      startTransition(async () => {
        const result = await importMembers(formattedContacts);

        if (result.success) {
          toast({
            title: 'Success!',
            description: `${result.count} contact(s) have been imported successfully.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: result.error || 'An unexpected error occurred.',
          });
        }
      });

    } catch (error) {
      // Handle errors, such as the user denying permission.
      console.error('Error picking contacts:', error);
      toast({
        variant: 'destructive',
        title: 'Could not import contacts',
        description: 'Permission may have been denied or an error occurred.',
      });
    }
  };

  if (!isSupported) {
    return null; // Don't render the button if the API is not supported
  }

  return (
    <Button variant="outline" onClick={handleImport} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Contact className="mr-2 h-4 w-4" />
      )}
      Import Contacts
    </Button>
  );
}
