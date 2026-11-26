import Badge from '../Badge/Badge';
import type { ActionPlanStatus } from '../../types/actionPlans';
import {
  ACTION_PLAN_STATUS_BADGE_ACTIONS,
  ACTION_PLAN_STATUS_LABELS,
} from './actionPlans.utils';

/**
 * The status of a plan as a badge ("EM ANDAMENTO").
 */
export const ActionPlanStatusBadge = ({
  status,
}: Readonly<{ status: ActionPlanStatus }>) => (
  <Badge
    variant="solid"
    action={ACTION_PLAN_STATUS_BADGE_ACTIONS[status]}
    size="small"
    className="whitespace-nowrap uppercase"
    data-testid="action-plan-status-badge"
  >
    {ACTION_PLAN_STATUS_LABELS[status]}
  </Badge>
);

/**
 * "ATRASADO", next to the deadline of a late plan.
 */
export const ActionPlanLateBadge = () => (
  <Badge
    variant="solid"
    action="error"
    size="small"
    className="whitespace-nowrap uppercase"
    data-testid="action-plan-late-badge"
  >
    Atrasado
  </Badge>
);
