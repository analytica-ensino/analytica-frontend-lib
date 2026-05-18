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
import type { ActivityTableItem } from '../../types/activitiesHistory';
import type { ExamTableItem } from '../../types/examsHistory';

/**
 * Filter option type
 */
interface FilterOption {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Creator type filter options (for managers only)
 */
const CREATOR_TYPE_OPTIONS: FilterOption[] = [
  { id: 'own', name: 'Minhas' },
  { id: 'teachers', name: 'Dos Professores' },
];

/**
 * Extract filter options from user data
 */
const extractFilterOptions = (
  userData: {
    userInstitutions?: Array<{
      school?: { id: string; name: string } | null;
      schoolYear?: { id: string; name: string } | null;
      class?: { id: string; name: string } | null;
    }>;
    subTeacherTopicClasses?: Array<{
      subject?: { id: string; name: string } | null;
      class?: { id: string; name: string } | null;
    }>;
  } | null
) => {
  const schoolsMap = new Map<string, string>();
  const schoolYearsMap = new Map<string, string>();
  const classesMap = new Map<string, string>();
  const subjectsMap = new Map<string, string>();

  if (userData?.userInstitutions) {
    for (const userInst of userData.userInstitutions) {
      if (userInst.school?.id && userInst.school?.name) {
        schoolsMap.set(userInst.school.id, userInst.school.name);
      }
      if (userInst.schoolYear?.id && userInst.schoolYear?.name) {
        schoolYearsMap.set(userInst.schoolYear.id, userInst.schoolYear.name);
      }
      if (userInst.class?.id && userInst.class?.name) {
        classesMap.set(userInst.class.id, userInst.class.name);
      }
    }
  }

  if (userData?.subTeacherTopicClasses) {
    for (const subTeacher of userData.subTeacherTopicClasses) {
      if (subTeacher.subject?.id && subTeacher.subject?.name) {
        subjectsMap.set(subTeacher.subject.id, subTeacher.subject.name);
      }
      if (subTeacher.class?.id && subTeacher.class?.name) {
        classesMap.set(subTeacher.class.id, subTeacher.class.name);
      }
    }
  }

  const toOptions = (map: Map<string, string>): FilterOption[] =>
    Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return {
    schools: toOptions(schoolsMap),
    schoolYears: toOptions(schoolYearsMap),
    classes: toOptions(classesMap),
    subjects: toOptions(subjectsMap),
  };
};

/**
 * Merge two filter option arrays, deduplicating by ID
 */
const mergeFilterOptions = (
  base: FilterOption[],
  extra: FilterOption[]
): FilterOption[] => {
  if (extra.length === 0) return base;
  const baseIds = new Set(base.map((item) => item.id));
  const hasNew = extra.some((item) => !baseIds.has(item.id));
  if (!hasNew) return base;
  const map = new Map(base.map((item) => [item.id, item.name] as const));
  extra.forEach((item) => {
    if (!map.has(item.id)) map.set(item.id, item.name);
  });
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
};

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
    () => extractFilterOptions(userData),
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
