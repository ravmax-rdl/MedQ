import { useState } from 'react';
import { Link } from 'react-router-dom';
import QueueForm from '../components/QueueForm';
import QueueBoard from '../components/QueueBoard';
import StudentHeader from '../components/StudentHeader';
import { leaveQueue, getMyQueueEntries, type QueueEntry } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, Loader2, Users, Clock, BellRing, CheckCircle2, SkipForward } from 'lucide-react';

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
    <div className="w-full max-w-lg flex flex-col gap-4">
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
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
                    <>
                      <Search className="size-4 mr-1.5" />
                      Look up
                    </>
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
        </CardContent>
      </Card>

      {results !== null && (
        <div className="flex flex-col gap-2">
          {results.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No queue entries found today for <strong>{sid}</strong>.
              </CardContent>
            </Card>
          ) : (
            results.map((entry) => {
              const Icon = STATUS_ICON[entry.status];
              return (
                <Card key={entry.id} className="shadow-sm overflow-hidden">
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted/60 p-2 shrink-0 mt-0.5">
                          <Icon className="size-4 text-sky-500" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-semibold">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.reason}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Joined {formatTime(entry.joined_at)}
                            </span>
                            {entry.status === 'waiting' && entry.position != null && (
                              <>
                                <span className="text-muted-foreground text-xs">·</span>
                                <span className="text-xs font-medium">
                                  Position #{entry.position}
                                </span>
                              </>
                            )}
                            {entry.status === 'waiting' && entry.estimated_wait_mins != null && (
                              <>
                                <span className="text-muted-foreground text-xs">·</span>
                                <span className="text-xs text-muted-foreground">
                                  ~{entry.estimated_wait_mins}m wait
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
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
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
    <div className="min-h-screen bg-background flex flex-col">
      <StudentHeader />

      <main className="flex-1 flex flex-col items-center px-5 pt-10 pb-16 gap-6 sm:px-8">
        <div className="w-full max-w-2xl">
          {!inQueue && (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
            >
              <ArrowLeft className="size-3" />
              Back to home
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            {inQueue ? 'Your Queue Status' : 'Walk-in Queue'}
          </h1>
          {!inQueue && (
            <p className="text-sm text-muted-foreground mt-1">
              Join the queue now or look up an existing entry by student ID.
            </p>
          )}
        </div>

        {inQueue ? (
          <QueueBoard myId={myQueueId} onLeave={handleLeave} />
        ) : (
          <Tabs defaultValue="join" className="w-full max-w-lg flex flex-col items-center gap-4">
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="join">Join Queue</TabsTrigger>
              <TabsTrigger value="check">Check Status</TabsTrigger>
            </TabsList>

            <TabsContent value="join" className="w-full mt-0">
              <QueueForm onJoined={handleJoined} />
            </TabsContent>

            <TabsContent value="check" className="w-full mt-0 flex flex-col items-center">
              <QueueLookup />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
