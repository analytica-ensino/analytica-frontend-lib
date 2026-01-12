import type { MouseEvent, ReactNode } from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Plus, CaretRight, Trash, PencilSimple } from 'phosphor-react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Badge from '../Badge/Badge';
import EmptyState from '../EmptyState/EmptyState';
import { Menu, MenuItem, MenuContent } from '../Menu/Menu';
import { TableProvider } from '../TableProvider/TableProvider';
import ProgressBar from '../ProgressBar/ProgressBar';
import { getSubjectInfo } from '../SubjectInfo/SubjectInfo';
import { cn } from '../../utils/utils';
import { SubjectEnum } from '../../enums/SubjectEnum';
import type { ColumnConfig, TableParams } from '../TableProvider/TableProvider';
import type { FilterConfig } from '../Filter';
import {
  GoalDisplayStatus,
  GoalApiStatus,
  getGoalStatusBadgeAction,
  GOAL_FILTER_STATUS_OPTIONS,
  type GoalTableItem,
  type GoalHistoryFilters,
  type GoalsHistoryApiResponse,
  type GoalUserFilterData,
  type GoalFilterOption,
  type GoalModelFilters,
  type GoalModelsApiResponse,
  type GoalModelTableItem,
} from '../../types/recommendedLessons';
import {
  createUseRecommendedLessonsHistory,
  type UseRecommendedLessonsHistoryReturn,
} from '../../hooks/useRecommendedLessons';
import { GoalModelsTab } from './tabs/ModelsTab';

/**
 * Enum for page tabs - exported for external routing control
 */
export enum GoalPageTab {
  HISTORY = 'history',
  DRAFTS = 'drafts',
  MODELS = 'models',
}

/**
 * Props for the RecommendedLessonsHistory component
 */
export interface RecommendedLessonsHistoryProps {
  /** Function to fetch goals history from API. Must return GoalsHistoryApiResponse. */
  fetchGoalsHistory: (
    filters?: GoalHistoryFilters
  ) => Promise<GoalsHistoryApiResponse>;
  /** Callback when create lesson button is clicked */
  onCreateLesson: () => void;
  /** Callback when a row is clicked */
  onRowClick: (row: GoalTableItem) => void;
  /** Callback when delete action is clicked */
  onDeleteGoal?: (id: string) => void;
  /** Callback when edit action is clicked */
  onEditGoal?: (id: string) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: GoalUserFilterData;
  /** Page title */
  title?: string;
  /** Create button text */
  createButtonText?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Function to fetch goal models from API (optional - for Models tab) */
  fetchGoalModels?: (
    filters?: GoalModelFilters
  ) => Promise<GoalModelsApiResponse>;
  /** Function to delete a goal model (optional - for Models tab) */
  deleteGoalModel?: (id: string) => Promise<void>;
  /** Callback when create model button is clicked (optional - for Models tab) */
  onCreateModel?: () => void;
  /** Callback when send lesson button is clicked on a model (optional - for Models tab) */
  onSendLesson?: (model: GoalModelTableItem) => void;
  /** Callback when edit model button is clicked (optional - for Models tab) */
  onEditModel?: (model: GoalModelTableItem) => void;
  /**
   * Map of subject IDs to names for models display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches.
   */
  subjectsMap?: Map<string, string>;
  /**
   * Default tab to display. When provided with onTabChange, enables controlled mode
   * for URL routing.
   */
  defaultTab?: GoalPageTab;
  /**
   * Callback when tab changes. When provided, enables controlled mode for URL routing.
   * Use this to navigate to different routes when tabs change.
   */
  onTabChange?: (tab: GoalPageTab) => void;
}

/**
 * Check if param is a non-empty array
 */
const isNonEmptyArray = (param: unknown): param is string[] =>
  Array.isArray(param) && param.length > 0;

/**
 * Extract filter value from params for single/multiple selection
 */
const extractFilterValue = (
  param: unknown
): { single?: string; multiple?: string[] } => {
  if (!isNonEmptyArray(param)) return {};
  return param.length === 1 ? { single: param[0] } : { multiple: param };
};

/**
 * Build goal history filters from table params
 */
