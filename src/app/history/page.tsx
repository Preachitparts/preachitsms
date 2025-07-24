
import { MainLayout } from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HistoryClient } from '@/components/history-client';
import { getSmsHistory, getGroups } from '@/lib/data';

export const revalidate = 0; // Ensure dynamic rendering

export default async function HistoryPage() {
    const [initialHistory, initialGroups] = await Promise.all([
        getSmsHistory(),
        getGroups()
    ]);

    return (
        <MainLayout>
            <div className="flex flex-col gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">SMS History</CardTitle>
                        <CardDescription>A log of all messages sent from the platform.</CardDescription>
                    </CardHeader>
                </Card>
                 <HistoryClient initialHistory={initialHistory} initialGroups={initialGroups} />
            </div>
        </MainLayout>
    );
}
