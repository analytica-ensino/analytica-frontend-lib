/**
 * Exam History Types
 *
 * This file contains types related to the exam history feature,
 * including API responses, table items, and filters.
 *
 * Uses dedicated /exams/history endpoint which returns only exams (type=PROVA).
 */

/**
 * Filter option type for exam filters
 */
export interface ExamFilterOption {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Exam status enum - manually set by professor
 * Different from activity status (which is automatic based on dates)
 */
export enum ExamStatus {
  AGENDADA = 'AGENDADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

/**
 * Exam display status for UI
 */
export enum ExamDisplayStatus {
  AGENDADA = 'Agendada',
  EM_ANDAMENTO = 'Em andamento',
  FINALIZADA = 'Finalizada',
  CANCELADA = 'Cancelada',
}

/**
 * Map API exam status to display status
 * @param apiStatus - Status from backend API
 * @returns Formatted status for UI display
 */
export const mapExamStatusToDisplay = (
  apiStatus: ExamStatus
): ExamDisplayStatus => {
  const statusMap: Record<ExamStatus, ExamDisplayStatus> = {
    [ExamStatus.AGENDADA]: ExamDisplayStatus.AGENDADA,
    [ExamStatus.EM_ANDAMENTO]: ExamDisplayStatus.EM_ANDAMENTO,
    [ExamStatus.FINALIZADA]: ExamDisplayStatus.FINALIZADA,
    [ExamStatus.CANCELADA]: ExamDisplayStatus.CANCELADA,
  };
  return statusMap[apiStatus] || ExamDisplayStatus.AGENDADA;
};

/**
 * Filter options extracted from exams API responses
 */
export interface ExamApiFilterOptions {
  schools: ExamFilterOption[];
  classes: ExamFilterOption[];
  subjects: ExamFilterOption[];
  schoolYears: ExamFilterOption[];
}

/**
 * Generic entity reference with id and name
 */
type EntityRef = { id: string; name: string };

/**
 * Subject object from backend API response
 */
export interface ExamSubject extends EntityRef {
  areaKnowledgeId: string;
}

/**
 * Breakdown item per school/class for an exam response
 */
export interface ExamBreakdownItem {
  school?: EntityRef | null;
  schoolYear?: EntityRef | null;
  class?: EntityRef | null;
  totalStudents: number;
  answeredStudents: number;
  completionPercentage: number;
}

/**
 * Exam history response from backend API /exams/history
 */
export interface ExamHistoryResponse {
  id: string;
  title: string;
  startDate: string | null;
  status: ExamStatus;
  completionPercentage: number;
  questionCount: number;
  createdAt: string;
  subject: ExamSubject | null;
  creator: EntityRef | null;
  totalStudents?: number;
  answeredStudents?: number;
  breakdown?: ExamBreakdownItem[];
}

/**
 * Exam table item interface for exams list table
 *
 * Columns:
 * - startDate: Data da prova (inicio)
 * - title: Titulo
 * - school: Escola
 * - class: Turma
 * - status: Status (Agendada, Em andamento, Finalizada, Cancelada)
 * - questionCount: Questoes
 * - createdAt: Criada em
 * - completionPercentage: Conclusao
 */
export interface ExamTableItem extends Record<string, unknown> {
  id: string;
  startDate: string;
  title: string;
  school: string;
  class: string;
  status: ExamDisplayStatus;
  questionCount: number;
  createdAt: string;
  completionPercentage: number;
}

/**
 * Exams history API complete response from /exams/history endpoint
 */
export interface ExamsHistoryApiResponse {
  message: string;
  data: {
    exams: ExamHistoryResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Exam history filters for API query parameters
 */
export interface ExamHistoryFilters {
  page?: number;
  limit?: number;
  status?: ExamStatus;
  search?: string;
  startDate?: string;
  subjectId?: string;
  schoolId?: string;
  classId?: string;
  sortBy?: 'startDate' | 'title' | 'completionPercentage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Exam pagination interface
 */
export interface ExamPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
