import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQueue } from '@/hooks/useQueue';
import { updateQueueStatus, removeFromQueue } from '@/lib/api';
import type { QueueEntry } from '@/lib/api';

const STATUS_STYLE: Record<QueueEntry['status'], string> = {
  waiting: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  called: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  seen: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  skipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

export default function StaffPanel() {
  const { queue, refresh } = useQueue();

  async function handleAction(id: number, action: 'call' | 'seen' | 'skip' | 'remove') {
    try {
      if (action === 'remove') {
        await removeFromQueue(id);
      } else {
        const statusMap = { call: 'called', seen: 'seen', skip: 'skipped' } as const;
        await updateQueueStatus(id, statusMap[action]);
      }
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Live Queue</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {queue.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            The queue is empty.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">{entry.position}</TableCell>
                  <TableCell className="font-medium text-sm">{entry.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {entry.student_id}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.reason}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[entry.status]}`}
                    >
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(entry.joined_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {entry.status === 'waiting' && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleAction(entry.id, 'call')}
                        >
                          Call
                        </Button>
                      )}
                      {(entry.status === 'waiting' || entry.status === 'called') && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleAction(entry.id, 'seen')}
                        >
                          Seen
                        </Button>
                      )}
                      {entry.status === 'waiting' && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleAction(entry.id, 'skip')}
                        >
                          Skip
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => handleAction(entry.id, 'remove')}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
