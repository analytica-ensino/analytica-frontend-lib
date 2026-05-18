import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'phosphor-react';
import { PAGE_CONFIG, getPageLayout } from './config';
import type { UnifiedDraftModelPageProps } from './types';
import EmptyState from '../EmptyState/EmptyState';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import { SendActivityModal } from '../SendActivityModal';
import TypeSelector from '../TypeSelector/TypeSelector';
import { createUseActivityDrafts } from '../../hooks/useActivityDrafts';
import { createUseActivityModels } from '../../hooks/useActivityModels';
import { useSendActivity } from '../../hooks/useSendActivity';
import { useActivityDraftModelPage } from '../../hooks/useActivityDraftModelPage';
import type { ActivityModelTableItem } from '../../types/activityDrafts';

/**
 * Common hook return type for drafts and models
 */
interface DraftModelHookResult {
  drafts?: ActivityModelTableItem[];
  models?: ActivityModelTableItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fetchDrafts?: (params: any) => Promise<void> | void;
  fetchModels?: (params: any) => Promise<void> | void;
  deleteDraft?: (id: string) => Promise<void> | Promise<boolean>;
  deleteModel?: (id: string) => Promise<void> | Promise<boolean>;
}

/**
 * Filter option type
 */
interface FilterOption {
  id: string;
  name: string;
}

/**
 * Extract subject options from user data
 */
const getSubjectOptions = (userData: any): FilterOption[] => {
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
 * Unified page component for Activity/Exam Drafts and Models
 * Encapsulates all common logic between drafts and models pages
 */
export const UnifiedDraftModelPage = ({
  type,
  activityCategory,
  userData = null,
  activityImage,
  noSearchImage,
  routes,
}: UnifiedDraftModelPageProps) => {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[activityCategory][type];
  const PageLayout = getPageLayout(activityCategory);

  // Use the appropriate hook (drafts or models)
  const useDraftsHook = useActivityDrafts({ activityCategory });
  const useModelsHook = useActivityModels({ activityCategory });

  const draftsResult = useDraftsHook();
  const modelsResult = useModelsHook();

  const hookResult = (
    type === 'drafts' ? draftsResult : modelsResult
  ) as DraftModelHookResult;
  const data = hookResult[config.dataKey] as ActivityModelTableItem[];
  const fetchFn = hookResult[config.fetchKey] as (params: any) => Promise<void> | void;
  const deleteFn = hookResult[config.deleteKey] as (id: string) => Promise<void> | Promise<boolean>;
  const { loading, error, pagination } = hookResult;

  // Send activity modal hook
  const {
    isOpen: isSendModalOpen,
    openModal: openSendModal,
    closeModal: closeSendModal,
    initialData: sendActivityInitialData,
    categories: sendModalCategories,
    onCategoriesChange,
    isLoading: isSendLoading,
    isCategoriesLoading,
    handleSubmit: handleSendActivitySubmit,
  } = useSendActivity();

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

  // Use shared hook for common logic
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    itemToDeleteTitle,
    initialFilterConfigs,
    tableColumns,
    handleParamsChange,
    handleConfirmDelete,
    handleCreateActivity,
    handleRowClick,
  } = useActivityDraftModelPage({
    activityCategory,
    fetchFn,
    deleteFn,
    userData,
    apiSubjectOptions,
    openSendModal,
    editUrlType: config.editUrlType,
    errorLogLabel: config.errorLogLabel,
    routes,
  });

  /**
   * Handle tab change - navigate to the corresponding page
   */
  const handleTabChange = useCallback(
    (tab: string) => {
      switch (tab) {
        case 'historico': // ActivityTab.HISTORY / ExamTab.HISTORY
          navigate(routes.base);
          break;
        case 'rascunhos': // ActivityTab.DRAFTS / ExamTab.DRAFTS
          navigate(`${routes.base}/rascunhos`);
          break;
        case 'modelos': // ActivityTab.MODELS / ExamTab.MODELS
          navigate(`${routes.base}/modelos`);
          break;
        default:
          navigate(
            `${routes.base}/${type === 'drafts' ? 'rascunhos' : 'modelos'}`
          );
      }
    },
    [navigate, routes, type]
  );

  // Build layout props dynamically
  const layoutProps = {
    activeTab: config.activeTab,
    pageTitle: config.pageTitle,
    headerRightContent: (
      <TypeSelector
        value={activityCategory}
        currentTab={config.currentTab}
        config={{
          ATIVIDADE: routes,
          PROVA: routes,
        }}
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
      <PageLayout {...layoutProps} />

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

      {/* Send Activity Modal */}
      <SendActivityModal
        isOpen={isSendModalOpen}
        onClose={closeSendModal}
        onSubmit={handleSendActivitySubmit}
        categories={sendModalCategories}
        onCategoriesChange={onCategoriesChange}
        isLoading={isSendLoading || isCategoriesLoading}
        initialData={sendActivityInitialData}
        enableExamMode
      />
    </>
  );
};
