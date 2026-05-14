import type {
  ActivityFiltersData,
  PreviewQuestion,
  QuestionActivity as Question,
  SendActivityFormData,
} from '../..';
import type { Lesson } from '../../types/lessons';
import { ActivityMode } from '../SendActivityModal/types';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type {
  BackendFiltersFormat,
  ActivityDraftResponse,
} from './ActivityCreate.types';
import { ActivityType } from './ActivityCreate.types';
import type { CreateActivityPayload } from '../../types/sendActivity';

/**
 * Response format for recommended class lesson data
 */
interface LessonResponseData {
  draft?: {
    selectedLessons?: Lesson[];
    lessons?: Array<{
      lessonId: string;
      sequence: number;
      lesson?: Lesson;
    }>;
  };
  selectedLessons?: Lesson[];
  lessons?: Array<{
    lessonId: string;
    sequence: number;
    lesson?: Lesson;
  }>;
}

/**
 * Extract lessons from recommended class API response
 * Handles multiple response formats for backward compatibility
 *
 * @param responseData - Response data from recommended class API
 * @returns Array of Lesson objects
 *
 * @example
 * ```ts
 * const lessons = extractLessonsFromResponse({
 *   draft: { selectedLessons: [...] }
 * });
 * ```
 */
export function extractLessonsFromResponse(
  responseData: LessonResponseData
): Lesson[] {
  const draft = responseData.draft;

  // Try draft.selectedLessons first
  if (draft?.selectedLessons && draft.selectedLessons.length > 0) {
    return draft.selectedLessons;
  }

  // Try responseData.selectedLessons
  if (responseData.selectedLessons && responseData.selectedLessons.length > 0) {
    return responseData.selectedLessons;
  }

  // Try draft.lessons (extract lesson property)
  if (draft?.lessons && draft.lessons.length > 0) {
    return draft.lessons
      .map((item) => {
        if (
          item &&
          typeof item === 'object' &&
          'lesson' in item &&
          item.lesson
        ) {
          return item.lesson;
        }
        return null;
      })
      .filter((lesson): lesson is Lesson => lesson !== null);
  }

  // Try responseData.lessons (extract lesson property)
  if (responseData.lessons && responseData.lessons.length > 0) {
    return responseData.lessons
      .map((item) => {
        if (
          item &&
          typeof item === 'object' &&
          'lesson' in item &&
          item.lesson
        ) {
          return item.lesson;
        }
        return null;
      })
      .filter((lesson): lesson is Lesson => lesson !== null);
  }

  return [];
}

/**
 * Set of valid QUESTION_TYPE enum values for runtime validation
 */
const VALID_QUESTION_TYPES = new Set(Object.values(QUESTION_TYPE));

/**
 * Type guard to validate if a string is a valid QUESTION_TYPE
 * @param type - String to validate
 * @returns True if type is a valid QUESTION_TYPE enum value
 */
const isValidQuestionType = (type: string): type is QUESTION_TYPE => {
  return VALID_QUESTION_TYPES.has(type as QUESTION_TYPE);
};

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
 *   subjectIds: ['math'],
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
    subjects: filters.subjectIds,
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
    types: (backendFilters.questionTypes || []).filter(isValidQuestionType),
    bankIds: backendFilters.questionBanks || [],
    subjectIds: backendFilters.subjects || [],
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
 * Converte ActivityType para o formato usado na URL
 *
 * @param type - ActivityType enum value
 * @returns String representation for URL (rascunho or modelo)
 *
 * @example
 * ```ts
 * const urlType = getTypeFromUrl(ActivityType.RASCUNHO);
 * // Returns: 'rascunho'
 * ```
 */
export function getTypeFromUrl(type: ActivityType): string {
  switch (type) {
    case ActivityType.RASCUNHO:
      return 'rascunho';
    case ActivityType.MODELO:
      return 'modelo';
    default:
      return 'rascunho';
  }
}

/**
 * Converte string da URL para ActivityType
 *
 * @param type - String from URL (rascunho or modelo)
 * @returns ActivityType enum value
 *
 * @example
 * ```ts
 * const activityType = getTypeFromUrlString('rascunho');
 * // Returns: ActivityType.RASCUNHO
 * ```
 */
