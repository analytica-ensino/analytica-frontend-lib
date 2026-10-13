import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import {
  SUPPORT_CHAT_EVENT_TYPE,
  type SupportChatEventType,
} from '../../types/supportChat';

/**
 * Props for an event shown between support chat messages
 */
export interface SupportChatEventProps {
  /** Event kind; defaults to NEUTRAL */
  type?: SupportChatEventType;
  /** Event description, e.g. "Atendimento passou para humano" */
  text: string;
  /** Already formatted time appended as "text · time" */
  time?: string;
  /** Extra classes for the root element */
  className?: string;
}

/** Pill background and text color for each event type */
const PILL_CLASSES: Record<SupportChatEventType, string> = {
  [SUPPORT_CHAT_EVENT_TYPE.NEUTRAL]: 'bg-background-100',
  [SUPPORT_CHAT_EVENT_TYPE.TRANSFER]: 'bg-warning-50',
  [SUPPORT_CHAT_EVENT_TYPE.DATE]: 'bg-background-100',
};

const TEXT_COLORS: Record<SupportChatEventType, string> = {
  [SUPPORT_CHAT_EVENT_TYPE.NEUTRAL]: 'text-text-600',
  [SUPPORT_CHAT_EVENT_TYPE.TRANSFER]: 'text-warning-700',
  [SUPPORT_CHAT_EVENT_TYPE.DATE]: 'text-text-600',
};

/**
 * Centered pill describing a chat event.
 *
 * - NEUTRAL: gray pill (e.g. "Atendimento passou para humano")
 * - TRANSFER: orange pill (e.g. "IA transferiu para humano — motivo: …")
 * - DATE: gray pill between two horizontal lines, used as a date separator
 */
export default function SupportChatEvent({
  type = SUPPORT_CHAT_EVENT_TYPE.NEUTRAL,
  text,
  time,
  className,
}: Readonly<SupportChatEventProps>) {
  const isDate = type === SUPPORT_CHAT_EVENT_TYPE.DATE;
  const content = time ? `${text} · ${time}` : text;

  return (
    <div
      role={isDate ? 'separator' : undefined}
      aria-label={isDate ? content : undefined}
      className={cn('flex w-full items-center justify-center gap-3', className)}
    >
      {isDate && (
        <div
          aria-hidden="true"
          data-testid="support-chat-event-line"
          className="h-px flex-1 bg-border-100"
        />
      )}
      <div
        data-testid="support-chat-event-pill"
        className={cn('max-w-full rounded-xl px-2.5 py-1', PILL_CLASSES[type])}
      >
        <Text
          size="xs"
          weight={isDate ? 'medium' : 'normal'}
          color={TEXT_COLORS[type]}
          className="break-words text-center"
        >
          {content}
        </Text>
      </div>
      {isDate && (
        <div
          aria-hidden="true"
          data-testid="support-chat-event-line"
          className="h-px flex-1 bg-border-100"
        />
      )}
    </div>
  );
}
