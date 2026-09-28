import { useId, useMemo, type ReactNode } from 'react';
import {
  IconRender,
  Text,
  getSubjectColorWithOpacity,
  Badge,
} from '../../index';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { questionTypeLabels } from '../../types/questionTypes';
import { cn } from '../../utils/utils';
import { AlternativesList, type Alternative } from '../Alternative/Alternative';
import { OptionStatus } from '../../enums/Options';
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import {
  renderFromMap,
  type QuestionRendererMap,
} from '../../utils/questionRenderer/index';
import { HtmlMathRenderer, stripHtml } from '../HtmlMathRenderer';
import {
  PreviewCardDragHandle,
  PreviewCardExpandButton,
  PreviewCardOrderRow,
  PreviewCardRemoveButton,
  PreviewCardTag,
  usePreviewCardToggle,
} from '../PreviewCard/PreviewCardParts';

export interface MatchingPairPreview {
  id: string;
  option: string; // Left column value (e.g., "Gato")
  correctValue: string; // Right column value (e.g., "Leite")
}

interface ActivityCardQuestionPreviewProps {
  subjectName?: string;
  subjectColor?: string;
  iconName?: string;
  bank?: string;
  year?: string;
  isDark?: boolean;
  questionType?: QUESTION_TYPE;
  /**
   * Optional label override when questionType is not provided.
   */
  questionTypeLabel?: string;
  statement?: string;
  question?: {
    options: {
      id: string;
      option: string;
      isCorrect?: boolean;
    }[];
    correctOptionIds?: string[];
  };
  /**
   * Matching pairs for RELACIONAR question type.
   * Each pair has an option (left column) and correctValue (right column).
   */
  matchingPairs?: MatchingPairPreview[];
  /**
   * Optional solution/explanation (gabarito comentado). When provided, renders a
   * "Resolução" block at the end of the expanded card.
   */
  solutionExplanation?: string | null;
  defaultExpanded?: boolean;
  value?: string;
  className?: string;
  children?: ReactNode;
  position?: number;
  /**
   * When provided, renders the remove (trash) action in the card header.
   */
  onRemove?: () => void;
  /**
   * Renders the drag affordance in the card header. The handle is marked with
   * `data-drag-handle="true"` so the draggable container can key off it.
   */
  showDragHandle?: boolean;
}

/** Drag / remove / expand controls of the card header. */
const QuestionActions = ({
  position,
  isExpanded,
  showDragHandle,
  onRemove,
  onToggleExpanded,
  contentId,
}: {
  position?: number;
  isExpanded: boolean;
  showDragHandle?: boolean;
  onRemove?: () => void;
  onToggleExpanded: () => void;
  contentId: string;
}) => (
  <>
    {showDragHandle && <PreviewCardDragHandle />}

    {onRemove && (
      <PreviewCardRemoveButton
        label={
          typeof position === 'number'
            ? `Remover questão ${position}`
            : 'Remover questão'
        }
        onRemove={onRemove}
      />
    )}

    <PreviewCardExpandButton
      isExpanded={isExpanded}
      contentId={contentId}
      expandLabel="Expandir questão"
      collapseLabel="Recolher questão"
      caretTestId="question-caret"
      onToggle={onToggleExpanded}
    />
  </>
);

/** Metadata tags (subject, question type, bank/year). Wraps instead of overflowing. */
const QuestionTags = ({
  badgeColor,
  iconName,
  subjectName,
  resolvedQuestionTypeLabel,
  bank,
  year,
}: {
  badgeColor: string;
  iconName?: string;
  subjectName?: string;
  resolvedQuestionTypeLabel?: string;
  bank?: string;
  year?: string;
}) => (
  <div className="flex flex-row flex-wrap items-center gap-1 text-text-650">
    <PreviewCardTag>
      <span
        className="size-4 rounded-sm flex items-center justify-center shrink-0 text-text-950"
        style={{
          backgroundColor: badgeColor,
        }}
      >
        <IconRender
          iconName={iconName ?? 'Book'}
          size={14}
          color="currentColor"
        />
      </span>
      <Text size="sm" className="truncate">
        {subjectName ?? 'Assunto não informado'}
      </Text>
    </PreviewCardTag>

    <PreviewCardTag>
      <Text size="sm" className="truncate">
        {resolvedQuestionTypeLabel ?? 'Tipo de questão'}
      </Text>
    </PreviewCardTag>

    {(bank || year) && (
      <PreviewCardTag>
        <Text size="sm" className="truncate">
          {[bank, year].filter(Boolean).join(' - ')}
        </Text>
      </PreviewCardTag>
    )}
  </div>
);

