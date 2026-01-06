import type { ReactNode } from 'react';
import { QUESTION_TYPE } from '../../components/Quiz/useQuizStore';
import { renderQuestionAlternative } from './alternative';
import { renderQuestionMultipleChoice } from './multipleChoice';
import { renderQuestionTrueOrFalse } from './trueOrFalse';
import { renderQuestionDissertative } from './dissertative';
import { renderQuestionFill } from './fill';
import { renderQuestionImage } from './image';
import { renderQuestionConnectDots } from './connectDots';
import type { QuestionRendererProps } from './types';

// Re-export types
export type { QuestionRendererProps } from './types';
export { Status } from './types';

// Re-export components
export {
  getStatusBadge,
  QuestionContainer,
  QuestionSubTitle,
  FillQuestionContent,
} from './components';

// Re-export individual renderers
export { renderQuestionAlternative } from './alternative';
export { renderQuestionMultipleChoice } from './multipleChoice';
export { renderQuestionTrueOrFalse } from './trueOrFalse';
export { renderQuestionDissertative } from './dissertative';
export { renderQuestionFill } from './fill';
export { renderQuestionImage } from './image';
export { renderQuestionConnectDots } from './connectDots';

/**
 * Map question types to their render functions
 */
const questionRendererMap = {
  [QUESTION_TYPE.ALTERNATIVA]: renderQuestionAlternative,
  [QUESTION_TYPE.MULTIPLA_ESCOLHA]: renderQuestionMultipleChoice,
  [QUESTION_TYPE.VERDADEIRO_FALSO]: renderQuestionTrueOrFalse,
  [QUESTION_TYPE.DISSERTATIVA]: renderQuestionDissertative,
  [QUESTION_TYPE.PREENCHER]: renderQuestionFill,
  [QUESTION_TYPE.IMAGEM]: renderQuestionImage,
  [QUESTION_TYPE.LIGAR_PONTOS]: renderQuestionConnectDots,
};

/**
 * Render question based on question type
 * @param props - Question renderer props
 * @returns Rendered question content
 */
export const renderQuestion = (props: QuestionRendererProps): ReactNode => {
  const { question } = props;
  const renderer = questionRendererMap[question.questionType];

  if (!renderer) {
    // Fallback: try to render based on options presence
    if (question.options && question.options.length > 0) {
      return renderQuestionAlternative(props);
    }
    return renderQuestionDissertative({ result: props.result });
  }

  // Handle renderers with different prop requirements
  switch (question.questionType) {
    case QUESTION_TYPE.DISSERTATIVA:
      return renderQuestionDissertative({ result: props.result });
    case QUESTION_TYPE.IMAGEM:
      return renderQuestionImage({ result: props.result });
    case QUESTION_TYPE.LIGAR_PONTOS:
      return renderQuestionConnectDots({ paddingBottom: '' });
    case QUESTION_TYPE.ALTERNATIVA:
    case QUESTION_TYPE.MULTIPLA_ESCOLHA:
    case QUESTION_TYPE.VERDADEIRO_FALSO:
    case QUESTION_TYPE.PREENCHER:
      return renderer(props);
    default:
      return null;
  }
};

/**
 * Type for question renderer map
 */
export type QuestionRendererMap = Record<QUESTION_TYPE, () => ReactNode>;

/**
 * Render from a map of renderers
 * @param renderers - Map of question type to render function
 * @param questionType - Type of question to render
 * @returns Rendered content or null
 */
export const renderFromMap = (
  renderers: QuestionRendererMap,
  questionType?: QUESTION_TYPE
) => {
  if (!questionType) return null;
  const renderer = renderers[questionType];
  return renderer ? renderer() : null;
};
