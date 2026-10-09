import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import {
  SUPPORT_TIMELINE_STATUS,
  type SupportTimelineStatus,
} from '../../types/supportTimeline';

/**
 * Props for a support status timeline item
 */
export interface SupportTimelineItemProps {
  /** Status that defines the dot color and the default label */
  status: SupportTimelineStatus;
  /** Already formatted time, e.g. "13:41" */
  time: string;
  /** Overrides the default status label */
  label?: string;
  /** Extra classes for the root element */
  className?: string;
}

/** Dot color for each status */
const STATUS_DOT_CLASSES: Record<SupportTimelineStatus, string> = {
  [SUPPORT_TIMELINE_STATUS.OPEN]: 'bg-info-500',
  [SUPPORT_TIMELINE_STATUS.HUMAN]: 'bg-warning-500',
  [SUPPORT_TIMELINE_STATUS.IN_PROGRESS]: 'bg-indicator-positive',
  [SUPPORT_TIMELINE_STATUS.DONE]: 'bg-success-500',
};

/** Default label for each status */
const STATUS_LABELS: Record<SupportTimelineStatus, string> = {
  [SUPPORT_TIMELINE_STATUS.OPEN]: 'Aberto',
  [SUPPORT_TIMELINE_STATUS.HUMAN]: 'Humano',
  [SUPPORT_TIMELINE_STATUS.IN_PROGRESS]: 'Em progresso',
  [SUPPORT_TIMELINE_STATUS.DONE]: 'Concluído',
};

/**
 * Item of the support ticket status timeline: colored dot, label and time
 * aligned to the right.
 */
export default function SupportTimelineItem({
  status,
  time,
  label,
  className,
}: Readonly<SupportTimelineItemProps>) {
  return (
    <div
      className={cn('flex min-h-6.5 w-full items-center gap-2.5', className)}
    >
      <div
        aria-hidden="true"
        data-testid="support-timeline-dot"
        className={cn(
          'size-2 shrink-0 rounded-full',
          STATUS_DOT_CLASSES[status]
        )}
      />
      <Text size="sm" color="text-text-950" className="min-w-0 flex-1 truncate">
        {label ?? STATUS_LABELS[status]}
      </Text>
      <Text as="time" size="xs" color="text-text-600" className="shrink-0">
        {time}
      </Text>
    </div>
  );
}
