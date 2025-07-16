
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
import { PlusCircle, Loader2 } from 'lucide-react';
import { addMember } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Group } from '@/lib/data';
import { MultiSelect } from './ui/multi-select';
import { useRef } from 'react';

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
  const [state, formAction] = useFormState(addMember, initialState);
  const { toast } = useToast();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const groupOptions = groups.map(g => ({ label: g.name, value: g.id }));

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'New member has been added.',
      });
      setOpen(false);
      setSelectedGroups([]);
      formRef.current?.reset();
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
        <form ref={formRef} action={formAction}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                    Name
                    </Label>
                    <Input id="name" name="name" className="col-span-3" />
                </div>
                 {state.error?.name && <p className="col-start-2 col-span-3 text-destructive text-sm">{state.error.name[0]}</p>}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                    Phone
                    </Label>
                    <Input id="phone" name="phone" className="col-span-3" />
                </div>
                 {state.error?.phone && <p className="col-start-2 col-span-3 text-destructive text-sm">{state.error.phone[0]}</p>}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                    Email
                    </Label>
                    <Input id="email" name="email" type="email" className="col-span-3" />
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
                            defaultValue={[]}
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
