import Button from '../Button/Button';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import type { ActionPlanOrigin } from '../../types/actionPlans';
import { formatQueriedAt } from './actionPlans.utils';

export interface ActionPlanOriginBoxProps {
  origin: ActionPlanOrigin;
  /**
   * Opens the screen the plan came from (`origin.link`, relative). Without
   * it, or without a link, "Ver origem" is not shown.
   */
  onOpenOrigin?: (link: string) => void;
  /** `stacked` (detail sidebar) or `row` (form modal) */
  layout?: 'stacked' | 'row';
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-0 flex-col gap-1">
    <Text as="dt" size="xs" className="text-text-600">
      {label}
    </Text>
    <Text as="dd" size="sm" weight="bold" className="break-words text-text-950">
      {value || '—'}
    </Text>
  </div>
);

/**
 * The "Origem" box of a plan: the report it came from, the filters applied
 * there and when the data was read, with a way back to it. Read only: the
 * origin never changes.
 */
export const ActionPlanOriginBox = ({
  origin,
  onOpenOrigin,
  layout = 'stacked',
}: Readonly<ActionPlanOriginBoxProps>) => (
  <div
    className="flex flex-col gap-4 rounded-xl bg-background-100 p-4"
    data-testid="action-plan-origin"
  >
    <dl
      className={cn(
        'grid gap-4',
        layout === 'row' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'
      )}
    >
      <Field label="Relatório" value={origin.report} />
      <Field label="Filtros aplicados" value={origin.filters.join(', ')} />
      <Field
        label="Dados consultado em"
        value={formatQueriedAt(origin.queriedAt)}
      />
    </dl>
    {onOpenOrigin && origin.link && (
      <Button
        variant="outline"
        size="small"
        className="self-start"
        onClick={() => onOpenOrigin(origin.link as string)}
      >
        Ver origem
      </Button>
    )}
  </div>
);
