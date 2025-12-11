import { useEffect, useMemo, useState } from 'react';
import { File, DownloadSimple } from 'phosphor-react';
import { Button, Text } from '../../index';
import { ActivityCardQuestionPreview } from '../ActivityCardQuestionPreview/ActivityCardQuestionPreview';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { cn } from '../../utils/utils';

type PreviewQuestion = {
  id: string;
  subjectName?: string;
  subjectColor?: string;
  iconName?: string;
  questionType?: QUESTION_TYPE;
  questionTypeLabel?: string;
  enunciado?: string;
  question?: {
    options: { id: string; option: string }[];
    correctOptionIds?: string[];
  };
  position?: number;
};

interface ActivityPreviewProps {
  title?: string;
  questions?: PreviewQuestion[];
  onDownloadPdf?: () => void;
  onRemoveAll?: () => void;
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
  className,
  onReorder,
  onPositionsChange,
  isDark = false,
}: ActivityPreviewProps) => {
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
    onPositionsChange?.(normalized);
  }, [questions, normalizeWithPositions, onPositionsChange]);

  const total = orderedQuestions.length;
  const totalLabel =
    total === 1 ? '1 questão adicionada' : `${total} questões adicionadas`;

  const handleReorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const current = [...orderedQuestions];
    const fromIndex = current.findIndex((q) => q.id === fromId);
    const toIndex = current.findIndex((q) => q.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    const normalized = normalizeWithPositions(current);
    setOrderedQuestions(normalized);
    onReorder?.(normalized);
    onPositionsChange?.(normalized);
  };

  return (
    <div
      className={cn(
        'w-[470px] flex-shrink-0 p-4 rounded-lg bg-background flex flex-col gap-4',
        className
      )}
    >
      <section className="flex flex-row items-center gap-2 text-text-950">
        <File size={24} />
        <Text size="lg" weight="bold">
          {title}
        </Text>
      </section>

      <section className="flex flex-row justify-between items-center">
        <Text size="sm" className="text-text-800">
          {totalLabel}
        </Text>
        <Button
          size="small"
          variant="outline"
          iconLeft={<DownloadSimple />}
          onClick={onDownloadPdf}
        >
          Baixar pdf
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        {orderedQuestions.map(
          ({
            id,
            subjectName = 'Assunto não informado',
            subjectColor = '#000000',
            iconName = 'BookOpen',
            questionType,
            questionTypeLabel,
            enunciado,
            question,
            position,
          }) => (
            <div
              key={id}
              draggable
              data-draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', id);
                if (e.currentTarget instanceof HTMLElement) {
                  const preview = e.currentTarget.querySelector(
                    '[data-drag-preview="true"]'
                  ) as HTMLElement | null;
                  if (preview) {
                    e.dataTransfer.setDragImage(preview, 8, 8);
                  } else {
                    e.dataTransfer.setDragImage(e.currentTarget, 8, 8);
                  }
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromId = e.dataTransfer.getData('text/plain');
                handleReorder(fromId, id);
              }}
              className="rounded-lg border border-border-200 bg-background"
            >
              <ActivityCardQuestionPreview
                subjectName={subjectName}
                subjectColor={subjectColor}
                iconName={iconName}
                isDark={isDark}
                questionType={questionType}
                questionTypeLabel={questionTypeLabel}
                enunciado={enunciado}
                defaultExpanded={false}
                question={question}
                value={id}
                position={position}
              ></ActivityCardQuestionPreview>
            </div>
          )
        )}
      </section>

      <Button variant="outline" onClick={onRemoveAll}>
        Remover tudo
      </Button>
    </div>
  );
};

export type { ActivityPreviewProps, PreviewQuestion };
