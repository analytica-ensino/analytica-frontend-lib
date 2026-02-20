import type { ReactNode } from 'react';
import { ANSWER_STATUS } from '../../../components/Quiz/useQuizStore';
import { getStatusStyles } from '../../../components/Quiz/QuizContent';
import Text from '../../../components/Text/Text';
import { cn } from '../../../utils/utils';
import type { QuestionRendererProps } from '../types';
import { getStatusBadge } from '../components';
import { HtmlMathRenderer } from '../../../components/HtmlMathRenderer';

/**
 * Render true or false question
 * Each option has a statement, and student marks V or F for each
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionTrueOrFalse = ({
  question,
  result,
}: QuestionRendererProps): ReactNode => {
  const options = question.options || [];
  const getLetterByIndex = (index: number) => String.fromCodePoint(97 + index); // 97 = 'a' in ASCII

  const shouldShowStatus =
    result?.answerStatus !== ANSWER_STATUS.PENDENTE_AVALIACAO &&
    result?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO;

  return (
    <div className="pt-2">
      <div className="flex flex-col gap-3.5">
        {options.map((option, index) => {
          // In true/false, isCorrect indicates if the statement is TRUE
          const statementIsTrue =
            result?.options?.find((op) => op.id === option.id)?.isCorrect ||
            false;
          const isSelected = result?.selectedOptions?.some(
            (op) => op.optionId === option.id
          );

          // Determine if student's answer is correct
          // If statement is true and selected, or statement is false and not selected
          const isStudentCorrect = statementIsTrue === isSelected;

          const variantCorrect = statementIsTrue ? 'correct' : 'incorrect';
          const studentAnswer = isSelected ? 'V' : 'F';
          const correctAnswer = statementIsTrue ? 'V' : 'F';

          return (
            <section
              key={option.id || `option-${index}`}
              className="flex flex-col gap-2"
            >
              <div
                className={cn(
                  'flex flex-row justify-between items-center gap-2 p-2 rounded-md border',
                  shouldShowStatus ? getStatusStyles(variantCorrect) : ''
                )}
              >
                <Text as="span" size="sm" weight="normal" color="text-text-900">
                  {getLetterByIndex(index).concat(') ')}
                  <HtmlMathRenderer content={option.option} inline />
                </Text>

                {shouldShowStatus && (
                  <div className="flex-shrink-0">
                    {getStatusBadge(isStudentCorrect ? 'correct' : 'incorrect')}
                  </div>
                )}
              </div>

              {shouldShowStatus && (
                <span className="flex flex-row gap-2 items-center">
                  <Text size="2xs" weight="normal" color="text-text-800">
                    Resposta selecionada: {studentAnswer}
                  </Text>
                  {!isStudentCorrect && (
                    <Text size="2xs" weight="normal" color="text-text-800">
                      Resposta correta: {correctAnswer}
                    </Text>
                  )}
                </span>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
