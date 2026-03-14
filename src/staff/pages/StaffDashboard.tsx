import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '../components/AppSidebar';
import StatsBar from '../components/StatsBar';
import StaffPanel from '../components/StaffPanel';
import { ActivityChart } from '../components/ActivityChart';
import { QueueStatusChart } from '../components/QueueStatusChart';

export default function StaffDashboard() {
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
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Queue Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time clinic overview — {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <StatsBar />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ActivityChart />
            </div>
            <div className="lg:col-span-2">
              <QueueStatusChart />
            </div>
          </div>

          <StaffPanel />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
