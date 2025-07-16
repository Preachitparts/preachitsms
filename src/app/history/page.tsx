import { MainLayout } from '@/components/main-layout';
import { getSmsHistory } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default async function HistoryPage() {
  const history = await getSmsHistory();

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">SMS History</CardTitle>
          <CardDescription>A log of all messages sent from the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.recipient}</TableCell>
                  <TableCell className="max-w-xs truncate">{record.message}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        record.status === 'Sent' ? 'default' : record.status === 'Failed' ? 'destructive' : 'secondary'
                      }
                      className={cn(record.status === 'Sent' && 'bg-green-600 hover:bg-green-700')}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{record.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
