import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { StudentSidebar } from '../components/StudentSidebar';
import AppointmentForm from '../components/AppointmentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getMyAppointments, getAvailableSlots, type Appointment } from '@/lib/api';
import {
  CheckCircle2,
  Search,
  Clock,
  CalendarDays,
  ArrowRight,
  Loader2,
  CalendarClock,
  LayoutGrid,
} from 'lucide-react';

interface Confirmed {
  date: string;
  time_slot: string;
  name: string;
}

const STATUS_CONFIG: Record<Appointment['status'], { label: string; className: string }> = {
  booked: {
    label: 'Booked',
    className: 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-400',
  },
  confirmed: {
    label: 'Confirmed',
    className:
      'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-600 dark:bg-sky-950/30 dark:text-sky-300',
  },
  completed: {
    label: 'Completed',
    className:
      'border-green-400 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    className:
      'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400',
  },
};

function todayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ApptStats() {
  const [availableCount, setAvailableCount] = useState<number | null>(null);

  useEffect(() => {
    getAvailableSlots(todayStr())
      .then(({ available }) => setAvailableCount(available.length))
      .catch(() => setAvailableCount(null));
  }, []);

  const today = new Date();
  const dayName = today.toLocaleDateString(undefined, { weekday: 'long' });
  const dateLabel = today.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;

  const stats = [
    {
      label: 'Today',
      value: dayName,
      icon: CalendarDays,
      suffix: dateLabel,
      large: false,
    },
    {
      label: 'Slots Available Today',
      value: isWeekend ? 'Closed' : (availableCount != null ? availableCount : '…'),
      icon: LayoutGrid,
      suffix: isWeekend ? '' : (availableCount != null && availableCount !== 0 ? 'remaining' : ''),
      large: false,
    },
    {
      label: 'Total Daily Slots',
      value: '15',
      icon: CalendarClock,
      suffix: 'per day',
      large: false,
    },
    {
      label: 'Booking Hours',
      value: '09:00',
      icon: Clock,
      suffix: '– 16:00  ·  Mon–Fri',
      large: false,
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
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-2xl font-bold tabular-nums leading-none">{value}</span>
              {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ConfirmationCard({
  confirmed,
  onBookAnother,
  onCheckStatus,
}: {
  confirmed: Confirmed;
  onBookAnother: () => void;
  onCheckStatus: () => void;
}) {
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="py-10 flex flex-col items-center gap-5 text-center px-8">
        <div className="flex items-center justify-center size-14 bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-xl">Appointment Confirmed</p>
          <p className="text-muted-foreground text-sm">{confirmed.name}</p>
        </div>
        <div className="w-full bg-muted/50 dark:bg-muted/20 border border-border/60 px-5 py-4 flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Date
            </span>
            <span className="font-medium">
              {new Date(confirmed.date + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Time
            </span>
            <span className="font-mono font-semibold text-base">{confirmed.time_slot}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Please arrive 5 minutes before your scheduled time.
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button variant="outline" onClick={onBookAnother} className="w-full">
            Book Another Appointment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={onCheckStatus}
          >
            Check my appointments
            <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Appointments() {
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [lookupSid, setLookupSid] = useState('');

  function handleBooked(data: Confirmed) {
    setConfirmed(data);
  }

  function handleBookAnother() {
    setConfirmed(null);
  }

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
            <span className="text-foreground font-medium">Appointments</span>
          </nav>
        </header>

        <div className="flex flex-col gap-6 p-6">
          {/* Page heading */}
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Appointments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Book a time slot in advance or check the status of your existing appointment.
            </p>
          </div>

          {/* Stats strip */}
          <ApptStats />

          {/* Main content — two columns */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {confirmed ? (
                <ConfirmationCard
                  confirmed={confirmed}
                  onBookAnother={handleBookAnother}
                  onCheckStatus={() => {
                    setConfirmed(null);
                    setLookupSid('');
                  }}
                />
              ) : (
                <AppointmentForm onBooked={handleBooked} />
              )}
            </div>

            <div className="lg:col-span-2">
              <AppointmentLookupControlled sid={lookupSid} onSidChange={setLookupSid} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppointmentLookupControlled({
  sid,
  onSidChange,
}: {
  sid: string;
  onSidChange: (v: string) => void;
}) {
  const [results, setResults] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!sid.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const data = await getMyAppointments(sid.trim());
      setResults(data);
    } catch {
      setError('Failed to look up appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Search className="size-4 text-sky-500" />
          My Appointments
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="lookup-sid-ctrl">Student ID</Label>
            <div className="flex gap-2">
              <Input
                id="lookup-sid-ctrl"
                placeholder="e.g. S12345678"
                value={sid}
                onChange={(e) => onSidChange(e.target.value)}
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
              Shows upcoming and today's appointments for your student ID.
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
                No upcoming appointments found for <strong>{sid}</strong>.
              </p>
            ) : (
              results.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-start justify-between gap-3 border border-border/60 px-3 py-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="bg-muted/60 p-1.5 shrink-0 mt-0.5">
                      <CalendarDays className="size-3.5 text-sky-500" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold leading-none">{appt.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(appt.date)}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-xs font-mono font-medium">{appt.time_slot}</span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs text-muted-foreground">{appt.reason}</span>
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-muted-foreground italic mt-1">{appt.notes}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs ${STATUS_CONFIG[appt.status].className}`}
                  >
                    {STATUS_CONFIG[appt.status].label}
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