const buildFiltersFromParams = (params: TableParams): GoalHistoryFilters => {
  const filters: GoalHistoryFilters = {
    page: params.page,
    limit: params.limit,
  };

  if (params.search) {
    filters.search = params.search;
  }

  // Status filter (single selection)
  if (isNonEmptyArray(params.status)) {
    filters.status = params.status[0] as GoalApiStatus;
  }

  // School filter
  const schoolFilter = extractFilterValue(params.school);
  if (schoolFilter.single) filters.schoolId = schoolFilter.single;
  if (schoolFilter.multiple) filters.schoolIds = schoolFilter.multiple;

  // Class filter
  const classFilter = extractFilterValue(params.class);
  if (classFilter.single) filters.classId = classFilter.single;
  if (classFilter.multiple) filters.classIds = classFilter.multiple;

  // Students filter (always multiple)
  if (isNonEmptyArray(params.students)) {
    filters.studentIds = params.students;
  }

  // Subject filter (single selection)
  if (isNonEmptyArray(params.subject)) {
    filters.subjectId = params.subject[0];
  }

  // Start date filter
  if (params.startDate && typeof params.startDate === 'string') {
    filters.startDate = params.startDate;
  }

  return filters;
};

/**
 * Get school options from user data
 */
const getSchoolOptions = (
  data: GoalUserFilterData | undefined
): GoalFilterOption[] => {
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
  data: GoalUserFilterData | undefined
): GoalFilterOption[] => {
  if (!data?.subjects) return [];
  return data.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));
};

/**
 * Get school year options from user data
 */
const getSchoolYearOptions = (
  data: GoalUserFilterData | undefined
): GoalFilterOption[] => {
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
  data: GoalUserFilterData | undefined
): GoalFilterOption[] => {
  if (!data?.classes) return [];
  return data.classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
  }));
};

/**
 * Create filter configuration for goals
 */
const createGoalFiltersConfig = (
  userData: GoalUserFilterData | undefined
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
      {
        key: 'students',
        label: 'Alunos',
        selectedIds: [],
        itens: [],
      },
    ],
  },
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'knowledgeArea',
        label: 'Área de conhecimento',
        selectedIds: [],
        itens: [],
      },
      {
        key: 'subject',
        label: 'Matéria',
        selectedIds: [],
        itens: getSubjectOptions(userData),
      },
      {
        key: 'theme',
        label: 'Tema',
        selectedIds: [],
        itens: [],
      },
      {
        key: 'subtheme',
        label: 'Subtema',
        selectedIds: [],
        itens: [],
      },
      {
        key: 'topic',
        label: 'Assunto',
        selectedIds: [],
        itens: [],
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
        itens: GOAL_FILTER_STATUS_OPTIONS,
      },
    ],
  },
];

/**
 * Create table columns configuration
 */
const createTableColumns = (
  mapSubjectNameToEnum: ((name: string) => SubjectEnum | null) | undefined,
  onDeleteGoal: ((id: string) => void) | undefined,
  onEditGoal: ((id: string) => void) | undefined
): ColumnConfig<GoalTableItem>[] => [
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
    render: (value: unknown) => {
      const title = typeof value === 'string' ? value : '';
      return (
        <Text size="sm" title={title}>
          {title}
        </Text>
      );
    },
  },
  {
    key: 'school',
    label: 'Escola',
    sortable: true,
    className: 'max-w-[150px] truncate',
    render: (value: unknown) => {
      const school = typeof value === 'string' ? value : '';
      return (
        <Text size="sm" title={school}>
          {school}
        </Text>
      );
    },
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
      const subjectEnum = mapSubjectNameToEnum?.(subjectName);

      if (!subjectEnum) {
        return (
          <Text size="sm" className="truncate" title={subjectName}>
            {subjectName}
          </Text>
        );
      }

      const subjectInfo = getSubjectInfo(subjectEnum);

      return (
        <div className="flex items-center gap-2" title={subjectName}>
          <span
            className={cn(
              'w-[21px] h-[21px] flex items-center justify-center rounded-sm text-text-950 shrink-0',
              subjectInfo.colorClass
            )}
          >
            {subjectInfo.icon}
          </span>
          <Text size="sm" className="truncate">
            {subjectName}
          </Text>
        </div>
      );
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
          action={getGoalStatusBadgeAction(status as GoalDisplayStatus)}
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
    render: (_value: unknown, row: GoalTableItem) => {
      const handleDelete = (e: MouseEvent) => {
        e.stopPropagation();
        onDeleteGoal?.(row.id);
      };

      const handleEdit = (e: MouseEvent) => {
        e.stopPropagation();
        onEditGoal?.(row.id);
      };

      return (
        <div className="flex justify-center gap-2">
          <IconButton
            icon={<Trash size={20} />}
            size="sm"
            title="Excluir"
            onClick={handleDelete}
          />
          <IconButton
            icon={<PencilSimple size={20} />}
            size="sm"
            title="Editar"
            onClick={handleEdit}
          />
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
        <CaretRight size={20} className="text-text-600" />
      </div>
    ),
  },
];

