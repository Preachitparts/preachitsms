import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HistoryClient } from '@/components/history-client';
import { getSmsHistory } from '@/lib/data';

export const revalidate = 0; // Ensure dynamic rendering

export default async function HistoryPage() {
    const initialHistory = await getSmsHistory();

    return (
        <MainLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">SMS History</CardTitle>
                    <CardDescription>A log of all messages sent from the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoryClient initialHistory={initialHistory} />
                </CardContent>
            </Card>
        </MainLayout>
    );
}
