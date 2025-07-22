
'use client';

import { useState, useTransition, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { saveApiKeys, inviteAdmin } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ThemeCustomizer } from '@/components/theme-customizer';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Admin, getCurrentUser } from '@/app/auth/actions';

interface AdminDoc extends Admin {
    status?: string;
}

async function getApiKeys() {
    const docRef = doc(db, 'settings', 'apiCredentials');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

export default function SettingsPage() {
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isApiPending, startApiTransition] = useTransition();
  const [isInvitePending, startInviteTransition] = useTransition();
  const { toast } = useToast();
  const [initialKeys, setInitialKeys] = useState({ clientId: '', clientSecret: '' });
  const [admins, setAdmins] = useState<AdminDoc[]>([]);
  const [currentUser, setCurrentUser] = useState<Admin | null>(null);
  
  useEffect(() => {
    async function fetchInitialData() {
        const keys = await getApiKeys();
        if (keys) {
            setInitialKeys({ clientId: keys.clientId, clientSecret: keys.clientSecret });
        }
        const user = await getCurrentUser();
        setCurrentUser(user);
    }
    fetchInitialData();

    const unsub = onSnapshot(collection(db, 'admins'), (snapshot) => {
        const adminsData = snapshot.docs.map(doc => ({ 
            uid: doc.id, 
            ...doc.data() 
        } as AdminDoc));
        setAdmins(adminsData);
    });

    return () => unsub();
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
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to save keys',
          description: result.error || 'An unknown error occurred.',
        });
      }
    });
  };

  const handleInviteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    startInviteTransition(async () => {
      const { error } = await inviteAdmin(formData);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Invite Failed',
          description: error,
        });
      } else {
        toast({
          title: 'Success!',
          description: 'Admin invitation sent. They can now sign up.',
        });
        form.reset();
      }
    });
  };

  if (!currentUser) {
     return (
        <MainLayout>
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </MainLayout>
     )
  }

  if (!currentUser?.canSeeSettings) {
    return (
        <MainLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this page.</p>
                </CardContent>
            </Card>
        </MainLayout>
    )
  }

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
                    <CardTitle className="font-headline">Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeCustomizer />
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Admin Management</CardTitle>
                    <CardDescription>Invite and manage administrator accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleInviteSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="inviteEmail">Admin Email</Label>
                            <Input id="inviteEmail" name="inviteEmail" type="email" placeholder="admin@example.com" required disabled={isInvitePending} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required disabled={isInvitePending} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="canSeeSettings" name="canSeeSettings" defaultChecked />
                            <Label htmlFor="canSeeSettings">Can access settings page?</Label>
                        </div>
                        <Button type="submit" disabled={isInvitePending}>
                            {isInvitePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invite
                        </Button>
                    </form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Current Admins</CardTitle>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Access</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admins.map(admin => (
                                <TableRow key={admin.uid}>
                                    <TableCell>{admin.fullName}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={admin.status === 'registered' ? 'default' : 'secondary'}>
                                            {admin.status || 'Invited'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={admin.canSeeSettings ? 'default' : 'secondary'}>
                                            {admin.canSeeSettings ? 'Full Access' : 'Limited'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
