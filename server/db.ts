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

export default db;