export const ActivityCardQuestionPreview = ({
  subjectName = 'Assunto não informado',
  subjectColor = '#000000',
  iconName = 'Book',
  bank,
  year,
  isDark = false,
  questionType,
  questionTypeLabel,
  statement = 'Enunciado não informado',
  question,
  matchingPairs,
  solutionExplanation,
  defaultExpanded = false,
  value,
  className,
  children,
  position,
  onRemove,
  showDragHandle = false,
}: ActivityCardQuestionPreviewProps) => {
  const badgeColor =
    getSubjectColorWithOpacity(subjectColor, isDark) ?? subjectColor;
  const {
    isExpanded,
    toggleExpanded,
    handleCardClick,
    handleCardKeyDown,
    handleCardMouseDown,
  } = usePreviewCardToggle(defaultExpanded);
  const generatedId = useId();
  const contentId = value ? `question-preview-content-${value}` : generatedId;
  const correctOptionIds = question?.correctOptionIds || [];

  const resolvedQuestionTypeLabel =
    questionType && questionTypeLabels[questionType]
      ? questionTypeLabels[questionType]
      : questionTypeLabel || 'Tipo de questão';
  const safeSubjectName: string = subjectName ?? 'Assunto não informado';
  const safeIconName: string = iconName ?? 'Book';
  const safeResolvedLabel: string =
    resolvedQuestionTypeLabel ?? 'Tipo de questão';

  const alternatives = useMemo<Alternative[]>(() => {
    if (!question?.options || questionType !== QUESTION_TYPE.ALTERNATIVA)
      return [];

    return question.options.map((option) => {
      const isCorrect = correctOptionIds.includes(option.id);
      return {
        value: option.id,
        label: option.option,
        status: isCorrect ? OptionStatus.CORRECT : OptionStatus.INCORRECT,
        disabled: !isCorrect,
      };
    });
  }, [question, questionType, correctOptionIds]);

  const multipleChoices = useMemo(() => {
    if (!question?.options || questionType !== QUESTION_TYPE.MULTIPLA_ESCOLHA)
      return [];

    return question.options.map((option) => {
      const isCorrect = correctOptionIds.includes(option.id);
      return {
        value: option.id,
        label: option.option,
        status: isCorrect ? OptionStatus.CORRECT : OptionStatus.INCORRECT,
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
            // For VERDADEIRO_FALSO, use isCorrect from option
            const isCorrect =
              option.isCorrect ?? correctOptionIds.includes(option.id);
            const correctAnswer = isCorrect ? 'Verdadeiro' : 'Falso';

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
                      iconLeft={
                        isCorrect ? <CheckCircleIcon /> : <XCircleIcon />
                      }
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

  const renderConnectDots = () => {
    if (!matchingPairs || matchingPairs.length === 0) return null;

    return (
      <div className="mt-4">
        <Text size="sm" weight="medium" className="text-text-700 mb-3">
          Alternativas
        </Text>
        <div className="flex flex-col gap-3.5">
          {matchingPairs.map((pair, index) => {
            const letter = String.fromCodePoint(97 + index); // 'a', 'b', 'c'...

            return (
              <section key={pair.id} className="flex flex-col gap-2">
                <div
                  className={cn(
                    'flex flex-row justify-between items-center gap-2 p-2 rounded-md border',
                    'bg-success-background border-success-300'
                  )}
                >
                  <Text size="sm" className="text-text-900">
                    {letter}) {pair.option}
                  </Text>

                  <div className="flex flex-row items-center gap-2 shrink-0">
                    <Text size="sm" className="text-text-700">
                      Resposta correta: {pair.correctValue}
                    </Text>
                    <Badge
                      variant="solid"
                      action="success"
                      iconLeft={<CheckCircleIcon />}
                    >
                      Resposta correta
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

  const renderFill = () => null;
  const renderImage = () => null;

  const questionRenderers: QuestionRendererMap = {
    [QUESTION_TYPE.ALTERNATIVA]: renderAlternative,
    [QUESTION_TYPE.MULTIPLA_ESCOLHA]: renderMultipleChoice,
    [QUESTION_TYPE.DISSERTATIVA]: renderDissertative,
    [QUESTION_TYPE.VERDADEIRO_FALSO]: renderTrueOrFalse,
    [QUESTION_TYPE.RELACIONAR]: renderConnectDots,
    [QUESTION_TYPE.PREENCHER_LACUNAS]: renderFill,
    [QUESTION_TYPE.IMAGEM]: renderImage,
  };

  const renderCardHeader = ({
    actions,
    withStatement,
  }: {
    actions?: ReactNode;
    withStatement: boolean;
  }) => (
    <div className="w-full min-w-0 flex flex-col gap-2 pb-2">
      <PreviewCardOrderRow position={position} actions={actions} />

      <div className="px-3">
        <QuestionTags
          badgeColor={badgeColor}
          iconName={safeIconName}
          subjectName={safeSubjectName}
          resolvedQuestionTypeLabel={safeResolvedLabel}
          bank={bank}
          year={year}
        />
      </div>

      {withStatement && (
        <Text size="md" weight="medium" className="text-text-950 truncate px-3">
          {stripHtml(statement)}
        </Text>
      )}
    </div>
  );

  return (
    <div
      className="w-full"
      data-position={position}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={contentId}
      onClick={handleCardClick}
      onMouseDown={handleCardMouseDown}
      onKeyDown={handleCardKeyDown}
    >
      {/* Hidden drag preview with header + truncated statement (closed state) */}
      <div
        data-drag-preview="true"
        aria-hidden="true"
        className="fixed -left-[9999px] -top-[9999px] pointer-events-none z-[9999] w-[440px]"
      >
        <div className="w-full rounded-lg border border-border-200 bg-background">
          {renderCardHeader({ withStatement: true })}
        </div>
      </div>

      <div
        className={cn(
          'w-full rounded-lg border border-border-200 bg-background overflow-hidden cursor-pointer',
          className
        )}
      >
        {renderCardHeader({
          withStatement: !isExpanded,
          actions: (
            <QuestionActions
              position={position}
              isExpanded={isExpanded}
              showDragHandle={showDragHandle}
              onRemove={onRemove}
              onToggleExpanded={toggleExpanded}
              contentId={contentId}
            />
          ),
        })}

        <section
          id={contentId}
          aria-hidden={!isExpanded}
          // Collapsed content stays in the DOM, so it must not be focusable
          inert={!isExpanded}
          data-testid="question-preview-content"
          data-value={value}
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isExpanded ? 'opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-4 pb-4">
            <HtmlMathRenderer
              content={statement}
              className="text-text-950 text-md break-words"
            />
            {renderFromMap(questionRenderers, questionType)}
            {solutionExplanation?.replaceAll(/<[^<>]*>/g, '').trim() && (
              <div className="mt-4 rounded-lg border border-info-300 bg-info-background p-3">
                <Text size="sm" weight="bold" className="text-info-700 mb-1">
                  Resolução
                </Text>
                <HtmlMathRenderer
                  content={solutionExplanation}
                  className="text-text-900 text-sm break-words"
                />
              </div>
            )}
            {children}
          </div>
        </section>
      </div>
    </div>
  );
};

export type { ActivityCardQuestionPreviewProps };
