import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useId,
  useMemo,
  KeyboardEvent,
  CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check, MagnifyingGlass, SpinnerGap } from 'phosphor-react';
import { cn } from '../../utils/utils';

// ============================================================================
// Types
// ============================================================================

export interface SearchSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SearchSelectPagination {
  page: number;
  totalPages: number;
  hasNext: boolean;
  total: number;
}

export interface SearchSelectProps {
  /** Current selected value */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Options to display */
  options: SearchSelectOption[];
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Label for the select */
  label?: string;
  /** Helper text below the select */
  helperText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select is in loading state */
  loading?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Visual variant */
  variant?: 'outlined' | 'underlined' | 'rounded';
  /** Additional class name */
  className?: string;
  /** Text to show when no results found */
  emptyText?: string;
  /** Text to show when loading */
  loadingText?: string;
  /** Callback when search query changes (for async search) */
  onSearch?: (query: string) => void;
  /** Debounce delay for search in ms */
  searchDebounce?: number;
  /** Pagination info for infinite scroll */
  pagination?: SearchSelectPagination;
  /** Callback to load more items */
  onLoadMore?: () => void;
  /** Whether loading more items */
  loadingMore?: boolean;
  /** Custom ID */
  id?: string;
  /** Whether to filter options locally (default: true) */
  filterLocally?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SIZE_CLASSES = {
  small: 'text-sm h-8',
  medium: 'text-md h-9',
  large: 'text-lg h-10',
} as const;

const PADDING_CLASSES = {
  small: 'px-2 py-1',
  medium: 'px-3 py-2',
  large: 'px-4 py-3',
} as const;

const VARIANT_CLASSES = {
  outlined: 'border-2 rounded-lg focus:border-primary-950',
  underlined: 'border-b-2 focus:border-primary-950',
  rounded: 'border-2 rounded-full focus:border-primary-950',
} as const;

// ============================================================================
// Hook: useDebounce
// ============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Component
// ============================================================================

export const SearchSelect = forwardRef<HTMLButtonElement, SearchSelectProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = 'Selecione...',
      searchPlaceholder = 'Buscar...',
      label,
      helperText,
      errorMessage,
      disabled = false,
      loading = false,
      size = 'small',
      variant = 'outlined',
      className,
      emptyText = 'Nenhum resultado encontrado',
      loadingText = 'Carregando...',
      onSearch,
      searchDebounce = 300,
      pagination,
      onLoadMore,
      loadingMore = false,
      id,
      filterLocally = true,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const generatedId = useId();
    const selectId = id ?? `search-select-${generatedId}`;

    // Debounced search for async
    const debouncedSearch = useDebounce(searchQuery, searchDebounce);

    // Call onSearch when debounced search changes
    useEffect(() => {
      if (onSearch && debouncedSearch !== undefined) {
        onSearch(debouncedSearch);
      }
    }, [debouncedSearch, onSearch]);

    // Filter options locally if enabled
    const filteredOptions = useMemo(() => {
      if (!filterLocally || !searchQuery) {
        return options;
      }
      const query = searchQuery.toLowerCase();
      return options.filter((opt) => opt.label.toLowerCase().includes(query));
    }, [options, searchQuery, filterLocally]);

    // Get selected option label
    const selectedLabel = useMemo(() => {
      const selected = options.find((opt) => opt.value === value);
      return selected?.label;
    }, [options, value]);

    // Get trigger position for dropdown
    const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

