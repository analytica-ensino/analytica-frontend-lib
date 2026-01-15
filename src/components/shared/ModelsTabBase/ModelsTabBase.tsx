import type { ReactNode } from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Plus } from 'phosphor-react';
import Button from '../../Button/Button';
import EmptyState from '../../EmptyState/EmptyState';
import { TableProvider } from '../../TableProvider/TableProvider';
import { AlertDialog } from '../../AlertDialog/AlertDialog';
import Toaster, { useToast } from '../../Toast/utils/Toaster';
import { ErrorDisplay } from '../../ActivitiesHistory/components/ErrorDisplay';
import type {
  TableParams,
  ColumnConfig,
} from '../../TableProvider/TableProvider';
import type { FilterConfig } from '../../Filter';
import type { SubjectEnum } from '../../../enums/SubjectEnum';
import type { BaseModelItem } from './createModelsTableColumnsBase';

/**
 * Configuration for entity-specific text and labels
 */
export interface ModelsTabConfig {
  /** Entity name for messages (e.g., "aula", "atividade") */
  entityName: string;
  /** Plural entity name (e.g., "aulas", "atividades") */
  entityNamePlural: string;
  /** data-testid attribute */
  testId: string;
  /** Empty state title */
  emptyStateTitle: string;
  /** Empty state description */
  emptyStateDescription: string;
  /** Search placeholder */
  searchPlaceholder: string;
}

/**
 * Return type for the models hook
 */
export interface UseModelsReturn<T> {
  models: T[];
  loading: boolean;
  error: string | null;
  pagination: { total: number; totalPages: number };
  fetchModels: (
    filters: Record<string, unknown>,
    subjectsMap?: Map<string, string>
  ) => void;
  deleteModel: (id: string) => Promise<boolean>;
}

/**
 * Props for ModelsTabBase component
 */
export interface ModelsTabBaseProps<
  T extends BaseModelItem,
  TFilters,
  TResponse,
  TUserFilterData,
> {
  /** Function to fetch models from API */
  fetchModels: (filters?: TFilters) => Promise<TResponse>;
  /** Function to delete a model */
  deleteModel: (id: string) => Promise<void>;
  /** Callback when create model button is clicked */
  onCreateModel: () => void;
  /** Callback when send button is clicked on a model */
  onSend?: (model: T) => void;
  /** Callback when edit model button is clicked */
  onEditModel?: (model: T) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: TUserFilterData;
  /**
   * Map of subject IDs to names for models display.
   * IMPORTANT: This Map should be memoized with useMemo in the parent component
   * to avoid unnecessary re-fetches.
   */
  subjectsMap?: Map<string, string>;
  /** Configuration for entity-specific text */
  config: ModelsTabConfig;
  /** Function to create table columns */
  createTableColumns: (
    mapSubjectNameToEnum: ((name: string) => SubjectEnum | null) | undefined,
    onSend: ((model: T) => void) | undefined,
    onEdit: ((model: T) => void) | undefined,
    onDelete: (model: T) => void
  ) => ColumnConfig<T>[];
  /** Function to create filter configs */
  createFiltersConfig: (userFilterData?: TUserFilterData) => FilterConfig[];
  /** Function to build filters from table params */
  buildFiltersFromParams: (params: TableParams) => TFilters;
  /** Hook creator function */
  createUseModels: (
    fetchFn: (filters?: TFilters) => Promise<TResponse>,
    deleteFn: (id: string) => Promise<void>
  ) => () => UseModelsReturn<T>;
}

/**
 * Generic ModelsTab base component that can be used by both
 * RecommendedClassModels (Lessons) and ActivityModels with type-safe generics.
 */
export const ModelsTabBase = <
  T extends BaseModelItem,
  TFilters,
  TResponse,
  TUserFilterData,
>({
  fetchModels: fetchModelsProp,
  deleteModel: deleteModelProp,
  onCreateModel,
  onSend,
  onEditModel,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
  subjectsMap,
  config,
  createTableColumns,
  createFiltersConfig,
  buildFiltersFromParams,
  createUseModels,
}: ModelsTabBaseProps<T, TFilters, TResponse, TUserFilterData>) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<T | null>(null);

  // Toast hook
  const { addToast } = useToast();

  // Use refs to keep stable references
  const fetchModelsRef = useRef(fetchModelsProp);
  fetchModelsRef.current = fetchModelsProp;

  const deleteModelRef = useRef(deleteModelProp);
  deleteModelRef.current = deleteModelProp;

  // Keep stable reference to subjectsMap to avoid unnecessary re-fetches
  const subjectsMapRef = useRef(subjectsMap);
  subjectsMapRef.current = subjectsMap;

  // Create hook instance with stable fetch function wrappers
  const useModels = useMemo(
    () =>
      createUseModels(
        (filters) => fetchModelsRef.current(filters),
        (id) => deleteModelRef.current(id)
      ),
    [createUseModels]
  );

  // Use the hook
  const {
    models,
    loading: modelsLoading,
    error: modelsError,
    pagination: modelsPagination,
    fetchModels,
    deleteModel,
  }: UseModelsReturn<T> = useModels();

  // Create filter configuration
  const modelsFilterConfigs = useMemo(
    () => createFiltersConfig(userFilterData),
    [createFiltersConfig, userFilterData]
  );

  const handleDeleteClick = useCallback((model: T) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  }, []);

  const modelsTableColumns = useMemo(
    () =>
      createTableColumns(
        mapSubjectNameToEnum,
        onSend,
        onEditModel,
        handleDeleteClick
      ),
    [
      createTableColumns,
      mapSubjectNameToEnum,
      onSend,
      onEditModel,
      handleDeleteClick,
    ]
  );

  /**
   * Handle table params change
   */
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      const filters = buildFiltersFromParams(params);
      fetchModels(filters as Record<string, unknown>, subjectsMapRef.current);
    },
    [buildFiltersFromParams, fetchModels]
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
        <div className="w-full" data-testid={config.testId}>
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
            searchPlaceholder={config.searchPlaceholder}
            noSearchResultState={{
              image: noSearchImage,
            }}
            emptyState={{
              component: (
                <EmptyState
                  image={emptyStateImage}
                  title={config.emptyStateTitle}
                  description={config.emptyStateDescription}
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

export default ModelsTabBase;
