import { Router } from 'express';
import db from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.patch('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body as { status: string; notes?: string };

  const validStatuses = ['booked', 'confirmed', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const appointment = db.prepare(`SELECT * FROM appointments WHERE id = ?`).get(id);
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }

  if (notes !== undefined) {
    db.prepare(`UPDATE appointments SET status = ?, notes = ? WHERE id = ?`).run(
      status,
      notes,
      id
    );
  } else {
    db.prepare(`UPDATE appointments SET status = ? WHERE id = ?`).run(status, id);
  }

  const updated = db.prepare(`SELECT * FROM appointments WHERE id = ?`).get(id);
  res.json(updated);
});

router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  const appointment = db.prepare(`SELECT * FROM appointments WHERE id = ?`).get(id);
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }

  db.prepare(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`).run(id);

  const updated = db.prepare(`SELECT * FROM appointments WHERE id = ?`).get(id);
  res.json(updated);
});

export default router;
