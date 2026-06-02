import type {
  ActivityFiltersData,
  PreviewQuestion,
  QuestionActivity as Question,
  SendActivityFormData,
} from '../..';
import type { Lesson } from '../../types/lessons';
import { ActivityMode, ActivitySubtype } from '../SendActivityModal/types';
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
    banca: question.questionBankYear?.questionBank?.name || undefined,
    ano: question.questionBankYear?.year || undefined,
    questionType: question.questionType,
    question: question.options
      ? {
          options: question.options.map(
            (opt: { id: string; option: string; isCorrect?: boolean }) => ({
              id: opt.id,
              option: opt.option,
              isCorrect: opt.isCorrect,
            })
          ),
          correctOptionIds: question.options
            .filter((opt: { isCorrect?: boolean }) => opt.isCorrect === true)
            .map((opt: { id: string }) => opt.id),
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
      formData.subtype === ActivitySubtype.PROVA
        ? formData.mode !== ActivityMode.PRESENCIAL
        : true,
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

/**
 * Get the recommended class endpoint URL based on class type
 *
 * @param lessonDraftId - The lesson draft ID
 * @param classTypeParam - The class type parameter (modelo or undefined)
 * @returns The endpoint URL for the recommended class
 */
export function getRecommendedClassEndpoint(
  lessonDraftId: string,
  classTypeParam?: string
): string {
  const baseUrl =
    classTypeParam === 'modelo'
      ? '/recommended-class/models'
      : '/recommended-class/drafts';
  return `${baseUrl}/${lessonDraftId}`;
}

/**
 * Activity draft item for lesson draft update
 */
interface ActivityDraftItem {
  activityDraftId: string;
  sequence: number;
}

/**
 * Lesson item for lesson draft update
 */
interface LessonItem {
  lessonId: string;
  sequence: number;
}

/**
 * Current lesson data from API
 */
interface CurrentLessonData {
  type: string;
  title: string;
  subjectId: string;
  filters: BackendFiltersFormat;
  activityDrafts?: ActivityDraftItem[];
  lessons?: LessonItem[];
}

/**
 * Build activity draft IDs array for lesson draft update
 *
 * @param existingActivities - Existing activity drafts from the lesson
 * @param newActivityDraftId - New activity draft ID to add
 * @returns Array of activity draft items with sequences
 */
export function buildActivityDraftIds(
  existingActivities: ActivityDraftItem[] | undefined,
  newActivityDraftId: string
): ActivityDraftItem[] {
  const activities = existingActivities || [];
  return [
    ...activities.map((a) => ({
      activityDraftId: a.activityDraftId,
      sequence: a.sequence,
    })),
    {
      activityDraftId: newActivityDraftId,
      sequence: activities.length + 1,
    },
  ];
}

/**
 * Build lesson IDs array from current lesson data
 *
 * @param lessons - Lessons from the current lesson data
 * @returns Array of lesson items with sequences
 */
export function buildLessonIds(
  lessons: LessonItem[] | undefined
): LessonItem[] {
  return (
    lessons?.map((l) => ({
      lessonId: l.lessonId,
      sequence: l.sequence,
    })) || []
  );
}

/**
 * Build update payload for lesson draft
 *
 * @param currentLesson - Current lesson data from API
 * @param newActivityDraftId - New activity draft ID to add
 * @returns Update payload for PATCH request
 */
export function buildLessonDraftUpdatePayload(
  currentLesson: CurrentLessonData,
  newActivityDraftId: string
): {
  type: string;
  title: string;
  subjectId: string;
  filters: BackendFiltersFormat;
  lessonIds: LessonItem[];
  activityDraftIds: ActivityDraftItem[];
} {
  return {
    type: currentLesson.type,
    title: currentLesson.title,
    subjectId: currentLesson.subjectId,
    filters: currentLesson.filters,
    lessonIds: buildLessonIds(currentLesson.lessons),
    activityDraftIds: buildActivityDraftIds(
      currentLesson.activityDrafts,
      newActivityDraftId
    ),
  };
}

/**
 * Format a path to ensure it starts with /
 *
 * @param path - The path to format
 * @returns Path starting with /
 */
export function formatNavigatePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Get subject ID from activity or applied filters
 *
 * @param activitySubjectId - Subject ID from activity
 * @param appliedFiltersSubjectIds - Subject IDs from applied filters
 * @returns Subject ID or throws error if not found
 */
export function getSubjectIdOrThrow(
  activitySubjectId: string | undefined,
  appliedFiltersSubjectIds: string[] | undefined
): string {
  const subjectId = activitySubjectId || appliedFiltersSubjectIds?.[0];
  if (!subjectId) {
    throw new Error('Subject ID não encontrado');
  }
  return subjectId;
}

/**
 * Activity create response data structure
 */
interface ActivityCreateResponseData {
  data?: {
    data?: {
      id?: string;
    };
  };
}

/**
 * Extract activity ID from create activity response
 *
 * @param response - Response from create activity API
 * @returns Activity ID or throws error if not found
 */
export function extractActivityIdFromResponse(
  response: ActivityCreateResponseData
): string {
  const activityId = response?.data?.data?.id;
  if (!activityId) {
    throw new Error('ID da atividade não retornado pela API');
  }
  return activityId;
}

/**
 * Build payload for sending activity to students
 *
 * @param activityId - Activity ID
 * @param students - Array of student IDs
 * @returns Send to students payload
 */
export function buildSendToStudentsPayload(
  activityId: string,
  students: string[]
): { activityId: string; students: string[] } {
  return {
    activityId,
    students,
  };
}

/**
 * Validate send activity responses
 *
 * @param createResponse - Response from create activity API
 * @param sendResponse - Response from send to students API
 * @throws Error if any response is invalid
 */
export function validateSendActivityResponses(
  createResponse: { data?: unknown } | undefined,
  sendResponse: { data?: unknown } | undefined
): void {
  if (!createResponse?.data) {
    throw new Error('Resposta inválida ao criar atividade');
  }
  if (!sendResponse?.data) {
    throw new Error('Resposta inválida ao enviar atividade para estudantes');
  }
}

/**
 * Format error message from unknown error
 *
 * @param error - Error object
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Formatted error message
 */
export function formatErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  return error instanceof Error ? error.message : defaultMessage;
}

