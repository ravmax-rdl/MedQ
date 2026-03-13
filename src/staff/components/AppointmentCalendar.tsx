import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppointments } from '@/hooks/useAppointments';
import { updateAppointmentStatus, cancelAppointment } from '@/lib/api';
import type { Appointment } from '@/lib/api';

const STATUS_STYLE: Record<Appointment['status'], string> = {
  booked: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  confirmed: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

interface Props {
  date: string;
}

export default function AppointmentCalendar({ date }: Props) {
  const { appointments, loading, refresh } = useAppointments(date);

  async function handleAction(id: number, action: 'confirm' | 'complete' | 'cancel') {
    try {
      if (action === 'cancel') {
        await cancelAppointment(id);
      } else {
        const statusMap = { confirm: 'confirmed', complete: 'completed' } as const;
        await updateAppointmentStatus(id, statusMap[action]);
      }
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading && appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Appointments for{' '}
          {date
            ? new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : '—'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No appointments for this date.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell className="font-mono text-sm font-medium">{appt.time_slot}</TableCell>
                  <TableCell className="text-sm font-medium">{appt.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {appt.student_id}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{appt.reason}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[appt.status]}`}
                    >
                      {appt.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                    {appt.notes || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {appt.status === 'booked' && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleAction(appt.id, 'confirm')}
                        >
                          Confirm
                        </Button>
                      )}
                      {(appt.status === 'booked' || appt.status === 'confirmed') && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleAction(appt.id, 'complete')}
                        >
                          Complete
                        </Button>
                      )}
                      {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleAction(appt.id, 'cancel')}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
