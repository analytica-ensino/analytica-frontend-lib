import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

/**
 * Base text component props
 */
type BaseTextProps = {
  /** Content to be displayed */
  children?: ReactNode;
  /** Text size variant */
  size?:
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
  /** Font weight variant */
  weight?:
    | 'hairline'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'extrabold'
    | 'black';
  /** Color variant - white for light backgrounds, black for dark backgrounds */
  color?: 'white' | 'black';
  /** Additional CSS classes to apply */
  className?: string;
};

/**
 * Polymorphic text component props that ensures type safety based on the 'as' prop
 */
type TextProps<T extends ElementType = 'p'> = BaseTextProps & {
  /** HTML tag to render */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BaseTextProps>;

/**
 * Text component for Analytica Ensino platforms
 *
 * A flexible polymorphic text component with multiple sizes, weights, and colors.
 * Automatically adapts to dark and light themes with full type safety.
 * Fully compatible with Next.js 15 and React 19.
 *
 * @param children - The content to display
 * @param size - The text size variant (2xs, xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl)
 * @param weight - The font weight variant (hairline, light, normal, medium, semibold, bold, extrabold, black)
 * @param color - The color variant (white, black) - adapts to theme
 * @param as - The HTML tag to render - determines allowed attributes via TypeScript
 * @param className - Additional CSS classes
 * @param props - HTML attributes valid for the chosen tag only
 * @returns A styled text element with type-safe attributes
 *
 * @example
 * ```tsx
 * <Text size="lg" weight="bold" color="black">
 *   This is a large, bold text
 * </Text>
 *
 * <Text as="a" href="/link" target="_blank">
 *   Link with type-safe anchor attributes
 * </Text>
 *
 * <Text as="button" onClick={handleClick} disabled>
 *   Button with type-safe button attributes
 * </Text>
 * ```
 */
export const Text = <T extends ElementType = 'p'>({
  children,
  size = 'md',
  weight = 'normal',
  color = 'black',
  as,
  className = '',
  ...props
}: TextProps<T>) => {
  let sizeClasses = '';
  let weightClasses = '';
  let colorClasses = '';

  // Text size classes
  switch (size) {
    case '2xs':
      sizeClasses = 'text-2xs';
      break;
    case 'xs':
      sizeClasses = 'text-xs';
      break;
    case 'sm':
      sizeClasses = 'text-sm';
      break;
    case 'lg':
      sizeClasses = 'text-lg';
      break;
    case 'xl':
      sizeClasses = 'text-xl';
      break;
    case '2xl':
      sizeClasses = 'text-2xl';
      break;
    case '3xl':
      sizeClasses = 'text-3xl';
      break;
    case '4xl':
      sizeClasses = 'text-4xl';
      break;
    case '5xl':
      sizeClasses = 'text-5xl';
      break;
    case '6xl':
      sizeClasses = 'text-6xl';
      break;
    case 'md':
    default:
      sizeClasses = 'text-md';
      break;
  }

  // Font weight classes
  switch (weight) {
    case 'hairline':
      weightClasses = 'font-hairline';
      break;
    case 'light':
      weightClasses = 'font-light';
      break;
    case 'medium':
      weightClasses = 'font-medium';
      break;
    case 'semibold':
      weightClasses = 'font-semibold';
      break;
    case 'bold':
      weightClasses = 'font-bold';
      break;
    case 'extrabold':
      weightClasses = 'font-extrabold';
      break;
    case 'black':
      weightClasses = 'font-black';
      break;
    case 'normal':
    default:
      weightClasses = 'font-normal';
      break;
  }

  // Color classes - adapts automatically to theme
  switch (color) {
    case 'white':
      colorClasses = 'text-text'; // Uses CSS variable that adapts to theme
      break;
    case 'black':
    default:
      colorClasses = 'text-text-950'; // Uses CSS variable that adapts to theme
      break;
  }

  const baseClasses = 'font-primary';
  const Component = as || ('p' as ElementType);

  return (
    <Component
      className={`${baseClasses} ${sizeClasses} ${weightClasses} ${colorClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
