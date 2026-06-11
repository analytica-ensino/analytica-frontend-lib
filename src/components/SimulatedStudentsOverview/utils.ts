import type {
  AggregatedOverviewData,
  StudentsOnlyOverviewData,
  ClassesOverviewData,
  MunicipalitiesOverviewData,
  OverviewAggregationType,
} from './types';

/**
 * Extract error message from an unknown error
 *
 * @param err - The caught error
 * @param fallbackMessage - Default message if error is not an Error instance
 * @returns The error message string
 */
export function getErrorMessage(err: unknown, fallbackMessage: string): string {
  return err instanceof Error ? err.message : fallbackMessage;
}

/**
 * Type guard to check if data is StudentsOnlyOverviewData
 */
export function isStudentsData(
  data: AggregatedOverviewData | null,
  type: OverviewAggregationType
): data is StudentsOnlyOverviewData {
  return type === 'students' && data !== null;
}

/**
 * Type guard to check if data is ClassesOverviewData
 */
export function isClassesData(
  data: AggregatedOverviewData | null,
  type: OverviewAggregationType
): data is ClassesOverviewData {
  return type === 'classes' && data !== null;
}

/**
 * Type guard to check if data is MunicipalitiesOverviewData
 */
export function isMunicipalitiesData(
  data: AggregatedOverviewData | null,
  type: OverviewAggregationType
): data is MunicipalitiesOverviewData {
  return type === 'municipalities' && data !== null;
}
