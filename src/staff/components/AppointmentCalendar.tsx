import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { updateAppointmentStatus, cancelAppointment, type Appointment } from '@/lib/api';
import { CheckCircle2, XCircle, CheckCheck, RefreshCw, CalendarClock } from 'lucide-react';

const STATUS_BADGE: Record<Appointment['status'], { label: string; className: string }> = {
  booked: {
    label: 'Booked',
    className: 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-400',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'border-sky-400 text-sky-700 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-300',
  },
  completed: {
    label: 'Completed',
    className:
      'border-green-400 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400',
  },
};

type TabValue = 'all' | Appointment['status'];

interface Props {
  date: string;
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export default function AppointmentCalendar({
  date,
  appointments,
  loading,
  error,
  refresh,
}: Props) {
  const [tab, setTab] = useState<TabValue>('all');

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

  const counts = {
    all: appointments.length,
    booked: appointments.filter((a) => a.status === 'booked').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  const filtered = tab === 'all' ? appointments : appointments.filter((a) => a.status === tab);

  const sortedFiltered = [...filtered].sort((a, b) => a.time_slot.localeCompare(b.time_slot));

  if (loading && appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading…
        </CardContent>
      </Card>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          Failed to load appointments: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 pt-4 px-5 border-b border-border/50 bg-muted/10">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarClock className="size-4 text-sky-500" />
            {date
              ? new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Appointments'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            className="gap-1.5 h-7 text-xs text-muted-foreground"
          >
            <RefreshCw className="size-3" />
            Refresh
          </Button>
        </div>

        <Tabs className="flex-col gap-0" value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="h-8 bg-transparent p-0 gap-0 border-b-0 rounded-none -mb-px">
            {(['all', 'booked', 'confirmed', 'completed', 'cancelled'] as const).map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 h-8 px-3 text-xs capitalize"
              >
                {t === 'all' ? 'All' : t}
                <span className="ml-1.5 inline-flex items-center justify-center bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                  {counts[t]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {(['all', 'booked', 'confirmed', 'completed', 'cancelled'] as const).map((t) => (
            <TabsContent key={t} value={t} className="mt-0">
              <CardContent className="p-0">
                {sortedFiltered.length === 0 ? (
                  <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No {t === 'all' ? '' : t} appointments for this date.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="w-16 pl-5">Time</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right pr-5">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedFiltered.map((appt) => (
                        <TableRow
                          key={appt.id}
                          className={
                            appt.status === 'cancelled'
                              ? 'opacity-50 line-through-cells'
                              : appt.status === 'completed'
                                ? 'opacity-60'
                                : appt.status === 'confirmed'
                                  ? 'bg-sky-50/30 dark:bg-sky-950/10'
                                  : ''
                          }
                        >
                          <TableCell className="font-mono text-sm font-semibold pl-5">
                            {appt.time_slot}
                          </TableCell>
                          <TableCell className="font-medium text-sm">{appt.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {appt.student_id}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {appt.reason}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0 ${STATUS_BADGE[appt.status].className}`}
                            >
                              {STATUS_BADGE[appt.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-28 truncate">
                            {appt.notes || '—'}
                          </TableCell>
                          <TableCell className="text-right pr-5">
                            <div className="flex items-center justify-end gap-1">
                              {appt.status === 'booked' && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="h-6 px-2 text-xs gap-1 text-sky-700 border-sky-200 hover:bg-sky-50 dark:text-sky-400 dark:border-sky-900"
                                  onClick={() => handleAction(appt.id, 'confirm')}
                                >
                                  <CheckCircle2 className="size-3" />
                                  Confirm
                                </Button>
                              )}
                              {(appt.status === 'booked' || appt.status === 'confirmed') && (
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="h-6 px-2 text-xs gap-1 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900"
                                  onClick={() => handleAction(appt.id, 'complete')}
                                >
                                  <CheckCheck className="size-3" />
                                  Complete
                                </Button>
                              )}
                              {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleAction(appt.id, 'cancel')}
                                >
                                  <XCircle className="size-3" />
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
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>
    </Card>
  );
}
