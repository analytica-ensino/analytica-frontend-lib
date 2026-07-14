import { useRef } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { cn } from '../../utils/utils';
import type { ColumnFilterConfig } from './useColumnFilters';

export interface ColumnFilterMenuProps {
  /** Plain-text column name, used for the trigger's accessible label. */
  columnLabel: string;
  config: ColumnFilterConfig;
  /** Currently selected values (empty = "all"). */
  value: string[];
  onChange: (values: string[]) => void;
}

/**
 * The filter dropdown that lives inside a column header.
 *
 * Renders the `DropdownMenu` primitives directly (rather than wrapping them in
 * another component) because the store is injected by walking the child
 * element tree — an indirection would hide the items from it.
 */
const ColumnFilterMenu = ({
  columnLabel,
  config,
  value,
  onChange,
}: ColumnFilterMenuProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { options, multiple = false, allLabel = 'Todos' } = config;

  const hasFilter = value.length > 0;

  const toggle = (optionValue: string) => {
    if (!multiple) {
      // Re-picking the active value clears it.
      onChange(value[0] === optionValue ? [] : [optionValue]);
      return;
    }

    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  };

  return (
    // The wrapper stops clicks from reaching an enclosing sort handler.
    <span
      className="inline-flex"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          aria-label={`Filtrar por ${columnLabel}`}
          className={cn(
            'flex items-center rounded-sm cursor-pointer hover:opacity-70',
            hasFilter ? 'text-primary-600' : 'text-text-600'
          )}
        >
          <CaretDownIcon
            size={16}
            weight={hasFilter ? 'fill' : 'regular'}
            aria-hidden="true"
          />
        </DropdownMenuTrigger>

        {/* Portal: the table body sits inside `overflow-x-auto`, which would
            clip an absolutely positioned menu. */}
        <DropdownMenuContent portal triggerRef={triggerRef} align="start">
          <DropdownMenuItem
            onClick={() => onChange([])}
            className={cn(!hasFilter && 'font-bold')}
          >
            {allLabel}
          </DropdownMenuItem>

          {options.map((option) => {
            const selected = value.includes(option.value);

            return (
              <DropdownMenuItem
                key={option.value}
                preventClose={multiple}
                onClick={() => toggle(option.value)}
                iconRight={
                  selected ? (
                    <CheckIcon size={16} weight="bold" aria-hidden="true" />
                  ) : undefined
                }
                className={cn(selected && 'font-bold')}
              >
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
};

ColumnFilterMenu.displayName = 'ColumnFilterMenu';

export default ColumnFilterMenu;
