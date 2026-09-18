import { formatTimeSpent } from './activityDetailsUtils';

/**
 * Format the time a student spent on a single question, the way the relatórios
 * of simulados present it: `HH:MM:SS` (`00:00:40`, `00:02:30`, `01:05:30`).
 *
 * The clock format is shared with `formatTimeSpent`, which renders the activity
 * and simulado totals — a question row and the "Tempo total" card above it read
 * the same way instead of each inventing its own notation.
 *
 * What this adds on top is the "not measured" rule: it returns `null` when
 * there is nothing meaningful to show — the value is zero, absent, negative or
 * not finite. Zero is not the same as "answered instantly": simulations
 * answered before per-question telemetry existed carry a zero, and so does a
 * question the student never opened. Rendering `00:00:00` there would read as
 * "the student guessed", which is the opposite of what the teacher should
 * conclude. Callers drop the whole segment from the row instead.
 *
 * @param seconds - Time spent in seconds
 * @returns Formatted duration in `HH:MM:SS`, or null when there is no measured time
 *
 * @example
 * ```typescript
 * formatQuestionDuration(150); // "00:02:30"
 * formatQuestionDuration(0);   // null
 * ```
 */
export function formatQuestionDuration(
  seconds: number | null | undefined
): string | null {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return null;
  }

  // Truncate before the zero check, not after: a fractional value below one
  // second floors to 0 and must take the same "not measured" path as a plain
  // 0, otherwise it would render a misleading `00:00:00`.
  const total = Math.floor(seconds);
  if (total <= 0) {
    return null;
  }

  return formatTimeSpent(total);
}
