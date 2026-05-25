import type { ReactNode } from 'react';
import { ANSWER_STATUS } from '../../../components/Quiz/useQuizStore';
import { AlternativesList } from '../../../components/Alternative/Alternative';
import { OptionStatus } from '../../../enums/Options';
import Text from '../../../components/Text/Text';
import type { QuestionRendererProps } from '../types';

/**
 * Render alternative question (single choice)
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionAlternative = ({
  question,
  result,
}: QuestionRendererProps): ReactNode => {
  // Check if options have isCorrect defined (can auto-validate even if pending)
  const hasAutoValidation = result?.options?.some(
    (op) => op.isCorrect !== undefined && op.isCorrect !== null
  );

  const alternatives = question.options?.map((option) => {
    const isCorrectOption =
      result?.options?.find((op) => op.id === option.id)?.isCorrect || false;

    const isSelected =
      result?.selectedOptions?.some(
        (selectedOption) => selectedOption.optionId === option.id
      ) || false;

    // Show correct answers if not pending, OR if we can auto-validate (has isCorrect)
    const shouldShowCorrectAnswers =
      result?.answerStatus !== ANSWER_STATUS.PENDENTE_AVALIACAO ||
      hasAutoValidation;

    let status: OptionStatus;
    if (shouldShowCorrectAnswers) {
      if (isCorrectOption) {
        status = OptionStatus.CORRECT;
      } else if (isSelected && !isCorrectOption) {
        status = OptionStatus.INCORRECT;
      } else {
        status = OptionStatus.NEUTRAL;
      }
    } else {
      // When pending evaluation and no auto-validation, show all options as neutral
      status = OptionStatus.NEUTRAL;
    }

    return {
      label: option.option,
      value: option.id,
      status: status,
    };
  });

  if (!alternatives || alternatives.length === 0) {
    return (
      <div>
        <Text size="sm" weight="normal">
          Não há Alternativas
        </Text>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <AlternativesList
        mode="readonly"
        key={`question-${question.id}`}
        name={`question-${question.id}`}
        layout="compact"
        alternatives={alternatives}
        selectedValue={result?.selectedOptions?.[0]?.optionId || ''}
      />
    </div>
  );
};
