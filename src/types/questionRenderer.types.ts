import type { Question, QuestionResult } from '../components/Quiz/useQuizStore';

export enum Status {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  NEUTRAL = 'neutral',
}

/**
 * Props for question renderers
 */
export interface QuestionRendererProps {
  question: Question;
  result: QuestionResult['answers'][number];
}
