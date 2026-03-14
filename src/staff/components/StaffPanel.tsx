import React from 'react';
import { useState } from 'react';
import { parseDbDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { updateQueueStatus, removeFromQueue, type QueueEntry } from '@/lib/api';
import { Clock, Phone, Eye, SkipForward, Trash2, RefreshCw } from 'lucide-react';

const STATUS_BADGE: Record<
  QueueEntry['status'],
  { label: string; variant: string; className: string }
> = {
  waiting: {
    label: 'Waiting',
    variant: 'outline',
    className: 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-400',
  },
  called: {
    label: 'Called',
    variant: 'outline',
    className: 'border-sky-400 text-sky-700 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-300',
  },
  seen: {
    label: 'Seen',
    variant: 'outline',
    className:
      'border-green-400 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-300',
  },
  skipped: {
    label: 'Skipped',
    variant: 'outline',
    className:
      'border-orange-400 text-orange-700 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-300',
  },
};

type TabValue = 'all' | QueueEntry['status'];

interface Props {
  queue: QueueEntry[];
  loading: boolean;
  refresh: () => void;
}

export default function StaffPanel({ queue, loading, refresh }: Props) {
  const [tab, setTab] = useState<TabValue>('all');
  const [now, setNow] = useState(() => Date.now());

  // Update 'now' every 30 seconds for live elapsed times
  // (adjust interval as needed for UI responsiveness)
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleAction(id: number, action: 'call' | 'seen' | 'skip' | 'requeue' | 'remove') {
    try {
      if (action === 'remove') {
        await removeFromQueue(id);
      } else if (action === 'requeue') {
        await updateQueueStatus(id, 'waiting');
      } else {
        const statusMap = { call: 'called', seen: 'seen', skip: 'skipped' } as const;
        await updateQueueStatus(id, statusMap[action]);
      }
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  const counts = {
    all: queue.length,
    waiting: queue.filter((e) => e.status === 'waiting').length,
    called: queue.filter((e) => e.status === 'called').length,
    seen: queue.filter((e) => e.status === 'seen').length,
    skipped: queue.filter((e) => e.status === 'skipped').length,
  };

  const filtered = tab === 'all' ? queue : queue.filter((e) => e.status === tab);

  function formatTime(iso: string) {
    return parseDbDate(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function elapsed(iso: string, nowValue: number) {
    const mins = Math.floor((nowValue - parseDbDate(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  function waitDuration(entry: QueueEntry, nowValue: number) {
    // For waiting/called: show live elapsed time since joining
    if (entry.status === 'waiting' || entry.status === 'called') {
      return elapsed(entry.joined_at, nowValue);
    }
    // For seen: show actual time from joining to when they were seen
    if (entry.status === 'seen' && entry.seen_at) {
      const mins = Math.floor(
        (parseDbDate(entry.seen_at).getTime() - parseDbDate(entry.joined_at).getTime()) / 60000
      );
      if (mins < 60) return `${mins}m`;
      return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    }
    return '—';
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 pt-4 px-5 border-b border-border/50 bg-muted/10">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-base font-semibold">Live Queue</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            className="gap-1.5 h-7 text-xs text-muted-foreground"
          >
            <RefreshCw className="size-3" />
            Refresh
          </Button>
        </div>
        <Tabs className="flex-col gap-0" value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="h-8 bg-transparent p-0 gap-0 border-b-0 rounded-none -mb-px">
            {(['all', 'waiting', 'called', 'seen', 'skipped'] as const).map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 h-8 px-3 text-xs capitalize"
              >
                {t === 'all' ? 'All' : t}
                <span className="ml-1.5 inline-flex items-center justify-center bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                  {counts[t]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {(['all', 'waiting', 'called', 'seen', 'skipped'] as const).map((t) => (
            <TabsContent key={t} value={t} className="mt-0">
              <CardContent className="p-0">
                {loading && queue.length === 0 ? (
                  <p className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</p>
                ) : filtered.length === 0 ? (
                  <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No {t === 'all' ? '' : t} entries today.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="w-8 pl-5">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Wait</TableHead>
                        <TableHead className="text-right pr-5">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className={
                            entry.status === 'called'
                              ? 'bg-sky-50/40 dark:bg-sky-950/10'
                              : entry.status === 'seen'
                                ? 'opacity-60'
                                : entry.status === 'skipped'
                                  ? 'opacity-70'
                                  : ''
                          }
                        >
                          <TableCell className="font-mono text-xs pl-5 text-muted-foreground">
                            {entry.status === 'waiting' ? entry.position : '—'}
                          </TableCell>
                          <TableCell className="font-medium text-sm">{entry.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {entry.student_id}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {entry.reason}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0 ${STATUS_BADGE[entry.status].className}`}
                            >
                              {STATUS_BADGE[entry.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatTime(entry.joined_at)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {waitDuration(entry, now)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-5">
                            <div className="flex items-center justify-end gap-1">
                              {entry.status === 'waiting' && (
                                <>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-6 px-2 text-xs gap-1"
                                    onClick={() => handleAction(entry.id, 'call')}
                                  >
                                    <Phone className="size-3" />
                                    Call
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-6 px-2 text-xs gap-1"
                                    onClick={() => handleAction(entry.id, 'seen')}
                                  >
                                    <Eye className="size-3" />
                                    Seen
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-6 px-2 text-xs gap-1 text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-900"
                                    onClick={() => handleAction(entry.id, 'skip')}
                                  >
                                    <SkipForward className="size-3" />
                                    Skip
                                  </Button>
                                </>
                              )}
                              {entry.status === 'called' && (
                                <>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-6 px-2 text-xs gap-1 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900"
                                    onClick={() => handleAction(entry.id, 'seen')}
                                  >
                                    <Eye className="size-3" />
                                    Seen
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-6 px-2 text-xs gap-1 text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-900"
                                    onClick={() => handleAction(entry.id, 'skip')}
                                  >
                                    <SkipForward className="size-3" />
                                    Skip
                                  </Button>
                                </>
                              )}
                              {entry.status === 'skipped' && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="h-6 px-2 text-xs gap-1"
                                  onClick={() => handleAction(entry.id, 'requeue')}
                                >
                                  <RefreshCw className="size-3" />
                                  Re-queue
                                </Button>
                              )}
                              <Button
                                size="xs"
                                variant="ghost"
                                className="h-6 w-6 px-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleAction(entry.id, 'remove')}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>
    </Card>
  );
}
