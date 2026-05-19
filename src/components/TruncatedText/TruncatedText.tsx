import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { Tooltip } from '../Tooltip/Tooltip';
import { cn } from '../../utils/utils';

/**
 * Text size variants — matches the `Text` component.
 */
export type TruncatedTextSize =
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl';

/**
 * Font weight variants — matches the `Text` component.
 */
export type TruncatedTextWeight =
  | 'hairline'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

/**
 * Tooltip position relative to the truncated element.
 */
export type TruncatedTextTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const SIZE_CLASS_MAP: Record<TruncatedTextSize, string> = {
  '2xs': 'text-2xs',
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-md',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
};

const WEIGHT_CLASS_MAP: Record<TruncatedTextWeight, string> = {
  hairline: 'font-hairline',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

/**
 * Base props for the TruncatedText component.
 */
type BaseProps = {
  /** Text content rendered with `truncate`. Tooltip falls back to this when it's a string. */
  children: ReactNode;
  /** Optional override for the tooltip content. */
  tooltipContent?: ReactNode;
  /** Tooltip position relative to the text (default: 'top'). */
  tooltipPosition?: TruncatedTextTooltipPosition;
  /** Text size variant (default: 'md'). */
  size?: TruncatedTextSize;
  /** Font weight variant (default: 'normal'). */
  weight?: TruncatedTextWeight;
  /** Tailwind color class (default: 'text-text-950'). */
  color?: string;
  /** Additional class names for the text element. */
  className?: string;
  /** Additional class names for the tooltip wrapper. */
  wrapperClassName?: string;
};

/**
 * Polymorphic props — uses `as` to choose the underlying HTML element.
 */
export type TruncatedTextProps<T extends ElementType = 'span'> = BaseProps & {
  /** HTML tag for the text element (default: 'span'). */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BaseProps | 'as' | 'ref'>;

/**
 * Text that visually truncates on overflow (via Tailwind `truncate`) and
 * always shows the design-system `Tooltip` with the full text on hover/focus.
 *
 * No JS overflow detection is performed: when the text fits, the tooltip
 * still appears at hover but with the same visible content — an acceptable
 * trade-off equivalent to the previously used HTML `title=` attribute,
 * and the only approach that works across every container (table-layout
 * auto/fixed, grid, flex) without changing existing layout.
 *
 * @example
 * ```tsx
 * <TruncatedText size="sm">{subject.name}</TruncatedText>
 * ```
 */
export const TruncatedText = <T extends ElementType = 'span'>({
  children,
  tooltipContent,
  tooltipPosition = 'top',
  size = 'md',
  weight = 'normal',
  color = 'text-text-950',
  className,
  wrapperClassName,
  as,
  ...rest
}: TruncatedTextProps<T>) => {
  const Component: ElementType = as ?? 'span';

  const resolvedTooltipContent =
    tooltipContent ?? (typeof children === 'string' ? children : '');

  return (
    <Tooltip
      content={resolvedTooltipContent}
      position={tooltipPosition}
      disabled={!resolvedTooltipContent}
      usePortal
      className={cn('inline-flex min-w-0 max-w-full', wrapperClassName)}
    >
      <Component
        className={cn(
          'font-primary truncate block min-w-0 max-w-full',
          SIZE_CLASS_MAP[size],
          WEIGHT_CLASS_MAP[weight],
          color,
          className
        )}
        {...rest}
      >
        {children}
      </Component>
    </Tooltip>
  );
};

export default TruncatedText;
