import type {
  Question,
  QuestionResult,
} from '../../components/Quiz/useQuizStore';
import type { QuestionStatus } from './constants';

/**
 * Correction data for essay questions (dissertativas)
 * Used for teacher evaluation of essay answers
 */
export interface EssayQuestionCorrection {
  /** Whether the answer is correct (true/false/null for not evaluated) */
  isCorrect: boolean | null;
  /** Teacher observation/feedback */
  teacherFeedback: string;
}

/**
 * Combined question data for correction modal
 * Combines Question (from Quiz format) with QuestionResult answer data
 */
export interface CorrectionQuestionData {
  /** Question data in Quiz format */
  question: Question;
  /** Student answer data from QuestionResult */
  result: QuestionResult['answers'][number];
  /** Question number in the activity (1-indexed) */
  questionNumber: number;
  /** Correction data for essay questions (only for DISSERTATIVA type) */
  correction?: EssayQuestionCorrection;
}

/**
 * Legacy interface for backward compatibility
 * @deprecated Use CorrectionQuestionData instead
 */
export interface StudentQuestion {
  questionNumber: number;
  status: QuestionStatus;
  studentAnswer?: string;
  correctAnswer?: string;
  questionText?: string;
  questionType?: string;
  alternatives?: Array<{
    value: string;
    label: string;
    isCorrect: boolean;
  }>;
  isCorrect?: boolean | null;
  teacherFeedback?: string;
}

/**
 * Student activity correction data interface
 * Uses Quiz format (Question + QuestionResult) for questions
 */
export interface StudentActivityCorrectionData {
  studentId: string;
  studentName: string;
  score: number | null;
  correctCount: number;
  incorrectCount: number;
  blankCount: number;
  /** Questions with their answers in Quiz format */
  questions: CorrectionQuestionData[];
  /** Teacher observation text (general observation for the activity) */
  observation?: string;
  /** URL of attached file */
  attachment?: string;
}

/**
 * Payload for saving question correction (for essay questions)
 */
export interface SaveQuestionCorrectionPayload {
  /** Question ID from Question interface */
  questionId: string;
  /** Whether the answer is correct */
  isCorrect: boolean;
  /** Teacher observation/feedback */
  teacherFeedback?: string;
}

/**
 * API response structure for fetchQuestionsAnswersByStudent
 * Returns student answers and statistics for an activity
 */
export interface QuestionsAnswersByStudentResponse {
  data: QuestionResult;
}
