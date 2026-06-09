/** Zero-pad a number to two digits */
const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Split an ISO datetime into the local `date` (YYYY-MM-DD) + `time` (HH:MM)
 * pair expected by `DateTimeInput`. Mirrors the local interpretation used by
 * `buildISODateTime` so the round-trip is stable.
 *
 * @param iso - ISO datetime string (or null/undefined)
 * @returns object with local `date` and `time` (empty strings when absent/invalid)
 */
export const splitDateTime = (
  iso?: string | null
): { date: string; time: string } => {
  if (!iso) return { date: '', time: '' };
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '' };
  return {
    date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
    time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
  };
};
