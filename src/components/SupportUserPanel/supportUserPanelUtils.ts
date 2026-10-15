import {
  SUPPORT_HISTORY_FILTER,
  SUPPORT_TICKET_CARD_STATUS,
  type SupportHistoryFilter,
  type SupportTicketSummary,
} from '../../types/supportUserPanel';

const pad = (value: number) => String(value).padStart(2, '0');

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isYesterday = (date: Date, now: Date) => {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameDay(date, yesterday);
};

/** `dd/mm/aaaa` */
export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/** `HH:MM` */
export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** `Hoje`, `Ontem` or `dd/mm/aaaa` — used for the contact's last contact */
export const formatRelativeDay = (iso: string, now = new Date()): string => {
  const date = new Date(iso);
  if (isSameDay(date, now)) return 'Hoje';
  if (isYesterday(date, now)) return 'Ontem';
  return formatDate(iso);
};

/** `Hoje, HH:MM` or `dd/mm/aaaa` — history cards */
export const formatCardDate = (iso: string, now = new Date()): string =>
  isSameDay(new Date(iso), now) ? `Hoje, ${formatTime(iso)}` : formatDate(iso);

/** `Hoje, HH:MM` or `dd/mm, HH:MM` — "Aberto em" stat */
export const formatOpenedAt = (iso: string, now = new Date()): string => {
  const date = new Date(iso);
  if (isSameDay(date, now)) return `Hoje, ${formatTime(iso)}`;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}, ${formatTime(iso)}`;
};

/** `HH:MM` for today, `dd/mm HH:MM` otherwise — status timeline */
export const formatTimelineTime = (iso: string, now = new Date()): string => {
  const date = new Date(iso);
  if (isSameDay(date, now)) return formatTime(iso);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${formatTime(iso)}`;
};

/** `(DD) 9XXXX-XXXX`; values that are not a BR number are returned as given */
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

/** `18 min`, `1h 05min` */
export const formatDuration = (minutes: number): string => {
  const total = Math.max(0, Math.floor(minutes));
  if (total < 60) return `${total} min`;
  return `${Math.floor(total / 60)}h ${pad(total % 60)}min`;
};

/** Whole minutes between two ISO dates (or between a date and `now`) */
export const minutesBetween = (
  fromIso: string,
  toIso: string | null | undefined,
  now = new Date()
): number => {
  const to = toIso ? new Date(toIso) : now;
  return Math.max(
    0,
    Math.floor((to.getTime() - new Date(fromIso).getTime()) / 60_000)
  );
};

/** Whether a ticket card matches the selected history filter */
export const matchesHistoryFilter = (
  ticket: SupportTicketSummary,
  filter: SupportHistoryFilter
): boolean => {
  const done = ticket.status === SUPPORT_TICKET_CARD_STATUS.DONE;
  switch (filter) {
    case SUPPORT_HISTORY_FILTER.OPEN:
      return !done;
    case SUPPORT_HISTORY_FILTER.DONE:
      return done;
    case SUPPORT_HISTORY_FILTER.AI:
      return done && ticket.resolvedBy?.type === 'ai';
    default:
      return true;
  }
};
