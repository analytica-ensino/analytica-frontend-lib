import type { ReactNode } from 'react';
import type { QuestionRendererProps } from '../types';
import {
  ImageAnswerView,
  type ImagePoint,
} from '../../../components/shared/ImageAnswerView';
import {
  DEFAULT_IMAGE_TOLERANCE,
  parseImageCorrectPoint,
  parseImageStudentPoint,
} from '../../image/imageAnswer.utils';

/**
 * Render image question
 * Shows the question's image, the correct area and the student's click
 */
export const renderQuestionImage = ({
  question,
  result,
}: QuestionRendererProps): ReactNode => {
  const correctPoint: ImagePoint | null = parseImageCorrectPoint(
    question?.options
  );
  const studentPoint: ImagePoint | null = parseImageStudentPoint(result);

  return (
    <ImageAnswerView
      imageUrl={question?.additionalContent ?? ''}
      correctPoint={correctPoint}
      studentPoint={studentPoint}
      toleranceRadius={result?.imageTolerance ?? DEFAULT_IMAGE_TOLERANCE}
    />
  );
};
