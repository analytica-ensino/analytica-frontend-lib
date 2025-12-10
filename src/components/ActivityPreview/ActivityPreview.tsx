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
  isDark?: boolean;
  questionType?: QUESTION_TYPE;
  questionTypeLabel?: string;
  enunciado?: string;
  question?: {
    options: { id: string; option: string }[];
    correctOptionIds?: string[];
  };
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
            question,
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
              question={question}
            />
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

