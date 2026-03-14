import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDailyStats, type DailyStats } from '@/lib/api';

const chartConfig = {
  queue_total: {
    label: 'Walk-ins',
    color: 'var(--chart-1)',
  },
  appointments: {
    label: 'Appointments',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function ActivityChart() {
  const [data, setData] = React.useState<DailyStats[]>([]);
  const [range, setRange] = React.useState<'7d' | '3d'>('7d');

  React.useEffect(() => {
    getDailyStats()
      .then(setData)
      .catch(() => {});
    const interval = setInterval(() => {
      getDailyStats()
        .then(setData)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = range === '3d' ? data.slice(-3) : data;

  const formatted = filtered.map((d) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Clinic Activity</CardTitle>
          <CardDescription>Walk-ins and appointments over time</CardDescription>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as '7d' | '3d')}>
          <SelectTrigger className="w-[130px] rounded-lg text-xs h-8" aria-label="Select range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
            <SelectItem value="3d" className="rounded-lg">Last 3 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="fillQueueTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-queue_total)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-queue_total)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-appointments)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-appointments)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} width={24} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="appointments"
              type="monotone"
              fill="url(#fillAppointments)"
              stroke="var(--color-appointments)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="queue_total"
              type="monotone"
              fill="url(#fillQueueTotal)"
              stroke="var(--color-queue_total)"
              strokeWidth={2}
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
