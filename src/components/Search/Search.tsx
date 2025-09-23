import { X, MagnifyingGlass } from 'phosphor-react';
import {
  InputHTMLAttributes,
  forwardRef,
  useState,
  useId,
  useMemo,
  useEffect,
  useRef,
  ChangeEvent,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  createDropdownStore,
} from '../DropdownMenu/DropdownMenu';

/**
 * Search component props interface
 */
type SearchProps = {
  /** List of options to show in dropdown */
  options: string[];
  /** Callback when an option is selected from dropdown */
  onSelect?: (value: string) => void;
  /** Callback when search input changes */
  onSearch?: (query: string) => void;
  /** Control dropdown visibility externally */
  showDropdown?: boolean;
  /** Callback when dropdown open state changes */
  onDropdownChange?: (open: boolean) => void;
  /** Maximum height of dropdown in pixels */
  dropdownMaxHeight?: number;
  /** Text to show when no results are found */
  noResultsText?: string;
  /** Additional CSS classes to apply to the input */
  className?: string;
  /** Additional CSS classes to apply to the container */
  containerClassName?: string;
  /** Callback when clear button is clicked */
  onClear?: () => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onSelect'>;

/**
 * Search component for Analytica Ensino platforms
 *
 * A specialized search input component with dropdown suggestions.
 * Features filtering, keyboard navigation, and customizable options.
 *
 * @param options - Array of search options to display in dropdown
 * @param onSelect - Callback when an option is selected
 * @param onSearch - Callback when search query changes
 * @param placeholder - Placeholder text for the input
 * @param noResultsText - Text to show when no results are found
 * @param dropdownMaxHeight - Maximum height of dropdown in pixels
 * @param className - Additional CSS classes for the input
 * @param containerClassName - Additional CSS classes for the container
 * @param props - All other standard input HTML attributes
 * @returns A styled search input with dropdown functionality
 *
 * @example
 * ```tsx
 * // Basic search
 * <Search
 *   options={['Filosofia', 'Física', 'Matemática']}
 *   placeholder="Buscar matéria..."
 *   onSelect={(value) => console.log('Selected:', value)}
 * />
 *
 * // With custom filtering
 * <Search
 *   options={materias}
 *   onSearch={(query) => setFilteredMaterias(filterMaterias(query))}
 *   noResultsText="Nenhum resultado encontrado"
 * />
 * ```
 */

/**
 * Filter options based on search query
 */
const filterOptions = (options: string[], query: string): string[] => {
  if (!query || query.length < 1) return [];

  return options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase())
  );
};

/**
 * Updates input value and creates appropriate change event
 */
const updateInputValue = (
  value: string,
  ref:
    | { current: HTMLInputElement | null }
    | ((instance: HTMLInputElement | null) => void)
    | null,
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
) => {
  if (!onChange) return;

  if (ref && 'current' in ref && ref.current) {
    ref.current.value = value;
    const event = new Event('input', { bubbles: true });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: ref.current,
    });
    onChange(event as unknown as ChangeEvent<HTMLInputElement>);
  } else {
    // Fallback for cases where ref is not available
    const event = {
      target: { value },
      currentTarget: { value },
    } as ChangeEvent<HTMLInputElement>;
    onChange(event);
  }
};

