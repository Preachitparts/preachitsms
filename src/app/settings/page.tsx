
'use client';

import { useState, useTransition } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { saveApiKeys } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveApiKeys(formData);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your API keys have been saved.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to save keys',
          description: result.error || 'An unknown error occurred.',
        });
      }
    });
  };

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Settings</CardTitle>
          <CardDescription>Update your Hubtel API credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="clientId">Hubtel Client ID</Label>
              <div className="relative">
                <Input
                  id="clientId"
                  name="clientId"
                  type={showClientId ? 'text' : 'password'}
                  placeholder="Your Hubtel Client ID"
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowClientId(!showClientId)}
                  disabled={isPending}
                >
                  {showClientId ? <EyeOff /> : <Eye />}
                  <span className="sr-only">{showClientId ? 'Hide' : 'Show'} client ID</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Hubtel Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  name="clientSecret"
                  type={showClientSecret ? 'text' : 'password'}
                  placeholder="Your Hubtel Client Secret"
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                  disabled={isPending}
                >
                  {showClientSecret ? <EyeOff /> : <Eye />}
                  <span className="sr-only">{showClientSecret ? 'Hide' : 'Show'} client secret</span>
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
