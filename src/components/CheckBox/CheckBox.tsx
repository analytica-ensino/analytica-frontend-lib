'use client';

import {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
  useId,
  ChangeEvent,
} from 'react';
import Text from '../Text/Text';
import { Check, Minus } from 'phosphor-react';

/**
 * CheckBox size variants
 */
type CheckBoxSize = 'small' | 'medium' | 'large';

/**
 * CheckBox visual state
 */
type CheckBoxState = 'default' | 'hovered' | 'focused' | 'invalid' | 'disabled';

/**
 * Size configurations using Tailwind classes
 */
const SIZE_CLASSES = {
  small: {
    checkbox: 'w-4 h-4', // 16px x 16px
    textSize: 'sm' as const,
    spacing: 'gap-1.5', // 6px
    borderWidth: 'border-2',
    iconSize: 14, // pixels for Phosphor icons
    labelHeight: 'h-[21px]',
  },
  medium: {
    checkbox: 'w-5 h-5', // 20px x 20px
    textSize: 'md' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-2',
    iconSize: 16, // pixels for Phosphor icons
    labelHeight: 'h-6',
  },
  large: {
    checkbox: 'w-6 h-6', // 24px x 24px
    textSize: 'lg' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-[3px]', // 3px border
    iconSize: 20, // pixels for Phosphor icons
    labelHeight: 'h-[27px]',
  },
} as const;

/**
 * Base checkbox styling classes using design system colors
 */
const BASE_CHECKBOX_CLASSES =
  'rounded border cursor-pointer transition-all duration-200 flex items-center justify-center focus:outline-none';

/**
 * State-based styling classes using design system colors from styles.css
 */
const STATE_CLASSES = {
  default: {
    unchecked: 'border-border-400 bg-background hover:border-border-500',
    checked:
      'border-primary-950 bg-primary-950 text-text hover:border-primary-800 hover:bg-primary-800',
  },
  hovered: {
    unchecked: 'border-border-500 bg-background',
    checked: 'border-primary-800 bg-primary-800 text-text',
  },
  focused: {
    unchecked:
      'border-indicator-info bg-background ring-2 ring-indicator-info/20',
    checked:
      'border-indicator-info bg-primary-950 text-text ring-2 ring-indicator-info/20',
  },
  invalid: {
    unchecked: 'border-error-700 bg-background hover:border-error-600',
    checked: 'border-error-700 bg-primary-950 text-text',
  },
  disabled: {
    unchecked: 'border-border-400 bg-background cursor-not-allowed opacity-40',
    checked:
      'border-primary-600 bg-primary-600 text-text cursor-not-allowed opacity-40',
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
 * A checkbox component with essential states, sizes and themes.
 * Uses the Analytica Ensino Design System colors from styles.css with automatic
 * light/dark mode support. Includes Text component integration for consistent typography.
 *
 * @example
 * ```tsx
 * // Basic checkbox
 * <CheckBox label="Option" />
 *
 * // Small size
 * <CheckBox size="small" label="Small option" />
 *
 * // Invalid state
 * <CheckBox state="invalid" label="Required field" />
 *
 * // Disabled state
 * <CheckBox disabled label="Disabled option" />
 * ```
 */
const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  (
    {
      label,
      size = 'medium',
      state = 'default',
      indeterminate = false,
      errorMessage,
      helperText,
      className = '',
      labelClassName = '',
      checked: checkedProp,
      disabled,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `checkbox-${generatedId}`;

    // Handle controlled vs uncontrolled behavior
    const [internalChecked, setInternalChecked] = useState(false);
    const isControlled = checkedProp !== undefined;
    const checked = isControlled ? checkedProp : internalChecked;

    // Handle change events
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(event.target.checked);
      }
      onChange?.(event);
    };

    // Determine current state based on props
    const currentState = disabled ? 'disabled' : state;

    // Get size classes
    const sizeClasses = SIZE_CLASSES[size];

    // Determine checkbox visual variant
    const checkVariant = checked || indeterminate ? 'checked' : 'unchecked';

    // Get styling classes
    const stylingClasses = STATE_CLASSES[currentState][checkVariant];

    // Special border width handling for focused/hovered states and large size
    const borderWidthClass =
      state === 'focused' || (state === 'hovered' && size === 'large')
        ? 'border-[3px]'
        : sizeClasses.borderWidth;

    // Get final checkbox classes
    const checkboxClasses = `${BASE_CHECKBOX_CLASSES} ${sizeClasses.checkbox} ${borderWidthClass} ${stylingClasses} ${className}`;

    // Render appropriate icon based on state
    const renderIcon = () => {
      if (indeterminate) {
        return (
          <Minus
            size={sizeClasses.iconSize}
            weight="bold"
            color="currentColor"
          />
        );
      }

      if (checked) {
        return (
          <Check
            size={sizeClasses.iconSize}
            weight="bold"
            color="currentColor"
          />
        );
      }

      return null;
    };

    return (
      <div className="flex flex-col">
        <div
          className={`flex flex-row items-center ${sizeClasses.spacing} ${disabled ? 'opacity-40' : ''}`}
        >
          {/* Hidden native input for accessibility and form submission */}
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only"
            {...props}
          />

          {/* Custom styled checkbox */}
          <label htmlFor={inputId} className={checkboxClasses}>
            {/* Show appropriate icon based on state */}
            {renderIcon()}
          </label>

          {/* Label text */}
          {label && (
            <div
              className={`flex flex-row items-center ${sizeClasses.labelHeight}`}
            >
              <Text
                as="label"
                htmlFor={inputId}
                size={sizeClasses.textSize}
                weight="normal"
                className={`cursor-pointer select-none leading-[150%] flex items-center font-roboto ${labelClassName}`}
              >
                {label}
              </Text>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <Text
            size="sm"
            weight="normal"
            className="mt-1.5"
            color="text-error-600"
          >
            {errorMessage}
          </Text>
        )}

        {/* Helper text */}
        {helperText && !errorMessage && (
          <Text
            size="sm"
            weight="normal"
            className="mt-1.5"
            color="text-text-500"
          >
            {helperText}
          </Text>
        )}
      </div>
    );
  }
);

CheckBox.displayName = 'CheckBox';

export default CheckBox;
