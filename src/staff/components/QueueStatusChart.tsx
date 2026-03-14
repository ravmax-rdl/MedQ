import * as React from 'react';
import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { getFullQueue } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  waiting: 'var(--chart-3)',
  called: 'var(--chart-1)',
  seen: 'var(--chart-4)',
  skipped: 'var(--chart-5)',
};

const chartConfig = {
  count: { label: 'Count' },
  waiting: { label: 'Waiting', color: 'var(--chart-3)' },
  called: { label: 'Called', color: 'var(--chart-1)' },
  seen: { label: 'Seen', color: 'var(--chart-4)' },
  skipped: { label: 'Skipped', color: 'var(--chart-5)' },
} satisfies ChartConfig;

export function QueueStatusChart() {
  const [chartData, setChartData] = React.useState([
    { status: 'Waiting', count: 0, key: 'waiting' },
    { status: 'Called', count: 0, key: 'called' },
    { status: 'Seen', count: 0, key: 'seen' },
    { status: 'Skipped', count: 0, key: 'skipped' },
  ]);

  React.useEffect(() => {
    function load() {
      getFullQueue()
        .then((entries) => {
          const counts: Record<string, number> = {
            waiting: 0,
            called: 0,
            seen: 0,
            skipped: 0,
          };
          entries.forEach((e) => {
            if (e.status in counts) counts[e.status]++;
          });
          setChartData([
            { status: 'Waiting', count: counts.waiting, key: 'waiting' },
            { status: 'Called', count: counts.called, key: 'called' },
            { status: 'Seen', count: counts.seen, key: 'seen' },
            { status: 'Skipped', count: counts.skipped, key: 'skipped' },
          ]);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base">Queue Breakdown</CardTitle>
        <CardDescription>Today's queue entries by status</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <BarChart data={chartData} barSize={40}>
            <XAxis
              dataKey="status"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickMargin={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={24}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
