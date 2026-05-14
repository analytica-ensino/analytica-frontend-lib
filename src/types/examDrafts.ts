/**
 * Exam Drafts and Models Types
 *
 * This file contains types for exam drafts and models features.
 * Uses /activity-drafts endpoint with activityType=PROVA to filter for exam drafts.
 */

/**
 * Exam draft type enum (matches backend ACTIVITY_DRAFT_TYPE)
 */
export enum ExamDraftType {
  MODELO = 'MODELO',
  RASCUNHO = 'RASCUNHO',
}

/**
 * Activity category enum (matches backend ACTIVITY_CATEGORY)
 */
export enum ExamActivityCategory {
  PROVA = 'PROVA',
  ATIVIDADE = 'ATIVIDADE',
}

/**
 * Exam draft filters object from backend
 */
export interface ExamDraftFilters {
  questionTypes?: string[];
  questionBanks?: string[];
  subjects?: string[];
  topics?: string[];
  subtopics?: string[];
  contents?: string[];
}

/**
 * Exam model/draft response from backend API (/activity-drafts?activityType=PROVA)
 */
export interface ExamModelResponse {
  id: string;
  type: ExamDraftType;
  activityType: ExamActivityCategory;
  title: string | null;
  creatorUserInstitutionId: string | null;
  subjectId: string | null;
  subject?: { id: string; name: string } | null;
  filters: ExamDraftFilters | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Exam model/draft table item for display
 */
export interface ExamModelTableItem extends Record<string, unknown> {
  id: string;
  title: string;
  savedAt: string;
  subject: string;
  subjectId: string | null;
}

/**
 * Exam models/drafts API response from /activity-drafts endpoint
 * Note: Uses activityDrafts field (not examDrafts) since we now use /activity-drafts?activityType=PROVA
 */
export interface ExamModelsApiResponse {
  message: string;
  data: {
    activityDrafts: ExamModelResponse[];
    total: number;
  };
}

/**
 * Exam model/draft filters for API query
 */
export interface ExamModelFilters {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  type?: ExamDraftType;
  activityType?: ExamActivityCategory;
}

/**
 * Exam models pagination interface
 */
export interface ExamModelsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
