import { useState, useEffect, useCallback } from 'react';
import { getAppointments, type Appointment } from '@/lib/api';

export function useAppointments(date: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!date) return;
    try {
      const data = await getAppointments(date);
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { appointments, loading, error, refresh };
}
