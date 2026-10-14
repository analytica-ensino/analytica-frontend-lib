import { useId } from 'react';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import Text from '../Text/Text';
import { Skeleton } from '../Skeleton/Skeleton';
import SupportTimelineItem from '../SupportTimeline/SupportTimelineItem';
import {
  SUPPORT_TICKET_PRIORITY,
  type SupportReasonOption,
  type SupportTicketDetails,
  type SupportTicketPriority,
} from '../../types/supportUserPanel';
import {
  FieldLabel,
  StatTile,
  useNow,
  useOptimisticValue,
} from './SupportPanelShared';
import {
  formatDuration,
  formatOpenedAt,
  formatTimelineTime,
  minutesBetween,
} from './supportUserPanelUtils';

/** Props for the ticket details tab */
export interface SupportTicketDetailsTabProps {
  ticket?: SupportTicketDetails | null;
  loading?: boolean;
  /** Reason catalog (motivos / FAQ) */
  reasonOptions: SupportReasonOption[];
  /** Persists the reason; reject to roll back */
  onReasonChange?: (reason: string) => Promise<void> | void;
  /** Persists the priority; reject to roll back */
  onPriorityChange?: (priority: SupportTicketPriority) => Promise<void> | void;
}

const PRIORITIES: { value: SupportTicketPriority; label: string }[] = [
  { value: SUPPORT_TICKET_PRIORITY.LOW, label: 'Baixa' },
  { value: SUPPORT_TICKET_PRIORITY.NORMAL, label: 'Normal' },
  { value: SUPPORT_TICKET_PRIORITY.HIGH, label: 'Alta' },
  { value: SUPPORT_TICKET_PRIORITY.URGENT, label: 'Urgente' },
];

const DetailsSkeleton = () => (
  <div
    className="flex flex-col gap-4"
    aria-busy="true"
    aria-label="Carregando ticket"
  >
    <div className="grid grid-cols-2 gap-2">
      {[0, 1, 2, 3].map((key) => (
        <Skeleton key={key} variant="rounded" height={56} />
      ))}
    </div>
    <Skeleton variant="rounded" height={40} />
    <Skeleton variant="rounded" height={36} />
    <Skeleton variant="rounded" height={88} />
  </div>
);

/**
 * Ticket details tab: channel/time stats, the editable reason and priority
 * (read-only once the ticket is concluded), the AI summary and the status
 * timeline.
 */
export default function SupportTicketDetailsTab({
  ticket,
  loading = false,
  reasonOptions,
  onReasonChange,
  onPriorityChange,
}: Readonly<SupportTicketDetailsTabProps>) {
  const reasonLabelId = useId();
  const priorityLabelId = useId();
  const done = ticket?.done ?? false;
  const now = useNow(Boolean(ticket) && !done);
  const [reason, setReason] = useOptimisticValue(
    ticket?.reason ?? '',
    onReasonChange
  );
  const [priority, setPriority] = useOptimisticValue<SupportTicketPriority>(
    ticket?.priority ?? SUPPORT_TICKET_PRIORITY.NORMAL,
    onPriorityChange
  );

  if (loading || !ticket) return <DetailsSkeleton />;

  // Wait = opening → first human reply; it keeps running while nobody has
  // answered yet. Total = opening → conclusion (or now while open).
  const waitEnd = ticket.firstHumanAt ?? ticket.closedAt;
  const waitingMin = minutesBetween(ticket.openedAt, waitEnd, now);
  const totalMin = minutesBetween(ticket.openedAt, ticket.closedAt, now);
  const readOnly = done;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Canal" value={ticket.channel} />
        <StatTile label="Aberto em" value={formatOpenedAt(ticket.openedAt)} />
        <StatTile label="Tempo de espera" value={formatDuration(waitingMin)} />
        <StatTile label="Tempo total" value={formatDuration(totalMin)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel id={reasonLabelId}>Motivo</FieldLabel>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger
            aria-labelledby={reasonLabelId}
            disabled={readOnly || !onReasonChange}
            className="w-full"
          >
            <SelectValue placeholder="Não definido" />
          </SelectTrigger>
          <SelectContent>
            {reasonOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel id={priorityLabelId}>Prioridade</FieldLabel>
        <Select
          value={priority}
          onValueChange={(value) => {
            if (value !== priority) {
              setPriority(value as SupportTicketPriority);
            }
          }}
        >
          <SelectTrigger
            aria-labelledby={priorityLabelId}
            disabled={readOnly || !onPriorityChange}
            className="w-full"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section
        aria-label="Resumo da IA"
        className="flex flex-col gap-1.5 rounded-xl border border-info-100 bg-info-background p-3"
      >
        <Text
          as="h3"
          size="xs"
          weight="bold"
          color="text-info-800"
          className="uppercase"
        >
          <span aria-hidden="true">✦ </span>Resumo da IA
        </Text>
        <Text
          size="xs"
          color={ticket.aiSummary ? 'text-text-950' : 'text-text-600'}
          className="leading-[1.45]"
        >
          {ticket.aiSummary ||
            'A IA ainda não gerou um resumo para este ticket.'}
        </Text>
      </section>

      {ticket.timeline.length > 0 && (
        <ol aria-label="Linha do tempo de status" className="flex flex-col">
          {ticket.timeline.map((event) => (
            <li key={`${event.status}-${event.at}`}>
              <SupportTimelineItem
                status={event.status}
                time={formatTimelineTime(event.at)}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
