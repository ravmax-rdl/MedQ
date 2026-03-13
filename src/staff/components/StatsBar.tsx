import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getStats, type Stats } from '@/lib/api';
import { Users, Clock, CalendarDays, Activity } from 'lucide-react';

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    function load() {
      getStats()
        .then(setStats)
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    {
      label: 'Total today',
      value: stats?.total_today ?? '—',
      icon: Activity,
    },
    {
      label: 'Waiting now',
      value: stats?.currently_waiting ?? '—',
      icon: Users,
    },
    {
      label: 'Avg wait',
      value: stats?.avg_wait_mins != null ? `${stats.avg_wait_mins}m` : '—',
      icon: Clock,
    },
    {
      label: "Appointments today",
      value: stats?.appointments_today ?? '—',
      icon: CalendarDays,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="py-4 px-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
