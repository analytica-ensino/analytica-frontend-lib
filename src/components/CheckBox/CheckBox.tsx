'use client';

import React, {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
  CSSProperties,
  useEffect,
  useId,
} from 'react';
import { Text } from '../Text/Text';
import { Check, Minus } from 'phosphor-react';

// Add BoxSizing type
type BoxSizing = 'border-box' | 'content-box' | 'initial' | 'inherit';

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
 * Color constants
 */
const COLORS = {
  PRIMARY_800: '#1C61B2',
  BORDER_400: '#A5A3A3',
  BORDER_500: '#8C8D8D',
  INDICATOR_INFO: '#5399EC',
  WHITE: '#FEFEFF',
  TRANSPARENT: 'transparent',
  BOX_SHADOW: '0 0 0 2px rgba(83, 153, 236, 0.2)',
} as const;

/**
 * Size configurations
 */
const SIZE_CONFIGS = {
  small: { width: '16px', height: '16px', borderWidth: '2px' },
  medium: { width: '20px', height: '20px', borderWidth: '2px' },
  large: { width: '24px', height: '24px', borderWidth: '3px' },
} as const;

/**
 * Helper function to create checkbox styles
 */
const createCheckboxStyle = (
  size: keyof typeof SIZE_CONFIGS,
  backgroundColor: string,
  borderColor: string,
  boxShadow?: string
): CSSProperties => ({
  backgroundColor,
  borderColor,
  borderWidth: SIZE_CONFIGS[size].borderWidth,
  borderRadius: '4px',
  width: SIZE_CONFIGS[size].width,
  height: SIZE_CONFIGS[size].height,
  boxSizing: 'border-box' as BoxSizing,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(boxShadow && { boxShadow }),
});

/**
 * Mapping for checkbox styles - greatly reduced duplication
 */
const CHECKBOX_STYLE_MAP = {
  small: {
    default: {
      checked: createCheckboxStyle(
        'small',
        COLORS.PRIMARY_800,
        COLORS.PRIMARY_800
      ),
      unchecked: createCheckboxStyle(
        'small',
        COLORS.TRANSPARENT,
        COLORS.BORDER_400
      ),
    },
    focused: {
      checked: createCheckboxStyle(
        'small',
        COLORS.PRIMARY_800,
        COLORS.INDICATOR_INFO,
        COLORS.BOX_SHADOW
      ),
      unchecked: createCheckboxStyle(
        'small',
        COLORS.TRANSPARENT,
        COLORS.INDICATOR_INFO,
        COLORS.BOX_SHADOW
      ),
    },
    hovered: {
      checked: createCheckboxStyle(
        'small',
        COLORS.PRIMARY_800,
        COLORS.PRIMARY_800
      ),
      unchecked: createCheckboxStyle(
        'small',
        COLORS.TRANSPARENT,
        COLORS.BORDER_500
      ),
    },
  },
  medium: {
    default: {
      checked: createCheckboxStyle(
        'medium',
        COLORS.PRIMARY_800,
        COLORS.PRIMARY_800
      ),
      unchecked: createCheckboxStyle(
        'medium',
        COLORS.TRANSPARENT,
        COLORS.BORDER_400
      ),
    },
    focused: {
      checked: createCheckboxStyle(
        'medium',
        COLORS.PRIMARY_800,
        COLORS.INDICATOR_INFO,
        COLORS.BOX_SHADOW
      ),
      unchecked: createCheckboxStyle(
        'medium',
        COLORS.TRANSPARENT,
        COLORS.INDICATOR_INFO,
        COLORS.BOX_SHADOW
      ),
    },
    hovered: {
      checked: createCheckboxStyle(
        'medium',
        COLORS.PRIMARY_800,
        COLORS.PRIMARY_800
      ),
      unchecked: createCheckboxStyle(
        'medium',
        COLORS.TRANSPARENT,
        COLORS.BORDER_500
      ),
    },
  },
  large: {
    default: {
      checked: createCheckboxStyle(
        'large',
        COLORS.PRIMARY_800,
        COLORS.PRIMARY_800
      ),
      unchecked: createCheckboxStyle(
        'large',
        COLORS.TRANSPARENT,
        COLORS.BORDER_400
      ),
    },
    focused: {
      checked: createCheckboxStyle(
        'large',
        COLORS.PRIMARY_800,
        COLORS.INDICATOR_INFO,
        COLORS.BOX_SHADOW
      ),
      unchecked: createCheckboxStyle(
        'large',
        COLORS.TRANSPARENT,
        COLORS.INDICATOR_INFO,
        COLORS.BOX_SHADOW
      ),
    },
    hovered: {
      checked: createCheckboxStyle(
        'large',
        COLORS.PRIMARY_800,
        COLORS.PRIMARY_800
      ),
      unchecked: createCheckboxStyle(
        'large',
        COLORS.TRANSPARENT,
        COLORS.BORDER_500
      ),
    },
  },
} as const;

/**
 * Icon color mapping - simplified since all use the same color
 */
const ICON_COLOR = COLORS.WHITE;

/**
 * Size configurations
 */
