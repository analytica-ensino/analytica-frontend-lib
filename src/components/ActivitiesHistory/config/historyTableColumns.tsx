import { CaretRight } from 'phosphor-react';
import Text from '../../Text/Text';
import Badge from '../../Badge/Badge';
import ProgressBar from '../../ProgressBar/ProgressBar';
import { renderSubjectCell, renderTruncatedText } from '../utils';
import { getActivityStatusBadgeAction } from '../../../types/activitiesHistory';
import { GenericDisplayStatus } from '../../../types/common';
import type { ColumnConfig } from '../../TableProvider/TableProvider';
import type { ActivityTableItem } from '../../../types/activitiesHistory';
import type { SubjectEnum } from '../../../enums/SubjectEnum';

/**
 * Create table columns configuration for activities history
 * @param mapSubjectNameToEnum - Optional function to map subject names to enum values
 * @returns Array of column configurations for the history table
 */
export const createHistoryTableColumns = (
  mapSubjectNameToEnum: ((name: string) => SubjectEnum | null) | undefined
): ColumnConfig<ActivityTableItem>[] => [
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
    key: 'subject',
    label: 'Matéria',
    sortable: true,
    className: 'max-w-[140px]',
    render: (value: unknown) => {
      const subjectName = typeof value === 'string' ? value : '';
      return renderSubjectCell(subjectName, mapSubjectNameToEnum, false);
    },
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
          action={getActivityStatusBadgeAction(status as GenericDisplayStatus)}
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
        <CaretRight size={20} className="text-text-600" />
      </div>
    ),
  },
];
