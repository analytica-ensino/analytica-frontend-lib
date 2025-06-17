'use client';

import { HTMLAttributes } from 'react';
import { CheckCircle, WarningCircle, Info, X } from 'phosphor-react';

/**
 * Lookup table for variant and action class combinations
 */
const VARIANT_ACTION_CLASSES = {
  solid: {
    warning:
      'bg-warning text-warning-800 border-none focus-visible:outline-none',
    success:
      'bg-success text-success-800 border-none focus-visible:outline-none',
    info: 'bg-info text-info-800 border-none focus-visible:outline-none',
  },
  outlined: {
    warning:
      'bg-warning text-warning-600 border border-warning-300 focus-visible:outline-none',
    success:
      'bg-success text-success-800 border border-success-200 focus-visible:outline-none',
    info: 'bg-info text-info-600 border border-info-600 focus-visible:outline-none',
  },
} as const;

type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'default';

type ToastProps = {
  title: string;
  description?: string;
  onClose: () => void;
  /** Visual variant of the badge */
  variant?: 'solid' | 'outlined';
  /** Action type of the badge  */
  action?: 'warning' | 'success' | 'info';
  position?: ToastPosition;
} & HTMLAttributes<HTMLDivElement>;

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: WarningCircle,
};

const Toast = ({
  variant = 'outlined',
  action = 'success',
  className = '',
  onClose,
  title,
  description,
  position = 'default',
  ...props
}: ToastProps) => {
  // Get classes from lookup tables
  const variantClasses = VARIANT_ACTION_CLASSES[variant][action];

  const positionClasses: Record<ToastPosition, string> = {
    'top-left': 'fixed top-4 left-4',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'fixed top-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'fixed bottom-4 right-4',
    default: '',
  };

  const IconAction = iconMap[action] || iconMap['success'];

  const baseClasses =
    'max-w-[390px] w-full flex flex-row items-start justify-between shadow-lg rounded-lg border p-4 gap-6 group';

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`${baseClasses} ${positionClasses[position]} ${variantClasses} ${className}`}
      {...props}
    >
      <div className="flex flex-row items-start gap-3">
        <span className="mt-1" data-testid={`toast-icon-${action}`}>
          <IconAction />
        </span>
        <div className="flex flex-col items-start justify-start">
          <p className="font-semibold text-md">{title}</p>
          {description && (
            <p className="text-md text-text-900">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-background-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X />
      </button>
    </div>
  );
};

export { Toast };
