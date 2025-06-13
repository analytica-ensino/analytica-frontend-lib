import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button component props interface
 */
type ButtonProps = {
  /** Content to be displayed inside the button */
  children: ReactNode;
  /** Ícone à esquerda do texto */
  iconLeft?: ReactNode;
  /** Ícone à direita do texto */
  iconRight?: ReactNode;
  /** Size of the button */
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  /** Visual variant of the button */
  variant?: 'solid' | 'outline' | 'link';
  /** Action type of the button */
  action?: 'primary' | 'positive' | 'negative';
  /** Additional CSS classes to apply */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Button component for Analytica Ensino platforms
 *
 * A flexible button component with multiple variants, sizes and actions.
 * Fully compatible with Next.js 15 and React 19.
 *
 * @param children - The content to display inside the button
 * @param size - The size variant (extra-small, small, medium, large, extra-large)
 * @param variant - The visual style variant (solid, outline, link)
 * @param action - The action type (primary, positive, negative)
 * @param className - Additional CSS classes
 * @param props - All other standard button HTML attributes
 * @returns A styled button element
 *
 * @example
 * ```tsx
 * <Button variant="solid" action="primary" size="medium" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = ({
  children,
  iconLeft,
  iconRight,
  size = 'medium',
  variant = 'solid',
  action = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  let sizeClasses = '';
  let variantClasses = '';

  // Size classes
  switch (size) {
    case 'extra-small':
      sizeClasses = 'text-xs px-3.5 py-2';
      break;
    case 'small':
      sizeClasses = 'text-sm px-4 py-2.5';
      break;
    case 'medium':
      sizeClasses = 'text-md px-5 py-2.5';
      break;
    case 'large':
      sizeClasses = 'text-lg px-6 py-3';
      break;
    case 'extra-large':
      sizeClasses = 'text-lg px-7 py-3.5';
      break;
    default:
      sizeClasses = 'text-md px-5 py-2.5';
      break;
  }

  // Variant and Action classes
  const getVariantActionClasses = () => {
    if (variant === 'solid') {
      switch (action) {
        case 'primary':
          return 'bg-primary-950 text-text border-2 border-primary-950 hover:bg-primary-800 hover:border-primary-800 focus:bg-primary-950 focus:border-indicator-info active:bg-primary-700 active:border-primary-700 disabled:bg-primary-500 disabled:border-primary-500 disabled:opacity-40 disabled:cursor-not-allowed';
        case 'positive':
          return 'bg-success-500 text-text border-2 border-success-500 hover:bg-success-600 hover:border-success-600 focus:bg-success-500 focus:border-indicator-info active:bg-success-700 active:border-success-700 disabled:bg-success-500 disabled:border-success-500 disabled:opacity-40 disabled:cursor-not-allowed';
        case 'negative':
          return 'bg-error-500 text-text border-2 border-error-500 hover:bg-error-600 hover:border-error-600 focus:bg-error-500 focus:border-indicator-info active:bg-error-700 active:border-error-700 disabled:bg-error-500 disabled:border-error-500 disabled:opacity-40 disabled:cursor-not-allowed';
        default:
          return 'bg-primary-950 text-text border-2 border-primary-950 hover:bg-primary-800 hover:border-primary-800 focus:bg-primary-950 focus:border-indicator-info active:bg-primary-700 active:border-primary-700 disabled:bg-primary-500 disabled:border-primary-500 disabled:opacity-40 disabled:cursor-not-allowed';
      }
    } else if (variant === 'outline') {
      switch (action) {
        case 'primary':
          return 'bg-transparent text-primary-950 border border-primary-950 hover:bg-background-50 hover:text-primary-400 hover:border-primary-400 focus:text-primary-600 focus:border-2 focus:border-indicator-info active:text-primary-700 active:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed';
        case 'positive':
          return 'bg-transparent text-success-500 border border-success-300 hover:bg-background-50 hover:text-success-400 hover:border-success-400 focus:text-success-600 focus:border-2 focus:border-indicator-info active:text-success-700 active:border-success-700 disabled:opacity-40 disabled:cursor-not-allowed';
        case 'negative':
          return 'bg-transparent text-error-500 border border-error-300 hover:bg-background-50 hover:text-error-400 hover:border-error-400 focus:text-error-600 focus:border-2 focus:border-indicator-info active:text-error-700 active:border-error-700 disabled:opacity-40 disabled:cursor-not-allowed';
        default:
          return 'bg-transparent text-primary-950 border border-primary-950 hover:bg-background-50 hover:text-primary-400 hover:border-primary-400 focus:text-primary-600 focus:border-2 focus:border-indicator-info active:text-primary-700 active:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed';
      }
    } else if (variant === 'link') {
      switch (action) {
        case 'primary':
          return 'bg-transparent text-primary-950 hover:text-primary-400 focus:text-primary-600 focus:border-2 focus:border-indicator-info active:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed';
        case 'positive':
          return 'bg-transparent text-success-500 hover:text-success-400 focus:text-success-600 focus:border-2 focus:border-indicator-info active:text-success-700 disabled:opacity-40 disabled:cursor-not-allowed';
        case 'negative':
          return 'bg-transparent text-error-500 hover:text-error-400 focus:text-error-600 focus:border-2 focus:border-indicator-info active:text-error-700 disabled:opacity-40 disabled:cursor-not-allowed';
        default:
          return 'bg-transparent text-primary-950 hover:text-primary-400 focus:text-primary-600 focus:border-2 focus:border-indicator-info active:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed';
      }
    }
    return '';
  };

  variantClasses = getVariantActionClasses();

  const baseClasses =
    'inline-flex items-center justify-center rounded-full cursor-pointer font-medium';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {iconLeft && <span className="mr-2 flex items-center">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2 flex items-center">{iconRight}</span>}
    </button>
  );
};
