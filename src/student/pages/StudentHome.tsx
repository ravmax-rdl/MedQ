import { Link } from 'react-router-dom';

export default function StudentHome() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
          Student
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">Queue</h1>
      </div>

      <div className="flex flex-col gap-3 w-48">
        <Link
          to="/appointments"
          className="text-center px-4 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          Book Appointment
        </Link>
        <Link
          to="/staff/login"
          className="text-center px-4 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          Staff Login
        </Link>
      </div>
    </div>
  );
}
