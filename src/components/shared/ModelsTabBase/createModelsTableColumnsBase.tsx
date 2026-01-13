import type { MouseEvent } from 'react';
import { Trash, PencilSimple, PaperPlaneTilt } from 'phosphor-react';
import Text from '../../Text/Text';
import Button from '../../Button/Button';
import IconButton from '../../IconButton/IconButton';
import { renderSubjectCell } from '../../../utils/renderSubjectCell';
import type { ColumnConfig } from '../../TableProvider/TableProvider';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Base model item interface - all model types must extend this.
 * Includes index signature for TableProvider compatibility.
 */
export interface BaseModelItem {
  id: string;
  title: string;
  subject?: string | { id: string; subjectName: string; subjectIcon: string; subjectColor: string } | null;
  savedAt?: string;
  [key: string]: unknown;
}

/**
 * Configuration for model columns labels and accessibility
 */
export interface ModelsColumnsConfig {
  /** Send button label (e.g., "Enviar aula", "Enviar atividade") */
  sendButtonLabel: string;
  /** Send button aria-label */
  sendButtonAriaLabel: string;
  /** Delete button aria-label */
  deleteButtonAriaLabel: string;
  /** Edit button aria-label */
  editButtonAriaLabel: string;
}

/**
 * Creates base table columns configuration for models.
 * Can be used by both GoalModels and ActivityModels with type-safe generics.
 * @param mapSubjectNameToEnum - Optional function to map subject names to enum values
 * @param onSend - Callback when send button is clicked
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param config - Configuration for labels and accessibility
 * @returns Array of column configurations for the models table
 */
export const createModelsTableColumnsBase = <T extends BaseModelItem>(
  mapSubjectNameToEnum: ((name: string) => SubjectEnum | null) | undefined,
  onSend: ((model: T) => void) | undefined,
  onEdit: ((model: T) => void) | undefined,
  onDelete: (model: T) => void,
  config: ModelsColumnsConfig
): ColumnConfig<T>[] => [
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
    render: (_value: unknown, row: T) => {
      const handleSend = (e: MouseEvent) => {
        e.stopPropagation();
        onSend?.(row);
      };

      const handleEdit = (e: MouseEvent) => {
        e.stopPropagation();
        onEdit?.(row);
      };

      const handleDelete = (e: MouseEvent) => {
        e.stopPropagation();
        onDelete(row);
      };

      return (
        <div className="flex items-center gap-2 justify-end">
          {onSend && (
            <Button
              variant="outline"
              action="primary"
              size="small"
              iconLeft={<PaperPlaneTilt size={16} />}
              onClick={handleSend}
              aria-label={config.sendButtonAriaLabel}
            >
              {config.sendButtonLabel}
            </Button>
          )}
          <IconButton
            icon={<Trash size={20} />}
            size="md"
            onClick={handleDelete}
            aria-label={config.deleteButtonAriaLabel}
            className="text-text-600 hover:text-error-500 hover:bg-transparent"
          />
          {onEdit && (
            <IconButton
              icon={<PencilSimple size={20} />}
              size="md"
              onClick={handleEdit}
              aria-label={config.editButtonAriaLabel}
              className="text-text-600 hover:text-primary-700 hover:bg-transparent"
            />
          )}
        </div>
      );
    },
  },
];
