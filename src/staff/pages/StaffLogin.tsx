import { Link } from 'react-router-dom';

export default function StaffLogin() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
          Staff
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">Login</h1>
      </div>

      <div className="flex flex-col gap-3 w-48">
        <Link
          to="/staff"
          className="text-center px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-sm text-white transition-colors"
        >
          Dashboard
        </Link>
        <Link
          to="/"
          className="text-center px-4 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          Student Home
        </Link>
      </div>
    </div>
  );
}
