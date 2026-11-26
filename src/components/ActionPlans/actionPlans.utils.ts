import {
  ACTION_PLAN_EVENT_TYPE,
  ACTION_PLAN_FIELD,
  ACTION_PLAN_STATUS,
  ACTION_PLAN_STATUSES,
  type ActionPlanEvent,
  type ActionPlanStatus,
} from '../../types/actionPlans';

/** The time zone the backend takes "today" in for deadlines. */
const ACTION_PLAN_TIME_ZONE = 'America/Sao_Paulo';

/** Label of each status, as the badges and the status select show it. */
export const ACTION_PLAN_STATUS_LABELS: Record<ActionPlanStatus, string> = {
  [ACTION_PLAN_STATUS.NOT_STARTED]: 'Não iniciado',
  [ACTION_PLAN_STATUS.IN_PROGRESS]: 'Em andamento',
  [ACTION_PLAN_STATUS.DONE]: 'Concluído',
  [ACTION_PLAN_STATUS.CANCELED]: 'Cancelado',
};

/** Badge color of each status. */
export const ACTION_PLAN_STATUS_BADGE_ACTIONS = {
  [ACTION_PLAN_STATUS.NOT_STARTED]: 'muted',
  [ACTION_PLAN_STATUS.IN_PROGRESS]: 'info',
  [ACTION_PLAN_STATUS.DONE]: 'success',
  [ACTION_PLAN_STATUS.CANCELED]: 'error',
} as const satisfies Record<ActionPlanStatus, string>;

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Today in São Paulo, as YYYY-MM-DD: the day the backend measures deadlines
 * against, whatever the browser's time zone.
 *
 * @param now - The current instant
 * @returns The date
 */
export const todayInSaoPaulo = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: ACTION_PLAN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

/**
 * A YYYY-MM-DD date some days later.
 *
 * @param date - YYYY-MM-DD
 * @param days - Days to add
 * @returns YYYY-MM-DD
 */
export const addDays = (date: string, days: number): string => {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
};

/**
 * A deadline as the table shows it: day and month ("12/05").
 *
 * @param date - YYYY-MM-DD
 * @returns The short date
 */
export const formatShortDate = (date: string): string => {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
};

/**
 * A deadline as the detail shows it ("12/05/2026").
 *
 * @param date - YYYY-MM-DD
 * @returns The full date
 */
export const formatFullDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * When a history entry happened, in the browser's time ("14 maio 2025, 09:32").
 *
 * @param iso - The instant
 * @returns The date and time, or an empty string when unknown
 */
export const formatEventDate = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

/**
 * When the origin's data was read ("Hoje, às 10:00" or "12/05/2026, às 10:00").
 *
 * @param iso - The instant
 * @param now - The current instant
 * @returns The date and time, or an empty string when unknown
 */
