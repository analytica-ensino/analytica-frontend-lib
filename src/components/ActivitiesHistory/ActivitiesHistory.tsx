import type { MouseEvent, ReactNode } from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  CaretRight,
  Trash,
  PencilSimple,
  PaperPlaneTilt,
} from 'phosphor-react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import EmptyState from '../EmptyState/EmptyState';
import { Menu, MenuItem, MenuContent } from '../Menu/Menu';
import { TableProvider } from '../TableProvider/TableProvider';
import ProgressBar from '../ProgressBar/ProgressBar';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import Toaster, { useToast } from '../Toast/utils/Toaster';
import { SubjectEnum } from '../../enums/SubjectEnum';
import { renderSubjectCell } from './utils/renderSubjectCell';
import { renderTruncatedText } from './utils/renderTruncatedText';
import { ErrorDisplay } from './components/ErrorDisplay';
import type { ColumnConfig, TableParams } from '../TableProvider/TableProvider';
import type { FilterConfig } from '../Filter';
import {
  ActivityApiStatus,
  ActivityDisplayStatus,
  getActivityStatusBadgeAction,
  ACTIVITY_FILTER_STATUS_OPTIONS,
  type ActivityTableItem,
  type ActivityHistoryFilters,
  type ActivitiesHistoryApiResponse,
  type ActivityUserFilterData,
  type ActivityFilterOption,
  type ActivityModelTableItem,
  type ActivityModelFilters,
  type ActivityModelsApiResponse,
} from '../../types/activitiesHistory';
import {
  createUseActivitiesHistory,
  type UseActivitiesHistoryReturn,
} from '../../hooks/useActivitiesHistory';
import {
  createUseActivityModels,
  type UseActivityModelsReturn,
} from '../../hooks/useActivityModels';

/**
 * Enum for page tabs
 */
enum PageTab {
  HISTORY = 'history',
  DRAFTS = 'drafts',
  MODELS = 'models',
}

/**
 * Page titles based on active tab
 */
const PAGE_TITLES: Record<PageTab, string> = {
  [PageTab.HISTORY]: 'Histórico de atividades',
  [PageTab.DRAFTS]: 'Rascunhos',
  [PageTab.MODELS]: 'Modelos de atividades',
};

/**
 * Props for the ActivitiesHistory component
 */
export interface ActivitiesHistoryProps {
  /** Function to fetch activities history from API */
  fetchActivitiesHistory: (
    filters?: ActivityHistoryFilters
  ) => Promise<ActivitiesHistoryApiResponse>;
  /** Function to fetch activity models from API */
  fetchActivityModels: (
    filters?: ActivityModelFilters
  ) => Promise<ActivityModelsApiResponse>;
  /** Function to delete an activity model */
  deleteActivityModel: (id: string) => Promise<void>;
  /** Callback when create activity button is clicked */
  onCreateActivity: () => void;
  /** Callback when create model button is clicked */
  onCreateModel: () => void;
  /** Callback when a history row is clicked */
  onRowClick: (row: ActivityTableItem) => void;
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
   * to avoid unnecessary re-fetches when the MODELS tab is active.
   * @example
   * const subjectsMap = useMemo(() => {
   *   const map = new Map();
   *   subjects.forEach(s => map.set(s.id, s.name));
   *   return map;
   * }, [subjects]);
   */
  subjectsMap?: Map<string, string>;
}

/**
 * Check if param is a non-empty array
 */
const isNonEmptyArray = (param: unknown): param is string[] =>
  Array.isArray(param) && param.length > 0;

/**
 * Build activity history filters from table params
 */
const buildHistoryFiltersFromParams = (
  params: TableParams
): ActivityHistoryFilters => {
  const filters: ActivityHistoryFilters = {
    page: params.page,
    limit: params.limit,
  };

  if (params.search) {
    filters.search = params.search;
  }

  // Status filter (single selection)
  if (isNonEmptyArray(params.status)) {
    filters.status = params.status[0] as ActivityApiStatus;
  }

  // School filter
  if (isNonEmptyArray(params.school)) {
    filters.schoolId = params.school[0];
  }

  // Subject filter
  if (isNonEmptyArray(params.subject)) {
    filters.subjectId = params.subject[0];
  }

  return filters;
};

/**
 * Build activity models filters from table params
 */
