import type { KeyboardEvent } from 'react';
import Text from '../Text/Text';
import CheckBox from '../CheckBox/CheckBox';
import { cn } from '../../utils/utils';
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/csr/SpinnerGap';
import type { MultiSearchSelectOption } from './types';

interface OptionListProps {
  options: MultiSearchSelectOption[];
  selectedValues: string[];
  highlightedIndex: number;
  listboxId: string;
  loading: boolean;
  loadingText: string;
  emptyText: string;
  onToggle: (value: string) => void;
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

  return options.map((option, index) => (
    <OptionRow
      key={option.value}
      option={option}
      optionId={`${listboxId}-option-${index}`}
      selected={selectedValues.includes(option.value)}
      highlighted={index === highlightedIndex}
      onToggle={onToggle}
    />
  ));
}

interface OptionRowProps {
  option: MultiSearchSelectOption;
  optionId: string;
  selected: boolean;
  highlighted: boolean;
  onToggle: (value: string) => void;
}

/**
 * One selectable row.
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
    <div
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
