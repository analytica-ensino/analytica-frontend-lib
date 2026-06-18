import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import { renderTextCell } from '../../utils/renderTextCell';
import { renderSubjectCell } from '../../utils/renderSubjectCell';
import { mapSubjectNameToEnum } from '../../utils/subjectMappers';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import type { ActivityTableItem } from '../../types/activitiesHistory';
import {
  ActivityDisplayStatus,
  ActivityBadgeActionType,
} from '../../types/activitiesHistory';

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
    key: 'title',
    label: 'Título',
    sortable: true,
    className: 'max-w-[200px]',
    render: renderTextCell,
  },
  {
    key: 'school',
    label: 'Escola',
    sortable: true,
    className: 'max-w-[150px]',
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
    className: 'max-w-[120px]',
    render: renderTextCell,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: unknown) => {
      const status = typeof value === 'string' ? value : '';
      // Validate status is a valid ActivityDisplayStatus enum value
      const validStatuses = Object.values(ActivityDisplayStatus);
      const validatedStatus = validStatuses.includes(
        value as ActivityDisplayStatus
      )
        ? (value as ActivityDisplayStatus)
        : ActivityDisplayStatus.ATIVA; // Default fallback

      return (
        <Badge
          variant="solid"
          action={getActivityStatusBadgeAction(validatedStatus)}
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
    render: (value: unknown) => {
      // Sanitize value: coerce to number, default to 0 if NaN, clamp to 0-100 range
      const numericValue = Number(value);
      const sanitizedValue = Number.isNaN(numericValue)
        ? 0
        : Math.max(0, Math.min(100, numericValue));

      return (
        <ProgressBar
          value={sanitizedValue}
          variant="blue"
          size="medium"
          layout="compact"
          showPercentage={true}
          compactWidth="w-[100px]"
        />
      );
    },
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
