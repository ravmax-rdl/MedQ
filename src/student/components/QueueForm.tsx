import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { joinQueue } from '@/lib/api';

const REASONS = ['General', 'Sick Leave', 'Prescription', 'Referral', 'Vaccination', 'Mental Health', 'Other'];

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join the Queue</CardTitle>
        <CardDescription>
          Walk-in patients — enter your details to join the clinic queue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              placeholder="e.g. S12345678"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black">
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Joining…' : 'Join Queue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
