import { Button, Text } from '../../..';
import { CaretLeft, PaperPlaneTilt } from 'phosphor-react';
import type { RecommendedLessonData } from '../RecommendedLessonCreate.types';
import { RecommendedClassDraftType } from '../RecommendedLessonCreate.types';
import { getGoalDraftTypeLabel } from '../RecommendedLessonCreate.utils';
import { formatTime } from '../../../utils/categoryDataUtils';
import { useMobile } from '../../../hooks/useMobile';

/**
 * Header component for RecommendedLessonCreate page
 * Displays title, save status, and action buttons
 *
 * @param props - Component props
 * @returns Header JSX element
 */
export const RecommendedLessonCreateHeader = ({
  recommendedLesson,
  draftType,
  lastSavedAt,
  isSaving,
  lessonsCount,
  onSaveModel,
  onSendLesson,
  onBack,
}: {
  recommendedLesson?: RecommendedLessonData;
  draftType: RecommendedClassDraftType;
  lastSavedAt: Date | null;
  isSaving: boolean;
  lessonsCount: number;
  onSaveModel: () => void;
  onSendLesson: () => void;
  onBack?: () => void;
}) => {
  const typeLabel = getGoalDraftTypeLabel(draftType);
  const { isMobile } = useMobile();

  const titleText = recommendedLesson
    ? 'Editar aula recomendada'
    : 'Criar aula recomendada';

  const getStatusText = () => {
    if (lastSavedAt) {
      return `${typeLabel} salvo às ${formatTime(lastSavedAt)}`;
    }
    if (isSaving) {
      return 'Salvando...';
    }
    return 'Nenhum rascunho salvo';
  };
  const statusText = getStatusText();

  const subtitleText =
    'Crie uma aula recomendada customizada adicionando aulas do banco de aulas.';

  const backButton = (
    <Button
      onClick={onBack}
      aria-label="Voltar"
      type="button"
      variant="link"
      data-testid="back-button"
    >
      <CaretLeft size={isMobile ? 24 : 32} />
    </Button>
  );

  const actionButtons = (
    <>
      <Button
        size="small"
        variant="outline"
        onClick={onSaveModel}
        disabled={!recommendedLesson || isSaving}
      >
        Salvar modelo
      </Button>
      <Button
        size="small"
        iconLeft={<PaperPlaneTilt />}
        onClick={onSendLesson}
        disabled={lessonsCount === 0}
      >
        Enviar aula
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <div className="w-full flex flex-col gap-3 px-4 py-4 flex-shrink-0">
        <div className="flex flex-row items-center gap-2">
          {backButton}
          <Text size="lg" weight="bold">
            {titleText}
          </Text>
        </div>
        <Text size="sm">{subtitleText}</Text>
        <div className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <Text size="sm">{statusText}</Text>
          <div className="flex flex-row gap-2">{actionButtons}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[80px] flex flex-row items-center justify-between px-6 gap-3 flex-shrink-0">
      {backButton}

      <section className="flex flex-col gap-0.5 w-full">
        <div className="flex flex-row items-center justify-between w-full text-text-950">
          <Text size="lg" weight="bold">
            {titleText}
          </Text>

          <div className="flex flex-row gap-4 items-center">
            <Text size="sm">{statusText}</Text>
            {actionButtons}
          </div>
        </div>

        <Text size="sm">{subtitleText}</Text>
      </section>
    </div>
  );
};
