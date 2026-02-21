/**
 * Activity Details Types
 * Types and helper functions for activity details components
 */

import { z } from 'zod';

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
 * Zod schema for student activity status
 */
export const studentActivityStatusSchema = z.enum([
  STUDENT_ACTIVITY_STATUS.CONCLUIDO,
  STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO,
  STUDENT_ACTIVITY_STATUS.AGUARDANDO_RESPOSTA,
  STUDENT_ACTIVITY_STATUS.NAO_ENTREGUE,
]);

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
  notAnswered: number;
}

/**
 * Activity metadata interface
 */
export interface ActivityMetadata {
  id: string;
  title: string;
  type?: string;
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

/**
 * Quiz API response
 */
export interface QuizResponse {
  message: string;
  data: ActivityMetadata;
}

/**
 * Activity details API response (without activity)
 */
export interface ActivityDetailsApiResponse {
  message: string;
  data: Omit<ActivityDetailsData, 'activity'>;
}

/**
 * Presigned URL response
 */
export interface PresignedUrlResponse {
  data: {
    url: string;
    fields: Record<string, string>;
  };
}
