import { useCallback, useRef } from 'react';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type { BaseApiClient } from '../types/api';
import { fetchStudentsByFilters } from './categoryDataUtils';
import type {
  FetchStudentsByFiltersFunction,
  StudentWithNestedData,
} from './studentTypes';

export interface UseDynamicStudentFetchingOptions {
  apiClient?: BaseApiClient;
  fetchStudentsByFilters?: FetchStudentsByFiltersFunction;
  onError?: (error: Error) => void;
}

/**
 * Extract selected IDs from categories
 */
function extractSelectedIds(updatedCategories: CategoryConfig[]): {
  schoolIds: string[];
  schoolYearIds: string[];
  classIds: string[];
  studentsCategory: CategoryConfig | undefined;
} {
  const escolaCategory = updatedCategories.find((c) => c.key === 'escola');
  const serieCategory = updatedCategories.find((c) => c.key === 'serie');
  const turmaCategory = updatedCategories.find((c) => c.key === 'turma');
  const studentsCategory = updatedCategories.find((c) => c.key === 'students');

  return {
    schoolIds: escolaCategory?.selectedIds || [],
    schoolYearIds: serieCategory?.selectedIds || [],
    classIds: turmaCategory?.selectedIds || [],
    studentsCategory,
  };
}

/**
 * Detect if selections have changed compared to previous selections
 */
function detectSelectionChanges(
  previousSelections: {
    schoolIds: string[];
    schoolYearIds: string[];
    classIds: string[];
  },
  currentSelections: {
    schoolIds: string[];
    schoolYearIds: string[];
    classIds: string[];
  }
): {
  schoolIdsChanged: boolean;
  schoolYearIdsChanged: boolean;
  classIdsChanged: boolean;
  shouldFetchStudents: boolean;
} {
  const isInitialState =
    previousSelections.schoolIds.length === 0 &&
    previousSelections.schoolYearIds.length === 0 &&
    previousSelections.classIds.length === 0;

  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((id) => b.includes(id)) && b.every((id) => a.includes(id));
  };

  const schoolIdsChanged =
    isInitialState ||
    !arraysEqual(previousSelections.schoolIds, currentSelections.schoolIds);

  const schoolYearIdsChanged =
    isInitialState ||
    !arraysEqual(
      previousSelections.schoolYearIds,
      currentSelections.schoolYearIds
    );

  const classIdsChanged =
    isInitialState ||
    !arraysEqual(previousSelections.classIds, currentSelections.classIds);

  const shouldFetchStudents =
    schoolIdsChanged || schoolYearIdsChanged || classIdsChanged;

  return {
    schoolIdsChanged,
    schoolYearIdsChanged,
    classIdsChanged,
    shouldFetchStudents,
  };
}

/**
 * Transform students to items format with nested data
 */
function transformStudentsToItems(students: StudentWithNestedData[]): Array<{
  id: string;
  name: string;
  classId: string;
  schoolId: string;
  schoolYearId: string;
  studentId: string;
  userInstitutionId: string;
  escolaId: string;
  serieId: string;
  turmaId: string;
}> {
  return students.map((s) => ({
    id: `${s.userInstitutionId}-${s.class.id}`,
    name: s.name,
    classId: String(s.class.id),
    schoolId: String(s.school.id),
    schoolYearId: String(s.schoolYear.id),
    studentId: s.id,
    userInstitutionId: s.userInstitutionId,
    escolaId: String(s.school.id),
    serieId: String(s.schoolYear.id),
    turmaId: String(s.class.id),
  }));
}

/**
 * Update categories with student items
 */
function updateCategoriesWithStudents(
  updatedCategories: CategoryConfig[],
  studentItems: Array<{
    id: string;
    name: string;
    classId: string;
    schoolId: string;
    schoolYearId: string;
    studentId: string;
    userInstitutionId: string;
    escolaId: string;
    serieId: string;
    turmaId: string;
  }>
): CategoryConfig[] {
  return updatedCategories.map((cat) =>
    cat.key === 'students' ? { ...cat, itens: studentItems } : cat
  );
}

/**
 * Clear students from categories
 */
function clearStudentsFromCategories(
  updatedCategories: CategoryConfig[]
): CategoryConfig[] {
  return updatedCategories.map((cat) =>
    cat.key === 'students' ? { ...cat, itens: [] } : cat
  );
}

/**
 * Hook to handle dynamic student fetching based on category selections.
 *
 * This hook provides a `handleCategoriesChange` function that:
 * - Detects changes in school/series/class selections
 * - Fetches students only when these selections change (not when only students are toggled)
 * - Transforms fetched students into the correct format for CategoryConfig
 * - Handles errors gracefully
 *
 * @param setCategories - Function to update categories state
 * @param options - Configuration options
 * @returns Object with handleCategoriesChange function
 */
