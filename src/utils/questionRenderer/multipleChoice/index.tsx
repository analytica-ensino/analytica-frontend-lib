import type { ReactNode } from 'react';
import { ANSWER_STATUS } from '../../../components/Quiz/useQuizStore';
import { MultipleChoiceList } from '../../../components/MultipleChoice/MultipleChoice';
import Text from '../../../components/Text/Text';
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
  // Check if options have isCorrect defined (can auto-validate even if pending)
  const hasAutoValidation = result?.options?.some(
    (op) => op.isCorrect !== undefined && op.isCorrect !== null
  );

  const choices = question.options?.map((option) => {
    const isCorrectOption =
      result?.options?.find((op) => op.id === option.id)?.isCorrect || false;

    const isSelected = result?.selectedOptions?.some(
      (op) => op.optionId === option.id
    );

    // Show correct/incorrect status if not pending/blank, OR if we can auto-validate (has isCorrect)
    const shouldShowCorrectAnswers =
      (result?.answerStatus !== ANSWER_STATUS.PENDENTE_AVALIACAO &&
        result?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO) ||
      hasAutoValidation;

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
      // When pending evaluation and no auto-validation, show all options as neutral
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
