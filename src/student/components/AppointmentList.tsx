import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Appointment } from '@/lib/api';

const STATUS_STYLE: Record<Appointment['status'], string> = {
  booked: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  confirmed: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

interface Props {
  appointments: Appointment[];
  title?: string;
}

export default function AppointmentList({ appointments, title = 'Your Appointments' }: Props) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No appointments found.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {appointments.map((appt) => (
              <div key={appt.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{appt.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {appt.date} at {appt.time_slot} · {appt.reason}
                  </p>
                  {appt.notes && (
                    <p className="text-xs text-muted-foreground italic">{appt.notes}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium shrink-0 ${STATUS_STYLE[appt.status]}`}
                >
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
