import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownIcon } from '@phosphor-icons/react/dist/csr/ArrowDown';
import { FileIcon } from '@phosphor-icons/react/dist/csr/File';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { Button, EmptyState, Text } from '../../index';
import { ActivityCardQuestionPreview } from '../ActivityCardQuestionPreview/ActivityCardQuestionPreview';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { cn } from '../../utils/utils';
import {
  useQuestionsPdfPrint,
  QuestionsPdfContent,
} from '../QuestionsPdfGenerator';
import Activities from '../../assets/icons/Activities';
import { useReorderDragAndDrop } from './useReorderDragAndDrop';

/** Slot that shows where the dragged question will land. */
const DropPlaceholder = () => (
  <div
    data-testid="drop-placeholder"
    className="rounded-lg border border-dashed border-primary-600 bg-primary-50 py-3 px-2 flex flex-row items-center justify-center gap-2 text-primary-950"
  >
    <ArrowDownIcon size={16} />
    <Text size="sm" weight="medium" className="text-primary-950">
      Soltar aqui
    </Text>
  </div>
);

type PreviewQuestion = {
  id: string;
  subjectName?: string;
  subjectColor?: string;
  iconName?: string;
  bank?: string;
  year?: string;
  questionType?: QUESTION_TYPE;
  questionTypeLabel?: string;
  statement?: string;
  question?: {
    options: { id: string; option: string }[];
    correctOptionIds?: string[];
  };
  solutionExplanation?: string | null;
  position?: number;
};

interface ActivityPreviewProps {
  title?: string;
  questions?: PreviewQuestion[];
  onDownloadPdf?: () => void;
  onRemoveAll?: () => void;
  onRemoveQuestion?: (questionId: string) => void;
  className?: string;
  onReorder?: (orderedQuestions: PreviewQuestion[]) => void;
  /**
   * Emits the current ordered list (with positions) whenever it changes.
   */
  onPositionsChange?: (orderedQuestions: PreviewQuestion[]) => void;
  isDark?: boolean;
}

