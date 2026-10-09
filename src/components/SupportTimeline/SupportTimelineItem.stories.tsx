import type { Story } from '@ladle/react';
import SupportTimelineItem from './SupportTimelineItem';
import { SUPPORT_TIMELINE_STATUS } from '../../types/supportTimeline';

/**
 * All statuses stacked as in the "Linha do tempo de status" list
 */
export const AllStatuses: Story = () => (
  <div className="flex w-full max-w-xs flex-col gap-4 p-4">
    <SupportTimelineItem status={SUPPORT_TIMELINE_STATUS.OPEN} time="13:41" />
    <SupportTimelineItem status={SUPPORT_TIMELINE_STATUS.HUMAN} time="13:41" />
    <SupportTimelineItem
      status={SUPPORT_TIMELINE_STATUS.IN_PROGRESS}
      time="13:41"
    />
    <SupportTimelineItem status={SUPPORT_TIMELINE_STATUS.DONE} time="13:41" />
  </div>
);

/**
 * Custom long label (truncated)
 */
export const LongLabel: Story = () => (
  <div className="flex w-full max-w-xs flex-col gap-4 p-4">
    <SupportTimelineItem
      status={SUPPORT_TIMELINE_STATUS.HUMAN}
      time="13:41"
      label="Chamado transferido para o atendimento humano da escola"
    />
  </div>
);
