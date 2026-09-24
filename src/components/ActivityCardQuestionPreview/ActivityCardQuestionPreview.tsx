import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  IconRender,
  Text,
  getSubjectColorWithOpacity,
  Badge,
} from '../../index';
import IconButton from '../IconButton/IconButton';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { questionTypeLabels } from '../../types/questionTypes';
import { cn } from '../../utils/utils';
import { AlternativesList, type Alternative } from '../Alternative/Alternative';
import { OptionStatus } from '../../enums/Options';
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { DotsSixVerticalIcon } from '@phosphor-icons/react/dist/csr/DotsSixVertical';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import {
  renderFromMap,
  type QuestionRendererMap,
} from '../../utils/questionRenderer/index';
import { HtmlMathRenderer, stripHtml } from '../HtmlMathRenderer';

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

/** Chip used for every metadata tag of the card header. */
const QuestionTag = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'min-w-0 max-w-full py-1 px-2 rounded-md bg-background-50 flex flex-row items-center gap-1',
      className
    )}
  >
    {children}
  </span>
);

/**
 * Top row of the card: question order on the left, actions on the right.
 * The drag ghost reuses it without actions, so it renders no buttons twice.
 */
const QuestionOrderRow = ({
  position,
  actions,
}: {
  position?: number;
  actions?: ReactNode;
}) => {
  if (typeof position !== 'number' && !actions) return null;

  return (
    <div className="flex flex-row items-center gap-2 min-h-8 px-3 pt-2">
      {typeof position === 'number' && (
        <span className="shrink-0 py-0.5 px-2 rounded-md bg-primary-50">
          <Text size="sm" weight="medium" className="text-primary-950">
            {position}º
          </Text>
        </span>
      )}

      {actions && (
        <div className="ml-auto flex flex-row items-center gap-1 text-text-700">
          {actions}
        </div>
      )}
    </div>
  );
};

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
    {showDragHandle && (
      <span
        data-drag-handle="true"
        aria-hidden="true"
        className="size-6 flex items-center justify-center shrink-0 text-text-600 cursor-grab active:cursor-grabbing"
      >
        <DotsSixVerticalIcon size={16} />
      </span>
    )}

    {onRemove && (
      <IconButton
        size="sm"
        data-no-drag="true"
        icon={<TrashIcon size={16} />}
        aria-label={
          typeof position === 'number'
            ? `Remover questão ${position}`
            : 'Remover questão'
        }
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      />
    )}

    <IconButton
      size="sm"
      aria-label={isExpanded ? 'Recolher questão' : 'Expandir questão'}
      aria-expanded={isExpanded}
      aria-controls={contentId}
      icon={
        <CaretDownIcon
          size={16}
          className={cn(
            'transition-transform duration-200',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )}
          data-testid="question-caret"
        />
      }
      onClick={(event) => {
        event.stopPropagation();
        onToggleExpanded();
      }}
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
    <QuestionTag>
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
    </QuestionTag>

    <QuestionTag>
      <Text size="sm" className="truncate">
        {resolvedQuestionTypeLabel ?? 'Tipo de questão'}
      </Text>
    </QuestionTag>

    {(bank || year) && (
      <QuestionTag>
        <Text size="sm" className="truncate">
          {[bank, year].filter(Boolean).join(' - ')}
        </Text>
      </QuestionTag>
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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
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

  const toggleExpanded = () => setIsExpanded((previous) => !previous);

  /**
   * The whole card toggles, except the header buttons (remove / expand), which
   * already handle their own click.
   */
  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement | null)?.closest('button')) return;
    toggleExpanded();
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if ((event.target as HTMLElement | null)?.closest('button')) return;
    event.preventDefault();
    toggleExpanded();
  };

  const renderCardHeader = ({
    actions,
    withStatement,
  }: {
    actions?: ReactNode;
    withStatement: boolean;
  }) => (
    <div className="w-full min-w-0 flex flex-col gap-2 pb-2">
      <QuestionOrderRow position={position} actions={actions} />

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
      onMouseDown={(event) => {
        // Allow drag to start if inside a draggable container; otherwise avoid focus outline
        const draggableAncestor = (event.target as HTMLElement).closest(
          '[data-draggable="true"]'
        );
        if (!draggableAncestor) {
          event.preventDefault();
        }
      }}
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
