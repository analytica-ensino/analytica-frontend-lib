import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'phosphor-react';
import { PAGE_CONFIG, getPageLayout } from './config';
import type { UnifiedDraftModelPageProps } from './types';
import EmptyState from '../EmptyState/EmptyState';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import TypeSelector from '../TypeSelector/TypeSelector';
import { createActivityCategoryConfig } from '../TypeSelector/TypeSelector.types';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import { createExamDraftsModelsTableColumns } from '../ExamPageLayout/examDraftsModelsTableConfig';
import type { FilterConfig } from '../Filter';

/**
 * Filter option type
 */
interface FilterOption {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Extract subject options from user data
 */
const getSubjectOptions = (
  userData: {
    subTeacherTopicClasses?: Array<{
      subject?: { id: string; name: string } | null;
    }>;
  } | null
): FilterOption[] => {
  if (!userData?.subTeacherTopicClasses) {
    return [];
  }

  const subjectsMap = new Map<string, string>();

  for (const subTeacher of userData.subTeacherTopicClasses) {
    if (subTeacher.subject?.id && subTeacher.subject?.name) {
      subjectsMap.set(subTeacher.subject.id, subTeacher.subject.name);
    }
  }

  return Array.from(subjectsMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
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
 * Create filter configuration for drafts/models
 */
const createDraftsModelsFiltersConfig = (
  subjectOptions: FilterOption[]
): FilterConfig[] => [
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'subject',
        label: 'Matéria',
        selectedIds: [],
        itens: subjectOptions,
      },
    ],
  },
];

/**
 * Unified page component for Activity/Exam Drafts and Models
 * Encapsulates all common logic between drafts and models pages
 */
export const UnifiedDraftModelPage = ({
  type,
  activityCategory,
  data,
  loading,
  error,
  pagination,
  onDelete,
  onSend,
  onParamsChange,
  userData = null,
  activityImage,
  noSearchImage,
  routes,
}: UnifiedDraftModelPageProps) => {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[activityCategory][type];
  const PageLayout = getPageLayout(activityCategory);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [itemToDeleteTitle, setItemToDeleteTitle] = useState<string>('');

  /**
   * TypeSelector config with proper labels, routes, and status options
   */
  const typeSelectorConfig = useMemo(
    () => createActivityCategoryConfig(routes),
    [routes]
  );

  // Extract subject options from fetched data
  const apiSubjectOptions = useMemo(
    () =>
      data
        .filter(
          (item: ActivityModelTableItem) =>
            item.subjectId && item.subject?.name && item.subject.name !== '-'
        )
        .map((item: ActivityModelTableItem) => ({
          id: item.subjectId!,
          name: item.subject!.name,
        })),
    [data]
  );

  // Initial filter configuration: merge userData subjects + subjects from API response
  const initialFilterConfigs = useMemo(
    () =>
      createDraftsModelsFiltersConfig(
        mergeFilterOptions(getSubjectOptions(userData), apiSubjectOptions)
      ),
    [userData, apiSubjectOptions]
  );

  /**
   * Handle delete button click
   */
  const handleDelete = useCallback((row: ActivityModelTableItem) => {
    setItemToDeleteId(row.id);
    setItemToDeleteTitle(row.title);
    setIsDeleteDialogOpen(true);
  }, []);

  /**
   * Handle confirm delete action
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDeleteId) return;

    try {
      await onDelete(itemToDeleteId);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error(`Erro ao deletar ${config.errorLogLabel}:`, err);
    }
  }, [itemToDeleteId, onDelete, config.errorLogLabel]);

  /**
   * Handle edit button click
   */
  const handleEdit = useCallback(
    (row: ActivityModelTableItem) => {
      const currentRoutes = routes[activityCategory];
      const editRoute =
        type === 'drafts'
          ? currentRoutes.editDraft?.(row.id)
          : currentRoutes.editModel?.(row.id);
      navigate(
        editRoute ||
          `${currentRoutes.create}?type=${config.editUrlType}&id=${row.id}`
      );
    },
    [navigate, routes, type, config.editUrlType, activityCategory]
  );

  /**
   * Handle send button click
   */
  const handleSend = useCallback(
    (row: ActivityModelTableItem) => {
      onSend?.(row);
    },
    [onSend]
  );

  /**
   * Create table columns with action callbacks
   */
  const tableColumns = useMemo(
    () =>
      createExamDraftsModelsTableColumns({
        onSend: handleSend,
        onDelete: handleDelete,
        onEdit: handleEdit,
      }),
    [handleSend, handleDelete, handleEdit]
  );

  /**
   * Handle table params change
   */
  const handleParamsChange = useCallback(
    (params: { page?: number; limit?: number; search?: string }) => {
      onParamsChange(params);
    },
    [onParamsChange]
  );

  /**
   * Handle tab change - navigate to the corresponding page
   */
  const handleTabChange = useCallback(
    (tab: string) => {
      const currentRoutes = routes[activityCategory];
      switch (tab) {
        case 'historico': // ActivityTab.HISTORY / ExamTab.HISTORY
          navigate(currentRoutes.base);
          break;
        case 'rascunhos': // ActivityTab.DRAFTS / ExamTab.DRAFTS
          navigate(`${currentRoutes.base}/rascunhos`);
          break;
        case 'modelos': // ActivityTab.MODELS / ExamTab.MODELS
          navigate(`${currentRoutes.base}/modelos`);
          break;
        default:
          navigate(
            `${currentRoutes.base}/${type === 'drafts' ? 'rascunhos' : 'modelos'}`
          );
      }
    },
    [navigate, routes, type, activityCategory]
  );

  /**
   * Handle create activity button click
   */
  const handleCreateActivity = useCallback(() => {
    navigate(routes[activityCategory].create);
  }, [navigate, routes, activityCategory]);

  /**
   * Handle row click - navigate to edit item
   */
  const handleRowClick = useCallback(
    (row: ActivityModelTableItem) => {
      const currentRoutes = routes[activityCategory];
      const editRoute =
        type === 'drafts'
          ? currentRoutes.editDraft?.(row.id)
          : currentRoutes.editModel?.(row.id);
      navigate(
        editRoute ||
          `${currentRoutes.create}?type=${config.editUrlType}&id=${row.id}`
      );
    },
    [navigate, routes, type, config.editUrlType, activityCategory]
  );

  // Build layout props dynamically
  const layoutProps = {
    activeTab: config.activeTab,
    pageTitle: config.pageTitle,
    headerRightContent: (
      <TypeSelector
        value={activityCategory}
        currentTab={config.currentTab}
        config={typeSelectorConfig}
      />
    ),
    testId: config.testId,
    data,
    headers: tableColumns,
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
        onButtonClick={handleCreateActivity}
      />
    ) : undefined,
    noSearchImage,
    onParamsChange: handleParamsChange,
    onRowClick: handleRowClick,
    onTabChange: handleTabChange,
    [config.onCreatePropName]: handleCreateActivity,
  };

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PageLayout {...(layoutProps as any)} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onChangeOpen={setIsDeleteDialogOpen}
        title={config.dialogTitle}
        description={`Tem certeza que deseja excluir o ${config.errorLogLabel} "${itemToDeleteTitle}"? Esta ação não pode ser desfeita.`}
        cancelButtonLabel="Cancelar"
        submitButtonLabel="Excluir"
        onSubmit={handleConfirmDelete}
      />
    </>
  );
};
