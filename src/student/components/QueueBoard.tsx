import { useEffect, useState, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueue } from '@/hooks/useQueue';
import { getQueueEntry } from '@/lib/api';
import WaitEstimate from './WaitEstimate';
import { BellRing, Users, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { QueueEntry } from '@/lib/api';

const STATUS_COLORS: Record<QueueEntry['status'], string> = {
  waiting: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
  called: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
  seen: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  skipped: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
};

interface Props {
  myId: number;
  onLeave: () => void;
}

export default function QueueBoard({ myId, onLeave }: Props) {
  const { queue, loading } = useQueue();
  // Track own entry separately so we catch called/seen/skipped states
  const [myEntry, setMyEntry] = useState<QueueEntry | null>(null);
  const [myEntryLoading, setMyEntryLoading] = useState(true);

  const refreshMyEntry = useCallback(() => {
    getQueueEntry(myId)
      .then((entry) => {
        setMyEntry(entry);
        setMyEntryLoading(false);
        // Only auto-leave if the entry no longer exists (was deleted)
        if (entry === null) onLeave();
      })
      .catch(() => setMyEntryLoading(false));
  }, [myId, onLeave]);

  useEffect(() => {
    refreshMyEntry();
    const interval = setInterval(refreshMyEntry, 2000);
    return () => clearInterval(interval);
  }, [refreshMyEntry]);

  const isCalled = myEntry?.status === 'called';
  const isSeen = myEntry?.status === 'seen';
  const isSkipped = myEntry?.status === 'skipped';
  const isWaiting = myEntry?.status === 'waiting';

  if (myEntryLoading && !myEntry) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="py-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          <RefreshCw className="size-4 animate-spin" />
          Loading your queue status…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">

      {/* Called — prominent animated banner */}
      {isCalled && (
        <div className="relative overflow-hidden border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 p-5">
          <div className="absolute inset-0 animate-pulse bg-sky-100/40 dark:bg-sky-900/20 pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="bg-sky-500 p-2 shrink-0 mt-0.5">
              <BellRing className="size-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sky-800 dark:text-sky-200 text-base">
                You've been called!
              </p>
              <p className="text-sm text-sky-700 dark:text-sky-400 mt-0.5">
                Please proceed to the clinic reception now.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seen */}
      {isSeen && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
          <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">Visit complete</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            You've been marked as seen. Thank you for visiting the clinic.
          </AlertDescription>
        </Alert>
      )}

      {/* Skipped */}
      {isSkipped && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
          <AlertTitle className="text-orange-800 dark:text-orange-200">You were skipped</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-400">
            Please check with the clinic reception or rejoin the queue.
          </AlertDescription>
        </Alert>
      )}

      {/* My position card */}
      {(isWaiting || isCalled) && myEntry && (
        <Card
          className={`shadow-sm ${
            isCalled
              ? 'border-sky-300 dark:border-sky-700'
              : 'border-sky-200/70 dark:border-sky-900/60'
          }`}
        >
          <CardContent className="py-5 px-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[myEntry.status]}`}
                  >
                    {myEntry.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{myEntry.name}</p>
                <WaitEstimate
                  position={myEntry.position}
                  estimatedWaitMins={myEntry.estimated_wait_mins}
                />
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {isWaiting && (
                  <span className="text-5xl font-black text-sky-500 tabular-nums leading-none">
                    #{myEntry.position}
                  </span>
                )}
                <button
                  onClick={onLeave}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="size-3" />
                  Leave queue
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seen/Skipped — leave button */}
      {(isSeen || isSkipped) && (
        <Button variant="outline" size="sm" onClick={onLeave} className="self-start">
          <LogOut className="size-3.5 mr-2" />
          Done
        </Button>
      )}

      {/* Live queue list */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-5 border-b border-border/50 bg-muted/10 flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="size-4 text-sky-500" />
            Current Queue
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 bg-green-500 animate-pulse inline-block" />
            Live
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && queue.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : queue.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              The queue is empty right now.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {queue.map((entry) => {
                const isMe = entry.id === myId;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                      isMe ? 'bg-sky-50/60 dark:bg-sky-950/20' : ''
                    }`}
                  >
                    <span className="font-mono text-sm font-semibold text-muted-foreground w-7 shrink-0 tabular-nums">
                      #{entry.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {isMe ? (
                          <span className="flex items-center gap-1.5">
                            {entry.name}
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-4 border-sky-300 text-sky-600 dark:border-sky-700 dark:text-sky-400"
                            >
                              you
                            </Badge>
                          </span>
                        ) : (
                          entry.name
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{entry.reason}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {entry.estimated_wait_mins != null && (
                        <p className="text-xs text-muted-foreground">
                          ~{entry.estimated_wait_mins}m
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
