![banner.jpg](/public/banner.jpg)

<p align="center">MedQ is a virtual clinic queue and appointment booking system designed specifically for University Medical Centers. It streamlines patient flow, respects student privacy, and eliminates the guesswork of physical waiting rooms.</p>

<p align="center" ><img height="20px" src="https://ziadoua.github.io/m3-Markdown-Badges/badges/ViteJS/vitejs2.svg"> <img height="20px" src="https://ziadoua.github.io/m3-Markdown-Badges/badges/Express/express2.svg"> <img height="20px" src="https://ziadoua.github.io/m3-Markdown-Badges/badges/SQLite/sqlite2.svg"></p>

## Features

### Student Portal
- **Live Queue Board:** Join the queue by providing ID/reason and immediately see your position on a live-updating board.
- **Dynamic Wait Estimates:** Displays an estimated wait time actively learned from recent appointment durations.
- **Appointment Booking:** A simple date and time picker allowing students to reserve available 30-minute time slots in advance.
- **Smart Alerts:** Prominent live banners alert students the moment their status changes to "Called."

### Staff Dashboard
- **Live Queue Management:** Advance the walk-in queue with single-click actions (*Call*, *Seen*, *Skip*, *Remove*).
- **Appointment Day-View:** Track, confirm, complete, or cancel pre-booked appointments using a calendar-based interface.
- **Daily Statistics:** Real-time metrics tracking patients seen, currently waiting count, and average wait times.

---

## Technical Architecture

| Layer    | Technology                         | Description                                            |
| -------- | ---------------------------------- | ------------------------------------------------------ |
| Frontend | Vite + React 19 + TypeScript (SWC) | Fast, responsive UI with built-in dark mode support.   |
| Styling  | Tailwind CSS v4 + Shadcn/ui        | Clinical, minimalist design system.                    |
| Backend  | Express.js + TypeScript            | Synchronous, lightweight local server.                 |
| Database | better-sqlite3 (SQLite)            | Raw SQL queries for maximum local performance.         |
| Auth     | Custom Session Tokens              | Secure SQLite session storage (no JWT/heavy packages). |

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
