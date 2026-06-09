import {
  getActivityDateKey,
  getCalendarActivityStatus,
  filterActivitiesFromDate,
} from './calendarActivityUtils';
import { CalendarActivityStatus } from '../types/activities';

/**
 * Local 'YYYY-MM-DD' for an ISO string using native Date getters. Lets the
 * assertions verify the helpers use LOCAL time without depending on the
 * runner's timezone (jest does not reliably honor an in-file TZ override).
 * The strong, TZ-pinned regression for the UTC-vs-local bug lives in the
 * aluno/professor app tests.
 */
const localDay = (iso: string): string => {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const nextDay = (key: string): string => {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + 1);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

describe('calendarActivityUtils', () => {
  // 02:59Z is 23:59 of the previous day in UTC-3 — the case that breaks when the
  // raw UTC day (finalDate.split('T')[0]) is used instead of the local day.
  const earlyUtcIso = '2026-06-14T02:59:00.000Z';

  describe('getActivityDateKey', () => {
    it('uses the local calendar day, not the raw UTC day', () => {
      // In any non-UTC timezone this differs from earlyUtcIso.split('T')[0]
      // (the UTC day), guarding against a regression to the raw-UTC key.
      expect(getActivityDateKey(earlyUtcIso)).toBe(localDay(earlyUtcIso));
    });
  });

  describe('getCalendarActivityStatus', () => {
    const now = new Date('2026-06-08T12:00:00.000Z');

    it('returns OVERDUE for past deadlines', () => {
      expect(getCalendarActivityStatus('2026-06-05T12:00:00.000Z', now)).toBe(
        CalendarActivityStatus.OVERDUE
      );
    });

    it('returns OVERDUE for a deadline that passed only a few hours ago', () => {
      // Guards the off-by-up-to-24h bug: Math.ceil on a small negative delta
      // rounded to 0 and misclassified a just-expired deadline as NEAR_DEADLINE.
      expect(getCalendarActivityStatus('2026-06-08T09:00:00.000Z', now)).toBe(
        CalendarActivityStatus.OVERDUE
      );
    });

    it('returns NEAR_DEADLINE within 3 days', () => {
      expect(getCalendarActivityStatus('2026-06-10T12:00:00.000Z', now)).toBe(
        CalendarActivityStatus.NEAR_DEADLINE
      );
    });

    it('returns IN_DEADLINE beyond 3 days', () => {
      expect(getCalendarActivityStatus('2026-06-20T12:00:00.000Z', now)).toBe(
        CalendarActivityStatus.IN_DEADLINE
      );
    });
  });

  describe('filterActivitiesFromDate', () => {
    const activities = [
      { id: 'a', finalDate: earlyUtcIso },
      { id: 'b', finalDate: '2026-06-20T12:00:00.000Z' },
      { id: 'c', finalDate: null },
    ];

    it('includes an activity on its own local day and drops null finalDate', () => {
      const result = filterActivitiesFromDate(
        activities,
        localDay(earlyUtcIso)
      );
      expect(result.map((x) => x.id)).toEqual(['a', 'b']);
    });

    it('excludes an activity when baseDate is the day after its local day', () => {
      const result = filterActivitiesFromDate(
        activities,
        nextDay(localDay(earlyUtcIso))
      );
      expect(result.map((x) => x.id)).toEqual(['b']);
    });
  });
});
