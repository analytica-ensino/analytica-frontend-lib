import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/utils';

/**
 * Lookup table for variant and action class combinations
 */
const VARIANT_ACTION_CLASSES = {
  solid: {
    primary:
      'bg-primary-950 text-text border border-primary-950 hover:bg-primary-800 hover:border-primary-800 focus-visible:outline-none focus-visible:bg-primary-950 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:bg-primary-700 active:border-primary-700 disabled:bg-primary-500 disabled:border-primary-500 disabled:opacity-40 disabled:cursor-not-allowed',
    positive:
      'bg-success-500 text-text border border-success-500 hover:bg-success-600 hover:border-success-600 focus-visible:outline-none focus-visible:bg-success-500 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:bg-success-700 active:border-success-700 disabled:bg-success-500 disabled:border-success-500 disabled:opacity-40 disabled:cursor-not-allowed',
    negative:
      'bg-error-500 text-text border border-error-500 hover:bg-error-600 hover:border-error-600 focus-visible:outline-none focus-visible:bg-error-500 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:bg-error-700 active:border-error-700 disabled:bg-error-500 disabled:border-error-500 disabled:opacity-40 disabled:cursor-not-allowed',
  },
  outline: {
    primary:
      'bg-transparent text-primary-950 border border-primary-950 hover:bg-background-50 hover:text-primary-400 hover:border-primary-400 focus-visible:border-0 focus-visible:outline-none focus-visible:text-primary-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-primary-700 active:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed',
    positive:
      'bg-transparent text-success-500 border border-success-300 hover:bg-background-50 hover:text-success-400 hover:border-success-400 focus-visible:border-0 focus-visible:outline-none focus-visible:text-success-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-success-700 active:border-success-700 disabled:opacity-40 disabled:cursor-not-allowed',
    negative:
      'bg-transparent text-error-500 border border-error-300 hover:bg-background-50 hover:text-error-400 hover:border-error-400 focus-visible:border-0 focus-visible:outline-none focus-visible:text-error-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-error-700 active:border-error-700 disabled:opacity-40 disabled:cursor-not-allowed',
  },
  link: {
    primary:
      'bg-transparent text-primary-950 hover:text-primary-400 focus-visible:outline-none focus-visible:text-primary-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed',
    positive:
      'bg-transparent text-success-500 hover:text-success-400 focus-visible:outline-none focus-visible:text-success-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-success-700 disabled:opacity-40 disabled:cursor-not-allowed',
    negative:
      'bg-transparent text-error-500 hover:text-error-400 focus-visible:outline-none focus-visible:text-error-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-error-700 disabled:opacity-40 disabled:cursor-not-allowed',
  },
} as const;

/**
 * Lookup table for size classes
 */
const SIZE_CLASSES = {
  'extra-small': 'text-xs px-3.5 py-2',
  small: 'text-sm px-4 py-2.5',
  medium: 'text-md px-5 py-2.5',
  large: 'text-lg px-6 py-3',
  'extra-large': 'text-lg px-7 py-3.5',
} as const;

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
const Button = ({
  children,
  iconLeft,
  iconRight,
  size = 'medium',
  variant = 'solid',
  action = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  // Get classes from lookup tables
  const sizeClasses = SIZE_CLASSES[size];
  const variantClasses = VARIANT_ACTION_CLASSES[variant][action];

  const baseClasses =
    'inline-flex items-center justify-center rounded-full cursor-pointer font-medium';

  return (
    <button
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
      disabled={disabled}
      type={type}
      {...props}
    >
      {iconLeft && <span className="mr-2 flex items-center">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2 flex items-center">{iconRight}</span>}
    </button>
  );
};

export default Button;
