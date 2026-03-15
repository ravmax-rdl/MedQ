import { useState, useEffect, useCallback } from 'react';
import { getQueue, getFullQueue, type QueueEntry } from '@/lib/api';

export function useQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getQueue();
      setQueue(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { queue, loading, error, refresh };
}

export function useFullQueue(date: string) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    getFullQueue(date)
      .then((data) => { setQueue(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { queue, loading, refresh };
}
