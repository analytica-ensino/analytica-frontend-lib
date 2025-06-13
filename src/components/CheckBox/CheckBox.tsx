import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

/**
 * CheckBox size variants
 */
type CheckBoxSize = 'small' | 'medium' | 'large';

/**
 * CheckBox visual state
 */
type CheckBoxState = 'default' | 'hovered' | 'focused' | 'invalid' | 'disabled';

/**
 * CheckBox theme variants
 */
type CheckBoxTheme = 'light' | 'dark';

/**
 * CheckBox color variants
 */
type CheckBoxVariant = 'primary' | 'success' | 'error' | 'info' | 'warning';

/**
 * Lookup table for size classes
 */
const SIZE_CLASSES = {
  small: {
    checkbox: 'w-4 h-4',
    label: 'text-sm',
    spacing: 'gap-2',
  },
  medium: {
    checkbox: 'w-5 h-5',
    label: 'text-md',
    spacing: 'gap-2.5',
  },
  large: {
    checkbox: 'w-6 h-6',
    label: 'text-lg',
    spacing: 'gap-3',
  },
} as const;

/**
 * Base checkbox styling classes
 */
const BASE_CHECKBOX_CLASSES = 'rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center focus:ring-2 focus:ring-offset-2';

/**
 * Variant-based color classes following Figma specifications
 */
const VARIANT_CLASSES = {
  primary: {
    unchecked: 'border-border-300 bg-background hover:border-primary-500 hover:bg-background-50 focus:border-indicator-info focus:ring-indicator-info/20 active:border-primary-600',
    checked: 'border-primary-950 bg-primary-950 text-text hover:border-primary-800 hover:bg-primary-800 focus:border-indicator-info focus:ring-indicator-info/20 active:border-primary-900 active:bg-primary-900',
    indeterminate: 'border-primary-950 bg-primary-950 text-text hover:border-primary-800 hover:bg-primary-800 focus:border-indicator-info focus:ring-indicator-info/20 active:border-primary-900 active:bg-primary-900',
  },
  success: {
    unchecked: 'border-border-300 bg-background hover:border-success-500 hover:bg-success-50 focus:border-indicator-info focus:ring-indicator-info/20 active:border-success-600',
    checked: 'border-success-500 bg-success-500 text-text hover:border-success-600 hover:bg-success-600 focus:border-indicator-info focus:ring-indicator-info/20 active:border-success-700 active:bg-success-700',
    indeterminate: 'border-success-500 bg-success-500 text-text hover:border-success-600 hover:bg-success-600 focus:border-indicator-info focus:ring-indicator-info/20 active:border-success-700 active:bg-success-700',
  },
  error: {
    unchecked: 'border-border-300 bg-background hover:border-error-500 hover:bg-error-50 focus:border-indicator-info focus:ring-indicator-info/20 active:border-error-600',
    checked: 'border-error-500 bg-error-500 text-text hover:border-error-600 hover:bg-error-600 focus:border-indicator-info focus:ring-indicator-info/20 active:border-error-700 active:bg-error-700',
    indeterminate: 'border-error-500 bg-error-500 text-text hover:border-error-600 hover:bg-error-600 focus:border-indicator-info focus:ring-indicator-info/20 active:border-error-700 active:bg-error-700',
  },
  info: {
    unchecked: 'border-border-300 bg-background hover:border-info-500 hover:bg-info-50 focus:border-indicator-info focus:ring-indicator-info/20 active:border-info-600',
    checked: 'border-info-500 bg-info-500 text-text hover:border-info-600 hover:bg-info-600 focus:border-indicator-info focus:ring-indicator-info/20 active:border-info-700 active:bg-info-700',
    indeterminate: 'border-info-500 bg-info-500 text-text hover:border-info-600 hover:bg-info-600 focus:border-indicator-info focus:ring-indicator-info/20 active:border-info-700 active:bg-info-700',
  },
  warning: {
    unchecked: 'border-border-300 bg-background hover:border-warning-500 hover:bg-warning-50 focus:border-indicator-info focus:ring-indicator-info/20 active:border-warning-600',
    checked: 'border-warning-500 bg-warning-500 text-text hover:border-warning-600 hover:bg-warning-600 focus:border-indicator-info focus:ring-indicator-info/20 active:border-warning-700 active:bg-warning-700',
    indeterminate: 'border-warning-500 bg-warning-500 text-text hover:border-warning-600 hover:bg-warning-600 focus:border-indicator-info focus:ring-indicator-info/20 active:border-warning-700 active:bg-warning-700',
  },
} as const;

/**
 * State-based styling classes following Figma specifications
 */
const STATE_OVERRIDES = {
  invalid: {
    unchecked: 'border-error-500 bg-background hover:border-error-600 hover:bg-error-50 focus:border-error-500 focus:ring-error-500/20 active:border-error-700',
    checked: 'border-error-500 bg-error-500 text-text hover:border-error-600 hover:bg-error-600 focus:border-error-500 focus:ring-error-500/20 active:border-error-700 active:bg-error-700',
    indeterminate: 'border-error-500 bg-error-500 text-text hover:border-error-600 hover:bg-error-600 focus:border-error-500 focus:ring-error-500/20 active:border-error-700 active:bg-error-700',
  },
  disabled: {
    unchecked: 'border-border-200 bg-background-100 cursor-not-allowed opacity-50',
    checked: 'border-border-200 bg-background-300 text-text-400 cursor-not-allowed opacity-50',
    indeterminate: 'border-border-200 bg-background-300 text-text-400 cursor-not-allowed opacity-50',
  },
} as const;

