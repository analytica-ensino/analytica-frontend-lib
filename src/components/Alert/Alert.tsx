import { HTMLAttributes } from 'react';
import { CheckCircle, Info, WarningCircle, XCircle } from 'phosphor-react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

type AlertProps = {
  title?: string;
  description: string;
  variant?: 'solid' | 'outline';
  action?: 'default' | 'info' | 'success' | 'warning' | 'error';
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const VARIANT_ACTION_CLASSES = {
  solid: {
    default: 'bg-background-50 border-transparent',
    info: 'bg-info border-transparent',
    success: 'bg-success border-transparent',
    warning: 'bg-warning border-transparent',
    error: 'bg-error border-transparent',
  },
  outline: {
    default: 'bg-background border border-border-100',
    info: 'bg-background border border-border-100',
    success: 'bg-background border border-border-100',
    warning: 'bg-background border border-border-100',
    error: 'bg-background border border-border-100',
  },
} as const;

const COLOR_CLASSES = {
  default: 'text-text-950',
  info: 'text-info-800',
  success: 'text-success-800',
  warning: 'text-warning-800',
  error: 'text-error-800',
} as const;

const ICONS = {
  default: <CheckCircle size={18} />,
  info: <Info size={18} />,
  success: <CheckCircle size={18} />,
  warning: <WarningCircle size={18} />,
  error: <XCircle size={18} />,
} as const;

const Alert = ({
  variant = 'solid',
  title,
  description,
  action = 'default',
  className,
  ...props
}: AlertProps) => {
  const baseClasses =
    'alert-wrapper flex items-start gap-2 w-[384px] py-3 px-4 font-inherit rounded-md';
  const variantClasses = VARIANT_ACTION_CLASSES[variant][action];
  const variantColor = COLOR_CLASSES[action];
  const variantIcon = ICONS[action];
  const hasHeading = Boolean(title);

  return (
    <div className={cn(baseClasses, variantClasses, className)} {...props}>
      <span className={cn('mt-0.5', variantColor)}>{variantIcon}</span>
      <div>
        {hasHeading && (
          <Text
            size="md"
            weight="medium"
            color={variantColor}
            className="mb-0.5"
          >
            {title}
          </Text>
        )}
        <Text
          size={hasHeading ? 'sm' : 'md'}
          weight="normal"
          color={!hasHeading ? variantColor : 'text-text-700'}
        >
          {description}
        </Text>
      </div>
    </div>
  );
};

export default Alert;
