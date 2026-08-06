import Text from '../Text/Text';
import Button from '../Button/Button';
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/csr/SpinnerGap';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { TRIGGER_TEXT_SIZES } from './constants';
import type { MultiSearchSelectOption, MultiSearchSelectSize } from './types';

interface TriggerContentProps {
  selectedOptions: MultiSearchSelectOption[];
  placeholder: string;
  loading: boolean;
  loadingText: string;
  disabled: boolean;
  maxVisibleChips: number;
  size: MultiSearchSelectSize;
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
  size,
  onRemove,
}: Readonly<TriggerContentProps>) {
  const textSize = TRIGGER_TEXT_SIZES[size];

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <SpinnerGapIcon size={14} className="animate-spin" />
        <Text as="span" size={textSize} className="text-text-500">
          {loadingText}
        </Text>
      </div>
    );
  }

  if (selectedOptions.length === 0) {
    return (
      <Text as="span" size={textSize} className="block truncate text-text-500">
        {placeholder}
      </Text>
    );
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
        <Text
          as="span"
          size="xs"
          weight="medium"
          className="inline-flex items-center rounded-full border border-border-200 bg-background-50 px-2 py-0.5 text-text-700"
        >
          +{hiddenCount}
        </Text>
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
      className="inline-flex max-w-[160px] items-center gap-1 rounded-full border border-primary-300 bg-primary-100 px-2 py-0.5 text-primary-900"
    >
      <Text
        as="span"
        size="xs"
        weight="medium"
        color="text-primary-900"
        className="truncate"
      >
        {option.label}
      </Text>
      <Button
        variant="raw"
        aria-label={`Remover ${option.label}`}
        disabled={disabled}
        className="shrink-0 cursor-pointer hover:text-indicator-error disabled:cursor-not-allowed"
        onClick={(event) => {
          event.stopPropagation();
          onRemove(option.value);
        }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <XIcon size={12} weight="bold" />
      </Button>
    </span>
  );
}
