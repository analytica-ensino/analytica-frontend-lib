/**
 * Page ceiling of the backend performance endpoints.
 *
 * `.max(100)` in their request schemas — `performance/body.schema.ts`,
 * `performance/query.schema.ts` and `performance/simulated.schema.ts` all
 * declare `limit` that way, so a larger value is rejected, not a bigger page.
 * Their own defaults are 10 or 20 depending on the endpoint, which is why the
 * ceiling is sent explicitly: it is what keeps a full scan to the fewest
 * requests.
 *
 * It is a default, not a constant of the contract — an endpoint with another
 * ceiling is served by the `pageSize` option rather than by a second helper.
 */
const DEFAULT_PAGE_SIZE = 100;

/** Pagination of one request, as `fetchAllPages` hands it to the caller. */
export interface PageRequest {
  page: number;
  limit: number;
}

/**
 * Walk every page of a paginated endpoint and return all rows.
 *
 * Fetches page 1 to learn how many pages there are, and only then fires the
 * rest in parallel. Written for the report exporters: a spreadsheet carries the
 * whole table, while the screen holds a single page.
 *
 * The fetching is the caller's — this stays out of HTTP clients, endpoints and
 * payload shapes, so it is the same helper whichever app and whichever table is
 * being exported.
 *
 * The callback reports `totalPages` rather than `total` because the payloads
 * SPLIT on which of the two they carry, and only the caller knows which one it
 * is holding:
 *
 * - `studentsQuestionsPerformanceDataSchema` and
 *   `studentsCompletionRateDataSchema` (`performance/response.schema.ts:190-196`
 *   and `:212-217`) declare `totalPages` outright — those two are the ONLY
 *   places in `src/schemas/performance` that do.
 * - The access-report payloads the gestor exports carry it nested, as
 *   `pagination.totalPages`.
 * - The simulated payloads do NOT have it at all: `paginatedStudentsSchema`
 *   (`performance/simulated.schema.ts:202-207`) is `data`/`page`/`limit`/`total`
 *   and nothing more, and the contents payload matches. Those callers must
 *   divide `total` by the page size themselves.
 *
 * Reading the field where it exists and computing it where it does not is the
 * caller's job precisely so both kinds can share this function. Do not "improve"
 * this by having the helper take `total` — that would force the two schemas that
 * report a real page count to have it recomputed from a page size this function
 * only assumes was honoured.
 *
 * FAN-OUT: pages 2..N are dispatched all at once — no concurrency limit, no
 * `AbortSignal`, no ceiling on `totalPages`. At 100 rows a page a whole-network
 * export is hundreds of simultaneous requests. Both apps this was consolidated
 * from already behaved exactly this way, so it is not a regression; it is simply
 * now one decision in one place, and a caller that cannot afford that burst
 * needs something other than this helper.
 *
 * @param fetchPage - Fetches one page; must return its rows and the total page count
 * @param options.pageSize - `limit` sent on every request; defaults to the backend ceiling of 100
 * @returns Every row, in page order. Always a fresh array, on every path, so the
 *   caller may sort or otherwise mutate it in place without touching what the
 *   callback returned.
 * @throws {Error} If the first page reports no usable `totalPages`. See the note
 *   on the check below — the alternative is a silently truncated export.
 * @throws Whatever a page rejects with: one failed page rejects the whole scan.
 *   Deliberate, and the reason there is no partial-result path — a spreadsheet
 *   quietly missing rows is worse than one that visibly fails to download.
 */
export async function fetchAllPages<T>(
  fetchPage: (
    pagination: PageRequest
  ) => Promise<{ items: T[]; totalPages: number }>,
  options?: { pageSize?: number }
): Promise<T[]> {
  const limit = options?.pageSize ?? DEFAULT_PAGE_SIZE;

  const first = await fetchPage({ page: 1, limit });

  // `totalPages` is typed `number`, but it arrives from a payload that may not
  // carry the field — the simulated schemas above genuinely do not have it — and
  // TypeScript cannot catch a callback that forwards a response shape it merely
  // asserted. Left unchecked the failure is silent, not loud: `undefined <= 1`
  // is `false`, so it slips past the single-page return below, and
  // `Array.from({ length: undefined - 1 })` is `[]` (both measured), so the scan
  // would ask for no further page and hand back page 1 alone. The caller then
  // ships a spreadsheet holding the first 100 rows with nothing anywhere saying
  // the rest is missing. Throwing turns the worst outcome this helper can
  // produce into the most visible one.
  if (!Number.isFinite(first.totalPages)) {
    throw new Error('fetchAllPages: endpoint did not report totalPages');
  }

  // One page and no pages both stop here. `slice()` because every path must
  // return a fresh array — see `@returns`.
  if (first.totalPages <= 1) return first.items.slice();

  // `index + 2` because page 1 is already in hand, `totalPages - 1` because it
  // is one of the pages counted.
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      fetchPage({ page: index + 2, limit })
    )
  );

  return [first.items, ...rest.map((page) => page.items)].flat();
}
