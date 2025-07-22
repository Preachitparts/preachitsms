
'use client';

import { useState, useEffect, useRef, useActionState } from 'react';
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
import { addGroup } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';

const initialState = {
  error: null,
  success: false,
};

const COLORS = ['#ef4444', '#f97316', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Add Group
    </Button>
  );
}

export function AddGroupButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(addGroup, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'New group has been created.',
      });
      setOpen(false);
      formRef.current?.reset();
      setSelectedColor(COLORS[0]);
    } else if (state.error) {
       const errors = Object.values(state.error).flat().join(', ');
        toast({
            variant: 'destructive',
            title: 'Failed to add group',
            description: errors || 'An unknown error occurred.',
        });
    }
  }, [state, toast]);

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        formRef.current?.reset();
        setSelectedColor(COLORS[0]);
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Group</DialogTitle>
          <DialogDescription>
            Enter the details of the new group below.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
            <div className="grid gap-4 py-4">
                <input type="hidden" name="color" value={selectedColor} />
                <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input id="name" name="name" />
                    {state.error?.name && <p className="text-destructive text-sm">{state.error.name[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" name="description" />
                </div>
                <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                        {COLORS.map(color => (
                            <button
                                type="button"
                                key={color}
                                className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                                style={{ 
                                    backgroundColor: color,
                                    borderColor: selectedColor === color ? 'hsl(var(--primary))' : 'transparent',
                                }}
                                onClick={() => setSelectedColor(color)}
                            />
                        ))}
                    </div>
                    {state.error?.color && <p className="text-destructive text-sm">{state.error.color[0]}</p>}
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
