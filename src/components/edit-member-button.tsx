
'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
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
  const [state, formAction] = useFormState(updateMember, initialState);
  const { toast } = useToast();
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


  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form action={formAction}>
            <input type="hidden" name="id" value={member.id} />
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                    Name
                    </Label>
                    <Input id="name" name="name" defaultValue={member.name} className="col-span-3" />
                </div>
                 {state.error?.name && <p className="col-start-2 col-span-3 text-destructive text-sm">{state.error.name[0]}</p>}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                    Phone
                    </Label>
                    <Input id="phone" name="phone" defaultValue={member.phone} className="col-span-3" />
                </div>
                 {state.error?.phone && <p className="col-start-2 col-span-3 text-destructive text-sm">{state.error.phone[0]}</p>}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                    Email
                    </Label>
                    <Input id="email" name="email" type="email" defaultValue={member.email} className="col-span-3" />
                </div>
                 {state.error?.email && <p className="col-start-2 col-span-3 text-destructive text-sm">{state.error.email[0]}</p>}
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="groups" className="text-right">
                        Groups
                    </Label>
                    <div className="col-span-3">
                         <MultiSelect
                            options={groupOptions}
                            onValueChange={setSelectedGroups}
                            defaultValue={selectedGroups}
                            placeholder="Select groups..."
                        />
                        {selectedGroups.map(groupId => (
                            <input type="hidden" name="groups" key={groupId} value={groupId} />
                        ))}
                    </div>
                 </div>
                 {state.error?.groups && <p className="col-start-2 col-span-3 text-destructive text-sm">{state.error.groups[0]}</p>}
            </div>
            <DialogFooter>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
