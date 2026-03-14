import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Appointment } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  booked: 'var(--chart-3)',
  confirmed: 'var(--chart-1)',
  completed: 'var(--chart-4)',
  cancelled: 'var(--chart-5)',
};

const chartConfig = {
  count: { label: 'Count' },
  booked: { label: 'Booked', color: 'var(--chart-3)' },
  confirmed: { label: 'Confirmed', color: 'var(--chart-1)' },
  completed: { label: 'Completed', color: 'var(--chart-4)' },
  cancelled: { label: 'Cancelled', color: 'var(--chart-5)' },
} satisfies ChartConfig;

interface Props {
  appointments: Appointment[];
}

export function AppointmentStatusChart({ appointments }: Props) {
  const counts = { booked: 0, confirmed: 0, completed: 0, cancelled: 0 };
  appointments.forEach((a) => {
    if (a.status in counts) counts[a.status as keyof typeof counts]++;
  });

  const chartData = [
    { status: 'Booked', count: counts.booked, key: 'booked' },
    { status: 'Confirmed', count: counts.confirmed, key: 'confirmed' },
    { status: 'Completed', count: counts.completed, key: 'completed' },
    { status: 'Cancelled', count: counts.cancelled, key: 'cancelled' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base">Status Breakdown</CardTitle>
        <CardDescription>Appointments by status for this date</CardDescription>
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
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
