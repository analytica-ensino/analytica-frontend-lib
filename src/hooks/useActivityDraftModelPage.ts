import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FilterConfig } from '../components/Filter';
import type {
  ActivityModelTableItem,
  ActivityFilterOption,
} from '../types/activitiesHistory';
import type { ColumnConfig } from '../components/TableProvider/TableProvider';
import type {
  ExtendedActivityCategory,
  TypeRoutes,
} from '../components/TypeSelector/TypeSelector.types';
import { createExamDraftsModelsTableColumns } from '../components/ExamPageLayout/examDraftsModelsTableConfig';
import {
  getSubjectOptionsFromUserData,
  mergeFilterOptions,
  type UserFilterSourceData,
} from '../utils/filterHelpers';
import { createDraftsModelsFiltersConfig } from '../utils/draftModelFilterHelpers';

/**
 * Params emitted by the table when search, pagination or filters change.
 * The Filter component emits each active filter under its category key
 * (`subject`) as the list of selected ids, so the subject arrives as
 * `subject: string[]` and is normalized to `subjectId` before fetching.
 */
export interface DraftModelTableParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Selected subject ids coming from the Filter component */
  subject?: string[];
  /** Subject id already resolved (direct callers) */
  subjectId?: string;
}

/**
 * Extract the subject id the API expects from the table params.
 * @param params - Params emitted by the table
 * @returns The selected subject id, or undefined when no subject is selected
 */
const getSubjectIdFromParams = (
  params: DraftModelTableParams
): string | undefined => {
  if (Array.isArray(params.subject) && params.subject.length > 0) {
    return params.subject[0];
  }
  return params.subjectId;
};

/**
 * Configuration options for the useActivityDraftModelPage hook
 */
export interface UseActivityDraftModelPageOptions {
  /** Activity category (ATIVIDADE, PROVA or PRESENCIAL) */
  activityCategory: ExtendedActivityCategory;
  /** Function to fetch data with the given filters */
  fetchFn: (params: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
  }) => Promise<void> | void;
  /** Function to delete an item by id */
  deleteFn: (id: string) => Promise<void> | Promise<boolean>;
  /** User data for filter options */
  userData: UserFilterSourceData | null;
  /** Subject options from API response */
  apiSubjectOptions: ActivityFilterOption[];
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
  handleConfirmDelete: () => Promise<boolean>;
  handleParamsChange: (params: DraftModelTableParams) => void;
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
  const [currentParams, setCurrentParams] = useState<{
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
  }>({
    page: 1,
    limit: 10,
  });

  /**
   * Initial filter configuration: merge userData subjects + subjects from API response
   */
  const initialFilterConfigs = useMemo(
    () =>
      createDraftsModelsFiltersConfig(
        mergeFilterOptions(
          getSubjectOptionsFromUserData(userData),
          apiSubjectOptions
        )
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
      navigate(
        routes.editDraft?.(row.id) ||
          routes.editModel?.(row.id) ||
          `${routes.create}?type=${editUrlType}&id=${row.id}`
      );
    },
    [navigate, routes, editUrlType]
  );

  /**
   * Handle confirm delete action
   * @returns true if delete was successful, false otherwise
   */
  const handleConfirmDelete = useCallback(async (): Promise<boolean> => {
    if (!itemToDeleteId) return false;

    try {
      await deleteFn(itemToDeleteId);
      await fetchFn(currentParams);
      return true;
    } catch (err) {
      console.error(`Erro ao deletar ${errorLogLabel}:`, err);
      return false;
    }
  }, [itemToDeleteId, deleteFn, fetchFn, currentParams, errorLogLabel]);

  /**
   * Create table columns with action callbacks.
   * The send button label follows the category: "Enviar prova" for exams,
   * "Enviar atividade" for activities.
   */
  const sendLabel =
    activityCategory === 'PROVA' ? 'Enviar prova' : 'Enviar atividade';
  const tableColumns = useMemo(
    () =>
      createExamDraftsModelsTableColumns(
        {
          onSend: handleSend,
          onDelete: handleDelete,
          onEdit: handleEdit,
        },
        sendLabel
      ),
    [handleSend, handleDelete, handleEdit, sendLabel]
  );

  /**
   * Handle table params change
   */
  const handleParamsChange = useCallback(
    (params: DraftModelTableParams) => {
      const filters = {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search,
        subjectId: getSubjectIdFromParams(params),
      };
      setCurrentParams(filters);
      fetchFn(filters);
    },
    [fetchFn]
  );

  // No fetch-on-mount here: the table emits its initial params as soon as it
  // mounts, and they reach fetchFn through handleParamsChange. Fetching here
  // too would double every page's first request — and, because it hardcodes
  // `limit: 10`, would undo the user's items-per-page choice whenever fetchFn
  // changed identity.

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
      navigate(
        routes.editDraft?.(row.id) ||
          routes.editModel?.(row.id) ||
          `${routes.create}?type=${editUrlType}&id=${row.id}`
      );
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
