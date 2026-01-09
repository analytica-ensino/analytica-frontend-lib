import {
  ModelsTabBase,
  createModelsTableColumnsBase,
  type ModelsTabConfig,
  type ModelsColumnsConfig,
} from '../../shared/ModelsTabBase';
import { createGoalModelsFiltersConfig } from '../config/modelsFiltersConfig';
import { buildGoalModelsFiltersFromParams } from '../utils/filterBuilders';
import { createUseGoalModels } from '../../../hooks/useGoalModels';
import type {
  GoalModelTableItem,
  GoalModelFilters,
  GoalModelsApiResponse,
  GoalUserFilterData,
} from '../../../types/recommendedLessons';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Configuration for goal models tab
 */
const GOAL_MODELS_CONFIG: ModelsTabConfig = {
  entityName: 'aula',
  entityNamePlural: 'aulas',
  testId: 'goal-models-tab',
  emptyStateTitle: 'Crie modelos para agilizar suas aulas',
  emptyStateDescription:
    'Salve modelos de aulas recomendadas para reutilizar e enviar rapidamente para suas turmas!',
  searchPlaceholder: 'Buscar modelo',
};

/**
 * Configuration for goal models table columns
 */
const GOAL_COLUMNS_CONFIG: ModelsColumnsConfig = {
  sendButtonLabel: 'Enviar aula',
  sendButtonAriaLabel: 'Enviar aula',
  deleteButtonAriaLabel: 'Deletar modelo',
  editButtonAriaLabel: 'Editar modelo',
};

/**
 * Props for the GoalModelsTab component
 */
export interface GoalModelsTabProps {
  /** Function to fetch goal models from API */
  fetchGoalModels: (
    filters?: GoalModelFilters
  ) => Promise<GoalModelsApiResponse>;
  /** Function to delete a goal model */
  deleteGoalModel: (id: string) => Promise<void>;
  /** Callback when create model button is clicked */
  onCreateModel: () => void;
  /** Callback when send lesson button is clicked on a model */
  onSendLesson?: (model: GoalModelTableItem) => void;
  /** Callback when edit model button is clicked */
  onEditModel?: (model: GoalModelTableItem) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: GoalUserFilterData;
  /**
   * Map of subject IDs to names for models display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches.
   */
  subjectsMap?: Map<string, string>;
}

/**
 * GoalModelsTab component
 * Displays goal models with filters, pagination, and CRUD actions.
 * Uses the shared ModelsTabBase component for common functionality.
 */
export const GoalModelsTab = ({
  fetchGoalModels,
  deleteGoalModel,
  onCreateModel,
  onSendLesson,
  onEditModel,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  subjectsMap,
}: GoalModelsTabProps) => (
  <ModelsTabBase<
    GoalModelTableItem,
    GoalModelFilters,
    GoalModelsApiResponse,
    GoalUserFilterData
  >
    fetchModels={fetchGoalModels}
    deleteModel={deleteGoalModel}
    onCreateModel={onCreateModel}
    onSend={onSendLesson}
    onEditModel={onEditModel}
    emptyStateImage={emptyStateImage}
    noSearchImage={noSearchImage}
    mapSubjectNameToEnum={mapSubjectNameToEnum}
    userFilterData={userFilterData}
    subjectsMap={subjectsMap}
    config={GOAL_MODELS_CONFIG}
    createTableColumns={(mapSubject, send, edit, del) =>
      createModelsTableColumnsBase(
        mapSubject,
        send,
        edit,
        del,
        GOAL_COLUMNS_CONFIG
      )
    }
    createFiltersConfig={createGoalModelsFiltersConfig}
    buildFiltersFromParams={buildGoalModelsFiltersFromParams}
    createUseModels={createUseGoalModels}
  />
);

export default GoalModelsTab;
