/**
 * Format the time a student spent on a single question, the way the simulados
 * card presents it: `40"`, `2'30"`, `1h05'30"`.
 *
 * Returns `null` when there is nothing meaningful to show — the value is zero,
 * absent, negative or not finite. Zero is not the same as "answered instantly":
 * simulations answered before per-question telemetry existed carry a zero, and
 * so does a question the student never opened. Rendering `0"` there would read
 * as "the student guessed", which is the opposite of what the teacher should
 * conclude. Callers drop the segment from the label instead.
 *
 * Distinct from `formatTimeSpent` in `activityDetailsUtils`, which renders an
 * activity total as `HH:MM:SS`.
 *
 * @param seconds - Time spent in seconds
 * @returns Formatted duration, or null when there is no measured time
 *
 * @example
 * ```typescript
 * formatQuestionDuration(150); // "2'30\""
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
  // 0, otherwise it would render a misleading `0"`.
  const total = Math.floor(seconds);
  if (total <= 0) {
    return null;
  }

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const paddedSeconds = String(secs).padStart(2, '0');

  if (hours > 0) {
    return `${hours}h${String(minutes).padStart(2, '0')}'${paddedSeconds}"`;
  }

  if (minutes > 0) {
    return `${minutes}'${paddedSeconds}"`;
  }

  return `${secs}"`;
}
