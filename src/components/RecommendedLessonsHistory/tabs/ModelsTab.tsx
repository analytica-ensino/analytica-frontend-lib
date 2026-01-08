import type { ReactNode } from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Plus } from 'phosphor-react';
import Button from '../../Button/Button';
import EmptyState from '../../EmptyState/EmptyState';
import { TableProvider } from '../../TableProvider/TableProvider';
import { AlertDialog } from '../../AlertDialog/AlertDialog';
import Toaster, { useToast } from '../../Toast/utils/Toaster';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { createGoalModelsTableColumns } from '../config/modelsTableColumns';
import { createGoalModelsFiltersConfig } from '../config/modelsFiltersConfig';
import { buildGoalModelsFiltersFromParams } from '../utils/filterBuilders';
import {
  createUseGoalModels,
  type UseGoalModelsReturn,
} from '../../../hooks/useGoalModels';
import type { TableParams } from '../../TableProvider/TableProvider';
import type {
  GoalModelTableItem,
  GoalModelFilters,
  GoalModelsApiResponse,
  GoalUserFilterData,
} from '../../../types/recommendedLessons';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Props for the ModelsTab component
 */
export interface GoalModelsTabProps {
  /** Function to fetch goal models from API */
  fetchGoalModels: (
    filters?: GoalModelFilters
  ) => Promise<GoalModelsApiResponse>;
  /** Function to delete a goal model */
  deleteGoalModel: (id: string) => Promise<void>;
  /** Callback when create model button is clicked */
  onCreateModel: () => void;
  /** Callback when send lesson button is clicked on a model */
  onSendLesson?: (model: GoalModelTableItem) => void;
  /** Callback when edit model button is clicked */
  onEditModel?: (model: GoalModelTableItem) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: GoalUserFilterData;
  /**
   * Map of subject IDs to names for models display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches.
   */
  subjectsMap?: Map<string, string>;
}

/**
 * ModelsTab component
 * Independent component for displaying goal models with filters and pagination
 */
export const GoalModelsTab = ({
  fetchGoalModels,
  deleteGoalModel,
  onCreateModel,
  onSendLesson,
  onEditModel,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  subjectsMap,
}: GoalModelsTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<GoalModelTableItem | null>(
    null
  );

  // Toast hook
  const { addToast } = useToast();

  // Use refs to keep stable references
  const fetchGoalModelsRef = useRef(fetchGoalModels);
  fetchGoalModelsRef.current = fetchGoalModels;

  const deleteGoalModelRef = useRef(deleteGoalModel);
  deleteGoalModelRef.current = deleteGoalModel;

  // Keep stable reference to subjectsMap to avoid unnecessary re-fetches
  const subjectsMapRef = useRef(subjectsMap);
  subjectsMapRef.current = subjectsMap;

  // Create hook instance with stable fetch function wrappers
  const useGoalModels = useMemo(
    () =>
      createUseGoalModels(
        (filters) => fetchGoalModelsRef.current(filters),
        (id) => deleteGoalModelRef.current(id)
      ),
    []
  );

  // Use the hook
  const {
    models,
    loading: modelsLoading,
    error: modelsError,
    pagination: modelsPagination,
    fetchModels,
    deleteModel,
  }: UseGoalModelsReturn = useGoalModels();

  // Create filter configuration
  const modelsFilterConfigs = useMemo(
    () => createGoalModelsFiltersConfig(userFilterData),
    [userFilterData]
  );

  const handleDeleteClick = useCallback((model: GoalModelTableItem) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  }, []);

  const modelsTableColumns = useMemo(
    () =>
      createGoalModelsTableColumns(
        mapSubjectNameToEnum,
        onSendLesson,
        onEditModel,
        handleDeleteClick
      ),
    [mapSubjectNameToEnum, onSendLesson, onEditModel, handleDeleteClick]
  );

  /**
   * Handle table params change
   */
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      const filters = buildGoalModelsFiltersFromParams(params);
      fetchModels(filters, subjectsMapRef.current);
    },
    [fetchModels]
  );

  /**
   * Fetch models on mount
   */
  useEffect(() => {
    fetchModels({ page: 1, limit: 10 }, subjectsMapRef.current);
  }, [fetchModels]);

  /**
   * Handle confirm delete
   */
  const handleConfirmDelete = useCallback(async () => {
    if (modelToDelete) {
      const success = await deleteModel(modelToDelete.id);
      if (success) {
        addToast({ title: 'Modelo deletado com sucesso', action: 'success' });
        fetchModels({ page: 1, limit: 10 }, subjectsMapRef.current);
      } else {
        addToast({ title: 'Erro ao deletar modelo', action: 'warning' });
      }
    }
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  }, [modelToDelete, deleteModel, fetchModels, addToast]);

  /**
   * Handle cancel delete
   */
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  }, []);

  return (
    <>
      <Toaster />
      {modelsError ? (
        <ErrorDisplay error={modelsError} />
      ) : (
        <div className="w-full" data-testid="goal-models-tab">
          <TableProvider
            data={models}
            headers={modelsTableColumns}
            loading={modelsLoading}
            variant="borderless"
            enableSearch
            enableFilters
            enableTableSort
            enablePagination
            initialFilters={modelsFilterConfigs}
            paginationConfig={{
              itemLabel: 'modelos',
              itemsPerPageOptions: [10, 20, 50, 100],
              defaultItemsPerPage: 10,
              totalItems: modelsPagination.total,
              totalPages: modelsPagination.totalPages,
            }}
            searchPlaceholder="Buscar modelo"
            noSearchResultState={{
              image: noSearchImage,
            }}
            emptyState={{
              component: (
                <EmptyState
                  image={emptyStateImage}
                  title="Crie modelos para agilizar suas aulas"
                  description="Salve modelos de aulas recomendadas para reutilizar e enviar rapidamente para suas turmas!"
                  buttonText="Criar modelo"
                  buttonIcon={<Plus size={18} />}
                  buttonVariant="outline"
                  buttonAction="primary"
                  onButtonClick={onCreateModel}
                />
              ),
            }}
            onParamsChange={handleParamsChange}
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
                      onClick={onCreateModel}
                      iconLeft={<Plus size={18} weight="bold" />}
                    >
                      Criar modelo
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

      <AlertDialog
        isOpen={deleteDialogOpen}
        onChangeOpen={setDeleteDialogOpen}
        title="Deletar modelo"
        description={`Tem certeza que deseja deletar o modelo "${modelToDelete?.title}"? Esta ação não pode ser desfeita.`}
        submitButtonLabel="Deletar"
        cancelButtonLabel="Cancelar"
        onSubmit={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default GoalModelsTab;
