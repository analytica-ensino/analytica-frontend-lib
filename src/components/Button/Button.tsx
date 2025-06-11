import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button component props interface
 */
type ButtonProps = {
  /** Content to be displayed inside the button */
  children: ReactNode;
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Size variant of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes to apply */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Button component for Analytica Ensino platforms
 *
 * A flexible button component with multiple variants and sizes.
 * Fully compatible with Next.js 15 and React 19.
 *
 * @param children - The content to display inside the button
 * @param variant - The visual style variant (primary, secondary, danger)
 * @param size - The size variant (sm, md, lg)
 * @param className - Additional CSS classes
 * @param props - All other standard button HTML attributes
 * @returns A styled button element
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) => {
  let variantClasses = '';
  let sizeClasses = '';

  switch (variant) {
    case 'secondary':
      variantClasses =
        'bg-secondary-200 hover:bg-secondary-300 text-primary-950';
      break;
    case 'danger':
      variantClasses = 'bg-error-600 hover:bg-error-700 text-secondary';
      break;
    case 'primary':
    default:
      variantClasses = 'bg-primary-600 hover:bg-primary-700 text-secondary';
      break;
  }

  switch (size) {
    case 'sm':
      sizeClasses = 'text-sm px-3 py-1.5';
      break;
    case 'lg':
      sizeClasses = 'text-lg px-5 py-3';
      break;
    case 'md':
    default:
      sizeClasses = 'text-base px-4 py-2';
      break;
  }

  const baseClasses =
    'rounded-full font-medium focus:outline-none focus:ring transition';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
