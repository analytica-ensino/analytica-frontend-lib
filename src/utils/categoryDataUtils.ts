import type { BaseApiClient } from '../types/api';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';

/**
 * School type for categories data
 */
export interface School {
  id: string;
  companyName: string;
}

/**
 * SchoolYear type for categories data
 */
export interface SchoolYear {
  id: string;
  name: string;
  schoolId: string;
}

/**
 * Class type for categories data
 */
export interface Class {
  id: string;
  name: string;
  schoolYearId: string;
}

/**
 * Student type for categories data with nested school/schoolYear/class
 */
export interface Student {
  id: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  userInstitutionId: string;
  institutionId: string;
  profileId: string;
  school: {
    id: string;
    name: string;
  };
  schoolYear: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
  };
}

/**
 * Fetch students using POST /students/filters based on selected schools, schoolYears, and classes
 *
 * @param apiClient - API client instance
 * @param filters - Object with schoolIds, schoolYearIds, and classIds arrays
 * @returns Promise resolving to array of students
 *
 * @example
 * ```ts
 * const students = await fetchStudentsByFilters(apiClient, {
 *   schoolIds: ['school-1'],
 *   schoolYearIds: ['year-1'],
 *   classIds: ['class-1']
 * });
 * ```
 */
export async function fetchStudentsByFilters(
  apiClient: BaseApiClient,
  filters: {
    schoolIds?: string[];
    schoolYearIds?: string[];
    classIds?: string[];
  }
): Promise<Student[]> {
  // Only make request if at least one filter is provided
  if (
    (!filters.schoolIds || filters.schoolIds.length === 0) &&
    (!filters.schoolYearIds || filters.schoolYearIds.length === 0) &&
    (!filters.classIds || filters.classIds.length === 0)
  ) {
    return [];
  }

  const response = await apiClient.post<{
    message: string;
    data: {
      students: Student[];
    };
  }>('/students/filters', {
    ...(filters.schoolIds &&
      filters.schoolIds.length > 0 && {
        schoolIds: filters.schoolIds,
      }),
    ...(filters.schoolYearIds &&
      filters.schoolYearIds.length > 0 && {
        schoolYearIds: filters.schoolYearIds,
      }),
    ...(filters.classIds &&
      filters.classIds.length > 0 && {
        classIds: filters.classIds,
      }),
  });

  return response.data.data.students || [];
}

/**
 * Load categories data from API and transform to CategoryConfig format
 *
 * @param apiClient - API client instance
 * @param existingCategories - Current categories array to check if already loaded
 * @returns Promise resolving to array of CategoryConfig
 *
 * @example
 * ```ts
 * const categories = await loadCategoriesData(apiClient, []);
 * ```
 */
export async function loadCategoriesData(
  apiClient: BaseApiClient,
  existingCategories: CategoryConfig[]
): Promise<CategoryConfig[]> {
  if (existingCategories.length > 0) {
    return existingCategories;
  }

  const [schoolsResponse, schoolYearsResponse, classesResponse] =
    await Promise.all([
      apiClient.get<{ message: string; data: { schools: School[] } }>(
        '/school'
      ),
      apiClient.get<{
        message: string;
        data: { schoolYears: SchoolYear[] };
      }>('/schoolYear'),
      apiClient.get<{
        message: string;
        data: { classes: Class[] };
      }>('/classes'),
    ]);

  const schools = schoolsResponse.data.data.schools;
  const schoolYears = schoolYearsResponse.data.data.schoolYears;
  const classes = classesResponse.data.data.classes;

  const transformedCategories: CategoryConfig[] = [
    {
      key: 'escola',
      label: 'Escola',
      itens: schools.map((s) => ({ id: s.id, name: s.companyName })),
      selectedIds: [],
    },
    {
      key: 'serie',
      label: 'Série',
      dependsOn: ['escola'],
      filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
      itens: schoolYears.map((sy) => ({
        id: sy.id,
        name: sy.name,
        schoolId: sy.schoolId,
      })),
      selectedIds: [],
    },
    {
      key: 'turma',
      label: 'Turma',
      dependsOn: ['serie'],
      filteredBy: [{ key: 'serie', internalField: 'schoolYearId' }],
      itens: classes.map((c) => ({
        id: c.id,
        name: c.name,
        schoolYearId: c.schoolYearId,
      })),
      selectedIds: [],
    },
    {
      key: 'students',
      label: 'Alunos',
      dependsOn: ['turma'],
      filteredBy: [
        { key: 'escola', internalField: 'escolaId' },
        { key: 'serie', internalField: 'serieId' },
        { key: 'turma', internalField: 'turmaId' },
      ],
      // Students will be loaded dynamically based on selections
      itens: [],
      selectedIds: [],
    },
  ];

  return transformedCategories;
}

/**
 * Format time for display (HH:mm format)
 *
 * @param date - Date object to format
 * @returns Formatted time string in HH:mm format
 *
 * @example
 * ```ts
 * const time = formatTime(new Date('2025-01-01T14:30:00'));
 * // Returns: '14:30'
 * ```
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