    const updateTriggerRect = useCallback(() => {
      if (triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect());
      }
    }, []);

    // Handle open/close
    const handleToggle = useCallback(() => {
      if (disabled || loading) return;
      const newOpen = !open;
      if (newOpen) {
        updateTriggerRect();
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
      setOpen(newOpen);
    }, [disabled, loading, open, updateTriggerRect]);

    // Handle option selection
    const handleSelect = useCallback(
      (optionValue: string) => {
        onValueChange?.(optionValue);
        setOpen(false);
        setSearchQuery('');
      },
      [onValueChange]
    );

    // Focus search input when dropdown opens
    useEffect(() => {
      if (open && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    }, [open]);

    // Handle click outside
    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const isInsideTrigger = triggerRef.current?.contains(target);
        const isInsideContent = contentRef.current?.contains(target);

        if (!isInsideTrigger && !isInsideContent) {
          setOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open]);

    // Update position on scroll/resize
    useEffect(() => {
      if (!open) return;

      const handleUpdate = () => updateTriggerRect();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }, [open, updateTriggerRect]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        const opts = filteredOptions.filter((o) => !o.disabled);

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev < opts.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : opts.length - 1
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < opts.length) {
              handleSelect(opts[highlightedIndex].value);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setOpen(false);
            setSearchQuery('');
            triggerRef.current?.focus();
            break;
        }
      },
      [filteredOptions, highlightedIndex, handleSelect]
    );

    // Infinite scroll detection
    const handleScroll = useCallback(() => {
      if (
        !listRef.current ||
        !pagination?.hasNext ||
        loadingMore ||
        !onLoadMore
      )
        return;

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const scrollThreshold = 50;

      if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
        onLoadMore();
      }
    }, [pagination?.hasNext, loadingMore, onLoadMore]);

    // Scroll highlighted item into view
    useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const items = listRef.current.querySelectorAll('[data-option]');
        const item = items[highlightedIndex] as HTMLElement;
        if (item) {
          item.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [highlightedIndex]);

    // Set ref
    const setRefs = useCallback(
      (element: HTMLButtonElement | null) => {
        triggerRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref]
    );

    const sizeClasses = SIZE_CLASSES[size];
    const paddingClasses = PADDING_CLASSES[size];
    const variantClasses = VARIANT_CLASSES[variant];
    const invalid = !!errorMessage;

    // Calculate dropdown position with smart overflow handling
    const getDropdownStyles = useCallback((): CSSProperties => {
      if (!triggerRect) return {};

      const gap = 4;
      const dropdownMaxHeight = 300; // max-h-[300px] equivalent
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom - gap;
      const spaceAbove = triggerRect.top - gap;

      // Determine if dropdown should open above or below
      const openAbove =
        spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;

      const styles: CSSProperties = {
        position: 'fixed',
        left: triggerRect.left,
        width: triggerRect.width,
        zIndex: 9999,
        maxHeight: openAbove
          ? Math.min(spaceAbove, dropdownMaxHeight)
          : Math.min(spaceBelow, dropdownMaxHeight),
      };

      if (openAbove) {
        styles.bottom = viewportHeight - triggerRect.top + gap;
      } else {
        styles.top = triggerRect.bottom + gap;
      }

      return styles;
    }, [triggerRect]);

    // Dropdown content
    const dropdownContent = open && triggerRect && (
      <div
        ref={contentRef}
        data-search-select-id={selectId}
        style={getDropdownStyles()}
        className="bg-secondary rounded-md border border-border-100 shadow-lg overflow-hidden flex flex-col"
      >
        {/* Search Input */}
        <div className="p-2 border-b border-border-100">
          <div className="relative">
            <MagnifyingGlass
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-500"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full pl-3 pr-9 py-2 text-sm border border-border-200 rounded-md bg-background focus:outline-none focus:border-primary-500 text-text-900 placeholder:text-text-500"
            />
          </div>
        </div>

        {/* Options List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-text-500">
              <SpinnerGap size={18} className="animate-spin" />
              <span className="text-sm">{loadingText}</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-sm text-text-500">
              {emptyText}
            </div>
          ) : (
            <>
              {filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={option.value}
                    data-option
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (!option.disabled) {
                        handleSelect(option.value);
                      }
                    }}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors text-sm',
                      isSelected && 'bg-primary-50',
                      isHighlighted && !isSelected && 'bg-background-50',
                      option.disabled &&
                        'opacity-50 cursor-not-allowed pointer-events-none',
                      !option.disabled &&
                        !isSelected &&
                        !isHighlighted &&
                        'hover:bg-background-50'
                    )}
                  >
                    <span className="flex-1 text-text-700">{option.label}</span>
                    {isSelected && (
                      <Check
                        size={16}
                        className="text-primary-700"
                        weight="bold"
                      />
                    )}
                  </div>
                );
              })}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center gap-2 p-3 text-text-500 border-t border-border-100">
                  <SpinnerGap size={16} className="animate-spin" />
                  <span className="text-xs">Carregando mais...</span>
                </div>
              )}

              {/* Pagination info */}
              {pagination && !loadingMore && pagination.total > 0 && (
                <div className="px-3 py-2 text-xs text-text-400 border-t border-border-100 text-center">
                  {filteredOptions.length} de {pagination.total} itens
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block font-bold text-text-900 mb-1.5',
              size === 'small' && 'text-sm',
              size === 'medium' && 'text-md',
              size === 'large' && 'text-lg'
            )}
          >
            {label}
          </label>
        )}

        {/* Trigger Button */}
        <button
          ref={setRefs}
          id={selectId}
          type="button"
          onClick={handleToggle}
          disabled={disabled || loading}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            'flex w-full items-center justify-between border-border-300 bg-background',
            sizeClasses,
            paddingClasses,
            variantClasses,
            invalid && 'border-indicator-error',
            disabled || loading
              ? 'cursor-not-allowed opacity-50 text-text-400'
              : 'cursor-pointer hover:bg-background-50 text-text-700'
          )}
        >
          <span className={cn('truncate', !selectedLabel && 'text-text-500')}>
            {loading ? (
              <span className="flex items-center gap-2">
                <SpinnerGap size={14} className="animate-spin" />
                {loadingText}
              </span>
            ) : (
              selectedLabel || placeholder
            )}
          </span>
          <CaretDown
            className={cn(
              'h-4 w-4 opacity-50 transition-transform shrink-0 ml-2',
              open && 'rotate-180'
            )}
          />
        </button>

        {/* Helper Text / Error */}
        {(helperText || errorMessage) && (
          <div className="mt-1.5">
            {helperText && !errorMessage && (
              <p className="text-sm text-text-500">{helperText}</p>
            )}
            {errorMessage && (
              <p className="text-sm text-indicator-error">{errorMessage}</p>
            )}
          </div>
        )}

        {/* Dropdown Portal */}
        {typeof document !== 'undefined' &&
          createPortal(dropdownContent, document.body)}
      </div>
    );
  }
);

SearchSelect.displayName = 'SearchSelect';

export default SearchSelect;
