import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentHeader from '../components/StudentHeader';
import { getQueue } from '@/lib/api';
import { ArrowRight, CalendarDays, Users, Clock, ShieldCheck, MapPin, Phone } from 'lucide-react';

function useQueueCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    function load() {
      getQueue()
        .then((q) => setCount(q.length))
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);
  return count;
}

export default function StudentHome() {
  const queueCount = useQueueCount();

  return (
    <div className="relative min-h-screen  background flex flex-col overflow-x-clip">
      <StudentHeader />

      <main className="flex-1 flex flex-col items-center">
        {/* ── Hero ── */}
        <section className="w-full flex flex-col items-center text-center px-5 pt-16 pb-14 sm:px-8 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-sky-50 via-sky-50/30 to-background dark:from-sky-950/20 dark:via-sky-950/5 dark:to-background"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-sky-200/30 dark:bg-sky-500/10 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-center gap-5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 border rounded-full border-sky-200 dark:border-sky-800 bg-white/80 dark:bg-sky-950/60 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 backdrop-blur-sm shadow-sm">
              <span className="size-1.5 bg-sky-500 dark:bg-sky-400" />
              UOC Medical Center
            </span>

            <h1 className="text-6xl font-bold tracking-tight leading-[1.1] sm:text-6xl lg:text-[6rem]">
              Skip the{' '}
              <span className="relative inline-block text-sky-500 dark:text-sky-400">wait,</span>
              {` `} not the care.
            </h1>

            <p className="text-base text-muted-foreground max-w-sm leading-relaxed sm:max-w-md">
              Join the walk-in queue online or book an appointment slot in advance. No hassle, no
              waiting room.
            </p>

            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background/80 dark:bg-background/60 px-4 py-2 text-sm shadow-sm backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-green-500" />
              </span>
              <span className="text-muted-foreground wrap-break-word">
                {queueCount === null
                  ? 'Checking queue…'
                  : queueCount === 0
                    ? 'Queue is empty — walk right in'
                    : `${queueCount} ${queueCount === 1 ? 'person' : 'people'} ahead in queue`}
              </span>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <div className="w-full border-y border-border/60 bg-muted/20 dark:bg-muted/10">
          <div className="max-w-3xl mx-auto px-5 py-4 sm:px-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Clock, label: 'Clinic hours', value: 'Mon–Fri, 9 am – 4 pm' },
              {
                icon: MapPin,
                label: 'Location',
                value: 'University of Colombo Medical Center, Colombo 07',
              },
              { icon: Phone, label: 'Reception', value: '+(94) 777 677 222' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="size-4 text-sky-500 dark:text-sky-400 mb-0.5" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="text-xs font-medium text-foreground leading-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature cards ── */}
        <section className="w-full max-w-3xl px-5 py-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:px-8">
          {[
            {
              icon: Users,
              title: 'Live queue tracking',
              desc: "See exactly where you are in the queue. We'll alert you the moment you're called.",
              accent: 'text-sky-600 dark:text-sky-400',
              iconBg: 'bg-sky-100 dark:bg-sky-950/60',
              href: '/queue',
            },
            {
              icon: CalendarDays,
              title: 'Advance booking',
              desc: 'Reserve a time slot for any weekday. No waiting room — just show up at your time.',
              accent: 'text-violet-600 dark:text-violet-400',
              iconBg: 'bg-violet-100 dark:bg-violet-950/50',
              href: '/appointments',
            },
            {
              icon: Clock,
              title: 'Wait estimates',
              desc: "We calculate your wait time from today's average session — so you can plan your day.",
              accent: 'text-amber-600 dark:text-amber-400',
              iconBg: 'bg-amber-100 dark:bg-amber-950/50',
              href: '/queue',
            },
          ].map(({ icon: Icon, title, desc, accent, iconBg, href }) => (
            <Link
              key={title}
              to={href}
              className="group border border-border/60 bg-card p-5 flex flex-col gap-3 hover:border-border hover:shadow-sm transition-all duration-200"
            >
              <div className={`inline-flex size-9 items-center justify-center ${iconBg}`}>
                <Icon className={`size-4 ${accent}`} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                  {title}
                  <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* ── Footer strip ── */}
        <footer className="w-full border-t border-border/50 px-5 py-5 flex flex-col gap-2 items-center text-center sm:flex-row sm:justify-between sm:text-left sm:px-8">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-sky-500 shrink-0" />
            Your data stays local — no cloud, no tracking, no accounts.
          </div>
        </footer>
      </main>
    </div>
  );
}
