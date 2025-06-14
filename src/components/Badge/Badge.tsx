import React, { ReactNode } from 'react';

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
    exam1: 'bg-exame-1 text-[#145B8F] focus-visible:outline-none',
    exam2: 'bg-exame-2 text-[#B00C9B] focus-visible:outline-none',
    exam3: 'bg-exame-3 text-[#745A07] focus-visible:outline-none',
    exam4: 'bg-exame-4 text-[#126D30] focus-visible:outline-none',
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
} & React.HTMLAttributes<HTMLDivElement>;

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
  if (!variantClasses && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      `[Badge] Unsupported action "${action}" for variant "${variant}". Falling back to "muted".`
    );
  }
  const baseClasses =
    'inline-flex items-center justify-center rounded-xs font-medium gap-1';

  const baseClassesIcon = 'flex items-center';
  if (variant === 'notification') {
    return (
      <div
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        <svg
          role="img"
          aria-label="Notification"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          aria-hidden="true"
          focusable="false"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_12322_42725)">
            <path
              d="M20.7938 16.9944C20.2735 16.0981 19.5 13.5622 19.5 10.25C19.5 8.26088 18.7098 6.35322 17.3033 4.9467C15.8968 3.54018 13.9891 2.75 12 2.75C10.0109 2.75 8.10323 3.54018 6.69671 4.9467C5.29019 6.35322 4.50001 8.26088 4.50001 10.25C4.50001 13.5631 3.72564 16.0981 3.20532 16.9944C3.07245 17.2222 3.00201 17.4811 3.00111 17.7449C3.0002 18.0086 3.06886 18.268 3.20017 18.4967C3.33147 18.7255 3.52077 18.9156 3.74899 19.0478C3.9772 19.1801 4.23625 19.2498 4.50001 19.25H8.32595C8.49899 20.0967 8.95916 20.8577 9.62864 21.4042C10.2981 21.9507 11.1358 22.2492 12 22.2492C12.8642 22.2492 13.7019 21.9507 14.3714 21.4042C15.0409 20.8577 15.501 20.0967 15.6741 19.25H19.5C19.7637 19.2496 20.0226 19.1798 20.2507 19.0475C20.4788 18.9151 20.668 18.725 20.7992 18.4963C20.9303 18.2676 20.9989 18.0083 20.998 17.7446C20.997 17.4809 20.9266 17.2222 20.7938 16.9944ZM12 20.75C11.5348 20.7499 11.0812 20.6055 10.7014 20.3369C10.3216 20.0683 10.0344 19.6886 9.87939 19.25H14.1206C13.9656 19.6886 13.6784 20.0683 13.2986 20.3369C12.9189 20.6055 12.4652 20.7499 12 20.75ZM4.50001 17.75C5.22189 16.5087 6.00001 13.6325 6.00001 10.25C6.00001 8.6587 6.63215 7.13258 7.75737 6.00736C8.88259 4.88214 10.4087 4.25 12 4.25C13.5913 4.25 15.1174 4.88214 16.2427 6.00736C17.3679 7.13258 18 8.6587 18 10.25C18 13.6297 18.7763 16.5059 19.5 17.75H4.50001Z"
              fill="black"
            />
            <circle cx="18" cy="4.5" r="4" fill="#B91C1C" />
          </g>
          <defs>
            <clipPath id="clip0_12322_42725">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="translate(0 0.5)"
              />
            </clipPath>
          </defs>
        </svg>
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
