import type {
  ActivityFiltersData,
  PreviewQuestion,
  QuestionActivity as Question,
} from '../..';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type {
  BackendFiltersFormat,
  School,
  SchoolYear,
  Class,
  Student,
} from './ActivityCreate.types';
import { ActivityType } from './ActivityCreate.types';
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
 * Convert ActivityFiltersData to backend format
 *
 * @param filters - ActivityFiltersData to convert, can be null
 * @returns BackendFiltersFormat object with converted filter data
 *
 * @example
 * ```ts
 * const backendFilters = convertFiltersToBackendFormat({
 *   types: ['ALTERNATIVA'],
 *   knowledgeIds: ['math'],
 *   // ...
 * });
 * ```
 */
export function convertFiltersToBackendFormat(
  filters: ActivityFiltersData | null
): BackendFiltersFormat {
  if (!filters) {
    return {
      questionTypes: [],
      questionBanks: [],
      subjects: [],
      topics: [],
      subtopics: [],
      contents: [],
    };
  }

  return {
    questionTypes: filters.types,
    questionBanks: filters.bankIds,
    subjects: filters.knowledgeIds,
    topics: filters.topicIds,
    subtopics: filters.subtopicIds,
    contents: filters.contentIds,
  };
}

/**
 * Convert backend filters format to ActivityFiltersData
 *
 * @param backendFilters - BackendFiltersFormat to convert, can be null
 * @returns ActivityFiltersData object with converted filter data, or null if input is null
 *
 * @example
 * ```ts
 * const activityFilters = convertBackendFiltersToActivityFiltersData({
 *   questionTypes: ['ALTERNATIVA'],
 *   subjects: ['math'],
 *   // ...
 * });
 * ```
 */
export function convertBackendFiltersToActivityFiltersData(
  backendFilters: BackendFiltersFormat | null
): ActivityFiltersData | null {
  if (!backendFilters) {
    return null;
  }

  return {
    types: (backendFilters.questionTypes || []) as QUESTION_TYPE[],
    bankIds: backendFilters.questionBanks || [],
    knowledgeIds: backendFilters.subjects || [],
    topicIds: backendFilters.topics || [],
    subtopicIds: backendFilters.subtopics || [],
    contentIds: backendFilters.contents || [],
    yearIds: [],
  };
}

/**
 * Get subject name from subjectId by searching in knowledge areas
 *
 * @param subjectId - The subject ID to look up
 * @param knowledgeAreas - Array of knowledge areas to search in
 * @returns The subject name if found, null otherwise
 *
 * @example
 * ```ts
 * const subjectName = getSubjectName('math', [
 *   { id: 'math', name: 'Matemática' }
 * ]);
 * // Returns: 'Matemática'
 * ```
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
 * Get activity type label using object literal mapping
 *
 * @param type - Activity type (ActivityType enum)
 * @returns Label string for the activity type
 *
 * @example
 * ```ts
 * const label = getActivityTypeLabel(ActivityType.RASCUNHO);
 * // Returns: 'Rascunho'
 * ```
 */
export function getActivityTypeLabel(type: ActivityType): string {
  const activityTypeLabels: Record<ActivityType, string> = {
    [ActivityType.RASCUNHO]: 'Rascunho',
    [ActivityType.MODELO]: 'Modelo',
    [ActivityType.ATIVIDADE]: 'Atividade',
  };
  return activityTypeLabels[type];
}

/**
 * Generate activity title based on type and subject
 *
 * @param type - Activity type (ActivityType enum)
 * @param subjectId - Subject ID to get name from
 * @param knowledgeAreas - Array of knowledge areas for subject lookup
 * @returns Generated title string
 *
 * @example
 * ```ts
 * const title = generateTitle(ActivityType.RASCUNHO, 'math', [
 *   { id: 'math', name: 'Matemática' }
 * ]);
 * // Returns: 'Rascunho - Matemática'
 * ```
 */
export function generateTitle(
  type: ActivityType,
  subjectId: string | null,
  knowledgeAreas: KnowledgeArea[]
): string {
  const typeLabel = getActivityTypeLabel(type);
  const subjectName = getSubjectName(subjectId, knowledgeAreas);
  return subjectName ? `${typeLabel} - ${subjectName}` : typeLabel;
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

/**
 * Convert Question to PreviewQuestion format
 *
 * @param question - Question object to convert
 * @returns PreviewQuestion object with converted data
 *
 * @example
 * ```ts
 * const previewQuestion = convertQuestionToPreview({
 *   id: 'q1',
 *   statement: 'Test question',
 *   questionType: 'ALTERNATIVA',
 *   options: [{ id: 'opt1', option: 'Option 1' }],
 *   knowledgeMatrix: [{
 *     subject: { name: 'Math', color: '#000', icon: 'Math' }
 *   }]
 * });
 * ```
 */
export function convertQuestionToPreview(question: Question): PreviewQuestion {
  const subjectInfo =
    question.knowledgeMatrix && question.knowledgeMatrix.length > 0
      ? {
          subjectName: question.knowledgeMatrix[0].subject?.name || undefined,
          subjectColor: question.knowledgeMatrix[0].subject?.color || undefined,
          iconName: question.knowledgeMatrix[0].subject?.icon || undefined,
        }
      : {};

  return {
    id: question.id,
    enunciado: question.statement,
    questionType: question.questionType,
    question: question.options
      ? {
          options: question.options.map(
            (opt: { id: string; option: string }) => ({
              id: opt.id,
              option: opt.option,
            })
          ),
          correctOptionIds: [],
        }
      : undefined,
    ...subjectInfo,
  };
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
      key: 'alunos',
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
