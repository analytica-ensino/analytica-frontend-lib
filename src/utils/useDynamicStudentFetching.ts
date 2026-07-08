import { useCallback, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type { BaseApiClient } from '../types/api';
import {
  fetchStudentsByFilters,
  fetchClassesByFilters as defaultFetchClassesByFilters,
} from './categoryDataUtils';
import type { Class } from './categoryDataUtils';
import type {
  FetchStudentsByFiltersFunction,
  StudentWithNestedData,
} from './studentTypes';

/**
 * Function type for fetching classes by filters
 */
export type FetchClassesByFiltersFunction = (
  apiClient: BaseApiClient,
  filters: { schoolIds?: string[]; schoolYearIds?: string[] }
) => Promise<Class[]>;

export interface UseDynamicStudentFetchingOptions {
  apiClient?: BaseApiClient;
  fetchStudentsByFilters?: FetchStudentsByFiltersFunction;
  fetchClassesByFilters?: FetchClassesByFiltersFunction;
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
 * Transform classes to items format.
 *
 * Each item MUST carry `schoolYearId`: the turma category's `filteredBy` is
 * `[{ key: 'serie', internalField: 'schoolYearId' }]`, so items without it are
 * filtered out and never render.
 */
function transformClassesToItems(classes: Class[]): Array<{
  id: string;
  name: string;
  schoolYearId: string;
}> {
  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    schoolYearId: c.schoolYearId,
  }));
}

/**
 * Immutably replace the `itens` of a single category (by key), leaving every
 * other category untouched. Clearing a category is `setCategoryItems(cats, key, [])`.
 */
function setCategoryItems(
  categories: CategoryConfig[],
  key: string,
  itens: NonNullable<CategoryConfig['itens']>
): CategoryConfig[] {
  return categories.map((cat) => (cat.key === key ? { ...cat, itens } : cat));
}

/**
 * Commit the new `selectedIds` from a change while preserving each category's
 * prior `itens`. The `itens` for turma/alunos are owned exclusively by the async
 * write-backs, so the eager commit must never overwrite them (which would revert
 * async-loaded options when a rapid second call carries a stale snapshot).
 */
function commitSelectionsPreservingItems(
  updatedCategories: CategoryConfig[],
  prev: CategoryConfig[]
): CategoryConfig[] {
  return updatedCategories.map((cat) => {
    const prior = prev.find((p) => p.key === cat.key);
    return prior ? { ...cat, itens: prior.itens } : cat;
  });
}

/**
 * Hook to dynamically load BOTH turmas and alunos based on category selections.
 *
 * This hook provides a `handleCategoriesChange` function that:
 * - Detects changes in school/series/class selections
 * - Fetches turmas (classes) when the school/série selection changes and a série
 *   is selected; clears turmas when the série selection becomes empty
 * - Fetches alunos (students) only when school/series/class selections change and
 *   a turma is selected (not when only students are toggled); clears alunos otherwise
 * - Writes each fetched set back into ONLY its own category via functional state
 *   updates, so a late turma response never clobbers a student write and vice-versa
 * - Transforms fetched turmas/alunos into the correct format for CategoryConfig
 *   (turma items carry `schoolYearId` so the turma `filteredBy` does not hide them)
 * - Uses separate request-id guards for turmas and alunos to drop stale responses
 * - Handles errors gracefully
 *
 * @param setCategories - React state setter for categories (supports functional updates)
 * @param options - Configuration options
 * @returns Object with handleCategoriesChange function
 */
