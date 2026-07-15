import { useMemo, useRef, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import Search from '../Search/Search';
import Text from '../Text/Text';
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
  const {
    options,
    multiple = false,
    allLabel = 'Todos',
    searchable = false,
    searchPlaceholder = 'Buscar...',
    onSearch,
    loading = false,
  } = config;

  const [query, setQuery] = useState('');

  const hasFilter = value.length > 0;

  // With `onSearch` the consumer owns the list (it re-fetches per query), so the
  // options arrive already filtered. Without it, filter what we were given.
  const visibleOptions = useMemo(() => {
    if (!searchable || onSearch || !query) return options;

    const term = query.toLowerCase();
    return options.filter((option) =>
      String(option.searchText ?? option.value)
        .toLowerCase()
        .includes(term)
    );
  }, [searchable, onSearch, query, options]);

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
    <span className="inline-flex">
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

        {/*
         * Portal: the table body sits inside `overflow-x-auto`, which would clip
         * an absolutely positioned menu.
         *
         * The click guard is still required despite the portal — React bubbles
         * events through the component tree, not the DOM tree, so a click on an
         * item would otherwise reach whatever wraps this header. (The trigger
         * guards its own click; this covers the items.)
         */}
        <DropdownMenuContent
          portal
          triggerRef={triggerRef}
          align="start"
          className="max-h-80 overflow-y-auto"
          onClick={(event) => event.stopPropagation()}
        >
          {searchable && (
            <div className="p-2">
              {/*
               * Two callbacks on purpose: `onChange` fires on every keystroke and
               * drives the local filtering (debouncing that would make typing feel
               * broken), while `onSearch` is debounced and is what hits the server.
               */}
              <Search
                options={[]}
                value={query}
                placeholder={searchPlaceholder}
                debounceMs={300}
                onChange={(event) => setQuery(event.target.value)}
                onSearch={onSearch}
                onClear={() => {
                  setQuery('');
                  onSearch?.('');
                }}
                aria-label={`Buscar ${columnLabel}`}
              />
            </div>
          )}

          <DropdownMenuItem
            onClick={() => onChange([])}
            className={cn(!hasFilter && 'font-bold')}
          >
            {allLabel}
          </DropdownMenuItem>

          {loading && (
            <div className="px-3 py-2">
              <Text size="sm" className="text-text-600">
                Carregando...
              </Text>
            </div>
          )}

          {!loading && visibleOptions.length === 0 && (
            <div className="px-3 py-2">
              <Text size="sm" className="text-text-600">
                Nenhum resultado encontrado
              </Text>
            </div>
          )}

          {!loading &&
            visibleOptions.map((option) => {
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
