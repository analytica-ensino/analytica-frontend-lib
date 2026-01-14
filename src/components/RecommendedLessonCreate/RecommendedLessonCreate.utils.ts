import type { LessonFiltersData } from '../../types/lessonFilters';
import type { Lesson } from '../../types/lessons';
import type {
  LessonBackendFiltersFormat,
  School,
  SchoolYear,
  Class,
  Student,
} from './RecommendedLessonCreate.types';
import { GoalDraftType } from './RecommendedLessonCreate.types';
import type { BaseApiClient } from '../../types/api';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

/**
 * Knowledge area interface for subject lookup
 */
export interface KnowledgeArea {
  id: string;
  name: string;
}

/**
 * Preview lesson type for LessonPreview component
 */
export interface PreviewLesson extends Lesson {
  position?: number;
}

/**
 * Convert LessonFiltersData to backend format
 *
 * @param filters - LessonFiltersData to convert, can be null
 * @returns LessonBackendFiltersFormat object with converted filter data
 */
export function convertFiltersToBackendFormat(
  filters: LessonFiltersData | null
): LessonBackendFiltersFormat {
  if (!filters) {
    return {
      subjects: [],
      topics: [],
      subtopics: [],
      contents: [],
    };
  }

  return {
    subjects: filters.subjectIds,
    topics: filters.topicIds,
    subtopics: filters.subtopicIds,
    contents: filters.contentIds,
  };
}

/**
 * Convert backend filters format to LessonFiltersData
 *
 * @param backendFilters - LessonBackendFiltersFormat to convert, can be null
 * @returns LessonFiltersData object with converted filter data, or null if input is null
 */
export function convertBackendFiltersToLessonFiltersData(
  backendFilters: LessonBackendFiltersFormat | null
): LessonFiltersData | null {
  if (!backendFilters) {
    return null;
  }

  return {
    subjectIds: backendFilters.subjects || [],
    topicIds: backendFilters.topics || [],
    subtopicIds: backendFilters.subtopics || [],
    contentIds: backendFilters.contents || [],
  };
}

/**
 * Get subject name from subjectId by searching in knowledge areas
 *
 * @param subjectId - The subject ID to look up
 * @param knowledgeAreas - Array of knowledge areas to search in
 * @returns The subject name if found, null otherwise
 */
export function getSubjectName(
  subjectId: string | null,
  knowledgeAreas: KnowledgeArea[]
): string | null {
  if (!subjectId || !knowledgeAreas.length) {
    return null;
  }
  const subject = knowledgeAreas.find((area) => area.id === subjectId);
  return subject?.name || null;
}

/**
 * Get goal draft type label using object literal mapping
 *
 * @param type - GoalDraftType enum value
 * @returns Label string for the goal draft type
 */
export function getGoalDraftTypeLabel(type: GoalDraftType): string {
  const typeLabels: Record<GoalDraftType, string> = {
    [GoalDraftType.RASCUNHO]: 'Rascunho',
    [GoalDraftType.MODELO]: 'Modelo',
  };
  return typeLabels[type];
}

/**
 * Generate recommended lesson title based on type and subject
 *
 * @param type - GoalDraftType enum value
 * @param subjectId - Subject ID to get name from
 * @param knowledgeAreas - Array of knowledge areas for subject lookup
 * @returns Generated title string
 */
export function generateTitle(
  type: GoalDraftType,
  subjectId: string | null,
  knowledgeAreas: KnowledgeArea[]
): string {
  const typeLabel = getGoalDraftTypeLabel(type);
  const subjectName = getSubjectName(subjectId, knowledgeAreas);
  return subjectName ? `${typeLabel} - ${subjectName}` : typeLabel;
}

/**
 * Format time for display (HH:mm format)
 *
 * @param date - Date object to format
 * @returns Formatted time string in HH:mm format
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Convert GoalDraftType to the format used in URL
 *
 * @param type - GoalDraftType enum value
 * @returns String representation for URL (rascunho or modelo)
 */
export function getTypeFromUrl(type: GoalDraftType): string {
  switch (type) {
    case GoalDraftType.RASCUNHO:
      return 'rascunho';
    case GoalDraftType.MODELO:
      return 'modelo';
    default:
      return 'rascunho';
  }
}

/**
 * Convert string from URL to GoalDraftType
 *
 * @param type - String from URL (rascunho or modelo)
 * @returns GoalDraftType enum value
 */
export function getTypeFromUrlString(type: string | undefined): GoalDraftType {
  switch (type) {
    case 'rascunho':
      return GoalDraftType.RASCUNHO;
    case 'modelo':
      return GoalDraftType.MODELO;
    default:
      return GoalDraftType.RASCUNHO;
  }
}

/**
 * Convert Lesson to PreviewLesson format
 *
 * @param lesson - Lesson object to convert
 * @returns PreviewLesson object with converted data
 */
export function convertLessonToPreview(lesson: Lesson): PreviewLesson {
  return {
    ...lesson,
    position: undefined,
  };
}

/**
 * Fetch all students by paginating through all pages
 *
 * @param apiClient - API client instance
 * @returns Promise resolving to array of all students
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
