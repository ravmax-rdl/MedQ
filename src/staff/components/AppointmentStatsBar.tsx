import { Card, CardContent } from '@/components/ui/card';
import type { Appointment } from '@/lib/api';
import { CalendarDays, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';

interface Props {
  appointments: Appointment[];
}

export default function AppointmentStatsBar({ appointments }: Props) {
  const total = appointments.length;
  const booked = appointments.filter((a) => a.status === 'booked').length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

  const items = [
    {
      label: 'Total',
      value: total,
      sub: 'All appointments',
      icon: CalendarDays,
      accent: 'text-sky-500',
    },
    {
      label: 'Booked',
      value: booked,
      sub: 'Awaiting confirmation',
      icon: Clock,
      accent: 'text-neutral-500 dark:text-neutral-400',
    },
    {
      label: 'Confirmed',
      value: confirmed,
      sub: 'Ready to attend',
      icon: CalendarDays,
      accent: 'text-sky-500',
    },
    {
      label: 'Completed',
      value: completed,
      sub: 'Visit done',
      icon: CheckCircle2,
      accent: 'text-green-500',
    },
    {
      label: 'Cancelled',
      value: cancelled,
      sub: 'No-shows / cancelled',
      icon: XCircle,
      accent: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {items.map(({ label, value, sub, icon: Icon, accent }) => (
        <Card key={label} className="relative overflow-hidden">
          <CardContent className="py-5 px-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="size-3" />
                  {sub}
                </p>
              </div>
              <div className={`bg-muted/60 p-2 ${accent}`}>
                <Icon className="size-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
