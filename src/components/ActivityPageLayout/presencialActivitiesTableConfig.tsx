import Badge from '../Badge/Badge';
import { renderTextCell } from '../../utils/renderTextCell';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import type { ActivityTableItem } from '../../types/activitiesHistory';
import { ActivityDisplayStatus } from '../../types/activitiesHistory';
import { getActivityStatusBadgeAction } from './activitiesTableConfig';

/**
 * Column configuration for the in-person (presencial) activities table.
 *
 * Deliberately leaner than `activitiesTableColumns`: a presencial activity is
 * not tied to the school/class/subject breakdown the regular listing filters
 * by, so only identity, state and creation date are shown.
 *
 * Columns:
 * - title: Título
 * - status: Status (Ativa, Vencida, Concluída)
 * - createdAt: Criada em
 *
 * The owner-only edit/delete actions are appended by UnifiedHistoryPage.
 */
export const presencialActivitiesTableColumns: ColumnConfig<ActivityTableItem>[] =
  [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      className: 'max-w-[420px]',
      render: renderTextCell,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown) => {
        const status = typeof value === 'string' ? value : '';
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
      key: 'createdAt',
      label: 'Criada em',
      sortable: true,
    },
  ];
