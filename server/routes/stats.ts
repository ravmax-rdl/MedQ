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
    queue_skipped: queueMap[date]?.skipped ?? 0,
    appointments: apptMap[date]?.total ?? 0,
    appointments_completed: apptMap[date]?.completed ?? 0,
  }));

  res.json(daily);
});

router.get('/', requireAuth, (req, res) => {
  const dateParam = req.query.date as string | undefined;

  const totalToday = dateParam
    ? (
        db
          .prepare(`SELECT COUNT(*) as count FROM queue WHERE date(joined_at) = ?`)
          .get(dateParam) as { count: number }
      ).count
    : (
        db
          .prepare(`SELECT COUNT(*) as count FROM queue WHERE date(joined_at) = date('now')`)
          .get() as { count: number }
      ).count;

  // session_log is written on every 'seen' action — the correct source for avg wait.
  const avgWaitRow = dateParam
    ? (db
        .prepare(
          `SELECT AVG(duration_mins) as avg FROM session_log WHERE date(completed_at) = ? AND duration_mins >= 0`
        )
        .get(dateParam) as { avg: number | null })
    : (db
        .prepare(
          `SELECT AVG(duration_mins) as avg FROM session_log WHERE completed_at >= date('now') AND duration_mins >= 0`
        )
        .get() as { avg: number | null });
  const avgWait = avgWaitRow.avg;

  const currentlyWaiting = dateParam
    ? (
        db
          .prepare(
            `SELECT COUNT(*) as count FROM queue WHERE status = 'waiting' AND date(joined_at) = ?`
          )
          .get(dateParam) as { count: number }
      ).count
    : (
        db.prepare(`SELECT COUNT(*) as count FROM queue WHERE status = 'waiting'`).get() as {
          count: number;
        }
      ).count;

  const appointmentsToday = dateParam
    ? (
        db
          .prepare(
            `SELECT COUNT(*) as count FROM appointments WHERE date = ? AND status IN ('booked','confirmed')`
          )
          .get(dateParam) as { count: number }
      ).count
    : (
        db
          .prepare(
            `SELECT COUNT(*) as count FROM appointments WHERE date = date('now') AND status IN ('booked','confirmed')`
          )
          .get() as { count: number }
      ).count;

  res.json({
    total_today: totalToday,
    avg_wait_mins: avgWait != null ? Math.round(avgWait) : null,
    currently_waiting: currentlyWaiting,
    appointments_today: appointmentsToday,
  });
});

export default router;
