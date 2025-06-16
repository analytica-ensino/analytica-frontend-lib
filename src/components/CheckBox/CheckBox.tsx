import React, {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
  CSSProperties,
  useEffect,
} from 'react';
import { Text } from '../Text/Text';
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
    iconSize: 'w-3 h-3', // 12px x 12px
    phosphorSize: 14,
  },
  medium: {
    checkbox: 'w-5 h-5', // 20px x 20px
    textSize: 'md' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-2',
    iconSize: 'w-4 h-4', // 16px x 16px
    phosphorSize: 16,
  },
  large: {
    checkbox: 'w-6 h-6', // 24px x 24px
    textSize: 'lg' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border',
    iconSize: 'w-5 h-5', // 20px x 20px
    phosphorSize: 20,
  },
} as const;

/**
 * Base checkbox styling classes
 */
const BASE_CHECKBOX_CLASSES =
  'rounded border cursor-pointer transition-all duration-200 flex items-center justify-center focus:ring-2 focus:ring-offset-2 focus:outline-none';

/**
 * Theme colors for light and dark mode
 */
const THEME_COLORS = {
  light: {
    checked: {
      background: '#1C61B2', // primary-800
      border: '#1C61B2',
      iconColor: '#FEFEFF', // text
    },
    hover: {
      background: '#2271C4', // primary-700
      border: '#2271C4',
      iconColor: '#FEFEFF', // text
    },
  },
  dark: {
    checked: {
      background: '#BBDCF7', // primary-100
      border: '#BBDCF7',
      iconColor: '#171717', // text-950
    },
    hover: {
      background: '#BBDCF7', // primary-100
      border: '#BBDCF7',
      iconColor: '#171717', // text-950
    },
  },
};

/**
 * State-based styling classes for unchecked and checked variants
 * Using design system variables from styles.css and specific design colors
 */
