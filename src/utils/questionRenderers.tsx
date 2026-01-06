import { ReactNode, useId } from 'react';
import {
  Question,
  QuestionResult,
  ANSWER_STATUS,
} from '../components/Quiz/useQuizStore';
import { AlternativesList } from '../components/Alternative/Alternative';
import { MultipleChoiceList } from '../components/MultipleChoice/MultipleChoice';
import Badge from '../components/Badge/Badge';
import { CheckCircle, XCircle } from 'phosphor-react';
import { cn } from './utils';
import ImageQuestion from '../assets/img/mock-image-question.png';

enum Status {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  NEUTRAL = 'neutral',
}

/**
 * Props for question renderers
 */
export interface QuestionRendererProps {
  question: Question;
  result: QuestionResult['answers'][number];
  paddingBottom?: string;
}

/**
 * Subtitle component for question sections
 */
const QuestionSubTitle = ({ subTitle }: { subTitle: string }) => {
  return (
    <div className="px-4 pb-2 pt-6">
      <p className="font-bold text-lg text-text-950">{subTitle}</p>
    </div>
  );
};

/**
 * Container component for question content
 */
const QuestionContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'bg-background rounded-t-xl px-4 pt-4 pb-[80px] h-auto flex flex-col gap-4 mb-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Render alternative question (single choice)
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionAlternative = ({
  question,
  result,
  paddingBottom: _paddingBottom,
}: QuestionRendererProps): ReactNode => {
  const alternatives = question.options?.map((option) => {
    let status: Status = Status.NEUTRAL;

    const isCorrectOption =
      result?.options?.find((op) => op.id === option.id)?.isCorrect || false;

    const isSelected = result?.selectedOptions.some(
      (selectedOption) => selectedOption.optionId === option.id
    );

    // Only show correct/incorrect status if answer is not pending evaluation
    const shouldShowCorrectAnswers =
      result?.answerStatus !== ANSWER_STATUS.PENDENTE_AVALIACAO &&
      result?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO;

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
      status: status,
    };
  });

  if (!alternatives || alternatives.length === 0) {
    return (
      <div>
        <p>Não há Alternativas</p>
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
        value={result?.selectedOptions[0]?.optionId || ''}
        selectedValue={result?.selectedOptions[0]?.optionId || ''}
        onValueChange={() => {
          // Readonly mode, no action needed
        }}
      />
    </div>
  );
};

/**
 * Render multiple choice question
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionMultipleChoice = ({
  question,
  result,
  paddingBottom: _paddingBottom,
}: QuestionRendererProps): ReactNode => {
  const choices = question.options?.map((option) => {
    let status: Status = Status.NEUTRAL;

    const isCorrectOption =
      result?.options?.find((op) => op.id === option.id)?.isCorrect || false;

    const isSelected = result?.selectedOptions?.some(
      (op) => op.optionId === option.id
    );

    // Only show correct/incorrect status if answer is not pending evaluation
    const shouldShowCorrectAnswers =
      result?.answerStatus !== ANSWER_STATUS.PENDENTE_AVALIACAO &&
      result?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO;

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
      status: status,
    };
  });

  if (!choices || choices.length === 0) {
    return (
      <div>
        <p>Não há Escolhas Múltiplas</p>
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
        onHandleSelectedValues={() => {
          // Readonly mode, no action needed
        }}
      />
    </div>
  );
};

/**
 * Get status badge component
 */
const getStatusBadge = (status?: 'correct' | 'incorrect') => {
  switch (status) {
    case 'correct':
      return (
        <Badge variant="solid" action="success" iconLeft={<CheckCircle />}>
          Resposta correta
        </Badge>
      );
    case 'incorrect':
      return (
        <Badge variant="solid" action="error" iconLeft={<XCircle />}>
          Resposta incorreta
        </Badge>
      );
    default:
      return null;
  }
};

/**
 * Get status styles for background
 */
const getStatusStyles = (variantCorrect?: string) => {
  switch (variantCorrect) {
    case 'correct':
      return 'bg-success-background border-success-300';
    case 'incorrect':
      return 'bg-error-background border-error-300';
    default:
      return '';
  }
};

