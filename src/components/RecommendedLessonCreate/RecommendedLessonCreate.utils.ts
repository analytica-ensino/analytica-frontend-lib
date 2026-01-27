import type { LessonFiltersData } from '../../types/lessonFilters';
import type { Lesson } from '../../types/lessons';
import type { LessonBackendFiltersFormat } from './RecommendedLessonCreate.types';
import { RecommendedClassDraftType } from './RecommendedLessonCreate.types';

/**
 * Knowledge area interface for subject lookup
 */
export interface KnowledgeArea {
  id: string;
  name: string;
}

/**
 * Preview lesson type for LessonPreview component
 * Includes media fields mapped from API response
 */
export interface PreviewLesson extends Lesson {
  position?: number;
  videoSrc?: string;
  videoPoster?: string;
  videoSubtitles?: string;
  podcastSrc?: string;
  podcastTitle?: string;
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
 * @param type - RecommendedClassDraftType enum value
 * @returns Label string for the goal draft type
 */
export function getGoalDraftTypeLabel(type: RecommendedClassDraftType): string {
  const typeLabels: Record<RecommendedClassDraftType, string> = {
    [RecommendedClassDraftType.RASCUNHO]: 'Rascunho',
    [RecommendedClassDraftType.MODELO]: 'Modelo',
  };
  return typeLabels[type];
}

/**
 * Generate recommended lesson title based on type, subject, first lesson, and date
 *
 * @param type - RecommendedClassDraftType enum value
 * @param subjectId - Subject ID to get name from
 * @param knowledgeAreas - Array of knowledge areas for subject lookup
 * @param lessons - Array of lessons (optional, to get first lesson name)
 * @returns Generated title string
 */
export function generateTitle(
  type: RecommendedClassDraftType,
  subjectId: string | null,
  knowledgeAreas: KnowledgeArea[],
  lessons?: Lesson[]
): string {
  const typeLabel = getGoalDraftTypeLabel(type);
  const subjectName = getSubjectName(subjectId, knowledgeAreas);

  // Get first lesson name if available
  const firstLessonName =
    lessons && lessons.length > 0
      ? lessons[0].videoTitle || lessons[0].title || null
      : null;

  // Format current date as DD/MM/YYYY
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Build title parts
  const parts: string[] = [typeLabel];

  if (subjectName) {
    parts.push(subjectName);
  }

  if (firstLessonName) {
    // Truncate lesson name if too long (max 30 chars)
    const truncatedLessonName =
      firstLessonName.length > 30
        ? `${firstLessonName.substring(0, 27)}...`
        : firstLessonName;
    parts.push(truncatedLessonName);
  }

  // Always add date at the end
  parts.push(formattedDate);

  return parts.join(' - ');
}

/**
 * Convert RecommendedClassDraftType to the format used in URL
 *
 * @param type - RecommendedClassDraftType enum value
 * @returns String representation for URL (rascunho or modelo)
 */
export function getTypeFromUrl(type: RecommendedClassDraftType): string {
  switch (type) {
    case RecommendedClassDraftType.RASCUNHO:
      return 'rascunho';
    case RecommendedClassDraftType.MODELO:
      return 'modelo';
    default:
      return 'rascunho';
  }
}

/**
 * Convert string from URL to RecommendedClassDraftType
 *
 * @param type - String from URL (rascunho or modelo)
 * @returns RecommendedClassDraftType enum value
 */
export function getTypeFromUrlString(
  type: string | undefined
): RecommendedClassDraftType {
  switch (type) {
    case 'rascunho':
      return RecommendedClassDraftType.RASCUNHO;
    case 'modelo':
      return RecommendedClassDraftType.MODELO;
    default:
      return RecommendedClassDraftType.RASCUNHO;
  }
}

/**
 * Convert Lesson to PreviewLesson format
 * Maps API fields (urlVideo, urlPodCast, etc.) to component-expected fields (videoSrc, podcastSrc, etc.)
 *
 * @param lesson - Lesson object to convert
 * @returns PreviewLesson object with converted data
 */
export function convertLessonToPreview(lesson: Lesson): PreviewLesson {
  return {
    ...lesson,
    title: lesson.videoTitle || lesson.title,
    position: undefined,
    // Map API fields to component-expected fields for LessonPreview
    videoSrc: lesson.urlVideo,
    videoPoster: lesson.urlInitialFrame || lesson.urlCover,
    videoSubtitles: lesson.urlSubtitle,
    podcastSrc: lesson.urlPodCast,
    podcastTitle: lesson.podCastTitle,
  };
}
