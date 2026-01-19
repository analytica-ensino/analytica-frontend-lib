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
 * Student type for categories data
 */
export interface Student {
  id: string;
  name: string;
  classId: string;
  userInstitutionId: string;
}

/**
 * Fetch all students by paginating through all pages
 *
 * @param apiClient - API client instance
 * @returns Promise resolving to array of all students
 *
 * @example
 * ```ts
 * const students = await fetchAllStudents(apiClient);
 * ```
 */
export async function fetchAllStudents(
  apiClient: BaseApiClient
): Promise<Student[]> {
  const allStudents: Student[] = [];
  let currentPage = 1;
  let totalPages = 1;
  const limit = 100;

  do {
    const response = await apiClient.get<{
      message: string;
      data: {
        students: Student[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }>(`/students?page=${currentPage}&limit=${limit}`);

    const { students, pagination } = response.data.data;
    allStudents.push(...students);
    totalPages = pagination.totalPages;
    currentPage++;
  } while (currentPage <= totalPages);

  return allStudents;
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

  const [schoolsResponse, schoolYearsResponse, classesResponse, allStudents] =
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
      fetchAllStudents(apiClient),
    ]);

  const schools = schoolsResponse.data.data.schools;
  const schoolYears = schoolYearsResponse.data.data.schoolYears;
  const classes = classesResponse.data.data.classes;
  const students = allStudents;

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
      filteredBy: [{ key: 'turma', internalField: 'classId' }],
      itens: students.map((s) => ({
        id: s.id,
        name: s.name,
        classId: s.classId,
        studentId: s.id,
        userInstitutionId: s.userInstitutionId,
      })),
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
