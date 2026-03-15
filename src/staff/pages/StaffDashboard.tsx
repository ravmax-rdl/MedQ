import { useState, useEffect, useCallback } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '../components/AppSidebar';
import StatsBar from '../components/StatsBar';
import StaffPanel from '../components/StaffPanel';
import { ActivityChart } from '../components/ActivityChart';
import { QueueStatusChart } from '../components/QueueStatusChart';
import { useFullQueue } from '@/hooks/useQueue';
import { getStats, type Stats } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function offsetDate(base: string, days: number): string {
  const [year, month, day] = base.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function StaffDashboard() {
  const [date, setDate] = useState(todayStr);
  const { queue, loading, refresh } = useFullQueue(date);
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = useCallback(() => {
    getStats(date).then(setStats).catch(() => {});
  }, [date]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const isToday = date === todayStr();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Staff</span>
            <span>/</span>
            <span className="text-foreground font-medium">Queue Dashboard</span>
          </nav>
        </header>

        <div className="flex flex-col gap-6 p-6">
          {/* Header + date navigator */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Queue Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isToday
                  ? `Real-time clinic overview — ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                  : `Historical view for ${new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setDate((d) => offsetDate(d, -1))}
                aria-label="Previous day"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex items-center gap-2 border border-border px-3 h-8 text-sm min-w-40 justify-center">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-sm outline-none cursor-pointer text-center tabular-nums"
                  aria-label="Select date"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setDate((d) => offsetDate(d, 1))}
                aria-label="Next day"
              >
                <ChevronRight className="size-4" />
              </Button>

              {!isToday && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setDate(todayStr())}
                >
                  Today
                </Button>
              )}
            </div>
          </div>

          <StatsBar stats={stats} queue={queue} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ActivityChart />
            </div>
            <div className="lg:col-span-2">
              <QueueStatusChart queue={queue} />
            </div>
          </div>

          <StaffPanel queue={queue} loading={loading} refresh={refresh} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
