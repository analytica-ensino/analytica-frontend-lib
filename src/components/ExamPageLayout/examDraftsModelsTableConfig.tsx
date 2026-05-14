import type { MouseEvent } from 'react';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import { renderTextCell } from '../../utils/renderTextCell';
import { renderSubjectCell } from '../../utils/renderSubjectCell';
import { mapSubjectNameToEnum } from '../../utils/subjectMappers';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import { PaperPlaneTilt, Trash, PencilSimple } from 'phosphor-react';
import type { ExamModelTableItem } from '../../types/examDrafts';

/**
 * Callbacks interface for table action buttons
 */
export interface ExamTableCallbacks {
  /** Callback when send exam button is clicked */
  onSend: (row: ExamModelTableItem) => void;
  /** Callback when delete button is clicked */
  onDelete: (row: ExamModelTableItem) => void;
  /** Callback when edit button is clicked */
  onEdit: (row: ExamModelTableItem) => void;
}

/**
 * Factory function to create column configuration for exam drafts and models tables
 * Returns columns with action buttons that use the provided callbacks
 * @param callbacks - Object containing onSend, onDelete, and onEdit handlers
 * @returns Column configuration array for TableProvider
 */
export const createExamDraftsModelsTableColumns = (
  callbacks: ExamTableCallbacks
): ColumnConfig<ExamModelTableItem>[] => [
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
    key: 'subject',
    label: 'Disciplina',
    sortable: true,
    className: 'max-w-[200px]',
    render: (value: unknown) =>
      renderSubjectCell(
        typeof value === 'string' ? value : '-',
        mapSubjectNameToEnum
      ),
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    className: 'w-[280px]',
    render: (_value: unknown, row: ExamModelTableItem) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          action="primary"
          size="small"
          iconLeft={<PaperPlaneTilt size={16} />}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onSend(row);
          }}
        >
          Enviar prova
        </Button>
        <IconButton
          icon={<Trash size={20} />}
          className="hover:text-error-500"
          aria-label="Deletar"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            callbacks.onDelete(row);
          }}
        />
        <IconButton
          icon={<PencilSimple size={20} />}
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
