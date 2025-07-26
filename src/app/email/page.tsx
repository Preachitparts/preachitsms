
import { getContacts } from '@/lib/data';
import { MainLayout } from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmailComposerForm } from '@/components/email-composer-form';

export const revalidate = 0;

export default async function EmailPage() {
  const initialContacts = await getContacts({ withEmail: true });

  return (
    <MainLayout>
        <div className="flex flex-col gap-4 p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Compose Email</CardTitle>
                    <CardDescription>Select recipients and send an email.</CardDescription>
                </CardHeader>
                <CardContent>
                    <EmailComposerForm contacts={initialContacts} />
                </CardContent>
            </Card>
        </div>
    </MainLayout>
  );
}
