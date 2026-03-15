import { NavLink, useLocation } from 'react-router-dom';
import { Users, CalendarDays, Sun, Moon } from 'lucide-react';
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
import { toggleTheme, getTheme } from '@/lib/theme';
import { useState } from 'react';

const navItems = [
  { label: 'Walk-in Queue', to: '/queue', icon: Users, exact: true },
  { label: 'Appointments', to: '/appointments', icon: CalendarDays, exact: true },
];

export function StudentSidebar() {
  const location = useLocation();
  const [theme, setTheme] = useState(getTheme);

  function handleThemeToggle() {
    setTheme(toggleTheme());
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4 px-3">
        <div className="flex items-center gap-2 px-1 overflow-hidden">
          <div className="flex size-7 items-center justify-center shrink-0">
            <img src={theme === 'dark' ? '/white.svg' : '/black.svg'} alt="MedQ" className="h-6" />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm tracking-tight">MedQ</span>
            <span className="text-xs text-muted-foreground">Student Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, to, icon: Icon, exact }) => {
                const isActive = exact
                  ? location.pathname === to
                  : location.pathname.startsWith(to);
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={label} className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-none">
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
            <SidebarMenuButton tooltip="Toggle theme" onClick={handleThemeToggle} className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:shadow-none">
              {theme === 'dark' ? <Sun /> : <Moon />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
