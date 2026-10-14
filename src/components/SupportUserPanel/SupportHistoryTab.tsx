import { useState } from 'react';
import Badge from '../Badge/Badge';
import Chips from '../Chips/Chips';
import Text from '../Text/Text';
import { Skeleton } from '../Skeleton/Skeleton';
import { cn } from '../../utils/utils';
import {
  SUPPORT_HISTORY_FILTER,
  SUPPORT_TICKET_CARD_STATUS,
  type SupportHistoryFilter,
  type SupportHistorySummary,
  type SupportTicketCardStatus,
  type SupportTicketSummary,
} from '../../types/supportUserPanel';
import { StatTile } from './SupportPanelShared';
import {
  formatCardDate,
  formatDuration,
  matchesHistoryFilter,
} from './supportUserPanelUtils';

/** Cards shown before "Ver todos os atendimentos" */
const INITIAL_VISIBLE = 5;
/** Cards added by each "Ver todos os atendimentos" click */
const PAGE_SIZE = 10;

/** Props for the history tab */
export interface SupportHistoryTabProps {
  /** Id of the ticket open in the conversation (pinned on top, not clickable) */
  currentTicketId: number;
  /** Every ticket of the contact, including the current one */
  tickets: SupportTicketSummary[];
  summary: SupportHistorySummary;
  loading?: boolean;
  /** Whether the server has tickets beyond `tickets` */
  hasMore?: boolean;
  /** Asks the consumer for the next page once the loaded cards run out */
  onLoadMore?: () => void;
  /** Opens another ticket in the central area */
  onOpenTicket?: (ticketId: number) => void;
  /** Notified on filter change (e.g. to filter on the server) */
  onFilterChange?: (filter: SupportHistoryFilter) => void;
}

const FILTERS: { value: SupportHistoryFilter; label: string }[] = [
  { value: SUPPORT_HISTORY_FILTER.ALL, label: 'Todos' },
  { value: SUPPORT_HISTORY_FILTER.OPEN, label: 'Abertos' },
  { value: SUPPORT_HISTORY_FILTER.DONE, label: 'Concluídos' },
  { value: SUPPORT_HISTORY_FILTER.AI, label: 'IA' },
];

// `warning` rather than `orange` for the human statuses: the `orange-*`
// colors are not theme tokens, so they would not follow dark mode.
const STATUS_BADGE: Record<
  SupportTicketCardStatus,
  { label: string; action: 'info' | 'warning' | 'success' }
> = {
  [SUPPORT_TICKET_CARD_STATUS.IN_PROGRESS]: {
    label: 'EM ANDAMENTO',
    action: 'info',
  },
  [SUPPORT_TICKET_CARD_STATUS.WAITING_HUMAN]: {
    label: 'AGUARDANDO HUMANO',
    action: 'warning',
  },
  [SUPPORT_TICKET_CARD_STATUS.HUMAN]: {
    label: 'HUMANO',
    action: 'warning',
  },
  [SUPPORT_TICKET_CARD_STATUS.DONE]: {
    label: 'CONCLUÍDO',
    action: 'success',
  },
};

const resolverLabel = (ticket: SupportTicketSummary) => {
  if (!ticket.resolvedBy) return null;
  return ticket.resolvedBy.type === 'ai' ? 'IA' : ticket.resolvedBy.name;
};

const TicketCardBody = ({
  ticket,
  current,
}: {
  ticket: SupportTicketSummary;
  current: boolean;
}) => {
  const badge = STATUS_BADGE[ticket.status];
  const resolver = current ? 'Você' : resolverLabel(ticket);
  const reason = [ticket.reason, ticket.subreason].filter(Boolean).join(' · ');
  let duration: string | null = null;
  if (current) duration = 'Ticket atual';
  else if (ticket.durationMin != null)
    duration = formatDuration(ticket.durationMin);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Text size="xs" color="text-text-600">
          #{ticket.id} · {formatCardDate(ticket.createdAt)}
        </Text>
        <Badge
          variant="solid"
          action={badge.action}
          size="small"
          className="shrink-0 font-bold"
        >
          {badge.label}
        </Badge>
      </div>
      <Text
        size="sm"
        weight="semibold"
        color="text-text-950"
        className="line-clamp-2 text-left"
      >
        {ticket.title}
      </Text>
      {reason && (
        <Text size="xs" color="text-text-600">
          {reason}
        </Text>
      )}
      {(resolver || duration) && (
        <div className="flex items-center justify-between gap-2 text-xs text-text-600">
          <span>
            {resolver && (
              <>
                {current ? 'Atendido por: ' : 'Resolvido por: '}
                <span className="font-medium text-text-950">{resolver}</span>
              </>
            )}
          </span>
          {duration && <span>{duration}</span>}
        </div>
      )}
    </>
  );
};

