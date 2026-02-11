import { forwardRef, useId, InputHTMLAttributes, ChangeEvent } from 'react';
import { WarningCircle } from 'phosphor-react';
import { cn } from '../../utils/utils';
import Text from '../Text/Text';

/**
 * ColorPicker component props interface
 */
export type ColorPickerProps = {
  /** Label text displayed above the color picker */
  label?: string;
  /** Helper text displayed below the color picker */
  helperText?: string;
  /** Error message displayed below the color picker */
  errorMessage?: string;
  /** Current color value in hex format (e.g., "#FFFFFF") */
  value?: string;
  /** Callback when color changes */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Placeholder for the text input */
  placeholder?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is required */
  required?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'size'
>;

/**
 * ColorPicker component for Analytica Ensino platforms
 *
 * A color picker component that combines a native color input with a text input
 * for manual hex value entry. Includes label, helper text, and error message support.
 *
 * @param label - Optional label text displayed above the color picker
 * @param helperText - Optional helper text displayed below the color picker
 * @param errorMessage - Optional error message displayed below the color picker
 * @param value - Current color value in hex format
 * @param onChange - Callback when color changes
 * @param placeholder - Placeholder for the text input (default: "#FFFFFF")
 * @param className - Additional CSS classes for the container
 * @param disabled - Whether the input is disabled
 * @param required - Whether the input is required
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ColorPicker
 *   label="Cor"
 *   value={color}
 *   onChange={(e) => setColor(e.target.value)}
 *   helperText="Selecione uma cor para representar o componente"
 * />
 *
 * // With error state
 * <ColorPicker
 *   label="Cor"
 *   value={color}
 *   onChange={(e) => setColor(e.target.value)}
 *   errorMessage="Cor inválida"
 * />
 * ```
 */
const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      value = '#FFFFFF',
      onChange,
      placeholder = '#FFFFFF',
      className,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? `color-picker-${generatedId}`;

    const hasError = Boolean(errorMessage);

    const inputClasses = cn(
      'bg-background w-full py-2 px-3 font-normal text-text-900 text-sm',
      'border rounded-lg focus:outline-primary-950',
      hasError
        ? 'border-2 border-indicator-error'
        : 'border-border-300 hover:border-border-400',
      disabled && 'cursor-not-allowed opacity-40'
    );

    const colorInputClasses = cn(
      'w-12 h-10 rounded cursor-pointer border',
      hasError ? 'border-indicator-error' : 'border-border-200',
      disabled && 'cursor-not-allowed opacity-40'
    );

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block font-bold text-text-900 mb-2 text-sm"
          >
            {label}{' '}
            {required && <span className="text-indicator-error">*</span>}
          </label>
        )}

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={colorInputClasses}
            aria-label={label ? `${label} color picker` : 'Color picker'}
          />
          <input
            ref={ref}
            id={inputId}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputClasses}
            aria-invalid={hasError ? 'true' : undefined}
            {...props}
          />
        </div>

        <div className="mt-1">
          {helperText && !errorMessage && (
            <Text size="xs" color="text-text-500">
              {helperText}
            </Text>
          )}
          {errorMessage && (
            <Text size="xs" color="text-indicator-error">
              <WarningCircle size={14} /> {errorMessage}
            </Text>
          )}
        </div>
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
