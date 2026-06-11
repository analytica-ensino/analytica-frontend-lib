import type { OverviewAggregationType } from '../components/SimulatedStudentsOverview/types';
import { PROFILE_ROLES } from '../types/chat';

/**
 * Get the overview aggregation type based on user profile
 *
 * - GENERAL_MANAGER: students (default)
 * - REGIONAL_MANAGER: municipalities (aggregated by city)
 * - UNIT_MANAGER: classes (aggregated by turma)
 * - TEACHER: students (default)
 *
 * @param profileName - The user's profile name
 * @returns The aggregation type to use
 */
export function getAggregationTypeByProfile(
  profileName: string | undefined
): OverviewAggregationType {
  switch (profileName) {
    case PROFILE_ROLES.UNIT_MANAGER:
      return 'classes';
    case PROFILE_ROLES.REGIONAL_MANAGER:
      return 'municipalities';
    case PROFILE_ROLES.GENERAL_MANAGER:
    case PROFILE_ROLES.TEACHER:
    default:
      return 'students';
  }
}

/**
 * Check if the profile should use aggregated overview (classes or municipalities)
 *
 * @param profileName - The user's profile name
 * @returns True if the profile should use aggregated overview
 */
export function shouldUseAggregatedOverview(
  profileName: string | undefined
): boolean {
  return (
    profileName === PROFILE_ROLES.UNIT_MANAGER ||
    profileName === PROFILE_ROLES.REGIONAL_MANAGER
  );
}
