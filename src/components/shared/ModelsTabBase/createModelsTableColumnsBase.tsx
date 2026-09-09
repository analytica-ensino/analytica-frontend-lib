import type { MouseEvent } from 'react';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';
import { TruncatedText } from '../../TruncatedText/TruncatedText';
import Button from '../../Button/Button';
import IconButton from '../../IconButton/IconButton';
import { renderSubjectsCell } from '../../../utils/renderSubjectCell';
import type { ColumnConfig } from '../../TableProvider/TableProvider';
import type { SubjectData } from '../../../types/activitiesHistory';

/**
 * Base model item interface - all model types must extend this.
 * Includes index signature for TableProvider compatibility.
 */
export interface BaseModelItem {
  id: string;
  title: string;
  /**
   * Every subject the model covers. The union of loose shapes this used to
   * accept is gone: the backend now sends a uniform subject object with a
   * `color` and an `icon`, and the cell renders one icon per subject.
   */
  subjects?: SubjectData[];
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
 * Can be used by both RecommendedClassModels and ActivityModels with type-safe generics.
 * @param onSend - Callback when send button is clicked
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param config - Configuration for labels and accessibility
 * @returns Array of column configurations for the models table
 */
export const createModelsTableColumnsBase = <T extends BaseModelItem>(
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
      return <TruncatedText size="sm">{title}</TruncatedText>;
    },
  },
  {
    key: 'savedAt',
    label: 'Salvo em',
    sortable: true,
    className: 'w-[120px]',
  },
  {
    key: 'subjects',
    label: 'Componente curricular',
    // Ordenar por uma lista de matérias não significa nada.
    sortable: false,
    className: 'max-w-[200px]',
    render: renderSubjectsCell,
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
              iconLeft={<PaperPlaneTiltIcon size={16} />}
              onClick={handleSend}
              aria-label={config.sendButtonAriaLabel}
            >
              {config.sendButtonLabel}
            </Button>
          )}
          <IconButton
            icon={<TrashIcon size={20} />}
            size="md"
            onClick={handleDelete}
            aria-label={config.deleteButtonAriaLabel}
            className="text-text-600 hover:text-error-500 hover:bg-transparent"
          />
          {onEdit && (
            <IconButton
              icon={<PencilSimpleIcon size={20} />}
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
