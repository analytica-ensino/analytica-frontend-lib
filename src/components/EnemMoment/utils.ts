/**
 * How the Momento ENEM sections write numbers, scores and times — pt-BR, and
 * "—" for what the API could not give.
 */

// Three of them live in `utils/reportFormat`, shared with the knowledge card
// the generic reports draw from the same shapes; re-exported here so this
// module stays the one place the sections import their formatters from.
export {
  formatCount,
  MISSING_VALUE,
  formatReportScore as formatScore,
} from '../../utils/reportFormat';

import { MISSING_VALUE } from '../../utils/reportFormat';

/** A 0–100 share, up to one decimal, pt-BR: 18.3 → "18,3%"; `null` → "—". */
export const formatPercentage = (value: number | null): string =>
  value === null
    ? MISSING_VALUE
    : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

/**
 * A long duration, to the minute: 4800 → "1h 20min", 7200 → "2h",
 * 1500 → "25min". Under half a minute it falls back to seconds, so a real
 * value never reads "0min".
 */
export function formatHoursMinutes(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return MISSING_VALUE;

  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes === 0) return `${Math.round(seconds)}s`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`;
}

/**
 * A moment as the student modals write it: "24/09/2026 • 14:05h", in the
 * viewer's time zone.
 */
export function formatDateTime(iso: string | null): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return MISSING_VALUE;

  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} • ${pad(date.getHours())}:${pad(date.getMinutes())}h`;
}

/** A duration as a clock, to the second: 4805 → "01:20:05". */
export function formatClock(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return MISSING_VALUE;

  const total = Math.round(seconds);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

/**
 * A short duration, to the second: 89 → "1min 29s", 60 → "1min", 45 → "45s".
 */
export function formatMinutesSeconds(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return MISSING_VALUE;

  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const rest = totalSeconds % 60;
  if (minutes === 0) return `${rest}s`;
  return rest === 0 ? `${minutes}min` : `${minutes}min ${rest}s`;
}
