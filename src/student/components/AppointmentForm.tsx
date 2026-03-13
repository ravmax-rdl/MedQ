import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookAppointment, getAvailableSlots } from '@/lib/api';

const REASONS = ['General', 'Sick Leave', 'Prescription', 'Referral', 'Vaccination', 'Mental Health', 'Other'];

interface Props {
  onBooked: (appointment: { date: string; time_slot: string; name: string }) => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AppointmentForm({ onBooked }: Props) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [reason, setReason] = useState('General');
  const [date, setDate] = useState(todayStr());
  const [timeSlot, setTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setTimeSlot('');
    getAvailableSlots(date)
      .then(({ available }) => setAvailableSlots(available))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!timeSlot) {
      setError('Please select a time slot');
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <CardDescription>
          Choose a date and time to schedule your clinic visit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appt-name">Full Name</Label>
            <Input
              id="appt-name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appt-sid">Student ID</Label>
            <Input
              id="appt-sid"
              placeholder="e.g. S12345678"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appt-date">Date</Label>
            <Input
              id="appt-date"
              type="date"
              value={date}
              min={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appt-slot">Time Slot</Label>
            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">Loading available slots…</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slots available for this date.</p>
            ) : (
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger id="appt-slot">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading || loadingSlots || !timeSlot}
            className="mt-2"
          >
            {loading ? 'Booking…' : 'Book Appointment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
