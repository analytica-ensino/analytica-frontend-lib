import { ReactNode } from 'react';
import { cn } from '../../utils/utils';

/**
 * Tooltip position options
 */
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip component props interface
 */
export interface TooltipProps {
  /** Content to display in the tooltip */
  content: ReactNode;
  /** Element that triggers the tooltip */
  children: ReactNode;
  /** Position of the tooltip relative to the trigger */
  position?: TooltipPosition;
  /** Additional className for the tooltip container */
  className?: string;
  /** Additional className for the tooltip content */
  contentClassName?: string;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
}

/**
 * Position classes for tooltip placement
 */
const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Tooltip component - Displays contextual information on hover/focus
 * Uses CSS-only approach with group-hover for better accessibility
 *
 * @example
 * ```tsx
 * <Tooltip content="Desempenho baseado nas atividades">
 *   <Info size={18} weight="bold" className="text-text-950 cursor-pointer" />
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  className,
  contentClassName,
  disabled = false,
}: Readonly<TooltipProps>) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative inline-flex group', className)}>
      {children}

      {/* Tooltip content - shown on hover/focus via CSS */}
      <div
        role="tooltip"
        className={cn(
          'absolute z-50 whitespace-nowrap',
          'px-4 py-2 rounded-lg',
          'bg-background-900 text-white',
          'text-sm font-medium',
          'shadow-[0px_3px_10px_0px_rgba(38,38,38,0.2)]',
          'opacity-0 invisible',
          'group-hover:opacity-100 group-hover:visible',
          'group-focus-within:opacity-100 group-focus-within:visible',
          'transition-opacity duration-150',
          POSITION_CLASSES[position],
          contentClassName
        )}
      >
        {content}
      </div>
    </div>
  );
}

export default Tooltip;
