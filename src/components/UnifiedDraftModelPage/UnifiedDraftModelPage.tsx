import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'phosphor-react';
import { PAGE_CONFIG, getPageLayout } from './config';
import type { UnifiedDraftModelPageProps } from './types';
import EmptyState from '../EmptyState/EmptyState';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import TypeSelector from '../TypeSelector/TypeSelector';
import { createActivityCategoryConfig } from '../TypeSelector/TypeSelector.types';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import { useActivityDraftModelPage } from '../../hooks/useActivityDraftModelPage';

/**
 * Unified page component for Activity/Exam Drafts and Models
 * Delegates most logic to useActivityDraftModelPage hook
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

  // Use shared hook for state and handlers
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    itemToDeleteTitle,
    initialFilterConfigs,
    tableColumns,
    handleConfirmDelete: hookHandleConfirmDelete,
    handleParamsChange,
    handleCreateActivity,
    handleRowClick,
  } = useActivityDraftModelPage({
    activityCategory,
    fetchFn: onParamsChange,
    deleteFn: onDelete,
    userData,
    apiSubjectOptions,
    openSendModal: onSend || (() => {}),
    editUrlType: config.editUrlType,
    errorLogLabel: config.errorLogLabel,
    routes: routes[activityCategory],
  });

  // Wrap hook's handleConfirmDelete to close dialog on success
  const handleConfirmDelete = useCallback(async () => {
    await hookHandleConfirmDelete();
    // Hook's version calls deleteFn which may return false to keep dialog open
    // If we reach here without error, the delete was successful, so close dialog
    setIsDeleteDialogOpen(false);
  }, [hookHandleConfirmDelete, setIsDeleteDialogOpen]);

  /**
   * Handle tab change - navigate to the corresponding page
   * Component-specific: not provided by hook
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
      {/* Type assertion needed: PageLayout is conditionally ActivityPageLayout | ExamPageLayout.
          layoutProps uses computed property [config.onCreatePropName] which is either
          'onCreateActivity' or 'onCreateExam', satisfying both layouts at runtime.
          TypeScript cannot verify this dynamic key matches the expected prop name. */}
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
