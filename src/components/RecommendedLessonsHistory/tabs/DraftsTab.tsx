import {
  ModelsTabBase,
  createModelsTableColumnsBase,
  type ModelsTabConfig,
  type ModelsColumnsConfig,
} from '../../shared/ModelsTabBase';
import { createGoalDraftsFiltersConfig } from '../config/draftsFiltersConfig';
import { buildGoalModelsFiltersFromParams } from '../utils/filterBuilders';
import { createUseGoalDrafts } from '../../../hooks/useGoalDrafts';
import type {
  GoalModelTableItem,
  GoalModelFilters,
  GoalModelsApiResponse,
  GoalUserFilterData,
} from '../../../types/recommendedLessons';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Configuration for goal drafts tab
 */
const GOAL_DRAFTS_CONFIG: ModelsTabConfig = {
  entityName: 'rascunho',
  entityNamePlural: 'rascunhos',
  testId: 'goal-drafts-tab',
  emptyStateTitle: 'Você não tem aulas recomendadas em rascunho',
  emptyStateDescription:
    'As aulas recomendadas que você começar a criar, aparecerão aqui automaticamente como rascunhos. Tudo é salvo enquanto você cria, continue de onde parou quando quiser!',
  searchPlaceholder: 'Buscar rascunho',
};

/**
 * Configuration for goal drafts table columns
 */
const GOAL_DRAFTS_COLUMNS_CONFIG: ModelsColumnsConfig = {
  sendButtonLabel: 'Enviar aula',
  sendButtonAriaLabel: 'Enviar rascunho',
  deleteButtonAriaLabel: 'Deletar rascunho',
  editButtonAriaLabel: 'Editar rascunho',
};

/**
 * Props for the GoalDraftsTab component
 */
export interface GoalDraftsTabProps {
  /** Function to fetch goal drafts from API */
  fetchGoalDrafts: (
    filters?: GoalModelFilters
  ) => Promise<GoalModelsApiResponse>;
  /** Function to delete a goal draft */
  deleteGoalDraft: (id: string) => Promise<void>;
  /** Callback when create draft button is clicked */
  onCreateDraft: () => void;
  /** Callback when send lesson button is clicked on a draft */
  onSendDraft?: (draft: GoalModelTableItem) => void;
  /** Callback when edit draft button is clicked */
  onEditDraft?: (draft: GoalModelTableItem) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: GoalUserFilterData;
  /**
   * Map of subject IDs to names for drafts display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches.
   */
  subjectsMap?: Map<string, string>;
}

/**
 * GoalDraftsTab component
 * Displays goal drafts with filters, pagination, and CRUD actions.
 * Uses the shared ModelsTabBase component for common functionality.
 */
export const GoalDraftsTab = ({
  fetchGoalDrafts,
  deleteGoalDraft,
  onCreateDraft,
  onSendDraft,
  onEditDraft,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  subjectsMap,
}: GoalDraftsTabProps) => (
  <ModelsTabBase<
    GoalModelTableItem,
    GoalModelFilters,
    GoalModelsApiResponse,
    GoalUserFilterData
  >
    fetchModels={fetchGoalDrafts}
    deleteModel={deleteGoalDraft}
    onCreateModel={onCreateDraft}
    onSend={onSendDraft}
    onEditModel={onEditDraft}
    emptyStateImage={emptyStateImage}
    noSearchImage={noSearchImage}
    mapSubjectNameToEnum={mapSubjectNameToEnum}
    userFilterData={userFilterData}
    subjectsMap={subjectsMap}
    config={GOAL_DRAFTS_CONFIG}
    createTableColumns={(mapSubject, send, edit, del) =>
      createModelsTableColumnsBase(
        mapSubject,
        send,
        edit,
        del,
        GOAL_DRAFTS_COLUMNS_CONFIG
      )
    }
    createFiltersConfig={createGoalDraftsFiltersConfig}
    buildFiltersFromParams={buildGoalModelsFiltersFromParams}
    createUseModels={createUseGoalDrafts}
  />
);

export default GoalDraftsTab;