/**
 * Render true or false question
 * Each option has a statement, and student marks V or F for each
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionTrueOrFalse = ({
  question,
  result,
  paddingBottom: _paddingBottom,
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
                <p className="text-text-900 text-sm">
                  {getLetterByIndex(index).concat(') ').concat(option.option)}
                </p>

                {shouldShowStatus && (
                  <div className="flex-shrink-0">
                    {getStatusBadge(isStudentCorrect ? 'correct' : 'incorrect')}
                  </div>
                )}
              </div>

              {shouldShowStatus && (
                <span className="flex flex-row gap-2 items-center">
                  <p className="text-text-800 text-2xs">
                    Resposta selecionada: {studentAnswer}
                  </p>
                  {!isStudentCorrect && (
                    <p className="text-text-800 text-2xs">
                      Resposta correta: {correctAnswer}
                    </p>
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

/**
 * Render essay/dissertative question (readonly mode for correction)
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionDissertative = ({
  question: _question,
  result,
  paddingBottom: _paddingBottom,
}: QuestionRendererProps): ReactNode => {
  const localAnswer = result?.answer || '';

  return (
    <div className="pt-2 space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-text-950">Resposta do aluno</p>
        <div className="p-3 bg-background-50 rounded-lg border border-border-100">
          <p className="text-sm text-text-700 whitespace-pre-wrap">
            {localAnswer || 'Nenhuma resposta fornecida'}
          </p>
        </div>
      </div>

      {result?.answerStatus === ANSWER_STATUS.RESPOSTA_INCORRETA &&
        result?.teacherFeedback && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-500">
              Observação do professor:
            </p>
            <div className="p-3 bg-background-50 rounded-lg border border-border-100">
              <p className="text-sm text-text-700 whitespace-pre-wrap">
                {result.teacherFeedback}
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

/**
 * Render fill in the blanks question
 * Shows text with student answers highlighted (green if correct, red if wrong)
 * Also shows a "gabarito" section with correct answers
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionFill = ({
  question,
  result,
  paddingBottom: _paddingBottom,
}: QuestionRendererProps): ReactNode => {
  // Extract text from statement - it should contain {{placeholders}}
  const text = question.statement || '';
  const baseId = useId();

  // Parse student answer - assuming it's stored in result.answer as JSON or structured data
  // For now, we'll need to extract from the answer field
  // The answer might be structured or we need to parse placeholders from the statement
  const studentAnswers: Record<
    string,
    { answer: string; isCorrect: boolean; correctAnswer: string }
  > = {};

  // Try to parse answer if it's JSON, otherwise use empty object
  try {
    if (result?.answer) {
      const parsed =
        typeof result.answer === 'string'
          ? JSON.parse(result.answer)
          : result.answer;
      if (typeof parsed === 'object') {
        Object.assign(studentAnswers, parsed);
      }
    }
  } catch {
    // If parsing fails, use empty object
  }

  // Extract placeholders from text
  const regex = /\{\{([\p{L}\p{M}\d_]+)\}\}/gu;
  const placeholders: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    placeholders.push(match[1]);
  }

  // Build correct answers from options - each placeholder should map to a correct option
  // For fill questions, options might contain the correct answers for each placeholder
  const correctAnswers: Record<string, string> = {};
  placeholders.forEach((placeholder, index) => {
    // Try to find correct answer from options
    // Options might be indexed or have a specific structure
    const correctOption = result?.options?.find((op) => op.isCorrect);
    if (correctOption) {
      correctAnswers[placeholder] = correctOption.option;
    } else if (result?.options && result.options[index]) {
      // Fallback: use option at same index
      correctAnswers[placeholder] = result.options[index].option;
    } else {
      correctAnswers[placeholder] = `[${placeholder}]`; // Final fallback
    }
  });

  const renderTextWithAnswers = (isGabarito = false) => {
    const elements: Array<{ element: string | ReactNode; id: string }> = [];
    let lastIndex = 0;
    let elementCounter = 0;

    regex.lastIndex = 0; // Reset regex
    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, selectId] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        elements.push({
          element: text.slice(lastIndex, startIndex),
          id: `${baseId}-text-${++elementCounter}`,
        });
      }

      if (isGabarito) {
        // Show correct answer in green with underline
        const correctAnswer = correctAnswers[selectId] || `[${selectId}]`;
        elements.push({
          element: (
            <span
              key={`${baseId}-gabarito-${selectId}`}
              className="inline-flex mb-2.5 text-success-600 font-semibold text-md border-b-2 border-success-600"
            >
              {correctAnswer}
            </span>
          ),
          id: `${baseId}-gabarito-${++elementCounter}`,
        });
      } else {
        // Show student answer with color based on correctness
        const studentAnswer = studentAnswers[selectId];
        if (studentAnswer) {
          const isCorrect = studentAnswer.isCorrect;
          const colorClass = isCorrect
            ? 'text-success-600 border-success-600'
            : 'text-error-600 border-error-600';
          elements.push({
            element: (
              <Badge
                key={`${baseId}-answer-${selectId}`}
                variant="solid"
                action={isCorrect ? 'success' : 'error'}
                iconRight={isCorrect ? <CheckCircle /> : <XCircle />}
                size="large"
                className={`py-3 w-[180px] justify-between mb-2.5 ${colorClass}`}
              >
                <span className="text-text-900">{studentAnswer.answer}</span>
              </Badge>
            ),
            id: `${baseId}-answer-${++elementCounter}`,
          });
        } else {
          // No answer provided
          elements.push({
            element: (
              <span
                key={`${baseId}-no-answer-${selectId}`}
                className="inline-flex mb-2.5 text-text-400 text-md border-b-2 border-text-300"
              >
                [Não respondido]
              </span>
            ),
            id: `${baseId}-no-answer-${++elementCounter}`,
          });
        }
      }

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < text.length) {
      elements.push({
        element: text.slice(lastIndex),
        id: `${baseId}-text-${++elementCounter}`,
      });
    }

    return elements;
  };

  return (
    <div className="pt-2 space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-500">
          Resposta do aluno:
        </p>
        <div className="p-3 bg-background-50 rounded-lg border border-border-100">
          <div className="text-lg text-text-900 leading-8">
            {renderTextWithAnswers(false).map((element) => (
              <span key={element.id}>{element.element}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-500">Gabarito:</p>
        <div className="p-3 bg-background-50 rounded-lg border border-border-100">
          <div className="text-lg text-text-900 leading-8">
            {renderTextWithAnswers(true).map((element) => (
              <span key={element.id}>{element.element}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Render image question
 * Shows image with clickable area, correct answer circle, and user's answer circle
 */
