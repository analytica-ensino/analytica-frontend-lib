import type { ReactNode } from 'react';
import type { QuestionRendererProps } from '../types';
import { FillQuestionContent } from '../components';

/**
 * Render fill in the blanks question
 * Shows text with student answers highlighted (green if correct, red if wrong)
 * Also shows a correct answers section
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionFill = ({
  question,
  result,
}: QuestionRendererProps): ReactNode => {
  return <FillQuestionContent question={question} result={result} />;
};
