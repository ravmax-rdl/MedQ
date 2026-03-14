import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a SQLite datetime string (UTC, no timezone marker) as a proper UTC Date.
 * SQLite stores datetime('now') as "YYYY-MM-DD HH:MM:SS" — JavaScript's Date
 * constructor treats strings without a timezone designator as LOCAL time, which
 * causes duration calculations to be off by the local UTC offset.
 */
export function parseDbDate(sqliteDate: string): Date {
  return new Date(sqliteDate.replace(' ', 'T') + 'Z')
}
