import { fetchAllPages, type PageRequest } from './fetchAllPages';

/**
 * A fake paginated endpoint.
 *
 * Answers page N with the row `'p<N>'` and repeats the same `totalPages` on
 * every page, the way a paginated payload does. `requests` records what the
 * scan actually asked for, which is what the page-arithmetic tests below read:
 * a duplicated or skipped page shows up there even when the rows happen to
 * still add up.
 */
function fakeEndpoint(totalPages: number) {
  const requests: PageRequest[] = [];

  const fetchPage = jest.fn(async (pagination: PageRequest) => {
    requests.push(pagination);
    return { items: [`p${pagination.page}`], totalPages };
  });

  return {
    fetchPage,
    requests,
    /** Pages asked for, in call order. */
    pagesRequested: () => requests.map((request) => request.page),
  };
}

describe('fetchAllPages', () => {
  it('stops after page 1 when the server reports a single page', async () => {
    const { fetchPage } = fakeEndpoint(1);

    // No assertion on WHICH page was asked for, unlike the siblings below: the
    // fake derives each row from the page it was handed, so `['p1']` plus a
    // single call already leaves `[1]` as the only reachable request. There it
    // carries signal; here it could not fail.
    await expect(fetchAllPages(fetchPage)).resolves.toEqual(['p1']);

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('fetches page 2 exactly once when the server reports two pages', async () => {
    const { fetchPage, pagesRequested } = fakeEndpoint(2);

    await expect(fetchAllPages(fetchPage)).resolves.toEqual(['p1', 'p2']);

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(pagesRequested()).toEqual([1, 2]);
  });

  it('fetches every page once, in order, when the server reports three pages', async () => {
    const { fetchPage, pagesRequested } = fakeEndpoint(3);

    await expect(fetchAllPages(fetchPage)).resolves.toEqual(['p1', 'p2', 'p3']);

    // Both halves matter: the count catches a page fetched twice, the list
    // catches one skipped for another that does not exist.
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(pagesRequested()).toEqual([1, 2, 3]);
  });

  it('returns no rows and asks for no further page when the server reports zero pages', async () => {
    const fetchPage = jest.fn(async () => ({
      items: [] as string[],
      totalPages: 0,
    }));

    await expect(fetchAllPages(fetchPage)).resolves.toEqual([]);

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('asks for the backend page ceiling by default', async () => {
    const { fetchPage, requests } = fakeEndpoint(2);

    await fetchAllPages(fetchPage);

    expect(requests).toEqual([
      { page: 1, limit: 100 },
      { page: 2, limit: 100 },
    ]);
  });

  it('sends a custom pageSize as the limit of every page', async () => {
    const { fetchPage, requests } = fakeEndpoint(3);

    await fetchAllPages(fetchPage, { pageSize: 25 });

    expect(requests).toEqual([
      { page: 1, limit: 25 },
      { page: 2, limit: 25 },
      { page: 3, limit: 25 },
    ]);
  });

  it('fires pages 2..N together instead of waiting for each one', async () => {
    const pending = new Map<
      number,
      (page: { items: string[]; totalPages: number }) => void
    >();
    const pagesRequested: number[] = [];

    // Page 1 answers immediately — the scan cannot know the page count before
    // it does. The rest stay unresolved, so whether they were all dispatched
    // is observable while none of them has answered: a serial scan can only
    // have reached page 2.
    const fetchPage = jest.fn(({ page }: PageRequest) => {
      pagesRequested.push(page);

      if (page === 1) return Promise.resolve({ items: ['p1'], totalPages: 3 });

      return new Promise<{ items: string[]; totalPages: number }>((resolve) =>
        pending.set(page, resolve)
      );
    });

    const rows = fetchAllPages(fetchPage);

    // A macrotask, so every microtask queued by page 1 resolving has run.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(pagesRequested).toEqual([1, 2, 3]);

    // Answered out of order on purpose: the rows must come back in page order
    // regardless of which request the server finished first.
    pending.get(3)?.({ items: ['p3'], totalPages: 3 });
    pending.get(2)?.({ items: ['p2'], totalPages: 3 });

    await expect(rows).resolves.toEqual(['p1', 'p2', 'p3']);
  });

  it('concatenates the rows of every page, including empty ones', async () => {
    const fetchPage = jest.fn(async ({ page }: PageRequest) => ({
      items: page === 2 ? [] : [`p${page}`, `p${page}b`],
      totalPages: 3,
    }));

    await expect(fetchAllPages(fetchPage)).resolves.toEqual([
      'p1',
      'p1b',
      'p3',
      'p3b',
    ]);
  });

  it('throws instead of silently returning a truncated scan when the payload omits totalPages', async () => {
    // The shape a caller gets by wiring one of the simulated endpoints straight
    // through: `paginatedStudentsSchema` carries `total` and no `totalPages`
    // (backend `performance/simulated.schema.ts:202-207`). The cast is the point
    // — the field is typed `number`, so only a runtime check catches its
    // absence.
    const fetchPage = jest.fn(
      async () =>
        ({ items: ['p1'], total: 250 }) as unknown as {
          items: string[];
          totalPages: number;
        }
    );

    await expect(fetchAllPages(fetchPage)).rejects.toThrow(/totalPages/);

    // Without the guard this resolves with page 1 alone and the export ships
    // 100 of 250 rows with no error anywhere.
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('returns a fresh array on every path, so the caller may sort in place', async () => {
    // The single-page path is the one that used to hand back the callback's own
    // array, and it is the small-dataset case that dev fixtures and manual QA
    // exercise — so an exporter sorting the result in place would have passed
    // every small test while reordering the payload underneath it.
    const payload = ['b', 'a'];
    const fetchPage = jest.fn(async () => ({ items: payload, totalPages: 1 }));

    const rows = await fetchAllPages(fetchPage);
    expect(rows).not.toBe(payload);

    rows.sort();
    expect(rows).toEqual(['a', 'b']);
    expect(payload).toEqual(['b', 'a']);
  });

  it('rejects when a page of the parallel batch fails', async () => {
    const failure = new Error('502');
    const fetchPage = jest.fn(async ({ page }: PageRequest) => {
      if (page === 3) throw failure;
      return { items: [`p${page}`], totalPages: 3 };
    });

    await expect(fetchAllPages(fetchPage)).rejects.toThrow(failure);
  });
});
