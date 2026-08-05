import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import Input from '../Input/Input';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import {
  LABEL_SIZE_CLASSES,
  OPEN_KEYS,
  PADDING_CLASSES,
  SIZE_CLASSES,
  VARIANT_CLASSES,
} from './constants';
import { OptionList } from './OptionList';
import { TriggerContent } from './TriggerContent';
import { useDropdownPosition } from './useDropdownPosition';
import type { MultiSearchSelectOption, MultiSearchSelectProps } from './types';

/**
 * Searchable multi-select: the sibling of `SearchSelect` for picking several
 * values at once. Same sizing, borders, portalled dropdown and keyboard model,
 * with removable chips in the trigger and a checkbox per option.
 *
 * Filtering is local, so there is no async search or pagination — pass an
 * already loaded option list.
 *
 * @example
 * ```tsx
 * <MultiSearchSelect
 *   label="Turmas"
 *   values={classIds}
 *   onValuesChange={setClassIds}
 *   options={classes.map((c) => ({ value: c.id, label: c.name }))}
 *   unknownValueLabel="Turma não encontrada"
 * />
 * ```
 */
export function MultiSearchSelect({
  values,
  onValuesChange,
  options,
  label,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhum resultado encontrado',
  loadingText = 'Carregando...',
  unknownValueLabel = 'Item não encontrado',
  helperText,
  errorMessage,
  disabled = false,
  loading = false,
  size = 'small',
  variant = 'outlined',
  className,
  id,
  maxVisibleChips = 3,
}: Readonly<MultiSearchSelectProps>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const generatedId = useId();
  const selectId = id ?? `multi-search-select-${generatedId}`;
  const listboxId = `${selectId}-listbox`;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const { triggerRect, measureTrigger, dropdownStyles } = useDropdownPosition({
    open,
    triggerRef,
  });

  const filteredOptions = useMemo(
    () => filterOptions(options, searchQuery),
    [options, searchQuery]
  );

  const selectedOptions = useMemo(
    () => resolveSelectedOptions(values, options, unknownValueLabel),
    [values, options, unknownValueLabel]
  );

  const interactive = !disabled && !loading;

  const closeDropdown = useCallback((restoreFocus = false) => {
    setOpen(false);
    setSearchQuery('');
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const openDropdown = useCallback(() => {
    measureTrigger();
    setSearchQuery('');
    setHighlightedIndex(-1);
    setOpen(true);
  }, [measureTrigger]);

  const toggleOpen = useCallback(() => {
    if (!interactive) return;
    if (open) {
      closeDropdown();
      return;
    }
    openDropdown();
  }, [interactive, open, closeDropdown, openDropdown]);

  /**
   * Toggling deliberately keeps the dropdown and the search query alive: picks
   * usually come in runs of adjacent options.
   */
  const toggleValue = useCallback(
    (optionValue: string) => {
      const alreadySelected = values.includes(optionValue);
      const next = alreadySelected
        ? values.filter((value) => value !== optionValue)
        : [...values, optionValue];
      onValuesChange(next);
    },
    [values, onValuesChange]
  );

  const removeValue = useCallback(
    (optionValue: string) => {
      onValuesChange(values.filter((value) => value !== optionValue));
    },
    [values, onValuesChange]
  );

  useFocusOnOpen(open, searchInputRef);
  useCloseOnOutsideClick(open, closeDropdown, triggerRef, contentRef);
  useScrollHighlightIntoView(highlightedIndex, listRef);
  useClampHighlight(
    filteredOptions.length,
    highlightedIndex,
    setHighlightedIndex
  );

  const moveHighlight = useCallback(
    (direction: 'next' | 'prev') => {
      setHighlightedIndex((current) =>
        findNextEnabledIndex(filteredOptions, current, direction)
      );
    },
    [filteredOptions]
  );

  const toggleHighlighted = useCallback(() => {
    const option = filteredOptions[highlightedIndex];
    if (!option || option.disabled) return;
    toggleValue(option.value);
  }, [filteredOptions, highlightedIndex, toggleValue]);

  /** An empty query turns Backspace into "drop the last chip". */
  const canRemoveLastChip = searchQuery === '' && values.length > 0;

  const removeLastValue = useCallback(() => {
    onValuesChange(values.slice(0, -1));
  }, [values, onValuesChange]);

  /**
   * Dismisses the dropdown without letting Escape reach the document.
   *
   * Modals in the design system close on a document-level Escape listener, so a
   * bubbling key would discard the whole surrounding form.
   *
   * It is bound to every element that can hold focus while the dropdown is open
   * — the trigger, the search field and the listbox, which the option rows sit
   * inside — rather than to the panel wrapper, which carries no role.
   */
  const handleEscape = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closeDropdown(true);
    },
    [closeDropdown]
  );

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveHighlight('next');
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveHighlight('prev');
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        toggleHighlighted();
        return;
      }
      if (event.key === 'Backspace' && canRemoveLastChip) {
        event.preventDefault();
        removeLastValue();
        return;
      }
      handleEscape(event);
    },
    [
      moveHighlight,
      toggleHighlighted,
      removeLastValue,
      canRemoveLastChip,
      handleEscape,
    ]
  );

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;

      if (OPEN_KEYS.includes(event.key) && !open) {
        event.preventDefault();
        openDropdown();
        return;
      }

      handleEscape(event);
    },
    [interactive, open, openDropdown, handleEscape]
  );

  const describedById = resolveDescribedBy({
    errorMessage,
    errorId,
    helperText,
    helperId,
  });

  const activeDescendant =
    highlightedIndex >= 0
      ? `${listboxId}-option-${highlightedIndex}`
      : undefined;

  const hasDescription = Boolean(helperText) || Boolean(errorMessage);

  const dropdown = open && triggerRect && (
    <div
      ref={contentRef}
      data-multi-search-select-id={selectId}
      style={dropdownStyles}
      className="bg-secondary rounded-md border border-border-100 shadow-lg overflow-hidden flex flex-col"
    >
      <div className="p-2 border-b border-border-100">
        <Input
          ref={searchInputRef}
          type="text"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder={searchPlaceholder}
          size="small"
          variant="outlined"
          iconRight={<MagnifyingGlassIcon size={16} />}
          containerClassName="w-full"
        />
      </div>

      <div
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-multiselectable
        aria-label={label ?? 'Opções'}
        tabIndex={-1}
        onKeyDown={handleEscape}
        className="flex-1 overflow-y-auto"
      >
        <OptionList
          options={filteredOptions}
          selectedValues={values}
          highlightedIndex={highlightedIndex}
          listboxId={listboxId}
          loading={loading}
          loadingText={loadingText}
          emptyText={emptyText}
          onToggle={toggleValue}
        />
      </div>
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            'block font-bold text-text-900 mb-1.5',
            LABEL_SIZE_CLASSES[size]
          )}
        >
          {label}
        </label>
      )}

      <div
        ref={triggerRef}
        id={selectId}
        role="combobox"
        tabIndex={interactive ? 0 : -1}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-invalid={!!errorMessage}
        aria-describedby={describedById}
        aria-disabled={!interactive}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2 border-border-300 bg-background',
          SIZE_CLASSES[size],
          PADDING_CLASSES[size],
          VARIANT_CLASSES[variant],
          errorMessage && 'border-indicator-error',
          interactive
            ? 'cursor-pointer hover:bg-background-50 text-text-700'
            : 'cursor-not-allowed opacity-50 text-text-400'
        )}
      >
        <div className="min-w-0 flex-1">
          <TriggerContent
            selectedOptions={selectedOptions}
            placeholder={placeholder}
            loading={loading}
            loadingText={loadingText}
            disabled={disabled}
            maxVisibleChips={maxVisibleChips}
            onRemove={removeValue}
          />
        </div>
        <CaretDownIcon
          className={cn(
            'h-4 w-4 opacity-50 transition-transform shrink-0',
            open && 'rotate-180'
          )}
        />
      </div>

      {hasDescription && (
        <div className="mt-1.5">
          {helperText && !errorMessage && (
            <Text id={helperId} size="sm" className="text-text-500">
              {helperText}
            </Text>
          )}
          {errorMessage && (
            <Text id={errorId} size="sm" className="text-indicator-error">
              {errorMessage}
            </Text>
          )}
        </div>
      )}

      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}

