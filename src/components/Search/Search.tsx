import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
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
  /** Debounce delay in ms for onSearch. Default 0 (no debounce). */
  debounceMs?: number;
  /**
   * Quantidade de resultados da busca **atual**. Quando informada, confirmar a
   * busca com Enter anuncia o total num `role="status"` — sem isso o leitor de
   * tela não diz se achou algo.
   *
   * Precisa acompanhar o que está digitado. Todos os consumidores filtram a
   * cada tecla (e não só no Enter), então o valor já chega atualizado; um
   * consumidor que só filtrasse no submit anunciaria a contagem anterior.
   *
   * Omitir mantém o comportamento antigo: o componente só anuncia por conta
   * própria quando ele mesmo filtra, isto é, quando recebe `options`.
   */
  resultsCount?: number;
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
 * @param resultsCount - Total da busca atual; confirmar com Enter anuncia esse
 *   total num `role="status"` ("3 resultados encontrados")
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
 * Frase anunciada ao confirmar a busca. A cópia acompanha o resto da lib:
 * `NoSearchResult` e o `noResultsText` padrão daqui usam o mesmo
 * "Nenhum resultado encontrado".
 */
export const getResultsMessage = (count: number): string => {
  if (count === 0) return 'Nenhum resultado encontrado';
  if (count === 1) return '1 resultado encontrado';
  return `${count} resultados encontrados`;
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
      debounceMs = 0,
      resultsCount,
      ...props
    },
    ref
  ) => {
    // Frase falada ao confirmar a busca.
    const [announcement, setAnnouncement] = useState('');
    const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Dropdown state and logic
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [forceClose, setForceClose] = useState(false);
    const justSelectedRef = useRef(false);
    const dropdownStore = useRef(createDropdownStore()).current;
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputElRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        if (announceTimer.current) clearTimeout(announceTimer.current);
      };
    }, []);

    /**
     * Fala a frase na região live.
     *
     * Limpa e repõe o texto num tick separado, em vez de escrever direto. São
     * dois motivos, e os dois aparecem só num leitor de tela de verdade:
     *
     * - O VoiceOver engole a atualização quando ela acontece no mesmo tick do
     *   Enter, com o foco dentro do input — a fala da tecla ganha e a região
     *   nunca é anunciada.
     * - Região live só dispara quando o conteúdo MUDA. Sem o passo de limpeza,
     *   confirmar duas vezes a mesma busca escreveria o mesmo texto e o leitor
     *   ficaria mudo na segunda.
     */
    const announce = (message: string) => {
      if (announceTimer.current) clearTimeout(announceTimer.current);
      setAnnouncement('');
      announceTimer.current = setTimeout(() => {
        setAnnouncement(message);
      }, 150);
    };

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
        document.addEventListener('click', handleClickOutside);
      }

      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [showDropdown, dropdownStore, onDropdownChange]);

    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `search-${generatedId}`;
    const dropdownId = `${inputId}-dropdown`;

    // Handle clear button
    const handleClear = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      if (onClear) {
        onClear();
      } else {
        updateInputValue('', ref, onChange);
      }
      // Limpar esconde o próprio botão (`showClearButton` passa a ser false) e
      // ele desmonta. No teclado isso largaria o foco no <body>; no mouse é
      // no-op, porque o `preventDefault` do mousedown já segurou o foco aqui.
      inputElRef.current?.focus();
    };

    // O mousedown existe só para o input não perder o foco no clique. A ação
    // fica no click — que é o que Enter e Espaço disparam num botão focado.
    // Prender a ação ao mousedown deixava os dois botões mortos no teclado.
    const preventFocusLoss = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Handle clear button click - mantém foco no input
    const handleClearClick = (e: MouseEvent) => {
      e.stopPropagation(); // Para propagação do evento
      handleClear();
    };

    // Handle search icon click - focus on input
    const handleSearchIconClick = (e: MouseEvent) => {
      e.stopPropagation();
      inputElRef.current?.focus();
    };

    // Handle input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setForceClose(false); // Allow dropdown to open when user types
      onChange?.(e);
      if (debounceMs > 0) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        const value = e.target.value;
        debounceTimer.current = setTimeout(() => {
          onSearch?.(value);
        }, debounceMs);
      } else {
        onSearch?.(e.target.value);
      }
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

          // Sem `resultsCount` e sem `options`, o componente não sabe quantos
          // resultados existem — anunciar "Nenhum resultado" aí seria mentira.
          const count =
            resultsCount ??
            (options.length > 0 ? filteredOptions.length : undefined);
          if (count !== undefined) {
            announce(getResultsMessage(count));
          }
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
        {/* `aria-atomic` faz o leitor reler a frase inteira, e não só o
            pedaço que mudou. */}
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </span>

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
                onMouseDown={preventFocusLoss}
                onClick={handleClearClick}
                aria-label="Limpar busca"
              >
                <span className="w-6 h-6 text-text-800 flex items-center justify-center hover:text-text-600 transition-colors">
                  <XIcon />
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
                onMouseDown={preventFocusLoss}
                onClick={handleSearchIconClick}
                aria-label="Buscar"
              >
                <span className="w-6 h-6 text-text-800 flex items-center justify-center hover:text-text-600 transition-colors">
                  <MagnifyingGlassIcon />
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
