import { Button, Text } from '../../..';
import { CaretLeft, PaperPlaneTilt, Eye, Plus } from 'phosphor-react';
import type { ActivityData } from '../ActivityCreate.types';
import { ActivityType } from '../ActivityCreate.types';
import { getActivityTypeLabel } from '../ActivityCreate.utils';
import { formatTime } from '@/utils/categoryDataUtils';

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
}) => {
  const activityTypeLabel = getActivityTypeLabel(activityType);

  return (
    <div className="w-full h-[80px] flex flex-row items-center justify-between px-6 gap-3 flex-shrink-0">
      <Button
        onClick={onBack}
        aria-label="Voltar"
        type="button"
        variant="link"
        data-testid="back-button"
      >
        <CaretLeft size={32} />
      </Button>

      <section className="flex flex-col gap-0.5 w-full">
        <div className="flex flex-row items-center justify-between w-full text-text-950">
          <Text size="lg" weight="bold">
            {activity ? 'Editar atividade' : 'Criar atividade'}
          </Text>

          <div className="flex flex-row gap-4 items-center">
            {lastSavedAt ? (
              <Text size="sm">
                {activityTypeLabel} salvo às {formatTime(lastSavedAt)}
              </Text>
            ) : (
              <Text size="sm">
                {isSaving ? 'Salvando...' : 'Nenhum rascunho salvo'}
              </Text>
            )}
            <Button size="small" onClick={onSaveModel}>
              Salvar modelo
            </Button>
            {isRecommendedLessonMode ? (
              <>
                <Button
                  size="small"
                  iconLeft={<Eye />}
                  onClick={onLessonPreview}
                  variant="outline"
                >
                  Prévia da aula
                </Button>
                <Button
                  size="small"
                  iconLeft={<Plus />}
                  onClick={onAddActivity}
                  disabled={questionsCount === 0}
                >
                  Adicionar atividade
                </Button>
              </>
            ) : (
              <Button
                size="small"
                iconLeft={<PaperPlaneTilt />}
                onClick={onSendActivity}
                disabled={questionsCount === 0}
              >
                Enviar atividade
              </Button>
            )}
          </div>
        </div>

        <Text size="sm">
          Crie uma atividade customizada adicionando questões manualmente ou
          automaticamente.
        </Text>
      </section>
    </div>
  );
};
