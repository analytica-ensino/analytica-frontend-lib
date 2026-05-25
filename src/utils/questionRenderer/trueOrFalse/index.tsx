import type { ReactNode } from 'react';
import { ANSWER_STATUS } from '../../../components/Quiz/useQuizStore';
import { getStatusStyles } from '../../../components/Quiz/QuizContent';
import Text from '../../../components/Text/Text';
import { cn } from '../../../utils/utils';
import type { QuestionRendererProps } from '../types';
import { getStatusBadge } from '../components';
import { HtmlMathRenderer } from '../../../components/HtmlMathRenderer';
import { TrueFalseEnum } from '../../../enums/Quiz';
import { OptionStatus } from '../../../components/Alternative/Alternative';

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
          // Find student's answer for this option
          const studentSelection = result?.selectedOptions?.find(
            (op) => op.optionId === option.id
          );

          // Get the correct answer from options array (if the statement is true or false)
          const correctAnswerOption = result?.options?.find(
            (op) => op.id === option.id
          );
          const hasCorrectAnswer = correctAnswerOption?.isCorrect !== undefined;
          const statementIsTrue = correctAnswerOption?.isCorrect ?? false;

          // Student's answer: isCorrect in selectedOptions represents what user marked
          // isCorrect: true = user marked V (Verdadeiro)
          // isCorrect: false = user marked F (Falso)
          const hasAnswered = studentSelection !== undefined;
          const studentMarkedTrue = studentSelection?.isCorrect ?? false;

          // Determine if student's answer is correct (only valid when we have the correct answer)
          // Student is correct if their mark matches the statement's truth value
          const isStudentCorrect =
            hasCorrectAnswer &&
            hasAnswered &&
            studentMarkedTrue === statementIsTrue;

          // Only show correctness styling when we have the official answer
          const canShowCorrectness = shouldShowStatus && hasCorrectAnswer;
          const variantCorrect = isStudentCorrect
            ? OptionStatus.CORRECT
            : OptionStatus.INCORRECT;
          const studentAnswer = studentMarkedTrue
            ? TrueFalseEnum.VERDADEIRO
            : TrueFalseEnum.FALSO;
          const correctAnswer = statementIsTrue
            ? TrueFalseEnum.VERDADEIRO
            : TrueFalseEnum.FALSO;

          return (
            <section
              key={option.id || `option-${index}`}
              className="flex flex-col gap-2"
            >
              <div
                className={cn(
                  'flex flex-row justify-between items-center gap-2 p-2 rounded-md border',
                  canShowCorrectness && hasAnswered
                    ? getStatusStyles(variantCorrect)
                    : ''
                )}
              >
                <Text as="span" size="sm" weight="normal" color="text-text-900">
                  {getLetterByIndex(index).concat(') ')}
                  <HtmlMathRenderer content={option.option} inline />
                </Text>

                {canShowCorrectness && hasAnswered && (
                  <div className="flex-shrink-0">
                    {getStatusBadge(
                      isStudentCorrect
                        ? OptionStatus.CORRECT
                        : OptionStatus.INCORRECT
                    )}
                  </div>
                )}
              </div>

              {canShowCorrectness && (
                <span className="flex flex-row gap-2 items-center flex-wrap">
                  {hasAnswered ? (
                    <>
                      <Text size="2xs" weight="normal" color="text-text-800">
                        Resposta selecionada: {studentAnswer}
                      </Text>
                      {!isStudentCorrect && (
                        <Text size="2xs" weight="normal" color="text-text-800">
                          | Resposta correta: {correctAnswer}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text size="2xs" weight="normal" color="text-text-800">
                      Não respondida | Resposta correta: {correctAnswer}
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
