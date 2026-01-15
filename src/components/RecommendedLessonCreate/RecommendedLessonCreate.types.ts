import type { Lesson } from '../../types/lessons';
import { GoalDraftType } from '../../types/recommendedLessons';

// Re-export GoalDraftType for convenience
export { GoalDraftType };

// Re-export category types from shared utils for backward compatibility
export type {
  School,
  SchoolYear,
  Class,
  Student,
} from '../../utils/categoryDataUtils';

/**
 * Backend filters format for recommended lessons (from API)
 */
export interface LessonBackendFiltersFormat {
  subjects?: string[];
  topics?: string[];
  subtopics?: string[];
  contents?: string[];
}

/**
 * Input accepted by preFilters prop
 * Supports receiving either the filters object directly or wrapped inside a
 * `filters` property.
 */
export type RecommendedLessonPreFiltersInput =
  | LessonBackendFiltersFormat
  | {
      filters?: LessonBackendFiltersFormat | null;
    };

/**
 * Recommended lesson draft response from backend
 */
export interface RecommendedLessonDraftResponse {
  message: string;
  data: {
    draft: {
      id: string;
      type: GoalDraftType;
      title: string;
      description: string | null;
      creatorUserInstitutionId: string;
      subjectId: string | null;
      filters: LessonBackendFiltersFormat;
      startDate: string | null;
      finalDate: string | null;
      createdAt: string;
      updatedAt: string;
    };
    lessonsLinked: number;
  };
}

/**
 * Recommended lesson data object interface for creating/editing
 */
export interface RecommendedLessonData {
  id?: string;
  type: GoalDraftType;
  title: string;
  description?: string | null;
  subjectId?: string | null;
  filters: LessonBackendFiltersFormat;
  lessonIds: string[];
  selectedLessons?: Lesson[];
  updatedAt?: string;
  startDate?: string | null;
  finalDate?: string | null;
}

/**
 * Recommended lesson creation payload sent to API
 */
export interface RecommendedLessonCreatePayload {
  title: string;
  description?: string;
  subjectId?: string | null;
  lessonIds: string[];
  startDate: string;
  finalDate: string;
  [key: string]: unknown;
}

/**
 * Recommended lesson creation response from API
 */
export interface RecommendedLessonCreateResponse {
  message: string;
  data: {
    id: string;
    title: string;
    description: string | null;
    subjectId: string | null;
    startDate: string;
    finalDate: string;
    createdAt: string;
    updatedAt: string;
  };
}
