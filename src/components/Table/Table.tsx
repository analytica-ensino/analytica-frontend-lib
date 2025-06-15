import { forwardRef, HTMLAttributes, TdHTMLAttributes } from 'react';

type TableRowState = 'default' | 'selected' | 'invalid' | 'disabled';

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  state?: TableRowState;
}

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="border border-border-200 rounded-xl relative w-full overflow-hidden">
      <table
        ref={ref}
        className={`w-full caption-bottom text-sm ${className ?? ''}`}
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
    className={`[&_tr:first-child]:border-0 ${className}`}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={`[&_tr:last-child]:border-0 border-t border-border-200 ${className}`}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`border-t bg-background-50 border-border-200 font-medium [&>tr]:last:border-b-0 px-6 py-3.5 ${className}`}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const VARIANT_STATES_ROW = {
  default: 'border-b border-border-200',
  selected: 'border-b-2 border-indicator-primary',
  invalid: 'border-b-2 border-indicator-error',
  disabled:
    'border-b border-border-100 bg-background-50 opacity-50 cursor-not-allowed',
} as const;

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ state = 'default', className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`
        transition-colors
        ${state !== 'disabled' ? 'hover:bg-muted/50' : ''}
        ${VARIANT_STATES_ROW[state]}
        ${className}
      `}
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
    className={`h-10 px-6 py-3.5 bg-bg-secondary bg-muted/50 text-left align-middle font-bold text-text-800 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}`}
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
    className={`p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-md text-text-800 px-6 py-3.5 ${className}`}
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
    className={`border-t border-border-200 text-sm text-text-800 px-6 py-3.5 ${className}`}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
