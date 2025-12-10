import { File, DownloadSimple } from 'phosphor-react';
import { Button, Text } from '../../index';
import { ActivityCardQuestionPreview } from '../ActivityCardQuestionPreview/ActivityCardQuestionPreview';
import { AlternativesList, type Alternative } from '../Alternative/Alternative';
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import { cn } from '../../utils/utils';

type PreviewQuestion = {
  id: string;
  subjectName?: string;
  subjectColor?: string;
  iconName?: string;
  isDark?: boolean;
  questionType?: QUESTION_TYPE;
  questionTypeLabel?: string;
  enunciado?: string;
  options?: { id: string; option: string }[];
  correctOptionIds?: string[];
};

interface ActivityPreviewProps {
  title?: string;
  questions?: PreviewQuestion[];
  onDownloadPdf?: () => void;
  onRemoveAll?: () => void;
  className?: string;
}

export const ActivityPreview = ({
  title = 'Prévia da atividade',
  questions = [],
  onDownloadPdf,
  onRemoveAll,
  className,
}: ActivityPreviewProps) => {
  const total = questions.length;
  const totalLabel =
    total === 1 ? '1 questão adicionada' : `${total} questões adicionadas`;

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
        {questions.map(
          ({
            id,
            subjectName = 'Assunto não informado',
            subjectColor = '#000000',
            iconName = 'BookOpen',
            isDark = false,
            questionType,
            questionTypeLabel,
            enunciado,
            options = [],
            correctOptionIds = [],
          }) => (
            <ActivityCardQuestionPreview
              key={id}
              subjectName={subjectName}
              subjectColor={subjectColor}
              iconName={iconName}
              isDark={isDark}
              questionType={questionType}
              questionTypeLabel={questionTypeLabel}
              enunciado={enunciado}
              defaultExpanded={false}
            >
              {questionType === QUESTION_TYPE.ALTERNATIVA && options.length > 0 && (
                <div className="mt-3">
                  <AlternativesList
                    alternatives={options.map(
                      (option): Alternative => ({
                        value: option.id,
                        label: option.option,
                        status: correctOptionIds.includes(option.id)
                          ? ('correct' as const)
                          : undefined,
                        disabled: !correctOptionIds.includes(option.id),
                      })
                    )}
                    mode="readonly"
                    layout="compact"
                    selectedValue={correctOptionIds[0]}
                    name={`preview-alternatives-${id}`}
                  />
                </div>
              )}

              {questionType === QUESTION_TYPE.MULTIPLA_ESCOLHA && options.length > 0 && (
                <div className="mt-3">
                  <MultipleChoiceList
                    choices={options.map((option) => ({
                      value: option.id,
                      label: option.option,
                      status: correctOptionIds.includes(option.id)
                        ? ('correct' as const)
                        : undefined,
                      disabled: !correctOptionIds.includes(option.id),
                    }))}
                    mode="readonly"
                    selectedValues={correctOptionIds}
                    name={`preview-multiple-${id}`}
                  />
                </div>
              )}
            </ActivityCardQuestionPreview>
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