export const formatQueriedAt = (iso: string, now: Date = new Date()) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return `Hoje, às ${time}`;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, às ${time}`;
};

/** The "Prazo" choices of the "Filtros" modal. */
export const DEADLINE_RANGE = {
  ALL: 'all',
  NEXT_7_DAYS: 'next7',
  NEXT_30_DAYS: 'next30',
  CUSTOM: 'custom',
} as const;

export type DeadlineRange =
  (typeof DEADLINE_RANGE)[keyof typeof DEADLINE_RANGE];

export const DEADLINE_RANGE_LABELS: Record<DeadlineRange, string> = {
  [DEADLINE_RANGE.ALL]: 'Todos',
  [DEADLINE_RANGE.NEXT_7_DAYS]: 'Próximos 7 dias',
  [DEADLINE_RANGE.NEXT_30_DAYS]: 'Próximos 30 dias',
  [DEADLINE_RANGE.CUSTOM]: 'Escolher período',
};

/**
 * The filters of the "Filtros" modal. A null group is "todos" (every item
 * checked, the default), which filters nothing.
 */
export interface ActionPlanFilters {
  statuses: ActionPlanStatus[] | null;
  schoolIds: string[] | null;
  responsibleIds: string[] | null;
  deadline: DeadlineRange;
  /** YYYY-MM-DD, for the custom period */
  deadlineFrom: string;
  deadlineTo: string;
  lateOnly: boolean;
}

export const EMPTY_ACTION_PLAN_FILTERS: ActionPlanFilters = {
  statuses: null,
  schoolIds: null,
  responsibleIds: null,
  deadline: DEADLINE_RANGE.ALL,
  deadlineFrom: '',
  deadlineTo: '',
  lateOnly: false,
};

/**
 * A group's selection as the filters keep it: null when it narrows nothing
 * (every option or none checked).
 *
 * @param selected - The checked ids
 * @param all - Every option's id
 * @returns The ids, or null for "todos"
 */
export const narrowedSelection = <T extends string>(
  selected: T[],
  all: readonly T[]
): T[] | null => {
  if (selected.length === 0) return null;
  const everything = all.every((id) => selected.includes(id));
  return everything ? null : selected;
};

/**
 * The deadline window of the filters, as the list's query takes it.
 *
 * @param filters - The applied filters
 * @param today - Today in São Paulo (YYYY-MM-DD)
 * @returns `deadlineFrom`/`deadlineTo`, each only when set
 */
export const deadlineWindow = (
  filters: Pick<ActionPlanFilters, 'deadline' | 'deadlineFrom' | 'deadlineTo'>,
  today: string
): { deadlineFrom?: string; deadlineTo?: string } => {
  switch (filters.deadline) {
    case DEADLINE_RANGE.NEXT_7_DAYS:
      return { deadlineFrom: today, deadlineTo: addDays(today, 7) };
    case DEADLINE_RANGE.NEXT_30_DAYS:
      return { deadlineFrom: today, deadlineTo: addDays(today, 30) };
    case DEADLINE_RANGE.CUSTOM:
      return {
        ...(filters.deadlineFrom && { deadlineFrom: filters.deadlineFrom }),
        ...(filters.deadlineTo && { deadlineTo: filters.deadlineTo }),
      };
    default:
      return {};
  }
};

/**
 * The query of `GET /action-plans` for the applied filters (besides the tab,
 * the search, the sort and the page, which the table sends).
 *
 * @param filters - The applied filters
 * @param today - Today in São Paulo (YYYY-MM-DD)
 * @returns The params; "todos" groups are left out
 */
export const filtersToParams = (
  filters: ActionPlanFilters,
  today: string
): Record<string, unknown> => ({
  ...(filters.statuses && { status: filters.statuses }),
  ...(filters.schoolIds && { schoolIds: filters.schoolIds }),
  ...(filters.responsibleIds && { responsibleIds: filters.responsibleIds }),
  ...deadlineWindow(filters, today),
  ...(filters.lateOnly && { late: 'true' }),
});

/**
 * How many filters narrow the list, for the "Filtros" button.
 *
 * @param filters - The applied filters
 * @returns The count
 */
export const countActiveFilters = (filters: ActionPlanFilters): number =>
  [
    filters.statuses,
    filters.schoolIds,
    filters.responsibleIds,
    filters.deadline === DEADLINE_RANGE.ALL ? null : filters.deadline,
    filters.lateOnly || null,
  ].filter((value) => value !== null).length;

const isStatus = (value: string | null): value is ActionPlanStatus =>
  ACTION_PLAN_STATUSES.includes(value as ActionPlanStatus);

const statusLabel = (value: string | null) =>
  isStatus(value) ? ACTION_PLAN_STATUS_LABELS[value] : (value ?? '');

const deadlineLabel = (value: string | null) =>
  value ? formatFullDate(value) : '';

/**
 * One history entry as a sentence ("Ana Souza alterou o status de 'Não
 * iniciado' para 'Em andamento'").
 *
 * @description The description changes say only that it changed: the text
 * can be long. An author whose enrollment is gone is "Usuário removido". A
 * type this screen does not know yet reads as a plain change.
 *
 * @param event - The entry
 * @returns The sentence
 */
export const describeActionPlanEvent = (event: ActionPlanEvent): string => {
  const actor = event.actor?.name || 'Usuário removido';

  switch (event.type) {
    case ACTION_PLAN_EVENT_TYPE.CREATED:
      return `${actor} criou este plano`;
    case ACTION_PLAN_EVENT_TYPE.STATUS_CHANGED:
      return `${actor} alterou o status de '${statusLabel(
        event.fromValue
      )}' para '${statusLabel(event.toValue)}'`;
    case ACTION_PLAN_EVENT_TYPE.RESPONSIBLE_CHANGED:
      return event.fromName
        ? `${actor} alterou o responsável de '${event.fromName}' para '${
            event.toName ?? 'Usuário removido'
          }'`
        : `${actor} definiu '${event.toName ?? 'Usuário removido'}' como responsável`;
    case ACTION_PLAN_EVENT_TYPE.UPDATED:
      if (event.field === ACTION_PLAN_FIELD.TITLE) {
        return `${actor} alterou o título de '${event.fromValue ?? ''}' para '${
          event.toValue ?? ''
        }'`;
      }
      if (event.field === ACTION_PLAN_FIELD.DEADLINE) {
        return `${actor} alterou o prazo de '${deadlineLabel(
          event.fromValue
        )}' para '${deadlineLabel(event.toValue)}'`;
      }
      if (event.field === ACTION_PLAN_FIELD.DESCRIPTION) {
        return `${actor} alterou a descrição`;
      }
      return `${actor} alterou o plano`;
    default:
      return `${actor} alterou o plano`;
  }
};
