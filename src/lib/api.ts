const BASE = 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('medq-token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('medq-token');
    window.location.href = '/staff/login';
    throw new Error('Unauthorized');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

// Auth
export async function login(username: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function logout(): Promise<void> {
  const res = await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// Queue
export interface QueueEntry {
  id: number;
  name: string;
  student_id: string;
  reason: string;
  status: 'waiting' | 'called' | 'seen' | 'skipped';
  position: number;
  joined_at: string;
  called_at: string | null;
  seen_at: string | null;
  estimated_wait_mins: number | null;
}

export async function getQueue(): Promise<QueueEntry[]> {
  const res = await fetch(`${BASE}/queue`);
  return handleResponse(res);
}

export async function getFullQueue(date?: string): Promise<QueueEntry[]> {
  const params = date ? `?all=true&date=${encodeURIComponent(date)}` : '?all=true';
  const res = await fetch(`${BASE}/queue${params}`);
  return handleResponse(res);
}

export async function getQueueEntry(id: number): Promise<QueueEntry | null> {
  const res = await fetch(`${BASE}/queue/${id}`);
  if (res.status === 404) return null;
  return handleResponse(res);
}

export async function joinQueue(data: {
  name: string;
  student_id: string;
  reason: string;
}): Promise<QueueEntry> {
  const res = await fetch(`${BASE}/queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getMyQueueEntries(studentId: string): Promise<QueueEntry[]> {
  const res = await fetch(`${BASE}/queue/mine?student_id=${encodeURIComponent(studentId)}`);
  return handleResponse(res);
}

export async function leaveQueue(id: number): Promise<void> {
  const res = await fetch(`${BASE}/queue/${id}/leave`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function updateQueueStatus(
  id: number,
  status: string
): Promise<QueueEntry> {
  const res = await fetch(`${BASE}/queue/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function removeFromQueue(id: number): Promise<void> {
  const res = await fetch(`${BASE}/queue/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// Appointments
export interface Appointment {
  id: number;
  name: string;
  student_id: string;
  reason: string;
  date: string;
  time_slot: string;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export async function getAppointments(date: string): Promise<Appointment[]> {
  const res = await fetch(`${BASE}/appointments?date=${date}`);
  return handleResponse(res);
}

export async function getAvailableSlots(
  date: string
): Promise<{ available: string[]; all: string[] }> {
  const res = await fetch(`${BASE}/appointments/slots?date=${date}`);
  return handleResponse(res);
}

export async function bookAppointment(data: {
  name: string;
  student_id: string;
  reason: string;
  date: string;
  time_slot: string;
}): Promise<Appointment> {
  const res = await fetch(`${BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateAppointmentStatus(
  id: number,
  status: string,
  notes?: string
): Promise<Appointment> {
  const res = await fetch(`${BASE}/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status, ...(notes !== undefined ? { notes } : {}) }),
  });
  return handleResponse(res);
}

export async function getMyAppointments(studentId: string): Promise<Appointment[]> {
  const res = await fetch(`${BASE}/appointments/mine?student_id=${encodeURIComponent(studentId)}`);
  return handleResponse(res);
}

export async function cancelAppointment(id: number): Promise<Appointment> {
  const res = await fetch(`${BASE}/appointments/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

// Stats
export interface Stats {
  total_today: number;
  avg_wait_mins: number | null;
  currently_waiting: number;
  appointments_today: number;
}

export async function getStats(date?: string): Promise<Stats> {
  const params = date ? `?date=${encodeURIComponent(date)}` : '';
  const res = await fetch(`${BASE}/stats${params}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export interface DailyStats {
  date: string;
  queue_total: number;
  queue_seen: number;
  appointments: number;
  appointments_completed: number;
}

export async function getDailyStats(): Promise<DailyStats[]> {
  const res = await fetch(`${BASE}/stats/daily`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}
