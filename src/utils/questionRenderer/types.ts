import type {
  Question,
  QuestionResult,
} from '../../components/Quiz/useQuizStore';
import { OptionStatus } from '../../components/Alternative/Alternative';

// Re-export OptionStatus for backward compatibility
export { OptionStatus as Status };

/**
 * Props for question renderers
 */
export interface QuestionRendererProps {
  question: Question;
  result: QuestionResult['answers'][number];
}