const STATE_CLASSES = {
  default: {
    unchecked:
      'border-border-400 bg-background hover:border-border-500 hover:bg-background-50',
    checked:
      'border-primary-800 bg-primary-800 text-text hover:border-primary-700 hover:bg-primary-700 dark:border-primary-100 dark:bg-primary-100 dark:text-text-950',
  },
  hovered: {
    unchecked: 'border-border-500 bg-background-50',
    checked:
      'border-primary-700 bg-primary-700 text-text dark:border-primary-100 dark:bg-primary-100 dark:text-text-950',
  },
  focused: {
    unchecked:
      'border-3 border-indicator-info bg-background focus:ring-indicator-info/20',
    checked:
      'border-3 border-indicator-info bg-primary-800 text-text focus:ring-indicator-info/20 dark:border-primary-100 dark:bg-primary-100 dark:text-text-950',
  },
  invalid: {
    unchecked: 'border-error-700 bg-background hover:border-error-600',
    checked:
      'border-error-700 bg-primary-800 text-text dark:border-primary-100 dark:bg-primary-100 dark:text-text-950',
  },
  disabled: {
    unchecked: 'border-border-400 bg-background cursor-not-allowed opacity-40',
    checked:
      'border-primary-600 bg-primary-600 text-text cursor-not-allowed opacity-40 dark:border-primary-100 dark:bg-primary-100 dark:text-text-950',
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

    // State for detecting dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detect if we're in dark mode by checking parent elements
    useEffect(() => {
      const checkDarkMode = () => {
        // Check if any parent element has data-theme="dark"
        const element = document.getElementById(inputId);
        if (element) {
          let parent = element.parentElement;
          while (parent) {
            if (parent.getAttribute('data-theme') === 'dark') {
              setIsDarkMode(true);
              return;
            }
            parent = parent.parentElement;
          }
          setIsDarkMode(false);
        }
      };

      checkDarkMode();
    }, [inputId]);

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

    // Additional styling for large hovered state
    const largeHoveredClass =
      state === 'hovered' && size === 'large' && !checked
        ? 'border-border-500' // #8C8D8D from styles.css
        : '';

    // Get final checkbox classes
    const checkboxClasses = `${BASE_CHECKBOX_CLASSES} ${sizeClasses.checkbox} ${
      (state === 'focused' || state === 'hovered') && size === 'large'
        ? 'border-3'
        : sizeClasses.borderWidth
    } ${stylingClasses} ${largeHoveredClass} ${className}`;

    // Get inline styles for checkbox based on theme and state
    const getCheckboxStyle = (): CSSProperties | undefined => {
      if (!checked && !indeterminate) return undefined;

      const theme = isDarkMode ? 'dark' : 'light';
      const stateKey = currentState === 'hovered' ? 'hover' : 'checked';

      // Use error color for invalid state
      if (currentState === 'invalid') {
        return {
          backgroundColor: isDarkMode
            ? THEME_COLORS.dark.checked.background
            : '#B91C1C',
          borderColor: isDarkMode
            ? THEME_COLORS.dark.checked.background
            : '#B91C1C',
          color: isDarkMode ? THEME_COLORS.dark.checked.iconColor : '#FEFEFF',
        };
      }

      // Use focused style for focused state
      if (currentState === 'focused') {
        return {
          backgroundColor: isDarkMode
            ? THEME_COLORS.dark.checked.background
            : THEME_COLORS.light.checked.background,
          borderColor: '#5399EC', // indicator-info
          color: isDarkMode
            ? THEME_COLORS.dark.checked.iconColor
            : THEME_COLORS.light.checked.iconColor,
        };
      }

      // Use disabled style
      if (currentState === 'disabled') {
        return {
          backgroundColor: isDarkMode
            ? THEME_COLORS.dark.checked.background
            : '#292929', // primary-600
          borderColor: isDarkMode
            ? THEME_COLORS.dark.checked.background
            : '#292929',
          color: isDarkMode
            ? THEME_COLORS.dark.checked.iconColor
            : THEME_COLORS.light.checked.iconColor,
          opacity: 0.4,
        };
      }

      return {
        backgroundColor: THEME_COLORS[theme][stateKey].background,
        borderColor: THEME_COLORS[theme][stateKey].border,
        color: THEME_COLORS[theme][stateKey].iconColor,
      };
    };

    // Get icon color based on theme and state
    const getIconColor = (): string => {
      if (isDarkMode) {
        return THEME_COLORS.dark.checked.iconColor;
      }
      return THEME_COLORS.light.checked.iconColor;
    };

    // Determine text color based on state and checked status
    const getTextColorClass = () => {
      if (disabled && checked) {
        return 'text-text-900'; // #262627
      }
      if (state === 'invalid') {
        return 'text-text-900'; // #262627 para todos os tamanhos no estado invalid
      }
      if (state === 'focused' && size === 'large') {
        return 'text-text-900'; // #262627 para large no estado focused
      }
      if (state === 'hovered' && size === 'large') {
        return 'text-text-900'; // #262627 para large no estado hovered
      }
      return 'text-text-600'; // #737373
    };

    // Determine label height based on size
    const getLabelHeight = () => {
      if (size === 'large') {
        return 'h-7'; // Using Tailwind h-7 (28px) which is closest to 27px
      }
      if (size === 'medium') {
        return 'h-6'; // 24px
      }
      return 'h-5'; // 20px (próximo de 21px)
    };

    // Determine line height based on size
    const getLineHeight = () => {
      if (size === 'large') {
        return 'leading-relaxed'; // 1.5 line height
      }
      if (size === 'medium') {
        return 'leading-normal'; // 1.5
      }
      return 'leading-normal'; // 1.5
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
            style={getCheckboxStyle()}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Show appropriate icon based on state */}
              {indeterminate ? (
                <Minus
                  size={sizeClasses.phosphorSize}
                  weight="bold"
                  color={getIconColor()}
                />
              ) : checked ? (
                <Check
                  size={sizeClasses.phosphorSize}
                  weight="bold"
                  color={getIconColor()}
                />
              ) : null}
            </div>
          </label>

          {/* Label text */}
          {label && (
            <div className={`flex flex-row items-center ${getLabelHeight()}`}>
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
