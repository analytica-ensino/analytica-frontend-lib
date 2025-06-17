'use client';

import {
  TextareaHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
  useId,
  ChangeEvent,
} from 'react';
import { Text } from '../Text/Text';

/**
 * TextArea size variants
 */
type TextAreaSize = 'small' | 'medium' | 'large' | 'extraLarge';

/**
 * TextArea visual state
 */
type TextAreaState = 'default' | 'hovered' | 'focusedAndTyping' | 'invalid' | 'disabled';

/**
 * Size configurations using Tailwind classes
 */
const SIZE_CLASSES = {
  small: {
    textarea: 'h-24 text-sm', // 96px height
    textSize: 'sm' as const,
    padding: 'p-3', // 12px padding
  },
  medium: {
    textarea: 'h-24 text-md', // 96px height
    textSize: 'md' as const,
    padding: 'p-3', // 12px padding
  },
  large: {
    textarea: 'h-24 text-lg', // 96px height
    textSize: 'lg' as const,
    padding: 'p-3', // 12px padding
  },
  extraLarge: {
    textarea: 'h-24 text-xl', // 96px height
    textSize: 'xl' as const,
    padding: 'p-3', // 12px padding
  },
} as const;

/**
 * Base textarea styling classes using design system colors
 */
const BASE_TEXTAREA_CLASSES =
  'w-full rounded border transition-all duration-200 resize-none focus:outline-none placeholder:text-text-600 font-roboto leading-[150%]';

/**
 * State-based styling classes using design system colors from styles.css
 */
const STATE_CLASSES = {
  default: {
    base: 'border-border-300 bg-background text-text-600',
    hover: 'hover:border-border-400',
    focus: 'focus:border-border-400',
  },
  hovered: {
    base: 'border-border-400 bg-background text-text-600',
    hover: '',
    focus: 'focus:border-border-500',
  },
  focusedAndTyping: {
    base: 'border-primary-500 bg-background text-text-900 ring-2 ring-primary-500/20',
    hover: '',
    focus: '',
  },
  invalid: {
    base: 'border-error-600 bg-background text-text-900 ring-2 ring-error-600/20',
    hover: 'hover:border-error-700',
    focus: 'focus:border-error-700',
  },
  disabled: {
    base: 'border-border-300 bg-background text-text-600 cursor-not-allowed opacity-40',
    hover: '',
    focus: '',
  },
} as const;

/**
 * TextArea component props interface
 */
export type TextAreaProps = {
  /** Label text to display above the textarea */
  label?: ReactNode;
  /** Size variant of the textarea */
  size?: TextAreaSize;
  /** Visual state of the textarea */
  state?: TextAreaState;
  /** Error message to display */
  errorMessage?: string;
  /** Helper text to display */
  helperText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Label CSS classes */
  labelClassName?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

/**
 * TextArea component for Analytica Ensino platforms
 *
 * A textarea component with essential states, sizes and themes.
 * Uses the Analytica Ensino Design System colors from styles.css with automatic
 * light/dark mode support. Includes Text component integration for consistent typography.
 *
 * @example
 * ```tsx
 * // Basic textarea
 * <TextArea label="Description" placeholder="Enter description..." />
 *
 * // Small size
 * <TextArea size="small" label="Comment" />
 *
 * // Invalid state
 * <TextArea state="invalid" label="Required field" errorMessage="This field is required" />
 *
 * // Disabled state
 * <TextArea disabled label="Read-only field" />
 * ```
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      size = 'medium',
      state = 'default',
      errorMessage,
      helperText,
      className = '',
      labelClassName = '',
      disabled,
      id,
      onChange,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `textarea-${generatedId}`;

    // Internal state for focus tracking
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(() => {
      const initialValue = props.value || props.defaultValue || '';
      return Boolean(String(initialValue).trim());
    });

    // Handle change events
    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(Boolean(event.target.value.trim()));
      onChange?.(event);
    };

    // Handle focus events
    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(event);
    };

    // Handle blur events
    const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      props.onBlur?.(event);
    };

    // Determine current state based on props and focus
    let currentState = disabled ? 'disabled' : state;

    // Override state for focused and typing
    if (isFocused && hasValue && currentState !== 'invalid' && currentState !== 'disabled') {
      currentState = 'focusedAndTyping';
    }

    // Get size classes
    const sizeClasses = SIZE_CLASSES[size];

    // Get styling classes
    const stateClasses = STATE_CLASSES[currentState];

    // Get final textarea classes
    const textareaClasses = `${BASE_TEXTAREA_CLASSES} ${sizeClasses.textarea} ${sizeClasses.padding} ${stateClasses.base} ${stateClasses.hover} ${stateClasses.focus} ${className}`;

    return (
      <div className="flex flex-col w-full">
        {/* Label */}
        {label && (
          <Text
            as="label"
            htmlFor={inputId}
            size={sizeClasses.textSize}
            weight="medium"
            color="black"
            className={`mb-1.5 ${labelClassName}`}
          >
            {label}
          </Text>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={textareaClasses}
          placeholder={placeholder}
          {...props}
        />

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

TextArea.displayName = 'TextArea';
