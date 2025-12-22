import type {
  ActivityFilterOption,
  ActivityUserFilterData,
} from '../../../types/activitiesHistory';

/**
 * Get school options from user data for filter dropdowns
 * @param data - User filter data containing schools
 * @returns Array of filter options for schools
 */
export const getSchoolOptions = (
  data: ActivityUserFilterData | undefined
): ActivityFilterOption[] => {
  if (!data?.schools) return [];
  return data.schools.map((school) => ({
    id: school.id,
    name: school.name,
  }));
};

/**
 * Get subject options from user data for filter dropdowns
 * @param data - User filter data containing subjects
 * @returns Array of filter options for subjects
 */
export const getSubjectOptions = (
  data: ActivityUserFilterData | undefined
): ActivityFilterOption[] => {
  if (!data?.subjects) return [];
  return data.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));
};