export function useDynamicStudentFetching(
  setCategories: (categories: CategoryConfig[]) => void,
  options: UseDynamicStudentFetchingOptions = {}
): {
  handleCategoriesChange: (
    updatedCategories: CategoryConfig[]
  ) => Promise<void>;
} {
  const {
    apiClient,
    fetchStudentsByFilters: customFetchStudents,
    onError,
  } = options;

  // Refs to track previous selections and prevent unnecessary API calls
  const previousSelectionsRef = useRef<{
    schoolIds: string[];
    schoolYearIds: string[];
    classIds: string[];
  }>({
    schoolIds: [],
    schoolYearIds: [],
    classIds: [],
  });

  // Ref to track fetch request ID and prevent race conditions
  const fetchRequestId = useRef(0);

  /**
   * Fetch students using the appropriate method (custom function or API client)
   */
  const performStudentFetch = useCallback(
    async (
      selectedSchoolIds: string[],
      selectedSchoolYearIds: string[],
      selectedClassIds: string[],
      localRequestId: number
    ): Promise<StudentWithNestedData[] | null> => {
      if (customFetchStudents) {
        const students = await customFetchStudents({
          schoolIds:
            selectedSchoolIds.length > 0 ? selectedSchoolIds : undefined,
          schoolYearIds:
            selectedSchoolYearIds.length > 0
              ? selectedSchoolYearIds
              : undefined,
          classIds: selectedClassIds.length > 0 ? selectedClassIds : undefined,
        });

        if (localRequestId !== fetchRequestId.current) {
          return null;
        }

        return students;
      }

      if (apiClient) {
        const students = await fetchStudentsByFilters(apiClient, {
          schoolIds:
            selectedSchoolIds.length > 0 ? selectedSchoolIds : undefined,
          schoolYearIds:
            selectedSchoolYearIds.length > 0
              ? selectedSchoolYearIds
              : undefined,
          classIds: selectedClassIds.length > 0 ? selectedClassIds : undefined,
        });

        if (localRequestId !== fetchRequestId.current) {
          return null;
        }

        return students;
      }

      return null;
    },
    [apiClient, customFetchStudents]
  );

  /**
   * Handle successful student fetch
   */
  const handleSuccessfulFetch = useCallback(
    (
      students: StudentWithNestedData[],
      updatedCategories: CategoryConfig[],
      localRequestId: number
    ): boolean => {
      if (localRequestId !== fetchRequestId.current) {
        return false;
      }

      const studentItems = transformStudentsToItems(students);
      const finalCategories = updateCategoriesWithStudents(
        updatedCategories,
        studentItems
      );
      setCategories(finalCategories);
      return true;
    },
    [setCategories]
  );

  /**
   * Handle error during student fetch
   */
  const handleFetchError = useCallback(
    (
      error: unknown,
      updatedCategories: CategoryConfig[],
      localRequestId: number
    ): boolean => {
      console.error('Error fetching students:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }

      if (localRequestId !== fetchRequestId.current) {
        return false;
      }

      const finalCategories = clearStudentsFromCategories(updatedCategories);
      setCategories(finalCategories);
      return true;
    },
    [onError, setCategories]
  );

  const handleCategoriesChange = useCallback(
    async (updatedCategories: CategoryConfig[]) => {
      // If no fetch function is provided, just update categories
      if (!customFetchStudents && !apiClient) {
        setCategories(updatedCategories);
        return;
      }

      // Extract selected IDs from categories
      const {
        schoolIds: selectedSchoolIds,
        schoolYearIds: selectedSchoolYearIds,
        classIds: selectedClassIds,
        studentsCategory,
      } = extractSelectedIds(updatedCategories);

      // Detect if selections have changed
      const previousSelections = previousSelectionsRef.current;
      const { shouldFetchStudents } = detectSelectionChanges(
        previousSelections,
        {
          schoolIds: selectedSchoolIds,
          schoolYearIds: selectedSchoolYearIds,
          classIds: selectedClassIds,
        }
      );

      // Update previous selections
      previousSelectionsRef.current = {
        schoolIds: [...selectedSchoolIds],
        schoolYearIds: [...selectedSchoolYearIds],
        classIds: [...selectedClassIds],
      };

      // Only fetch students if school/series/class selections changed
      if (
        shouldFetchStudents &&
        selectedClassIds.length > 0 &&
        studentsCategory
      ) {
        // Increment request ID to invalidate any in-flight requests
        fetchRequestId.current += 1;
        const localRequestId = fetchRequestId.current;

        try {
          const students = await performStudentFetch(
            selectedSchoolIds,
            selectedSchoolYearIds,
            selectedClassIds,
            localRequestId
          );

          if (students === null) {
            return; // Request was invalidated
          }

          handleSuccessfulFetch(students, updatedCategories, localRequestId);
        } catch (error) {
          handleFetchError(error, updatedCategories, localRequestId);
        }
      } else if (shouldFetchStudents && studentsCategory) {
        // If no classes selected after a change, clear students
        fetchRequestId.current += 1;
        const finalCategories = clearStudentsFromCategories(updatedCategories);
        setCategories(finalCategories);
      } else {
        // No relevant changes (only student selections changed), just update categories as-is
        setCategories(updatedCategories);
      }
    },
    [
      apiClient,
      customFetchStudents,
      setCategories,
      performStudentFetch,
      handleSuccessfulFetch,
      handleFetchError,
    ]
  );

  return {
    handleCategoriesChange,
  };
}
