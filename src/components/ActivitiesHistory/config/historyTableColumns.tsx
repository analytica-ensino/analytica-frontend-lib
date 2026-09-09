import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import Text from '../../Text/Text';
import Badge from '../../Badge/Badge';
import ProgressBar from '../../ProgressBar/ProgressBar';
import { renderTruncatedText } from '../utils';
import { renderSubjectsCell } from '../../../utils/renderSubjectCell';
import { getActivityStatusBadgeAction } from '../../../types/activitiesHistory';
import { GenericDisplayStatus } from '../../../types/common';
import type { ColumnConfig } from '../../TableProvider/TableProvider';
import type { ActivityTableItem } from '../../../types/activitiesHistory';

/**
 * Create table columns configuration for activities history
 * @returns Array of column configurations for the history table
 */
export const createHistoryTableColumns =
  (): ColumnConfig<ActivityTableItem>[] => [
    {
      key: 'startDate',
      label: 'Início',
      sortable: true,
    },
    {
      key: 'deadline',
      label: 'Prazo',
      sortable: true,
    },
    {
      key: 'creator',
      label: 'Autor',
      sortable: false,
      className: 'max-w-[150px] truncate',
      render: renderTruncatedText,
    },
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      className: 'max-w-[200px] truncate',
      render: renderTruncatedText,
    },
    {
      key: 'school',
      label: 'Escola',
      sortable: true,
      className: 'max-w-[150px] truncate',
      render: renderTruncatedText,
    },
    {
      key: 'year',
      label: 'Ano',
      sortable: true,
    },
    {
      key: 'subjects',
      label: 'Componente curricular',
      // Ordenar por uma lista de matérias não significa nada, e `sortBy` não
      // aceita este campo no backend.
      sortable: false,
      className: 'max-w-[200px]',
      render: renderSubjectsCell,
    },
    {
      key: 'class',
      label: 'Turma',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown) => {
        const status = typeof value === 'string' ? value : '';
        if (!status) {
          return (
            <Text size="sm" color="text-text-500">
              -
            </Text>
          );
        }
        return (
          <Badge
            variant="solid"
            action={getActivityStatusBadgeAction(
              status as GenericDisplayStatus
            )}
            size="small"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      key: 'completionPercentage',
      label: 'Conclusão',
      sortable: true,
      render: (value: unknown) => (
        <ProgressBar
          value={Number(value)}
          variant="blue"
          size="medium"
          layout="compact"
          showPercentage={true}
          compactWidth="w-[100px]"
        />
      ),
    },
    {
      key: 'navigation',
      label: '',
      sortable: false,
      className: 'w-12',
      render: () => (
        <div className="flex justify-center">
          <CaretRightIcon size={20} className="text-text-600" />
        </div>
      ),
    },
  ];
