import type { LessonFiltersData } from '../../types/lessonFilters';
import type { Lesson } from '../../types/lessons';
import type { LessonBackendFiltersFormat } from './RecommendedLessonCreate.types';
import { GoalDraftType } from './RecommendedLessonCreate.types';

// Re-export shared utilities for backward compatibility
export {
  fetchAllStudents,
  loadCategoriesData,
  formatTime,
  type School,
  type SchoolYear,
  type Class,
  type Student,
} from '../../utils/categoryDataUtils';

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
