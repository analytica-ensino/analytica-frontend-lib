import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
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
  /**
   * Render the tooltip inside a React Portal attached to document.body.
   * Use this when the trigger lives inside an ancestor with `overflow:hidden`
   * (e.g. scroll containers) that would otherwise clip the tooltip.
   */
  usePortal?: boolean;
}

/**
 * Position classes for tooltip placement (non-portal mode, CSS-only)
 */
const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const TOOLTIP_GAP_PX = 8;

/**
 * Compute fixed-position coordinates relative to the viewport for a given
 * trigger element and desired tooltip position.
 */
const computePortalCoords = (
  triggerRect: DOMRect,
  position: TooltipPosition,
  tooltipRect: { width: number; height: number }
): { top: number; left: number } => {
  switch (position) {
    case 'bottom':
      return {
        top: triggerRect.bottom + TOOLTIP_GAP_PX,
        left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      };
    case 'left':
      return {
        top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
        left: triggerRect.left - tooltipRect.width - TOOLTIP_GAP_PX,
      };
    case 'right':
      return {
        top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
        left: triggerRect.right + TOOLTIP_GAP_PX,
      };
    case 'top':
    default:
      return {
        top: triggerRect.top - tooltipRect.height - TOOLTIP_GAP_PX,
        left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      };
  }
};

const TOOLTIP_CONTENT_CLASSES = cn(
  'whitespace-nowrap',
  'px-4 py-2 rounded-lg',
  'bg-background-dark text-white',
  'text-sm font-medium',
  'shadow-[0px_3px_10px_0px_rgba(38,38,38,0.2)]',
  'transition-opacity duration-150'
);

/**
 * Tooltip component - Displays contextual information on hover/focus
 *
 * By default uses a CSS-only approach with `group-hover` for performance.
 * When `usePortal` is true, the tooltip is rendered in a React Portal so it
 * escapes ancestors with `overflow:hidden`.
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
  usePortal = false,
}: Readonly<TooltipProps>) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = {
      width: tooltipRef.current.offsetWidth,
      height: tooltipRef.current.offsetHeight,
    };
    setCoords(computePortalCoords(triggerRect, position, tooltipRect));
  }, [position]);

  useLayoutEffect(() => {
    if (!usePortal || !open) return;
    updatePosition();
  }, [usePortal, open, updatePosition, content]);

  /**
   * Attach hover/focus listeners via the DOM API (not JSX props) so the
   * wrapper element stays semantically non-interactive. This satisfies the
   * SonarQube `S6848`/`jsx-a11y/no-static-element-interactions` rule which
   * fires on static elements (`<span>`/`<div>`) that carry interactive JSX
   * handlers (`onMouseEnter`/`onFocus`/etc.).
   */
  useEffect(() => {
    if (!usePortal) return;
    const node = triggerRef.current;
    if (!node) return;

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    node.addEventListener('mouseenter', handleOpen);
    node.addEventListener('mouseleave', handleClose);
    node.addEventListener('focusin', handleOpen);
    node.addEventListener('focusout', handleClose);

    return () => {
      node.removeEventListener('mouseenter', handleOpen);
      node.removeEventListener('mouseleave', handleClose);
      node.removeEventListener('focusin', handleOpen);
      node.removeEventListener('focusout', handleClose);
    };
  }, [usePortal]);

  if (disabled) {
    return <>{children}</>;
  }

  if (usePortal) {
    return (
      <span
        ref={triggerRef}
        className={cn('relative inline-flex', className)}
        aria-describedby={open ? 'tooltip-portal' : undefined}
      >
        {children}
        {open &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={tooltipRef}
              id="tooltip-portal"
              role="tooltip"
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                zIndex: 9999,
              }}
              className={cn(TOOLTIP_CONTENT_CLASSES, contentClassName)}
            >
              {content}
            </div>,
            document.body
          )}
      </span>
    );
  }

  return (
    <div className={cn('relative inline-flex group', className)}>
      {children}

      {/* Tooltip content - shown on hover/focus via CSS */}
      <div
        role="tooltip"
        className={cn(
          'absolute z-50',
          TOOLTIP_CONTENT_CLASSES,
          'opacity-0 invisible',
          'group-hover:opacity-100 group-hover:visible',
          'group-focus-within:opacity-100 group-focus-within:visible',
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
