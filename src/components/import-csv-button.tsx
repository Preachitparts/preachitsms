
'use client';

import { useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importMembersFromCSV } from '@/app/actions';

export function ImportCsvButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            toast({ variant: 'destructive', title: 'Invalid CSV', description: 'CSV file must have a header row and at least one data row.' });
            return;
        }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'phone', 'location'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            toast({ variant: 'destructive', title: 'Invalid Headers', description: `CSV is missing required headers: ${missingHeaders.join(', ')}` });
            return;
        }

        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim();
            return obj;
          }, {} as any);
        });
        setParsedData(data);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data to import',
        description: 'Please select a valid CSV file.',
      });
      return;
    }

    startTransition(async () => {
      const result = await importMembersFromCSV(parsedData);
      if (result.success) {
        toast({
          title: 'Import Successful!',
          description: `${result.created} members created, ${result.updated} members updated.`,
        });
        setOpen(false);
        setFileName('');
        setParsedData([]);
        if(fileInputRef.current) fileInputRef.current.value = '';
      } else {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: result.error || 'An unexpected error occurred.',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          Import from CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Members from CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file with columns: name, phone, location, and optionally group. The first row must be the header.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isPending}
            />
            {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
          </div>
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
            <Button onClick={handleImport} disabled={isPending || parsedData.length === 0}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {parsedData.length > 0 ? `(${parsedData.length})` : ''}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