/**
 * Draft data from API response
 */
interface DraftData {
  id: string;
  type: ActivityType;
  title: string;
  subjectId: string;
  filters: BackendFiltersFormat;
  updatedAt?: string;
}

/**
 * Build ActivityData from draft response
 *
 * @param draft - Draft data from API
 * @param questionIds - Current question IDs
 * @returns ActivityData object
 */
export function buildActivityDataFromDraft(
  draft: DraftData,
  questionIds: string[]
): {
  id: string;
  type: ActivityType;
  title: string;
  subjectId: string;
  filters: BackendFiltersFormat;
  questionIds: string[];
  updatedAt?: string;
} {
  return {
    id: draft.id,
    type: draft.type,
    title: draft.title,
    subjectId: draft.subjectId,
    filters: draft.filters,
    questionIds,
    updatedAt: draft.updatedAt,
  };
}

/**
 * Build partial activity update (preserves filters)
 *
 * @param prevActivity - Previous activity state
 * @param draft - New draft data
 * @param questionIds - Current question IDs
 * @returns Updated activity data
 */
export function buildPartialActivityUpdate(
  prevActivity: { filters: BackendFiltersFormat },
  draft: DraftData,
  questionIds: string[]
): {
  id: string;
  type: ActivityType;
  title: string;
  subjectId: string;
  filters: BackendFiltersFormat;
  questionIds: string[];
  updatedAt?: string;
} {
  return {
    id: draft.id,
    type: draft.type,
    title: draft.title,
    subjectId: draft.subjectId,
    filters: prevActivity.filters,
    questionIds,
    updatedAt: draft.updatedAt,
  };
}

/**
 * Build draft payload with type override
 *
 * @param basePayload - Base payload
 * @param typeOverride - Type to override
 * @param customTitle - Custom title (optional)
 * @param subjectId - Subject ID for title generation
 * @param knowledgeAreas - Knowledge areas for title generation
 * @returns Updated payload
 */
export function buildPayloadWithTypeOverride<
  T extends { type: ActivityType; title: string },
>(
  basePayload: T,
  typeOverride: ActivityType,
  customTitle: string | undefined,
  subjectId: string,
  knowledgeAreas: KnowledgeArea[]
): T {
  const trimmedCustomTitle = customTitle?.trim();
  const title =
    trimmedCustomTitle && trimmedCustomTitle.length > 0
      ? trimmedCustomTitle
      : generateTitle(typeOverride, subjectId, knowledgeAreas);

  return {
    ...basePayload,
    type: typeOverride,
    title,
  };
}

