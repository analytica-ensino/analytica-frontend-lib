/**
 * Exam Details Types
 *
 * This file contains types for the exam details page,
 * including student results, statistics, and status enums.
 */

/**
 * Student answer status enum
 * Represents the state of a student's answer sheet submission
 */
export enum StudentAnswerStatus {
  AWAITING_ANSWER_SHEET = 'AWAITING_ANSWER_SHEET',
  ANSWER_SHEET_RECEIVED = 'ANSWER_SHEET_RECEIVED',
}

/**
 * Student answer display status for UI
 */
export enum StudentAnswerDisplayStatus {
  AWAITING_ANSWER_SHEET = 'Aguardando gabarito',
  ANSWER_SHEET_RECEIVED = 'Gabarito recebido',
}

/**
 * Student result in exam table
 */
export interface ExamStudentResult {
  id: string;
  studentId: string;
  studentName: string;
  status: StudentAnswerStatus;
  answerReceivedAt: string | null;
  score: number | null;
}

/**
 * Student table item for TableProvider
 * Extends Record<string, unknown> for compatibility with generic table
 */
export interface ExamStudentTableItem extends Record<string, unknown> {
  id: string;
  studentId: string;
  studentName: string;
  status: StudentAnswerStatus;
  answerReceivedAt: string | null;
  score: number | null;
}

/**
 * Exam statistics data
 */
export interface ExamStats {
  averageScore: number;
  mostCorrectQuestions: number[];
  mostIncorrectQuestions: number[];
  unansweredQuestions: number[];
}

/**
 * Exam details data (used for page display)
 */
export interface ExamDetailsData {
  id: string;
  title: string;
  startDate: string;
  school: string;
  className: string;
  createdAt: string;
  stats: ExamStats;
  students: ExamStudentResult[];
}

/**
 * Pagination data for exam details
 */
export interface ExamDetailsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Query filters for exam details
 */
export interface ExamDetailsFilters {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'score' | 'answeredAt';
  sortOrder?: 'asc' | 'desc';
  status?: string;
}