const Search = forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      options = [],
      onSelect,
      onSearch,
      showDropdown: controlledShowDropdown,
      onDropdownChange,
      dropdownMaxHeight = 240,
      noResultsText = 'Nenhum resultado encontrado',
      className = '',
      containerClassName = '',
      disabled,
      readOnly,
      id,
      onClear,
      value,
      onChange,
      placeholder = 'Buscar...',
      onKeyDown: userOnKeyDown,
      ...props
    },
    ref
  ) => {
    // Dropdown state and logic
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [forceClose, setForceClose] = useState(false);
    const justSelectedRef = useRef(false);
    const dropdownStore = useRef(createDropdownStore()).current;
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputElRef = useRef<HTMLInputElement>(null);

    // Filter options based on input value
    const filteredOptions = useMemo(() => {
      if (!options.length) {
        return [];
      }
      const filtered = filterOptions(options, (value as string) || '');
      return filtered;
    }, [options, value]);

    // Control dropdown visibility
    const showDropdown =
      !forceClose &&
      (controlledShowDropdown ??
        (dropdownOpen && value && String(value).length > 0));

    // Helper to keep all consumers in sync
    const setOpenAndNotify = (open: boolean) => {
      setDropdownOpen(open);
      dropdownStore.setState({ open });
      onDropdownChange?.(open);
    };

    // Handle dropdown visibility changes
    useEffect(() => {
      // Don't reopen dropdown if we just selected an option
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }
      // Respect forceClose even if value is non-empty
      if (forceClose) {
        setOpenAndNotify(false);
        return;
      }

      const shouldShow = Boolean(value && String(value).length > 0);
      setOpenAndNotify(shouldShow);
    }, [value, forceClose, onDropdownChange, dropdownStore]);

    // Handle option selection
    const handleSelectOption = (option: string) => {
      justSelectedRef.current = true; // Prevent immediate dropdown reopen
      setForceClose(true); // Force dropdown to close immediately
      onSelect?.(option);
      setOpenAndNotify(false);

      // Update input value if onChange is provided
      updateInputValue(option, ref, onChange);
    };

    // Handle click outside dropdown
    useEffect(() => {
      const handleClickOutside = (event: globalThis.MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setOpenAndNotify(false);
        }
      };

      if (showDropdown) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showDropdown, dropdownStore, onDropdownChange]);

    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `search-${generatedId}`;
    const dropdownId = `${inputId}-dropdown`;

    // Handle clear button
    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        updateInputValue('', ref, onChange);
      }
    };

    // Handle clear button click - mantém foco no input
    const handleClearClick = (e: MouseEvent) => {
      e.preventDefault(); // Evita que o input perca foco
      e.stopPropagation(); // Para propagação do evento
      handleClear();
    };

    // Handle search icon click - focus on input
    const handleSearchIconClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        inputElRef.current?.focus();
      }, 0);
    };

    // Handle input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setForceClose(false); // Allow dropdown to open when user types
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Let consumer run first; if they prevent default, skip our logic
      userOnKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === 'Enter') {
        e.preventDefault();

        // If dropdown is open and there are filtered options, select the first one
        if (showDropdown && filteredOptions.length > 0) {
          handleSelectOption(filteredOptions[0]);
        } else if (value) {
          // If no dropdown or no options, execute search
          onSearch?.(String(value));
          setForceClose(true);
          setOpenAndNotify(false);
        }
      }
    };

    // Helper function for input state classes
    const getInputStateClasses = (disabled?: boolean, readOnly?: boolean) => {
      if (disabled) return 'cursor-not-allowed opacity-40';
      if (readOnly) return 'cursor-default focus:outline-none !text-text-900';
      return 'hover:border-border-400';
    };

    // Determine which icon to show
    const hasValue = String(value ?? '').length > 0;
    const showClearButton = hasValue && !disabled && !readOnly;
    const showSearchIcon = !hasValue && !disabled && !readOnly;

    return (
      <div
        ref={dropdownRef}
        className={`w-full max-w-lg md:w-[488px] ${containerClassName}`}
      >
        {/* Search Input Container */}
        <div className="relative flex items-center">
          {/* Search Input Field */}
          <input
            ref={(node) => {
              // Forward to parent
              if (ref) {
                if (typeof ref === 'function') ref(node);
                else
                  (ref as { current: HTMLInputElement | null }).current = node;
              }
              // Keep our own handle
              inputElRef.current = node;
            }}
            id={inputId}
            type="text"
            className={`w-full py-0 px-4 pr-10 font-normal text-text-900 focus:outline-primary-950 border rounded-full bg-background focus:bg-primary-50 border-border-300 focus:border-2 focus:border-primary-950 h-10 placeholder:text-text-600 ${getInputStateClasses(disabled, readOnly)} ${className}`}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            aria-expanded={showDropdown ? 'true' : undefined}
            aria-haspopup={options.length > 0 ? 'listbox' : undefined}
            aria-controls={showDropdown ? dropdownId : undefined}
            aria-autocomplete="list"
            role={options.length > 0 ? 'combobox' : undefined}
            {...props}
          />

          {/* Right Icon - Clear Button */}
          {showClearButton && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                type="button"
                className="p-0 border-0 bg-transparent cursor-pointer"
                onMouseDown={handleClearClick}
                aria-label="Limpar busca"
              >
                <span className="w-6 h-6 text-text-800 flex items-center justify-center hover:text-text-600 transition-colors">
                  <X />
                </span>
              </button>
            </div>
          )}

          {/* Right Icon - Search Icon */}
          {showSearchIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                type="button"
                className="p-0 border-0 bg-transparent cursor-pointer"
                onMouseDown={handleSearchIconClick}
                aria-label="Buscar"
              >
                <span className="w-6 h-6 text-text-800 flex items-center justify-center hover:text-text-600 transition-colors">
                  <MagnifyingGlass />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Search Dropdown */}
        {showDropdown && (
          <DropdownMenu open={showDropdown} onOpenChange={setDropdownOpen}>
            <DropdownMenuContent
              id={dropdownId}
              className="w-full mt-1"
              style={{ maxHeight: dropdownMaxHeight }}
              align="start"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className="text-text-700 text-base leading-6 cursor-pointer"
                  >
                    {option}
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-3 py-3 text-text-700 text-base">
                  {noResultsText}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';

export default Search;
