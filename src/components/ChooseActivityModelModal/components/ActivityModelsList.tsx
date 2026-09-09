import { useMemo } from 'react';
import { TableProvider } from '../../../index';
import { createModelsTableColumnsBase } from '../../shared/ModelsTabBase/createModelsTableColumnsBase';
import type { ActivityModelTableItem } from '../../../types/activitiesHistory';
import type {
  TableParams,
  ColumnConfig,
} from '../../TableProvider/TableProvider';

interface ActivityModelsListProps {
  /** List of activity models to display */
  models: ActivityModelTableItem[];
  /** Loading state */
  loading: boolean;
  /** Callback when table params change (pagination, search, etc) */
  onParamsChange: (params: TableParams) => void;
  /** Callback when a row is clicked */
  onRowClick: (model: ActivityModelTableItem) => void;
}

/**
 * List of activity models displayed in a table
 * Used as content for the ChooseActivityModelModal
 */
export const ActivityModelsList = ({
  models,
  loading,
  onParamsChange,
  onRowClick,
}: ActivityModelsListProps) => {
  // Create table columns without actions column
  const tableColumns = useMemo<ColumnConfig<ActivityModelTableItem>[]>(() => {
    const baseColumns = createModelsTableColumnsBase<ActivityModelTableItem>(
      undefined, // No send button
      undefined, // No edit button
      () => {}, // No delete button
      {
        sendButtonLabel: '',
        sendButtonAriaLabel: '',
        deleteButtonAriaLabel: '',
        editButtonAriaLabel: '',
      }
    );

    // The base subject column already renders the backend's colour and icon,
    // so this list only has to drop the actions column.
    return baseColumns.filter((col) => col.key !== 'actions');
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <TableProvider
        data={models}
        headers={tableColumns}
        loading={loading}
        enableSearch
        enablePagination
        enableRowClick
        searchPlaceholder="Buscar modelo"
        onParamsChange={onParamsChange}
        onRowClick={onRowClick}
        rowKey="id"
      />
    </div>
  );
};

export type { ActivityModelsListProps };