export function getTypeFromUrlString(type: string | undefined): ActivityType {
  switch (type) {
    case 'rascunho':
      return ActivityType.RASCUNHO;
    case 'modelo':
      return ActivityType.MODELO;
    default:
      return ActivityType.RASCUNHO;
  }
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
 * Build ISO date time string from date and time parts
 *
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:mm format
 * @returns ISO date time string
 */
export function buildISODateTime(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

/**
 * Build final date time based on exam mode
 *
 * @param formData - Form data with finalDate and finalTime
 * @param isExamMode - Whether exam mode is enabled
 * @returns ISO date time string or null for exam mode
 */
export function buildFinalDateTime(
  finalDate: string,
  finalTime: string,
  isExamMode: boolean
): string | null {
  if (isExamMode) {
    return null;
  }
  return buildISODateTime(finalDate, finalTime);
}

export function buildSendActivityPayload(
  formData: SendActivityFormData,
  subjectId: string,
  questionIds: string[],
  startDateTime: string,
  finalDateTime: string | null,
  activityType?: 'ATIVIDADE' | 'PROVA'
): CreateActivityPayload {
  return {
    title: formData.title,
    subjectId,
    questionIds,
    subtype: formData.subtype,
    type: activityType,
    notification: formData.notification || '',
    startDate: startDateTime,
    finalDate: finalDateTime,
    canRetry: formData.canRetry,
    isDigital:
      formData.mode === undefined
        ? undefined
        : formData.mode === ActivityMode.ONLINE,
  };
}

/**
 * Check if questions have changed compared to last saved state
 *
 * @param currentQuestions - Current questions array
 * @param lastSavedQuestions - Last saved questions array
 * @returns True if questions have changed
 */
export function hasQuestionsChanged(
  currentQuestions: Array<{ id: string }>,
  lastSavedQuestions: Array<{ id: string }>
): boolean {
  const currentIds = currentQuestions.map((q) => q.id).join(',');
  const lastSavedIds = lastSavedQuestions.map((q) => q.id).join(',');
  return currentIds !== lastSavedIds;
}

/**
 * Parameters for shouldSkipAutoSave check
 */
interface AutoSaveCheckParams {
  loadingInitialQuestions: boolean;
  questionsCount: number;
  hasFirstSaveBeenDone: boolean;
  appliedFilters: ActivityFiltersData | null;
}

/**
 * Check if auto-save should be skipped based on current state
 *
 * @param params - Parameters to check
 * @returns True if auto-save should be skipped
 */
/**
 * Parameters for building URL with preserved query params
 */
interface BuildUrlParams {
  newType: string;
  newId: string;
  basePath: string;
  recommendedLessonDraftId?: string;
  recommendedLessonId?: string;
  classTypeParam?: string;
  onFinishPath?: string;
}

/**
 * Build URL preserving existing query parameters
 * Used when updating URL after saving draft to maintain context for navigation
 *
 * @param params - URL building parameters
 * @returns Complete URL string with query parameters
 */
export function buildUrlWithParams(params: BuildUrlParams): string {
  const {
    newType,
    newId,
    basePath,
    recommendedLessonDraftId,
    recommendedLessonId,
    classTypeParam,
    onFinishPath,
  } = params;

  const urlParams = new URLSearchParams();
  urlParams.set('type', newType);
  urlParams.set('id', newId);

  if (recommendedLessonDraftId) {
    urlParams.set('recommended-class-draft', recommendedLessonDraftId);
  }
  if (recommendedLessonId) {
    urlParams.set('recommended-class', recommendedLessonId);
  }
  if (classTypeParam) {
    urlParams.set('classType', classTypeParam);
  }
  if (onFinishPath) {
    urlParams.set('onFinish', onFinishPath);
  }

  return `${basePath}?${urlParams.toString()}`;
}

export function shouldSkipAutoSave(params: AutoSaveCheckParams): boolean {
  const {
    loadingInitialQuestions,
    questionsCount,
    hasFirstSaveBeenDone,
    appliedFilters,
  } = params;

  if (loadingInitialQuestions) {
    return true;
  }
  if (questionsCount === 0 && !hasFirstSaveBeenDone) {
    return true;
  }
  if (!appliedFilters) {
    return true;
  }
  return false;
}

/**
 * Try to extract draft from standard response format
 */
function tryExtractDraftFromStandardFormat(
  responseData: ActivityDraftResponse
): ActivityDraftResponse['data']['draft'] | undefined {
  if (responseData.data?.draft) {
    return responseData.data.draft;
  }
  if ('draft' in responseData && typeof responseData === 'object') {
    return (
      responseData as unknown as {
        draft: ActivityDraftResponse['data']['draft'];
      }
    )?.draft;
  }
  return undefined;
}

/**
 * Log error details for draft extraction failure
 */
function logDraftExtractionError(response: { data: ActivityDraftResponse }) {
  console.error('❌ Resposta inválida da API ao criar rascunho:', {
    response,
    responseData: response?.data,
    responseDataData: response?.data?.data,
    responseKeys: response?.data ? Object.keys(response.data) : [],
    responseDataKeys: response?.data?.data
      ? Object.keys(response.data.data)
      : [],
  });
}

/**
 * Extract draft from API response
 * Handles multiple response formats for backward compatibility
 *
 * @param response - API response object
 * @returns Extracted draft object
 * @throws Error if draft cannot be extracted
 */
export function extractDraftFromResponse(response: {
  data: ActivityDraftResponse;
}): ActivityDraftResponse['data']['draft'] {
  if (!response?.data) {
    console.error('❌ Resposta vazia da API ao criar rascunho:', response);
    throw new Error('Invalid response: empty response from API');
  }

  const savedDraft = tryExtractDraftFromStandardFormat(response.data);

  if (!savedDraft?.id) {
    logDraftExtractionError(response);
    throw new Error(
      'Invalid response: draft data is missing. Expected structure: response.data.data.draft'
    );
  }

  return savedDraft;
}
