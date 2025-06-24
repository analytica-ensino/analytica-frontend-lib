import { WarningCircle, Eye, EyeSlash } from 'phosphor-react';
import {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
  useId,
  useMemo,
} from 'react';

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
  error: 'border-2 border-indicator-error placeholder:text-text-600',
  disabled:
    'border-border-300 placeholder:text-text-600 cursor-not-allowed opacity-40',
  'read-only':
    'border-transparent !text-text-600 cursor-default focus:outline-none bg-transparent',
} as const;

/**
 * Lookup table for variant classes
 */
const VARIANT_CLASSES = {
  outlined: 'border rounded-lg',
  underlined:
    'border-0 border-b rounded-none bg-transparent focus:outline-none focus:border-primary-950 focus:border-b-2',
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
 * Features automatic password visibility toggle for password inputs.
 *
 * @param label - Optional label text displayed above the input
 * @param helperText - Optional helper text displayed below the input
 * @param errorMessage - Optional error message displayed below the input
 * @param size - The size variant (small, medium, large, extra-large)
 * @param variant - The visual variant (outlined, underlined, rounded)
 * @param state - The current state (default, error, disabled, read-only)
 * @param iconLeft - Optional icon displayed on the left side
 * @param iconRight - Optional icon displayed on the right side (overridden by password toggle for password inputs)
 * @param type - Input type (text, email, password, etc.) - password type automatically includes show/hide toggle
 * @param className - Additional CSS classes for the input
 * @param containerClassName - Additional CSS classes for the container
 * @param props - All other standard input HTML attributes
 * @returns A styled input element with optional label and helper text
 *
 * @example
 * ```tsx
 * // Basic input
 * <Input
 *   label="Email"
 *   placeholder="Digite seu email"
 *   helperText="Usaremos apenas para contato"
 *   size="medium"
 *   variant="outlined"
 *   state="default"
 * />
 *
 * // Password input with automatic toggle
 * <Input
 *   label="Senha"
 *   type="password"
 *   placeholder="Digite sua senha"
 *   helperText="Clique no olho para mostrar/ocultar"
 * />
 * ```
 */
// Helper functions to reduce cognitive complexity
const getActualState = (
  disabled?: boolean,
  readOnly?: boolean,
  errorMessage?: string,
  state?: string
): keyof typeof STATE_CLASSES => {
  if (disabled) return 'disabled';
  if (readOnly) return 'read-only';
  if (errorMessage) return 'error';
  return (state as keyof typeof STATE_CLASSES) || 'default';
};

const getIconSize = (size: string) => {
  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
    'extra-large': 'w-7 h-7',
  };
  return (
    iconSizeClasses[size as keyof typeof iconSizeClasses] ||
    iconSizeClasses.medium
  );
};

const getPasswordToggleConfig = (
  type?: string,
  disabled?: boolean,
  readOnly?: boolean,
  showPassword?: boolean,
  iconRight?: ReactNode
) => {
  const isPasswordType = type === 'password';
  const shouldShowPasswordToggle = isPasswordType && !disabled && !readOnly;

  let actualIconRight = iconRight;
  let ariaLabel: string | undefined;

  if (shouldShowPasswordToggle) {
    actualIconRight = showPassword ? <EyeSlash /> : <Eye />;
    ariaLabel = showPassword ? 'Ocultar senha' : 'Mostrar senha';
  }

  return { shouldShowPasswordToggle, actualIconRight, ariaLabel };
};

const getCombinedClasses = (
  actualState: keyof typeof STATE_CLASSES,
  variant: keyof typeof VARIANT_CLASSES
) => {
  const stateClasses = STATE_CLASSES[actualState];
  const variantClasses = VARIANT_CLASSES[variant];

  // Special case: error state with underlined variant
  if (actualState === 'error' && variant === 'underlined') {
    return 'border-0 border-b-2 border-indicator-error rounded-none bg-transparent focus:outline-none focus:border-primary-950 placeholder:text-text-600';
  }

  // Special case: read-only state with underlined variant
  if (actualState === 'read-only' && variant === 'underlined') {
    return 'border-0 border-b-0 rounded-none bg-transparent focus:outline-none !text-text-900 cursor-default';
  }

  return `${stateClasses} ${variantClasses}`;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
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
      type = 'text',
      ...props
    },
    ref
  ) => {
    // State for password visibility toggle
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const actualType = isPasswordType && showPassword ? 'text' : type;
    const actualState = getActualState(disabled, readOnly, errorMessage, state);

    // Get classes from lookup tables
    const sizeClasses = SIZE_CLASSES[size];
    const combinedClasses = useMemo(
      () => getCombinedClasses(actualState, variant),
      [actualState, variant]
    );
    const iconSize = getIconSize(size);

    const baseClasses = `bg-background w-full py-2 ${
      actualState === 'read-only' ? 'px-0' : 'px-3'
    } font-normal text-text-900 focus:outline-primary-950`;

    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;

    // Handle password visibility toggle
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    // Get password toggle configuration
    const { shouldShowPasswordToggle, actualIconRight, ariaLabel } =
      getPasswordToggleConfig(
        type,
        disabled,
        readOnly,
        showPassword,
        iconRight
      );

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
            type={actualType}
            className={`${baseClasses} ${sizeClasses} ${combinedClasses} ${
              iconLeft ? 'pl-10' : ''
            } ${actualIconRight ? 'pr-10' : ''} ${className}`}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={actualState === 'error' ? 'true' : undefined}
            {...props}
          />

          {/* Right Icon */}
          {actualIconRight &&
            (shouldShowPasswordToggle ? (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0"
                onClick={togglePasswordVisibility}
                aria-label={ariaLabel}
              >
                <span
                  className={`${iconSize} text-text-400 flex items-center justify-center hover:text-text-600 transition-colors`}
                >
                  {actualIconRight}
                </span>
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <span
                  className={`${iconSize} text-text-400 flex items-center justify-center`}
                >
                  {actualIconRight}
                </span>
              </div>
            ))}
        </div>

        {/* Helper Text or Error Message */}
        <div className="mt-1.5 gap-1.5">
          {helperText && <p className="text-sm text-text-500">{helperText}</p>}
          {errorMessage && (
            <p className="flex gap-1 items-center text-sm text-indicator-error">
              <WarningCircle size={16} /> {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }
);

export default Input;
