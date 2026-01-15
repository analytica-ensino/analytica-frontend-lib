/**
 * Lesson Availability Utilities
 * Helper functions for checking recommended lesson availability based on dates
 */

import {
  LESSON_AVAILABILITY,
  type LessonAvailability,
  type LessonAvailabilityResult,
} from '../types/lessonAvailability';
import { formatDateToBrazilian } from './activityDetailsUtils';

/**
 * Check if a date string represents a date in the past
 * @param dateString - ISO date string to check
 * @returns true if the date is in the past
 */
const isDateInPast = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return now > date;
};

/**
 * Check if a date string represents a date in the future
 * @param dateString - ISO date string to check
 * @returns true if the date is in the future
 */
const isDateInFuture = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return now < date;
};

/**
 * Check lesson availability based on start and end dates
 * @param startDate - ISO string for lesson start date (when it becomes available)
 * @param finalDate - ISO string for lesson end date (when it expires)
 * @returns LessonAvailabilityResult with status and formatted dates
 *
 * @example
 * ```typescript
 * const result = checkLessonAvailability('2024-01-01', '2024-12-31');
 * // { status: 'DISPONIVEL', startDate: Date, endDate: Date, ... }
 * ```
 */
export const checkLessonAvailability = (
  startDate: string | null,
  finalDate: string | null
): LessonAvailabilityResult => {
  const start = startDate ? new Date(startDate) : null;
  const end = finalDate ? new Date(finalDate) : null;

  let status: LessonAvailability = LESSON_AVAILABILITY.DISPONIVEL;

  if (startDate && isDateInFuture(startDate)) {
    status = LESSON_AVAILABILITY.NAO_INICIADA;
  } else if (finalDate && isDateInPast(finalDate)) {
    status = LESSON_AVAILABILITY.EXPIRADA;
  }

  return {
    status,
    startDate: start,
    endDate: end,
    formattedStartDate: startDate ? formatDateToBrazilian(startDate) : null,
    formattedEndDate: finalDate ? formatDateToBrazilian(finalDate) : null,
  };
};

/**
 * Check if a lesson is not yet available (before start date)
 * @param startDate - ISO string for lesson start date
 * @returns true if the lesson has not started yet
 *
 * @example
 * ```typescript
 * if (isLessonNotYetAvailable('2025-01-01')) {
 *   showNotAvailableModal();
 * }
 * ```
 */
export const isLessonNotYetAvailable = (startDate: string | null): boolean => {
  if (!startDate) return false;
  return isDateInFuture(startDate);
};

/**
 * Check if a lesson has expired (after end date)
 * @param finalDate - ISO string for lesson end date
 * @returns true if the lesson has expired
 *
 * @example
 * ```typescript
 * if (isLessonExpired('2023-12-31')) {
 *   showExpiredView();
 * }
 * ```
 */
export const isLessonExpired = (finalDate: string | null): boolean => {
  if (!finalDate) return false;
  return isDateInPast(finalDate);
};
