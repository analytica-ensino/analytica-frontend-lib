import type { QuestionActivity as Question } from '../..';

// Re-export category types from shared utils for backward compatibility
export type {
  School,
  SchoolYear,
  Class,
  Student,
} from '../../utils/categoryDataUtils';

/**
 * Activity type enum
 * RASCUNHO: Draft activity (not sent)
 * MODELO: Template activity
 * ATIVIDADE: Activity sent to students
 */
export enum ActivityType {
  RASCUNHO = 'RASCUNHO',
  MODELO = 'MODELO',
  ATIVIDADE = 'ATIVIDADE',
}

/**
 * Activity status enum
 * A_VENCER: Activity pending (not yet due)
 */
export enum ActivityStatus {
  A_VENCER = 'A_VENCER',
}

/**
 * Backend filters format (from API)
 */
export interface BackendFiltersFormat {
  questionTypes?: string[];
  questionBanks?: string[];
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
export type ActivityPreFiltersInput =
  | BackendFiltersFormat
  | {
      filters?: BackendFiltersFormat | null;
    };

/**
 * Activity draft response from backend
 */
export interface ActivityDraftResponse {
  message: string;
  data: {
    draft: {
      id: string;
      type: ActivityType;
      title: string;
      creatorUserInstitutionId: string;
      subjectId: string;
      filters: BackendFiltersFormat;
      createdAt: string;
      updatedAt: string;
    };
    questionsLinked: number;
  };
}

/**
 * Activity object interface for creating/editing activities
 */
export interface ActivityData {
  id?: string;
  type: ActivityType;
  title: string;
  subjectId: string;
  filters: BackendFiltersFormat;
  questionIds: string[];
  selectedQuestions?: Question[];
  updatedAt?: string;
}

/**
 * Activity creation payload sent to API
 */
export interface ActivityCreatePayload {
  createdBySys: boolean;
  title: string;
  subjectId: string;
  questionIds: string[];
  subtype: string;
  difficulty: string;
  notification: string;
  status: ActivityStatus;
  startDate: string;
  finalDate: string;
  canRetry: boolean;
}

/**
 * Activity creation response from API
 */
export interface ActivityCreateResponse {
  message: string;
  data: {
    id: string;
    creatorUserId: string;
    createdBySys: boolean;
    title: string;
    type: string;
    subtype: string;
    difficulty: string;
    notification: string;
    status: string;
    startDate: string;
    finalDate: string;
    canRetry: boolean;
    subjectId: string;
    createdAt: string;
    updatedAt: string;
  };
}
