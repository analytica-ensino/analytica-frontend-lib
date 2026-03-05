import {
  TextareaHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
  useId,
  useEffect,
  useRef,
  useImperativeHandle,
  ChangeEvent,
  FocusEvent,
} from 'react';
import { WarningCircle } from 'phosphor-react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

/**
 * TextArea size variants
 */
type TextAreaSize = 'small' | 'medium' | 'large' | 'extraLarge';

/**
 * TextArea visual state
 */
type TextAreaState = 'default' | 'hovered' | 'focused' | 'invalid' | 'disabled';

/**
 * Size configurations with exact pixel specifications
 */
const SIZE_CLASSES = {
  small: {
    textarea: 'h-24 text-sm', // 96px height, 14px font
    textSize: 'sm' as const,
  },
  medium: {
    textarea: 'h-24 text-base', // 96px height, 16px font
    textSize: 'md' as const,
  },
  large: {
    textarea: 'h-24 text-lg', // 96px height, 18px font
    textSize: 'lg' as const,
  },
  extraLarge: {
    textarea: 'h-24 text-xl', // 96px height, 20px font
    textSize: 'xl' as const,
  },
} as const;

/**
 * Base textarea styling classes using design system colors
 */
const BASE_TEXTAREA_CLASSES =
  'w-full box-border p-3 bg-background border border-solid rounded-[4px] resize-none focus:outline-none font-roboto font-normal leading-[150%] placeholder:text-text-600 transition-all duration-200';

/**
 * State-based styling classes using design system colors from styles.css
 */
const STATE_CLASSES = {
  default: {
    base: 'border-border-300 bg-background text-text-600',
    hover: 'hover:border-border-400',
    focus: 'focus:border-border-500',
  },
  hovered: {
    base: 'border-border-400 bg-background text-text-600',
    hover: '',
    focus: 'focus:border-border-500',
  },
  focused: {
    base: 'border-2 border-primary-950 bg-background text-text-900',
    hover: '',
    focus: '',
  },
  invalid: {
    base: 'border-2 border-red-700 bg-white text-gray-800',
    hover: 'hover:border-red-700',
    focus: 'focus:border-red-700',
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
  helperMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Label CSS classes */
  labelClassName?: string;
  /** Show character count when maxLength is provided */
  showCharacterCount?: boolean;
  /** Enable auto-resize based on content */
  autoResize?: boolean;
  /** Minimum height when autoResize is enabled (default: 96px) */
  minHeight?: number;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

/**
 * TextArea component for Analytica Ensino platforms
 *
 * A textarea component with essential states, sizes and themes.
 * Uses exact design specifications with 288px width, 96px height, and specific
 * color values. Includes Text component integration for consistent typography.
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
 *
 * // Auto-resize textarea
 * <TextArea autoResize minHeight={200} placeholder="Grows with content..." />
 * ```
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      size = 'medium',
      state = 'default',
      errorMessage,
      helperMessage,
      className = '',
      labelClassName = '',
      disabled,
      id,
      onChange,
      placeholder,
      required,
      showCharacterCount = false,
      maxLength,
      value,
      autoResize = false,
      minHeight = 96,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `textarea-${generatedId}`;

    // Internal ref for auto-resize
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // Expose ref to parent
    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    // Internal state for focus tracking
    const [isFocused, setIsFocused] = useState(false);

    // Calculate current character count
    const currentLength = typeof value === 'string' ? value.length : 0;
    const isNearLimit = maxLength && currentLength >= maxLength * 0.8;

    // Auto-resize effect
    useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
      }
    }, [autoResize, minHeight, value]);

    // Handle change events
    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event);
    };

    // Handle focus events
    const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(event);
    };

    // Handle blur events
    const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
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

    // Get styling classes
    const stateClasses = STATE_CLASSES[currentState];

    // Get height classes based on autoResize
    const heightClasses = autoResize
      ? 'h-auto overflow-hidden'
      : sizeClasses.textarea;

    // Get font size from size classes (extract only the text size)
    const fontSizeClass =
      sizeClasses.textarea.split(' ').find((c) => c.startsWith('text-')) ??
      'text-base';

    // Get final textarea classes
    const textareaClasses = cn(
      BASE_TEXTAREA_CLASSES,
      autoResize ? fontSizeClass : sizeClasses.textarea,
      heightClasses,
      stateClasses.base,
      stateClasses.hover,
      stateClasses.focus,
      className
    );

    return (
      <div className={`flex flex-col`}>
        {/* Label */}
        {label && (
          <Text
            as="label"
            htmlFor={inputId}
            size={sizeClasses.textSize}
            weight="medium"
            color="text-text-950"
            className={cn('mb-1.5', labelClassName)}
          >
            {label}{' '}
            {required && <span className="text-indicator-error">*</span>}
          </Text>
        )}

        {/* Textarea */}
        <textarea
          ref={internalRef}
          id={inputId}
          disabled={disabled}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={textareaClasses}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          value={value}
          {...props}
        />

        {/* Error message */}
        {errorMessage && (
          <p className="flex gap-1 items-center text-sm text-indicator-error mt-1.5">
            <WarningCircle size={16} /> {errorMessage}
          </p>
        )}

        {/* Helper text or Character count */}
        {!errorMessage && showCharacterCount && maxLength && (
          <Text
            size="sm"
            weight="normal"
            className={`mt-1.5 ${isNearLimit ? 'text-indicator-warning' : 'text-text-500'}`}
          >
            {currentLength}/{maxLength} caracteres
          </Text>
        )}
        {!errorMessage &&
          helperMessage &&
          !(showCharacterCount && maxLength) && (
            <Text size="sm" weight="normal" className="mt-1.5 text-text-500">
              {helperMessage}
            </Text>
          )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
