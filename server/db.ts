import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const db = new Database(path.join(__dirname, 'clinic.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'waiting',
    position INTEGER,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    called_at TEXT,
    seen_at TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT 'General',
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'booked',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS session_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    duration_mins REAL
  );
`);

const existing = db.prepare(`SELECT id FROM users WHERE username = 'admin'`).get();
if (!existing) {
  const hash = bcrypt.hashSync('clinic2025', 10);
  db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`).run('admin', hash);
}

const APPOINTMENT_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
] as const;

const FIRST_NAMES = [
  'Aisha',
  'Daniel',
  'Maya',
  'Leo',
  'Sofia',
  'Noah',
  'Amara',
  'Ethan',
  'Nora',
  'Zayn',
  'Chloe',
  'Ibrahim',
  'Lina',
  'Marcus',
  'Priya',
  'Sam',
  'Hana',
  'Omar',
  'Rina',
  'Jonah',
] as const;

const LAST_NAMES = [
  'Patel',
  'Smith',
  'Nguyen',
  'Okoro',
  'Khan',
  'Garcia',
  'Wong',
  'Ali',
  'Brown',
  'Kim',
] as const;

const REASONS = [
  'General',
  'Flu symptoms',
  'Headache',
  'Follow-up',
  'Prescription refill',
  'Allergy',
  'Minor injury',
] as const;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toSqlDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function toSqlDateTime(date: Date): string {
  return `${toSqlDate(date)} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function makeStudentId(dayIndex: number, entryIndex: number): string {
  return `S${String(240000 + dayIndex * 80 + entryIndex).padStart(6, '0')}`;
}

function makeName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
}

function seedTwoWeeksIfEmpty() {
  const queueCount = (db.prepare(`SELECT COUNT(*) as count FROM queue`).get() as { count: number })
    .count;
  const appointmentCount = (
    db.prepare(`SELECT COUNT(*) as count FROM appointments`).get() as { count: number }
  ).count;

  if (queueCount > 0 || appointmentCount > 0) {
    return;
  }

  const insertQueue = db.prepare(
    `INSERT INTO queue (name, student_id, reason, status, position, joined_at, called_at, seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertAppointment = db.prepare(
    `INSERT INTO appointments (name, student_id, reason, date, time_slot, status, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertSessionLog = db.prepare(
    `INSERT INTO session_log (completed_at, duration_mins) VALUES (?, ?)`
  );

  const recalcPositions = db.prepare(`
    UPDATE queue SET position = (
      SELECT COUNT(*) FROM queue q2
      WHERE q2.status = 'waiting'
      AND q2.joined_at <= queue.joined_at
    )
    WHERE status = 'waiting'
  `);

  const seedInTx = db.transaction(() => {
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      day.setUTCDate(day.getUTCDate() - dayOffset);

      const dayIndex = 13 - dayOffset;
      const dayString = toSqlDate(day);

      const queueEntries = 8 + (dayIndex % 6) + (dayIndex % 2 === 0 ? 2 : 0);
      const queueStatusesToday: Array<'waiting' | 'called' | 'seen' | 'skipped'> = [
        'waiting',
        'waiting',
        'called',
        'seen',
        'seen',
        'skipped',
        'seen',
        'called',
        'waiting',
        'seen',
      ];
      const queueStatusesHistory: Array<'waiting' | 'called' | 'seen' | 'skipped'> = [
        'seen',
        'seen',
        'seen',
        'skipped',
        'seen',
        'called',
        'seen',
        'skipped',
      ];

      for (let entryIndex = 0; entryIndex < queueEntries; entryIndex++) {
        const joinedAt = new Date(day);
        joinedAt.setUTCHours(8, 0, 0, 0);
        joinedAt.setUTCMinutes(joinedAt.getUTCMinutes() + entryIndex * 17 + (dayIndex % 3) * 4);

        const statusPool = dayOffset === 0 ? queueStatusesToday : queueStatusesHistory;
        const status = statusPool[(entryIndex + dayIndex) % statusPool.length];

        const calledAt = new Date(joinedAt);
        calledAt.setUTCMinutes(calledAt.getUTCMinutes() + 8 + ((entryIndex + dayIndex) % 14));

        const seenAt = new Date(calledAt);
        seenAt.setUTCMinutes(seenAt.getUTCMinutes() + 7 + ((entryIndex * 3 + dayIndex) % 19));

        const nameIndex = dayIndex * 30 + entryIndex;
        const name = makeName(nameIndex);
        const studentId = makeStudentId(dayIndex, entryIndex);
        const reason = REASONS[(entryIndex + dayIndex) % REASONS.length];

        insertQueue.run(
          name,
          studentId,
          reason,
          status,
          null,
          toSqlDateTime(joinedAt),
          status === 'called' || status === 'seen' ? toSqlDateTime(calledAt) : null,
          status === 'seen' ? toSqlDateTime(seenAt) : null
        );

        if (status === 'seen') {
          const durationMins = 8 + ((dayIndex * 5 + entryIndex * 3) % 20);
          insertSessionLog.run(toSqlDateTime(seenAt), durationMins);
        }
      }

      const appointmentsForDay = 6 + (dayIndex % 7);
      const appointmentStatuses: Array<'booked' | 'confirmed' | 'completed' | 'cancelled'> =
        dayOffset === 0
          ? ['booked', 'confirmed', 'completed', 'cancelled', 'booked', 'confirmed', 'completed']
          : [
              'completed',
              'completed',
              'confirmed',
              'cancelled',
              'booked',
              'completed',
              'cancelled',
            ];

      for (let entryIndex = 0; entryIndex < appointmentsForDay; entryIndex++) {
        const status = appointmentStatuses[(entryIndex + dayIndex) % appointmentStatuses.length];
        const slot = APPOINTMENT_SLOTS[(entryIndex * 2 + dayIndex) % APPOINTMENT_SLOTS.length];

        const createdAt = new Date(day);
        createdAt.setUTCDate(createdAt.getUTCDate() - (1 + (entryIndex % 2)));
        createdAt.setUTCHours(7 + (entryIndex % 5), 15, 0, 0);

        const nameIndex = 500 + dayIndex * 30 + entryIndex;
        const name = makeName(nameIndex);
        const studentId = makeStudentId(dayIndex + 20, entryIndex);
        const reason = REASONS[(entryIndex + dayIndex + 2) % REASONS.length];

        const notes =
          status === 'completed'
            ? 'Consultation completed.'
            : status === 'cancelled'
              ? 'Cancelled by student.'
              : status === 'confirmed'
                ? 'Checked in and confirmed.'
                : null;

        insertAppointment.run(
          name,
          studentId,
          reason,
          dayString,
          slot,
          status,
          notes,
          toSqlDateTime(createdAt)
        );
      }
    }

    recalcPositions.run();
  });

  seedInTx();
}

seedTwoWeeksIfEmpty();

export default db;
