import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

function recalcPositions() {
  db.prepare(`
    UPDATE queue SET position = (
      SELECT COUNT(*) FROM queue q2
      WHERE q2.status = 'waiting'
      AND q2.joined_at <= queue.joined_at
    )
    WHERE status = 'waiting'
  `).run();
}

router.patch('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };

  const validStatuses = ['waiting', 'called', 'seen', 'skipped'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const entry = db.prepare(`SELECT * FROM queue WHERE id = ?`).get(id) as
    | { id: number; joined_at: string; called_at: string | null; status: string }
    | undefined;

  if (!entry) {
    res.status(404).json({ error: 'Queue entry not found' });
    return;
  }

  if (status === 'seen') {
    // Log the per-patient service time (called_at → now) so the position-based
    // wait estimate stays accurate. Fall back to joined_at only if never called.
    // SQLite stores datetime('now') as "YYYY-MM-DD HH:MM:SS" (UTC, no zone marker).
    // Appending 'Z' after normalising the separator forces correct UTC parsing.
    const parseUtc = (s: string) => new Date(s.replace(' ', 'T') + 'Z');
    const serviceStartMs = entry.called_at
      ? parseUtc(entry.called_at).getTime()
      : parseUtc(entry.joined_at).getTime();
    const durationMins = (Date.now() - serviceStartMs) / 60000;
    db.prepare(`INSERT INTO session_log (duration_mins) VALUES (?)`).run(durationMins);
    db.prepare(
      `UPDATE queue SET status = ?, seen_at = datetime('now') WHERE id = ?`
    ).run(status, id);
  } else if (status === 'called') {
    db.prepare(
      `UPDATE queue SET status = ?, called_at = datetime('now') WHERE id = ?`
    ).run(status, id);
  } else {
    db.prepare(`UPDATE queue SET status = ? WHERE id = ?`).run(status, id);
  }

  recalcPositions();

  const updated = db.prepare(`SELECT * FROM queue WHERE id = ?`).get(id);
  res.json(updated);
});

router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  const entry = db.prepare(`SELECT * FROM queue WHERE id = ?`).get(id);
  if (!entry) {
    res.status(404).json({ error: 'Queue entry not found' });
    return;
  }

  db.prepare(`DELETE FROM queue WHERE id = ?`).run(id);
  recalcPositions();

  res.json({ ok: true });
});

export default router;
