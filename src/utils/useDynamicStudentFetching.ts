import { useCallback, useRef } from 'react';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type { BaseApiClient } from '../types/api';
import { fetchStudentsByFilters } from './categoryDataUtils';

export interface UseDynamicStudentFetchingOptions {
  apiClient?: BaseApiClient;
  fetchStudentsByFilters?: (filters: {
    schoolIds?: string[];
    schoolYearIds?: string[];
    classIds?: string[];
  }) => Promise<
    Array<{
      id: string;
      email: string;
      name: string;
      active: boolean;
      createdAt: string;
      updatedAt: string;
      userInstitutionId: string;
      institutionId: string;
      profileId: string;
      school: { id: string; name: string };
      schoolYear: { id: string; name: string };
      class: { id: string; name: string };
    }>
  >;
  onError?: (error: Error) => void;
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

  const handleCategoriesChange = useCallback(
    async (updatedCategories: CategoryConfig[]) => {
      // If no fetch function is provided, just update categories
      if (!customFetchStudents && !apiClient) {
        setCategories(updatedCategories);
        return;
      }

      // Find selected schools, schoolYears, and classes BEFORE updating state
      const escolaCategory = updatedCategories.find((c) => c.key === 'escola');
      const serieCategory = updatedCategories.find((c) => c.key === 'serie');
      const turmaCategory = updatedCategories.find((c) => c.key === 'turma');
      const studentsCategory = updatedCategories.find(
        (c) => c.key === 'students'
      );

      const selectedSchoolIds = escolaCategory?.selectedIds || [];
      const selectedSchoolYearIds = serieCategory?.selectedIds || [];
      const selectedClassIds = turmaCategory?.selectedIds || [];

      // Check if school, series, or class selections actually changed
      const previousSelections = previousSelectionsRef.current;

      // If previous selections are empty (initial state), consider it a change
      const isInitialState =
        previousSelections.schoolIds.length === 0 &&
        previousSelections.schoolYearIds.length === 0 &&
        previousSelections.classIds.length === 0;

      const schoolIdsChanged =
        isInitialState ||
        previousSelections.schoolIds.length !== selectedSchoolIds.length ||
        previousSelections.schoolIds.some(
          (id) => !selectedSchoolIds.includes(id)
        ) ||
        selectedSchoolIds.some(
          (id) => !previousSelections.schoolIds.includes(id)
        );

      const schoolYearIdsChanged =
        isInitialState ||
        previousSelections.schoolYearIds.length !==
          selectedSchoolYearIds.length ||
        previousSelections.schoolYearIds.some(
          (id) => !selectedSchoolYearIds.includes(id)
        ) ||
        selectedSchoolYearIds.some(
          (id) => !previousSelections.schoolYearIds.includes(id)
        );

      const classIdsChanged =
        isInitialState ||
        previousSelections.classIds.length !== selectedClassIds.length ||
        previousSelections.classIds.some(
          (id) => !selectedClassIds.includes(id)
        ) ||
        selectedClassIds.some(
          (id) => !previousSelections.classIds.includes(id)
        );

      const shouldFetchStudents =
        schoolIdsChanged || schoolYearIdsChanged || classIdsChanged;

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
        try {
          let students;
          if (customFetchStudents) {
            students = await customFetchStudents({
              schoolIds:
                selectedSchoolIds.length > 0 ? selectedSchoolIds : undefined,
              schoolYearIds:
                selectedSchoolYearIds.length > 0
                  ? selectedSchoolYearIds
                  : undefined,
              classIds:
                selectedClassIds.length > 0 ? selectedClassIds : undefined,
            });
          } else if (apiClient) {
            students = await fetchStudentsByFilters(apiClient, {
              schoolIds:
                selectedSchoolIds.length > 0 ? selectedSchoolIds : undefined,
              schoolYearIds:
                selectedSchoolYearIds.length > 0
                  ? selectedSchoolYearIds
                  : undefined,
              classIds:
                selectedClassIds.length > 0 ? selectedClassIds : undefined,
            });
          } else {
            setCategories(updatedCategories);
            return;
          }

          // Transform students to items format with nested data
          // Use userInstitutionId + classId as unique ID to allow same user in different classes
          const studentItems = students.map((s) => ({
            id: `${s.userInstitutionId}-${s.class.id}`, // Unique ID combining userInstitutionId and classId
            name: s.name,
            classId: String(s.class.id),
            schoolId: String(s.school.id),
            schoolYearId: String(s.schoolYear.id),
            studentId: s.id,
            userInstitutionId: s.userInstitutionId,
            // Include nested data for filtering (matching filteredBy in category config)
            // These fields must match the IDs in the parent categories' selectedIds (as strings)
            escolaId: String(s.school.id),
            serieId: String(s.schoolYear.id),
            turmaId: String(s.class.id),
          }));

          // Update students category with fetched students
          // Preserve all other categories exactly as they are (including selectedIds)
          const finalCategories = updatedCategories.map((cat) =>
            cat.key === 'students' ? { ...cat, itens: studentItems } : cat
          );

          setCategories(finalCategories);
        } catch (error) {
          console.error('Error fetching students:', error);
          if (onError && error instanceof Error) {
            onError(error);
          }
          // On error, clear students but keep all other categories unchanged
          const finalCategories = updatedCategories.map((cat) =>
            cat.key === 'students' ? { ...cat, itens: [] } : cat
          );
          setCategories(finalCategories);
        }
      } else if (shouldFetchStudents && studentsCategory) {
        // If no classes selected after a change, clear students but keep all other categories
        const finalCategories = updatedCategories.map((cat) =>
          cat.key === 'students' ? { ...cat, itens: [] } : cat
        );
        setCategories(finalCategories);
      } else {
        // No relevant changes (only student selections changed), just update categories as-is
        setCategories(updatedCategories);
      }
    },
    [apiClient, customFetchStudents, setCategories, onError]
  );

  return {
    handleCategoriesChange,
  };
}
