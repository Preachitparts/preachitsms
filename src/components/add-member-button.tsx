
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
import { PlusCircle, Loader2 } from 'lucide-react';
import { addMember } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { type Group } from '@/lib/data';
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
      Add Member
    </Button>
  );
}

export function AddMemberButton({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addMember, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const groupOptions = groups.map(g => ({ label: g.name, value: g.id }));

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'New member has been added.',
      });
      setOpen(false);
      formRef.current?.reset();
      setSelectedGroups([]);
    } else if (state.error) {
       const errors = Object.values(state.error).flat().join(', ');
        toast({
            variant: 'destructive',
            title: 'Failed to add member',
            description: errors || 'An unknown error occurred.',
        });
    }
  }, [state, toast]);

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        formRef.current?.reset();
        setSelectedGroups([]);
    }
    setOpen(isOpen);
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Enter the details of the new member below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" />
                {state.error?.name && <p className="text-destructive text-sm">{state.error.name[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue="233" />
                {state.error?.phone && <p className="text-destructive text-sm">{state.error.phone[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" />
                {state.error?.location && <p className="text-destructive text-sm">{state.error.location[0]}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="groups">Groups</Label>
                 <MultiSelect
                    options={groupOptions}
                    onValueChange={setSelectedGroups}
                    defaultValue={[]}
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
