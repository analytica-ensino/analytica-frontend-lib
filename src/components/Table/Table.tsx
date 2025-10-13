import { forwardRef, HTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '../../utils/utils';

type TableVariant = 'default' | 'borderless';
type TableRowState = 'default' | 'selected' | 'invalid' | 'disabled';

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
        'relative w-full overflow-hidden',
        variant === 'default' && 'border border-border-200 rounded-xl'
      )}
    >
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
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
  ({ variant = 'default', className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        '[&_tr:last-child]:border-0',
        variant === 'default' && 'border-t border-border-200',
        className
      )}
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
    default: 'border-b border-border-200',
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
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowPropsExtended>(
  ({ variant = 'default', state = 'default', className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'transition-colors',
          state !== 'disabled' ? 'hover:bg-muted/50' : '',
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

const TableHead = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-6 py-3.5 bg-muted/50 text-left align-middle font-bold text-text-800 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-md text-text-800 px-6 py-3.5',
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