/**
 * RecommendedLessonsHistory component
 * Displays goals/recommended lessons history with tabs, filters, and table
 */
export const RecommendedLessonsHistory = ({
  fetchGoalsHistory,
  onCreateLesson,
  onRowClick,
  onDeleteGoal,
  onEditGoal,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  title = 'Histórico de aulas recomendadas',
  createButtonText = 'Criar aula',
  searchPlaceholder = 'Buscar aula',
  fetchGoalModels,
  deleteGoalModel,
  onCreateModel,
  onSendLesson,
  onEditModel,
  subjectsMap,
  defaultTab,
  onTabChange,
}: RecommendedLessonsHistoryProps) => {
  const [activeTab, setActiveTab] = useState<GoalPageTab>(
    defaultTab ?? GoalPageTab.HISTORY
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
      const newTab = value as GoalPageTab;
      setActiveTab(newTab);
      onTabChange?.(newTab);
    },
    [onTabChange]
  );

  // Use ref to keep stable reference of fetchGoalsHistory
  // This prevents hook recreation if parent doesn't memoize the function
  const fetchGoalsHistoryRef = useRef(fetchGoalsHistory);
  fetchGoalsHistoryRef.current = fetchGoalsHistory;

  // Create hook instance with stable fetch function wrapper
  const useGoalsHistory = useMemo(
    () =>
      createUseRecommendedLessonsHistory((filters) =>
        fetchGoalsHistoryRef.current(filters)
      ),
    []
  );

  // Use the hook
  const {
    goals,
    loading,
    error,
    pagination,
    fetchGoals,
  }: UseRecommendedLessonsHistoryReturn = useGoalsHistory();

  // Create filter and column configurations
  const initialFilterConfigs = useMemo(
    () => createGoalFiltersConfig(userFilterData),
    [userFilterData]
  );

  const tableColumns = useMemo(
    () => createTableColumns(mapSubjectNameToEnum, onDeleteGoal, onEditGoal),
    [mapSubjectNameToEnum, onDeleteGoal, onEditGoal]
  );

  /**
   * Handle table params change
   * Note: TableProvider calls this on mount with initial params,
   * so no separate useEffect for initial fetch is needed
   */
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      const filters = buildFiltersFromParams(params);
      fetchGoals(filters);
    },
    [fetchGoals]
  );

  return (
    <div
      data-testid="recommended-lessons-history"
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
            {title}
          </Text>

          {/* Tabs Menu */}
          <div className="flex-shrink-0 lg:w-auto self-center sm:self-auto">
            <Menu
              defaultValue={GoalPageTab.HISTORY}
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
                  value={GoalPageTab.HISTORY}
                  data-testid="menu-item-history"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Histórico
                </MenuItem>
                <MenuItem
                  variant="menu2"
                  value={GoalPageTab.DRAFTS}
                  data-testid="menu-item-drafts"
                  className="whitespace-nowrap flex-1 lg:flex-none"
                >
                  Rascunhos
                </MenuItem>
                <MenuItem
                  variant="menu2"
                  value={GoalPageTab.MODELS}
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
          {activeTab === GoalPageTab.HISTORY && (
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
                    data={goals}
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
                          buttonIcon={<Plus size={18} />}
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
                              iconLeft={<Plus size={18} weight="bold" />}
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

          {activeTab === GoalPageTab.DRAFTS && (
            <div className="flex items-center justify-center bg-background rounded-xl w-full min-h-[705px]">
              <Text size="lg" color="text-text-600">
                Rascunhos em desenvolvimento
              </Text>
            </div>
          )}

          {activeTab === GoalPageTab.MODELS &&
            fetchGoalModels &&
            deleteGoalModel &&
            onCreateModel && (
              <GoalModelsTab
                fetchGoalModels={fetchGoalModels}
                deleteGoalModel={deleteGoalModel}
                onCreateModel={onCreateModel}
                onSendLesson={onSendLesson}
                onEditModel={onEditModel}
                emptyStateImage={emptyStateImage}
                noSearchImage={noSearchImage}
                mapSubjectNameToEnum={mapSubjectNameToEnum}
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
