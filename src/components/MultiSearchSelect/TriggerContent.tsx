import Text from '../Text/Text';
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/csr/SpinnerGap';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import type { MultiSearchSelectOption } from './types';

interface TriggerContentProps {
  selectedOptions: MultiSearchSelectOption[];
  placeholder: string;
  loading: boolean;
  loadingText: string;
  disabled: boolean;
  maxVisibleChips: number;
  onRemove: (value: string) => void;
}

/**
 * Renders what the closed trigger shows: a loading indicator, the placeholder,
 * or one removable chip per selected value.
 */
export function TriggerContent({
  selectedOptions,
  placeholder,
  loading,
  loadingText,
  disabled,
  maxVisibleChips,
  onRemove,
}: Readonly<TriggerContentProps>) {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <SpinnerGapIcon size={14} className="animate-spin" />
        <Text size="sm" className="text-text-500">
          {loadingText}
        </Text>
      </div>
    );
  }

  if (selectedOptions.length === 0) {
    return <span className="truncate text-text-500">{placeholder}</span>;
  }

  const visible = selectedOptions.slice(0, maxVisibleChips);
  const hiddenCount = selectedOptions.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1 py-0.5">
      {visible.map((option) => (
        <ValueChip
          key={option.value}
          option={option}
          disabled={disabled}
          onRemove={onRemove}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center rounded-full border border-border-200 bg-background-50 px-2 py-0.5 text-xs font-medium text-text-700">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}

interface ValueChipProps {
  option: MultiSearchSelectOption;
  disabled: boolean;
  onRemove: (value: string) => void;
}

/**
 * A single selected value.
 *
 * Both the click and the keydown are stopped from bubbling so that removing a
 * value never reaches the trigger and toggles the dropdown open.
 */
function ValueChip({ option, disabled, onRemove }: Readonly<ValueChipProps>) {
  return (
    <span
      data-chip={option.value}
      className="inline-flex max-w-[160px] items-center gap-1 rounded-full border border-primary-300 bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-900"
    >
      <span className="truncate">{option.label}</span>
      <button
        type="button"
        aria-label={`Remover ${option.label}`}
        disabled={disabled}
        className="shrink-0 cursor-pointer hover:text-indicator-error"
        onClick={(event) => {
          event.stopPropagation();
          onRemove(option.value);
        }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <XIcon size={12} weight="bold" />
      </button>
    </span>
  );
}
