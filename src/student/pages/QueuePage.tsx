import { useState } from 'react';
import { Link } from 'react-router-dom';
import QueueForm from '../components/QueueForm';
import QueueBoard from '../components/QueueBoard';
import StudentHeader from '../components/StudentHeader';
import { leaveQueue } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

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
              Join the queue now — track your position live and get notified when you're called.
            </p>
          )}
        </div>

        {inQueue ? (
          <QueueBoard myId={myQueueId} onLeave={handleLeave} />
        ) : (
          <QueueForm onJoined={handleJoined} />
        )}
      </main>
    </div>
  );
}
