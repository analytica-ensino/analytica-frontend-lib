import type { BaseApiClient } from '../../types/api';
import { REPORT_PERIOD } from '../../types/common';
import {
  buildEbookReadingSheets,
  fetchEbookReadingExport,
} from './exportSheets';
import { EBOOK_READING_ROUTE } from './readingReport';
import {
  EBOOK_READING_GROUP,
  type EbookReadingGroupRow,
  type EbookReadingMetrics,
} from './types';

const FILTERS = { period: REPORT_PERIOD.ONE_MONTH };

const METRICS: EbookReadingMetrics = {
  totalStudents: 10,
  readers: 4,
  readerRate: 40,
  accesses: 9,
  effectiveReadings: 2,
  totalTimeSeconds: 1230,
  averageTimeSeconds: 300,
  averageProgress: 55,
};

/** A row of the breakdown. */
const row = (id: string, readerRate: number): EbookReadingGroupRow => ({
  ...METRICS,
  id,
  name: `Turma ${id}`,
  readerRate,
  schoolYearName: id === 'A' ? '4º ano' : null,
});

const RANKINGS = {
  mostRead: [
    {
      id: 'eb',
      name: 'Livro A',
      ebookTitle: null,
      readers: 5,
      totalTimeSeconds: 600,
    },
  ],
  leastRead: [
    {
      id: 'eb2',
      name: 'Livro B',
      ebookTitle: null,
      readers: 1,
      totalTimeSeconds: 90,
    },
  ],
};

describe('fetchEbookReadingExport', () => {
  it('fetches the summary, both rankings and every page of the breakdown', async () => {
    const post = jest.fn((route: string, body: Record<string, unknown>) => {
      if (route === EBOOK_READING_ROUTE.SUMMARY) {
        return Promise.resolve({ data: { data: METRICS } });
      }
      if (route === EBOOK_READING_ROUTE.RANKINGS) {
        return Promise.resolve({ data: { data: RANKINGS } });
      }
      const rows = body.page === 1 ? [row('A', 80)] : [row('B', 0)];
      return Promise.resolve({
        data: { data: { rows, pagination: { totalPages: 2 } } },
      });
    });
    const api = {
      get: jest.fn(),
      post,
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;

    const data = await fetchEbookReadingExport(
      api,
      FILTERS,
      EBOOK_READING_GROUP.CLASS
    );

    expect(data.summary).toEqual(METRICS);
    expect(data.groups.map((group) => group.id)).toEqual(['A', 'B']);
    expect(post).toHaveBeenCalledWith(EBOOK_READING_ROUTE.RANKINGS, {
      ...FILTERS,
      dimension: 'CATEGORY',
      metric: 'READERS',
      limit: 20,
    });
    expect(post).toHaveBeenCalledWith(EBOOK_READING_ROUTE.BY_CLASS, {
      ...FILTERS,
      page: 2,
      limit: 100,
    });
  });
});

describe('fetchEbookReadingExport, page by page', () => {
  it('asks for the next page of the breakdown only after the last one answers', async () => {
    const answers: Array<() => void> = [];
    const post = jest.fn((route: string, body: Record<string, unknown>) => {
      if (route === EBOOK_READING_ROUTE.SUMMARY) {
        return Promise.resolve({ data: { data: METRICS } });
      }
      if (route === EBOOK_READING_ROUTE.RANKINGS) {
        return Promise.resolve({ data: { data: RANKINGS } });
      }
      return new Promise((resolve) => {
        answers.push(() =>
          resolve({
            data: {
              data: {
                rows: [row(String(body.page), 50)],
                pagination: { totalPages: 3 },
              },
            },
          })
        );
      });
    });
    const api = {
      get: jest.fn(),
      post,
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;
    /** The pages asked for so far. */
    const pagesAsked = () =>
      post.mock.calls
        .filter(([route]) => route === EBOOK_READING_ROUTE.BY_CLASS)
        .map(([, body]) => body.page);

    const exported = fetchEbookReadingExport(
      api,
      FILTERS,
      EBOOK_READING_GROUP.CLASS
    );

    await Promise.resolve();
    expect(pagesAsked()).toEqual([1]);
    answers[0]();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(pagesAsked()).toEqual([1, 2]);
    answers[1]();
    await new Promise((resolve) => setTimeout(resolve, 0));
    answers[2]();

    const data = await exported;
    expect(pagesAsked()).toEqual([1, 2, 3]);
    expect(data.groups.map((group) => group.id)).toEqual(['1', '2', '3']);
  });

  it('stops at the first page when the API reports no page count', async () => {
    const post = jest.fn((route: string) => {
      if (route === EBOOK_READING_ROUTE.SUMMARY) {
        return Promise.resolve({ data: { data: METRICS } });
      }
      if (route === EBOOK_READING_ROUTE.RANKINGS) {
        return Promise.resolve({ data: { data: RANKINGS } });
      }
      return Promise.resolve({
        data: { data: { rows: [row('A', 80)], pagination: {} } },
      });
    });
    const api = {
      get: jest.fn(),
      post,
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as BaseApiClient;

    const data = await fetchEbookReadingExport(
      api,
      FILTERS,
      EBOOK_READING_GROUP.CLASS
    );

    expect(data.groups.map((group) => group.id)).toEqual(['A']);
  });
});

describe('buildEbookReadingSheets', () => {
  const data = {
    summary: METRICS,
    books: RANKINGS,
    themes: { mostRead: [], leastRead: [] },
    groups: [row('A', 80), row('B', 0)],
  };

  it('writes the overview, the books, the themes and the breakdown', () => {
    const sheets = buildEbookReadingSheets(data, EBOOK_READING_GROUP.CLASS);

    expect(sheets.map((sheet) => sheet.name)).toEqual([
      'Visão geral',
      'Livros',
      'Temas',
      'Turmas',
    ]);
    expect(sheets[0].rows).toContainEqual(['Tempo em leitura (min)', 21]);
    expect(sheets[1].rows).toEqual([
      ['Mais lidos', 1, 'Livro A', 5, 10],
      ['Menos lidos', 1, 'Livro B', 1, 2],
    ]);
    expect(sheets[3].headers).toContain('Série');
    expect(sheets[3].rows[0]).toEqual([
      'Turma A',
      '4º ano',
      10,
      4,
      80,
      2,
      21,
      55,
      'Destaque',
    ]);
    expect(sheets[3].rows[1]).toContain('-');
    expect(sheets[3].rows[1]).toContain('Sem leitura');
  });

  it('leaves the school year out when the rows are schools', () => {
    const sheets = buildEbookReadingSheets(data, EBOOK_READING_GROUP.SCHOOL);

    expect(sheets[3].name).toBe('Escolas');
    expect(sheets[3].headers).not.toContain('Série');
    expect(sheets[3].rows[0]).toHaveLength(8);
  });
});
