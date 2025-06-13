import React, {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
} from 'react';
import { Text } from '../Text/Text';

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
 * Size configurations
 */
const SIZE_CLASSES = {
  small: {
    checkbox: 'w-4 h-4', // 16px x 16px
    textSize: 'sm' as const,
    spacing: 'gap-1.5', // 6px
    borderWidth: 'border-2',
    iconSize: 'w-[13px] h-[13px]',
  },
  medium: {
    checkbox: 'w-5 h-5', // 20px x 20px
    textSize: 'md' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-2',
    iconSize: 'w-[17px] h-4', // 17px x 16px
  },
  large: {
    checkbox: 'w-6 h-6', // 24px x 24px
    textSize: 'lg' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-[3px]',
    iconSize: 'w-[19px] h-[18px]',
  },
} as const;

/**
 * Base checkbox styling classes
 */
const BASE_CHECKBOX_CLASSES =
  'rounded border cursor-pointer transition-all duration-200 flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:outline-none';

/**
 * State-based styling classes for unchecked and checked variants
 * Using design system variables from styles.css and specific design colors
 */
const STATE_CLASSES = {
  default: {
    unchecked:
      'border-border-400 bg-background hover:border-border-500 hover:bg-background-50',
    checked:
      'border-primary-800 bg-primary-800 text-text hover:border-primary-700 hover:bg-primary-700',
  },
  hovered: {
    unchecked: 'border-border-500 bg-background-50',
    checked: 'border-primary-700 bg-primary-700 text-text',
  },
  focused: {
    unchecked:
      'border-indicator-info bg-background focus:ring-indicator-info/20',
    checked:
      'border-indicator-info bg-primary-800 text-text focus:ring-indicator-info/20',
  },
  invalid: {
    unchecked: 'border-[#B91C1C] bg-background hover:border-error-700',
    checked: 'border-[#B91C1C] bg-[#1C61B2] text-[#FEFEFF]',
  },
  disabled: {
    unchecked: 'border-border-400 bg-background cursor-not-allowed',
    checked: 'border-[#292929] bg-[#292929] text-[#FEFEFF] cursor-not-allowed',
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
  _theme?: CheckBoxTheme;
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
export const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  (
    {
      label,
      size = 'medium',
      state = 'default',
      _theme = 'light',
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
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Handle controlled vs uncontrolled behavior
    const [internalChecked, setInternalChecked] = useState(false);
    const isControlled = checkedProp !== undefined;
    const checked = isControlled ? checkedProp : internalChecked;

    // Handle change events
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Get final checkbox classes
    const checkboxClasses = `${BASE_CHECKBOX_CLASSES} ${sizeClasses.checkbox} ${sizeClasses.borderWidth} ${stylingClasses} ${className}`;

    // Determine text color based on state and checked status
    const getTextColorClass = () => {
      if (disabled && checked) {
        return 'text-text-900'; // #262627
      }
      if (state === 'invalid') {
        return 'text-text-900'; // #262627 para todos os tamanhos no estado invalid
      }
      return 'text-text-600'; // #737373
    };

    // Determine label height based on size
    const getLabelHeight = () => {
      if (size === 'large') {
        return 'h-[27px]';
      }
      if (size === 'medium') {
        return 'h-6'; // 24px
      }
      return 'h-[21px]';
    };

    // Determine line height based on size
    const getLineHeight = () => {
      if (size === 'large') {
        return 'leading-[27px]';
      }
      if (size === 'medium') {
        return 'leading-[150%]'; // 150% line height for 16px font = 24px
      }
      return 'leading-[150%]'; // 150% line height for 14px font = 21px
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
          <label
            htmlFor={inputId}
            className={`${checkboxClasses} relative box-border`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Show appropriate icon based on state */}
              {indeterminate ? (
                <svg
                  className={`${sizeClasses.iconSize}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M20 12H4"
                  />
                </svg>
              ) : checked ? (
                <svg
                  className={`${sizeClasses.iconSize}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={
                    size === 'small'
                      ? { position: 'absolute', top: '1.5px' }
                      : undefined
                  }
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : null}
            </div>
          </label>

          {/* Label text */}
          {label && (
            <div
              className={`flex flex-row items-center ${
                size === 'small' ? 'justify-end' : ''
              } ${getLabelHeight()}`}
            >
              <Text
                as="label"
                htmlFor={inputId}
                size={sizeClasses.textSize}
                weight="normal"
                className={`cursor-pointer select-none ${getLineHeight()} flex items-center font-roboto ${getTextColorClass()} ${
                  disabled ? 'cursor-not-allowed' : ''
                } ${labelClassName}`}
              >
                {label}
              </Text>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <Text size="sm" weight="normal" className="mt-1.5 text-error-600">
            {errorMessage}
          </Text>
        )}

        {/* Helper text */}
        {helperText && !errorMessage && (
          <Text size="sm" weight="normal" className="mt-1.5 text-text-500">
            {helperText}
          </Text>
        )}
      </div>
    );
  }
);

CheckBox.displayName = 'CheckBox';