const buildModelsFiltersFromParams = (
  params: TableParams
): ActivityModelFilters => {
  const filters: ActivityModelFilters = {
    page: params.page,
    limit: params.limit,
  };

  if (params.search) {
    filters.search = params.search;
  }

  // Subject filter
  if (isNonEmptyArray(params.subject)) {
    filters.subjectId = params.subject[0];
  }

  return filters;
};

/**
 * Get school options from user data
 */
const getSchoolOptions = (
  data: ActivityUserFilterData | undefined
): ActivityFilterOption[] => {
  if (!data?.schools) return [];
  return data.schools.map((school) => ({
    id: school.id,
    name: school.name,
  }));
};

/**
 * Get subject options from user data
 */
const getSubjectOptions = (
  data: ActivityUserFilterData | undefined
): ActivityFilterOption[] => {
  if (!data?.subjects) return [];
  return data.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));
};

/**
 * Create filter configuration for activities history
 */
const createActivityFiltersConfig = (
  userData: ActivityUserFilterData | undefined
): FilterConfig[] => [
  {
    key: 'status',
    label: 'STATUS',
    categories: [
      {
        key: 'status',
        label: 'Status da Atividade',
        selectedIds: [],
        itens: ACTIVITY_FILTER_STATUS_OPTIONS,
      },
    ],
  },
  {
    key: 'academic',
    label: 'DADOS ACADÊMICOS',
    categories: [
      {
        key: 'school',
        label: 'Escola',
        selectedIds: [],
        itens: getSchoolOptions(userData),
      },
    ],
  },
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'subject',
        label: 'Matéria',
        selectedIds: [],
        itens: getSubjectOptions(userData),
      },
    ],
  },
];

/**
 * Create filter configuration for activity models
 */
const createModelsFiltersConfig = (
  userData: ActivityUserFilterData | undefined
): FilterConfig[] => [
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'subject',
        label: 'Matéria',
        selectedIds: [],
        itens: getSubjectOptions(userData),
      },
    ],
  },
];

/**
 * Create table columns for activities history
 */