const cardClasses =
  'flex w-full flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left';

/**
 * History tab: summary stats, single-choice filter and the contact's
 * tickets, current one pinned on top.
 */
export default function SupportHistoryTab({
  currentTicketId,
  tickets,
  summary,
  loading = false,
  hasMore = false,
  onLoadMore,
  onOpenTicket,
  onFilterChange,
}: Readonly<SupportHistoryTabProps>) {
  const [filter, setFilter] = useState<SupportHistoryFilter>(
    SUPPORT_HISTORY_FILTER.ALL
  );
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  const selectFilter = (next: SupportHistoryFilter) => {
    setFilter(next);
    setVisible(INITIAL_VISIBLE);
    onFilterChange?.(next);
  };

  const current = tickets.find((ticket) => ticket.id === currentTicketId);
  const others = tickets
    .filter((ticket) => ticket.id !== currentTicketId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const ordered = [...(current ? [current] : []), ...others].filter((ticket) =>
    matchesHistoryFilter(ticket, filter)
  );
  const shown = ordered.slice(0, visible);
  const canShowMore = ordered.length > visible || hasMore;
  const isFirstContact = !loading && tickets.length <= 1;

  const showMore = () => {
    if (ordered.length <= visible + PAGE_SIZE && hasMore) onLoadMore?.();
    setVisible((count) => count + PAGE_SIZE);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Tickets" value={summary.total} valueSize="md" />
        <StatTile label="Resolvidos" value={summary.resolved} valueSize="md" />
        <StatTile
          label="Média"
          value={summary.avgMin == null ? '—' : formatDuration(summary.avgMin)}
          valueSize="md"
        />
      </div>

      <div
        role="radiogroup"
        aria-label="Filtrar tickets"
        className="flex flex-wrap gap-1.5"
      >
        {FILTERS.map((item) => (
          <Chips
            key={item.value}
            role="radio"
            aria-checked={filter === item.value}
            selected={filter === item.value}
            onClick={() => selectFilter(item.value)}
            className="px-3 py-1 text-xs"
          >
            {item.label}
          </Chips>
        ))}
      </div>

      {loading ? (
        <div
          className="flex flex-col gap-2"
          aria-busy="true"
          aria-label="Carregando histórico"
        >
          <Skeleton variant="rounded" height={96} />
          <Skeleton variant="rounded" height={96} />
          <Skeleton variant="rounded" height={96} />
        </div>
      ) : (
        <>
          {shown.length === 0 ? (
            <Text size="xs" color="text-text-600" className="text-center">
              Nenhum ticket com esse filtro
            </Text>
          ) : (
            <ul aria-label="Tickets do usuário" className="flex flex-col gap-2">
              {shown.map((ticket) => {
                const isCurrent = ticket.id === currentTicketId;
                return (
                  <li key={ticket.id}>
                    {isCurrent || !onOpenTicket ? (
                      <div
                        aria-current={isCurrent ? 'true' : undefined}
                        className={cn(
                          cardClasses,
                          isCurrent
                            ? 'border-primary-100 bg-primary-50'
                            : 'border-border-200 bg-background'
                        )}
                      >
                        <TicketCardBody ticket={ticket} current={isCurrent} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenTicket(ticket.id)}
                        className={cn(
                          cardClasses,
                          'border-border-200 bg-background hover:border-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info'
                        )}
                      >
                        <TicketCardBody ticket={ticket} current={false} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {isFirstContact && filter === SUPPORT_HISTORY_FILTER.ALL && (
            <Text size="xs" color="text-text-600" className="text-center">
              Primeiro atendimento deste usuário
            </Text>
          )}

          {canShowMore && (
            <button
              type="button"
              onClick={showMore}
              className="self-center rounded-sm text-xs font-medium text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
            >
              Ver todos os atendimentos
            </button>
          )}
        </>
      )}
    </div>
  );
}
