import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '../components/AppSidebar';
import AppointmentCalendar from '../components/AppointmentCalendar';
import AppointmentStatsBar from '../components/AppointmentStatsBar';
import { AppointmentStatusChart } from '../components/AppointmentStatusChart';
import { AppointmentTrendChart } from '../components/AppointmentTrendChart';
import { useAppointments } from '@/hooks/useAppointments';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function todayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function offsetDate(base: string, days: number): string {
  const [year, month, day] = base.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);

  const nextYear = d.getFullYear();
  const nextMonth = String(d.getMonth() + 1).padStart(2, '0');
  const nextDay = String(d.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export default function StaffAppointments() {
  const [date, setDate] = useState(todayStr);
  const { appointments, loading, error, refresh } = useAppointments(date);

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
            <span className="text-foreground font-medium">Appointments</span>
          </nav>
        </header>

        <div className="flex flex-col gap-6 p-6">
          {/* Header + date navigator */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Appointments</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage the daily appointment schedule
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

          {/* Stats bar — reacts to selected date */}
          <AppointmentStatsBar appointments={appointments} />

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <AppointmentTrendChart />
            </div>
            <div className="lg:col-span-2">
              <AppointmentStatusChart appointments={appointments} />
            </div>
          </div>

          {/* Appointment table */}
          <AppointmentCalendar
            date={date}
            appointments={appointments}
            loading={loading}
            error={error}
            refresh={refresh}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
