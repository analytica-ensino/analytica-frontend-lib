import { WarningCircle } from 'phosphor-react';
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

/**
 * Lookup table for size classes
 */
const SIZE_CLASSES = {
  small: 'text-sm',
  medium: 'text-md',
  large: 'text-lg',
  'extra-large': 'text-xl',
} as const;

/**
 * Lookup table for state classes
 */
const STATE_CLASSES = {
  default:
    'border-border-300 placeholder:text-text-600 hover:border-border-400',
  error: 'border-2 border-error-500 placeholder:text-text-600',
  disabled:
    'border-border-300 placeholder:text-text-600 cursor-not-allowed opacity-40',
  'read-only':
    'border-border-300 !text-text-600 cursor-default focus:outline-none bg-background-50',
} as const;

/**
 * Lookup table for variant classes
 */
const VARIANT_CLASSES = {
  outlined: 'border rounded-lg',
  underlined: 'border-0 border-b rounded-none bg-transparent',
  rounded: 'border rounded-full',
} as const;

/**
 * Input component props interface
 */
type InputProps = {
  /** Label text displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message displayed below the input */
  errorMessage?: string;
  /** Size of the input */
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  /** Visual variant of the input */
  variant?: 'outlined' | 'underlined' | 'rounded';
  /** Current state of the input */
  state?: 'default' | 'error' | 'disabled' | 'read-only';
  /** Icon to display on the left side of the input */
  iconLeft?: ReactNode;
  /** Icon to display on the right side of the input */
  iconRight?: ReactNode;
  /** Additional CSS classes to apply to the input */
  className?: string;
  /** Additional CSS classes to apply to the container */
  containerClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

/**
 * Input component for Analytica Ensino platforms
 *
 * A flexible input component with multiple sizes, states, and support for icons.
 * Includes label, helper text, and error message functionality.
 * Fully compatible with Next.js 15 and React 19.
 *
 * @param label - Optional label text displayed above the input
 * @param helperText - Optional helper text displayed below the input
 * @param errorMessage - Optional error message displayed below the input
 * @param size - The size variant (small, medium, large, extra-large)
 * @param variant - The visual variant (outlined, underlined, rounded)
 * @param state - The current state (default, error, disabled, read-only)
 * @param iconLeft - Optional icon displayed on the left side
 * @param iconRight - Optional icon displayed on the right side
 * @param className - Additional CSS classes for the input
 * @param containerClassName - Additional CSS classes for the container
 * @param props - All other standard input HTML attributes
 * @returns A styled input element with optional label and helper text
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Digite seu email"
 *   helperText="Usaremos apenas para contato"
 *   size="medium"
 *   variant="outlined"
 *   state="default"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      size = 'medium',
      variant = 'outlined',
      state = 'default',
      iconLeft,
      iconRight,
      className = '',
      containerClassName = '',
      disabled,
      readOnly,
      id,
      ...props
    },
    ref
  ) => {
    // Determine the actual state based on props
    const actualState = disabled
      ? 'disabled'
      : readOnly
        ? 'read-only'
        : errorMessage
          ? 'error'
          : state;

    // Get classes from lookup tables
    const sizeClasses = SIZE_CLASSES[size];
    const stateClasses = STATE_CLASSES[actualState];
    const variantClasses = VARIANT_CLASSES[variant];

    const baseClasses =
      'bg-background w-full py-2 px-3 font-normal text-text-900 focus:outline-primary-950';

    // Icon sizing based on input size
    const iconSizeClasses = {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6',
      'extra-large': 'w-7 h-7',
    };

    const iconSize = iconSizeClasses[size];

    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`${containerClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block font-bold text-text-900 mb-1.5 ${sizeClasses}`}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {iconLeft && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <span
                className={`${iconSize} text-text-400 flex items-center justify-center`}
              >
                {iconLeft}
              </span>
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={`${baseClasses} ${sizeClasses} ${stateClasses} ${variantClasses} ${
              iconLeft ? 'pl-10' : ''
            } ${iconRight ? 'pr-10' : ''} ${className}`}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={actualState === 'error' ? 'true' : undefined}
            {...props}
          />

          {/* Right Icon */}
          {iconRight && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <span
                className={`${iconSize} text-text-400 flex items-center justify-center`}
              >
                {iconRight}
              </span>
            </div>
          )}
        </div>

        {/* Helper Text or Error Message */}
        <div className="mt-1.5 gap-1.5">
          {helperText && <p className="text-sm text-text-500">{helperText}</p>}
          {errorMessage && (
            <p className="flex gap-1 items-center text-sm text-error-500">
              <WarningCircle size={16} /> {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
