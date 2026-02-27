import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/utils';
import Button from '../Button/Button';

/**
 * ToggleSwitch size variants
 */
type ToggleSwitchSize = 'small' | 'medium' | 'large';

/**
 * Size configurations using Tailwind classes
 */
const SIZE_CLASSES = {
  small: {
    track: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translate: 'translate-x-4',
  },
  medium: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
  },
  large: {
    track: 'h-7 w-14',
    thumb: 'h-6 w-6',
    translate: 'translate-x-7',
  },
} as const;

/**
 * ToggleSwitch component props interface
 */
export type ToggleSwitchProps = {
  /** Whether the toggle is checked */
  checked?: boolean;
  /** Callback when toggle state changes */
  onChange?: () => void;
  /** Size variant of the toggle switch */
  size?: ToggleSwitchSize;
  /** Whether the toggle switch is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the track */
  className?: string;
  /** Additional CSS classes for the thumb */
  thumbClassName?: string;
  /** Color when checked (Tailwind class, e.g., 'bg-success-500') */
  checkedColor?: string;
  /** Color when unchecked (Tailwind class, e.g., 'bg-border-300') */
  uncheckedColor?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'type' | 'onChange'>;

/**
 * ToggleSwitch component for Analytica Ensino platforms
 *
 * A toggle switch component with support for different sizes and colors.
 * Uses the Button component with variant="raw" for clean rendering.
 *
 * @example
 * ```tsx
 * // Basic toggle switch
 * <ToggleSwitch checked={isActive} onChange={() => setIsActive(!isActive)} />
 *
 * // Different sizes
 * <ToggleSwitch size="small" checked={value} onChange={toggle} />
 * <ToggleSwitch size="large" checked={value} onChange={toggle} />
 *
 * // Custom colors
 * <ToggleSwitch
 *   checked={isEnabled}
 *   onChange={toggle}
 *   checkedColor="bg-primary-950"
 *   uncheckedColor="bg-border-400"
 * />
 * ```
 */
const ToggleSwitch = ({
  checked = false,
  onChange,
  size = 'small',
  disabled = false,
  className = '',
  thumbClassName = '',
  checkedColor = 'bg-success-500',
  uncheckedColor = 'bg-border-300',
  ...props
}: ToggleSwitchProps) => {
  const sizeClasses = SIZE_CLASSES[size];

  const trackClasses = cn(
    'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
    'transition-colors duration-200 ease-in-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    sizeClasses.track,
    checked ? checkedColor : uncheckedColor,
    disabled && 'cursor-not-allowed opacity-40',
    className
  );

  const thumbClasses = cn(
    'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0',
    'transition duration-200 ease-in-out',
    sizeClasses.thumb,
    checked ? sizeClasses.translate : 'translate-x-0',
    thumbClassName
  );

  return (
    <Button
      variant="raw"
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={trackClasses}
      {...props}
    >
      <span className={thumbClasses} />
    </Button>
  );
};

ToggleSwitch.displayName = 'ToggleSwitch';

export default ToggleSwitch;
