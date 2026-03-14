import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { joinQueue } from '@/lib/api';
import {
  Stethoscope,
  FileText,
  Pill,
  ArrowRightLeft,
  Syringe,
  Brain,
  CircleDot,
} from 'lucide-react';

const REASONS: { label: string; icon: React.ElementType }[] = [
  { label: 'General', icon: Stethoscope },
  { label: 'Sick Leave', icon: FileText },
  { label: 'Prescription', icon: Pill },
  { label: 'Referral', icon: ArrowRightLeft },
  { label: 'Vaccination', icon: Syringe },
  { label: 'Mental Health', icon: Brain },
  { label: 'Other', icon: CircleDot },
];

interface Props {
  onJoined: (id: number) => void;
}

export default function QueueForm({ onJoined }: Props) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [reason, setReason] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const entry = await joinQueue({ name, student_id: studentId, reason });
      localStorage.setItem('medq-queue-id', String(entry.id));
      onJoined(entry.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join queue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Join the Walk-in Queue</CardTitle>
        <CardDescription>Enter your details below — you'll be added instantly.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. Alex Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input
                id="student-id"
                placeholder="e.g. S12345678"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Reason for Visit</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {REASONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setReason(label)}
                  className={`flex flex-col items-center gap-1.5 border px-2 py-3 text-center text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    reason === label
                      ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-300 shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-500 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-sky-700 dark:hover:bg-sky-950/30 dark:hover:text-sky-300'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 border-2 border-white/30 border-t-white animate-spin" />
                Joining…
              </span>
            ) : (
              'Join Queue'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
