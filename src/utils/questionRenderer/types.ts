import type {
  Question,
  QuestionResult,
} from '../../components/Quiz/useQuizStore';

/**
 * Props for question renderers
 */
export interface QuestionRendererProps {
  question: Question;
  result: QuestionResult['answers'][number];
}
