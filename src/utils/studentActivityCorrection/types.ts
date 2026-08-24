import type {
  Question,
  QuestionResult,
} from '../../components/Quiz/useQuizStore';
import type { QuestionStatus } from './constants';

/**
 * Teacher's correction data for a single question
 *
 * `isCorrect` only carries a value for essay questions (dissertativas), which
 * the teacher grades by hand. Objective questions are graded automatically, so
 * it stays `null` there and only `teacherFeedback` is editable.
 */
export interface QuestionCorrection {
  /** Whether the answer is correct (true/false/null when not manually graded) */
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
  /** Teacher's correction data (grading for DISSERTATIVA, comment for any type) */
  correction?: QuestionCorrection;
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
export interface SaveQuestionCorrectionPayload extends Record<string, unknown> {
  /** Question ID from Question interface */
  questionId: string;
  /** Whether the answer is correct */
  isCorrect?: boolean | null;
  /** Score for the question */
  score?: number | null;
  /** Teacher observation/feedback */
  teacherFeedback?: string | null;
}

/**
 * Payload for saving a teacher comment on a single question
 *
 * Unlike {@link SaveQuestionCorrectionPayload}, this carries no grading: it is
 * valid on objective questions, whose status is computed automatically and must
 * not change when a teacher writes a note. An empty string clears the comment.
 */
export interface SaveQuestionCommentPayload extends Record<string, unknown> {
  /** Question ID from Question interface */
  questionId: string;
  /** Teacher comment shown to the student beside this question */
  teacherFeedback: string;
}

/**
 * API response structure for fetchQuestionsAnswersByStudent
 * Returns student answers and statistics for an activity
 */
export interface QuestionsAnswersByStudentResponse {
  data: QuestionResult;
}