/** Case-insensitive local filter over the option captions. */
function filterOptions(
  options: MultiSearchSelectOption[],
  searchQuery: string
): MultiSearchSelectOption[] {
  if (!searchQuery) return options;
  const query = searchQuery.toLowerCase();
  return options.filter((option) => option.label.toLowerCase().includes(query));
}

/**
 * Maps every selected value to a renderable option.
 *
 * Values are never filtered against `options`: while the list is still loading,
 * or after an entry is deleted elsewhere, dropping the value would silently
 * discard a real binding. It falls back to a placeholder caption instead, so
 * the value stays visible and removable.
 */
function resolveSelectedOptions(
  values: string[],
  options: MultiSearchSelectOption[],
  unknownValueLabel: string
): MultiSearchSelectOption[] {
  return values.map(
    (value) =>
      options.find((option) => option.value === value) ?? {
        value,
        label: unknownValueLabel,
      }
  );
}

/**
 * Walks the option list in one direction and returns the first enabled index,
 * wrapping around. Returns -1 when every option is disabled or the list is
 * empty.
 */
function findNextEnabledIndex(
  options: MultiSearchSelectOption[],
  currentIndex: number,
  direction: 'next' | 'prev'
): number {
  const total = options.length;
  if (total === 0) return -1;

  const step = direction === 'next' ? 1 : -1;
  const unsetStart = direction === 'next' ? -1 : total;
  const startIndex = currentIndex >= 0 ? currentIndex : unsetStart;
  let index = startIndex;

  for (let attempt = 0; attempt < total; attempt++) {
    index = (index + step + total) % total;
    if (!options[index].disabled) return index;
  }

  return -1;
}

