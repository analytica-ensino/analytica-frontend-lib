import type { MouseEvent, ReactNode } from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple';
import Text from '../Text/Text';
import { TruncatedText } from '../TruncatedText/TruncatedText';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Badge from '../Badge/Badge';
import EmptyState from '../EmptyState/EmptyState';
import { Menu, MenuItem, MenuContent } from '../Menu/Menu';
import { TableProvider } from '../TableProvider/TableProvider';
import ProgressBar from '../ProgressBar/ProgressBar';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import useToastStore from '../Toast/utils/ToastStore';
import { EditRecommendedLessonModal } from './EditRecommendedLessonModal';
import { renderSubjectsCell } from '../../utils/renderSubjectCell';
import { SubjectEnum } from '../../enums/SubjectEnum';
import type { ColumnConfig, TableParams } from '../TableProvider/TableProvider';
import type { FilterConfig } from '../Filter';
import {
  RecommendedClassDisplayStatus,
  RecommendedClassApiStatus,
  getRecommendedClassStatusBadgeAction,
  RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS,
  type RecommendedClassTableItem,
  type RecommendedClassHistoryFilters,
  type RecommendedClassHistoryApiResponse,
  type RecommendedClassUserFilterData,
  type RecommendedClassFilterOption,
  type RecommendedClassModelFilters,
  type RecommendedClassModelsApiResponse,
  type RecommendedClassModelTableItem,
  type RecommendedClassData,
  type UpdateRecommendedClassData,
} from '../../types/recommendedLessons';
import {
  createUseRecommendedLessonsHistory,
  type UseRecommendedLessonsHistoryReturn,
} from '../../hooks/useRecommendedLessons';
import { RecommendedClassModelsTab } from './tabs/ModelsTab';
import { RecommendedClassDraftsTab } from './tabs/DraftsTab';

/**
 * Enum for page tabs - exported for external routing control
 */
export enum RecommendedClassPageTab {
  HISTORY = 'history',
  DRAFTS = 'drafts',
  MODELS = 'models',
}

/**
 * Props for the RecommendedLessonsHistory component
 */
