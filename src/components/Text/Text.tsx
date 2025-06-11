import { HTMLAttributes, ReactNode } from 'react';

/**
 * Text component props interface
 */
type TextProps = {
  /** Content to be displayed */
  children: ReactNode;
  /** Text size variant */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
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
  /** HTML tag to render */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Additional CSS classes to apply */
  className?: string;
} & HTMLAttributes<HTMLElement>;

/**
 * Text component for Analytica Ensino platforms
 *
 * A flexible text component with multiple sizes, weights, and colors.
 * Automatically adapts to dark and light themes.
 * Fully compatible with Next.js 15 and React 19.
 *
 * @param children - The content to display
 * @param size - The text size variant (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl)
 * @param weight - The font weight variant (hairline, light, normal, medium, semibold, bold, extrabold, black)
 * @param color - The color variant (white, black) - adapts to theme
 * @param as - The HTML tag to render (p, span, div, h1-h6)
 * @param className - Additional CSS classes
 * @param props - All other standard HTML attributes
 * @returns A styled text element
 *
 * @example
 * ```tsx
 * <Text size="lg" weight="bold" color="black">
 *   This is a large, bold text
 * </Text>
 * ```
 */
export const Text = ({
  children,
  size = 'base',
  weight = 'normal',
  color = 'black',
  as: Component = 'p',
  className = '',
  ...props
}: TextProps) => {
  let sizeClasses = '';
  let weightClasses = '';
  let colorClasses = '';

  // Text size classes
  switch (size) {
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
    case 'base':
    default:
      sizeClasses = 'text-base';
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

  return (
    <Component
      className={`${baseClasses} ${sizeClasses} ${weightClasses} ${colorClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
