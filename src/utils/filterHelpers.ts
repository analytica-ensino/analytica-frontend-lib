import type { ActivityFilterOption } from '../types/activitiesHistory';

/**
 * Generic user institution data structure
 * Matches the structure from GET /user/me endpoint
 */
export interface UserInstitutionData {
  school?: { id: string; name: string };
  schoolYear?: { id: string; name: string };
  class?: { id: string; name: string };
}

/**
 * Generic subject teacher topic class structure
 */
export interface SubTeacherTopicClassData {
  subject?: { id: string; name: string };
  class?: { id: string; name: string };
}

/**
 * Generic user data structure for filter extraction
 * Can be extended by consuming projects
 */
export interface UserFilterSourceData {
  userInstitutions?: UserInstitutionData[];
  subTeacherTopicClasses?: SubTeacherTopicClassData[];
}

/**
 * Extract unique school options from user data
 * Uses Map for deduplication to handle multiple institutions with same school
 *
 * @param userData - User data from /user/me endpoint
 * @returns Array of unique schools sorted by name
 *
 * @example
 * ```typescript
 * const userData = useUserStore(state => state.data);
 * const schools = getSchoolOptionsFromUserData(userData);
 * // Returns: [{ id: '1', name: 'Escola A' }, { id: '2', name: 'Escola B' }]
 * ```
 */
export const getSchoolOptionsFromUserData = (
  userData: UserFilterSourceData | null | undefined
): ActivityFilterOption[] => {
  if (!userData?.userInstitutions) {
    return [];
  }

  const schoolsMap = new Map<string, ActivityFilterOption>();

  for (const userInst of userData.userInstitutions) {
    if (userInst.school?.id && userInst.school?.name) {
      schoolsMap.set(userInst.school.id, {
        id: userInst.school.id,
        name: userInst.school.name,
      });
    }
  }

  return Array.from(schoolsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );
};

/**
 * Extract unique subject options from user data
 * Uses Map for deduplication
 *
 * @param userData - User data from /user/me endpoint
 * @returns Array of unique subjects sorted by name
 *
 * @example
 * ```typescript
 * const userData = useUserStore(state => state.data);
 * const subjects = getSubjectOptionsFromUserData(userData);
 * // Returns: [{ id: '1', name: 'Matemática' }, { id: '2', name: 'Português' }]
 * ```
 */
export const getSubjectOptionsFromUserData = (
  userData: UserFilterSourceData | null | undefined
): ActivityFilterOption[] => {
  if (!userData?.subTeacherTopicClasses) {
    return [];
  }

  const subjectsMap = new Map<string, ActivityFilterOption>();

  for (const subTeacher of userData.subTeacherTopicClasses) {
    if (subTeacher.subject?.id && subTeacher.subject?.name) {
      subjectsMap.set(subTeacher.subject.id, {
        id: subTeacher.subject.id,
        name: subTeacher.subject.name,
      });
    }
  }

  return Array.from(subjectsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );
};

/**
 * Extract unique school year (série) options from user data
 *
 * @param userData - User data from /user/me endpoint
 * @returns Array of unique school years sorted by name
 */
export const getSchoolYearOptionsFromUserData = (
  userData: UserFilterSourceData | null | undefined
): ActivityFilterOption[] => {
  if (!userData?.userInstitutions) {
    return [];
  }

  const schoolYearsMap = new Map<string, ActivityFilterOption>();

  for (const userInst of userData.userInstitutions) {
    if (userInst.schoolYear?.id && userInst.schoolYear?.name) {
      schoolYearsMap.set(userInst.schoolYear.id, {
        id: userInst.schoolYear.id,
        name: userInst.schoolYear.name,
      });
    }
  }

  return Array.from(schoolYearsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );
};

/**
 * Extract unique class (turma) options from user data
 * Combines classes from userInstitutions and subTeacherTopicClasses
 *
 * @param userData - User data from /user/me endpoint
 * @returns Array of unique classes sorted by name
 */
export const getClassOptionsFromUserData = (
  userData: UserFilterSourceData | null | undefined
): ActivityFilterOption[] => {
  if (!userData) {
    return [];
  }

  const classesMap = new Map<string, ActivityFilterOption>();

  if (userData.userInstitutions) {
    for (const userInst of userData.userInstitutions) {
      if (userInst.class?.id && userInst.class?.name) {
        classesMap.set(userInst.class.id, {
          id: userInst.class.id,
          name: userInst.class.name,
        });
      }
    }
  }

  if (userData.subTeacherTopicClasses) {
    for (const subTeacher of userData.subTeacherTopicClasses) {
      if (subTeacher.class?.id && subTeacher.class?.name) {
        classesMap.set(subTeacher.class.id, {
          id: subTeacher.class.id,
          name: subTeacher.class.name,
        });
      }
    }
  }

  return Array.from(classesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );
};

