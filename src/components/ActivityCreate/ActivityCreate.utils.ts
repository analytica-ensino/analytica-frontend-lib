import type {
  ActivityFiltersData,
  PreviewQuestion,
  QuestionActivity as Question,
} from '../..';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { BackendFiltersFormat } from './ActivityCreate.types';
import { ActivityType } from './ActivityCreate.types';

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
