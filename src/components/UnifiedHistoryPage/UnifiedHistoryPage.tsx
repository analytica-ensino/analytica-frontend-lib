import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'phosphor-react';
import { PAGE_CONFIG } from './config';
import type { UnifiedHistoryPageProps } from './types';
import EmptyState from '../EmptyState/EmptyState';
import TypeSelector from '../TypeSelector/TypeSelector';
import { createActivityCategoryConfig } from '../TypeSelector/TypeSelector.types';
import type { FilterConfig } from '../Filter';
import type { TableParams } from '../TableProvider/TableProvider';
import type {
  ActivityTableItem,
  ActivityFilterOption,
} from '../../types/activitiesHistory';
import type { ExamTableItem } from '../../types/examsHistory';
import {
  getSchoolOptionsFromUserData,
  getSchoolYearOptionsFromUserData,
  getClassOptionsFromUserData,
  getSubjectOptionsFromUserData,
  mergeFilterOptions,
} from '../../utils/filterHelpers';

/**
 * Creator type filter options (for managers only)
 */
const CREATOR_TYPE_OPTIONS: ActivityFilterOption[] = [
  { id: 'own', name: 'Minhas' },
  { id: 'teachers', name: 'Dos Professores' },
];

/**
 * Unified page component for Activities and Exams History
 * Encapsulates all common logic between activities and exams history pages
 */
export const UnifiedHistoryPage = ({
  activityCategory,
  data,
  loading,
  error,
  pagination,
  apiFilterOptions,
  onParamsChange,
  userData = null,
  activityImage,
  noSearchImage,
  includeCreatorFilter = false,
  routes,
}: UnifiedHistoryPageProps) => {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[activityCategory];
  const PageLayout = config.PageLayout;

  // Extract user filter options
  const userFilterOptions = useMemo(
    () => ({
      schools: getSchoolOptionsFromUserData(userData),
      schoolYears: getSchoolYearOptionsFromUserData(userData),
      classes: getClassOptionsFromUserData(userData),
      subjects: getSubjectOptionsFromUserData(userData),
    }),
    [userData]
  );

  /**
   * Build filter configuration merging userData and API-sourced options
   */
  const initialFilterConfigs = useMemo(
    (): FilterConfig[] => [
      // Add creator type filter only for managers
      ...(includeCreatorFilter
        ? [
            {
              key: 'creator',
              label: 'CRIADO POR',
              categories: [
                {
                  key: 'creatorType',
                  label: 'Criador',
                  selectedIds: [],
                  itens: CREATOR_TYPE_OPTIONS,
                },
              ],
            },
          ]
        : []),
      // Status filter
      {
        key: 'status',
        label: 'STATUS',
        categories: [
          {
            key: 'status',
            label: config.statusLabel,
            selectedIds: [],
            itens: config.statusOptions,
          },
        ],
      },
      // Academic data filters
      {
        key: 'academic',
        label: 'DADOS ACADÊMICOS',
        categories: [
          {
            key: 'school',
            label: 'Escola',
            selectedIds: [],
            itens: mergeFilterOptions(
              userFilterOptions.schools,
              apiFilterOptions.schools
            ),
          },
          {
            key: 'schoolYear',
            label: 'Ano',
            selectedIds: [],
            itens: mergeFilterOptions(
              userFilterOptions.schoolYears,
              apiFilterOptions.schoolYears
            ),
          },
          {
            key: 'class',
            label: 'Turma',
            selectedIds: [],
            itens: mergeFilterOptions(
              userFilterOptions.classes,
              apiFilterOptions.classes
            ),
          },
        ],
      },
      // Content filters
      {
        key: 'content',
        label: 'CONTEÚDO',
        categories: [
          {
            key: 'subject',
            label: 'Matéria',
            selectedIds: [],
            itens: mergeFilterOptions(
              userFilterOptions.subjects,
              apiFilterOptions.subjects
            ),
          },
        ],
      },
    ],
    [
      apiFilterOptions,
      config.statusOptions,
      config.statusLabel,
      includeCreatorFilter,
      userFilterOptions,
    ]
  );

  /**
   * Handle table params change
   */
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      onParamsChange(params);
    },
    [onParamsChange]
  );

  /**
   * TypeSelector config with proper labels, routes, and status options
   */
  const typeSelectorConfig = useMemo(
    () => createActivityCategoryConfig(routes),
    [routes]
  );

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback(
    (tab: string) => {
      const currentRoutes = routes[activityCategory];
      switch (tab) {
        case config.tabs.DRAFTS:
          navigate(`${currentRoutes.base}/rascunhos`);
          break;
        case config.tabs.MODELS:
          navigate(`${currentRoutes.base}/modelos`);
          break;
        default:
          navigate(currentRoutes.base);
      }
    },
    [navigate, config, routes, activityCategory]
  );

  /**
   * Handle create button click
   */
  const handleCreate = useCallback(() => {
    navigate(routes[activityCategory].create);
  }, [navigate, routes, activityCategory]);

  /**
   * Handle row click
   */
  const handleRowClick = useCallback(
    (row: ActivityTableItem | ExamTableItem) => {
      navigate(routes[activityCategory].details(row.id));
    },
    [navigate, routes, activityCategory]
  );

  // Build layout props dynamically
  const layoutProps = {
    activeTab: config.activeTab,
    pageTitle: config.pageTitle,
    headerRightContent: (
      <TypeSelector
        value={activityCategory}
        currentTab="history"
        config={typeSelectorConfig}
      />
    ),
    testId: config.testId,
    data: data || [],
    headers: config.tableColumns,
    loading,
    error,
    pagination,
    initialFilters: initialFilterConfigs,
    itemLabel: config.itemLabel,
    searchPlaceholder: config.searchPlaceholder,
    emptyState: activityImage ? (
      <EmptyState
        image={activityImage}
        title={config.emptyTitle}
        description={config.emptyDescription}
        buttonText={config.buttonText}
        buttonIcon={<Plus size={18} />}
        buttonVariant="outline"
        buttonAction="primary"
        onButtonClick={handleCreate}
      />
    ) : undefined,
    noSearchImage,
    onParamsChange: handleParamsChange,
    onRowClick: handleRowClick,
    onTabChange: handleTabChange,
    [config.onCreatePropName]: handleCreate,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PageLayout {...(layoutProps as any)} />;
};
