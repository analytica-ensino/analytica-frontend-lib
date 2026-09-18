import { renderTextCell } from '../../utils/renderTextCell';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import type { ActivityTableItem } from '../../types/activitiesHistory';
import { renderActivityStatusBadge } from './activitiesTableConfig';

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
      // Status é derivado (não é coluna): `GET /activities/history` só
      // ordena por createdAt/finalDate/title/completionPercentage.
      sortable: false,
      render: renderActivityStatusBadge,
    },
    {
      key: 'createdAt',
      label: 'Criada em',
      sortable: true,
    },
  ];
