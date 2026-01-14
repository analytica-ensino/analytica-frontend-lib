import { Button, Text } from '../../..';
import { CaretLeft, PaperPlaneTilt } from 'phosphor-react';
import type { RecommendedLessonData } from '../RecommendedLessonCreate.types';
import { GoalDraftType } from '../RecommendedLessonCreate.types';
import {
  getGoalDraftTypeLabel,
  formatTime,
} from '../RecommendedLessonCreate.utils';

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
  draftType: GoalDraftType;
  lastSavedAt: Date | null;
  isSaving: boolean;
  lessonsCount: number;
  onSaveModel: () => void;
  onSendLesson: () => void;
  onBack?: () => void;
}) => {
  const typeLabel = getGoalDraftTypeLabel(draftType);

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
            {recommendedLesson
              ? 'Editar aula recomendada'
              : 'Criar aula recomendada'}
          </Text>

          <div className="flex flex-row gap-4 items-center">
            {lastSavedAt ? (
              <Text size="sm">
                {typeLabel} salvo às {formatTime(lastSavedAt)}
              </Text>
            ) : (
              <Text size="sm">
                {isSaving ? 'Salvando...' : 'Nenhum rascunho salvo'}
              </Text>
            )}
            <Button size="small" onClick={onSaveModel}>
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
          </div>
        </div>

        <Text size="sm">
          Crie uma aula recomendada customizada adicionando aulas do banco de
          aulas.
        </Text>
      </section>
    </div>
  );
};