export interface RecommendedLessonsHistoryProps {
  /** Function to fetch recommendedClass history from API. Must return RecommendedClassHistoryApiResponse. */
  fetchRecommendedClassHistory: (
    filters?: RecommendedClassHistoryFilters
  ) => Promise<RecommendedClassHistoryApiResponse>;
  /** Callback when create lesson button is clicked */
  onCreateLesson: () => void;
  /** Callback when a row is clicked */
  onRowClick: (row: RecommendedClassTableItem) => void;
  /** Delete a recommended class (history item). Enables the row delete action. */
  deleteRecommendedClass?: (id: string) => Promise<void>;
  /** Update a recommended class title/dates. Enables the row edit action (with fetchRecommendedClassById). */
  updateRecommendedClass?: (
    id: string,
    data: UpdateRecommendedClassData
  ) => Promise<void>;
  /** Load a single recommended class to pre-fill the edit modal. */
  fetchRecommendedClassById?: (id: string) => Promise<RecommendedClassData>;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /**
   * @deprecated Ignored. The backend now sends each subject with its own colour
   * and icon, so the name no longer has to be mapped to a hardcoded enum. Kept
   * in the props so consumers that still pass it keep compiling.
   */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: RecommendedClassUserFilterData;
  /** Page title */
  title?: string;
  /** Create button text */
  createButtonText?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Function to fetch recommendedClass models from API (optional - for Models tab) */
  fetchRecommendedClassModels?: (
    filters?: RecommendedClassModelFilters
  ) => Promise<RecommendedClassModelsApiResponse>;
  /** Function to delete a recommendedClass model (optional - for Models tab) */
  deleteRecommendedClassModel?: (id: string) => Promise<void>;
  /** Callback when create model button is clicked (optional - for Models tab) */
  onCreateModel?: () => void;
  /** Callback when send lesson button is clicked on a model (optional - for Models tab) */
  onSendLesson?: (model: RecommendedClassModelTableItem) => void;
  /** Callback when edit model button is clicked (optional - for Models tab) */
  onEditModel?: (model: RecommendedClassModelTableItem) => void;
  /**
   * Map of subject IDs to names for models display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches.
   */
  subjectsMap?: Map<string, string>;
  /** Function to fetch recommendedClass drafts from API (optional - for Drafts tab) */
  fetchRecommendedClassDrafts?: (
    filters?: RecommendedClassModelFilters
  ) => Promise<RecommendedClassModelsApiResponse>;
  /** Function to delete a recommendedClass draft (optional - for Drafts tab) */
  deleteRecommendedClassDraft?: (id: string) => Promise<void>;
  /** Callback when send draft button is clicked (optional - for Drafts tab) */
  onSendDraft?: (draft: RecommendedClassModelTableItem) => void;
  /** Callback when edit draft button is clicked (optional - for Drafts tab) */
  onEditDraft?: (draft: RecommendedClassModelTableItem) => void;
  /**
   * Default tab to display. When provided with onTabChange, enables controlled mode
   * for URL routing.
   */
  defaultTab?: RecommendedClassPageTab;
  /**
   * Callback when tab changes. When provided, enables controlled mode for URL routing.
   * Use this to navigate to different routes when tabs change.
   */
  onTabChange?: (tab: RecommendedClassPageTab) => void;
  /**
   * Extra filter categories to inject (e.g., creatorType for gestors).
   * Merged with default filters when provided.
   */
  extraFilterCategories?: FilterConfig[];
  /**
   * Id of the current user. When provided, the edit/delete actions are shown
   * only for rows the current user created (i.e. rows whose `creatorId`
   * matches this id). When undefined, the actions behave as before and are
   * shown for every row (subject to the delete/edit capabilities), keeping
   * other consumers of this shared component unaffected.
   */
  currentUserId?: string;
}

/**
 * Read a filter category as the list of selected ids.
 *
 * Every category in the filter modal is multi-select, so each one travels as a
 * list: collapsing it to `param[0]` is what made a two-subject selection answer
 * with a single subject.
 *
 * @param param - Raw value emitted by TableProvider under the category key
 * @returns The selected ids, or undefined when nothing is selected
 */
const selectedIds = (param: unknown): string[] | undefined => {
  if (!Array.isArray(param) || param.length === 0) return undefined;
  return param as string[];
};

/**
 * Build recommendedClass history filters from table params
 */
const buildFiltersFromParams = (
  params: TableParams
): RecommendedClassHistoryFilters => {
  const filters: RecommendedClassHistoryFilters = {
    page: params.page,
    limit: params.limit,
  };

  if (params.search) {
    filters.search = params.search;
  }

  const statuses = selectedIds(params.status);
  if (statuses) filters.statuses = statuses as RecommendedClassApiStatus[];

  const schools = selectedIds(params.school);
  if (schools) filters.schoolIds = schools;

  const schoolYears = selectedIds(params.schoolYear);
  if (schoolYears) filters.schoolYearIds = schoolYears;

  const classes = selectedIds(params.class);
  if (classes) filters.classIds = classes;

  const subjects = selectedIds(params.subject);
  if (subjects) filters.subjectIds = subjects;

  // Start date filter
  if (params.startDate && typeof params.startDate === 'string') {
    filters.startDate = params.startDate;
  }

  // `creatorType` is a two-option toggle (mine / teachers): picking both is the
  // same as not filtering, so the param is dropped instead of collapsed to the
  // first choice.
  const creatorTypes = selectedIds(params.creatorType);
  if (creatorTypes?.length === 1) {
    filters.creatorType = creatorTypes[0];
  }

  return filters;
};

/**
 * Get school options from user data
 */
const getSchoolOptions = (
  data: RecommendedClassUserFilterData | undefined
): RecommendedClassFilterOption[] => {
  if (!data?.schools) return [];
  return data.schools.map((school) => ({
    id: school.id,
    name: school.name,
  }));
};

