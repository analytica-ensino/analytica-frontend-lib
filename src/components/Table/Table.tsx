import {
  forwardRef,
  HTMLAttributes,
  TdHTMLAttributes,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { cn } from '../../utils/utils';
import { CaretUp, CaretDown } from 'phosphor-react';

type TableVariant = 'default' | 'borderless';
type TableRowState = 'default' | 'selected' | 'invalid' | 'disabled';
export type SortDirection = 'asc' | 'desc' | null;

interface UseTableSortOptions {
  /** Se true, sincroniza o estado de ordenação com os parâmetros da URL */
  syncWithUrl?: boolean;
}

/**
 * Hook para gerenciar ordenação de dados da tabela
 *
 * @param data - Array de dados a serem ordenados
 * @param options - Opções de configuração do hook
 * @returns Objeto com dados ordenados, coluna/direção atual e função de sort
 *
 * @example
 * ```tsx
 * const activities = [
 *   { id: 1, name: 'Task A', date: '2024-01-01' },
 *   { id: 2, name: 'Task B', date: '2024-01-02' },
 * ];
 *
 * // Sem sincronização com URL
 * const { sortedData, sortColumn, sortDirection, handleSort } = useTableSort(activities);
 *
 * // Com sincronização com URL
 * const { sortedData, sortColumn, sortDirection, handleSort } = useTableSort(activities, { syncWithUrl: true });
 *
 * <TableHead
 *   sortDirection={sortColumn === 'name' ? sortDirection : null}
 *   onSort={() => handleSort('name')}
 * >
 *   Name
 * </TableHead>
 * ```
 */
export function useTableSort<T extends Record<string, unknown>>(
  data: T[],
  options: UseTableSortOptions = {}
) {
  const { syncWithUrl = false } = options;

  // Inicializar estado a partir da URL se syncWithUrl estiver habilitado
  const getInitialState = () => {
    if (!syncWithUrl || typeof window === 'undefined') {
      return { column: null, direction: null };
    }

    const params = new URLSearchParams(window.location.search);
    const sortBy = params.get('sortBy');
    const sort = params.get('sort');

    if (sortBy && sort && (sort === 'ASC' || sort === 'DESC')) {
      return {
        column: sortBy,
        direction: sort.toLowerCase() as SortDirection,
      };
    }

    return { column: null, direction: null };
  };

  const initialState = getInitialState();
  const [sortColumn, setSortColumn] = useState<string | null>(
    initialState.column
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialState.direction
  );

  // Atualizar URL quando o estado de ordenação mudar
  useEffect(() => {
    if (!syncWithUrl || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (sortColumn && sortDirection) {
      params.set('sortBy', sortColumn);
      params.set('sort', sortDirection.toUpperCase());
    } else {
      params.delete('sortBy');
      params.delete('sort');
    }

    // Atualizar URL sem recarregar a página
    window.history.replaceState({}, '', url.toString());
  }, [sortColumn, sortDirection, syncWithUrl]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  return { sortedData, sortColumn, sortDirection, handleSort };
}

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  state?: TableRowState;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <div
      className={cn(
        'relative w-full overflow-x-auto',
        variant === 'default' && 'border border-border-200 rounded-xl'
      )}
    >
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm border-separate border-spacing-0',
          className
        )}
        {...props}
      >
        {/* Fix Sonnar */}
        <caption className="sr-only">My Table</caption>
        {children}
      </table>
    </div>
  )
);

Table.displayName = 'Table';

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('[&_tr:first-child]:border-0', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  variant?: TableVariant;
}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-border-200', className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
  variant?: TableVariant;
}

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ variant = 'default', className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        'bg-background-50 font-medium [&>tr]:last:border-b-0 px-6 py-3.5',
        variant === 'default' && 'border-t border-border-200',
        className
      )}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

const VARIANT_STATES_ROW = {
  default: {
    default: 'border border-border-200',
    borderless: '',
  },
  selected: {
    default: 'border-b-2 border-indicator-primary',
    borderless: 'bg-indicator-primary/10',
  },
  invalid: {
    default: 'border-b-2 border-indicator-error',
    borderless: 'bg-indicator-error/10',
  },
  disabled: {
    default:
      'border-b border-border-100 bg-background-50 opacity-50 cursor-not-allowed',
    borderless: 'bg-background-50 opacity-50 cursor-not-allowed',
  },
} as const;

interface TableRowPropsExtended extends TableRowProps {
  variant?: TableVariant;
  clickable?: boolean;
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowPropsExtended>(
  (
    {
      variant = 'default',
      state = 'default',
      clickable = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'transition-colors',
          state !== 'disabled' ? 'hover:bg-muted/50' : '',
          clickable && state !== 'disabled' ? 'cursor-pointer' : '',
          VARIANT_STATES_ROW[state][variant],
          className
        )}
        aria-disabled={state === 'disabled'}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

interface TableHeadProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Enable sorting on this column (default: true) */
  sortable?: boolean;
  /** Current sort direction for this column */
  sortDirection?: SortDirection;
  /** Callback when column header is clicked */
  onSort?: () => void;
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className,
      sortable = true,
      sortDirection = null,
      onSort,
      children,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    return (
      <th
        ref={ref}
        className={cn(
          'h-10 px-6 py-3.5 text-left align-middle font-bold text-base text-text-800 tracking-[0.2px] leading-none [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] whitespace-nowrap',
          sortable && 'cursor-pointer select-none hover:bg-muted/30',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <div className="flex flex-col">
              {sortDirection === 'asc' && (
                <CaretUp size={16} weight="fill" className="text-text-800" />
              )}
              {sortDirection === 'desc' && (
                <CaretDown size={16} weight="fill" className="text-text-800" />
              )}
            </div>
          )}
        </div>
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-base font-normal text-text-800 leading-[150%] tracking-normal px-6 py-3.5 whitespace-nowrap',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      'border-t border-border-200 text-sm text-text-800 px-6 py-3.5',
      className
    )}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export default Table;
export {
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
