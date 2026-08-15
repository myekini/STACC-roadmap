import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Local (not UTC) calendar-day key, e.g. "2026-08-15" — used for streak and
 * activity-heatmap bucketing so a learner's day boundary matches their own
 * clock, not UTC's. `date.toISOString().slice(0, 10)` silently misattributes
 * activity near midnight for anyone not in UTC. */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
