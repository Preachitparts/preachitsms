import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
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
              <Input id="clientId" type="text" placeholder="Your Hubtel Client ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Hubtel Client Secret</Label>
              <Input id="clientSecret" type="password" placeholder="Your Hubtel Client Secret" />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
