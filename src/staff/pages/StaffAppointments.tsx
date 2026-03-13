import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppointmentCalendar from '../components/AppointmentCalendar';
import { useAuth } from '@/hooks/useAuth';
import { toggleTheme, getTheme } from '@/lib/theme';
import { Moon, Sun, LogOut } from 'lucide-react';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function StaffAppointments() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getTheme);
  const [date, setDate] = useState(todayStr);

  function handleThemeToggle() {
    const next = toggleTheme();
    setTheme(next);
  }

  async function handleLogout() {
    await logout();
    navigate('/staff/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={theme === 'dark' ? '/white.svg' : '/black.svg'}
              alt="MedQ"
              className="h-6"
            />
            <span className="text-sm font-medium">MedQ Staff</span>
          </div>
          <nav className="flex items-center gap-1 ml-4">
            <Link
              to="/staff"
              className="px-3 py-1 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Queue
            </Link>
            <Link
              to="/staff/appointments"
              className="px-3 py-1 rounded-md text-sm font-medium bg-muted text-foreground"
            >
              Appointments
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={handleThemeToggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut className="size-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight mb-1">Appointments</h1>
            <p className="text-sm text-muted-foreground">Manage daily appointment schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="appt-date" className="text-sm shrink-0">
              Date
            </Label>
            <Input
              id="appt-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        <AppointmentCalendar date={date} />
      </main>
    </div>
  );
}
