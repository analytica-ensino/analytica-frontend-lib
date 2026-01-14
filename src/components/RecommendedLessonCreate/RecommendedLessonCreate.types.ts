import type { Lesson } from '../../types/lessons';
import { GoalDraftType } from '../../types/recommendedLessons';

// Re-export GoalDraftType for convenience
export { GoalDraftType };

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