const SIZE_CLASSES = {
  small: {
    checkbox: 'w-4 h-4', // 16px x 16px
    textSize: 'sm' as const,
    spacing: 'gap-1.5', // 6px
    borderWidth: 'border-2',
    iconSize: 'w-3.5 h-3.5', // ~14px
    dimensions: 'w-4 h-4', // 16px
    labelHeight: 'h-[21px]',
  },
  medium: {
    checkbox: 'w-5 h-5', // 20px x 20px
    textSize: 'md' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-2',
    iconSize: 'w-4 h-4', // 16px
    dimensions: 'w-5 h-5', // 20px
    labelHeight: 'h-6',
  },
  large: {
    checkbox: 'w-6 h-6', // 24px x 24px
    textSize: 'lg' as const,
    spacing: 'gap-2', // 8px
    borderWidth: 'border-3', // 3px
    iconSize: 'w-5 h-5', // 20px
    dimensions: 'w-6 h-6', // 24px
    labelHeight: 'h-[27px]',
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
      background: 'bg-primary-800', // from styles.css
      border: 'border-primary-800',
      iconColor: 'text-text', // white text from styles.css
    },
    hover: {
      background: 'bg-primary-700', // from styles.css
      border: 'border-primary-700',
      iconColor: 'text-text', // white text from styles.css
    },
    unchecked: {
      border: 'border-border-400', // from styles.css
    },
  },
  dark: {
    checked: {
      background: 'bg-primary-100', // from styles.css
      border: 'border-primary-100',
      iconColor: 'text-text-950', // dark text from styles.css
    },
    hover: {
      background: 'bg-primary-100', // from styles.css
      border: 'border-primary-100',
      iconColor: 'text-text-950', // dark text from styles.css
    },
    unchecked: {
      border: 'border-border-500', // from styles.css
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
 * Label height mapping
 */
const LABEL_HEIGHT_MAP = {
  small: 'h-[21px]',
  medium: 'h-6', // 24px
  large: 'h-[27px]',
} as const;

/**
 * Line height constant - all sizes use the same value
 */
const LINE_HEIGHT = 'leading-[150%]';

/**
 * Special styles for state variations
 */
const SPECIAL_STYLE_MAP = {
  invalid: (isDarkMode: boolean) => ({
    backgroundColor: isDarkMode
      ? THEME_COLORS.dark.checked.background
      : '#B91C1C',
    borderColor: isDarkMode ? THEME_COLORS.dark.checked.background : '#B91C1C',
    color: isDarkMode ? THEME_COLORS.dark.checked.iconColor : '#FEFEFF',
  }),
  focused: (isDarkMode: boolean) => ({
    backgroundColor: isDarkMode
      ? THEME_COLORS.dark.checked.background
      : THEME_COLORS.light.checked.background,
    borderColor: '#5399EC', // indicator-info
    color: isDarkMode
      ? THEME_COLORS.dark.checked.iconColor
      : THEME_COLORS.light.checked.iconColor,
    borderWidth: '3px',
    borderRadius: '4px',
    width: '24px',
    height: '24px',
    boxSizing: 'border-box' as BoxSizing,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 2px rgba(83, 153, 236, 0.2)', // indicator-info com transparência
    outlineOffset: '2px',
  }),
  disabled: (isDarkMode: boolean) => ({
    backgroundColor: isDarkMode
      ? THEME_COLORS.dark.checked.background
      : '#292929', // primary-600
    borderColor: isDarkMode ? THEME_COLORS.dark.checked.background : '#292929',
    color: isDarkMode
      ? THEME_COLORS.dark.checked.iconColor
      : THEME_COLORS.light.checked.iconColor,
    opacity: 0.4,
  }),
  hoveredChecked: (isDarkMode: boolean) => ({
    backgroundColor: isDarkMode
      ? THEME_COLORS.dark.hover.background
      : THEME_COLORS.light.hover.background,
    borderColor: isDarkMode
      ? THEME_COLORS.dark.hover.border
      : THEME_COLORS.light.hover.border,
    color: isDarkMode
      ? THEME_COLORS.dark.hover.iconColor
      : THEME_COLORS.light.hover.iconColor,
    borderWidth: '3px',
    borderRadius: '4px',
    width: '24px',
    height: '24px',
    boxSizing: 'border-box' as BoxSizing,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
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
    const generatedId = useId();
    const inputId = id || `checkbox-${generatedId}`;

    // Handle controlled vs uncontrolled behavior
    const [internalChecked, setInternalChecked] = useState(false);
    const isControlled = checkedProp !== undefined;
    const checked = isControlled ? checkedProp : internalChecked;

    // State for detecting dark mode
    const [isDarkMode, setIsDarkMode] = useState(_theme === 'dark');

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

    // Get final checkbox classes - simplified since focused/hovered always use border-3, and large already uses border-3
    const checkboxClasses = `${BASE_CHECKBOX_CLASSES} ${sizeClasses.checkbox} ${
      state === 'focused' || state === 'hovered'
        ? 'border-3'
        : sizeClasses.borderWidth
    } ${stylingClasses} ${largeHoveredClass} ${className}`;

    // Get inline styles for checkbox based on theme and state
    const getCheckboxStyle = (): CSSProperties | undefined => {
      const theme = isDarkMode ? 'dark' : 'light';

      // Convert Tailwind classes to CSS properties
      const getTailwindStyles = (
        bgClass: string,
        borderClass: string
      ): CSSProperties => {
        const bgColorMap: Record<string, string> = {
          'bg-primary-800': '#1C61B2', // --color-primary-800 from styles.css
          'bg-primary-700': '#2271C4', // --color-primary-700 from styles.css
          'bg-primary-100': '#BBDCF7', // --color-primary-100 from styles.css
          'bg-error-700': '#B91C1C', // --color-error-700 from styles.css
        };

        const borderColorMap: Record<string, string> = {
          'border-primary-800': '#1C61B2', // --color-primary-800 from styles.css
          'border-primary-700': '#2271C4', // --color-primary-700 from styles.css
          'border-primary-100': '#BBDCF7', // --color-primary-100 from styles.css
          'border-border-400': '#A5A3A3', // --color-border-400 from styles.css
          'border-border-500': '#8C8D8D', // --color-border-500 from styles.css
          'border-indicator-info': '#5399EC', // --color-indicator-info from styles.css
          'border-error-700': '#B91C1C', // --color-error-700 from styles.css
        };

        return {
          backgroundColor: bgColorMap[bgClass] || 'transparent',
          borderColor: borderColorMap[borderClass] || '#A5A3A3',
        };
      };

      // Handle special states first
      if (checked && !indeterminate) {
        // Try to get style from the mapping
        if (
          CHECKBOX_STYLE_MAP[size]?.[
            currentState as keyof (typeof CHECKBOX_STYLE_MAP)[typeof size]
          ]?.checked
        ) {
          return CHECKBOX_STYLE_MAP[size][
            currentState as keyof (typeof CHECKBOX_STYLE_MAP)[typeof size]
          ].checked;
        }

        // Handle special states
        if (currentState === 'invalid') {
          return SPECIAL_STYLE_MAP.invalid(isDarkMode);
        }
        if (currentState === 'focused' && size === 'large') {
          return SPECIAL_STYLE_MAP.focused(isDarkMode);
        }
        if (currentState === 'disabled') {
          return SPECIAL_STYLE_MAP.disabled(isDarkMode);
        }
        if (currentState === 'hovered' && size === 'large') {
          return SPECIAL_STYLE_MAP.hoveredChecked(isDarkMode);
        }

        // Default theme colors for checked state
        const { background, border } = THEME_COLORS[theme].checked;
        return {
          ...getTailwindStyles(background, border),
          color: isDarkMode ? '#171717' : '#FEFEFF',
        };
      } else if (!checked && !indeterminate) {
        // Handle unchecked styles
        if (
          CHECKBOX_STYLE_MAP[size]?.[
            currentState as keyof (typeof CHECKBOX_STYLE_MAP)[typeof size]
          ]?.unchecked
        ) {
          return CHECKBOX_STYLE_MAP[size][
            currentState as keyof (typeof CHECKBOX_STYLE_MAP)[typeof size]
          ].unchecked;
        }

        // Large unchecked default fallback
        if (size === 'large' && currentState === 'default') {
          const { border } = THEME_COLORS[theme].unchecked;
          return {
            ...getTailwindStyles('', border),
            borderWidth: '3px',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            boxSizing: 'border-box' as BoxSizing,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          };
        }
        return undefined;
      }

      return undefined;
    };

    // Get icon size for checkbox
    const getIconSize = () => {
      // Convert Tailwind classes to pixel values for Phosphor icons
      const sizeMap = {
        'w-3.5 h-3.5': 14,
        'w-4 h-4': 16,
        'w-5 h-5': 20,
      };

      return sizeMap[sizeClasses.iconSize] || 16;
    };

    // Determine label height
    const getLabelHeight = () => {
      return LABEL_HEIGHT_MAP[size] || 'h-5';
    };

    // Determine line height - now simplified since all use the same value
    const getLineHeight = () => {
      return LINE_HEIGHT;
    };

    // Define spacing class based on size - simplified since medium and large both use gap-2
    const getSpacingClass = () => {
      return sizeClasses.spacing;
    };

    return (
      <div className="flex flex-col">
        <div
          className={`flex flex-row items-center ${getSpacingClass()} ${disabled ? 'opacity-40' : ''}`}
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
                <Minus size={getIconSize()} weight="bold" color={ICON_COLOR} />
              ) : checked ? (
                <Check size={getIconSize()} weight="bold" color={ICON_COLOR} />
              ) : null}
            </div>
          </label>

          {/* Label text */}
          {label && (
            <div className={`flex flex-row items-center ${getLabelHeight()}`}>
              <Text
                as="label"
                htmlFor={inputId}
                size={size === 'small' ? 'sm' : 'md'}
                weight="normal"
                color="black"
                className={`cursor-pointer select-none ${getLineHeight()} flex items-center font-roboto ${labelClassName}`}
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
