import dayjs from 'dayjs';
import { CalendarActivityStatus } from '../types/activities';

/**
 * Shared, timezone-safe helpers for the painel calendar + activities list.
 *
 * Deadlines (`finalDate`) are stored in UTC, and a "23:59 local" deadline is
 * persisted as "02:59Z" on the NEXT calendar day. The calendar dot, the list
 * grouping and the date filter must all key off the SAME local calendar day —
 * never the raw UTC day (`finalDate.split('T')[0]`), which can be one day ahead
 * and makes a day's own activity disappear when that day is selected.
 *
 * These live in the lib so aluno and professor share one source of truth.
 */

/** Minimal shape needed by the date helpers. */
export interface DatedActivity {
  finalDate?: string | null;
}

/**
 * Local (UTC-3 in production) calendar-day key for an activity's `finalDate`,
 * formatted as 'YYYY-MM-DD'. Locale-independent.
 */
export function getActivityDateKey(finalDate: string): string {
  return dayjs(finalDate).format('YYYY-MM-DD');
}

/**
 * Calendar dot status derived from how many days remain until the deadline.
 * `now` is injectable for testing.
 */
export function getCalendarActivityStatus(
  finalDate: string,
  now: Date = new Date()
): CalendarActivityStatus {
  const deadlineMs = new Date(finalDate).getTime();
  const nowMs = now.getTime();

  // Compare timestamps first: a deadline already in the past is OVERDUE even if
  // it passed only a few hours ago. (Math.ceil on a small negative delta would
  // round to 0 and misclassify it as NEAR_DEADLINE.)
  if (deadlineMs < nowMs) {
    return CalendarActivityStatus.OVERDUE;
  }

  const diffDays = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) {
    return CalendarActivityStatus.NEAR_DEADLINE;
  }
  return CalendarActivityStatus.IN_DEADLINE;
}

/**
 * Keep only activities whose `finalDate` (local day) is on or after `baseDate`
 * ('YYYY-MM-DD'). Activities without a `finalDate` are dropped. Comparing the
 * local day strings keeps this consistent with the calendar dots and grouping.
 */
export function filterActivitiesFromDate<T extends DatedActivity>(
  activities: T[],
  baseDate: string
): T[] {
  return activities.filter((activity) =>
    activity.finalDate
      ? getActivityDateKey(activity.finalDate) >= baseDate
      : false
  );
}
