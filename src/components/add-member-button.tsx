
'use client';

import { useState } from 'react';
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
import { useEffect } from 'react';

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

export function AddMemberButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addMember, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'New member has been added.',
      });
      setOpen(false);
    } else if (state.error) {
       const errors = Object.values(state.error).flat().join(', ');
        toast({
            variant: 'destructive',
            title: 'Failed to add member',
            description: errors || 'An unknown error occurred.',
        });
    }
  }, [state, toast]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form action={formAction}>
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
            </div>
            <DialogFooter>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
