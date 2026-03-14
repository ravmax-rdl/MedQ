import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, LogOut, Sun, Moon, Activity } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { toggleTheme, getTheme } from '@/lib/theme';
import { useState } from 'react';

const navItems = [
  { label: 'Queue', to: '/staff', icon: LayoutDashboard, exact: true },
  { label: 'Appointments', to: '/staff/appointments', icon: CalendarDays, exact: false },
];

export function AppSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(getTheme);

  function handleThemeToggle() {
    setTheme(toggleTheme());
  }

  async function handleLogout() {
    await logout();
    navigate('/staff/login', { replace: true });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4 px-3">
        <div className="flex items-center gap-2 px-1 overflow-hidden">
          <div className="flex size-7 items-center justify-center roundedshrink-0">
            <img src={theme === 'dark' ? '/white.svg' : '/black.svg'} alt="MedQ" className="h-6" />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm tracking-tight">MedQ</span>
            <span className="text-xs text-muted-foreground">Staff Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, to, icon: Icon, exact }) => {
                const isActive = exact
                  ? location.pathname === to
                  : location.pathname.startsWith(to);
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                      <NavLink to={to} end={exact}>
                        <Icon />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="py-3 px-2">
        <SidebarSeparator className="mb-1" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Toggle theme" onClick={handleThemeToggle}>
              {theme === 'dark' ? <Sun /> : <Moon />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
