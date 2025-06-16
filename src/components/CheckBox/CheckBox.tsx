'use client';

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
      background: 'bg-primary-800', // primary-800
      border: 'border-primary-800',
      iconColor: 'text-text', // white text
    },
    hover: {
      background: 'bg-primary-700', // primary-700
      border: 'border-primary-700',
      iconColor: 'text-text', // white text
    },
    unchecked: {
      border: 'border-border-400', // border-400
    },
  },
  dark: {
    checked: {
      background: 'bg-primary-100', // primary-100
      border: 'border-primary-100',
      iconColor: 'text-text-950', // dark text
    },
    hover: {
      background: 'bg-primary-100', // primary-100
      border: 'border-primary-100',
      iconColor: 'text-text-950', // dark text
    },
    unchecked: {
      border: 'border-border-500', // border-500 em dark mode
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
 * Mapping for checkbox styles
 */
const CHECKBOX_STYLE_MAP = {
  small: {
    default: {
      checked: {
        backgroundColor: '#1C61B2', // primary-800
        borderColor: '#1C61B2', // primary-800
        borderWidth: '2px',
        borderRadius: '4px',
        width: '16px',
        height: '16px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      unchecked: {
        borderColor: '#A5A3A3', // border-400
        borderWidth: '2px',
        borderRadius: '4px',
        width: '16px',
        height: '16px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
    },
    focused: {
      checked: {
        backgroundColor: '#1C61B2', // primary-800
        borderColor: '#5399EC', // indicator-info
        borderWidth: '2px',
        borderRadius: '4px',
        width: '16px',
        height: '16px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 2px rgba(83, 153, 236, 0.2)', // indicator-info com transparência
      },
      unchecked: {
        borderColor: '#5399EC', // indicator-info
        borderWidth: '2px',
        borderRadius: '4px',
        width: '16px',
        height: '16px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        boxShadow: '0 0 0 2px rgba(83, 153, 236, 0.2)', // indicator-info com transparência
      },
    },
    hovered: {
      checked: {
        backgroundColor: '#1C61B2', // primary-800
        borderColor: '#1C61B2', // primary-800 - mesma cor que o preenchimento
        borderWidth: '2px',
        borderRadius: '4px',
        width: '16px',
        height: '16px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      unchecked: {
        borderColor: '#8C8D8D', // border-500
        borderWidth: '2px',
        borderRadius: '4px',
        width: '16px',
        height: '16px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
    },
  },
  medium: {
    default: {
      checked: {
        backgroundColor: '#1C61B2', // primary-800
        borderColor: '#1C61B2', // primary-800
        borderWidth: '2px',
        borderRadius: '4px',
        width: '20px',
        height: '20px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      unchecked: {
        borderColor: '#A5A3A3', // border-400
        borderWidth: '2px',
        borderRadius: '4px',
        width: '20px',
        height: '20px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
    },
    focused: {
      checked: {
        backgroundColor: '#1C61B2', // primary-800
        borderColor: '#5399EC', // indicator-info
        borderWidth: '2px',
        borderRadius: '4px',
        width: '20px',
        height: '20px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 2px rgba(83, 153, 236, 0.2)', // indicator-info com transparência
      },
      unchecked: {
        borderColor: '#5399EC', // indicator-info
        borderWidth: '2px',
        borderRadius: '4px',
        width: '20px',
        height: '20px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        boxShadow: '0 0 0 2px rgba(83, 153, 236, 0.2)',
      },
    },
    hovered: {
      checked: {
        backgroundColor: '#1C61B2', // primary-800
        borderColor: '#1C61B2', // primary-800
        borderWidth: '2px',
        borderRadius: '4px',
        width: '20px',
        height: '20px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      unchecked: {
        borderColor: '#8C8D8D', // border-500
        borderWidth: '2px',
        borderRadius: '4px',
        width: '20px',
        height: '20px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
    },
  },
  large: {
    default: {
      checked: (isDarkMode: boolean) => ({
        backgroundColor: isDarkMode
          ? THEME_COLORS.dark.checked.background
          : THEME_COLORS.light.checked.background,
        borderColor: isDarkMode
          ? THEME_COLORS.dark.checked.border
          : THEME_COLORS.light.checked.border,
        borderWidth: '3px',
        borderRadius: '4px',
        width: '24px',
        height: '24px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }),
      unchecked: (isDarkMode: boolean) => ({
        borderColor: isDarkMode
          ? THEME_COLORS.dark.unchecked.border
          : THEME_COLORS.light.unchecked.border,
        borderWidth: '3px',
        borderRadius: '4px',
        width: '24px',
        height: '24px',
        boxSizing: 'border-box' as BoxSizing,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }),
    },
  },
} as const;

/**
 * Icon color mapping
 */
const ICON_COLOR_MAP = {
  small: {
    default: {
      checked: '#FEFEFF', // text
    },
    focused: {
      checked: '#FEFEFF', // text
    },
    hovered: {
      checked: '#FEFEFF', // text
    },
  },
  medium: {
    default: {
      checked: '#FEFEFF', // text
    },
    focused: {
      checked: '#FEFEFF', // text
    },
    hovered: {
      checked: '#FEFEFF', // text
    },
  },
  large: {},
} as const;

/**
 * Text color class mapping
 */
const TEXT_COLOR_CLASS_MAP = {
  disabled: {
    checked: 'text-text-900', // #262627
  },
  invalid: {
    any: 'text-text-900', // #262627 para todos os tamanhos no estado invalid
  },
  small: {
    default: {
      checked: 'text-text-900', // #262627
      unchecked: 'text-text-600', // #737373
    },
    focused: {
      checked: 'text-text-900', // #262627
      unchecked: 'text-text-900', // #262627
    },
    hovered: {
      checked: 'text-text-900', // #262627
      unchecked: 'text-text-900', // #262627
    },
  },
  medium: {
    default: {
      checked: 'text-text-900', // #262627
      unchecked: 'text-text-600', // #737373
    },
    focused: {
      checked: 'text-text-900', // #262627
      unchecked: 'text-text-900', // #262627
    },
    hovered: {
      checked: 'text-text-900', // #262627
      unchecked: 'text-text-900', // #262627
    },
  },
  large: {
    any: {
      checked: 'text-text-900', // #262627
    },
  },
  focused: {
    any: 'text-text-900', // #262627
  },
  hovered: {
    any: 'text-text-900', // #262627
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
 * Line height mapping
 */
const LINE_HEIGHT_MAP = {
  small: 'leading-[150%]',
  medium: 'leading-[150%]',
  large: 'leading-[150%]',
  default: 'leading-normal',
} as const;

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
      state === 'focused' || state === 'hovered' || size === 'large'
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
          'bg-primary-800': '#1C61B2',
          'bg-primary-700': '#2271C4',
          'bg-primary-100': '#BBDCF7',
          'bg-error-700': '#B91C1C',
        };

        const borderColorMap: Record<string, string> = {
          'border-primary-800': '#1C61B2',
          'border-primary-700': '#2271C4',
          'border-primary-100': '#BBDCF7',
          'border-border-400': '#A5A3A3',
          'border-border-500': '#8C8D8D',
          'border-indicator-info': '#5399EC',
          'border-error-700': '#B91C1C',
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
          const styleValue =
            CHECKBOX_STYLE_MAP[size][
              currentState as keyof (typeof CHECKBOX_STYLE_MAP)[typeof size]
            ].checked;

          if (typeof styleValue === 'function') {
            return styleValue(isDarkMode);
          }

          return styleValue;
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
          const styleValue =
            CHECKBOX_STYLE_MAP[size][
              currentState as keyof (typeof CHECKBOX_STYLE_MAP)[typeof size]
            ].unchecked;

          if (typeof styleValue === 'function') {
            return styleValue(isDarkMode);
          }

          return styleValue;
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

    // Get icon color based on theme and state
    const getIconColor = (): string => {
      // Convert Tailwind classes to hex colors for Phosphor icons
      const colorMap: Record<string, string> = {
        'text-text': '#FEFEFF',
        'text-text-950': '#171717',
      };

      // Check from the mapping first
      if (
        ICON_COLOR_MAP[size]?.[
          currentState as keyof (typeof ICON_COLOR_MAP)[typeof size]
        ]?.['checked']
      ) {
        return ICON_COLOR_MAP[size][
          currentState as keyof (typeof ICON_COLOR_MAP)[typeof size]
        ]['checked'];
      }

      // Default to theme colors
      const themeIconColor = isDarkMode
        ? THEME_COLORS.dark.checked.iconColor
        : THEME_COLORS.light.checked.iconColor;

      return colorMap[themeIconColor] || '#FEFEFF';
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

    // Determine text color based on state and checked status
    const getTextColorClass = () => {
      // Check disabled first
      if (disabled && checked && TEXT_COLOR_CLASS_MAP.disabled?.checked) {
        return TEXT_COLOR_CLASS_MAP.disabled.checked;
      }

      // Check invalid state
      if (state === 'invalid' && TEXT_COLOR_CLASS_MAP.invalid?.any) {
        return TEXT_COLOR_CLASS_MAP.invalid.any;
      }

      // Check size and state specific combinations
      if (
        TEXT_COLOR_CLASS_MAP[size]?.[
          state as keyof (typeof TEXT_COLOR_CLASS_MAP)[typeof size]
        ]?.[checkVariant]
      ) {
        return TEXT_COLOR_CLASS_MAP[size][
          state as keyof (typeof TEXT_COLOR_CLASS_MAP)[typeof size]
        ][checkVariant];
      }

      // Check general state classes
      if (state === 'focused' && TEXT_COLOR_CLASS_MAP.focused?.any) {
        return TEXT_COLOR_CLASS_MAP.focused.any;
      }

      if (state === 'hovered' && TEXT_COLOR_CLASS_MAP.hovered?.any) {
        return TEXT_COLOR_CLASS_MAP.hovered.any;
      }

      // Check for large size and any state with checked status
      if (
        size === 'large' &&
        checked &&
        TEXT_COLOR_CLASS_MAP.large?.any?.checked
      ) {
        return TEXT_COLOR_CLASS_MAP.large.any.checked;
      }

      // Default
      return 'text-text-600'; // #737373
    };

    // Determine label height
    const getLabelHeight = () => {
      return LABEL_HEIGHT_MAP[size] || 'h-5';
    };

    // Determine line height
    const getLineHeight = () => {
      return LINE_HEIGHT_MAP[size] || LINE_HEIGHT_MAP.default;
    };

    // Define spacing class based on size and state
    const getSpacingClass = () => {
      if (size === 'small') return 'gap-1.5';

      if (
        (size === 'medium' && state === 'default') ||
        (size === 'medium' && state === 'focused' && checked) ||
        (size === 'medium' && state === 'hovered' && checked)
      ) {
        return 'gap-2';
      }

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
                <Minus
                  size={getIconSize()}
                  weight="bold"
                  color={getIconColor()}
                />
              ) : checked ? (
                <Check
                  size={getIconSize()}
                  weight="bold"
                  color={getIconColor()}
                />
              ) : null}
            </div>
          </label>

          {/* Label text */}
          {label && (
            <div
              className={`flex flex-row items-center ${
                (size === 'medium' && state === 'default') ||
                (size === 'medium' && state === 'focused' && checked) ||
                (size === 'medium' && state === 'hovered' && checked)
                  ? 'h-6'
                  : size === 'small'
                    ? 'h-[21px]'
                    : getLabelHeight()
              }`}
            >
              <Text
                as="label"
                htmlFor={inputId}
                size={size === 'small' ? 'sm' : 'md'}
                weight="normal"
                className={`cursor-pointer select-none ${
                  size === 'small' ||
                  (size === 'medium' && state === 'default') ||
                  (size === 'medium' && state === 'focused' && checked) ||
                  (size === 'medium' && state === 'hovered' && checked)
                    ? 'leading-[150%]'
                    : getLineHeight()
                } flex items-center font-roboto ${
                  (size === 'medium' && state === 'default' && checked) ||
                  (size === 'medium' && state === 'focused' && checked) ||
                  (size === 'medium' && state === 'hovered' && checked) ||
                  (size === 'small' &&
                    ((state === 'focused' && !checked) ||
                      (state === 'hovered' && !checked) ||
                      (state === 'focused' && checked) ||
                      (state === 'hovered' && checked)))
                    ? 'text-text-900'
                    : (size === 'small' && state === 'default' && !checked) ||
                        (size === 'medium' && state === 'default' && !checked)
                      ? 'text-text-600'
                      : getTextColorClass()
                } ${disabled ? 'cursor-not-allowed' : ''} ${labelClassName}`}
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