/**
 * CheckBox component props interface
 */
export type CheckBoxProps = {
  /** Label text to display next to the checkbox */
  label?: ReactNode;
  /** Size variant of the checkbox */
  size?: CheckBoxSize;
  /** Visual state of the checkbox */
  state?: CheckBoxState;
  /** Theme variant */
  theme?: CheckBoxTheme;
  /** Color variant of the checkbox */
  variant?: CheckBoxVariant;
  /** Indeterminate state for partial selections */
  indeterminate?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Helper text to display */
  helperText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Label CSS classes */
  labelClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>;

/**
 * CheckBox component for Analytica Ensino platforms
 *
 * A flexible checkbox component with multiple states, sizes and themes.
 * Supports indeterminate state for hierarchical selections and full accessibility.
 * Fully compatible with Next.js 15 and React 19.
 *
 * @param label - The label text to display next to the checkbox
 * @param size - The size variant (small, medium, large)
 * @param state - The visual state (default, invalid, disabled)
 * @param theme - The theme variant (light, dark)
 * @param variant - The color variant (primary, success, error, info, warning)
 * @param indeterminate - Whether the checkbox is in indeterminate state
 * @param errorMessage - Error message to display below checkbox
 * @param helperText - Helper text to display below checkbox
 * @param className - Additional CSS classes for the checkbox
 * @param labelClassName - Additional CSS classes for the label
 * @param props - All other standard input HTML attributes
 * @returns A styled checkbox element with label and accessibility features
 *
  * @example
 * ```tsx
 * // Basic checkbox
 * <CheckBox
 *   label="Accept terms and conditions"
 *   size="medium"
 *   checked={accepted}
 *   onChange={(e) => setAccepted(e.target.checked)}
 * />
 *
 * // Success variant
 * <CheckBox
 *   label="Task completed"
 *   variant="success"
 *   checked={taskDone}
 *   onChange={handleTaskToggle}
 * />
 *
 * // Indeterminate state for hierarchical selection
 * <CheckBox
 *   label="Select all items"
 *   indeterminate={someSelected}
 *   checked={allSelected}
 *   onChange={handleSelectAll}
 * />
 *
 * // With error message
 * <CheckBox
 *   label="Required field"
 *   state="invalid"
 *   errorMessage="This field is required"
 * />
 * ```
 */
export const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(({
  label,
  size = 'medium',
  state = 'default',
  theme = 'light',
  variant = 'primary',
  indeterminate = false,
  errorMessage,
  helperText,
  className = '',
  labelClassName = '',
  checked,
  disabled,
  id,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Determine current state based on props
  const currentState = disabled ? 'disabled' : state;

  // Get size classes
  const sizeClasses = SIZE_CLASSES[size];

  // Determine checkbox visual variant
  const checkVariant = indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked';

  // Get styling classes - state overrides variant
  let stylingClasses;
  if (currentState === 'invalid' || currentState === 'disabled') {
    stylingClasses = STATE_OVERRIDES[currentState][checkVariant];
  } else {
    stylingClasses = VARIANT_CLASSES[variant][checkVariant];
  }

  // Get final checkbox classes
  const checkboxClasses = `${BASE_CHECKBOX_CLASSES} ${sizeClasses.checkbox} ${stylingClasses} ${className}`;

  // Check icon for checked state
  const CheckIcon = (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  // Indeterminate icon
  const IndeterminateIcon = (
    <svg
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M6 12h12"
      />
    </svg>
  );

  return (
    <div className="flex flex-col">
      <label
        htmlFor={inputId}
        className={`inline-flex items-start ${sizeClasses.spacing} cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div className={checkboxClasses}>
            {indeterminate ? IndeterminateIcon : checked ? CheckIcon : null}
          </div>
        </div>

        {label && (
          <span
            className={`${sizeClasses.label} ${
              disabled ? 'text-text-400 cursor-not-allowed' : 'text-text-950'
            } ${labelClassName}`}
          >
            {label}
          </span>
        )}
      </label>

      {/* Error message */}
      {errorMessage && (
        <div className={`mt-1 ${sizeClasses.spacing}`}>
          <div className="flex-shrink-0" style={{ width: sizeClasses.checkbox.split(' ')[0] }} />
          <span className="text-sm text-error-500">{errorMessage}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !errorMessage && (
        <div className={`mt-1 ${sizeClasses.spacing}`}>
          <div className="flex-shrink-0" style={{ width: sizeClasses.checkbox.split(' ')[0] }} />
          <span className="text-sm text-text-600">{helperText}</span>
        </div>
      )}
    </div>
  );
});

CheckBox.displayName = 'CheckBox';
