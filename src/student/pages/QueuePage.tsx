import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { StudentSidebar } from '../components/StudentSidebar';
import QueueForm from '../components/QueueForm';
import QueueBoard from '../components/QueueBoard';
import { leaveQueue, getMyQueueEntries, type QueueEntry } from '@/lib/api';
import { useQueue } from '@/hooks/useQueue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  Loader2,
  Users,
  Clock,
  BellRing,
  CheckCircle2,
  SkipForward,
  Timer,
  CalendarClock,
  Info,
} from 'lucide-react';

const STATUS_CONFIG: Record<QueueEntry['status'], { label: string; className: string }> = {
  waiting: {
    label: 'Waiting',
    className: 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-400',
  },
  called: {
    label: 'Called',
    className: 'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-600 dark:bg-sky-950/30 dark:text-sky-300',
  },
  seen: {
    label: 'Seen',
    className: 'border-green-400 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300',
  },
  skipped: {
    label: 'Skipped',
    className: 'border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/30 dark:text-orange-300',
  },
};

const STATUS_ICON: Record<QueueEntry['status'], React.ElementType> = {
  waiting: Users,
  called: BellRing,
  seen: CheckCircle2,
  skipped: SkipForward,
};

function formatTime(iso: string) {
  return new Date(iso.replace(' ', 'T') + 'Z').toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function QueueLookup() {
  const [sid, setSid] = useState('');
  const [results, setResults] = useState<QueueEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!sid.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const data = await getMyQueueEntries(sid.trim());
      setResults(data);
    } catch {
      setError('Failed to look up queue status. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Search className="size-4 text-sky-500" />
          Check Queue Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="lookup-sid">Student ID</Label>
            <div className="flex gap-2">
              <Input
                id="lookup-sid"
                placeholder="e.g. S12345678"
                value={sid}
                onChange={(e) => setSid(e.target.value)}
                autoComplete="off"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={loading || !sid.trim()}
                className="shrink-0 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Shows today's queue entries for your student ID.
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2">{error}</p>
          )}
        </form>

        {results !== null && (
          <div className="flex flex-col gap-2">
            {results.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No entries found today for <strong>{sid}</strong>.
              </p>
            ) : (
              results.map((entry) => {
                const Icon = STATUS_ICON[entry.status];
                return (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-3 border border-border/60 px-3 py-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="bg-muted/60 p-1.5 shrink-0 mt-0.5">
                        <Icon className="size-3.5 text-sky-500" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold leading-none">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.reason}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Clock className="size-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(entry.joined_at)}
                          </span>
                          {entry.status === 'waiting' && entry.position != null && (
                            <>
                              <span className="text-muted-foreground text-xs">·</span>
                              <span className="text-xs font-medium">#{entry.position}</span>
                            </>
                          )}
                          {entry.status === 'waiting' && entry.estimated_wait_mins != null && (
                            <>
                              <span className="text-muted-foreground text-xs">·</span>
                              <span className="text-xs text-muted-foreground">
                                ~{entry.estimated_wait_mins}m
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${STATUS_CONFIG[entry.status].className}`}
                    >
                      {STATUS_CONFIG[entry.status].label}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClinicInfoCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Info className="size-4 text-sky-500" />
          What to Expect
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ol className="flex flex-col gap-3">
          {[
            { step: '1', title: 'You\'re in the queue', desc: 'Your position updates in real time as patients ahead of you are seen.' },
            { step: '2', title: 'Watch for your call', desc: 'A banner will appear on this page when it\'s your turn. Keep this page open.' },
            { step: '3', title: 'Head to reception', desc: 'When called, proceed to the clinic reception immediately.' },
            { step: '4', title: 'All done', desc: 'Once seen, your entry is marked complete. Click Done to dismiss.' },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center bg-sky-500 text-white text-xs font-bold mt-0.5">
                {step}
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Clinic Hours</p>
          <p className="text-sm font-semibold">Mon – Fri &nbsp;·&nbsp; 09:00 – 16:00</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QueueStats() {
  const { queue } = useQueue();
  const waitingCount = queue.length;
  const nextWait = queue[0]?.estimated_wait_mins ?? null;
  const lastWait = queue.length > 0 ? queue[queue.length - 1]?.estimated_wait_mins ?? null : null;

  const stats = [
    {
      label: 'Now Waiting',
      value: waitingCount,
      icon: Users,
      suffix: waitingCount === 1 ? 'person' : 'people',
    },
    {
      label: 'Est. Wait (next)',
      value: nextWait != null ? `~${nextWait}` : '—',
      icon: Timer,
      suffix: nextWait != null ? 'min' : '',
    },
    {
      label: 'Est. Wait (end)',
      value: lastWait != null ? `~${lastWait}` : '—',
      icon: Clock,
      suffix: lastWait != null ? 'min' : '',
    },
    {
      label: 'Walk-in Hours',
      value: '09:00',
      icon: CalendarClock,
      suffix: '– 16:00',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, suffix }) => (
        <Card key={label} className="shadow-sm">
          <CardContent className="px-4 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="size-3.5" />
              {label}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums leading-none">{value}</span>
              {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function QueuePage() {
  const [myQueueId, setMyQueueId] = useState<number | null>(() => {
    const stored = localStorage.getItem('medq-queue-id');
    return stored ? Number(stored) : null;
  });

  function handleJoined(id: number) {
    setMyQueueId(id);
  }

  function handleLeave(shouldDelete: boolean = true) {
    if (shouldDelete && myQueueId !== null) {
      leaveQueue(myQueueId).catch(() => {});
    }
    localStorage.removeItem('medq-queue-id');
    setMyQueueId(null);
  }

  const inQueue = myQueueId !== null;

  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground font-medium">Walk-in Queue</span>
          </nav>
        </header>

        <div className="flex flex-col gap-6 p-6">
          {/* Page heading */}
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {inQueue ? 'Your Queue Status' : 'Walk-in Queue'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {inQueue
                ? "You are currently in the queue. We'll call you when it's your turn."
                : 'Join the walk-in queue or look up an existing entry by student ID.'}
            </p>
          </div>

          {/* Live stats strip */}
          <QueueStats />

          {/* Main content — two columns */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {inQueue ? (
                <QueueBoard myId={myQueueId} onLeave={handleLeave} />
              ) : (
                <QueueForm onJoined={handleJoined} />
              )}
            </div>

            <div className="lg:col-span-2">
              {inQueue ? <ClinicInfoCard /> : <QueueLookup />}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
