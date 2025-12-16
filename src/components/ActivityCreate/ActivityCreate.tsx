import { useCallback } from 'react';
import { ActivityFilters, Button, Text, useQuestionFiltersStore } from '../..';
import type {
  ActivityFiltersData,
  BaseApiClient,
  QuestionFiltersState,
} from '../..';
import { CaretLeft, PaperPlaneTilt, Funnel } from 'phosphor-react';
import { ActivityListQuestions } from './ActivityListQuestions';

/**
 * CreateActivity page component for creating new activities
 * This page does not use the standard Layout (header/sidebar)
 * @returns JSX element representing the create activity page
 */
const CreateActivity = ({
  apiClient,
  institutionId,
}: {
  apiClient: BaseApiClient;
  institutionId: string;
}) => {
  const applyFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.applyFilters
  );
  const draftFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.draftFilters
  );

  const setDraftFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.setDraftFilters
  );

  const handleFiltersChange = useCallback(
    (filters: ActivityFiltersData) => {
      setDraftFilters(filters);
    },
    [setDraftFilters]
  );

  const handleApplyFilters = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div
      data-testid="create-activity-page"
      className="flex flex-col w-full h-screen overflow-hidden p-5 bg-background"
    >
      {/* Header Section */}
      <div className="w-full h-[80px] flex flex-row items-center justify-between px-6 gap-3 flex-shrink-0">
        <section className="text-text-950">
          <CaretLeft size={32} />
        </section>

        <section className="flex flex-col gap-0.5 w-full">
          <div className="flex flex-row items-center justify-between w-full text-text-950">
            <Text size="lg" weight="bold">
              Criar atividade
            </Text>

            <div className="flex flex-row gap-4 items-center">
              <p className="text-sm text-text-600">Rascunho salvo às 12:00</p>
              <Button size="small">Salvar modelo</Button>
              <Button size="small" iconLeft={<PaperPlaneTilt />}>
                Enviar atividade
              </Button>
            </div>
          </div>

          <p className="text-sm text-text-600">
            Crie uma atividade customizada adicionando questões manualmente ou
            automaticamente.
          </p>
        </section>
      </div>

      {/* Main Content with 3 columns */}
      <div className="grid grid-cols-[400px_1fr_470px] w-full flex-1 overflow-hidden gap-5 min-h-0">
        {/* First Column - Filters */}
        <div className="flex flex-col gap-3 overflow-hidden h-full min-h-0 max-h-full relative">
          <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1 min-h-0 max-h-full">
            <ActivityFilters
              apiClient={apiClient}
              institutionId={institutionId}
              variant={'default'}
              onFiltersChange={handleFiltersChange}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              size="medium"
              iconLeft={<Funnel />}
              onClick={handleApplyFilters}
              disabled={!draftFilters}
              className="w-full"
            >
              Filtrar
            </Button>
          </div>
        </div>

        {/* Second Column - Center, fills remaining space */}
        <ActivityListQuestions apiClient={apiClient} />

        {/* Third Column - 470px */}
        <div className="w-[470px] bg-yellow-200 flex-shrink-0 p-4">
          <div>Coluna 3 - 470px</div>
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;
