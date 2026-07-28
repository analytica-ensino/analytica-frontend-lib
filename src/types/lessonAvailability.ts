/**
 * Lesson Availability Types
 * Types and constants for recommended lesson availability based on dates
 */

/**
 * Lesson availability status enum
 * Used to determine if a recommended lesson is available based on start/end dates
 */
export const LESSON_AVAILABILITY = {
  /** Lesson is available for access */
  DISPONIVEL: 'DISPONIVEL',
  /** Lesson has not started yet (current date < startDate) */
  NAO_INICIADA: 'NAO_INICIADA',
  /** Lesson has expired (current date > finalDate) */
  EXPIRADA: 'EXPIRADA',
} as const;

export type LessonAvailability =
  (typeof LESSON_AVAILABILITY)[keyof typeof LESSON_AVAILABILITY];

/**
 * Result interface for lesson availability check
 */
export interface LessonAvailabilityResult {
  /** Current availability status */
  status: LessonAvailability;
  /** Parsed start date object */
  startDate: Date | null;
  /** Parsed end date object */
  endDate: Date | null;
  /** Formatted start date string for display (DD/MM/YYYY) */
  formattedStartDate: string | null;
  /**
   * Formatted start date string including the local time
   * (D de MMMM de YYYY às HH:mm). Prefer this over `formattedStartDate` when
   * telling the student when a lesson becomes available — lessons can start at
   * any time of day, and the date alone reads as "available now".
   */
  formattedStartDateTime: string | null;
  /** Formatted end date string for display (DD/MM/YYYY) */
  formattedEndDate: string | null;
}
