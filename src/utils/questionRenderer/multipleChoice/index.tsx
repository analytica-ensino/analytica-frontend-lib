import type { ReactNode } from 'react';
import { ANSWER_STATUS } from '../../../components/Quiz/useQuizStore';
import { MultipleChoiceList } from '../../../components/MultipleChoice/MultipleChoice';
import Text from '@/components/Text/Text';
import type { QuestionRendererProps } from '../types';
import { Status } from '../types';

/**
 * Render multiple choice question
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionMultipleChoice = ({
  question,
  result,
}: QuestionRendererProps): ReactNode => {
  const choices = question.options?.map((option) => {
    const isCorrectOption =
      result?.options?.find((op) => op.id === option.id)?.isCorrect || false;

    const isSelected = result?.selectedOptions?.some(
      (op) => op.optionId === option.id
    );

    // Only show correct/incorrect status if answer is not pending evaluation
    const shouldShowCorrectAnswers =
      result?.answerStatus !== ANSWER_STATUS.PENDENTE_AVALIACAO &&
      result?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO;

    let status: Status;
    if (shouldShowCorrectAnswers) {
      if (isCorrectOption) {
        status = Status.CORRECT;
      } else if (isSelected && !isCorrectOption) {
        status = Status.INCORRECT;
      } else {
        status = Status.NEUTRAL;
      }
    } else {
      // When pending evaluation, show all options as neutral
      status = Status.NEUTRAL;
    }

    return {
      label: option.option,
      value: option.id,
      status,
    };
  });

  if (!choices || choices.length === 0) {
    return (
      <div>
        <Text size="sm" weight="normal">
          Não há Escolhas Múltiplas
        </Text>
      </div>
    );
  }

  const selectedValues =
    result?.selectedOptions?.map((op) => op.optionId) || [];

  return (
    <div className="pt-2">
      <MultipleChoiceList
        mode="readonly"
        key={`question-${question.id}`}
        name={`question-${question.id}`}
        choices={choices}
        selectedValues={selectedValues}
      />
    </div>
  );
};
