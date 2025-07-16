
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Settings</CardTitle>
          <CardDescription>Update your Hubtel API credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientId">Hubtel Client ID</Label>
              <div className="relative">
                <Input
                  id="clientId"
                  type={showClientId ? 'text' : 'password'}
                  placeholder="Your Hubtel Client ID"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowClientId(!showClientId)}
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
                  type={showClientSecret ? 'text' : 'password'}
                  placeholder="Your Hubtel Client Secret"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                >
                  {showClientSecret ? <EyeOff /> : <Eye />}
                  <span className="sr-only">{showClientSecret ? 'Hide' : 'Show'} client secret</span>
                </Button>
              </div>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
