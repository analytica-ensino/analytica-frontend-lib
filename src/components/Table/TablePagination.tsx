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
        'flex flex-row justify-between items-center gap-[25px] h-[52px]',
        className
      )}
      {...props}
    >
      {/* Column 1: Items count */}
      <div className="flex flex-row items-center py-3.5 px-2 gap-2 w-[171px] h-[52px] bg-[#F6F6F6] border-b border-l border-[#DDDCDB] rounded-bl-xl">
        <div className="flex flex-row items-start w-full h-3.5">
          <span className="flex items-center w-full h-3.5 font-normal text-xs leading-[14px] text-[#404040]">
            {startItem} de {totalItems} {itemLabel}
          </span>
        </div>
      </div>

      {/* Column 2: Empty space with items per page selector */}
      <div className="flex flex-row justify-end items-center py-3.5 px-2 gap-2 flex-grow h-[52px] bg-[#F6F6F6] border-b border-[#DDDCDB]">
        <div className="flex flex-row justify-end items-start w-full h-3.5">
          <span className="flex items-center w-full h-3.5" />
        </div>
        {onItemsPerPageChange && (
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="flex flex-row items-center py-0 px-3 gap-2 w-24 h-9 bg-white border border-[#D3D3D3] rounded appearance-none cursor-pointer font-normal text-sm leading-[21px] text-[#262627] pr-8"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747474] pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Column 3: Page info */}
      <div className="flex flex-row justify-end items-center py-3.5 px-2 gap-2 w-[103.5px] h-[52px] bg-[#F6F6F6] border-b border-[#DDDCDB]">
        <div className="flex flex-row justify-end items-start w-full h-3.5">
          <span className="flex items-center text-right w-full h-3.5 font-normal text-xs leading-[14px] text-[#171717]">
            Página {currentPage} de {totalPages}
          </span>
        </div>
      </div>

      {/* Column 4: Previous button */}
      <div className="flex flex-row items-center py-3.5 px-2 gap-2 w-[108px] h-[52px] bg-[#F6F6F6] border-b border-[#DDDCDB]">
        <button
          onClick={handlePrevious}
          disabled={isFirstPage}
          className={cn(
            'flex flex-row justify-center items-center py-0 px-3.5 gap-2 w-[92px] h-8 rounded-3xl transition-opacity',
            isFirstPage
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#124393]/10 cursor-pointer'
          )}
          aria-label="Página anterior"
        >
          <CaretLeft size={12} weight="bold" className="text-[#124393]" />
          <span className="font-medium text-xs leading-[14px] text-[#124393]">
            Anterior
          </span>
        </button>
      </div>

      {/* Column 5: Next button */}
      <div className="flex flex-row items-center py-3.5 px-2 gap-2 w-[111px] h-[52px] bg-[#F6F6F6] border-b border-r border-[#DDDCDB] rounded-br-xl">
        <button
          onClick={handleNext}
          disabled={isLastPage}
          className={cn(
            'flex flex-row justify-center items-center py-0 px-3.5 gap-2 w-[95px] h-8 rounded-3xl transition-opacity',
            isLastPage
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#124393]/10 cursor-pointer'
          )}
          aria-label="Próxima página"
        >
          <span className="font-medium text-xs leading-[14px] text-[#124393]">
            Próxima
          </span>
          <CaretRight size={14} weight="bold" className="text-[#124393]" />
        </button>
      </div>
    </div>
  );
};

TablePagination.displayName = 'TablePagination';

export default TablePagination;
