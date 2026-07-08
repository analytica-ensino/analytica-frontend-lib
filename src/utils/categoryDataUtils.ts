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
 * Fetch classes filtered by selected schools/schoolYears via GET /classes.
 * Wire format is comma-joined strings (NOT arrays): axios serializes an array
 * param with brackets (`schoolId[]=a`) which the backend's default querystring
 * parser does not fold into `schoolId`; a comma-joined string (`schoolId=a,b`)
 * is serializer-agnostic and the backend splits it. A UUID never contains a comma.
 *
 * @param apiClient - API client instance
 * @param filters - Object with schoolIds and/or schoolYearIds arrays
 * @returns Promise resolving to array of classes
 *
 * @example
 * ```ts
 * const classes = await fetchClassesByFilters(apiClient, {
 *   schoolIds: ['school-1'],
 *   schoolYearIds: ['year-1'],
 * });
 * ```
 */
export async function fetchClassesByFilters(
  apiClient: BaseApiClient,
  filters: { schoolIds?: string[]; schoolYearIds?: string[] }
): Promise<Class[]> {
  const hasSchools = !!filters.schoolIds && filters.schoolIds.length > 0;
  const hasYears = !!filters.schoolYearIds && filters.schoolYearIds.length > 0;
  if (!hasSchools && !hasYears) return [];
  // Paginate ALL matching pages: a regional manager selecting many schools +
  // series can have > 100 filtered classes, which a single page would truncate.
  return fetchAllPages<Class>(
    apiClient,
    '/classes',
    (data) => {
      const d = data as {
        classes: Class[];
        pagination?: { totalPages: number };
      };
      return {
        items: d.classes ?? [],
        totalPages: d.pagination?.totalPages ?? 1,
      };
    },
    {
      ...(hasSchools && { schoolId: filters.schoolIds!.join(',') }),
      ...(hasYears && { schoolYearId: filters.schoolYearIds!.join(',') }),
    }
  );
}

/**
 * Fetch every page of a paginated list endpoint and aggregate the items.
 *
 * @param apiClient - API client instance
 * @param url - Endpoint to fetch (e.g. '/school')
 * @param extract - Reads `data.data` and returns the page items and totalPages
 * @param extraParams - Extra query params merged into `{ page, limit }` on every
 *   request (e.g. comma-joined `schoolId`/`schoolYearId` filters for `/classes`)
 * @returns Promise resolving to all items across every page
 */
async function fetchAllPages<T>(
  apiClient: BaseApiClient,
  url: string,
  extract: (data: unknown) => { items: T[]; totalPages: number },
  extraParams: Record<string, unknown> = {}
): Promise<T[]> {
  // Fetch page 1 first to learn totalPages and get the initial items.
  const firstResponse = await apiClient.get<{ message: string; data: unknown }>(
    url,
    { params: { ...extraParams, page: 1, limit: 100 } }
  );
  const first = extract(firstResponse.data.data);
  const totalPages = first.totalPages || 1;
  const all: T[] = [...(first.items ?? [])];

  // Single page: return page-1 items unchanged.
  if (totalPages <= 1) {
    return all;
  }

  // Fetch remaining pages 2..totalPages in parallel. The browser caps
  // concurrent requests per host (~6), so firing them all is safe.
  const remainingPages = Array.from(
    { length: totalPages - 1 },
    (_, i) => i + 2
  );
  const responses = await Promise.all(
    remainingPages.map((page) =>
      apiClient.get<{ message: string; data: unknown }>(url, {
        params: { ...extraParams, page, limit: 100 },
      })
    )
  );

  // Concatenate in PAGE ORDER via the array index (Promise.all preserves
  // input order regardless of resolution order).
  for (const response of responses) {
    const { items } = extract(response.data.data);
    all.push(...(items ?? []));
  }

  return all;
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

  const [schools, schoolYears] = await Promise.all([
    fetchAllPages<School>(apiClient, '/school', (data) => {
      const d = data as {
        schools: School[];
        pagination?: { totalPages: number };
      };
      return { items: d.schools, totalPages: d.pagination?.totalPages ?? 1 };
    }),
    fetchAllPages<SchoolYear>(apiClient, '/schoolYear', (data) => {
      const d = data as {
        schoolYears: SchoolYear[];
        pagination?: { totalPages: number };
      };
      return {
        items: d.schoolYears,
        totalPages: d.pagination?.totalPages ?? 1,
      };
    }),
  ]);

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
      // Classes are loaded dynamically based on selected schools/schoolYears
      itens: [],
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
