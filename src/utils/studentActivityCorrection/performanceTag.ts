import type { SimulatedPerformanceTag } from '../../components/SimulatedStudentSimulationsModal/types';

/**
 * Percentage floors of each band, as the reports classify a student.
 *
 * The absolute scale (`performanceMode=absolute`), not one relative to the
 * class: this modal describes a single student's activity, so there is no
 * cohort to compare them against.
 */
const BAND_FLOORS = {
  HIGHLIGHT: 90,
  ABOVE_AVERAGE: 70,
  BELOW_AVERAGE: 40,
} as const;

/**
 * The band the student's grade falls in, for the badge of the correction modal.
 *
 * The correction endpoint sends the stored grade (0-10) and no tag, so the
 * badge is derived here with the bands the Desempenho report uses, on the
 * percentage scale those bands are written in.
 *
 * @param score - Grade out of ten; null while the activity is ungraded
 * @returns The band, or null when there is no grade to classify
 *
 * @example
 * ```typescript
 * getCorrectionPerformanceTag(9.2); // 'HIGHLIGHT'
 * getCorrectionPerformanceTag(null); // null
 * ```
 */
export function getCorrectionPerformanceTag(
  score: number | null | undefined
): SimulatedPerformanceTag | null {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return null;
  }

  const percentage = score * 10;
  if (percentage >= BAND_FLOORS.HIGHLIGHT) return 'HIGHLIGHT';
  if (percentage >= BAND_FLOORS.ABOVE_AVERAGE) return 'ABOVE_AVERAGE';
  if (percentage >= BAND_FLOORS.BELOW_AVERAGE) return 'BELOW_AVERAGE';
  return 'ATTENTION_POINT';
}
