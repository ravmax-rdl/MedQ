import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDailyStats } from '@/lib/api';

const chartConfig = {
  appointments: {
    label: 'Total',
    color: 'var(--chart-2)',
  },
  appointments_completed: {
    label: 'Completed',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

export function AppointmentTrendChart() {
  const [data, setData] = React.useState<
    Array<{ date: string; appointments: number; appointments_completed: number }>
  >([]);
  const [range, setRange] = React.useState<'7d' | '3d'>('7d');

  React.useEffect(() => {
    function load() {
      getDailyStats()
        .then((rows) => {
          setData(rows);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 30000);
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
          <CardTitle className="text-base">Appointment Trends</CardTitle>
          <CardDescription>
            Total booked vs completed — {range === '3d' ? 'last 3 days' : 'last 7 days'}
          </CardDescription>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as '7d' | '3d')}>
          <SelectTrigger className="h-8 w-32.5 text-xs" aria-label="Select range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="3d">Last 3 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-55 w-full">
          <BarChart data={formatted} barCategoryGap="30%">
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              width={24}
              allowDecimals={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="appointments" fill="var(--color-appointments)" radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="appointments_completed"
              fill="var(--color-appointments_completed)"
              radius={[4, 4, 0, 0]}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
