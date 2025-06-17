import { ReactNode, HTMLAttributes } from 'react';
import { Bell } from 'phosphor-react';

/**
 * Lookup table for variant and action class combinations
 */
const VARIANT_ACTION_CLASSES = {
  solid: {
    error: 'bg-error text-error-700 focus-visible:outline-none',
    warning: 'bg-warning text-warning-800 focus-visible:outline-none',
    success: 'bg-success text-success-800 focus-visible:outline-none',
    info: 'bg-info text-info-800 focus-visible:outline-none',
    muted: 'bg-background-muted text-background-800 focus-visible:outline-none',
  },
  outlined: {
    error:
      'bg-error text-error-700 border border-error-300 focus-visible:outline-none',
    warning:
      'bg-warning text-warning-800 border border-warning-300 focus-visible:outline-none',
    success:
      'bg-success text-success-800 border border-success-300 focus-visible:outline-none',
    info: 'bg-info text-info-800 border border-info-300 focus-visible:outline-none',
    muted:
      'bg-background-muted text-background-800 border border-border-300 focus-visible:outline-none',
  },
  exams: {
    exam1: 'bg-exam-1 text-info-200 focus-visible:outline-none',
    exam2: 'bg-exam-2 text-typography-1 focus-visible:outline-none',
    exam3: 'bg-exam-3 text-typography-2 focus-visible:outline-none',
    exam4: 'bg-exam-4 text-success-700 focus-visible:outline-none',
  },
  resultStatus: {
    negative: 'bg-error text-error-800 focus-visible:outline-none',
    positive: 'bg-success text-success-800 focus-visible:outline-none',
  },
  notification: 'text-primary',
} as const;

/**
 * Lookup table for size classes
 */
const SIZE_CLASSES = {
  small: 'text-2xs px-2 py-1',
  medium: 'text-xs px-2 py-1',
  large: 'text-sm px-2 py-1',
} as const;

const SIZE_CLASSES_ICON = {
  small: 'size-3',
  medium: 'size-3.5',
  large: 'size-4',
} as const;

/**
 * Badge component props interface
 */
type BadgeProps = {
  /** Content to be displayed inside the badge */
  children?: ReactNode;
  /** Ícone à direita do texto */
  iconRight?: ReactNode;
  /** Ícone à esquerda do texto */
  iconLeft?: ReactNode;
  /** Size of the badge */
  size?: 'small' | 'medium' | 'large';
  /** Visual variant of the badge */
  variant?: 'solid' | 'outlined' | 'exams' | 'resultStatus' | 'notification';
  /** Action type of the badge  */
  action?:
    | 'error'
    | 'warning'
    | 'success'
    | 'info'
    | 'muted'
    | 'exam1'
    | 'exam2'
    | 'exam3'
    | 'exam4'
    | 'positive'
    | 'negative';
  /** Additional CSS classes to apply */
  className?: string;
  notificationActive?: boolean;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Badge component for Analytica Ensino platforms
 *
 * A flexible button component with multiple variants, sizes and actions.
 * Fully compatible with Next.js 15 and React 19.
 *
 * @param children - The content to display inside the badge
 * @param size - The size variant (extra-small, small, medium, large, extra-large)
 * @param variant - The visual style variant (solid, outline, link)
 * @param action - The action type (primary, positive, negative)
 * @param className - Additional CSS classes
 * @param props - All other standard div HTML attributes
 * @returns A styled badge element
 *
 * @example
 * ```tsx
 * <Badge variant="solid" action="info" size="medium">
 *   Information
 * </Badge>
 * ```
 */
export const Badge = ({
  children,
  iconLeft,
  iconRight,
  size = 'medium',
  variant = 'solid',
  action = 'error',
  className = '',
  notificationActive = false,
  ...props
}: BadgeProps) => {
  // Get classes from lookup tables
  const sizeClasses = SIZE_CLASSES[size];
  const sizeClassesIcon = SIZE_CLASSES_ICON[size];
  const variantActionMap = VARIANT_ACTION_CLASSES[variant] || {};
  const variantClasses =
    typeof variantActionMap === 'string'
      ? variantActionMap
      : ((variantActionMap as Record<string, string>)[action] ??
        (variantActionMap as Record<string, string>).muted ??
        '');

  const baseClasses =
    'inline-flex items-center justify-center rounded-xs font-medium gap-1 relative';

  const baseClassesIcon = 'flex items-center';
  if (variant === 'notification') {
    return (
      <div
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        <Bell size={24} className="text-primary-950" />

        {notificationActive && (
          <span
            data-testid="notification-dot"
            className="absolute top-[5px] right-[10px] block h-2 w-2 rounded-full bg-indicator-error ring-2 ring-white"
          />
        )}
      </div>
    );
  }
  return (
    <div
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {iconLeft && (
        <span className={`${baseClassesIcon} ${sizeClassesIcon}`}>
          {iconLeft}
        </span>
      )}
      {children}
      {iconRight && (
        <span className={`${baseClassesIcon} ${sizeClassesIcon}`}>
          {iconRight}
        </span>
      )}
    </div>
  );
};
