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
    radio: 'w-5 h-5', // 20px x 20px
    textSize: 'sm' as const,
    spacing: 'gap-1.5', // 6px
    borderWidth: 'border-2',
    dotSize: 'w-1.5 h-1.5', // 6px inner dot
    labelHeight: 'h-5',
  },
  medium: {
    radio: 'w-6 h-6', // 24px x 24px
    textSize: 'md' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-2',
    dotSize: 'w-2 h-2', // 8px inner dot
    labelHeight: 'h-6',
  },
  large: {
    radio: 'w-7 h-7', // 28px x 28px
    textSize: 'lg' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-2', // 2px border (consistent with others)
    dotSize: 'w-2.5 h-2.5', // 10px inner dot
    labelHeight: 'h-7',
  },
  extraLarge: {
    radio: 'w-8 h-8', // 32px x 32px (larger than large)
    textSize: 'xl' as const,
    spacing: 'gap-3', // 12px
    borderWidth: 'border-2', // 2px border (consistent with others)
    dotSize: 'w-3 h-3', // 12px inner dot
    labelHeight: 'h-8',
  },
} as const;

/**
 * Focused state maintains the same sizes as default state
 * Only adds wrapper styling, does not change radio/dot sizes
 */

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
    checked: 'border-primary-950 bg-background hover:border-primary-800',
  },
  hovered: {
    unchecked: 'border-border-500 bg-background', // #8C8D8D hover state for unchecked
    checked: 'border-info-700 bg-background', // Adjust checked border for hover
  },
  focused: {
    unchecked: 'border-border-400 bg-background', // #A5A3A3 for unchecked radio
    checked: 'border-primary-950 bg-background', // #124393 for checked radio
  },
  invalid: {
    unchecked: 'border-border-400 bg-background', // #A5A3A3 for unchecked radio
    checked: 'border-primary-950 bg-background', // #124393 for checked radio
  },
  disabled: {
    unchecked: 'border-border-400 bg-background cursor-not-allowed', // #A5A3A3 for unchecked radio
    checked: 'border-primary-950 bg-background cursor-not-allowed', // #124393 for checked radio
  },
} as const;

/**
 * Dot styling classes for the inner dot when checked
 */
const DOT_CLASSES = {
  default: 'bg-primary-950',
  hovered: 'bg-info-700', // #1C61B2 hover state for checked dot
  focused: 'bg-primary-950', // #124393 for focused checked dot
  invalid: 'bg-primary-950', // #124393 for invalid checked dot
  disabled: 'bg-primary-950', // #124393 for disabled checked dot
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
  /** Default checked state for uncontrolled radios */
  defaultChecked?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'defaultChecked'
>;

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
 *
 * // Default checked (uncontrolled)
 * <Radio defaultChecked name="option" value="5" label="Initially checked" />
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
      defaultChecked = false,
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

    // Handle controlled vs uncontrolled behavior
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = checkedProp !== undefined;
    const checked = isControlled ? checkedProp : internalChecked;

    // Handle change events
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onChange?.(event);
    };

    // Determine current state based on props
    const currentState = disabled ? 'disabled' : state;

    // Get size classes
    const sizeClasses = SIZE_CLASSES[size];

    // Focused state maintains original sizes, only adds wrapper
    const actualRadioSize = sizeClasses.radio;
    const actualDotSize = sizeClasses.dotSize;

    // Determine radio visual variant
    const radioVariant = checked ? 'checked' : 'unchecked';

    // Get styling classes
    const stylingClasses = STATE_CLASSES[currentState][radioVariant];

    // Border width logic - consistent across all states and sizes
    const getBorderWidth = () => {
      if (currentState === 'focused') {
        return 'border-2'; // Consistent border for all focused radios inside wrapper
      }
      return sizeClasses.borderWidth;
    };

    const borderWidthClass = getBorderWidth();

    // Get final radio classes
    const radioClasses = `${BASE_RADIO_CLASSES} ${actualRadioSize} ${borderWidthClass} ${stylingClasses} ${className}`;

    // Get dot classes
    const dotClasses = `${actualDotSize} rounded-full ${DOT_CLASSES[currentState]} transition-all duration-200`;

    // Determine if wrapper is needed only for focused or invalid states
    const isWrapperNeeded =
      currentState === 'focused' || currentState === 'invalid';
    const wrapperBorderColor =
      currentState === 'focused'
        ? 'border-indicator-info' // #5399EC for focused
        : 'border-indicator-error'; // #B91C1C for invalid

    // Determine text color based on state and checked status
    const getTextColor = () => {
      if (currentState === 'disabled') {
        return checked ? 'text-text-900' : 'text-text-600'; // #262627 for disabled checked, #737373 for disabled unchecked
      }

      if (currentState === 'focused') {
        return 'text-text-900'; // #262627 for focused (both checked and unchecked)
      }

      return checked ? 'text-text-900' : 'text-text-600'; // #262627 for checked, #737373 for unchecked
    };

    // Determine cursor class based on disabled state
    const getCursorClass = () => {
      return currentState === 'disabled'
        ? 'cursor-not-allowed'
        : 'cursor-pointer';
    };

    return (
      <div className="flex flex-col">
        <div
          className={`flex flex-row items-center ${
            isWrapperNeeded
              ? `p-1 border-2 ${wrapperBorderColor} rounded-lg gap-1.5` // Wrapper apenas para focused/invalid
              : sizeClasses.spacing
          } ${disabled ? 'opacity-40' : ''}`}
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
                className={`${getCursorClass()} select-none leading-normal flex items-center font-roboto ${labelClassName}`}
                color={getTextColor()}
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
