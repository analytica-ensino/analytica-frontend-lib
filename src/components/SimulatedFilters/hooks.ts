import { useState, useCallback, useEffect, useRef } from 'react';
import type { BaseApiClient } from '../../types/api';
import type {
  UseUserAccessDataReturn,
  UseUserAccessDataState,
  UseStudentsFilterReturn,
  UseStudentsFilterState,
  StudentsFilterParams,
  StudentFilterItem,
  StudentGroup,
  UserAccessDataApiResponse,
  StudentsFilterApiResponse,
} from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Groups students by school/year/class
 */
function groupStudents(students: StudentFilterItem[]): StudentGroup[] {
  const groups = new Map<string, StudentGroup>();

  for (const student of students) {
    const key = `${student.schoolId}-${student.schoolYearId}-${student.classId}`;
    const label = `${student.schoolName} > ${student.schoolYearName} > ${student.className}`;

    if (!groups.has(key)) {
      groups.set(key, { key, label, students: [] });
    }
    groups.get(key)!.students.push(student);
  }

  // Sort groups by label and students by name
  const sortedGroups = Array.from(groups.values()).sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR')
  );

  for (const group of sortedGroups) {
    group.students.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  return sortedGroups;
}

// ============================================================================
// useUserAccessData HOOK
// ============================================================================

/**
 * Hook to fetch user access data (schools, schoolYears, classes)
 *
 * Receives the api client and calls /auth/me endpoint directly.
 *
 * @example
 * ```tsx
 * const { schools, schoolYears, classes, isLoading, error } = useUserAccessData(api);
 * ```
 */
export function useUserAccessData(api: BaseApiClient): UseUserAccessDataReturn {
  const [state, setState] = useState<UseUserAccessDataState>({
    isLoading: false,
    error: null,
    schools: [],
    schoolYears: [],
    classes: [],
  });

  const hasFetched = useRef(false);

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.get<UserAccessDataApiResponse>('/auth/me');
      const data = response.data.data;

      setState({
        isLoading: false,
        error: null,
        schools: data.schools.map((s) => ({
          id: s.id,
          name: s.name,
        })),
        schoolYears: data.schoolYears.map((sy) => ({
          id: sy.id,
          name: sy.name,
          schoolId: sy.schoolId,
        })),
        classes: data.classes.map((c) => ({
          id: c.id,
          name: c.name,
          schoolId: c.schoolId,
          schoolYearId: c.schoolYearId,
        })),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Falha ao carregar dados';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [api]);

  // Fetch on mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

// ============================================================================
// useStudentsFilter HOOK
// ============================================================================

/**
 * Hook to fetch and manage students for filtering
 *
 * Receives the api client and calls /students/filters endpoint directly.
 *
 * @example
 * ```tsx
 * const { groupedStudents, isLoading, fetchStudents, clearStudents } = useStudentsFilter(api);
 *
 * // Fetch students when filters change
 * useEffect(() => {
 *   if (schoolIds.length > 0) {
 *     fetchStudents({ schoolIds, schoolYearIds, classIds });
 *   }
 * }, [schoolIds, schoolYearIds, classIds]);
 * ```
 */
export function useStudentsFilter(api: BaseApiClient): UseStudentsFilterReturn {
  const [state, setState] = useState<UseStudentsFilterState>({
    isLoading: false,
    error: null,
    students: [],
    groupedStudents: [],
  });

  const fetchStudents = useCallback(
    async (filters: StudentsFilterParams) => {
      // Don't fetch if there are no filters
      const hasFilters =
        (filters.schoolIds && filters.schoolIds.length > 0) ||
        (filters.schoolYearIds && filters.schoolYearIds.length > 0) ||
        (filters.classIds && filters.classIds.length > 0);

      if (!hasFilters) {
        setState({
          isLoading: false,
          error: null,
          students: [],
          groupedStudents: [],
        });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await api.post<StudentsFilterApiResponse>(
          '/students/filters',
          {
            schoolIds: filters.schoolIds || [],
            schoolYearIds: filters.schoolYearIds || [],
            classIds: filters.classIds || [],
          }
        );

        const rawStudents = response.data.data.students;

        // Transform and filter students with complete data
        const students: StudentFilterItem[] = rawStudents
          .filter((s) => s.school && s.schoolYear && s.class)
          .map((s) => ({
            id: s.userInstitutionId,
            name: s.name,
            schoolId: s.school!.id,
            schoolYearId: s.schoolYear!.id,
            classId: s.class!.id,
            schoolName: s.school!.name,
            schoolYearName: s.schoolYear!.name,
            className: s.class!.name,
          }));

        const groupedStudents = groupStudents(students);

        setState({
          isLoading: false,
          error: null,
          students,
          groupedStudents,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Falha ao carregar estudantes';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [api]
  );

  const clearStudents = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      students: [],
      groupedStudents: [],
    });
  }, []);

  return {
    ...state,
    fetchStudents,
    clearStudents,
  };
}