/**
 * Get school year options from user data
 */
const getSchoolYearOptions = (
  data: RecommendedClassUserFilterData | undefined
): RecommendedClassFilterOption[] => {
  if (!data?.schoolYears) return [];
  return data.schoolYears.map((year) => ({
    id: year.id,
    name: year.name,
  }));
};

/**
 * Get class options from user data
 */
const getClassOptions = (
  data: RecommendedClassUserFilterData | undefined
): RecommendedClassFilterOption[] => {
  if (!data?.classes) return [];
  return data.classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
  }));
};

/**
 * Get subject options from user data
 */
const getSubjectOptions = (
  data: RecommendedClassUserFilterData | undefined
): RecommendedClassFilterOption[] => {
  if (!data?.subjects) return [];
  return data.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));
};

/**
 * Create filter configuration for recommendedClass
 */
const createRecommendedClassFiltersConfig = (
  userData: RecommendedClassUserFilterData | undefined
): FilterConfig[] => [
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
      {
        key: 'schoolYear',
        label: 'Série',
        selectedIds: [],
        itens: getSchoolYearOptions(userData),
      },
      {
        key: 'class',
        label: 'Turma',
        selectedIds: [],
        itens: getClassOptions(userData),
      },
    ],
  },
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'subject',
        label: 'Componente curricular',
        selectedIds: [],
        itens: getSubjectOptions(userData),
      },
    ],
  },
  {
    key: 'lesson',
    label: 'AULA',
    categories: [
      {
        key: 'status',
        label: 'Status',
        selectedIds: [],
        itens: RECOMMENDED_CLASS_FILTER_STATUS_OPTIONS,
      },
    ],
  },
];

/**
 * Create table columns configuration
 */
const createTableColumns = (
  onDelete: ((row: RecommendedClassTableItem) => void) | undefined,
  onEdit: ((row: RecommendedClassTableItem) => void) | undefined,
  currentUserId?: string
): ColumnConfig<RecommendedClassTableItem>[] => [
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
    className: 'max-w-[200px]',
    render: (value: unknown) => {
      const title = typeof value === 'string' ? value : '';
      return <TruncatedText size="sm">{title}</TruncatedText>;
    },
  },
  {
    key: 'school',
    label: 'Escola',
    sortable: true,
    className: 'max-w-[150px]',
    render: (value: unknown) => {
      const school = typeof value === 'string' ? value : '';
      return <TruncatedText size="sm">{school}</TruncatedText>;
    },
  },
  {
    key: 'subjects',
    label: 'Componente curricular',
    // Ordenar por uma lista de matérias não significa nada.
    sortable: false,
    className: 'max-w-[200px]',
    render: renderSubjectsCell,
  },
  {
    key: 'class',
    label: 'Turma',
    sortable: true,
    className: 'max-w-[120px]',
    render: (value: unknown) => {
      const className = typeof value === 'string' ? value : '';
      return <TruncatedText size="sm">{className}</TruncatedText>;
    },
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
          action={getRecommendedClassStatusBadgeAction(
            status as RecommendedClassDisplayStatus
          )}
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
    key: 'actions',
    label: '',
    sortable: false,
    className: 'w-20',
    render: (_value: unknown, row: RecommendedClassTableItem) => {
      if (!onDelete && !onEdit) {
        return null;
      }

      // Opt-in ownership gate: when a current user id is provided, only the
      // row's creator may see the edit/delete actions. Rows created by others
      // (or with an unknown creator) hide the actions.
      if (currentUserId && row.creatorId !== currentUserId) {
        return null;
      }

      const handleDelete = (e: MouseEvent) => {
        e.stopPropagation();
        onDelete?.(row);
      };

      const handleEdit = (e: MouseEvent) => {
        e.stopPropagation();
        onEdit?.(row);
      };

      return (
        <div className="flex justify-center gap-2">
          {onDelete && (
            <IconButton
              icon={<TrashIcon size={20} />}
              size="sm"
              title="Excluir"
              aria-label="Excluir"
              onClick={handleDelete}
            />
          )}
          {onEdit && (
            <IconButton
              icon={<PencilSimpleIcon size={20} />}
              size="sm"
              title="Editar"
              aria-label="Editar"
              onClick={handleEdit}
            />
          )}
        </div>
      );
    },
  },
  {
    key: 'navigation',
    label: '',
    sortable: false,
    className: 'w-12',
    render: () => (
      <div className="flex justify-center">
        <CaretRightIcon size={20} className="text-text-600" />
      </div>
    ),
  },
];