const createHistoryTableColumns = (
  mapSubjectNameToEnum: ((name: string) => SubjectEnum | null) | undefined
): ColumnConfig<ActivityTableItem>[] => [
  {
    key: 'startDate',
    label: 'Início',
    sortable: true,
  },
  {
    key: 'deadline',
    label: 'Prazo',
    sortable: true,
  },
  {
    key: 'title',
    label: 'Título',
    sortable: true,
    className: 'max-w-[200px] truncate',
    render: renderTruncatedText,
  },
  {
    key: 'school',
    label: 'Escola',
    sortable: true,
    className: 'max-w-[150px] truncate',
    render: renderTruncatedText,
  },
  {
    key: 'year',
    label: 'Ano',
    sortable: true,
  },
  {
    key: 'subject',
    label: 'Matéria',
    sortable: true,
    className: 'max-w-[140px]',
    render: (value: unknown) => {
      const subjectName = typeof value === 'string' ? value : '';
      return renderSubjectCell(subjectName, mapSubjectNameToEnum, false);
    },
  },
  {
    key: 'class',
    label: 'Turma',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: unknown) => {
      const status = typeof value === 'string' ? value : '';
      if (!status) {
        return (
          <Text size="sm" color="text-text-500">
            -
          </Text>
        );
      }
      return (
        <Badge
          variant="solid"
          action={getActivityStatusBadgeAction(status as ActivityDisplayStatus)}
          size="small"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    key: 'completionPercentage',
    label: 'Conclusão',
    sortable: true,
    render: (value: unknown) => (
      <ProgressBar
        value={Number(value)}
        variant="blue"
        size="medium"
        layout="compact"
        showPercentage={true}
        compactWidth="w-[100px]"
      />
    ),
  },
  {
    key: 'navigation',
    label: '',
    sortable: false,
    className: 'w-12',
    render: () => (
      <div className="flex justify-center">
        <CaretRight size={20} className="text-text-600" />
      </div>
    ),
  },
];

/**
 * Create table columns for activity models
 */
const createModelsTableColumns = (
  mapSubjectNameToEnum: ((name: string) => SubjectEnum | null) | undefined,
  onSendActivity: ((model: ActivityModelTableItem) => void) | undefined,
  onEditModel: ((model: ActivityModelTableItem) => void) | undefined,
  onDeleteModel: (model: ActivityModelTableItem) => void
): ColumnConfig<ActivityModelTableItem>[] => [
  {
    key: 'title',
    label: 'Título',
    sortable: true,
    className: 'max-w-[400px]',
    render: (value: unknown) => {
      const title = typeof value === 'string' ? value : '';
      return (
        <Text size="sm" title={title} className="truncate block">
          {title}
        </Text>
      );
    },
  },
  {
    key: 'savedAt',
    label: 'Salvo em',
    sortable: true,
    className: 'w-[120px]',
  },
  {
    key: 'subject',
    label: 'Matéria',
    sortable: true,
    className: 'max-w-[160px]',
    render: (value: unknown) => {
      const subjectName = typeof value === 'string' ? value : '';
      return renderSubjectCell(subjectName, mapSubjectNameToEnum, true);
    },
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    className: 'w-[220px]',
    render: (_value: unknown, row: ActivityModelTableItem) => {
      const handleSend = (e: MouseEvent) => {
        e.stopPropagation();
        onSendActivity?.(row);
      };

      const handleEdit = (e: MouseEvent) => {
        e.stopPropagation();
        onEditModel?.(row);
      };

      const handleDelete = (e: MouseEvent) => {
        e.stopPropagation();
        onDeleteModel(row);
      };

      return (
        <div className="flex items-center gap-2 justify-end">
          {onSendActivity && (
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-950 border border-primary-950 rounded-full hover:bg-primary-50 transition-colors"
              aria-label="Enviar atividade"
            >
              <PaperPlaneTilt size={16} />
              Enviar atividade
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 text-text-600 hover:text-error-500 transition-colors"
            aria-label="Deletar modelo"
          >
            <Trash size={20} />
          </button>
          {onEditModel && (
            <button
              onClick={handleEdit}
              className="p-2 text-text-600 hover:text-primary-700 transition-colors"
              aria-label="Editar modelo"
            >
              <PencilSimple size={20} />
            </button>
          )}
        </div>
      );
    },
  },
];

/**
 * ActivitiesHistory component
 * Displays activities history with tabs for history, drafts, and models
 */
export const ActivitiesHistory = ({
  fetchActivitiesHistory,
  fetchActivityModels,
  deleteActivityModel,
  onCreateActivity,
  onCreateModel,
  onRowClick,
  onSendActivity,
  onEditModel,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  subjectsMap,
}: ActivitiesHistoryProps) => {
  const [activeTab, setActiveTab] = useState<PageTab>(PageTab.HISTORY);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] =
    useState<ActivityModelTableItem | null>(null);

  // Toast hook
  const { addToast } = useToast();

  // Use refs to keep stable references
  const fetchActivitiesHistoryRef = useRef(fetchActivitiesHistory);
  fetchActivitiesHistoryRef.current = fetchActivitiesHistory;

  const fetchActivityModelsRef = useRef(fetchActivityModels);
  fetchActivityModelsRef.current = fetchActivityModels;

  const deleteActivityModelRef = useRef(deleteActivityModel);
  deleteActivityModelRef.current = deleteActivityModel;

  // Keep stable reference to subjectsMap to avoid unnecessary re-fetches
  const subjectsMapRef = useRef(subjectsMap);
  subjectsMapRef.current = subjectsMap;

  // Create hook instances with stable fetch function wrappers
  const useActivitiesHistory = useMemo(
    () =>
      createUseActivitiesHistory((filters) =>
        fetchActivitiesHistoryRef.current(filters)
      ),
    []
  );

  const useActivityModels = useMemo(
    () =>
      createUseActivityModels(
        (filters) => fetchActivityModelsRef.current(filters),
        (id) => deleteActivityModelRef.current(id)
      ),
    []
  );

  // Use the hooks
  const {
    activities,
    loading,
    error,
    pagination,
    fetchActivities,
  }: UseActivitiesHistoryReturn = useActivitiesHistory();

  const {
    models,
    loading: modelsLoading,
    error: modelsError,
    pagination: modelsPagination,
    fetchModels,
    deleteModel,
  }: UseActivityModelsReturn = useActivityModels();

  // Create filter and column configurations
  const historyFilterConfigs = useMemo(
    () => createActivityFiltersConfig(userFilterData),
    [userFilterData]
  );

  const modelsFilterConfigs = useMemo(
    () => createModelsFiltersConfig(userFilterData),
    [userFilterData]
  );

  const historyTableColumns = useMemo(
    () => createHistoryTableColumns(mapSubjectNameToEnum),
    [mapSubjectNameToEnum]
  );

  const handleDeleteClick = useCallback((model: ActivityModelTableItem) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  }, []);

  const modelsTableColumns = useMemo(
    () =>
      createModelsTableColumns(
        mapSubjectNameToEnum,
        onSendActivity,
        onEditModel,
        handleDeleteClick
      ),
    [mapSubjectNameToEnum, onSendActivity, onEditModel, handleDeleteClick]
  );

  /**
   * Handle table params change for history tab
   */
  const handleHistoryParamsChange = useCallback(
    (params: TableParams) => {
      const filters = buildHistoryFiltersFromParams(params);
      fetchActivities(filters);
    },
    [fetchActivities]
  );

  /**
   * Handle table params change for models tab
   */
  const handleModelsParamsChange = useCallback(
    (params: TableParams) => {
      const filters = buildModelsFiltersFromParams(params);
      fetchModels(filters, subjectsMapRef.current);
    },
    [fetchModels]
  );

  /**
   * Fetch models when tab changes to models
   */
  useEffect(() => {
    if (activeTab === PageTab.MODELS) {
      fetchModels({ page: 1, limit: 10 }, subjectsMapRef.current);
    }
  }, [activeTab, fetchModels]);

  /**
   * Handle confirm delete
   */
  const handleConfirmDelete = useCallback(async () => {
    if (modelToDelete) {
      const success = await deleteModel(modelToDelete.id);
      if (success) {
        addToast({ title: 'Modelo deletado com sucesso', action: 'success' });
        fetchModels({ page: 1, limit: 10 }, subjectsMapRef.current);
      } else {
        addToast({ title: 'Erro ao deletar modelo', action: 'warning' });
      }
    }
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  }, [modelToDelete, deleteModel, fetchModels, addToast]);

  /**
   * Handle cancel delete
   */
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  }, []);

  return (
    <div
      data-testid="activities-history"
      className="flex flex-col w-full h-auto relative justify-center items-center mb-5 overflow-hidden"
    >
      {/* Background decoration */}
      <span className="absolute top-0 left-0 h-[150px] w-full z-0" />

      {/* Main container */}
      <div className="flex flex-col w-full h-full max-w-[1350px] mx-auto z-10 lg:px-0 px-4 pt-4 sm:pt-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row w-full mb-6 items-start sm:items-center sm:justify-between gap-0 sm:gap-4">
          {/* Page Title */}
          <Text
            as="h1"
            weight="bold"
            className="leading-[28px] tracking-[0.2px] text-xl lg:text-2xl"
          >
            {PAGE_TITLES[activeTab]}
          </Text>

          {/* Tabs Menu */}
          <div className="flex-shrink-0 lg:w-auto self-center sm:self-auto">
            <Menu
              defaultValue={PageTab.HISTORY}
              value={activeTab}
              onValueChange={(value: string) => setActiveTab(value as PageTab)}
              variant="menu2"
              className="bg-transparent shadow-none px-0"
            >
              <MenuContent
                variant="menu2"
                className="w-full lg:w-auto max-w-full min-w-0"
              >
                <MenuItem
                  variant="menu2"
                  value={PageTab.HISTORY}
                  data-testid="menu-item-history"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Histórico
                </MenuItem>
                <MenuItem
                  variant="menu2"
                  value={PageTab.DRAFTS}
                  data-testid="menu-item-drafts"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Rascunhos
                </MenuItem>
                <MenuItem
                  variant="menu2"
                  value={PageTab.MODELS}
                  data-testid="menu-item-models"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Modelos
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col items-center w-full min-h-0 flex-1">
          {activeTab === PageTab.HISTORY && (
            <>
              {/* Error State */}
              {error ? (
                <ErrorDisplay error={error} />
              ) : (
                <div className="w-full">
                  <TableProvider
                    data={activities}
                    headers={historyTableColumns}
                    loading={loading}
                    variant="borderless"
                    enableSearch
                    enableFilters
                    enableTableSort
                    enablePagination
                    enableRowClick
                    initialFilters={historyFilterConfigs}
                    paginationConfig={{
                      itemLabel: 'atividades',
                      itemsPerPageOptions: [10, 20, 50, 100],
                      defaultItemsPerPage: 10,
                      totalItems: pagination.total,
                      totalPages: pagination.totalPages,
                    }}
                    searchPlaceholder="Buscar atividade"
                    noSearchResultState={{
                      image: noSearchImage,
                    }}
                    emptyState={{
                      component: (
                        <EmptyState
                          image={emptyStateImage}
                          title="Incentive sua turma ao aprendizado"
                          description="Crie uma nova atividade e ajude seus alunos a colocarem o conteúdo em prática!"
                          buttonText="Criar atividade"
                          buttonIcon={<Plus size={18} />}
                          buttonVariant="outline"
                          buttonAction="primary"
                          onButtonClick={onCreateActivity}
                        />
                      ),
                    }}
                    onParamsChange={handleHistoryParamsChange}
                    onRowClick={onRowClick}
                  >
                    {(renderProps: unknown) => {
                      const {
                        controls,
                        table,
                        pagination: paginationComponent,
                      } = renderProps as {
                        controls: ReactNode;
                        table: ReactNode;
                        pagination: ReactNode;
                      };
                      return (
                        <div className="space-y-4">
                          {/* Header row: Button on left, Controls on right */}
                          <div className="flex items-center justify-between gap-4">
                            <Button
                              variant="solid"
                              action="primary"
                              size="medium"
                              onClick={onCreateActivity}
                              iconLeft={<Plus size={18} weight="bold" />}
                            >
                              Criar atividade
                            </Button>
                            {controls}
                          </div>
                          {/* Table and pagination */}
                          <div className="bg-background rounded-xl p-6 space-y-4">
                            {table}
                            {paginationComponent}
                          </div>
                        </div>
                      );
                    }}
                  </TableProvider>
                </div>
              )}
            </>
          )}

          {activeTab === PageTab.DRAFTS && (
            <div className="flex items-center justify-center bg-background rounded-xl w-full min-h-[705px]">
              <Text size="lg" color="text-text-600">
                Rascunhos em desenvolvimento
              </Text>
            </div>
          )}

          {activeTab === PageTab.MODELS && (
            <>
              <Toaster />
              {modelsError ? (
                <ErrorDisplay error={modelsError} />
              ) : (
                <div className="w-full" data-testid="activity-models-tab">
                  <TableProvider
                    data={models}
                    headers={modelsTableColumns}
                    loading={modelsLoading}
                    variant="borderless"
                    enableSearch
                    enableFilters
                    enableTableSort
                    enablePagination
                    initialFilters={modelsFilterConfigs}
                    paginationConfig={{
                      itemLabel: 'modelos',
                      itemsPerPageOptions: [10, 20, 50, 100],
                      defaultItemsPerPage: 10,
                      totalItems: modelsPagination.total,
                      totalPages: modelsPagination.totalPages,
                    }}
                    searchPlaceholder="Buscar modelo"
                    noSearchResultState={{
                      image: noSearchImage,
                    }}
                    emptyState={{
                      component: (
                        <EmptyState
                          image={emptyStateImage}
                          title="Crie modelos para agilizar suas atividades"
                          description="Salve modelos de atividades para reutilizar e enviar rapidamente para suas turmas!"
                          buttonText="Criar modelo"
                          buttonIcon={<Plus size={18} />}
                          buttonVariant="outline"
                          buttonAction="primary"
                          onButtonClick={onCreateModel}
                        />
                      ),
                    }}
                    onParamsChange={handleModelsParamsChange}
                  >
                    {(renderProps: unknown) => {
                      const {
                        controls,
                        table,
                        pagination: paginationComponent,
                      } = renderProps as {
                        controls: ReactNode;
                        table: ReactNode;
                        pagination: ReactNode;
                      };
                      return (
                        <div className="space-y-4">
                          {/* Header row: Button on left, Controls on right */}
                          <div className="flex items-center justify-between gap-4">
                            <Button
                              variant="solid"
                              action="primary"
                              size="medium"
                              onClick={onCreateModel}
                              iconLeft={<Plus size={18} weight="bold" />}
                            >
                              Criar modelo
                            </Button>
                            {controls}
                          </div>
                          {/* Table and pagination */}
                          <div className="bg-background rounded-xl p-6 space-y-4">
                            {table}
                            {paginationComponent}
                          </div>
                        </div>
                      );
                    }}
                  </TableProvider>
                </div>
              )}

              <AlertDialog
                isOpen={deleteDialogOpen}
                onChangeOpen={setDeleteDialogOpen}
                title="Deletar modelo"
                description={`Tem certeza que deseja deletar o modelo "${modelToDelete?.title}"? Esta ação não pode ser desfeita.`}
                submitButtonLabel="Deletar"
                cancelButtonLabel="Cancelar"
                onSubmit={handleConfirmDelete}
                onCancel={handleCancelDelete}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesHistory;
