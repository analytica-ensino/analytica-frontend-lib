import { Button, Text } from '../../..';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';
import { EyeIcon } from '@phosphor-icons/react/dist/csr/Eye';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import type { ActivityData } from '../ActivityCreate.types';
import { ActivityType } from '../ActivityCreate.types';
import { getActivityTypeLabel } from '../ActivityCreate.utils';
import { formatTime } from '../../../utils/categoryDataUtils';

/**
 * Resolves the save-status label shown next to the action buttons.
 *
 * Extracted from the JSX because the three states (salvo / salvando / nenhum
 * rascunho) would otherwise need a nested ternary, which the quality gate flags.
 */
const getSaveStatusLabel = (
  activityTypeLabel: string,
  lastSavedAt: Date | null,
  isSaving: boolean
) => {
  if (lastSavedAt) {
    return `${activityTypeLabel} salvo às ${formatTime(lastSavedAt)}`;
  }
  return isSaving ? 'Salvando...' : 'Nenhum rascunho salvo';
};

/**
 * Header component for ActivityCreate page
 * Displays title, save status, and action buttons
 *
 * @param props - Component props
 * @returns Header JSX element
 */
export const ActivityCreateHeader = ({
  activity,
  activityType,
  lastSavedAt,
  isSaving,
  questionsCount,
  onSaveModel,
  onSendActivity,
  onBack,
  isRecommendedLessonMode,
  onLessonPreview,
  onAddActivity,
  enableExamMode = false,
}: {
  activity?: ActivityData;
  activityType: ActivityType;
  lastSavedAt: Date | null;
  isSaving: boolean;
  questionsCount: number;
  onSaveModel: () => void;
  onSendActivity: () => void;
  onBack?: () => void;
  isRecommendedLessonMode?: boolean;
  onLessonPreview?: () => void;
  onAddActivity?: () => void;
  /** Enable exam mode - changes text labels from 'atividade' to 'prova' */
  enableExamMode?: boolean;
}) => {
  const activityTypeLabel = getActivityTypeLabel(activityType);

  // Text labels based on exam mode
  const labels = enableExamMode
    ? {
        create: 'Criar prova',
        edit: 'Editar prova',
        send: 'Enviar prova',
        description:
          'Crie uma prova customizada adicionando questões manualmente ou automaticamente.',
      }
    : {
        create: 'Criar atividade',
        edit: 'Editar atividade',
        send: 'Enviar atividade',
        description:
          'Crie uma atividade customizada adicionando questões manualmente ou automaticamente.',
      };

  return (
    /*
      Reflows at 1200px — the same width where the page body swaps between
      SmallScreenLayout and DesktopLayout, so header and content turn together.
      The 80px height only applies above that: below it the header must grow
      with its content, otherwise the wrapped title/status/buttons overflow the
      fixed box and land on top of the filters row underneath.
    */
    <section className="w-full flex flex-col gap-0.5 flex-shrink-0 min-[1200px]:h-[80px] min-[1200px]:justify-center min-[1200px]:px-4">
      <div className="flex flex-col gap-2 text-text-950 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between min-[1200px]:gap-3">
        <div className="flex flex-row items-center gap-1 min-w-0">
          <Button
            onClick={onBack}
            aria-label="Voltar"
            type="button"
            variant="link"
            data-testid="back-button"
            className="px-0"
          >
            <CaretLeftIcon size={32} />
          </Button>

          <Text size="lg" weight="bold">
            {activity ? labels.edit : labels.create}
          </Text>
        </div>

        {/*
          flex-wrap so the buttons drop to their own line, still right-aligned,
          on the narrowest phones where they no longer fit beside the status
          text. mr-auto pins the status left while they share a line; above
          1200px it is dropped so the whole group sits on the right.
        */}
        <div className="flex flex-row flex-wrap items-center justify-end gap-2 min-[1200px]:flex-nowrap min-[1200px]:gap-4">
          <Text size="sm" className="mr-auto min-[1200px]:mr-0">
            {getSaveStatusLabel(activityTypeLabel, lastSavedAt, isSaving)}
          </Text>

          {/*
            The buttons are their own flex row so they wrap as one unit. Left
            as direct siblings of the status they wrap individually, and at
            ~430px "Salvar modelo" and "Enviar atividade" end up stacked on
            separate lines instead of staying side by side.
          */}
          <div className="flex flex-row items-center gap-2 min-[1200px]:gap-4">
            <Button
              size="small"
              variant="outline"
              onClick={onSaveModel}
              disabled={!activity || isSaving}
            >
              Salvar modelo
            </Button>
            {isRecommendedLessonMode ? (
              <>
                <Button
                  size="small"
                  iconLeft={<EyeIcon />}
                  onClick={onLessonPreview}
                  variant="outline"
                >
                  Prévia da aula
                </Button>
                <Button
                  size="small"
                  iconLeft={<PlusIcon />}
                  onClick={onAddActivity}
                  disabled={questionsCount === 0}
                >
                  Adicionar atividade
                </Button>
              </>
            ) : (
              <Button
                size="small"
                iconLeft={<PaperPlaneTiltIcon />}
                onClick={onSendActivity}
                disabled={questionsCount === 0}
              >
                {labels.send}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Text size="sm">{labels.description}</Text>
    </section>
  );
};
