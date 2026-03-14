import { useState } from 'react';
import AppointmentForm from '../components/AppointmentForm';
import StudentHeader from '../components/StudentHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyAppointments, type Appointment } from '@/lib/api';
import {
  CheckCircle2,
  Search,
  Clock,
  CalendarDays,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function AppointmentLookup() {
  const [sid, setSid] = useState('');
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
                Shows upcoming and today's appointments for your student ID.
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
                No upcoming appointments found for <strong>{sid}</strong>.
              </CardContent>
            </Card>
          ) : (
            results.map((appt) => (
              <Card key={appt.id} className="shadow-sm overflow-hidden">
                <CardContent className="py-4 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted/60 p-2 shrink-0 mt-0.5">
                        <CalendarDays className="size-4 text-sky-500" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold">{appt.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(appt.date)}</p>
                        <div className="flex items-center gap-1.5 mt-1">
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Appointments() {
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [activeTab, setActiveTab] = useState('book');

  function handleBooked(data: Confirmed) {
    setConfirmed(data);
  }

  function handleBookAnother() {
    setConfirmed(null);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentHeader />

      <main className="flex-1 flex flex-col items-center px-5 pt-10 pb-16 gap-8 sm:px-8">
        {/* Page hero */}
        <div className="w-full max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="size-3" />
            Back to home
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Book a time slot in advance or check the status of your existing appointment.
          </p>
        </div>

        {/* Booking confirmation */}
        {confirmed ? (
          <Card className="w-full max-w-lg shadow-sm overflow-hidden">
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
                <Button variant="outline" onClick={handleBookAnother} className="w-full">
                  Book Another Appointment
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    setConfirmed(null);
                    setActiveTab('check');
                  }}
                >
                  Check my appointments
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full max-w-lg flex flex-col items-center gap-4"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="book">Book</TabsTrigger>
              <TabsTrigger value="check">Check Status</TabsTrigger>
            </TabsList>

            <TabsContent value="book" className="w-full mt-0">
              <AppointmentForm onBooked={handleBooked} />
            </TabsContent>

            <TabsContent value="check" className="w-full mt-0 flex flex-col items-center">
              <AppointmentLookup />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