/**
 * Check if URL needs to be updated based on activity state
 *
 * @param activityId - Current activity ID
 * @param activityType - Current activity type
 * @param currentUrlType - Current URL type param
 * @param currentUrlId - Current URL id param
 * @returns True if URL needs update
 */
export function shouldUpdateUrl(
  activityId: string | undefined,
  activityType: ActivityType | undefined,
  currentUrlType: string | undefined,
  currentUrlId: string | undefined
): boolean {
  if (!activityId || !activityType) {
    return false;
  }
  const urlType = getTypeFromUrl(activityType);
  return (
    !currentUrlType ||
    !currentUrlId ||
    currentUrlId !== activityId ||
    currentUrlType !== urlType
  );
}

/**
 * Pre-filters input type
 */
type PreFiltersInput =
  | BackendFiltersFormat
  | { filters?: BackendFiltersFormat | null }
  | null;

/**
 * Resolve pre-filters from various input formats
 *
 * @param preFilters - Pre-filters in various formats
 * @returns Resolved BackendFiltersFormat or null
 */
export function resolvePreFilters(
  preFilters: PreFiltersInput
): BackendFiltersFormat | null | undefined {
  if (!preFilters) {
    return null;
  }
  if (
    typeof preFilters === 'object' &&
    preFilters !== null &&
    'filters' in preFilters
  ) {
    return preFilters.filters;
  }
  return preFilters as BackendFiltersFormat;
}

/**
 * Get initial filters data from activity or pre-filters
 *
 * @param activityFilters - Activity filters
 * @param resolvedPreFilters - Resolved pre-filters
 * @returns ActivityFiltersData or null
 */
export function getInitialFiltersData(
  activityFilters: BackendFiltersFormat | undefined,
  resolvedPreFilters: BackendFiltersFormat | null | undefined
): ActivityFiltersData | null {
  if (activityFilters) {
    return convertBackendFiltersToActivityFiltersData(activityFilters);
  }
  if (resolvedPreFilters) {
    return convertBackendFiltersToActivityFiltersData(resolvedPreFilters);
  }
  return null;
}

/**
 * Parameters for checking if save should trigger on reorder
 */
interface ReorderSaveCheckParams {
  hasFirstSaveBeenDone: boolean;
  subjectIds: string[] | undefined;
  loadingInitialQuestions: boolean;
  isSaving: boolean;
}

/**
 * Check if save should be triggered after reordering questions
 *
 * @param params - Check parameters
 * @returns True if save should be triggered
 */
export function shouldTriggerSaveOnReorder(
  params: ReorderSaveCheckParams
): boolean {
  const {
    hasFirstSaveBeenDone,
    subjectIds,
    loadingInitialQuestions,
    isSaving,
  } = params;
  const hasSubjectIds = Array.isArray(subjectIds) && subjectIds.length > 0;
  return (
    hasFirstSaveBeenDone &&
    hasSubjectIds &&
    !loadingInitialQuestions &&
    !isSaving
  );
}

/**
 * Check if filters have required subject IDs
 *
 * @param subjectIds - Subject IDs from filters
 * @returns True if at least one subject ID exists
 */
export function hasRequiredSubjectIds(
  subjectIds: string[] | undefined
): boolean {
  return Array.isArray(subjectIds) && subjectIds.length > 0;
}

/**
 * Check if should save draft before adding to lesson
 *
 * @param questionsCount - Number of questions
 * @param activityDraftId - Current draft ID
 * @returns True if draft should be saved
 */
export function shouldSaveDraftBeforeAddingToLesson(
  questionsCount: number,
  activityDraftId: string | null | undefined
): boolean {
  return questionsCount > 0 || !!activityDraftId;
}

/**
 * Check if should use custom callback for adding activity
 *
 * @param onAddActivityToLesson - Callback function
 * @param activityDraftId - Activity draft ID
 * @returns True if custom callback should be used
 */
export function shouldUseCustomAddActivityCallback(
  onAddActivityToLesson: ((id: string) => void) | undefined,
  activityDraftId: string | null | undefined
): boolean {
  return !!(onAddActivityToLesson && activityDraftId);
}

/**
 * Check if should add activity to lesson draft automatically
 *
 * @param activityDraftId - Activity draft ID
 * @param recommendedLessonDraftId - Recommended lesson draft ID
 * @returns True if should add automatically
 */
export function shouldAddActivityToLessonDraft(
  activityDraftId: string | null | undefined,
  recommendedLessonDraftId: string | undefined
): boolean {
  return !!(activityDraftId && recommendedLessonDraftId);
}
