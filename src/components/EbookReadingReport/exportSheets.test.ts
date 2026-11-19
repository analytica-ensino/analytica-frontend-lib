import type { BaseApiClient } from '../../types/api';
import { REPORT_PERIOD } from '../../types/common';
import {
  buildEbookReadingSheets,
  fetchEbookReadingExport,
  type EbookReadingExport,
} from './exportSheets';
import { EBOOK_READING_ROUTE } from './readingReport';
import {
  EBOOK_READING_GROUP,
  type EbookReadingBySubject,
  type EbookReadingDistribution,
  type EbookReadingGroupRow,
  type EbookReadingStudentRow,
  type EbookReadingSummaryData,
  type EbookReadingTimeline,
} from './types';

const FILTERS = { period: REPORT_PERIOD.ONE_MONTH };

const SUMMARY: EbookReadingSummaryData = {
  totalStudents: 10,
  readers: 4,
  readerRate: 40,
  accesses: 9,
  effectiveReadings: 2,
  totalTimeSeconds: 1230,
  averageTimeSeconds: 300,
  averageProgress: 55,
  municipalities: 3,
  schools: 5,
};

/** A row of the breakdown. */
const row = (id: string, readerRate: number): EbookReadingGroupRow => ({
  ...SUMMARY,
  id,
  name: `Turma ${id}`,
  readerRate,
  schoolYearName: id === 'A' ? '4º ano' : null,
  municipality: id === 'A' ? 'Curitiba' : null,
  state: 'PR',
});

const STUDENT: EbookReadingStudentRow = {
  userInstitutionId: 'student-1',
  studentName: 'Ana Beatriz',
  avatarUrl: null,
  schoolName: 'Escola Monteiro Lobato',
  schoolYearName: '4º ano',
  className: null,
  ebooksOpened: 3,
  accesses: 9,
  effectiveReadings: 1,
  totalTimeSeconds: 600,
  averageProgress: 80,
  lastReadAt: null,
};

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

const TIMELINE: EbookReadingTimeline = {
  periods: [
    { label: 'Seg', effectiveReadings: 2 },
    { label: 'Ter', effectiveReadings: 0 },
  ],
};

const SUBJECTS: EbookReadingBySubject = {
  total: { books: 7, read: 1, opened: 2, notRead: 4, readRate: 14.29 },
  rows: [
    {
      id: 'math',
      name: 'Matemática',
      icon: 'MathOperations',
      color: '#ff0000',
      areaKnowledgeId: 'area-1',
      areaKnowledgeName: 'Matemática e suas Tecnologias',
      books: 3,
      read: 1,
      opened: 1,
      notRead: 1,
      readRate: 33.33,
    },
  ],
};

const DISTRIBUTION: EbookReadingDistribution = {
  totalStudents: 4,
  tiers: {
    highlight: 1,
    aboveAverage: 1,
    belowAverage: 0,
    attention: 1,
    none: 1,
  },
};

/** What the routes that are not tables answer. */
const ANSWERS: Record<string, unknown> = {
  [EBOOK_READING_ROUTE.SUMMARY]: SUMMARY,
  [EBOOK_READING_ROUTE.TIMELINE]: TIMELINE,
  [EBOOK_READING_ROUTE.RANKINGS]: RANKINGS,
  [EBOOK_READING_ROUTE.BY_SUBJECT]: SUBJECTS,
  [EBOOK_READING_ROUTE.DISTRIBUTION]: DISTRIBUTION,
};

/**
 * An API client: the routes that are not tables answer `ANSWERS`, and the
 * tables answer `table`.
 * @param {Function} table - What a table route answers
 * @returns {{ api: BaseApiClient; post: jest.Mock }} The client and its post
 */
