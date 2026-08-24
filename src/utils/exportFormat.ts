import type { StudentsHighlightPeriod } from '../hooks/useStudentsHighlight';
import { REPORT_PERIOD } from '../types/common';

/**
 * Pure formatting helpers for the report exporters (PDF and XLSX). No React, no
 * requests, no spreadsheet building — every function here is pure.
 *
 * Provenance differs per symbol, and it matters before you rewire a caller:
 *
 * - `formatTimestamp` and `PERIOD_LABELS` existed in BOTH apps, spelled
 *   differently but producing identical output (professor's
 *   `performanceExportExcel.ts`, gestor's `exportFiltersSummary.ts`). These are
 *   the true de-duplication, and both apps can adopt them with no visible
 *   change.
 * - `formatDateForFileName`, `describeSelection`, `NamedEntity` and
 *   `AccessScope` came from the professor app ONLY. The gestor has no file-name
 *   date stamp at all and no equivalent of the two types.
 *
 * BEWARE the gestor's own `describeSelection` (`exportFiltersSummary.ts`): same
 * name, different function. Its signature is
 * `(ids, allSelected, singular, plural)` and it reports COUNTS — "Todas as
 * escolas", "3 escolas selecionadas" — because the gestor's `ReportFilters`
 * carries ids with no names to resolve. The one below resolves ids to names.
 * Swapping the gestor's calls for this one would change text the user reads in
 * the spreadsheet; it has been decided that the gestor keeps its own.
 */

/**
 * Anything a report needs to turn a selected id into a readable name.
 *
 * Schools, school years, classes and subjects all carry more fields than this,
 * but only the pair below matters for the "Filtros" block.
 */
export interface NamedEntity {
  id: string;
  name: string;
}

/**
 * The entities a user may read.
 *
 * Fill it with the `schools`/`schoolYears`/`classes` of `useUserAccessData`
 * (GET /auth/me), which is where the pages already get them. It is the minimum
 * an exporter needs — three lists of id/name — and is structural on purpose, so
 * this library's own `UseUserAccessDataState` and the apps' richer access-data
 * types all satisfy it without anyone importing the other's shape.
 *
 * Nothing inside this library consumes it yet; that is expected, not dead code.
 * The consumer is planned: the professor app will drop its local copies of this
 * type and of `NamedEntity` and import them from here. Do not remove it on YAGNI
 * grounds without checking that migration first.
 */
export interface AccessScope {
  schools: readonly NamedEntity[];
  schoolYears: readonly NamedEntity[];
  classes: readonly NamedEntity[];
}

/**
 * Period labels for exported reports.
 *
 * Deliberately longer than the on-screen tab labels in `PERIOD_TABS`
 * (`src/hooks/useStudentsHighlight.ts` — "7 dias", "1 mês", ...), which is what
 * the tab bar next to these reports renders. An exported file is read away from
 * the page, with no tab bar around to say that the number means a period. The
 * two wordings are NOT the same and are not meant to be — each is correct for
 * its medium, so do not "align" one with the other.
 *
 * Note there is a THIRD list of period labels in this library: `PERIOD_OPTIONS`
 * (`src/components/PeriodSelector/types.ts`), belonging to the `PeriodSelector`
 * component. Its wording matches `PERIOD_TABS` today, but it is a separate list
 * keyed off a separate enum — do not treat the two as one when comparing.
 *
 * Typed over the closed `StudentsHighlightPeriod` union rather than
 * `Record<string, string>`: a period added to the union must break this build
 * instead of silently exporting a missing or wrong label.
 *
 * The type does NOT make the lookup total at runtime. Both apps read the period
 * from the URL, where a value outside the union does arrive, so a caller holding
 * an unvalidated period must index defensively — `PERIOD_LABELS[p] ?? <default>`
 * — exactly as the per-app wrappers do. Their defaults differ (and the gestor's
 * also handles a custom date range), which is why those wrappers stay in the
 * apps and only this table is shared.
 */
export const PERIOD_LABELS = {
  [REPORT_PERIOD.SEVEN_DAYS]: 'Últimos 7 dias',
  [REPORT_PERIOD.ONE_MONTH]: 'Último mês',
  [REPORT_PERIOD.THREE_MONTHS]: 'Últimos 3 meses',
  [REPORT_PERIOD.SIX_MONTHS]: 'Últimos 6 meses',
  [REPORT_PERIOD.ONE_YEAR]: 'Último ano',
} as const satisfies Record<StudentsHighlightPeriod, string>;

/** Two digits, so 5/1 reads as 05/01 in every format below. */
const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Format an instant as `DD/MM/AAAA HH:MM`, in the reader's timezone.
 *
 * Local getters, never `toISOString`: the reader opens the file in the timezone
 * that generated it, and UTC would shift a report generated in the evening in
 * Brazil onto the next day.
 *
 * Hand-rolled rather than delegated to `dayjs` — which this library does depend
 * on, and which would format this perfectly well — for two reasons that are not
 * about cost: the output has to stay byte-identical to what both apps already
 * ship, and the timezone regression guard in the test file works by spying on
 * the accessors of the `Date` it is handed, which only a hand-rolled
 * implementation touches. Read that guard's note before rewriting this.
 */
export function formatTimestamp(date: Date): string {
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * Format a date as `DD-MM-AAAA`, to be stamped on a file name.
 *
 * Hyphens where `formatTimestamp` puts slashes: `/` is a path separator on
 * every system, so it cannot appear in a file name (nor can `\ : * ? " < > |`
 * on Windows, none of which a date produces).
 *
 * Local getters, for the same reason as `formatTimestamp`.
 */
export function formatDateForFileName(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

/**
 * Translate selected ids into readable names.
 *
 * An empty filter means "no slice" on screen, so it becomes "Todos". An id with
 * no match in the loaded options falls back to the id itself: an ugly value
 * beats a silently empty row.
 */
export function describeSelection(
  ids: readonly string[],
  options: readonly NamedEntity[]
): string {
  if (ids.length === 0) return 'Todos';

  return ids
    .map((id) => options.find((option) => option.id === id)?.name ?? id)
    .join(', ');
}
