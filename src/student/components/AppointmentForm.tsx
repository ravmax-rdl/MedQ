import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bookAppointment, getAvailableSlots } from '@/lib/api';
import { CalendarDays, Clock } from 'lucide-react';

const REASONS = [
  'General',
  'Sick Leave',
  'Prescription',
  'Referral',
  'Vaccination',
  'Mental Health',
  'Other',
];

const ALL_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
];

interface Props {
  onBooked: (appointment: { date: string; time_slot: string; name: string }) => void;
}

function todayStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function offsetDate(base: string, days: number): string {
  const [year, month, day] = base.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);

  const nextYear = d.getFullYear();
  const nextMonth = String(d.getMonth() + 1).padStart(2, '0');
  const nextDay = String(d.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = todayStr();
  const tomorrow = offsetDate(today, 1);
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function isWeekend(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay() === 0 || d.getDay() === 6;
}

function fromDateString(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toDateString(dateObj: Date) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AppointmentForm({ onBooked }: Props) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [reason, setReason] = useState('General');
  const [date, setDate] = useState(() => {
    // Start on today, skip to Monday if weekend
    let d = todayStr();
    while (isWeekend(d)) d = offsetDate(d, 1);
    return d;
  });
  const [timeSlot, setTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<Set<string>>(new Set(ALL_SLOTS));
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setTimeSlot('');
    getAvailableSlots(date)
      .then(({ available }) => setAvailableSlots(new Set(available)))
      .catch(() => setAvailableSlots(new Set()))
      .finally(() => setLoadingSlots(false));
  }, [date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!timeSlot) {
      setError('Please select a time slot');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await bookAppointment({ name, student_id: studentId, reason, date, time_slot: timeSlot });
      onBooked({ date, time_slot: timeSlot, name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  }

  const selectedDate = fromDateString(date);
  const today = fromDateString(todayStr());

  return (
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Book an Appointment</CardTitle>
        <CardDescription>Choose a date and available time slot.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name + Student ID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="appt-name">Full Name</Label>
              <Input
                id="appt-name"
                placeholder="e.g. Alex Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="appt-sid">Student ID</Label>
              <Input
                id="appt-sid"
                placeholder="e.g. S12345678"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Date navigator */}
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                  aria-label="Select appointment date"
                >
                  <span>
                    {formatDateLabel(date)}{' '}
                    <span className="text-muted-foreground text-xs">
                      {selectedDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                  <CalendarDays className="size-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto border-border/40 bg-transparent p-0 shadow-lg backdrop-blur-xl"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(picked) => {
                    if (!picked) return;
                    setDate(toDateString(picked));
                  }}
                  disabled={(day) => day < today || day.getDay() === 0 || day.getDay() === 6}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time slot grid */}
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              Time Slot
              {loadingSlots && (
                <span className="text-xs text-muted-foreground font-normal">Loading…</span>
              )}
            </Label>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
              {ALL_SLOTS.map((slot) => {
                const available = availableSlots.has(slot);
                const selected = timeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={!available || loadingSlots}
                    onClick={() => setTimeSlot(slot)}
                    className={`rounded-md border py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected
                        ? 'border-sky-500 bg-sky-500 text-white shadow-sm dark:border-sky-400 dark:bg-sky-500'
                        : available
                          ? 'border-neutral-200 bg-white text-neutral-700 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-sky-600 dark:hover:bg-sky-950/40 dark:hover:text-sky-300'
                          : 'border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed line-through dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-600'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            {!loadingSlots && availableSlots.size === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No slots available on this day. Try a different date.
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="appt-reason">Reason for Visit</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="appt-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !timeSlot || !name || !studentId}
            className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Booking…
              </span>
            ) : (
              'Confirm Appointment'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
