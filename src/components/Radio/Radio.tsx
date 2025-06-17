'use client';

import React, {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
  useId,
  ChangeEvent,
} from 'react';
import Text from '../Text/Text';

/**
 * Radio size variants
 */
type RadioSize = 'small' | 'medium' | 'large' | 'extraLarge';

/**
 * Radio visual state
 */
type RadioState = 'default' | 'hovered' | 'focused' | 'invalid' | 'disabled';

/**
 * Size configurations using Tailwind classes
 */
const SIZE_CLASSES = {
  small: {
    radio: 'w-4 h-4', // 16px x 16px
    textSize: 'sm' as const,
    spacing: 'gap-1.5', // 6px
    borderWidth: 'border-2',
    dotSize: 'w-1.5 h-1.5', // 6px inner dot
    labelHeight: 'h-[21px]',
  },
  medium: {
    radio: 'w-5 h-5', // 20px x 20px
    textSize: 'md' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-2',
    dotSize: 'w-2 h-2', // 8px inner dot
    labelHeight: 'h-6',
  },
  large: {
    radio: 'w-6 h-6', // 24px x 24px
    textSize: 'lg' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-[3px]', // 3px border
    dotSize: 'w-2.5 h-2.5', // 10px inner dot
    labelHeight: 'h-[27px]',
  },
  extraLarge: {
    radio: 'w-7 h-7', // 28px x 28px
    textSize: 'xl' as const,
    spacing: 'gap-3', // 12px
    borderWidth: 'border-[3px]', // 3px border
    dotSize: 'w-3 h-3', // 12px inner dot
    labelHeight: 'h-8',
  },
} as const;

/**
 * Base radio styling classes using design system colors
 */
const BASE_RADIO_CLASSES =
  'rounded-full border cursor-pointer transition-all duration-200 flex items-center justify-center focus:outline-none';

/**
 * State-based styling classes using design system colors from styles.css
 */
const STATE_CLASSES = {
  default: {
    unchecked: 'border-border-400 bg-background hover:border-border-500',
    checked:
      'border-primary-950 bg-background hover:border-primary-800',
  },
  hovered: {
    unchecked: 'border-border-500 bg-background',
    checked: 'border-primary-800 bg-background',
  },
  focused: {
    unchecked:
      'border-indicator-info bg-background ring-2 ring-indicator-info/20',
    checked:
      'border-indicator-info bg-background ring-2 ring-indicator-info/20',
  },
  invalid: {
    unchecked: 'border-error-700 bg-background hover:border-error-600',
    checked: 'border-error-700 bg-background',
  },
  disabled: {
    unchecked: 'border-border-400 bg-background cursor-not-allowed opacity-40',
    checked: 'border-primary-600 bg-background cursor-not-allowed opacity-40',
  },
} as const;

/**
 * Dot styling classes for the inner dot when checked
 */
const DOT_CLASSES = {
  default: 'bg-primary-950',
  hovered: 'bg-primary-800',
  focused: 'bg-primary-950',
  invalid: 'bg-error-700',
  disabled: 'bg-primary-600',
} as const;

/**
 * Radio component props interface
 */
export type RadioProps = {
  /** Label text to display next to the radio */
  label?: ReactNode;
  /** Size variant of the radio */
  size?: RadioSize;
  /** Visual state of the radio */
  state?: RadioState;
  /** Error message to display */
  errorMessage?: string;
  /** Helper text to display */
  helperText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Label CSS classes */
  labelClassName?: string;
  /** Radio group name */
  name?: string;
  /** Radio value */
  value?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>;

/**
 * Radio component for Analytica Ensino platforms
 *
 * A radio button component with essential states, sizes and themes.
 * Uses the Analytica Ensino Design System colors from styles.css with automatic
 * light/dark mode support. Includes Text component integration for consistent typography.
 *
 * @example
 * ```tsx
 * // Basic radio
 * <Radio name="option" value="1" label="Option 1" />
 *
 * // Small size
 * <Radio size="small" name="option" value="2" label="Small option" />
 *
 * // Invalid state
 * <Radio state="invalid" name="option" value="3" label="Required field" />
 *
 * // Disabled state
 * <Radio disabled name="option" value="4" label="Disabled option" />
 * ```
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      size = 'medium',
      state = 'default',
      errorMessage,
      helperText,
      className = '',
      labelClassName = '',
      checked: checkedProp,
      disabled,
      id,
      name,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `radio-${generatedId}`;

    // Internal state for focus tracking
    const [isFocused, setIsFocused] = useState(false);

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

    // Handle focus events
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(event);
    };

    // Handle blur events
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(event);
    };

    // Determine current state based on props and focus
    let currentState = disabled ? 'disabled' : state;

    // Override state based on focus
    if (
      isFocused &&
      currentState !== 'invalid' &&
      currentState !== 'disabled'
    ) {
      currentState = 'focused';
    }

    // Get size classes
    const sizeClasses = SIZE_CLASSES[size];

    // Determine radio visual variant
    const radioVariant = checked ? 'checked' : 'unchecked';

    // Get styling classes
    const stylingClasses = STATE_CLASSES[currentState][radioVariant];

    // Special border width handling for focused/hovered states and large sizes
    const borderWidthClass =
      state === 'focused' ||
      (state === 'hovered' && (size === 'large' || size === 'extraLarge'))
        ? 'border-[3px]'
        : sizeClasses.borderWidth;

    // Get final radio classes
    const radioClasses = `${BASE_RADIO_CLASSES} ${sizeClasses.radio} ${borderWidthClass} ${stylingClasses} ${className}`;

    // Get dot classes
    const dotClasses = `${sizeClasses.dotSize} rounded-full ${DOT_CLASSES[currentState]} transition-all duration-200`;

    return (
      <div className="flex flex-col">
        <div
          className={`flex flex-row items-center ${sizeClasses.spacing} ${disabled ? 'opacity-40' : ''}`}
        >
          {/* Hidden native input for accessibility and form submission */}
          <input
            ref={ref}
            type="radio"
            id={inputId}
            checked={checked}
            disabled={disabled}
            name={name}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="sr-only"
            {...props}
          />

          {/* Custom styled radio */}
          <label htmlFor={inputId} className={radioClasses}>
            {/* Show dot when checked */}
            {checked && <div className={dotClasses} />}
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
                color={currentState === 'disabled' ? 'text-text-600' : 'text-text-900'}
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

Radio.displayName = 'Radio';

export default Radio;
