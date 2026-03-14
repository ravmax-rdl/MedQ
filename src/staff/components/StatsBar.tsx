import { Card, CardContent } from '@/components/ui/card';
import type { Stats } from '@/lib/api';
import { Users, Clock, CalendarDays, Activity, TrendingUp } from 'lucide-react';

interface Props {
  stats: Stats | null;
}

export default function StatsBar({ stats }: Props) {

  const items = [
    {
      label: 'Total today',
      value: stats?.total_today ?? '—',
      sub: 'Walk-in entries',
      icon: Activity,
      accent: 'text-sky-500',
    },
    {
      label: 'Waiting now',
      value: stats?.currently_waiting ?? '—',
      sub: 'In queue',
      icon: Users,
      accent: 'text-sky-500',
    },
    {
      label: 'Avg wait time',
      value: stats?.avg_wait_mins != null ? `${stats.avg_wait_mins}m` : '—',
      sub: 'Per patient today',
      icon: Clock,
      accent: 'text-sky-500',
    },
    {
      label: 'Appointments',
      value: stats?.appointments_today ?? '—',
      sub: 'Booked / confirmed',
      icon: CalendarDays,
      accent: 'text-sky-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
