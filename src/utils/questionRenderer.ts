import type { ReactNode } from 'react';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

export type QuestionRendererMap = Record<QUESTION_TYPE, () => ReactNode>;

export const renderFromMap = (
  renderers: QuestionRendererMap,
  questionType?: QUESTION_TYPE
) => {
  if (!questionType) return null;
  const renderer = renderers[questionType];
  return renderer ? renderer() : null;
};