/**
 * RecommendedLessonsHistory component
 * Displays recommendedClass/recommended lessons history with tabs, filters, and table
 */
export const RecommendedLessonsHistory = ({
  fetchRecommendedClassHistory,
  onCreateLesson,
  onRowClick,
  deleteRecommendedClass,
  updateRecommendedClass,
  fetchRecommendedClassById,
  emptyStateImage,
  noSearchImage,
  userFilterData,
  title = 'Histórico de aulas recomendadas',
  createButtonText = 'Criar aula',
  searchPlaceholder = 'Buscar aula',
  fetchRecommendedClassModels,
  deleteRecommendedClassModel,
  onCreateModel,
  onSendLesson,
  onEditModel,
  subjectsMap,
  fetchRecommendedClassDrafts,
  deleteRecommendedClassDraft,
  onSendDraft,
  onEditDraft,
  defaultTab,
  onTabChange,
  extraFilterCategories,
  currentUserId,
}: RecommendedLessonsHistoryProps) => {
  const [activeTab, setActiveTab] = useState<RecommendedClassPageTab>(
    defaultTab ?? RecommendedClassPageTab.HISTORY
  );

  // Sync with external defaultTab prop when it changes (for URL routing)
  useEffect(() => {
    if (defaultTab !== undefined) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  /**
   * Handle tab change - calls onTabChange callback if provided for URL routing
   */
  const handleTabChange = useCallback(
    (value: string) => {
      const newTab = value as RecommendedClassPageTab;
      setActiveTab(newTab);
      onTabChange?.(newTab);
    },
    [onTabChange]
  );

  // Use ref to keep stable reference of fetchRecommendedClassHistory
  // This prevents hook recreation if parent doesn't memoize the function
  const fetchRecommendedClassHistoryRef = useRef(fetchRecommendedClassHistory);
  fetchRecommendedClassHistoryRef.current = fetchRecommendedClassHistory;

  // Create hook instance with stable fetch function wrapper
  const useRecommendedClassHistory = useMemo(
    () =>
      createUseRecommendedLessonsHistory((filters) =>
        fetchRecommendedClassHistoryRef.current(filters)
      ),
    []
  );

  // Use the hook
  const {
    recommendedClass,
    loading,
    error,
    pagination,
    fetchRecommendedClass,
  }: UseRecommendedLessonsHistoryReturn = useRecommendedClassHistory();

  const addToast = useToastStore((state) => state.addToast);

  // Whether the per-row edit/delete actions are available
  const deleteEnabled = Boolean(deleteRecommendedClass);
  const editEnabled = Boolean(
    updateRecommendedClass && fetchRecommendedClassById
  );

  // Recommended class pending deletion confirmation (drives the AlertDialog)
  const [recommendedClassToDelete, setRecommendedClassToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Recommended class currently being edited (drives the EditRecommendedLessonModal)
  const [recommendedClassToEdit, setRecommendedClassToEdit] = useState<{
    id: string;
  } | null>(null);

  // Last applied filters, used to reload the list after a mutation
  const lastFiltersRef = useRef<RecommendedClassHistoryFilters | undefined>(
    undefined
  );

  // In-flight guard so a double-click on "Excluir" can't fire multiple DELETEs
  const deletingRef = useRef(false);

  const handleOpenDelete = useCallback((row: RecommendedClassTableItem) => {
    setRecommendedClassToDelete({ id: row.id, title: row.title });
  }, []);

  const handleOpenEdit = useCallback((row: RecommendedClassTableItem) => {
    setRecommendedClassToEdit({ id: row.id });
  }, []);

  /**
   * Reload the history list with the last applied filters (after a mutation)
   */
  const reloadHistory = useCallback(() => {
    fetchRecommendedClass(lastFiltersRef.current);
  }, [fetchRecommendedClass]);

  /**
   * Confirm deletion of the selected recommended class, then reload the list
   */
  const handleConfirmDelete = useCallback(async () => {
    if (
      !recommendedClassToDelete ||
      !deleteRecommendedClass ||
      deletingRef.current
    ) {
      return;
    }
    deletingRef.current = true;
    try {
      await deleteRecommendedClass(recommendedClassToDelete.id);
      setRecommendedClassToDelete(null);
      reloadHistory();
      addToast({
        title: 'Aula recomendada excluída com sucesso',
        action: 'success',
        position: 'top-right',
      });
    } catch {
      setRecommendedClassToDelete(null);
      addToast({
        title: 'Erro ao excluir aula recomendada',
        action: 'warning',
        position: 'top-right',
      });
    } finally {
      deletingRef.current = false;
    }
  }, [
    recommendedClassToDelete,
    deleteRecommendedClass,
    reloadHistory,
    addToast,
  ]);

  // Create filter and column configurations, merging extra filters if provided
  const initialFilterConfigs = useMemo(
    () => [
      ...createRecommendedClassFiltersConfig(userFilterData),
      ...(Array.isArray(extraFilterCategories) &&
      extraFilterCategories.length > 0
        ? extraFilterCategories
        : []),
    ],
    [userFilterData, extraFilterCategories]
  );

  const tableColumns = useMemo(
    () =>
      createTableColumns(
        deleteEnabled ? handleOpenDelete : undefined,
        editEnabled ? handleOpenEdit : undefined,
        currentUserId
      ),
    [
      deleteEnabled,
      editEnabled,
      handleOpenDelete,
      handleOpenEdit,
      currentUserId,
    ]
  );

  /**
   * Handle table params change
   * Note: TableProvider calls this on mount with initial params,
   * so no separate useEffect for initial fetch is needed
   */
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      const filters = buildFiltersFromParams(params);
      lastFiltersRef.current = filters;
      fetchRecommendedClass(filters);
    },
    [fetchRecommendedClass]
  );

  return (
    <div
      data-testid="recommended-class-history"
      className="flex flex-col w-full h-auto relative justify-center items-center mb-5 overflow-hidden"
    >
      {/* Delete confirmation dialog */}
      {deleteEnabled && (
        <AlertDialog
          isOpen={!!recommendedClassToDelete}
          onChangeOpen={(open) => {
            if (!open) {
              setRecommendedClassToDelete(null);
            }
          }}
          title="Excluir aula recomendada"
          description={`Tem certeza que deseja excluir a aula "${
            recommendedClassToDelete?.title ?? ''
          }"? Esta ação não pode ser desfeita.`}
          submitButtonLabel="Excluir"
          cancelButtonLabel="Cancelar"
          submitAction="negative"
          onSubmit={handleConfirmDelete}
          onCancel={() => setRecommendedClassToDelete(null)}
        />
      )}

      {/* Edit modal (title + dates) — keyed by id so it remounts per row,
          avoiding a stale-form flash when switching between lessons */}
      {editEnabled &&
        fetchRecommendedClassById &&
        updateRecommendedClass &&
        recommendedClassToEdit && (
          <EditRecommendedLessonModal
            key={recommendedClassToEdit.id}
            isOpen
            recommendedClassId={recommendedClassToEdit.id}
            fetchById={fetchRecommendedClassById}
            onUpdate={updateRecommendedClass}
            onClose={() => setRecommendedClassToEdit(null)}
            onSaved={() => {
              setRecommendedClassToEdit(null);
              reloadHistory();
            }}
          />
        )}

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
            {title}
          </Text>

          {/* Tabs Menu */}
          <div className="flex-shrink-0 lg:w-auto self-center sm:self-auto">
            <Menu
              defaultValue={RecommendedClassPageTab.HISTORY}
              value={activeTab}
              onValueChange={handleTabChange}
              variant="menu2"
              className="bg-transparent shadow-none px-0"
            >
              <MenuContent
                variant="menu2"
                className="w-full lg:w-auto max-w-full min-w-0"
              >
                <MenuItem
                  variant="menu2"
                  value={RecommendedClassPageTab.HISTORY}
                  data-testid="menu-item-history"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Histórico
                </MenuItem>
                <MenuItem
                  variant="menu2"
                  value={RecommendedClassPageTab.DRAFTS}
                  data-testid="menu-item-drafts"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Rascunhos
                </MenuItem>
                <MenuItem
                  variant="menu2"
                  value={RecommendedClassPageTab.MODELS}
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
          {activeTab === RecommendedClassPageTab.HISTORY && (
            <>
              {/* Error State */}
              {error ? (
                <div className="flex items-center justify-center bg-background rounded-xl w-full min-h-[705px]">
                  <Text size="lg" color="text-error-500">
                    {error}
                  </Text>
                </div>
              ) : (
                <div className="w-full">
                  <TableProvider
                    data={recommendedClass}
                    headers={tableColumns}
                    loading={loading}
                    variant="borderless"
                    enableSearch
                    enableFilters
                    enableTableSort
                    enablePagination
                    enableRowClick
                    initialFilters={initialFilterConfigs}
                    paginationConfig={{
                      itemLabel: 'aulas',
                      itemsPerPageOptions: [10, 20, 50, 100],
                      defaultItemsPerPage: 10,
                      totalItems: pagination.total,
                      totalPages: pagination.totalPages,
                    }}
                    searchPlaceholder={searchPlaceholder}
                    noSearchResultState={{
                      image: noSearchImage,
                    }}
                    emptyState={{
                      component: (
                        <EmptyState
                          image={emptyStateImage}
                          title="Crie uma nova aula"
                          description="Selecione um conjunto de aulas organizadas por tema e ajude seus alunos a estudarem de forma estruturada e eficiente!"
                          buttonText={createButtonText}
                          buttonIcon={<PlusIcon size={18} />}
                          buttonVariant="outline"
                          buttonAction="primary"
                          onButtonClick={onCreateLesson}
                        />
                      ),
                    }}
                    onParamsChange={handleParamsChange}
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
                              onClick={onCreateLesson}
                              iconLeft={<PlusIcon size={18} weight="bold" />}
                            >
                              {createButtonText}
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

          {activeTab === RecommendedClassPageTab.DRAFTS &&
            fetchRecommendedClassDrafts &&
            deleteRecommendedClassDraft &&
            onCreateLesson && (
              <RecommendedClassDraftsTab
                fetchRecommendedClassDrafts={fetchRecommendedClassDrafts}
                deleteRecommendedClassDraft={deleteRecommendedClassDraft}
                onCreateDraft={onCreateLesson}
                onSendDraft={onSendDraft}
                onEditDraft={onEditDraft}
                emptyStateImage={emptyStateImage}
                noSearchImage={noSearchImage}
                userFilterData={userFilterData}
                subjectsMap={subjectsMap}
              />
            )}

          {activeTab === RecommendedClassPageTab.MODELS &&
            fetchRecommendedClassModels &&
            deleteRecommendedClassModel &&
            onCreateModel && (
              <RecommendedClassModelsTab
                fetchRecommendedClassModels={fetchRecommendedClassModels}
                deleteRecommendedClassModel={deleteRecommendedClassModel}
                onCreateModel={onCreateModel}
                onSendLesson={onSendLesson}
                onEditModel={onEditModel}
                emptyStateImage={emptyStateImage}
                noSearchImage={noSearchImage}
                userFilterData={userFilterData}
                subjectsMap={subjectsMap}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default RecommendedLessonsHistory;
