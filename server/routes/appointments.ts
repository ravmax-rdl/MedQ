import { Router } from 'express';
import db from '../db';

const router = Router();

const ALL_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00',
];

router.get('/slots', (req, res) => {
  const { date } = req.query as { date?: string };

  if (!date) {
    res.status(400).json({ error: 'Date is required' });
    return;
  }

  const booked = db
    .prepare(
      `SELECT time_slot FROM appointments WHERE date = ? AND status IN ('booked', 'confirmed')`
    )
    .all(date) as Array<{ time_slot: string }>;

  const bookedSlots = new Set(booked.map((b) => b.time_slot));
  const available = ALL_SLOTS.filter((slot) => !bookedSlots.has(slot));

  res.json({ available, all: ALL_SLOTS });
});

router.get('/', (req, res) => {
  const { date } = req.query as { date?: string };

  if (!date) {
    res.status(400).json({ error: 'Date is required' });
    return;
  }

  const appointments = db
    .prepare(`SELECT * FROM appointments WHERE date = ? ORDER BY time_slot ASC`)
    .all(date);

  res.json(appointments);
});

router.post('/', (req, res) => {
  const { name, student_id, reason, date, time_slot } = req.body as {
    name: string;
    student_id: string;
    reason?: string;
    date: string;
    time_slot: string;
  };

  if (!name || !student_id || !date || !time_slot) {
    res.status(400).json({ error: 'Name, student ID, date, and time slot are required' });
    return;
  }

  if (!ALL_SLOTS.includes(time_slot)) {
    res.status(400).json({ error: 'Invalid time slot' });
    return;
  }

  const existing = db
    .prepare(
      `SELECT id FROM appointments WHERE date = ? AND time_slot = ? AND status IN ('booked', 'confirmed')`
    )
    .get(date, time_slot);

  if (existing) {
    res.status(409).json({ error: 'This time slot is already booked' });
    return;
  }

  const info = db
    .prepare(
      `INSERT INTO appointments (name, student_id, reason, date, time_slot) VALUES (?, ?, ?, ?, ?)`
    )
    .run(name, student_id, reason || 'General', date, time_slot);

  const appointment = db
    .prepare(`SELECT * FROM appointments WHERE id = ?`)
    .get(info.lastInsertRowid);

  res.status(201).json(appointment);
});

export default router;
