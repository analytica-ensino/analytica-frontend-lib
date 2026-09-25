import { Button } from '../../..';
import { cn } from '../../../utils/utils';

export interface FilterActionsProps {
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
  /** Show the top border separating the actions from the filters */
  showDivider?: boolean;
  /** Extra classes for the actions row */
  className?: string;
}

/**
 * FilterActions component for clear and apply filter buttons
 * @param props - Component props
 * @returns JSX element or null if no actions provided
 */
export const FilterActions = ({
  onClearFilters,
  onApplyFilters,
  showDivider = true,
  className,
}: FilterActionsProps) => {
  if (!onClearFilters && !onApplyFilters) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-2 justify-end mt-4 px-4 pt-4',
        showDivider && 'border-t border-border-200',
        className
      )}
    >
      {onClearFilters && (
        <Button variant="link" onClick={onClearFilters} size="small">
          Limpar filtros
        </Button>
      )}
      {onApplyFilters && (
        <Button variant="outline" onClick={onApplyFilters} size="small">
          Filtrar
        </Button>
      )}
    </div>
  );
};