const createApi = (
  table: (route: string, body: Record<string, unknown>) => Promise<unknown>
) => {
  const post = jest.fn((route: string, body: Record<string, unknown>) =>
    route in ANSWERS
      ? Promise.resolve({ data: { data: ANSWERS[route] } })
      : table(route, body)
  );
  const api = {
    get: jest.fn(),
    post,
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as BaseApiClient;
  return { api, post };
};

/** The pages a route was asked for. */
const pagesAsked = (post: jest.Mock, route: string) =>
  post.mock.calls
    .filter(([url]) => url === route)
    .map(([, body]) => (body as Record<string, unknown>).page);

describe('fetchEbookReadingExport', () => {
  it('fetches every part of the report and every page of the breakdown', async () => {
    const { api, post } = createApi((_route, body) =>
      Promise.resolve({
        data: {
          data: {
            rows: body.page === 1 ? [row('A', 80)] : [row('B', 0)],
            pagination: { totalPages: 2 },
          },
        },
      })
    );

    const data = await fetchEbookReadingExport(
      api,
      FILTERS,
      EBOOK_READING_GROUP.CLASS
    );

    expect(data).toEqual({
      summary: SUMMARY,
      timeline: TIMELINE,
      books: RANKINGS,
      themes: RANKINGS,
      subjects: SUBJECTS,
      distribution: DISTRIBUTION,
      groups: [row('A', 80), row('B', 0)],
      students: [],
    });
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
    expect(pagesAsked(post, EBOOK_READING_ROUTE.BY_STUDENT)).toEqual([]);
  });

  it('fetches the students, and no breakdown, when the report lists them', async () => {
    const { api, post } = createApi(() =>
      Promise.resolve({
        data: { data: { rows: [STUDENT], pagination: { totalPages: 1 } } },
      })
    );

    const data = await fetchEbookReadingExport(
      api,
      { ...FILTERS, schoolIds: ['school-1'] },
      EBOOK_READING_GROUP.STUDENT
    );

    expect(data.students).toEqual([STUDENT]);
    expect(data.groups).toEqual([]);
    expect(post).toHaveBeenCalledWith(EBOOK_READING_ROUTE.BY_STUDENT, {
      ...FILTERS,
      schoolIds: ['school-1'],
      page: 1,
      limit: 100,
    });
  });

  it('asks for the next page of the breakdown only after the last one answers', async () => {
    const answers: Array<() => void> = [];
    const { api, post } = createApi(
      (_route, body) =>
        new Promise((resolve) => {
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
        })
    );

    const exported = fetchEbookReadingExport(
      api,
      FILTERS,
      EBOOK_READING_GROUP.CLASS
    );

    await Promise.resolve();
    expect(pagesAsked(post, EBOOK_READING_ROUTE.BY_CLASS)).toEqual([1]);
    answers[0]();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(pagesAsked(post, EBOOK_READING_ROUTE.BY_CLASS)).toEqual([1, 2]);
    answers[1]();
    await new Promise((resolve) => setTimeout(resolve, 0));
    answers[2]();

    const data = await exported;
    expect(pagesAsked(post, EBOOK_READING_ROUTE.BY_CLASS)).toEqual([1, 2, 3]);
    expect(data.groups.map((group) => group.id)).toEqual(['1', '2', '3']);
  });

  it('stops at the first page when the API reports no page count', async () => {
    const { api } = createApi(() =>
      Promise.resolve({
        data: { data: { rows: [row('A', 80)], pagination: {} } },
      })
    );

    const data = await fetchEbookReadingExport(
      api,
      FILTERS,
      EBOOK_READING_GROUP.CLASS
    );

    expect(data.groups.map((group) => group.id)).toEqual(['A']);
  });
});

describe('buildEbookReadingSheets', () => {
  const data: EbookReadingExport = {
    summary: SUMMARY,
    timeline: TIMELINE,
    books: RANKINGS,
    themes: { mostRead: [], leastRead: [] },
    subjects: SUBJECTS,
    distribution: DISTRIBUTION,
    groups: [row('A', 80), row('B', 0)],
    students: [STUDENT],
  };

  it('writes every part of the report and the breakdown', () => {
    const sheets = buildEbookReadingSheets(data, EBOOK_READING_GROUP.CLASS);

    expect(sheets.map((sheet) => sheet.name)).toEqual([
      'Visão geral',
      'Leituras por período',
      'Livros',
      'Temas',
      'Componentes curriculares',
      'Faixas',
      'Turmas',
    ]);
    expect(sheets[0].rows).toContainEqual(['Tempo em leitura (min)', 21]);
    expect(sheets[0].rows).not.toContainEqual(['Municípios', 3]);
    expect(sheets[1].rows).toEqual([
      ['Seg', 2],
      ['Ter', 0],
    ]);
    expect(sheets[2].rows).toEqual([
      ['Mais lidos', 1, 'Livro A', 5, 10],
      ['Menos lidos', 1, 'Livro B', 1, 2],
    ]);
    expect(sheets[4].rows).toEqual([
      ['Todos', '-', 7, 1, 2, 4, 14.29],
      ['Matemática', 'Matemática e suas Tecnologias', 3, 1, 1, 1, 33.33],
    ]);
    expect(sheets[5].rows).toEqual([
      ['Destaque', 1, 25],
      ['Acima da média', 1, 25],
      ['Abaixo da média', 0, 0],
      ['Ponto de atenção', 1, 25],
      ['Sem leitura', 1, 25],
      ['Total', 4, 100],
    ]);
    expect(sheets[6].headers).toContain('Série');
    expect(sheets[6].headers).not.toContain('Município');
    expect(sheets[6].rows[0]).toEqual([
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
    expect(sheets[6].rows[1]).toContain('-');
    expect(sheets[6].rows[1]).toContain('Sem leitura');
  });

  it('counts the municipalities and schools, and names the municipality of each school', () => {
    const sheets = buildEbookReadingSheets(data, EBOOK_READING_GROUP.SCHOOL);

    expect(sheets[0].rows).toContainEqual(['Municípios', 3]);
    expect(sheets[0].rows).toContainEqual(['Escolas', 5]);
    expect(sheets[6].name).toBe('Escolas');
    expect(sheets[6].headers).not.toContain('Série');
    expect(sheets[6].headers[1]).toBe('Município');
    expect(sheets[6].rows[0][1]).toBe('Curitiba');
    expect(sheets[6].rows[1][1]).toBe('-');
  });

  it('lists the students, tiered by their progress, when the report does', () => {
    const sheets = buildEbookReadingSheets(data, EBOOK_READING_GROUP.STUDENT);

    expect(sheets[6].name).toBe('Estudantes');
    expect(sheets[6].rows).toEqual([
      [
        'Ana Beatriz',
        'Escola Monteiro Lobato',
        '4º ano',
        '-',
        1,
        3,
        9,
        10,
        80,
        'Destaque',
      ],
    ]);
  });

  it('writes no share of an empty distribution', () => {
    const sheets = buildEbookReadingSheets(
      {
        ...data,
        distribution: {
          totalStudents: 0,
          tiers: {
            highlight: 0,
            aboveAverage: 0,
            belowAverage: 0,
            attention: 0,
            none: 0,
          },
        },
      },
      EBOOK_READING_GROUP.CLASS
    );

    expect(sheets[5].rows.at(-1)).toEqual(['Total', 0, 0]);
    expect(sheets[5].rows[0]).toEqual(['Destaque', 0, 0]);
  });
});
