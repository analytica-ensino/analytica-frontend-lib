import type { QuestionResult } from './useQuizStore';

/** Type for a single question answer result */
export type QuestionAnswerResult = QuestionResult['answers'][number];

/** Interface for true/false option computed state */
export interface TrueOrFalseOptionState {
  isStatementTrue: boolean;
  hasAnswered: boolean;
  studentMarkedTrue: boolean;
  studentAnswer: string;
  correctAnswer: string;
  isStudentCorrect: boolean;
  variantCorrect: 'correct' | 'incorrect';
}
