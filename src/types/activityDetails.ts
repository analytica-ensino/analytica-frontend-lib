/**
 * Activity Details Types
 * Types and helper functions for activity details components
 */

/**
 * Student activity status enum
 */
export const STUDENT_ACTIVITY_STATUS = {
  CONCLUIDO: 'CONCLUIDO',
  AGUARDANDO_CORRECAO: 'AGUARDANDO_CORRECAO',
  AGUARDANDO_RESPOSTA: 'AGUARDANDO_RESPOSTA',
  NAO_ENTREGUE: 'NAO_ENTREGUE',
} as const;

export type StudentActivityStatus =
  (typeof STUDENT_ACTIVITY_STATUS)[keyof typeof STUDENT_ACTIVITY_STATUS];

/**
 * Student data interface
 */
export interface ActivityStudentData {
  studentId: string;
  studentName: string;
  answeredAt: string | null;
  timeSpent: number;
  score: number | null;
  status: StudentActivityStatus;
}

/**
 * Pagination interface
 */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * General statistics interface
 */
export interface GeneralStats {
  averageScore: number;
  completionPercentage: number;
}

/**
 * Question statistics interface
 */
export interface QuestionStats {
  mostCorrect: number[];
  mostIncorrect: number[];
  notAnswered: number[];
}

/**
 * Activity metadata interface
 */
export interface ActivityMetadata {
  id: string;
  title: string;
  startDate: string | null;
  finalDate: string | null;
  schoolName: string;
  year: string;
  subjectName: string;
  className: string;
}

/**
 * Activity details data interface
 */
export interface ActivityDetailsData {
  activity?: ActivityMetadata;
  students: ActivityStudentData[];
  pagination: Pagination;
  generalStats: GeneralStats;
  questionStats: QuestionStats;
}

/**
 * Activity details query params interface
 */
export interface ActivityDetailsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'score' | 'answeredAt';
  sortOrder?: 'asc' | 'desc';
  status?: StudentActivityStatus;
}

/**
 * Activity student table item interface
 */
export interface ActivityStudentTableItem extends Record<string, unknown> {
  id: string;
  studentId: string;
  studentName: string;
  status: StudentActivityStatus;
  answeredAt: string | null;
  timeSpent: number;
  score: number | null;
}

/**
 * Status badge configuration interface
 */
export interface StatusBadgeConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

/**
 * Activity availability status enum
 * Used to determine if an activity is available based on start/end dates
 */
export const ACTIVITY_AVAILABILITY = {
  DISPONIVEL: 'DISPONIVEL',
  NAO_INICIADA: 'NAO_INICIADA',
  EXPIRADA: 'EXPIRADA',
} as const;

export type ActivityAvailability =
  (typeof ACTIVITY_AVAILABILITY)[keyof typeof ACTIVITY_AVAILABILITY];
