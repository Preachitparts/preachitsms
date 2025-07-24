
'use client';

import React, { useState, useRef, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';

const MAX_CHARS = 160;

type SendSmsAction = (formData: FormData) => Promise<{success: boolean, error?: string}>;

interface MessageComposerProps {
    selectedContacts: string[];
    selectedGroups: string[];
    manualNumbers: string[];
    sendAction: SendSmsAction;
}

export function MessageComposer({ selectedContacts, selectedGroups, manualNumbers, sendAction }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [senderId, setSenderId] = useState('Preach It');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleAiRefine = () => {
    if (!message) {
      toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: 'Please type a message before using AI refinement.',
      });
      return;
    }
    setIsAiLoading(true);
    // Simulate AI call
    setTimeout(() => {
      setMessage(message + ' (refined by AI ✨)');
      setIsAiLoading(false);
    }, 1000);
  };

  const handleSend = async (formData: FormData) => {
    selectedContacts.forEach(id => formData.append('selectedContacts', id));
    selectedGroups.forEach(id => formData.append('selectedGroups', id));
    manualNumbers.forEach(num => formData.append('manualNumbers', num));

    startTransition(async () => {
      const result = await sendAction(formData);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your message has been sent.',
        });
        setMessage('');
        // Don't reset senderId to keep the default value
        if (formRef.current) {
          formRef.current.reset();
          setSenderId('Preach It');
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to send',
          description: result.error,
        });
      }
    });
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Compose Message</CardTitle>
        <CardDescription>Craft your SMS and send it to your selected contacts.</CardDescription>
      </CardHeader>
      <form ref={formRef} action={handleSend} className="flex flex-col flex-grow">
        <CardContent className="flex-grow space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senderId">Sender ID</Label>
            <Input
              id="senderId"
              name="senderId"
              placeholder="Max 11 characters"
              maxLength={11}
              required
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
            />
          </div>
          <div className="relative">
            <Label htmlFor="message" className="sr-only">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Type your message here..."
              className="min-h-[250px] resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_CHARS}
              required
            />
            <div className="absolute bottom-3 right-3 text-sm text-muted-foreground">
              {message.length}/{MAX_CHARS}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button type="button" variant="outline" onClick={handleAiRefine} disabled={isAiLoading || isSending}>
            {isAiLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Refine with AI
          </Button>
          <Button type="submit" disabled={isSending || !message || !senderId}>
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Message
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
