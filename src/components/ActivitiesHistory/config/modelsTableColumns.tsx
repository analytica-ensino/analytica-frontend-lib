import type { MouseEvent } from 'react';
import { Trash, PencilSimple, PaperPlaneTilt } from 'phosphor-react';
import Text from '../../Text/Text';
import Button from '../../Button/Button';
import IconButton from '../../IconButton/IconButton';
import { renderSubjectCell } from '../../../utils/renderSubjectCell';
import type { ColumnConfig } from '../../TableProvider/TableProvider';
import type { ActivityModelTableItem } from '../../../types/activitiesHistory';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Create table columns configuration for activity models
 * @param mapSubjectNameToEnum - Optional function to map subject names to enum values
 * @param onSendActivity - Callback when send activity button is clicked
 * @param onEditModel - Callback when edit button is clicked
 * @param onDeleteModel - Callback when delete button is clicked
 * @returns Array of column configurations for the models table
 */
export const createModelsTableColumns = (
  mapSubjectNameToEnum: ((name: string) => SubjectEnum | null) | undefined,
  onSendActivity: ((model: ActivityModelTableItem) => void) | undefined,
  onEditModel: ((model: ActivityModelTableItem) => void) | undefined,
  onDeleteModel: (model: ActivityModelTableItem) => void
): ColumnConfig<ActivityModelTableItem>[] => [
  {
    key: 'title',
    label: 'Título',
    sortable: true,
    className: 'max-w-[400px]',
    render: (value: unknown) => {
      const title = typeof value === 'string' ? value : '';
      return (
        <Text size="sm" title={title} className="truncate block">
          {title}
        </Text>
      );
    },
  },
  {
    key: 'savedAt',
    label: 'Salvo em',
    sortable: true,
    className: 'w-[120px]',
  },
  {
    key: 'subject',
    label: 'Matéria',
    sortable: true,
    className: 'max-w-[160px]',
    render: (value: unknown) => {
      const subjectName = typeof value === 'string' ? value : '';
      return renderSubjectCell(subjectName, mapSubjectNameToEnum, true);
    },
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    className: 'w-[220px]',
    render: (_value: unknown, row: ActivityModelTableItem) => {
      const handleSend = (e: MouseEvent) => {
        e.stopPropagation();
        onSendActivity?.(row);
      };

      const handleEdit = (e: MouseEvent) => {
        e.stopPropagation();
        onEditModel?.(row);
      };

      const handleDelete = (e: MouseEvent) => {
        e.stopPropagation();
        onDeleteModel(row);
      };

      return (
        <div className="flex items-center gap-2 justify-end">
          {onSendActivity && (
            <Button
              variant="outline"
              action="primary"
              size="small"
              iconLeft={<PaperPlaneTilt size={16} />}
              onClick={handleSend}
              aria-label="Enviar atividade"
            >
              Enviar atividade
            </Button>
          )}
          <IconButton
            icon={<Trash size={20} />}
            size="md"
            onClick={handleDelete}
            aria-label="Deletar modelo"
            className="text-text-600 hover:text-error-500 hover:bg-transparent"
          />
          {onEditModel && (
            <IconButton
              icon={<PencilSimple size={20} />}
              size="md"
              onClick={handleEdit}
              aria-label="Editar modelo"
              className="text-text-600 hover:text-primary-700 hover:bg-transparent"
            />
          )}
        </div>
      );
    },
  },
];
