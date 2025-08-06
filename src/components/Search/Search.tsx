import { CaretLeft, X } from 'phosphor-react';
import React, {
  InputHTMLAttributes,
  forwardRef,
  useState,
  useId,
  useMemo,
  useEffect,
  useRef,
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
      ...props
    },
    ref
  ) => {
    // Dropdown state and logic
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownStore = useRef(createDropdownStore()).current;
    const dropdownRef = useRef<HTMLDivElement>(null);

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
      controlledShowDropdown ??
      (dropdownOpen && value && String(value).length > 0);

    // Handle dropdown visibility changes
    useEffect(() => {
      const shouldShow = Boolean(value && String(value).length > 0);
      setDropdownOpen(shouldShow);
      dropdownStore.setState({ open: shouldShow });
      onDropdownChange?.(shouldShow);
    }, [value, onDropdownChange, dropdownStore]);

    // Handle option selection
    const handleSelectOption = (option: string) => {
      onSelect?.(option);
      setDropdownOpen(false);
      dropdownStore.setState({ open: false });

      // Update input value if onChange is provided
      if (onChange) {
        const event = {
          target: { value: option },
          currentTarget: { value: option },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    // Handle click outside dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setDropdownOpen(false);
          dropdownStore.setState({ open: false });
        }
      };

      if (showDropdown) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showDropdown, dropdownStore]);

    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `search-${generatedId}`;

    // Handle clear button
    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        const event = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    // Handle clear button click - mantém foco no input
    const handleClearClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Evita que o input perca foco
      e.stopPropagation(); // Para propagação do evento
      handleClear();
    };

    // Handle left icon click - remove focus from input
    const handleLeftIconClick = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.blur();
      }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    // Helper function for input state classes
    const getInputStateClasses = (disabled?: boolean, readOnly?: boolean) => {
      if (disabled) return 'cursor-not-allowed opacity-40';
      if (readOnly) return 'cursor-default focus:outline-none !text-text-900';
      return 'hover:border-border-400';
    };

    // Determine if we should show clear button
    const showClearButton = value && !disabled && !readOnly;

    return (
      <div
        ref={dropdownRef}
        className={`w-full max-w-lg md:w-[488px] ${containerClassName}`}
      >
        {/* Search Input Container */}
        <div className="relative flex items-center">
          {/* Left Icon - Back */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <button
              type="button"
              className="w-6 h-6 text-text-800 flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer hover:text-text-600 transition-colors"
              onClick={handleLeftIconClick}
              aria-label="Voltar"
            >
              <CaretLeft />
            </button>
          </div>

          {/* Search Input Field */}
          <input
            ref={ref}
            id={inputId}
            type="text"
            className={`w-full py-0 px-4 pl-10 ${showClearButton ? 'pr-10' : 'pr-4'} font-normal text-text-900 focus:outline-primary-950 border rounded-full bg-primary border-border-300 focus:border-2 focus:border-primary-950 h-10 placeholder:text-text-600 ${getInputStateClasses(disabled, readOnly)} ${className}`}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            aria-expanded={showDropdown ? 'true' : undefined}
            aria-haspopup={options.length > 0 ? 'listbox' : undefined}
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
        </div>

        {/* Search Dropdown */}
        {showDropdown && (
          <DropdownMenu open={showDropdown} onOpenChange={setDropdownOpen}>
            <DropdownMenuContent
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
