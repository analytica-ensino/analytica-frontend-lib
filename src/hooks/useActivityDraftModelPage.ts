import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FilterConfig } from '../types/filters';
import type { ActivityModelTableItem } from '../types/activityDrafts';
import type { ColumnConfig } from '../types/table';
import type { ActivityCategory, TypeRoutes } from '../types/activities';
import { createExamDraftsModelsTableColumns } from '../components/ExamPageLayout/examDraftsModelsTableConfig';

/**
 * Filter option type
 */
interface FilterOption {
  id: string;
  name: string;
}

/**
 * User data type for filter options
 */
interface UserData {
  subTeacherTopicClasses?: Array<{
    subject?: { id: string; name: string };
  }>;
}

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
 * Extract subject options from user data
 */
const getSubjectOptions = (userData: UserData | null): FilterOption[] => {
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
 * Configuration options for the useActivityDraftModelPage hook
 */
export interface UseActivityDraftModelPageOptions {
  /** Activity category (ATIVIDADE or PROVA) */
  activityCategory: ActivityCategory;
  /** Function to fetch data with the given filters */
  fetchFn: (params: any) => Promise<void> | void;
  /** Function to delete an item by id */
  deleteFn: (id: string) => Promise<void> | Promise<boolean>;
  /** User data for filter options */
  userData: UserData | null;
  /** Subject options from API response */
  apiSubjectOptions: FilterOption[];
  /** Function to open the send activity modal */
  openSendModal: (row: ActivityModelTableItem) => void;
  /** URL type segment used in edit/row-click navigation */
  editUrlType: 'rascunho' | 'modelo';
  /** Label used in error log messages */
  errorLogLabel: string;
  /** Routes configuration */
  routes: TypeRoutes;
}

/**
 * Return value of the useActivityDraftModelPage hook
 */
export interface UseActivityDraftModelPageReturn {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  itemToDeleteTitle: string;
  initialFilterConfigs: FilterConfig[];
  tableColumns: ColumnConfig<ActivityModelTableItem>[];
  handleSend: (row: ActivityModelTableItem) => void;
  handleDelete: (row: ActivityModelTableItem) => void;
  handleEdit: (row: ActivityModelTableItem) => void;
  handleConfirmDelete: () => Promise<void>;
  handleParamsChange: (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => void;
  handleCreateActivity: () => void;
  handleRowClick: (row: ActivityModelTableItem) => void;
}

/**
 * Shared hook encapsulating common logic for Activity/Exam Drafts and Models pages.
 * Manages delete dialog state, send modal, table columns, filter config,
 * and all action/navigation callbacks.
 * @param options - Configuration options for the hook
 * @returns Shared state and callbacks for the page
 */
export const useActivityDraftModelPage = ({
  activityCategory,
  fetchFn,
  deleteFn,
  userData,
  apiSubjectOptions,
  openSendModal,
  editUrlType,
  errorLogLabel,
  routes,
}: UseActivityDraftModelPageOptions): UseActivityDraftModelPageReturn => {
  const navigate = useNavigate();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [itemToDeleteTitle, setItemToDeleteTitle] = useState<string>('');
  const [currentParams, setCurrentParams] = useState<any>({ page: 1, limit: 10 });

  /**
   * Initial filter configuration: merge userData subjects + subjects from API response
   */
  const initialFilterConfigs = useMemo(
    () =>
      createDraftsModelsFiltersConfig(
        mergeFilterOptions(getSubjectOptions(userData), apiSubjectOptions)
      ),
    [userData, apiSubjectOptions]
  );

  /**
   * Handle send activity button click
   * @param row - The row to send
   */
  const handleSend = useCallback(
    (row: ActivityModelTableItem) => {
      openSendModal(row);
    },
    [openSendModal]
  );

  /**
   * Handle delete button click — opens confirmation dialog
   * @param row - The row to delete
   */
  const handleDelete = useCallback((row: ActivityModelTableItem) => {
    setItemToDeleteId(row.id);
    setItemToDeleteTitle(row.title);
    setIsDeleteDialogOpen(true);
  }, []);

  /**
   * Handle edit button click — navigate to create activity with item pre-loaded
   * @param row - The row to edit
   */
  const handleEdit = useCallback(
    (row: ActivityModelTableItem) => {
      navigate(routes.editDraft?.(row.id) || routes.editModel?.(row.id) || `${routes.create}?type=${editUrlType}&id=${row.id}`);
    },
    [navigate, routes, editUrlType]
  );

  /**
   * Handle confirm delete action
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDeleteId) return;

    try {
      await deleteFn(itemToDeleteId);
      fetchFn(currentParams);
    } catch (err) {
      console.error(`Erro ao deletar ${errorLogLabel}:`, err);
    }
  }, [itemToDeleteId, deleteFn, fetchFn, currentParams, errorLogLabel]);

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
      const filters = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
      };
      setCurrentParams(filters);
      fetchFn(filters);
    },
    [fetchFn]
  );

  /**
   * Fetch initial data on component mount
   */
  useEffect(() => {
    fetchFn({ page: 1, limit: 10 });
  }, [fetchFn]);

  /**
   * Handle create activity button click
   */
  const handleCreateActivity = useCallback(() => {
    navigate(routes.create);
  }, [navigate, routes]);

  /**
   * Handle row click — navigate to edit item
   * @param row - The row clicked
   */
  const handleRowClick = useCallback(
    (row: ActivityModelTableItem) => {
      navigate(routes.editDraft?.(row.id) || routes.editModel?.(row.id) || `${routes.create}?type=${editUrlType}&id=${row.id}`);
    },
    [navigate, routes, editUrlType]
  );

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    itemToDeleteTitle,
    initialFilterConfigs,
    tableColumns,
    handleSend,
    handleDelete,
    handleEdit,
    handleConfirmDelete,
    handleParamsChange,
    handleCreateActivity,
    handleRowClick,
  };
};
