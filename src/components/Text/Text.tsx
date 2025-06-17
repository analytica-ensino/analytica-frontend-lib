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
  color?: string;
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
 * @param color - The color variant - adapts to theme
 * @param as - The HTML tag to render - determines allowed attributes via TypeScript
 * @param className - Additional CSS classes
 * @param props - HTML attributes valid for the chosen tag only
 * @returns A styled text element with type-safe attributes
 *
 * @example
 * ```tsx
 * <Text size="lg" weight="bold" color="text-info-800">
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
  color = 'text-text-950',
  as,
  className = '',
  ...props
}: TextProps<T>) => {
  let sizeClasses = '';
  let weightClasses = '';

  // Text size classes mapping
  const sizeClassMap = {
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
  } as const;

  sizeClasses = sizeClassMap[size] ?? sizeClassMap.md;

  // Font weight classes mapping
  const weightClassMap = {
    hairline: 'font-hairline',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  } as const;

  weightClasses = weightClassMap[weight] ?? weightClassMap.normal;

  const baseClasses = 'font-primary';
  const Component = as ?? ('p' as ElementType);

  return (
    <Component
      className={`${baseClasses} ${sizeClasses} ${weightClasses} ${color} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
