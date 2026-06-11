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
 * Verifies both type parameter and data shape (absence of class/municipality-specific fields)
 */
export function isStudentsData(
  data: AggregatedOverviewData | null,
  type: OverviewAggregationType
): data is StudentsOnlyOverviewData {
  return (
    type === 'students' &&
    data !== null &&
    !('totalClasses' in data) &&
    !('totalMunicipalities' in data)
  );
}

/**
 * Type guard to check if data is ClassesOverviewData
 * Verifies both type parameter and data shape (presence of totalClasses)
 */
export function isClassesData(
  data: AggregatedOverviewData | null,
  type: OverviewAggregationType
): data is ClassesOverviewData {
  return type === 'classes' && data !== null && 'totalClasses' in data;
}

/**
 * Type guard to check if data is MunicipalitiesOverviewData
 * Verifies both type parameter and data shape (presence of totalMunicipalities)
 */
export function isMunicipalitiesData(
  data: AggregatedOverviewData | null,
  type: OverviewAggregationType
): data is MunicipalitiesOverviewData {
  return (
    type === 'municipalities' && data !== null && 'totalMunicipalities' in data
  );
}