export const renderQuestionImage = ({
  question: _question,
  result,
  paddingBottom: _paddingBottom,
}: QuestionRendererProps): ReactNode => {
  // Extract position data from result or question
  // Assuming correct position is stored in question metadata or result
  const correctPositionRelative = { x: 0.48, y: 0.45 }; // Default, should come from question data
  const correctRadiusRelative = 0.1; // Default radius

  // Get user's answer position from result
  // This would typically be stored in result.answer as coordinates
  let userPositionRelative: { x: number; y: number } | null = null;
  try {
    if (result?.answer) {
      const parsed =
        typeof result.answer === 'string'
          ? JSON.parse(result.answer)
          : result.answer;
      if (
        parsed &&
        typeof parsed.x === 'number' &&
        typeof parsed.y === 'number'
      ) {
        userPositionRelative = { x: parsed.x, y: parsed.y };
      }
    }
  } catch {
    // If parsing fails, no user position
  }

  // Determine if answer is correct (within radius)
  const isCorrect = userPositionRelative
    ? Math.sqrt(
        Math.pow(userPositionRelative.x - correctPositionRelative.x, 2) +
          Math.pow(userPositionRelative.y - correctPositionRelative.y, 2)
      ) <= correctRadiusRelative
    : false;

  const getUserCircleColorClasses = () => {
    if (!userPositionRelative) return '';
    return isCorrect
      ? 'bg-success-600/70 border-white'
      : 'bg-indicator-error/70 border-white';
  };

  return (
    <div className="pt-2 space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indicator-primary/70 border border-[#F8CC2E]"></div>
          <span className="text-text-600 font-medium text-sm">
            Área correta
          </span>
        </div>
        {userPositionRelative && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success-600/70 border border-white"></div>
              <span className="text-text-600 font-medium text-sm">
                Resposta correta
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indicator-error/70 border border-white"></div>
              <span className="text-text-600 font-medium text-sm">
                Resposta incorreta
              </span>
            </div>
          </>
        )}
      </div>

      {/* Image container */}
      <div className="relative w-full">
        <img
          src={ImageQuestion}
          alt="Question"
          className="w-full h-auto rounded-md"
        />

        {/* Correct answer circle */}
        <div
          className="absolute rounded-full bg-indicator-primary/70 border-4 border-[#F8CC2E] pointer-events-none"
          style={{
            minWidth: '50px',
            maxWidth: '160px',
            width: '15%',
            aspectRatio: '1 / 1',
            left: `calc(${correctPositionRelative.x * 100}% - 7.5%)`,
            top: `calc(${correctPositionRelative.y * 100}% - 15%)`,
          }}
        />

        {/* User's answer circle */}
        {userPositionRelative && (
          <div
            className={`absolute rounded-full border-4 pointer-events-none ${getUserCircleColorClasses()}`}
            style={{
              minWidth: '30px',
              maxWidth: '52px',
              width: '5%',
              aspectRatio: '1 / 1',
              left: `calc(${userPositionRelative.x * 100}% - 2.5%)`,
              top: `calc(${userPositionRelative.y * 100}% - 2.5%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Render connect dots question (not implemented)
 */
export const renderQuestionConnectDots = ({
  paddingBottom,
}: {
  paddingBottom?: string;
}): ReactNode => {
  return (
    <>
      <QuestionSubTitle subTitle="Tipo de questão: Ligar Pontos" />
      <QuestionContainer className={cn('', paddingBottom)}>
        <div className="space-y-4">
          <p className="text-text-600 text-md">
            Tipo de questão: Ligar Pontos (não implementado)
          </p>
        </div>
      </QuestionContainer>
    </>
  );
};
