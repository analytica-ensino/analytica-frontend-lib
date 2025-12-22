import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { Plus } from 'phosphor-react';
import Button from '../../Button/Button';
import EmptyState from '../../EmptyState/EmptyState';
import { TableProvider } from '../../TableProvider/TableProvider';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { createHistoryTableColumns } from '../config/historyTableColumns';
import { createHistoryFiltersConfig } from '../config/historyFiltersConfig';
import { buildHistoryFiltersFromParams } from '../utils/filterBuilders';
import {
  createUseActivitiesHistory,
  type UseActivitiesHistoryReturn,
} from '../../../hooks/useActivitiesHistory';
import type { TableParams } from '../../TableProvider/TableProvider';
import type {
  ActivityTableItem,
  ActivityHistoryFilters,
  ActivitiesHistoryApiResponse,
  ActivityUserFilterData,
} from '../../../types/activitiesHistory';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Props for the HistoryTab component
 */
export interface HistoryTabProps {
  /** Function to fetch activities history from API */
  fetchActivitiesHistory: (
    filters?: ActivityHistoryFilters
  ) => Promise<ActivitiesHistoryApiResponse>;
  /** Callback when create activity button is clicked */
  onCreateActivity: () => void;
  /** Callback when a history row is clicked */
  onRowClick: (row: ActivityTableItem) => void;
  /** Image for empty state */
  emptyStateImage?: string;
  /** Image for no search results */
  noSearchImage?: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
  /** User data for populating filter options */
  userFilterData?: ActivityUserFilterData;
}

/**
 * HistoryTab component
 * Independent component for displaying activities history with filters and pagination
 */
export const HistoryTab = ({
  fetchActivitiesHistory,
  onCreateActivity,
  onRowClick,
  emptyStateImage,
  noSearchImage,
  mapSubjectNameToEnum,
  userFilterData,
}: HistoryTabProps) => {
  // Use ref to keep stable reference to fetch function
  const fetchActivitiesHistoryRef = useRef(fetchActivitiesHistory);
  fetchActivitiesHistoryRef.current = fetchActivitiesHistory;

  // Create hook instance with stable fetch function wrapper
  const useActivitiesHistory = useMemo(
    () =>
      createUseActivitiesHistory((filters) =>
        fetchActivitiesHistoryRef.current(filters)
      ),
    []
  );

  // Use the hook
  const {
    activities,
    loading,
    error,
    pagination,
    fetchActivities,
  }: UseActivitiesHistoryReturn = useActivitiesHistory();

  // Create filter and column configurations
  const historyFilterConfigs = useMemo(
    () => createHistoryFiltersConfig(userFilterData),
    [userFilterData]
  );

  const historyTableColumns = useMemo(
    () => createHistoryTableColumns(mapSubjectNameToEnum),
    [mapSubjectNameToEnum]
  );

  /**
   * Handle table params change
   */
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      const filters = buildHistoryFiltersFromParams(params);
      fetchActivities(filters);
    },
    [fetchActivities]
  );

  // Error State
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="w-full">
      <TableProvider
        data={activities}
        headers={historyTableColumns}
        loading={loading}
        variant="borderless"
        enableSearch
        enableFilters
        enableTableSort
        enablePagination
        enableRowClick
        initialFilters={historyFilterConfigs}
        paginationConfig={{
          itemLabel: 'atividades',
          itemsPerPageOptions: [10, 20, 50, 100],
          defaultItemsPerPage: 10,
          totalItems: pagination.total,
          totalPages: pagination.totalPages,
        }}
        searchPlaceholder="Buscar atividade"
        noSearchResultState={{
          image: noSearchImage,
        }}
        emptyState={{
          component: (
            <EmptyState
              image={emptyStateImage}
              title="Incentive sua turma ao aprendizado"
              description="Crie uma nova atividade e ajude seus alunos a colocarem o conteúdo em prática!"
              buttonText="Criar atividade"
              buttonIcon={<Plus size={18} />}
              buttonVariant="outline"
              buttonAction="primary"
              onButtonClick={onCreateActivity}
            />
          ),
        }}
        onParamsChange={handleParamsChange}
        onRowClick={onRowClick}
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
                  onClick={onCreateActivity}
                  iconLeft={<Plus size={18} weight="bold" />}
                >
                  Criar atividade
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
  );
};

export default HistoryTab;
