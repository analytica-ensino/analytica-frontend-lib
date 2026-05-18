import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'phosphor-react';
import { PAGE_CONFIG } from './config';
import type { UnifiedHistoryPageProps } from './types';
import EmptyState from '../EmptyState/EmptyState';
import TypeSelector from '../TypeSelector/TypeSelector';
import type { FilterConfig } from '../../types/filters';
import type { TableParams } from '../../types/table';
import type {
  ActivityHistoryFilters,
  ExamHistoryFilters,
  ActivityTableItem,
  ExamTableItem,
} from '../../types/activitiesHistory';
import { ActivityApiStatus } from '../../enums/activityStatus';
import { ExamStatus } from '../../enums/examStatus';
import { createUseActivitiesHistory } from '../../hooks/useActivitiesHistory';
import { createUseExamsHistory } from '../../hooks/useExamsHistory';

/**
 * Filter option type
 */
interface FilterOption {
  id: string;
  name: string;
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
const extractFilterOptions = (userData: any) => {
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

  // Use the appropriate history hook - call both unconditionally
  const useActivitiesHistoryHook = createUseActivitiesHistory();
  const useExamsHistoryHook = createUseExamsHistory();

  const activitiesResult = useActivitiesHistoryHook();
  const examsResult = useExamsHistoryHook();

  // Select the appropriate result based on activity category
  const historyData =
    activityCategory === 'ATIVIDADE' ? activitiesResult : examsResult;

  const {
    activities,
    exams,
    loading,
    error,
    pagination,
    fetchActivities,
    fetchExams,
    apiFilterOptions,
  } = historyData as {
    activities?: ActivityTableItem[];
    exams?: ExamTableItem[];
    loading: boolean;
    error: string | null;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    fetchActivities?: (filters: ActivityHistoryFilters) => void;
    fetchExams?: (filters: ExamHistoryFilters) => void;
    apiFilterOptions: {
      schools: Array<{ id: string; name: string }>;
      schoolYears: Array<{ id: string; name: string }>;
      classes: Array<{ id: string; name: string }>;
      subjects: Array<{ id: string; name: string }>;
    };
  };

  const data = activityCategory === 'ATIVIDADE' ? activities : exams;
  const fetchFn =
    activityCategory === 'ATIVIDADE' ? fetchActivities : fetchExams;

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
      userData,
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
      const filters: ActivityHistoryFilters | ExamHistoryFilters = {
        page: params.page,
        limit: params.limit,
      };

      if (params.search) {
        filters.search = params.search;
      }

      if (
        params.status &&
        Array.isArray(params.status) &&
        params.status.length > 0
      ) {
        filters.status = params.status[0] as ActivityApiStatus | ExamStatus;
      }

      if (
        params.school &&
        Array.isArray(params.school) &&
        params.school.length > 0
      ) {
        filters.schoolId = params.school[0];
      }

      if (
        params.subject &&
        Array.isArray(params.subject) &&
        params.subject.length > 0
      ) {
        filters.subjectId = params.subject[0];
      }

      if (
        params.class &&
        Array.isArray(params.class) &&
        params.class.length > 0
      ) {
        filters.classId = params.class[0];
      }

      if (
        includeCreatorFilter &&
        params.creatorType &&
        Array.isArray(params.creatorType) &&
        params.creatorType.length > 0
      ) {
        (filters as any).creatorType = params.creatorType[0];
      }

      fetchFn?.(filters as never);
    },
    [fetchFn, includeCreatorFilter]
  );

  /**
   * Fetch initial data on component mount
   */
  useEffect(() => {
    fetchFn?.({ page: 1, limit: 10 } as never);
  }, [fetchFn]);

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback(
    (tab: string) => {
      switch (tab) {
        case config.tabs.DRAFTS:
          navigate(`${routes.base}/rascunhos`);
          break;
        case config.tabs.MODELS:
          navigate(`${routes.base}/modelos`);
          break;
        default:
          navigate(routes.base);
      }
    },
    [navigate, config, routes]
  );

  /**
   * Handle create button click
   */
  const handleCreate = useCallback(() => {
    navigate(routes.create);
  }, [navigate, routes]);

  /**
   * Handle row click
   */
  const handleRowClick = useCallback(
    (row: ActivityTableItem | ExamTableItem) => {
      navigate(routes.details(row.id));
    },
    [navigate, routes]
  );

  // Build layout props dynamically
  const layoutProps = {
    activeTab: config.activeTab,
    pageTitle: config.pageTitle,
    headerRightContent: (
      <TypeSelector
        value={activityCategory}
        currentTab="history"
        config={{
          ATIVIDADE: routes,
          PROVA: routes,
        }}
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

  return <PageLayout {...layoutProps} />;
};
