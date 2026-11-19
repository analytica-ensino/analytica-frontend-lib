import type { BaseApiClient } from '../../types/api';
import { REPORT_PERIOD } from '../../types/common';
import {
  EVERY_ROW_PAGE_SIZE,
  PERIOD_LABEL,
  STUDENT_BOOK_STATUS_LABEL,
  fetchEveryRow,
  formatPercent,
  formatReadingDate,
  postReading,
  readingTier,
  studentBookStatus,
} from './readingReport';
import { EBOOK_STUDENT_BOOK_STATUS, READING_TIER } from './types';

describe('readingTier', () => {
  it.each([
    [100, READING_TIER.HIGHLIGHT],
    [75, READING_TIER.HIGHLIGHT],
    [74.9, READING_TIER.ABOVE_AVERAGE],
    [50, READING_TIER.ABOVE_AVERAGE],
    [49.9, READING_TIER.BELOW_AVERAGE],
    [25, READING_TIER.BELOW_AVERAGE],
    [24.9, READING_TIER.ATTENTION],
    [0.5, READING_TIER.ATTENTION],
    [0, READING_TIER.NONE],
    [Number.NaN, READING_TIER.NONE],
  ])('puts %p%% in the %s tier, on the access map bands', (percent, tier) => {
    expect(readingTier(percent)).toBe(tier);
  });
});

describe('studentBookStatus', () => {
  it('is read once the reading rule is met, whatever the progress', () => {
    expect(
      studentBookStatus({
        effectiveReadAt: '2026-11-10T10:00:00Z',
        percent: 80,
      })
    ).toBe(EBOOK_STUDENT_BOOK_STATUS.READ);
  });

  it('is being read while pages are seen, and only opened before', () => {
    expect(studentBookStatus({ effectiveReadAt: null, percent: 30 })).toBe(
      EBOOK_STUDENT_BOOK_STATUS.READING
    );
    expect(studentBookStatus({ effectiveReadAt: null, percent: 0 })).toBe(
      EBOOK_STUDENT_BOOK_STATUS.OPENED
    );
  });
});

describe('report formatting', () => {
  it('writes percentages the pt-BR way, one decimal at most', () => {
    expect(formatPercent(60.25)).toBe('60,3%');
    expect(formatPercent(40)).toBe('40%');
  });

  it('writes dates day first, and a dash without one', () => {
    expect(formatReadingDate('2026-11-18T12:00:00Z')).toBe('18/11/2026');
    expect(formatReadingDate(null)).toBe('—');
  });

  it('names every period for the titles', () => {
    expect(PERIOD_LABEL[REPORT_PERIOD.SEVEN_DAYS]).toBe('7 dias');
    expect(PERIOD_LABEL[REPORT_PERIOD.ONE_YEAR]).toBe('1 ano');
  });
});

/**
 * An API client answering a table route with `pages` pages of one row each.
 * @param {number} pages - How many pages the table has
 * @returns {{ api: BaseApiClient; post: jest.Mock }} The client and its post
 */
const pagedApi = (pages: number) => {
  const post = jest.fn((_route: string, body: { page: number }) =>
    Promise.resolve({
      data: {
        message: 'ok',
        data: {
          rows: [`row-${body.page}`],
          pagination: { totalPages: pages },
        },
      },
    })
  );
  const api = {
    get: jest.fn(),
    post,
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as BaseApiClient;
  return { api, post };
};

describe('postReading', () => {
  it("posts the body and unwraps the answer's data", async () => {
    const { api, post } = pagedApi(1);

    await expect(postReading(api, '/route', { page: 1 })).resolves.toEqual({
      rows: ['row-1'],
      pagination: { totalPages: 1 },
    });
    expect(post).toHaveBeenCalledWith('/route', { page: 1 });
  });
});

describe('fetchEveryRow', () => {
  it('asks every page, in order, at the largest size the API takes', async () => {
    const { api, post } = pagedApi(3);

    await expect(
      fetchEveryRow<string>(api, '/route', { period: '7_DAYS' })
    ).resolves.toEqual(['row-1', 'row-2', 'row-3']);
    expect(post.mock.calls.map(([, body]) => body)).toEqual([
      { period: '7_DAYS', page: 1, limit: EVERY_ROW_PAGE_SIZE },
      { period: '7_DAYS', page: 2, limit: EVERY_ROW_PAGE_SIZE },
      { period: '7_DAYS', page: 3, limit: EVERY_ROW_PAGE_SIZE },
    ]);
  });

  it('stops after the first page of an empty table', async () => {
    const { api, post } = pagedApi(0);

    await expect(fetchEveryRow(api, '/route', {})).resolves.toEqual(['row-1']);
    expect(post).toHaveBeenCalledTimes(1);
  });
});

describe('STUDENT_BOOK_STATUS_LABEL', () => {
  it('names a book released and not read', () => {
    expect(STUDENT_BOOK_STATUS_LABEL[EBOOK_STUDENT_BOOK_STATUS.NOT_READ]).toBe(
      'Não lido'
    );
  });
});
