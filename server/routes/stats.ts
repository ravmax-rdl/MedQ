import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  const totalToday = (
    db
      .prepare(`SELECT COUNT(*) as count FROM queue WHERE date(joined_at) = date('now')`)
      .get() as { count: number }
  ).count;

  const avgWait = (
    db
      .prepare(
        `SELECT AVG(duration_mins) as avg FROM session_log WHERE completed_at >= date('now')`
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
