
'use client';

import { useState, useTransition, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Copy } from 'lucide-react';
import { saveApiKeys } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ThemeCustomizer } from '@/components/theme-customizer';
import { doc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminDoc } from '@/lib/data';

async function getApiKeys() {
    const docRef = doc(db, 'settings', 'apiCredentials');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

function CredentialDisplay({ label, value, isSecret = false }: { label: string, value: string, isSecret?: boolean }) {
  const [show, setShow] = useState(!isSecret);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: 'Copied!', description: `${label} has been copied to your clipboard.` });
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input readOnly value={show ? value : '●'.repeat(16)} />
        <div className="absolute inset-y-0 right-0 flex items-center px-2">
            {isSecret && (
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
            )}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
            >
                <Copy className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}


export default function SettingsPage() {
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isApiPending, startApiTransition] = useTransition();
  const { toast } = useToast();
  const [initialKeys, setInitialKeys] = useState({ clientId: '', clientSecret: '' });
  
  useEffect(() => {
    async function fetchInitialData() {
        const keys = await getApiKeys();
        if (keys) {
            setInitialKeys({ clientId: keys.clientId, clientSecret: keys.clientSecret });
        }
    }
    fetchInitialData();
  }, []);

  const handleApiSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startApiTransition(async () => {
      const result = await saveApiKeys(formData);
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Your API keys have been saved.',
        });
         const keys = await getApiKeys();
        if (keys) {
            setInitialKeys({ clientId: keys.clientId, clientSecret: keys.clientSecret });
        }
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
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">API Credentials</CardTitle>
                <CardDescription>Update your Hubtel API credentials.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleApiSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Hubtel Client ID</Label>
                    <div className="relative">
                      <Input
                        id="clientId"
                        name="clientId"
                        type={showClientId ? 'text' : 'password'}
                        placeholder="Your Hubtel Client ID"
                        defaultValue={initialKeys.clientId}
                        disabled={isApiPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowClientId(!showClientId)}
                        disabled={isApiPending}
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
                        defaultValue={initialKeys.clientSecret}
                        disabled={isApiPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowClientSecret(!showClientSecret)}
                        disabled={isApiPending}
                      >
                        {showClientSecret ? <EyeOff /> : <Eye />}
                        <span className="sr-only">{showClientSecret ? 'Hide' : 'Show'} client secret</span>
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" disabled={isApiPending}>
                    {isApiPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Hubtel Configuration</CardTitle>
                    <CardDescription>Your current Hubtel API details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CredentialDisplay label="Client ID" value={initialKeys.clientId} />
                    <CredentialDisplay label="Client Secret" value={initialKeys.clientSecret} isSecret />
                    <CredentialDisplay label="API URL" value="https://sms.hubtel.com/v1/messages/send" />
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeCustomizer />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Admin Management</CardTitle>
                    <CardDescription>Invite and manage administrator accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="text-sm text-muted-foreground">
                        Admin management is disabled because authentication has been removed.
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
