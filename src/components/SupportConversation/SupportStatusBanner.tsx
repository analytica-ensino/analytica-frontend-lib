import type { ReactNode } from 'react';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { RobotIcon } from '@phosphor-icons/react/dist/csr/Robot';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { InfoIcon } from '@phosphor-icons/react/dist/csr/Info';
import Text from '../Text/Text';
import Button from '../Button/Button';
import { cn } from '../../utils/utils';
import {
  SUPPORT_STATUS_BANNER_VARIANT,
  type SupportStatusBannerAction,
  type SupportStatusBannerVariant,
} from '../../types/supportConversation';

/**
 * Props of the SupportStatusBanner component
 */
export interface SupportStatusBannerProps {
  /** Color and icon, by ticket state; defaults to INFO */
  variant?: SupportStatusBannerVariant;
  /** Bold line, e.g. "Aguardando resposta do backoffice" */
  title: string;
  /** Smaller line, e.g. "Na fila há 17 min · transferido pela IA" */
  description?: string;
  /** Button on the right, e.g. "Responder como humano" */
  action?: SupportStatusBannerAction;
  /** Overrides the variant icon */
  icon?: ReactNode;
  className?: string;
}

/** Card, icon and title colors of each variant */
const VARIANT_CLASSES: Record<
  SupportStatusBannerVariant,
  { card: string; icon: string; title: string; description: string }
> = {
  [SUPPORT_STATUS_BANNER_VARIANT.WAITING]: {
    card: 'bg-warning-50 border-warning-200',
    icon: 'text-warning-700',
    title: 'text-warning-800',
    description: 'text-warning-700',
  },
  [SUPPORT_STATUS_BANNER_VARIANT.AI]: {
    card: 'bg-primary-50 border-primary-100',
    icon: 'text-primary-800',
    title: 'text-primary-800',
    description: 'text-primary-700',
  },
  [SUPPORT_STATUS_BANNER_VARIANT.DONE]: {
    card: 'bg-success-50 border-success-200',
    icon: 'text-success-700',
    title: 'text-success-800',
    description: 'text-success-700',
  },
  [SUPPORT_STATUS_BANNER_VARIANT.INFO]: {
    card: 'bg-background-50 border-border-100',
    icon: 'text-text-600',
    title: 'text-text-900',
    description: 'text-text-600',
  },
};

const VARIANT_ICONS: Record<SupportStatusBannerVariant, ReactNode> = {
  [SUPPORT_STATUS_BANNER_VARIANT.WAITING]: <ClockIcon size={20} />,
  [SUPPORT_STATUS_BANNER_VARIANT.AI]: <RobotIcon size={20} />,
  [SUPPORT_STATUS_BANNER_VARIANT.DONE]: <CheckCircleIcon size={20} />,
  [SUPPORT_STATUS_BANNER_VARIANT.INFO]: <InfoIcon size={20} />,
};

/**
 * Fixed notice on top of the support conversation, by ticket state:
 *
 * - WAITING: "Aguardando resposta do backoffice — Na fila há 17 min ·
 *   transferido pela IA" (orange, no button: the composer is already open)
 * - AI: "O assistente virtual está atendendo. Você está acompanhando." with
 *   the "Responder como humano" action (blue)
 * - DONE: concluded ticket (green)
 * - INFO: any other neutral notice (gray)
 *
 * The consumer decides when to show it; the banner only renders the state.
 */
export default function SupportStatusBanner({
  variant = SUPPORT_STATUS_BANNER_VARIANT.INFO,
  title,
  description,
  action,
  icon,
  className,
}: Readonly<SupportStatusBannerProps>) {
  const classes = VARIANT_CLASSES[variant];

  return (
    <div
      role="status"
      data-testid="support-status-banner"
      data-variant={variant}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3',
        classes.card,
        className
      )}
    >
      <span aria-hidden="true" className={cn('shrink-0', classes.icon)}>
        {icon ?? VARIANT_ICONS[variant]}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text size="sm" weight="bold" color={classes.title}>
          {title}
        </Text>
        {description && (
          <Text size="xs" color={classes.description}>
            {description}
          </Text>
        )}
      </div>
      {action && (
        <Button
          variant="solid"
          action="primary"
          size="small"
          onClick={action.onClick}
          disabled={action.disabled}
          className="shrink-0"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