export const ActivityPreview = ({
  title = 'Prévia da atividade',
  questions = [],
  onDownloadPdf,
  onRemoveAll,
  onRemoveQuestion,
  className,
  onReorder,
  onPositionsChange,
  isDark = false,
}: ActivityPreviewProps) => {
  const onPositionsChangeRef = useRef(onPositionsChange);
  onPositionsChangeRef.current = onPositionsChange;

  const normalizeWithPositions = useMemo(
    () => (items: PreviewQuestion[]) =>
      items.map((item, index) => ({
        ...item,
        position: index + 1,
      })),
    []
  );

  const [orderedQuestions, setOrderedQuestions] = useState<PreviewQuestion[]>(
    () => normalizeWithPositions(questions)
  );

  // Sync when external questions change (e.g., reset from parent)
  useEffect(() => {
    const normalized = normalizeWithPositions(questions);
    setOrderedQuestions(normalized);
    onPositionsChangeRef.current?.(normalized);
  }, [questions, normalizeWithPositions]);

  const total = orderedQuestions.length;
  const totalLabel =
    total === 1 ? '1 questão adicionada' : `${total} questões adicionadas`;

  const { contentRef, handlePrint } = useQuestionsPdfPrint(
    orderedQuestions,
    onDownloadPdf
  );

  const handleDownloadPdf = () => {
    // Chama o callback opcional antes de imprimir
    onDownloadPdf?.();

    // Pequeno delay para garantir que o DOM está atualizado
    // e que o callback foi executado
    setTimeout(() => {
      if (!contentRef.current) {
        console.error('Elemento de PDF não encontrado no DOM');
        return;
      }

      // Verifica se handlePrint é uma função antes de chamar
      if (typeof handlePrint === 'function') {
        handlePrint();
      } else {
        console.error('handlePrint não é uma função:', handlePrint);
      }
    }, 100);
  };

  /** Moves a question to its new final index and renumbers the list. */
  const handleMove = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= orderedQuestions.length) return;
    if (toIndex < 0 || toIndex >= orderedQuestions.length) return;

    const next = [...orderedQuestions];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    const normalized = normalizeWithPositions(next);
    setOrderedQuestions(normalized);
    onReorder?.(normalized);
    onPositionsChange?.(normalized);
  };

  const questionIds = useMemo(
    () => orderedQuestions.map((question) => question.id),
    [orderedQuestions]
  );

  const {
    draggingId,
    dropIndex,
    listRef,
    registerItem,
    handlePointerDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useReorderDragAndDrop({ itemIds: questionIds, onMove: handleMove });

  return (
    <div
      className={cn(
        'w-full flex-shrink-0 p-4 rounded-lg bg-background flex flex-col gap-4',
        className
      )}
      // The whole panel accepts the drop: while auto-scrolling, the pointer
      // often sits over the header instead of the list itself
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <section className="flex flex-row items-center gap-2 text-text-950">
        <FileIcon size={24} />
        <Text size="lg" weight="bold">
          {title}
        </Text>
      </section>

      <section className="flex flex-row justify-between items-center">
        <Text size="sm" className="text-text-800">
          {totalLabel}
        </Text>
        {orderedQuestions.length > 0 && (
          <Button
            size="small"
            variant="outline"
            iconLeft={<DownloadSimpleIcon />}
            onClick={handleDownloadPdf}
          >
            Baixar pdf
          </Button>
        )}
      </section>

      {orderedQuestions.length === 0 ? (
        <EmptyState
          image={<Activities />}
          title="Nenhuma questão adicionada ainda"
          description="Utilize a coluna ao lado para adicionar questões à atividade."
          size="compact"
        />
      ) : (
        <section
          ref={listRef}
          data-testid="questions-list"
          className="flex flex-col gap-3"
        >
          {orderedQuestions.map(
            (
              {
                id,
                subjectName = 'Assunto não informado',
                subjectColor = '#000000',
                iconName = 'BookOpen',
                bank,
                year,
                questionType,
                questionTypeLabel,
                statement,
                question,
                solutionExplanation,
                position,
              },
              index
            ) => (
              <Fragment key={id}>
                {dropIndex === index && <DropPlaceholder />}

                <div
                  ref={registerItem(id)}
                  draggable
                  data-draggable="true"
                  role="button"
                  tabIndex={0}
                  aria-label={`Mover questão ${statement ?? id}`}
                  onMouseDown={handlePointerDown}
                  onDragStart={handleDragStart(id)}
                  onDragEnd={handleDragEnd}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' && index > 0) {
                      e.preventDefault();
                      handleMove(index, index - 1);
                    } else if (
                      e.key === 'ArrowDown' &&
                      index < orderedQuestions.length - 1
                    ) {
                      e.preventDefault();
                      handleMove(index, index + 1);
                    } else if (e.key === 'Enter' || e.key === ' ') {
                      // Keyboard grab/drop noop; prevent scroll on space
                      e.preventDefault();
                    }
                  }}
                  className={cn(
                    'rounded-lg cursor-grab transition-shadow duration-150',
                    'active:cursor-grabbing active:shadow-hard-shadow-2',
                    draggingId === id && 'opacity-40 shadow-hard-shadow-2'
                  )}
                >
                  <ActivityCardQuestionPreview
                    subjectName={subjectName}
                    subjectColor={subjectColor}
                    iconName={iconName}
                    isDark={isDark}
                    bank={bank}
                    year={year}
                    questionType={questionType}
                    questionTypeLabel={questionTypeLabel}
                    statement={statement}
                    defaultExpanded={false}
                    question={question}
                    solutionExplanation={solutionExplanation}
                    value={id}
                    position={position}
                    showDragHandle
                    onRemove={
                      onRemoveQuestion ? () => onRemoveQuestion(id) : undefined
                    }
                  />
                </div>
              </Fragment>
            )
          )}

          {dropIndex === orderedQuestions.length && <DropPlaceholder />}
        </section>
      )}

      {orderedQuestions.length > 0 && onRemoveAll && (
        <Button
          variant="link"
          action="negative"
          iconLeft={<TrashIcon />}
          onClick={onRemoveAll}
        >
          Remover tudo
        </Button>
      )}

      <QuestionsPdfContent ref={contentRef} questions={orderedQuestions} />
    </div>
  );
};

export type { ActivityPreviewProps, PreviewQuestion };
