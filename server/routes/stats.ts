import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.get('/daily', requireAuth, (_req, res) => {
  const queueRows = db
    .prepare(
      `SELECT date(joined_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'seen' THEN 1 ELSE 0 END) as seen,
        SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped
       FROM queue
       WHERE joined_at >= date('now', '-6 days')
       GROUP BY date(joined_at)
       ORDER BY date ASC`
    )
    .all() as Array<{ date: string; total: number; seen: number; skipped: number }>;

  const apptRows = db
    .prepare(
      `SELECT date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM appointments
       WHERE date >= date('now', '-6 days')
       GROUP BY date
       ORDER BY date ASC`
    )
    .all() as Array<{ date: string; total: number; completed: number; cancelled: number }>;

  const allDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    allDates.push(d.toISOString().slice(0, 10));
  }

  const queueMap = Object.fromEntries(queueRows.map((r) => [r.date, r]));
  const apptMap = Object.fromEntries(apptRows.map((r) => [r.date, r]));

  const daily = allDates.map((date) => ({
    date,
    queue_total: queueMap[date]?.total ?? 0,
    queue_seen: queueMap[date]?.seen ?? 0,
    appointments: apptMap[date]?.total ?? 0,
    appointments_completed: apptMap[date]?.completed ?? 0,
  }));

  res.json(daily);
});

router.get('/', requireAuth, (_req, res) => {
  const totalToday = (
    db
      .prepare(`SELECT COUNT(*) as count FROM queue WHERE date(joined_at) = date('now')`)
      .get() as { count: number }
  ).count;

  // Average time patients actually spent waiting in queue today (joined → called).
  // This is the meaningful "wait time" to show students in the stats bar.
  const avgWait = (
    db
      .prepare(
        `SELECT AVG((julianday(called_at) - julianday(joined_at)) * 24 * 60) as avg
         FROM queue
         WHERE called_at IS NOT NULL
           AND date(joined_at) = date('now')`
      )
      .get() as { avg: number | null }
  ).avg;

  const currentlyWaiting = (
    db
      .prepare(`SELECT COUNT(*) as count FROM queue WHERE status = 'waiting'`)
      .get() as { count: number }
  ).count;

  const appointmentsToday = (
    db
      .prepare(
        `SELECT COUNT(*) as count FROM appointments WHERE date = date('now') AND status IN ('booked', 'confirmed')`
      )
      .get() as { count: number }
  ).count;

  res.json({
    total_today: totalToday,
    avg_wait_mins: avgWait ? Math.round(avgWait) : null,
    currently_waiting: currentlyWaiting,
    appointments_today: appointmentsToday,
  });
});

export default router;
