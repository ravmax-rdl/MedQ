import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppointmentForm from '../components/AppointmentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { toggleTheme, getTheme } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';

interface Confirmed {
  date: string;
  time_slot: string;
  name: string;
}

export default function Appointments() {
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [theme, setTheme] = useState(getTheme);

  function handleThemeToggle() {
    const next = toggleTheme();
    setTheme(next);
  }

  function handleBooked(data: Confirmed) {
    setConfirmed(data);
  }

  function handleBookAnother() {
    setConfirmed(null);
  }

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
          <span className="text-sm font-medium">MedQ</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Walk-in Queue
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
          <h1 className="text-3xl font-semibold tracking-tight">Appointments</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Book a time slot in advance for your clinic visit.
          </p>
        </div>

        {confirmed ? (
          <Card className="w-full max-w-md">
            <CardContent className="py-10 flex flex-col items-center gap-4 text-center">
              <CheckCircle className="size-10 text-green-500" />
              <div>
                <p className="font-semibold text-lg">Appointment Confirmed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {confirmed.name} · {confirmed.date} at {confirmed.time_slot}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Please arrive 5 minutes before your scheduled time.
                </p>
              </div>
              <Button variant="outline" onClick={handleBookAnother} className="mt-2">
                Book Another Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AppointmentForm onBooked={handleBooked} />
        )}
      </main>
    </div>
  );
}
