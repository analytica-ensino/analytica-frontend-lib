import { HTMLAttributes, ChangeEvent } from 'react';
import { CaretLeft, CaretRight, CaretDown } from 'phosphor-react';
import { cn } from '../../utils/utils';

export interface TablePaginationProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Total number of items
   */
  totalItems: number;
  /**
   * Current page (1-based)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Items per page
   */
  itemsPerPage: number;
  /**
   * Available options for items per page
   * @default [10, 20, 50, 100]
   */
  itemsPerPageOptions?: number[];
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Callback when items per page changes
   */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /**
   * Customizable label for items (e.g., "escolas", "alunos", "atividades")
   * @default "itens"
   */
  itemLabel?: string;
}

/**
 * Table pagination component with navigation controls and items per page selector
 *
 * @example
 * ```tsx
 * import { TablePagination } from 'analytica-frontend-lib';
 *
 * <TablePagination
 *   totalItems={1000}
 *   currentPage={1}
 *   totalPages={10}
 *   itemsPerPage={10}
 *   itemsPerPageOptions={[10, 20, 50, 100]}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   onItemsPerPageChange={(items) => setItemsPerPage(items)}
 *   itemLabel="escolas"
 * />
 * ```
 */
const TablePagination = ({
  totalItems,
  currentPage,
  totalPages,
  itemsPerPage,
  itemsPerPageOptions = [10, 20, 50, 100],
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'itens',
  className,
  ...props
}: TablePaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(Number(e.target.value));
    }
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full bg-background-50 rounded-xl p-4',
        'sm:justify-start md:justify-between md:flex-nowrap',
        className
      )}
      {...props}
    >
      {/* Primeira linha mobile: contador + selector + page info */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Items count - sempre visível */}
        <span className="font-normal text-xs leading-[14px] text-text-800">
          {startItem} de {totalItems} {itemLabel}
        </span>

        {/* Items per page selector */}
        {onItemsPerPageChange && (
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="w-24 h-9 py-0 px-3 pr-8 bg-background border border-border-300 rounded appearance-none cursor-pointer font-normal text-sm leading-[21px] text-text-900"
              aria-label="Items por página"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option} itens
                </option>
              ))}
            </select>
            <CaretDown
              size={14}
              weight="regular"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-background-600 pointer-events-none"
            />
          </div>
        )}

        {/* Page info */}
        <span className="font-normal text-xs leading-[14px] text-text-950">
          Página {currentPage} de {totalPages}
        </span>
      </div>

      {/* Segunda linha mobile: botões de navegação sempre juntos */}
      <div className="flex items-center justify-center sm:justify-start gap-4">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={isFirstPage}
          className={cn(
            'flex flex-row justify-center items-center py-2 px-4 gap-2 rounded-3xl transition-all',
            isFirstPage
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-950/10 cursor-pointer'
          )}
          aria-label="Página anterior"
        >
          <CaretLeft size={12} weight="bold" className="text-primary-950" />
          <span className="font-medium text-xs leading-[14px] text-primary-950">
            Anterior
          </span>
        </button>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={isLastPage}
          className={cn(
            'flex flex-row justify-center items-center py-2 px-4 gap-2 rounded-3xl transition-all',
            isLastPage
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-950/10 cursor-pointer'
          )}
          aria-label="Próxima página"
        >
          <span className="font-medium text-xs leading-[14px] text-primary-950">
            Próxima
          </span>
          <CaretRight size={12} weight="bold" className="text-primary-950" />
        </button>
      </div>
    </div>
  );
};

TablePagination.displayName = 'TablePagination';

export default TablePagination;
