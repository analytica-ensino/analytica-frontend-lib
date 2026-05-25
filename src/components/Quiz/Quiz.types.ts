import type { QuestionResult } from './useQuizStore';
import { OptionStatus } from '../Alternative/Alternative';

export enum QuizVariant {
  DEFAULT = 'default',
  INTERACTIVE = 'interactive',
  READONLY = 'readonly',
  RESULT = 'result',
}

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
  variantCorrect: OptionStatus;
}
