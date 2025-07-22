
'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateMember } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Contact, Group } from '@/lib/data';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { MultiSelect } from './ui/multi-select';


const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Changes
    </Button>
  );
}

export function EditMemberButton({ member, groups }: { member: Contact, groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(updateMember, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(member.groups || []);

  const groupOptions = groups.map(g => ({ label: g.name, value: g.id }));

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'Member has been updated.',
      });
      setOpen(false);
    } else if (state.error) {
       const errors = Object.values(state.error).flat().join(', ');
        toast({
            variant: 'destructive',
            title: 'Failed to update member',
            description: errors || 'An unknown error occurred.',
        });
    }
  }, [state, toast]);

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        // Reset state if needed
    }
    setOpen(isOpen);
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update the details of the member below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="grid gap-4 py-4">
            <input type="hidden" name="id" value={member.id} />
             <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={member.name} />
                {state.error?.name && <p className="text-destructive text-sm">{state.error.name[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={member.phone} />
                {state.error?.phone && <p className="text-destructive text-sm">{state.error.phone[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={member.location} />
                {state.error?.location && <p className="text-destructive text-sm">{state.error.location[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="groups">Groups</Label>
                <MultiSelect
                    options={groupOptions}
                    onValueChange={setSelectedGroups}
                    defaultValue={selectedGroups}
                    placeholder="Select groups..."
                />
                 {selectedGroups.map(group => (
                    <input type="hidden" name="groups" key={group} value={group} />
                ))}
            </div>
            <DialogFooter>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
