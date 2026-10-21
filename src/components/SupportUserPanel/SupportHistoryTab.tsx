import { useId, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import Chips from '../Chips/Chips';
import Text from '../Text/Text';
import { Skeleton } from '../Skeleton/Skeleton';
import { cn } from '../../utils/utils';
import {
  SUPPORT_HISTORY_FILTER,
  SUPPORT_TICKET_CARD_STATUS,
  SUPPORT_TICKET_PRIORITY,
  type SupportHistoryFilter,
  type SupportHistorySummary,
  type SupportTicketCardStatus,
  type SupportTicketId,
  type SupportTicketPriority,
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
  currentTicketId: SupportTicketId;
  /** Every ticket of the contact, including the current one */
  tickets: SupportTicketSummary[];
  summary: SupportHistorySummary;
  loading?: boolean;
  /** Whether the server has tickets beyond `tickets` */
  hasMore?: boolean;
  /** Asks the consumer for the next page once the loaded cards run out */
  onLoadMore?: () => void;
  /** Opens another ticket in the central area */
  onOpenTicket?: (ticketId: SupportTicketId) => void;
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

const PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  [SUPPORT_TICKET_PRIORITY.LOW]: 'Baixa',
  [SUPPORT_TICKET_PRIORITY.NORMAL]: 'Normal',
  [SUPPORT_TICKET_PRIORITY.HIGH]: 'Alta',
  [SUPPORT_TICKET_PRIORITY.URGENT]: 'Urgente',
};

/**
 * Ticket of the history list. The primary info is always visible; the
 * chevron expands the secondary details (priority, channel, duration) and
 * the link that opens the ticket.
 */
const TicketCard = ({
  ticket,
  current,
  onOpen,
}: {
  ticket: SupportTicketSummary;
  current: boolean;
  onOpen?: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const badge = STATUS_BADGE[ticket.status];
  const resolver = current ? 'Você' : resolverLabel(ticket);
  const meta = [
    formatCardDate(ticket.createdAt),
    ticket.reason,
    ticket.subreason,
  ]
    .filter(Boolean)
    .join(' · ');

  const details: [string, string][] = [];
  if (ticket.priority) {
    details.push(['Prioridade', PRIORITY_LABELS[ticket.priority]]);
  }
  if (ticket.channel) details.push(['Canal', ticket.channel]);
  if (current) details.push(['Duração', 'Ticket atual']);
  else if (ticket.durationMin != null) {
    details.push(['Duração', formatDuration(ticket.durationMin)]);
  }
  const canOpen = !current && Boolean(onOpen);
  const expandable = details.length > 0 || canOpen;

  return (
    <div
      aria-current={current ? 'true' : undefined}
      className={cn(
        'flex w-full flex-col gap-1.5 rounded-xl border border-border-200 bg-background px-3 py-2.5 hover:border-primary-100'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {/* The current ticket is marked by color only (no background). */}
        <Text
          size="xs"
          weight={current ? 'semibold' : undefined}
          color={current ? 'text-primary-800' : 'text-text-600'}
        >
          {ticket.code ?? `#${ticket.id}`}
        </Text>
        <div className="flex shrink-0 items-center gap-1">
          <Badge
            variant="solid"
            action={badge.action}
            size="small"
            className="font-bold"
          >
            {badge.label}
          </Badge>
          {expandable && (
            <Button
              variant="raw"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls={detailsId}
              aria-label={`${expanded ? 'Recolher' : 'Expandir'} ticket ${ticket.code ?? `#${ticket.id}`}`}
              className="rounded-sm p-0.5 text-text-600 hover:text-text-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
            >
              <CaretDownIcon
                size={14}
                aria-hidden="true"
                className={cn('transition-transform', expanded && 'rotate-180')}
              />
            </Button>
          )}
        </div>
      </div>
      <Text
        size="sm"
        weight="semibold"
        color="text-text-950"
        className="line-clamp-2"
      >
        {ticket.title}
      </Text>
      <Text size="xs" color="text-text-600">
        {meta}
      </Text>
      {resolver && (
        <Text size="xs" color="text-text-600">
          {current ? 'Atendido por: ' : 'Resolvido por: '}
          <Text as="span" size="xs" weight="medium" color="text-text-950">
            {resolver}
          </Text>
        </Text>
      )}
      {expandable && expanded && (
        <div
          id={detailsId}
          className="flex flex-col gap-1.5 border-t border-border-100 pt-2"
        >
          {details.length > 0 && (
            <dl className="flex flex-col gap-1">
              {details.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-baseline justify-between gap-3"
                >
                  <Text as="dt" size="xs" color="text-text-600">
                    {key}
                  </Text>
                  <Text as="dd" size="xs" weight="medium" color="text-text-950">
                    {value}
                  </Text>
                </div>
              ))}
            </dl>
          )}
          {canOpen && (
            <Button
              variant="link"
              size="extra-small"
              onClick={onOpen}
              className="self-start p-0! font-medium"
            >
              Abrir atendimento
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

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
                    <TicketCard
                      ticket={ticket}
                      current={isCurrent}
                      onOpen={
                        onOpenTicket ? () => onOpenTicket(ticket.id) : undefined
                      }
                    />
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
            <Button
              variant="link"
              size="extra-small"
              onClick={showMore}
              className="self-center p-0! font-medium"
            >
              Ver todos os atendimentos
            </Button>
          )}
        </>
      )}
    </div>
  );
}