/**
 * Build user filter data object from user data
 * Convenience function to create ActivityUserFilterData
 *
 * @param userData - User data from /user/me endpoint
 * @returns Object with schools and subjects arrays
 *
 * @example
 * ```typescript
 * const userData = useUserStore(state => state.data);
 * const userFilterData = buildUserFilterData(userData);
 * // Use with ActivitiesHistory component:
 * <ActivitiesHistory userFilterData={userFilterData} ... />
 * ```
 */
export const buildUserFilterData = (
  userData: UserFilterSourceData | null | undefined
): { schools: ActivityFilterOption[]; subjects: ActivityFilterOption[] } => ({
  schools: getSchoolOptionsFromUserData(userData),
  subjects: getSubjectOptionsFromUserData(userData),
});

/**
 * Merge two filter option arrays, deduplicating by ID.
 * Returns the base array unchanged if extra adds no new items.
 *
 * @param base - Base filter options array
 * @param extra - Additional filter options to merge
 * @returns Merged and sorted array of unique filter options
 *
 * @example
 * ```typescript
 * const userSubjects = getSubjectOptionsFromUserData(userData);
 * const apiSubjects = [{ id: '3', name: 'História' }];
 * const allSubjects = mergeFilterOptions(userSubjects, apiSubjects);
 * // Returns deduplicated and sorted array
 * ```
 */
export const mergeFilterOptions = (
  base: ActivityFilterOption[],
  extra: ActivityFilterOption[]
): ActivityFilterOption[] => {
  if (extra.length === 0) return base;
  const baseIds = new Set(base.map((item) => item.id));
  const hasNew = extra.some((item) => !baseIds.has(item.id));
  if (!hasNew) return base;
  const map = new Map(base.map((item) => [item.id, item.name] as const));
  extra.forEach((item) => {
    if (!map.has(item.id)) map.set(item.id, item.name);
  });
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
};

/**
 * Generic entity reference with id and name.
 * Used internally for structural typing in extractBreakdownFilterOptions.
 */
interface EntityRefLike {
  id: string;
  name: string;
}

/**
 * Structural shape of a single breakdown entry (school/class/schoolYear).
 * Matches both ActivityBreakdownItem and ExamBreakdownItem.
 */
interface BreakdownLike {
  school?: EntityRefLike | null;
  schoolYear?: EntityRefLike | null;
  class?: EntityRefLike | null;
}

/**
 * Structural shape of a history item that carries subject and breakdown data.
 * Matches both ActivityHistoryResponse and ExamHistoryResponse.
 */
interface BreakdownHistoryItem {
  subject?: EntityRefLike | null;
  breakdown?: BreakdownLike[];
}

/**
 * Filter options extracted from a list of history items with breakdown data.
 */
export interface BreakdownFilterOptions {
  schools: ActivityFilterOption[];
  classes: ActivityFilterOption[];
  subjects: ActivityFilterOption[];
  schoolYears: ActivityFilterOption[];
}

/**
 * Extract unique filter options (schools, classes, subjects, schoolYears)
 * from a list of history items that carry subject and breakdown data.
 *
 * Used by both useActivitiesHistory and useExamsHistory to avoid duplication.
 *
 * @param items - Array of history items (activities or exams) from the API
 * @returns Deduplicated, sorted filter options grouped by dimension
 *
 * @example
 * ```typescript
 * const options = extractBreakdownFilterOptions(data.activities);
 * // Returns: { schools: [...], classes: [...], subjects: [...], schoolYears: [...] }
 * ```
 */
export const extractBreakdownFilterOptions = (
  items: BreakdownHistoryItem[]
): BreakdownFilterOptions => {
  const schoolsMap = new Map<string, string>();
  const classesMap = new Map<string, string>();
  const subjectsMap = new Map<string, string>();
  const schoolYearsMap = new Map<string, string>();

  const setIfPresent = (
    map: Map<string, string>,
    ref: EntityRefLike | null | undefined
  ): void => {
    if (ref?.id && ref?.name) map.set(ref.id, ref.name);
  };

  for (const item of items) {
    setIfPresent(subjectsMap, item.subject);
    item.breakdown?.forEach((b) => {
      setIfPresent(schoolsMap, b.school);
      setIfPresent(classesMap, b.class);
      setIfPresent(schoolYearsMap, b.schoolYear);
    });
  }

  const toOptions = (map: Map<string, string>): ActivityFilterOption[] =>
    Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return {
    schools: toOptions(schoolsMap),
    classes: toOptions(classesMap),
    subjects: toOptions(subjectsMap),
    schoolYears: toOptions(schoolYearsMap),
  };
};
