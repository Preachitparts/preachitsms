'use client';

import React, { useState, useRef, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendSms } from '@/app/actions';

const MAX_CHARS = 160;

export function MessageComposer() {
  const [message, setMessage] = useState('');
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
    startTransition(async () => {
      const result = await sendSms(formData);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your message has been queued for sending.',
        });
        setMessage('');
        formRef.current?.reset();
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
        <CardContent className="flex-grow">
          <div className="relative">
            <Textarea
              name="message"
              placeholder="Type your message here..."
              className="min-h-[300px] pr-14 resize-none"
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
          <Button type="submit" disabled={isSending || !message}>
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
