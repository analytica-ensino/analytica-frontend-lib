import {
  ModelsTabBase,
  createModelsTableColumnsBase,
  type ModelsTabConfig,
  type ModelsColumnsConfig,
} from '../../shared/ModelsTabBase';
import { createRecommendedClassDraftsFiltersConfig } from '../config/draftsFiltersConfig';
import { buildRecommendedClassModelsFiltersFromParams } from '../utils/filterBuilders';
import { createUseRecommendedClassDrafts } from '../../../hooks/useRecommendedClassDrafts';
import type {
  RecommendedClassModelTableItem,
  RecommendedClassModelFilters,
  RecommendedClassModelsApiResponse,
  RecommendedClassUserFilterData,
} from '../../../types/recommendedLessons';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Configuration for recommendedClass drafts tab
 */
const GOAL_DRAFTS_CONFIG: ModelsTabConfig = {
  entityName: 'rascunho',
  entityNamePlural: 'rascunhos',
  testId: 'recommendedClass-drafts-tab',
  emptyStateTitle: 'Você não tem aulas recomendadas em rascunho',
  emptyStateDescription:
    'As aulas recomendadas que você começar a criar, aparecerão aqui automaticamente como rascunhos. Tudo é salvo enquanto você cria, continue de onde parou quando quiser!',
  searchPlaceholder: 'Buscar rascunho',
};

/**
 * Configuration for recommendedClass drafts table columns
 */
const GOAL_DRAFTS_COLUMNS_CONFIG: ModelsColumnsConfig = {
  sendButtonLabel: 'Enviar aula',
  sendButtonAriaLabel: 'Enviar rascunho',
  deleteButtonAriaLabel: 'Deletar rascunho',
  editButtonAriaLabel: 'Editar rascunho',
};

/**
 * Props for the RecommendedClassDraftsTab component
 */
export interface RecommendedClassDraftsTabProps {
  /** Function to fetch recommendedClass drafts from API */
  fetchRecommendedClassDrafts: (
    filters?: RecommendedClassModelFilters
  ) => Promise<RecommendedClassModelsApiResponse>;
  /** Function to delete a recommendedClass draft */
  deleteRecommendedClassDraft: (id: string) => Promise<void>;
  /** Callback when create draft button is clicked */
  onCreateDraft: () => void;
  /** Callback when send lesson button is clicked on a draft */
  onSendDraft?: (draft: RecommendedClassModelTableItem) => void;
  /** Callback when edit draft button is clicked */
  onEditDraft?: (draft: RecommendedClassModelTableItem) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: RecommendedClassUserFilterData;
  /**
   * Map of subject IDs to names for drafts display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches.
   */
  subjectsMap?: Map<string, string>;
}

/**
 * RecommendedClassDraftsTab component
 * Displays recommendedClass drafts with filters, pagination, and CRUD actions.
 * Uses the shared ModelsTabBase component for common functionality.
 */
export const RecommendedClassDraftsTab = ({
  fetchRecommendedClassDrafts,
  deleteRecommendedClassDraft,
  onCreateDraft,
  onSendDraft,
  onEditDraft,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  subjectsMap,
}: RecommendedClassDraftsTabProps) => (
  <ModelsTabBase<
    RecommendedClassModelTableItem,
    RecommendedClassModelFilters,
    RecommendedClassModelsApiResponse,
    RecommendedClassUserFilterData
  >
    fetchModels={fetchRecommendedClassDrafts}
    deleteModel={deleteRecommendedClassDraft}
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
    createFiltersConfig={createRecommendedClassDraftsFiltersConfig}
    buildFiltersFromParams={buildRecommendedClassModelsFiltersFromParams}
    createUseModels={createUseRecommendedClassDrafts}
  />
);

export default RecommendedClassDraftsTab;
