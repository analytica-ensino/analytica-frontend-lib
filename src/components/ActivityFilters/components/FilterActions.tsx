import { Button } from '../../..';

export interface FilterActionsProps {
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
}

/**
 * FilterActions component for clear and apply filter buttons
 * @param props - Component props
 * @returns JSX element or null if no actions provided
 */
export const FilterActions = ({
  onClearFilters,
  onApplyFilters,
}: FilterActionsProps) => {
  if (!onClearFilters && !onApplyFilters) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 justify-end mt-4 px-4 pt-4 border-t border-border-200">
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
