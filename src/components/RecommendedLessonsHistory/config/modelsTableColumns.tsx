import type { MouseEvent } from 'react';
import { Trash, PencilSimple, PaperPlaneTilt } from 'phosphor-react';
import Text from '../../Text/Text';
import Button from '../../Button/Button';
import IconButton from '../../IconButton/IconButton';
import { getSubjectInfo } from '../../SubjectInfo/SubjectInfo';
import { cn } from '../../../utils/utils';
import type { ColumnConfig } from '../../TableProvider/TableProvider';
import type { GoalModelTableItem } from '../../../types/recommendedLessons';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Create table columns configuration for goal models
 * @param mapSubjectNameToEnum - Optional function to map subject names to enum values
 * @param onSendLesson - Callback when send lesson button is clicked
 * @param onEditModel - Callback when edit button is clicked
 * @param onDeleteModel - Callback when delete button is clicked
 * @returns Array of column configurations for the models table
 */
export const createGoalModelsTableColumns = (
  mapSubjectNameToEnum: ((name: string) => SubjectEnum | null) | undefined,
  onSendLesson: ((model: GoalModelTableItem) => void) | undefined,
  onEditModel: ((model: GoalModelTableItem) => void) | undefined,
  onDeleteModel: (model: GoalModelTableItem) => void
): ColumnConfig<GoalModelTableItem>[] => [
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
      if (!subjectName) {
        return (
          <Text size="sm" color="text-text-500">
            -
          </Text>
        );
      }

      const subjectEnum = mapSubjectNameToEnum?.(subjectName);
      if (!subjectEnum) {
        return (
          <Text size="sm" className="truncate" title={subjectName}>
            {subjectName}
          </Text>
        );
      }

      const subjectInfo = getSubjectInfo(subjectEnum);
      return (
        <div className="flex items-center gap-2" title={subjectName}>
          <span
            className={cn(
              'w-[21px] h-[21px] flex items-center justify-center rounded-sm text-text-950 shrink-0',
              subjectInfo.colorClass
            )}
          >
            {subjectInfo.icon}
          </span>
          <Text size="sm" className="truncate">
            {subjectName}
          </Text>
        </div>
      );
    },
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    className: 'w-[220px]',
    render: (_value: unknown, row: GoalModelTableItem) => {
      const handleSend = (e: MouseEvent) => {
        e.stopPropagation();
        onSendLesson?.(row);
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
          {onSendLesson && (
            <Button
              variant="outline"
              action="primary"
              size="small"
              iconLeft={<PaperPlaneTilt size={16} />}
              onClick={handleSend}
              aria-label="Enviar aula"
            >
              Enviar aula
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
