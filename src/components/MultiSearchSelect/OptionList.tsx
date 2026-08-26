import type { KeyboardEvent } from 'react';
import Text from '../Text/Text';
import CheckBox from '../CheckBox/CheckBox';
import { cn } from '../../utils/utils';
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/csr/SpinnerGap';
import type {
  MultiSearchSelectOption,
  MultiSearchSelectPagination,
} from './types';

interface OptionListProps {
  options: MultiSearchSelectOption[];
  selectedValues: string[];
  highlightedIndex: number;
  listboxId: string;
  loading: boolean;
  loadingText: string;
  emptyText: string;
  onToggle: (value: string) => void;
  /** True while the next page is in flight; renders a footer spinner. */
  loadingMore?: boolean;
  /** Page state of the option source; renders a "N de M" footer. */
  pagination?: MultiSearchSelectPagination;
  /** True while a local filter is narrowing the list, which hides the footer. */
  localFilterActive?: boolean;
}

/**
 * The dropdown body: a loading state, an empty state, or the option rows.
 */
export function OptionList({
  options,
  selectedValues,
  highlightedIndex,
  listboxId,
  loading,
  loadingText,
  emptyText,
  onToggle,
  loadingMore = false,
  pagination,
  localFilterActive = false,
}: Readonly<OptionListProps>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 text-text-500">
        <SpinnerGapIcon size={18} className="animate-spin" />
        <Text size="sm" className="text-text-500">
          {loadingText}
        </Text>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <Text size="sm" className="p-4 text-center text-text-500">
        {emptyText}
      </Text>
    );
  }

  // The "N de M" footer counts the loaded options against the server total, so
  // it is meaningless while a local filter is showing a subset of them.
  const showPaginationFooter =
    Boolean(pagination) &&
    !loadingMore &&
    (pagination?.total ?? 0) > 0 &&
    !localFilterActive;

  return (
    <>
      {options.map((option, index) => (
        <OptionRow
          key={option.value}
          option={option}
          optionId={`${listboxId}-option-${index}`}
          selected={selectedValues.includes(option.value)}
          highlighted={index === highlightedIndex}
          onToggle={onToggle}
        />
      ))}

      {loadingMore && (
        <div className="flex items-center justify-center gap-2 p-3 text-text-500 border-t border-border-100">
          <SpinnerGapIcon size={16} className="animate-spin" />
          <Text size="xs" className="text-text-500">
            Carregando mais...
          </Text>
        </div>
      )}

      {showPaginationFooter && (
        <Text
          size="xs"
          className="px-3 py-2 text-text-400 border-t border-border-100 text-center"
        >
          {options.length} de {pagination?.total} itens
        </Text>
      )}
    </>
  );
}

interface OptionRowProps {
  option: MultiSearchSelectOption;
  optionId: string;
  selected: boolean;
  highlighted: boolean;
  onToggle: (value: string) => void;
}

/**
 * One selectable row of the ARIA combobox listbox.
 *
 * A native `option` is not usable here: it renders no checkbox and accepts no
 * arbitrary markup, and it only lives inside `select`/`datalist`, which this
 * pattern deliberately replaces.
 *
 * The checkbox is purely presentational: the row owns the interaction, so
 * letting the checkbox handle its own would toggle the value twice.
 *
 * A click moves focus onto the row, so it also answers Enter and Space to stay
 * operable from the keyboard. Arrowing through the list is driven from the
 * search field, which keeps focus while the dropdown is open.
 */
function OptionRow({
  option,
  optionId,
  selected,
  highlighted,
  onToggle,
}: Readonly<OptionRowProps>) {
  const toggle = () => {
    if (option.disabled) return;
    onToggle(option.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle();
  };

  return (
    <div // NOSONAR — ARIA combobox pattern, no native tag fits (see JSDoc)
      id={optionId}
      data-option
      role="option"
      aria-selected={selected}
      aria-disabled={option.disabled}
      tabIndex={-1}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors text-sm',
        selected && 'bg-primary-50',
        highlighted && !selected && 'bg-background-50',
        option.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        !option.disabled &&
          !selected &&
          !highlighted &&
          'hover:bg-background-50'
      )}
    >
      <CheckBox
        checked={selected}
        readOnly
        tabIndex={-1}
        size="small"
        className="pointer-events-none"
      />
      <Text size="sm" className="flex-1 text-text-700">
        {option.label}
      </Text>
    </div>
  );
}
