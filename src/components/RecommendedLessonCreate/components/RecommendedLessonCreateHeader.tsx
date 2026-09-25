import { Button, Text } from '../../..';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';
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
  const { isMobile, isLargeTablet } = useMobile();

  const titleText = recommendedLesson
    ? 'Editar aula recomendada'
    : 'Criar aula recomendada';

  const getStatusText = () => {
    if (isSaving) {
      return 'Salvando...';
    }
    if (lastSavedAt) {
      return `${typeLabel} salvo às ${formatTime(lastSavedAt)}`;
    }
    return 'Nenhum rascunho salvo';
  };
  const statusText = getStatusText();

  const subtitleText =
    'Crie uma aula recomendada customizada adicionando aulas manualmente ou automaticamente.';

  const backButton = (
    <Button
      onClick={onBack}
      aria-label="Voltar"
      type="button"
      variant="link"
      data-testid="back-button"
      className={isLargeTablet ? 'p-0' : undefined}
    >
      <CaretLeftIcon size={isMobile || isLargeTablet ? 24 : 32} />
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
        iconLeft={<PaperPlaneTiltIcon />}
        onClick={onSendLesson}
        disabled={lessonsCount === 0}
      >
        Enviar aula
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <div className="w-full flex flex-row items-start gap-3 pb-5 flex-shrink-0">
        <div className="flex h-8 items-center">{backButton}</div>
        <section className="flex flex-col gap-2 flex-1 min-w-0">
          <Text size="2xl" weight="bold" className="text-text-950">
            {titleText}
          </Text>
          <div className="flex flex-row items-center gap-2">
            <Text size="sm" className="flex-1 min-w-0 text-text-500">
              {statusText}
            </Text>
            {actionButtons}
          </div>
          <Text size="md" className="text-text-500">
            {subtitleText}
          </Text>
        </section>
      </div>
    );
  }

  if (isLargeTablet) {
    return (
      <div className="w-full flex flex-row items-start gap-3 pb-5 flex-shrink-0">
        <div className="flex h-9 items-center">{backButton}</div>
        <section className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-row items-center gap-4">
            <Text size="2xl" weight="bold" className="flex-1 text-text-950">
              {titleText}
            </Text>
            <Text size="sm" className="text-text-500 text-right">
              {statusText}
            </Text>
            {actionButtons}
          </div>
          <Text size="md" className="text-text-500">
            {subtitleText}
          </Text>
        </section>
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
