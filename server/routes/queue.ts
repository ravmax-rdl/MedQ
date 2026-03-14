import { Router } from 'express';
import db from '../db';

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

function getAvgWait(): number | null {
  const row = db
    .prepare(
      `SELECT AVG(duration_mins) as avg FROM session_log WHERE completed_at >= date('now')`
    )
    .get() as { avg: number | null };
  return row?.avg ?? null;
}

router.get('/', (req, res) => {
  const showAll = req.query.all === 'true';

  type QueueRow = {
    id: number;
    name: string;
    student_id: string;
    reason: string;
    status: string;
    position: number;
    joined_at: string;
    called_at: string | null;
    seen_at: string | null;
  };

  const entries = showAll
    ? (db
        .prepare(`SELECT * FROM queue WHERE date(joined_at) = date('now') ORDER BY joined_at ASC`)
        .all() as QueueRow[])
    : (db
        .prepare(`SELECT * FROM queue WHERE status = 'waiting' ORDER BY position ASC`)
        .all() as QueueRow[]);

  const avg = getAvgWait();

  const result = entries.map((e) => ({
    ...e,
    estimated_wait_mins: e.status === 'waiting' && avg ? Math.round(avg * e.position) : null,
  }));

  res.json(result);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const entry = db.prepare(`SELECT * FROM queue WHERE id = ?`).get(id) as
    | { id: number; name: string; student_id: string; reason: string; status: string; position: number; joined_at: string; called_at: string | null; seen_at: string | null }
    | undefined;

  if (!entry) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const avg = getAvgWait();
  res.json({
    ...entry,
    estimated_wait_mins: entry.status === 'waiting' && avg ? Math.round(avg * entry.position) : null,
  });
});

router.post('/', (req, res) => {
  const { name, student_id, reason } = req.body as {
    name: string;
    student_id: string;
    reason?: string;
  };

  if (!name || !student_id) {
    res.status(400).json({ error: 'Name and student ID are required' });
    return;
  }

  const info = db
    .prepare(`INSERT INTO queue (name, student_id, reason) VALUES (?, ?, ?)`)
    .run(name, student_id, reason || 'General');

  recalcPositions();

  const entry = db.prepare(`SELECT * FROM queue WHERE id = ?`).get(info.lastInsertRowid);
  res.status(201).json(entry);
});

export default router;
