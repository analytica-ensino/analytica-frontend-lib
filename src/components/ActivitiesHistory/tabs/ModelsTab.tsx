import {
  ModelsTabBase,
  createModelsTableColumnsBase,
  type ModelsTabConfig,
  type ModelsColumnsConfig,
} from '../../shared/ModelsTabBase';
import { createModelsFiltersConfig } from '../config/modelsFiltersConfig';
import { buildModelsFiltersFromParams } from '../utils/filterBuilders';
import { createUseActivityModels } from '../../../hooks/useActivityModels';
import type {
  ActivityModelTableItem,
  ActivityModelFilters,
  ActivityModelsApiResponse,
  ActivityUserFilterData,
} from '../../../types/activitiesHistory';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Configuration for activity models tab
 */
const ACTIVITY_MODELS_CONFIG: ModelsTabConfig = {
  entityName: 'atividade',
  entityNamePlural: 'atividades',
  testId: 'activity-models-tab',
  emptyStateTitle: 'Crie modelos para agilizar suas atividades',
  emptyStateDescription:
    'Salve modelos de atividades para reutilizar e enviar rapidamente para suas turmas!',
  searchPlaceholder: 'Buscar modelo',
};

/**
 * Configuration for activity models table columns
 */
const ACTIVITY_COLUMNS_CONFIG: ModelsColumnsConfig = {
  sendButtonLabel: 'Enviar atividade',
  sendButtonAriaLabel: 'Enviar atividade',
  deleteButtonAriaLabel: 'Deletar modelo',
  editButtonAriaLabel: 'Editar modelo',
};

/**
 * Props for the ModelsTab component
 */
export interface ModelsTabProps {
  /** Function to fetch activity models from API */
  fetchActivityModels: (
    filters?: ActivityModelFilters
  ) => Promise<ActivityModelsApiResponse>;
  /** Function to delete an activity model */
  deleteActivityModel: (id: string) => Promise<void>;
  /** Callback when create model button is clicked */
  onCreateModel: () => void;
  /** Callback when send activity button is clicked on a model */
  onSendActivity?: (model: ActivityModelTableItem) => void;
  /** Callback when edit model button is clicked */
  onEditModel?: (model: ActivityModelTableItem) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: ActivityUserFilterData;
  /**
   * Map of subject IDs to names for models display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches.
   */
  subjectsMap?: Map<string, string>;
}

/**
 * ModelsTab component
 * Displays activity models with filters, pagination, and CRUD actions.
 * Uses the shared ModelsTabBase component for common functionality.
 */
export const ModelsTab = ({
  fetchActivityModels,
  deleteActivityModel,
  onCreateModel,
  onSendActivity,
  onEditModel,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  subjectsMap,
}: ModelsTabProps) => (
  <ModelsTabBase<
    ActivityModelTableItem,
    ActivityModelFilters,
    ActivityModelsApiResponse,
    ActivityUserFilterData
  >
    fetchModels={fetchActivityModels}
    deleteModel={deleteActivityModel}
    onCreateModel={onCreateModel}
    onSend={onSendActivity}
    onEditModel={onEditModel}
    emptyStateImage={emptyStateImage}
    noSearchImage={noSearchImage}
    mapSubjectNameToEnum={mapSubjectNameToEnum}
    userFilterData={userFilterData}
    subjectsMap={subjectsMap}
    config={ACTIVITY_MODELS_CONFIG}
    createTableColumns={(mapSubject, send, edit, del) =>
      createModelsTableColumnsBase(
        mapSubject,
        send,
        edit,
        del,
        ACTIVITY_COLUMNS_CONFIG
      )
    }
    createFiltersConfig={createModelsFiltersConfig}
    buildFiltersFromParams={buildModelsFiltersFromParams}
    createUseModels={createUseActivityModels}
  />
);

export default ModelsTab;
