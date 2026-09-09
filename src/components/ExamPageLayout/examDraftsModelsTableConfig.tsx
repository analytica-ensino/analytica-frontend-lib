import type { MouseEvent } from 'react';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import { renderTextCell } from '../../utils/renderTextCell';
import { renderSubjectsCell } from '../../utils/renderSubjectCell';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';

/**
 * Callbacks interface for table action buttons
 */
export interface ExamTableCallbacks {
  /** Callback when send exam button is clicked */
  onSend: (row: ActivityModelTableItem) => void;
  /** Callback when delete button is clicked */
  onDelete: (row: ActivityModelTableItem) => void;
  /** Callback when edit button is clicked */
  onEdit: (row: ActivityModelTableItem) => void;
}

/**
 * Factory function to create column configuration for drafts and models tables
 * (used by both exam and activity pages).
 * Returns columns with action buttons that use the provided callbacks
 * @param callbacks - Object containing onSend, onDelete, and onEdit handlers
 * @param sendLabel - Label for the send button (e.g. "Enviar prova" / "Enviar atividade")
 * @returns Column configuration array for TableProvider
 */
export const createExamDraftsModelsTableColumns = (
  callbacks: ExamTableCallbacks,
  sendLabel = 'Enviar prova'
): ColumnConfig<ActivityModelTableItem>[] => [
  {
    key: 'title',
    label: 'Título',
    sortable: true,
    className: 'max-w-[300px] truncate',
    render: renderTextCell,
  },
  {
    key: 'savedAt',
    label: 'Salvo em',
    sortable: true,
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
    className: 'w-[280px]',
    render: (_value: unknown, row: ActivityModelTableItem) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          action="primary"
          size="small"
          iconLeft={<PaperPlaneTiltIcon size={16} />}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onSend(row);
          }}
        >
          {sendLabel}
        </Button>
        <IconButton
          icon={<TrashIcon size={20} />}
          className="hover:text-error-500"
          aria-label="Deletar"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onDelete(row);
          }}
        />
        <IconButton
          icon={<PencilSimpleIcon size={20} />}
          className="hover:text-primary-700"
          aria-label="Editar"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onEdit(row);
          }}
        />
      </div>
    ),
  },
];