interface DescribedByParams {
  errorMessage?: string;
  errorId: string;
  helperText?: string;
  helperId: string;
}

/** The error takes precedence over the hint as the field's description. */
function resolveDescribedBy({
  errorMessage,
  errorId,
  helperText,
  helperId,
}: DescribedByParams): string | undefined {
  if (errorMessage) return errorId;
  if (helperText) return helperId;
  return undefined;
}

/** Moves focus into the search field as soon as the dropdown opens. */
function useFocusOnOpen(
  open: boolean,
  searchInputRef: RefObject<HTMLInputElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open, searchInputRef]);
}

/**
 * Dismisses the dropdown on a click outside it.
 *
 * The trigger and the dropdown are checked separately because the dropdown is
 * portalled and therefore not a DOM descendant of the trigger.
 */
function useCloseOnOutsideClick(
  open: boolean,
  close: () => void,
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insideContent = contentRef.current?.contains(target);
      if (insideTrigger || insideContent) return;
      close();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open, close, triggerRef, contentRef]);
}

/**
 * Pulls the highlight back into range when a search narrows the option list,
 * so `aria-activedescendant` never points at a row that no longer exists.
 */
function useClampHighlight(
  optionCount: number,
  highlightedIndex: number,
  setHighlightedIndex: (index: number) => void
) {
  useEffect(() => {
    if (highlightedIndex < optionCount) return;
    setHighlightedIndex(Math.max(optionCount - 1, -1));
  }, [optionCount, highlightedIndex, setHighlightedIndex]);
}

/** Keeps the keyboard-highlighted row visible in a long list. */
function useScrollHighlightIntoView(
  highlightedIndex: number,
  listRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const rows = listRef.current.querySelectorAll('[data-option]');
    const row = rows[highlightedIndex] as HTMLElement | undefined;
    row?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, listRef]);
}

export type {
  MultiSearchSelectOption,
  MultiSearchSelectProps,
  MultiSearchSelectSize,
  MultiSearchSelectVariant,
} from './types';

export default MultiSearchSelect;
