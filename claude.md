# CLAUDE.md — MedQ

This file is the source of truth for any AI agent working on this codebase. Read it fully before writing any code.

---

## Project Summary

**MedQ** is a local-first virtual clinic queue and appointment booking system for university campuses. Students join a walk-in queue or book appointments from their browser; staff manage both from a protected panel. No cloud, no external APIs.

---

## Repo Structure

```
medq/                              # root = frontend
├── src/
│   ├── student/                   # all student-facing pages + components
│   │   ├── pages/
│   │   │   ├── StudentHome.tsx    # queue join + live board
│   │   │   └── Appointments.tsx   # book / view appointments
│   │   └── components/
│   │       ├── QueueForm.tsx
│   │       ├── QueueBoard.tsx
│   │       ├── WaitEstimate.tsx
│   │       ├── AppointmentForm.tsx
│   │       └── AppointmentList.tsx
│   ├── staff/                     # all staff-facing pages + components
│   │   ├── pages/
│   │   │   ├── StaffLogin.tsx     # username + password login form
│   │   │   ├── StaffDashboard.tsx # queue management + stats
│   │   │   └── StaffAppointments.tsx # appointment management
│   │   └── components/
│   │       ├── StaffPanel.tsx
│   │       ├── AppointmentCalendar.tsx
│   │       └── StatsBar.tsx
│   ├── hooks/
│   │   ├── useQueue.ts            # polls GET /api/queue every 2s
│   │   ├── useAuth.ts             # reads/writes auth state from localStorage
│   │   └── useAppointments.ts     # polls GET /api/appointments
│   ├── lib/
│   │   ├── api.ts                 # all fetch() wrappers
│   │   └── theme.ts               # dark mode helpers
│   ├── components/
│   │   └── ui/                    # shadcn/ui components live here
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── server/                        # backend
    ├── routes/
    │   ├── auth.ts                # POST /auth/login, POST /auth/logout
    │   ├── queue.ts               # GET + POST /queue
    │   ├── manage.ts              # PATCH + DELETE /queue/:id
    │   ├── appointments.ts        # GET + POST /appointments
    │   ├── manage-appointments.ts # PATCH + DELETE /appointments/:id
    │   └── stats.ts               # GET /stats
    ├── middleware/
    │   └── requireAuth.ts         # session token middleware
    ├── db.ts                      # SQLite init + connection singleton
    ├── index.ts                   # Express entry
    ├── clinic.db                  # auto-generated, gitignored
    └── package.json
```

---

## Stack

| Layer           | Choice                             | Notes                              |
| --------------- | ---------------------------------- | ---------------------------------- |
| Frontend        | Vite + React 19 + TypeScript (SWC) | Root of repo                       |
| Styling         | Tailwind CSS v4 + Shadcn/ui        | Dark mode via `class` strategy     |
| Routing         | react-router-dom v7                | See routes below                   |
| Backend         | Express.js + TypeScript            | Lives in `/server`                 |
| Database        | better-sqlite3                     | Synchronous, no async/await needed |
| Auth            | Session tokens in SQLite           | Simple, no JWT or auth libraries   |
| Package manager | pnpm                               | Both root and `/server` use pnpm   |

---

## Running the Project

```bash
# Terminal 1 — backend
cd server
pnpm dev      # http://localhost:3001

# Terminal 2 — frontend
cd ..
pnpm dev      # http://localhost:5173
```

`clinic.db` is auto-created at `server/clinic.db` on first server start. A default staff account is seeded on first run:

```
username: admin
password: clinic2025
```

---

## Dark Mode

- Tailwind `darkMode: 'class'` strategy
- Toggle stored in `localStorage` under key `medq-theme`
- On app load, read `localStorage` and apply `dark` class to `<html>` before React renders (in `index.html` inline script to avoid flash)
- `theme.ts` exports `toggleTheme()` and `getTheme()` helpers
- All components must support both light and dark variants using Tailwind `dark:` classes
- Shadcn/ui components inherit dark mode automatically via the `class` strategy

