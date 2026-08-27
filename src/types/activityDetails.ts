/**
 * Activity Details Types
 * Types and helper functions for activity details components
 */

import { z } from 'zod';
import type { Question } from './questions';

/**
 * Student activity status enum
 */
export const STUDENT_ACTIVITY_STATUS = {
  CONCLUIDO: 'CONCLUIDO',
  AGUARDANDO_CORRECAO: 'AGUARDANDO_CORRECAO',
  AGUARDANDO_RESPOSTA: 'AGUARDANDO_RESPOSTA',
  NAO_ENTREGUE: 'NAO_ENTREGUE',
  /** Physical test (presencial): student hasn't submitted the answer sheet yet */
  AWAITING_ANSWER_SHEET: 'AGUARDANDO_GABARITO',
  /** Physical test (presencial): answer sheet has been received and processed */
  ANSWER_SHEET_RECEIVED: 'GABARITO_RECEBIDO',
} as const;

export type StudentActivityStatus =
  (typeof STUDENT_ACTIVITY_STATUS)[keyof typeof STUDENT_ACTIVITY_STATUS];

/**
 * Delivery state of a physical sheet handed back by the student in an in-person
 * exam. Kept apart from `STUDENT_ACTIVITY_STATUS` because it answers a narrower
 * question — "did this sheet arrive?" — and applies to each sheet (answers,
 * essay) on its own.
 */
export const PRESENCIAL_DELIVERY_STATUS = {
  AWAITING: 'AGUARDANDO',
  RECEIVED: 'RECEBIDO',
} as const;

export type PresencialDeliveryStatus =
  (typeof PRESENCIAL_DELIVERY_STATUS)[keyof typeof PRESENCIAL_DELIVERY_STATUS];

/**
 * Zod schema for student activity status
 */
export const studentActivityStatusSchema = z.enum([
  STUDENT_ACTIVITY_STATUS.CONCLUIDO,
  STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO,
  STUDENT_ACTIVITY_STATUS.AGUARDANDO_RESPOSTA,
  STUDENT_ACTIVITY_STATUS.NAO_ENTREGUE,
  STUDENT_ACTIVITY_STATUS.AWAITING_ANSWER_SHEET,
  STUDENT_ACTIVITY_STATUS.ANSWER_SHEET_RECEIVED,
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
  /**
   * Delivery state of the essay sheet. In-person exams are printed with an
   * essay sheet attached, which the teacher scans along with the answer sheet —
   * so it is delivered (or not) independently of the answers.
   */
  essayStatus?: PresencialDeliveryStatus | null;
  /** When the essay sheet was received */
  essayReceivedAt?: string | null;
  /**
   * Delivery state of the answer sheet, as stated by `GET /exams/:id/results`.
   * In-person exams only; `status` carries the equivalent value for the
   * consumers that predate this field.
   */
  answerSheetStatus?: PresencialDeliveryStatus | null;
  /**
   * Essay grade, 0-1000. A different scale from `score` (0-10) — the two are
   * never summed or averaged together.
   */
  essayScore?: number | null;
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
  type?: string;
  subtype?: string;
  isDigital?: boolean | null;
  /**
   * Essay theme required by the activity; null when it requires no essay.
   * Only ever set on in-person exams.
   */
  essayThemeId?: string | null;
  /** Creation timestamp returned by GET /activities/:id/quiz */
  createdAt?: string | null;
  startDate: string | null;
  finalDate: string | null;
  schoolName: string;
  year: string;
  /** @deprecated Never returned by the API; use `subjects` */
  subjectName?: string;
  /** Subject names the activity covers, derived from `questions` */
  subjects?: string[];
  /** Questions returned by GET /activities/:id/quiz */
  questions?: Question[];
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
  /**
   * Whether the exam was printed with an essay sheet, from
   * `GET /exams/:id/results`. Drives the redação columns: an exam without a
   * theme has no essay to wait for, so the columns are dropped instead of
   * showing two empty cells per student.
   */
  requiresEssay?: boolean;
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
  /** Essay sheet delivery state (in-person exams only) */
  essayStatus?: PresencialDeliveryStatus | null;
  /** When the essay sheet was received (in-person exams only) */
  essayReceivedAt?: string | null;
  /** Answer sheet delivery state (in-person exams only) */
  answerSheetStatus?: PresencialDeliveryStatus | null;
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
    signedUrl: string;
    publicUrl: string;
  };
}
