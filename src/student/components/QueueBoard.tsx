import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQueue } from '@/hooks/useQueue';
import WaitEstimate from './WaitEstimate';
import { BellRing } from 'lucide-react';
import type { QueueEntry } from '@/lib/api';
import { useEffect } from 'react';

const STATUS_BADGE: Record<QueueEntry['status'], string> = {
  waiting: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  called: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  seen: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  skipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

interface Props {
  myId: number;
  onLeave: () => void;
}

export default function QueueBoard({ myId, onLeave }: Props) {
  const { queue, loading, error } = useQueue();

  const myEntry = queue.find((e) => e.id === myId);

  useEffect(() => {
    if (!loading && !myEntry) {
      onLeave();
    }
  }, [loading, myEntry, onLeave]);

  // If my entry is gone (removed), also check all entries (including non-waiting)
  const isCalled = myEntry?.status === 'called';

  if (loading && queue.length === 0) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="py-12 text-center text-muted-foreground text-sm">
          Loading queue…
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="py-12 text-center text-destructive text-sm">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      {isCalled && (
        <Alert className="border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40">
          <BellRing className="size-4 text-sky-600 dark:text-sky-400" />
          <AlertTitle className="text-sky-700 dark:text-sky-300">You've been called</AlertTitle>
          <AlertDescription className="text-sky-600 dark:text-sky-400">
            Please proceed to the clinic reception now.
          </AlertDescription>
        </Alert>
      )}

      {myEntry && myEntry.status === 'waiting' && (
        <Card>
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Your position</p>
              <WaitEstimate
                position={myEntry.position}
                estimatedWaitMins={myEntry.estimated_wait_mins}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-sky-500 dark:text-sky-400">
                #{myEntry.position}
              </span>
              <button
                onClick={onLeave}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-destructive transition-colors"
              >
                Leave queue
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {queue.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No one is in the queue right now.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Wait</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={entry.id === myId ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''}
                  >
                    <TableCell className="font-mono text-sm">{entry.position}</TableCell>
                    <TableCell className="font-medium text-sm">
                      {entry.id === myId ? (
                        <span className="flex items-center gap-1.5">
                          {entry.name}
                          <span className="text-xs text-sky-500">(you)</span>
                        </span>
                      ) : (
                        entry.name
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.reason}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[entry.status]}`}
                      >
                        {entry.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {entry.estimated_wait_mins != null ? `~${entry.estimated_wait_mins}m` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