```html
<!-- index.html — before </head> -->
<script>
  const theme = localStorage.getItem('medq-theme');
  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

---

## UI Guidelines

- **Style:** Modern, minimal, clinical. Think Linear or Vercel's dashboard aesthetic — not colourful, not playful.
- **Font:** Use `Geist`. No custom font installs.
- **Colour:** Neutral greys with a single blue accent (`sky-500` / `sky-600`). Avoid bright colours except for status badges.
- **Status badges:**
  - `waiting` → grey
  - `called` → blue
  - `seen` → green
  - `skipped` → orange
  - `cancelled` → red
- **Spacing:** Generous padding. Use Shadcn `Card` as the primary container everywhere.
- **Density:** Tables should be compact but readable. Use `text-sm` for table rows.
- **Animations:** Subtle only. Use Shadcn's built-in transitions. No custom animation libraries.
- **Responsiveness:** Must look good at 1280px+. Mobile is not a priority but should not break.

---

## Database Schema

All tables auto-created by `server/db.ts` on startup. Use `CREATE TABLE IF NOT EXISTS` only — no migrations.

```sql
-- Staff accounts
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  username     TEXT    NOT NULL UNIQUE,
  password     TEXT    NOT NULL,    -- bcrypt hash
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Session tokens for staff auth
CREATE TABLE IF NOT EXISTS sessions (
  token        TEXT    PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at   TEXT    NOT NULL
);

-- Walk-in queue
CREATE TABLE IF NOT EXISTS queue (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  student_id   TEXT    NOT NULL,
  reason       TEXT    NOT NULL DEFAULT 'General',
  status       TEXT    NOT NULL DEFAULT 'waiting',
  position     INTEGER,
  joined_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  called_at    TEXT,
  seen_at      TEXT
);

-- status: 'waiting' | 'called' | 'seen' | 'skipped'

-- Appointments (booked in advance)
CREATE TABLE IF NOT EXISTS appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  student_id   TEXT    NOT NULL,
  reason       TEXT    NOT NULL DEFAULT 'General',
  date         TEXT    NOT NULL,   -- YYYY-MM-DD
  time_slot    TEXT    NOT NULL,   -- HH:MM (e.g. '09:00')
  status       TEXT    NOT NULL DEFAULT 'booked',
  notes        TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- status: 'booked' | 'confirmed' | 'completed' | 'cancelled'

-- Session log for wait time estimates
CREATE TABLE IF NOT EXISTS session_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  completed_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  duration_mins REAL
);
```

### Seed default admin on startup

```typescript
// In db.ts, after table creation:
import bcrypt from 'bcryptjs';

