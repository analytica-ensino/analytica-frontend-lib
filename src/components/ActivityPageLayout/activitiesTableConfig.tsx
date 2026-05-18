import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import { renderTextCell } from '../../utils/renderTextCell';
import { renderSubjectCell } from '../../utils/renderSubjectCell';
import { mapSubjectNameToEnum } from '../../utils/subjectMappers';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import { CaretRight } from 'phosphor-react';
import type { ActivityTableItem } from '../../types/activitiesHistory';
import { ActivityDisplayStatus } from '../../types/activitiesHistory';

/**
 * Badge action type for activity status
 */
export enum ActivityBadgeActionType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

/**
 * Get badge action based on activity status
 *
 * @param status - Activity display status
 * @returns Badge action type
 */
export const getActivityStatusBadgeAction = (
  status: ActivityDisplayStatus
): ActivityBadgeActionType => {
  const actionMap: Record<ActivityDisplayStatus, ActivityBadgeActionType> = {
    [ActivityDisplayStatus.CONCLUIDA]: ActivityBadgeActionType.SUCCESS,
    [ActivityDisplayStatus.ATIVA]: ActivityBadgeActionType.WARNING,
    [ActivityDisplayStatus.VENCIDA]: ActivityBadgeActionType.ERROR,
  };
  return actionMap[status] || ActivityBadgeActionType.INFO;
};

/**
 * Column configuration for activities table
 *
 * Columns:
 * - startDate: Data de inicio
 * - deadline: Prazo
 * - creator: Autor
 * - title: Titulo
 * - school: Escola
 * - year: Ano
 * - subject: Materia
 * - class: Turma
 * - status: Status (Concluída, Ativa, Vencida)
 * - completionPercentage: Conclusao
 */
export const activitiesTableColumns: ColumnConfig<ActivityTableItem>[] = [
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
    render: renderTextCell,
  },
  {
    key: 'title',
    label: 'Título',
    sortable: true,
    className: 'max-w-[200px] truncate',
    render: renderTextCell,
  },
  {
    key: 'school',
    label: 'Escola',
    sortable: true,
    className: 'max-w-[150px] truncate',
    render: renderTextCell,
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
    render: (value: unknown) =>
      renderSubjectCell(
        typeof value === 'string' ? value : '-',
        mapSubjectNameToEnum
      ),
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
      return (
        <Badge
          variant="solid"
          action={getActivityStatusBadgeAction(value as ActivityDisplayStatus)}
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
