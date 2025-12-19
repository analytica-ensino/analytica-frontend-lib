import type { QuestionActivity as Question } from '../..';

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
  type: ActivityType | 'RASCUNHO' | 'MODELO';
  title: string;
  subjectId: string;
  filters: BackendFiltersFormat;
  questionIds: string[];
  selectedQuestions?: Question[];
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