const existing = db.prepare(`SELECT id FROM users WHERE username = 'admin'`).get();
if (!existing) {
  const hash = bcrypt.hashSync('clinic2025', 10);
  db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`).run('admin', hash);
}
```

### Position recalculation

Run after every queue mutation:

```sql
UPDATE queue SET position = (
  SELECT COUNT(*) FROM queue q2
  WHERE q2.status = 'waiting'
  AND q2.joined_at <= queue.joined_at
)
WHERE status = 'waiting';
```

### Session logging

When a patient is marked `seen`:

```typescript
const durationMins = (Date.now() - new Date(entry.joined_at).getTime()) / 60000;
db.prepare(`INSERT INTO session_log (duration_mins) VALUES (?)`).run(durationMins);
```

---

## Authentication

Staff auth uses session tokens stored in SQLite. No JWT, no Passport, no auth libraries.

### Login flow

1. `POST /api/auth/login` with `{ username, password }`
2. Server fetches user, compares password with `bcrypt.compare`
3. If valid, generate a random token (`crypto.randomUUID()`), store in `sessions` table with 8-hour expiry
4. Return `{ token }` — client stores in `localStorage` as `medq-token`

### Protected routes

All staff API routes use `requireAuth` middleware:

```typescript
// server/middleware/requireAuth.ts
export function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const session = db
    .prepare(
      `
    SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')
  `
    )
    .get(token);

  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
```

### Client auth

`useAuth` hook reads `medq-token` from `localStorage`. All staff API calls include:

```typescript
headers: {
  Authorization: `Bearer ${token}`;
}
```

If any staff API returns 401, clear token and redirect to `/staff/login`.

---

## API Routes

Base: `http://localhost:3001/api`

### Auth

| Method | Route          | Auth  | Body                     | Description                    |
| ------ | -------------- | ----- | ------------------------ | ------------------------------ |
| POST   | `/auth/login`  | None  | `{ username, password }` | Returns `{ token }` on success |
| POST   | `/auth/logout` | Staff | —                        | Deletes session token          |

### Queue

| Method | Route        | Auth  | Body                           | Description                                                 |
| ------ | ------------ | ----- | ------------------------------ | ----------------------------------------------------------- |
| GET    | `/queue`     | None  | —                              | All waiting entries sorted by position, with estimated wait |
| POST   | `/queue`     | None  | `{ name, student_id, reason }` | Join queue, recalculate positions                           |
| PATCH  | `/queue/:id` | Staff | `{ status }`                   | Update status, recalculate, log if `seen`                   |
| DELETE | `/queue/:id` | Staff | —                              | Remove entry, recalculate positions                         |

### Appointments

| Method | Route                 | Auth  | Body                                            | Description                                          |
| ------ | --------------------- | ----- | ----------------------------------------------- | ---------------------------------------------------- |
| GET    | `/appointments`       | None  | `?date=YYYY-MM-DD`                              | Appointments for a given date. Returns booked slots. |
| GET    | `/appointments/slots` | None  | `?date=YYYY-MM-DD`                              | Available time slots for a given date                |
| POST   | `/appointments`       | None  | `{ name, student_id, reason, date, time_slot }` | Book appointment                                     |
| PATCH  | `/appointments/:id`   | Staff | `{ status, notes? }`                            | Update appointment status                            |
| DELETE | `/appointments/:id`   | Staff | —                                               | Cancel appointment                                   |

### Stats

| Method | Route    | Auth  | Description                                                             |
| ------ | -------- | ----- | ----------------------------------------------------------------------- |
| GET    | `/stats` | Staff | `{ total_today, avg_wait_mins, currently_waiting, appointments_today }` |

### Appointment slots

Available time slots are fixed: `09:00` to `16:00` in 30-minute increments. A slot is unavailable if already booked with status `booked` or `confirmed`. Max 1 booking per slot.

```typescript
const ALL_SLOTS = [
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
];
```

### Wait estimate (computed per request)

```typescript
const avgRow = db
  .prepare(
    `
  SELECT AVG(duration_mins) as avg FROM session_log
  WHERE completed_at >= date('now')
`
  )
  .get() as { avg: number | null };

const avg = avgRow?.avg ?? null;
entry.estimated_wait_mins = avg ? Math.round(avg * entry.position) : null;
```

---

## Frontend Routes

| Path                  | Component           | Auth  |
| --------------------- | ------------------- | ----- |
| `/`                   | `StudentHome`       | None  |
| `/appointments`       | `Appointments`      | None  |
| `/staff/login`        | `StaffLogin`        | None  |
| `/staff`              | `StaffDashboard`    | Staff |
| `/staff/appointments` | `StaffAppointments` | Staff |

Protect staff routes with a `<RequireAuth>` wrapper component that checks `useAuth()` and redirects to `/staff/login` if not authenticated.

---

## Frontend Behaviour

### Student queue flow

1. Land on `/` → show `QueueForm`
2. Submit → `POST /api/queue` → store returned `id` in `localStorage` as `medq-queue-id` → show `QueueBoard`
3. `QueueBoard` polls every 2s, highlights own row, shows `WaitEstimate`
4. If own status is `called` → show prominent `Alert` banner at top of page

### Student appointment flow

1. Navigate to `/appointments`
2. Pick a date from a date picker → fetch available slots from `GET /api/appointments/slots?date=`
3. Select a slot → fill in name, student ID, reason → submit
4. After booking, show confirmation with date/time and option to book another

### Staff login flow

1. `/staff/login` → username + password form
2. `POST /api/auth/login` → on success store token, redirect to `/staff`
3. On 401 → show inline error message

### Staff queue flow

1. `StaffDashboard` shows `StatsBar` + full queue table
2. Actions: **Call**, **Seen**, **Skip**, **Remove** per row
3. Polls every 2s

### Staff appointments flow

1. `StaffAppointments` shows a day view — date picker at top, list of appointments for that day
2. Actions per appointment: **Confirm**, **Complete**, **Cancel**
3. Shows student name, ID, reason, time slot, status badge

---

## Hard Rules

- **No WebSockets** — polling only, 2s interval
- **No ORM** — raw better-sqlite3 SQL only
- **No external API calls** from either client or server
- **No auth libraries** except `bcryptjs` for password hashing
- **TypeScript everywhere** — no `.js` files in `src/` or `server/`
- **CORS enabled** on Express for `http://localhost:5173`
- **`clinic.db` gitignored** — never commit it
- **No migrations** — `CREATE TABLE IF NOT EXISTS` only
- **pnpm only** — no `package-lock.json` or `yarn.lock`
- **Shadcn/ui only** for UI components — no additional component libraries
- **Dark mode required** on every page and component — use `dark:` Tailwind classes throughout

---

## Key Packages

**Frontend (root `package.json`)**

```
react@19, react-dom@19, react-router-dom@7
vite, @vitejs/plugin-react-swc
typescript
tailwindcss@4, @tailwindcss/vite
shadcn/ui components as needed
```

**Backend (`server/package.json`)**

```
express, cors
better-sqlite3
bcryptjs
typescript, tsx
@types/express, @types/cors, @types/better-sqlite3, @types/bcryptjs, @types/node
```

---

## Out of Scope

- SMS / email / push notifications
- Multi-clinic support
- Docker, Vercel, or any deployment config
- Unit or integration tests
- Any database other than SQLite
