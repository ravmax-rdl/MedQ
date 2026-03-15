import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Moon, Sun, X, ArrowRight, ClockAlert } from 'lucide-react';
import { toggleTheme, getTheme } from '@/lib/theme';
import { useState } from 'react';

export default function StudentHeader() {
  const [theme, setTheme] = useState(getTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  function handleThemeToggle() {
    setTheme(toggleTheme());
  }

  const isHome = location.pathname === '/';
  const isQueue = location.pathname === '/queue';
  const isAppts = location.pathname === '/appointments';
  const isStaff = location.pathname.startsWith('/staff');

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
        <div className="mx-auto flex items-center justify-between rounded-sm border border-border px-4 py-3 sm:py-4 shadow-lg backdrop-blur-xl transition-all duration-500 sm:px-6 max-w-7xl supports-backdrop-filter:bg-background/80">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 shrink-0 transition-transform duration-200 hover:scale-[1.02]"
          >
            <img
              src={theme === 'dark' ? '/workdmarkwhite.svg' : '/wordmarkblack.svg'}
              alt="MedQ"
              className="h-6"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm px-3 py-1.5 rounded-sm transition-all duration-200 hover:-translate-y-0.5 ${
                isHome
                  ? 'font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Home
            </Link>
            <Link
              to="/queue"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm px-3 py-1.5 rounded-sm transition-all duration-200 hover:-translate-y-0.5 ${
                isQueue
                  ? 'font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Walk-in Queue
            </Link>
            <Link
              to="/appointments"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm px-3 py-1.5 rounded-sm transition-all duration-200 hover:-translate-y-0.5 ${
                isAppts
                  ? 'font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Appointments
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to="/staff/login"
              className={`hidden md:inline-flex items-center gap-1 text-sm px-2 py-1 rounded-sm transition-colors ${
                isStaff
                  ? 'font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 hover:bg-muted'
              }`}
            >
              <Button variant="outline"  className="h-6 py-3 px-2">
              Staff portal 
              <ArrowRight className="size-3" /> 
              </Button>
              
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-sm hover:bg-muted transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden mt-3 mx-auto max-w-6xl rounded-sm border border-border/50 shadow-lg backdrop-blur-xl supports-backdrop-filter:bg-background/55 overflow-hidden transition-all duration-300 ${
            mobileMenuOpen
              ? 'max-h-64 opacity-100 translate-y-0'
              : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
          }`}
        >
          <div className="flex flex-col p-4 gap-1.5">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm rounded-sm px-3 py-2 transition-colors ${
                isHome
                  ? 'font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Home
            </Link>
            <Link
              to="/queue"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm rounded-sm px-3 py-2 transition-colors ${
                isQueue
                  ? 'font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Walk-in Queue
            </Link>
            <Link
              to="/appointments"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm rounded-sm px-3 py-2 transition-colors ${
                isAppts
                  ? 'font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Appointments
            </Link>
            <Link
              to="/staff/login"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm rounded-sm px-3 py-2 transition-colors ${
                isStaff
                  ? 'font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Staff portal
            </Link>
          </div>
        </div>
      </header>
      <div className="h-23" />
    </>
  );
}
