import { useMemo, useState, type ReactNode } from 'react';
import { CardAccordation } from '../Accordation/Accordation';
import { IconRender, Text, getSubjectColorWithOpacity, Badge } from '../../index';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { questionTypeLabels } from '../../types/questionTypes';
import { cn } from '../../utils/utils';
import { AlternativesList, type Alternative } from '../Alternative/Alternative';
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import { CheckCircle, XCircle } from 'phosphor-react';

interface ActivityCardQuestionPreviewProps {
  subjectName?: string;
  subjectColor?: string;
  iconName?: string;
  isDark?: boolean;
  questionType?: QUESTION_TYPE;
  /**
   * Optional label override when questionType is not provided.
   */
  questionTypeLabel?: string;
  enunciado?: string;
  question?: {
    options: { id: string; option: string }[];
    correctOptionIds?: string[];
  };
  defaultExpanded?: boolean;
  value?: string;
  className?: string;
  children?: ReactNode;
}

export const ActivityCardQuestionPreview = ({
  subjectName = 'Assunto não informado',
  subjectColor = '#000000',
  iconName = 'Book',
  isDark = false,
  questionType,
  questionTypeLabel,
  enunciado = 'Enunciado não informado',
  question,
  defaultExpanded = false,
  value,
  className,
  children,
}: ActivityCardQuestionPreviewProps) => {
  const badgeColor = getSubjectColorWithOpacity(subjectColor, isDark);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const correctOptionIds = question?.correctOptionIds || [];

  const resolvedQuestionTypeLabel = questionType
    ? questionTypeLabels[questionType]
    : questionTypeLabel || 'Tipo de questão';

  const alternatives = useMemo<Alternative[]>(() => {
    if (!question?.options || questionType !== QUESTION_TYPE.ALTERNATIVA) return [];

    return question.options.map((option) => {
      const isCorrect = correctOptionIds.includes(option.id);
      return {
        value: option.id,
        label: option.option,
        status: isCorrect ? ('correct' as const) : undefined,
        disabled: !isCorrect,
      };
    });
  }, [question, questionType, correctOptionIds]);

  const multipleChoices = useMemo(() => {
    if (!question?.options || questionType !== QUESTION_TYPE.MULTIPLA_ESCOLHA) return [];

    return question.options.map((option) => {
      const isCorrect = correctOptionIds.includes(option.id);
      return {
        value: option.id,
        label: option.option,
        status: isCorrect ? ('correct' as const) : undefined,
        disabled: !isCorrect,
      };
    });
  }, [question, questionType, correctOptionIds]);

  const renderAlternative = () => {
    if (alternatives.length === 0) return null;
    return (
      <div className="mt-4">
        <AlternativesList
          alternatives={alternatives}
          mode="readonly"
          layout="compact"
          selectedValue={correctOptionIds[0]}
          name={`preview-alternatives-${value ?? subjectName}`}
        />
      </div>
    );
  };

  const renderMultipleChoice = () => {
    if (multipleChoices.length === 0) return null;
    return (
      <div className="mt-4">
        <MultipleChoiceList
          choices={multipleChoices}
          mode="readonly"
          selectedValues={correctOptionIds}
          name={`preview-multiple-${value ?? subjectName}`}
        />
      </div>
    );
  };

  const renderTrueOrFalse = () => {
    if (!question?.options || question.options.length === 0) return null;
    return (
      <div className="mt-4">
        <div className="flex flex-col gap-3.5">
          {question.options.map((option, index) => {
            const isCorrect = correctOptionIds.includes(option.id);
            const correctAnswer = isCorrect ? 'Verdadeiro' : 'Falso';
            const variantCorrect = 'correct';

            return (
              <section key={option.id} className="flex flex-col gap-2">
                <div
                  className={cn(
                    'flex flex-row justify-between items-center gap-2 p-2 rounded-md border',
                    isCorrect
                      ? 'bg-success-background border-success-300'
                      : 'bg-error-background border-error-300'
                  )}
                >
                  <Text size="sm" className="text-text-900">
                    {String.fromCodePoint(97 + index)
                      .concat(') ')
                      .concat(option.option)}
                  </Text>

                  <div className="flex flex-row items-center gap-2 flex-shrink-0">
                    <Text size="sm" className="text-text-700">
                      Resposta correta: {correctAnswer}
                    </Text>
                    <Badge
                      variant="solid"
                      action={isCorrect ? 'success' : 'error'}
                      iconLeft={isCorrect ? <CheckCircle /> : <XCircle />}
                    >
                      {isCorrect ? 'Resposta correta' : 'Resposta incorreta'}
                    </Badge>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDissertative = () => {
    return (
      <div className="mt-4 px-2 py-4">
        <Text size="sm" className="text-text-600 italic">
          Resposta do aluno
        </Text>
      </div>
    );
  };

  const renderConnectDots = () => null;
  const renderFill = () => null;
  const renderImage = () => null;

  const questionRenderers: Record<QUESTION_TYPE, () => ReactNode> = {
    [QUESTION_TYPE.ALTERNATIVA]: renderAlternative,
    [QUESTION_TYPE.MULTIPLA_ESCOLHA]: renderMultipleChoice,
    [QUESTION_TYPE.DISSERTATIVA]: renderDissertative,
    [QUESTION_TYPE.VERDADEIRO_FALSO]: renderTrueOrFalse,
    [QUESTION_TYPE.LIGAR_PONTOS]: renderConnectDots,
    [QUESTION_TYPE.PREENCHER]: renderFill,
    [QUESTION_TYPE.IMAGEM]: renderImage,
  };

  const renderQuestionContent = () => {
    if (!questionType) return null;
    const renderer = questionRenderers[questionType];
    return renderer ? renderer() : null;
  };

  return (
    <div
      className="w-full"
      onClick={() => {
        if (isExpanded) {
          setIsExpanded(false);
        }
      }}
      onMouseDown={(event) => {
        // Avoid focus outline when clicking anywhere on the card
        event.preventDefault();
      }}
    >
      <CardAccordation
        className={cn(
          'w-full rounded-lg border border-border-200 bg-background',
          className
        )}
        expanded={isExpanded}
        onToggleExpanded={setIsExpanded}
        defaultExpanded={defaultExpanded}
        value={value}
        trigger={
          <div className="w-full min-w-0 flex flex-col gap-2 py-2">
            <div className="flex flex-row gap-2 text-text-650">
              <div className="py-1 px-2 flex flex-row items-center gap-1">
                <span
                  className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-950"
                  style={{
                    backgroundColor: badgeColor,
                  }}
                >
                  <IconRender iconName={iconName} size={14} color="currentColor" />
                </span>
                <Text size="sm">{subjectName}</Text>
              </div>

              <div className="py-1 px-2 flex flex-row items-center gap-1">
                <Text size="sm" className="">
                  {resolvedQuestionTypeLabel}
                </Text>
              </div>
            </div>

            {!isExpanded && (
              <Text
                size="md"
                weight="medium"
                className="text-text-950 truncate px-3"
              >
                {enunciado}
              </Text>
            )}
          </div>
        }
      >
        <Text
          size="md"
          weight="medium"
          className="text-text-950 break-words whitespace-pre-wrap"
        >
          {enunciado}
        </Text>
        {renderQuestionContent()}
        {children}
      </CardAccordation>
    </div>
  );
};

export type { ActivityCardQuestionPreviewProps };