export function useDynamicStudentFetching(
  setCategories: Dispatch<SetStateAction<CategoryConfig[]>>,
  options: UseDynamicStudentFetchingOptions = {}
): {
  handleCategoriesChange: (
    updatedCategories: CategoryConfig[]
  ) => Promise<void>;
} {
  const {
    apiClient,
    fetchStudentsByFilters: customFetchStudents,
    fetchClassesByFilters: fetchClasses = defaultFetchClassesByFilters,
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

  // Refs to track fetch request IDs and prevent race conditions.
  // Separate ids for turmas and alunos so the two async writes never invalidate
  // each other.
  const fetchRequestId = useRef(0);
  const fetchClassesRequestId = useRef(0);

  /**
   * Build filters object for student fetching
   */
  const buildStudentFilters = useCallback(
    (
      selectedSchoolIds: string[],
      selectedSchoolYearIds: string[],
      selectedClassIds: string[]
    ) => ({
      schoolIds: selectedSchoolIds.length > 0 ? selectedSchoolIds : undefined,
      schoolYearIds:
        selectedSchoolYearIds.length > 0 ? selectedSchoolYearIds : undefined,
      classIds: selectedClassIds.length > 0 ? selectedClassIds : undefined,
    }),
    []
  );

  /**
   * Fetch students using custom function
   */
  const fetchWithCustomFunction = useCallback(
    async (
      selectedSchoolIds: string[],
      selectedSchoolYearIds: string[],
      selectedClassIds: string[],
      localRequestId: number
    ): Promise<StudentWithNestedData[] | null> => {
      if (!customFetchStudents) {
        return null;
      }

      const filters = buildStudentFilters(
        selectedSchoolIds,
        selectedSchoolYearIds,
        selectedClassIds
      );
      const students = await customFetchStudents(filters);

      if (localRequestId !== fetchRequestId.current) {
        return null;
      }

      return students;
    },
    [customFetchStudents, buildStudentFilters]
  );

  /**
   * Fetch students using API client
   */
  const fetchWithApiClient = useCallback(
    async (
      selectedSchoolIds: string[],
      selectedSchoolYearIds: string[],
      selectedClassIds: string[],
      localRequestId: number
    ): Promise<StudentWithNestedData[] | null> => {
      if (!apiClient) {
        return null;
      }

      const filters = buildStudentFilters(
        selectedSchoolIds,
        selectedSchoolYearIds,
        selectedClassIds
      );
      const students = await fetchStudentsByFilters(apiClient, filters);

      if (localRequestId !== fetchRequestId.current) {
        return null;
      }

      return students;
    },
    [apiClient, buildStudentFilters]
  );

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
      const students = await fetchWithCustomFunction(
        selectedSchoolIds,
        selectedSchoolYearIds,
        selectedClassIds,
        localRequestId
      );

      if (students !== null) {
        return students;
      }

      return fetchWithApiClient(
        selectedSchoolIds,
        selectedSchoolYearIds,
        selectedClassIds,
        localRequestId
      );
    },
    [fetchWithCustomFunction, fetchWithApiClient]
  );

  /**
   * Fetch classes (turmas) filtered by selected schools/schoolYears
   */
  const performClassFetch = useCallback(
    async (
      selectedSchoolIds: string[],
      selectedSchoolYearIds: string[],
      localRequestId: number
    ): Promise<Class[] | null> => {
      if (!apiClient) {
        return null;
      }

      const filters = {
        schoolIds: selectedSchoolIds.length > 0 ? selectedSchoolIds : undefined,
        schoolYearIds:
          selectedSchoolYearIds.length > 0 ? selectedSchoolYearIds : undefined,
      };
      const classes = await fetchClasses(apiClient, filters);

      if (localRequestId !== fetchClassesRequestId.current) {
        return null;
      }

      return classes;
    },
    [apiClient, fetchClasses]
  );

  /**
   * Handle successful student fetch. Patches ONLY the students category on top of
   * the latest state so a concurrent turma write is not clobbered.
   */
  const handleSuccessfulFetch = useCallback(
    (students: StudentWithNestedData[], localRequestId: number): boolean => {
      if (localRequestId !== fetchRequestId.current) {
        return false;
      }

      const studentItems = transformStudentsToItems(students);
      setCategories((prev) => setCategoryItems(prev, 'students', studentItems));
      return true;
    },
    [setCategories]
  );

  /**
   * Handle error during student fetch
   */
  const handleFetchError = useCallback(
    (error: unknown, localRequestId: number): boolean => {
      console.error('Error fetching students:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }

      if (localRequestId !== fetchRequestId.current) {
        return false;
      }

      setCategories((prev) => setCategoryItems(prev, 'students', []));
      return true;
    },
    [onError, setCategories]
  );

  /**
   * Handle successful class fetch. Patches ONLY the turma category on top of the
   * latest state so a concurrent student write is not clobbered.
   */
  const handleSuccessfulClassFetch = useCallback(
    (classes: Class[], localRequestId: number): boolean => {
      if (localRequestId !== fetchClassesRequestId.current) {
        return false;
      }

      const classItems = transformClassesToItems(classes);
      setCategories((prev) => setCategoryItems(prev, 'turma', classItems));
      return true;
    },
    [setCategories]
  );

  /**
   * Handle error during class fetch
   */
  const handleClassFetchError = useCallback(
    (error: unknown, localRequestId: number): boolean => {
      console.error('Error fetching classes:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }

      if (localRequestId !== fetchClassesRequestId.current) {
        return false;
      }

      setCategories((prev) => setCategoryItems(prev, 'turma', []));
      return true;
    },
    [onError, setCategories]
  );

  /**
   * Fetch turmas (or clear them) in response to a school/série selection change
   */
  const handleClassesChange = useCallback(
    async (
      selectedSchoolIds: string[],
      selectedSchoolYearIds: string[]
    ): Promise<void> => {
      // No apiClient => this consumer manages `turma` itself (e.g. AlertsManager
      // with pre-populated categories). Never fetch OR clear turma in that case.
      if (!apiClient) return;

      // Turma depends on a selected série: fetch only when a série is selected.
      if (selectedSchoolYearIds.length > 0) {
        fetchClassesRequestId.current += 1;
        const localRequestId = fetchClassesRequestId.current;

        try {
          const classes = await performClassFetch(
            selectedSchoolIds,
            selectedSchoolYearIds,
            localRequestId
          );

          if (classes === null) {
            return; // Request was invalidated
          }

          handleSuccessfulClassFetch(classes, localRequestId);
        } catch (error) {
          handleClassFetchError(error, localRequestId);
        }
      } else {
        // Série selection became empty -> reset turma options
        fetchClassesRequestId.current += 1;
        setCategories((prev) => setCategoryItems(prev, 'turma', []));
      }
    },
    [
      apiClient,
      performClassFetch,
      handleSuccessfulClassFetch,
      handleClassFetchError,
      setCategories,
    ]
  );

  /**
   * Fetch alunos (or clear them) in response to a selection change
   */
  const handleStudentsChange = useCallback(
    async (
      selectedSchoolIds: string[],
      selectedSchoolYearIds: string[],
      selectedClassIds: string[],
      studentsCategory: CategoryConfig | undefined
    ): Promise<void> => {
      if (selectedClassIds.length > 0 && studentsCategory) {
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

          handleSuccessfulFetch(students, localRequestId);
        } catch (error) {
          handleFetchError(error, localRequestId);
        }
      } else if (studentsCategory) {
        // If no classes selected after a change, clear students
        fetchRequestId.current += 1;
        setCategories((prev) => setCategoryItems(prev, 'students', []));
      }
    },
    [
      performStudentFetch,
      handleSuccessfulFetch,
      handleFetchError,
      setCategories,
    ]
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
      const { schoolIdsChanged, schoolYearIdsChanged, shouldFetchStudents } =
        detectSelectionChanges(previousSelections, {
          schoolIds: selectedSchoolIds,
          schoolYearIds: selectedSchoolYearIds,
          classIds: selectedClassIds,
        });

      // Update previous selections
      previousSelectionsRef.current = {
        schoolIds: [...selectedSchoolIds],
        schoolYearIds: [...selectedSchoolYearIds],
        classIds: [...selectedClassIds],
      };

      // Commit the new selections immediately, but NEVER the snapshot's `itens`
      // (owned exclusively by the async write-backs below). This keeps the
      // no-clobber invariant regardless of caller timing.
      setCategories((prev) =>
        commitSelectionsPreservingItems(updatedCategories, prev)
      );

      // Dynamic TURMA fetching: react to school/série selection changes
      if (schoolIdsChanged || schoolYearIdsChanged) {
        await handleClassesChange(selectedSchoolIds, selectedSchoolYearIds);
      }

      // Dynamic ALUNOS fetching: react to school/série/turma selection changes
      // (skipped when only student selections changed)
      if (shouldFetchStudents) {
        await handleStudentsChange(
          selectedSchoolIds,
          selectedSchoolYearIds,
          selectedClassIds,
          studentsCategory
        );
      }
    },
    [
      apiClient,
      customFetchStudents,
      setCategories,
      handleClassesChange,
      handleStudentsChange,
    ]
  );

  return {
    handleCategoriesChange,
  };
}
