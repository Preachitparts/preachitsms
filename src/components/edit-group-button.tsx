
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
import { Loader2 } from 'lucide-react';
import { updateGroup } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Group } from '@/lib/data';
import { DropdownMenuItem } from './ui/dropdown-menu';
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
      Save Changes
    </Button>
  );
}

export function EditGroupButton({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(updateGroup, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedColor, setSelectedColor] = useState(group.color || COLORS[0]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'Group has been updated.',
      });
      setOpen(false);
    } else if (state.error) {
       const errors = Object.values(state.error).flat().join(', ');
        toast({
            variant: 'destructive',
            title: 'Failed to update group',
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
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update the details of the group below.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
            <input type="hidden" name="id" value={group.id} />
            <input type="hidden" name="color" value={selectedColor} />
            <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input id="name" name="name" defaultValue={group.name} />
                    {state.error?.name && <p className="text-destructive text-sm">{state.error.name[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" name="description" defaultValue={group.description} />
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
