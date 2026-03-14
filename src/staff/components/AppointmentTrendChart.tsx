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
    Array<{ date: string; appointments: number; appointments_completed: number; label: string }>
  >([]);

  React.useEffect(() => {
    function load() {
      getDailyStats()
        .then((rows) => {
          setData(
            rows.map((d) => ({
              ...d,
              label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
            }))
          );
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Appointment Trends</CardTitle>
          <CardDescription>Total booked vs completed — last 7 days</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <BarChart data={data} barCategoryGap="30%">
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
            <Bar
              dataKey="appointments"
              fill="var(--color-appointments)"
              radius={[4, 4, 0, 0]}
            />
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
