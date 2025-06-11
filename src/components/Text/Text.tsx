import { ReactNode, HTMLAttributes } from 'react';

/**
 * Text component props interface
 */
type TextProps = {
  /** Content to be displayed inside the text element */
  children: ReactNode;
  /** Size variant of the text */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Weight variant of the text */
  weight?:
    | 'hairline'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'extrabold'
    | 'black';
  /** Color variant of the text */
  color?: 'white' | 'black';
  /** HTML element to render */
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  /** Additional CSS classes to apply */
  className?: string;
} & HTMLAttributes<HTMLElement>;

/**
 * Text component for Analytica Ensino platforms
 *
 * A flexible text component with multiple sizes, weights, and colors.
 * Fully compatible with Next.js 15 and React 19.
 *
 * @param children - The content to display inside the text element
 * @param size - The text size variant (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl)
 * @param weight - The font weight variant (hairline, light, normal, medium, semibold, bold, extrabold, black)
 * @param color - The text color (white, black)
 * @param as - The HTML element to render (p, span, h1, h2, h3, h4, h5, h6, div)
 * @param className - Additional CSS classes
 * @param props - All other standard HTML attributes
 * @returns A styled text element
 *
 * @example
 * ```tsx
 * <Text size="lg" weight="bold" color="black" as="h1">
 *   Main Title
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

  switch (color) {
    case 'white':
      colorClasses = 'text-white';
      break;
    case 'black':
    default:
      colorClasses = 'text-black';
      break;
  }

  const baseClasses = 'font-roboto';

  return (
    <Component
      className={`${baseClasses} ${sizeClasses} ${weightClasses} ${colorClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
