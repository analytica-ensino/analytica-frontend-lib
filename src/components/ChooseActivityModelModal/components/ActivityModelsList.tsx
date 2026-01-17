import { useMemo } from 'react';
import { TableProvider, IconRender, Text } from '../../../index';
import { createModelsTableColumnsBase } from '../../shared/ModelsTabBase/createModelsTableColumnsBase';
import type {
  ActivityModelTableItem,
  SubjectData,
} from '../../../types/activitiesHistory';
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
      undefined, // No subject mapping needed
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

    // Replace subject column to handle SubjectData object
    const columnsWithoutSubject = baseColumns.filter(
      (col) => col.key !== 'actions' && col.key !== 'subject'
    );

    return columnsWithoutSubject.concat([
      {
        key: 'subject',
        label: 'Matéria',
        sortable: true,
        className: 'max-w-[160px]',
        render: (value: unknown) => {
          const subject = value as SubjectData | null;
          if (!subject) {
            return (
              <Text size="sm" color="text-text-400">
                -
              </Text>
            );
          }

          return (
            <div
              className="flex items-center gap-2"
              title={subject.name}
            >
              <span
                className="w-[21px] h-[21px] flex items-center justify-center rounded-sm text-text-950 shrink-0"
                style={{ backgroundColor: subject.color }}
              >
                <IconRender
                  iconName={subject.icon}
                  size={17}
                  color="currentColor"
                />
              </span>
              <Text size="sm" className="truncate">
                {subject.name}
              </Text>
            </div>
          );
        },
      },
    ]);
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
