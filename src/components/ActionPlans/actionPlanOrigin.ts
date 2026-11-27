import {
  ACTION_PLAN_ORIGIN_LIMITS,
  type ActionPlanOrigin,
  type ActionPlanOriginType,
} from '../../types/actionPlans';

/** What a screen says about itself when a plan is made from it. */
export interface ActionPlanOriginInput {
  type: ActionPlanOriginType;
  /** The report's name, e.g. "Simulados" */
  report: string;
  /** The filters applied, as the screen shows them */
  filters?: ReadonlyArray<string | null | undefined>;
  /** The block the plan answers, e.g. "Estudantes com maior dificuldade" */
  indicator?: string | null;
  /** What the block showed, e.g. "42%" or the names listed */
  value?: string | null;
  /** The address of the screen, e.g. `location.pathname + location.search` */
  link?: string | null;
  sources?: ActionPlanOrigin['sources'];
}

/**
 * A text cut to the size the API keeps, with an ellipsis when cut.
 * @param {string} text - The text
 * @param {number} max - The most characters kept
 * @returns {string} The text, trimmed
 */
const clamp = (text: string, max: number): string => {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
};

/**
 * The link as the API takes it: a path of the platform, never another site.
 * A link too long for the API keeps only its path.
 * @param {string | null | undefined} link - The address
 * @returns {string | null} The link, or null
 */
const toPlatformLink = (link: string | null | undefined): string | null => {
  const trimmed = link?.trim();
  if (!trimmed?.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.length <= ACTION_PLAN_ORIGIN_LIMITS.LINK) return trimmed;
  const [path] = trimmed.split('?');
  return path.length <= ACTION_PLAN_ORIGIN_LIMITS.LINK ? path : null;
};

/**
 * The origin of a plan made from a screen (AE-3367): the texts trimmed and
 * cut to what the API keeps, the empty filters dropped, and the moment the
 * data was looked at stamped now.
 * @param {ActionPlanOriginInput} input - What the screen says about itself
 * @param {Date} now - When the data was looked at
 * @returns {ActionPlanOrigin} The origin to send
 * @example
 * buildActionPlanOrigin({
 *   type: ACTION_PLAN_ORIGIN_TYPE.RANKING,
 *   report: 'Simulados',
 *   filters: ['Último ano', 'Todas as turmas'],
 *   indicator: 'Estudantes com maior dificuldade',
 *   link: '/desempenho?view=simulados',
 * });
 */
export const buildActionPlanOrigin = (
  input: ActionPlanOriginInput,
  now: Date = new Date()
): ActionPlanOrigin => {
  const indicator = input.indicator?.trim();
  const value = input.value?.trim();
  return {
    type: input.type,
    report: clamp(input.report, ACTION_PLAN_ORIGIN_LIMITS.REPORT),
    filters: (input.filters ?? [])
      .filter((filter): filter is string => Boolean(filter?.trim()))
      .slice(0, ACTION_PLAN_ORIGIN_LIMITS.FILTERS)
      .map((filter) => clamp(filter, ACTION_PLAN_ORIGIN_LIMITS.FILTER)),
    indicator: indicator
      ? clamp(indicator, ACTION_PLAN_ORIGIN_LIMITS.INDICATOR)
      : null,
    value: value ? clamp(value, ACTION_PLAN_ORIGIN_LIMITS.VALUE) : null,
    queriedAt: now.toISOString(),
    link: toPlatformLink(input.link),
    sources: input.sources ?? [],
  };
};
