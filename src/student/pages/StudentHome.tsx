import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QueueForm from '../components/QueueForm';
import QueueBoard from '../components/QueueBoard';
import { toggleTheme, getTheme } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentHome() {
  const [myQueueId, setMyQueueId] = useState<number | null>(() => {
    const stored = localStorage.getItem('medq-queue-id');
    return stored ? Number(stored) : null;
  });
  const [theme, setTheme] = useState(getTheme);

  function handleThemeToggle() {
    const next = toggleTheme();
    setTheme(next);
  }

  function handleJoined(id: number) {
    setMyQueueId(id);
  }

  function handleLeave() {
    localStorage.removeItem('medq-queue-id');
    setMyQueueId(null);
  }

  // Clear queue ID on component mount if the stored ID is stale
  useEffect(() => {
    const stored = localStorage.getItem('medq-queue-id');
    if (stored) setMyQueueId(Number(stored));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={theme === 'dark' ? '/white.svg' : '/black.svg'}
            alt="MedQ"
            className="h-6"
          />
          <span className="text-sm font-medium text-foreground">MedQ</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            to="/appointments"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Book Appointment
          </Link>
          <Link
            to="/staff/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Staff Login
          </Link>
          <Button variant="ghost" size="icon-sm" onClick={handleThemeToggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-12 pb-16 gap-8">
        <div className="text-center max-w-md">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            University Health Clinic
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Walk-In Queue</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the queue online and track your position in real time.
          </p>
        </div>

        {myQueueId === null ? (
          <QueueForm onJoined={handleJoined} />
        ) : (
          <QueueBoard myId={myQueueId} onLeave={handleLeave} />
        )}
      </main>
    </div>
  );
}
