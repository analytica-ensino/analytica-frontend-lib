import type { MouseEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, PencilSimple } from 'phosphor-react';
import { PAGE_CONFIG } from './config';
import type { UnifiedHistoryPageProps } from './types';
import EmptyState from '../EmptyState/EmptyState';
import IconButton from '../IconButton/IconButton';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import { EditActivityModal } from './EditActivityModal';
import useToastStore from '../Toast/utils/ToastStore';
import TypeSelector from '../TypeSelector/TypeSelector';
import { createActivityCategoryConfig } from '../TypeSelector/TypeSelector.types';
import type { FilterConfig } from '../Filter';
import type { TableParams, ColumnConfig } from '../TableProvider/TableProvider';
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
  currentUserId,
  apiClient,
}: UnifiedHistoryPageProps) => {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[activityCategory];
  const PageLayout = config.PageLayout;
  const addToast = useToastStore((state) => state.addToast);

  /**
   * Whether the owner-only delete action is enabled. Requires an api client and
   * the logged user id, and only applies to activities (not exams).
   */
  const deleteEnabled =
    activityCategory === 'ATIVIDADE' && !!apiClient && !!currentUserId;

  /** Activity currently pending deletion confirmation (drives the AlertDialog) */
  const [activityToDelete, setActivityToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  /** Activity currently being edited (drives the EditActivityModal) */
  const [activityToEdit, setActivityToEdit] = useState<{ id: string } | null>(
    null
  );

  /** Last table params received, used to reload the list after a mutation */
  const lastParamsRef = useRef<TableParams | null>(null);

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
      lastParamsRef.current = params;
      onParamsChange(params);
    },
    [onParamsChange]
  );

  /**
   * Confirm deletion of the selected activity: calls DELETE /activities/:id,
   * reloads the list with the current params and shows a feedback toast.
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!activityToDelete || !apiClient) {
      return;
    }

    try {
      await apiClient.delete(`/activities/${activityToDelete.id}`);
      setActivityToDelete(null);
      if (lastParamsRef.current) {
        onParamsChange(lastParamsRef.current);
      }
      addToast({
        title: 'Atividade excluída com sucesso',
        action: 'success',
      });
    } catch {
      setActivityToDelete(null);
      addToast({ title: 'Erro ao excluir atividade', action: 'warning' });
    }
  }, [activityToDelete, apiClient, onParamsChange, addToast]);

  /**
   * Table headers, optionally augmented with an owner-only delete action column
   * inserted right before the navigation (caret) column.
   */
  const headers = useMemo(() => {
    if (!deleteEnabled) {
      return config.tableColumns;
    }

    const actionsColumn: ColumnConfig<ActivityTableItem> = {
      key: 'actions',
      label: '',
      sortable: false,
      className: 'w-24',
      render: (_value, row) => {
        if (!row.creatorId || row.creatorId !== currentUserId) {
          return null;
        }
        return (
          <div className="flex items-center justify-end gap-2">
            <IconButton
              icon={<Trash size={20} />}
              size="sm"
              title="Excluir"
              className="hover:text-error-500"
              aria-label="Excluir"
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                setActivityToDelete({ id: row.id, title: row.title });
              }}
            />
            <IconButton
              icon={<PencilSimple size={20} />}
              size="sm"
              title="Editar"
              className="hover:text-primary-700"
              aria-label="Editar"
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                setActivityToEdit({ id: row.id });
              }}
            />
          </div>
        );
      },
    };

    const baseColumns = [
      ...(config.tableColumns as ColumnConfig<ActivityTableItem>[]),
    ];
    const navIndex = baseColumns.findIndex((c) => c.key === 'navigation');
    if (navIndex === -1) {
      baseColumns.push(actionsColumn);
    } else {
      baseColumns.splice(navIndex, 0, actionsColumn);
    }
    return baseColumns;
  }, [
    config.tableColumns,
    deleteEnabled,
    currentUserId,
    navigate,
    routes,
    activityCategory,
  ]);

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
    headers,
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

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PageLayout {...(layoutProps as any)} />
      {deleteEnabled && (
        <AlertDialog
          isOpen={!!activityToDelete}
          onChangeOpen={(open) => {
            if (!open) {
              setActivityToDelete(null);
            }
          }}
          title="Excluir atividade"
          description={`Tem certeza que deseja excluir a atividade "${
            activityToDelete?.title ?? ''
          }"? Esta ação não pode ser desfeita.`}
          submitButtonLabel="Excluir"
          cancelButtonLabel="Cancelar"
          submitAction="negative"
          onSubmit={handleConfirmDelete}
          onCancel={() => setActivityToDelete(null)}
        />
      )}
      {deleteEnabled && (
        <EditActivityModal
          isOpen={!!activityToEdit}
          activityId={activityToEdit?.id}
          apiClient={apiClient}
          onClose={() => setActivityToEdit(null)}
          onSaved={() => {
            setActivityToEdit(null);
            if (lastParamsRef.current) {
              onParamsChange(lastParamsRef.current);
            }
          }}
        />
      )}
    </>
  );
};
