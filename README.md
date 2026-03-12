![banner.jpg](/public/banner.jpg)

Students join the clinic queue from their phone or laptop — no more sitting in waiting rooms guessing how long is left. Staff manage the queue from a single panel.

<p align="center" ><img height="20px" src="https://ziadoua.github.io/m3-Markdown-Badges/badges/ViteJS/vitejs2.svg"> <img height="20px" src="https://ziadoua.github.io/m3-Markdown-Badges/badges/Express/express2.svg"> <img height="20px" src="https://ziadoua.github.io/m3-Markdown-Badges/badges/SQLite/sqlite2.svg"></p>

## Features

- **Student view** — join queue, see live position and estimated wait time
- **Staff view** — call next patient, mark seen, skip, remove no-shows
- **Live updates** — queue refreshes every 2 seconds, no page reload needed
- **Wait estimates** — computed from rolling average of completed sessions

---

## Tech Stack

| Layer    | Tech                               |
| -------- | ---------------------------------- |
| Frontend | Vite + React 19 + TypeScript (SWC) |
| Styling  | Tailwind CSS + Shadcn/ui           |
| Backend  | Express.js + TypeScript            |
| Database | SQLite via better-sqlite3          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

```bash
# Install pnpm if you don't have it
npm install -g pnpm
```

### Install

```bash
git clone https://github.com/your-username/medq.git
cd medq

# Install frontend dependencies
pnpm install

# Install backend dependencies
cd server && pnpm install
```

### Run

Open two terminals:

```bash
# Terminal 1 — API server (http://localhost:3001)
cd medq/server
pnpm dev

# Terminal 2 — React app (http://localhost:5173)
cd medq
pnpm dev
```

The SQLite database (`server/clinic.db`) is created automatically on first server start.

---

## Usage

### Students

1. Open `http://localhost:5173/student`
2. Enter your name, student ID, and reason for visit
3. See your live queue position and estimated wait time
4. You'll be alerted on screen when you're called

### Staff

1. Navigate to `http://localhost:5173/staff`
2. Enter the staff password: `clinic2025`
3. Use the queue panel to call, mark seen, or skip patients

---

## Project Structure

```
medq/
├── public/
├── src/                        # Frontend — Vite + React
│   ├── components/
│   │   └── ui/                 # Shadcn/ui components
│   ├── lib/
│   ├── staff/                  # Staff view (WIP)
│   ├── student/                # Student view (WIP)
├── server/                     # Backend — Express + SQLite (WIP)
```

---

## API Reference

| Method | Endpoint         | Description                                         |
| ------ | ---------------- | --------------------------------------------------- |
| GET    | `/api/queue`     | Fetch current queue with estimated waits            |
| POST   | `/api/queue`     | Join the queue                                      |
| PATCH  | `/api/queue/:id` | Update patient status (`called`, `seen`, `skipped`) |
| DELETE | `/api/queue/:id` | Remove patient from queue                           |
| GET    | `/api/stats`     | Today's session stats                               |

---

## Academic Context

Built as a group project for the University of Colombo School of Computing. The goal was to design and build a small application using AI-assisted coding that solves a realistic student-related problem.

**Problem:** Campus clinic queues at Sri Lankan universities have no visibility system. Students waste time sitting in waiting rooms with no idea how long they'll wait.

**Solution:** A lightweight, fully local virtual queue system that works on any device connected to the campus network.

---

## Contributors

| Name                | GitHub                                                           |
| ------------------- | ---------------------------------------------------------------- |
| Sandina             | [@SandinaRajapaksha](https://github.com/SandinaRajapaksha)       |
| Thulana Gunasekara  | [@thul-oshadith](https://github.com/thul-oshadith)               |
| Ravindu Liyanage    | [@ravmax-rdl](https://github.com/ravmax-rdl)                     |
| Ivishan Rathnayake  | [@IvishanR](https://github.com/IvishanR)                         |
| Nesitha             | [@Nesithasawanjith](https://github.com/Nesithasawanjith)         |
| Chathuri Rajapaksha | [@cnayanathara3-source](https://github.com/cnayanathara3-source) |
| Dinithi             | [@DiniRathnayake05](https://github.com/DiniRathnayake05)         |
| Nethmi Imasha       | [@nethmiimasha18](https://github.com/nethmiimasha18)             |
| Niduka Akalanka     | [@npaw2005](https://github.com/npaw2005)                         |
| Chaniru             | [@chanirurandiv37-dev](https://github.com/chanirurandiv37-dev)   |
