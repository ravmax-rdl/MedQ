import { Card, CardContent } from '@/components/ui/card';
import type { Stats, QueueEntry } from '@/lib/api';
import { Users, Clock, Eye, Phone, SkipForward, Activity, TrendingUp } from 'lucide-react';

interface Props {
  stats: Stats | null;
  queue: QueueEntry[];
}

export default function StatsBar({ stats, queue }: Props) {
  const called = queue.filter((e) => e.status === 'called').length;
  const seen = queue.filter((e) => e.status === 'seen').length;
  const skipped = queue.filter((e) => e.status === 'skipped').length;

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
      label: 'Called',
      value: called,
      sub: 'Being attended',
      icon: Phone,
      accent: 'text-sky-500',
    },
    {
      label: 'Seen',
      value: seen,
      sub: 'Visit completed',
      icon: Eye,
      accent: 'text-green-500',
    },
    {
      label: 'Skipped',
      value: skipped,
      sub: 'Did not attend',
      icon: SkipForward,
      accent: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
