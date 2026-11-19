import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { BaseApiClient } from '../../types/api';
import { REPORT_PERIOD } from '../../types/common';
import { EbookReadingReport } from './EbookReadingReport';
import { EBOOK_READING_ROUTE } from './readingReport';
import {
  EBOOK_READING_GROUP,
  type EbookRankings,
  type EbookReadingBySubject,
  type EbookReadingDistribution,
  type EbookReadingGroupRow,
  type EbookReadingMetrics,
  type EbookReadingStudentDetail,
  type EbookReadingStudentRow,
  type EbookReadingSummaryData,
  type EbookReadingTimeline,
} from './types';

const FILTERS = { period: REPORT_PERIOD.SEVEN_DAYS, schoolIds: ['school-1'] };

const METRICS: EbookReadingMetrics = {
  totalStudents: 120,
  readers: 48,
  readerRate: 40,
  accesses: 300,
  effectiveReadings: 1234,
  totalTimeSeconds: 4800,
  averageTimeSeconds: 100,
  averageProgress: 55.5,
};

const SUMMARY: EbookReadingSummaryData = {
  ...METRICS,
  municipalities: 20,
  schools: 30,
};

const TIMELINE: EbookReadingTimeline = {
  periods: [
    { label: 'Seg', effectiveReadings: 4 },
    { label: 'Ter', effectiveReadings: 1 },
  ],
};

const SUBJECTS: EbookReadingBySubject = {
  total: { books: 285, read: 174, opened: 96, notRead: 15, readRate: 61.05 },
  rows: [
    {
      id: 'subject-pt',
      name: 'Língua Portuguesa',
      icon: 'BookOpenText',
      color: '#ff0000',
      areaKnowledgeId: 'area-1',
      areaKnowledgeName: 'Linguagens, Códigos e suas Tecnologias',
      books: 90,
      read: 65,
      opened: 20,
      notRead: 5,
      readRate: 72.22,
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

/** A ranked item. */
const ranked = (id: string, name: string, readers: number) => ({
  id,
  name,
  ebookTitle: null,
  readers,
  totalTimeSeconds: 600,
});

const BOOKS: EbookRankings = {
  mostRead: [ranked('eb-40', 'O Caso da Couve Mordida', 12)],
  leastRead: [ranked('eb-06', 'O Preço do Tempo', 1)],
};

const THEMES: EbookRankings = {
  mostRead: [ranked('I', 'Educação 4.0 e 5.0', 30)],
  leastRead: [ranked('II', 'Educação Financeira', 2)],
};

/** A school, school year or class row. */
const group = (
  id: string,
  name: string,
  readerRate: number,
  schoolYearName: string | null = null
): EbookReadingGroupRow => ({
  ...METRICS,
  id,
  name,
  readerRate,
  schoolYearName,
  municipality: null,
  state: null,
});

/** A municipality row. */
const municipality = (name: string, readerRate: number) => ({
  ...group(`PR:${name}`, name, readerRate),
  state: 'PR',
});

const STUDENT: EbookReadingStudentRow = {
  userInstitutionId: 'student-1',
  studentName: 'Ana Beatriz',
  avatarUrl: null,
  schoolName: 'Escola Cecília Meireles',
  schoolYearName: '4º ano',
  className: 'Turma A',
  ebooksOpened: 3,
  accesses: 9,
  effectiveReadings: 1,
  totalTimeSeconds: 3725,
  averageProgress: 80,
  lastReadAt: '2026-11-17T12:00:00Z',
};

/** A book of the student. */
const book = (
  ebookId: string,
  title: string,
  percent: number,
  effectiveReadAt: string | null
) => ({
  ebookId,
  code: 'EB40',
  title,
  coverUrl: null,
  category: 'Educação 4.0 e 5.0',
  percent,
  timeSpentSeconds: 600,
  accesses: 3,
  lastReadAt: '2026-11-17T12:00:00Z',
  effectiveReadAt,
  sectionsSeen: [{ sectionKey: 'caso', title: 'O caso', seenAt: null }],
});

const STUDENT_DETAIL: EbookReadingStudentDetail = {
  userInstitutionId: 'student-1',
  studentName: 'Ana Beatriz',
  avatarUrl: null,
  schoolName: 'Escola Cecília Meireles',
  className: 'Turma A',
  schoolYearName: '4º ano',
  notRead: [],
  ebooks: [
    book('eb-40', 'O Caso da Couve Mordida', 100, '2026-11-16T12:00:00Z'),
    book('eb-01', 'A Barraca do 4º B', 30, null),
    book('eb-06', 'O Preço do Tempo', 0, null),
  ],
};

/** One page of rows. */
const page = <T,>(rows: T[]) => ({
  rows,
  pagination: {
    page: 1,
    limit: 10,
    total: rows.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
});

type Body = Record<string, unknown>;

/** What each route answers. */
const ROUTES: Record<string, (body: Body) => unknown> = {
  [EBOOK_READING_ROUTE.SUMMARY]: () => SUMMARY,
  [EBOOK_READING_ROUTE.TIMELINE]: () => TIMELINE,
  [EBOOK_READING_ROUTE.BY_SUBJECT]: () => SUBJECTS,
  [EBOOK_READING_ROUTE.DISTRIBUTION]: () => DISTRIBUTION,
  [EBOOK_READING_ROUTE.BY_MUNICIPALITY]: () =>
    page([
      municipality('Curitiba', 90),
      municipality('Londrina', 50),
      municipality('Maringá', 70),
      municipality('Cascavel', 10),
    ]),
  [EBOOK_READING_ROUTE.RANKINGS]: (body) =>
    body.dimension === 'CATEGORY' ? THEMES : BOOKS,
  [EBOOK_READING_ROUTE.BY_SCHOOL]: () =>
    page([group('school-1', 'Escola Monteiro Lobato', 80)]),
  [EBOOK_READING_ROUTE.BY_SCHOOL_YEAR]: () =>
    page([group('year-4', '4º ano', 30)]),
  [EBOOK_READING_ROUTE.BY_CLASS]: () =>
    page([group('class-a', 'Turma A', 10, '4º ano')]),
  [EBOOK_READING_ROUTE.BY_STUDENT]: () => page([STUDENT]),
  [EBOOK_READING_ROUTE.STUDENT]: () => STUDENT_DETAIL,
};

/**
 * An API client answering the report routes.
 * @param {Record<string, (body: Body) => unknown>} answers - What some routes answer instead
 * @returns {{ api: BaseApiClient; post: jest.Mock }} The client and its post
 */
const createApi = (answers: Record<string, (body: Body) => unknown> = {}) => {
  const routes = { ...ROUTES, ...answers };
  const post = jest.fn((route: string, body: Body) =>
    Promise.resolve({ data: { message: 'ok', data: routes[route](body) } })
  );
  const api: BaseApiClient = {
    get: jest.fn(),
    post: post as unknown as BaseApiClient['post'],
    patch: jest.fn(),
    delete: jest.fn(),
  };
  return { api, post };
};

/** The bodies posted to a route. */
const bodiesTo = (post: jest.Mock, route: string): Body[] =>
  post.mock.calls
    .filter(([url]) => url === route)
    .map(([, body]) => body as Body);

describe('EbookReadingReport', () => {
  beforeEach(() => {
    globalThis.window.history.replaceState({}, '', '/');
  });

  it('shows the readings, the most and least read books and the schools', async () => {
    const { api, post } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL}
      />
    );

    const summary = screen.getByTestId('ebook-reading-summary');
    expect(await within(summary).findByText('1.234')).toBeInTheDocument();
    expect(
      within(summary).getByText('Leituras realizadas')
    ).toBeInTheDocument();
    expect(within(summary).getByText('40% dos estudantes')).toBeInTheDocument();
    expect(within(summary).getByText('1h 20min')).toBeInTheDocument();
    expect(await screen.findByText('Livros mais lidos')).toBeInTheDocument();
    expect(screen.getByText('O Caso da Couve Mordida')).toBeInTheDocument();
    expect(screen.getByText('12 leitores')).toBeInTheDocument();
    expect(screen.getByText('1 leitor')).toBeInTheDocument();
    expect(
      await screen.findByText('Escola Monteiro Lobato')
    ).toBeInTheDocument();
    expect(screen.getByTestId('reading-tier-highlight')).toHaveTextContent(
      'Destaque'
    );
    expect(bodiesTo(post, EBOOK_READING_ROUTE.SUMMARY)[0]).toEqual(FILTERS);
    expect(bodiesTo(post, EBOOK_READING_ROUTE.RANKINGS)[0]).toMatchObject({
      ...FILTERS,
      dimension: 'EBOOK',
      metric: 'READERS',
      limit: 3,
    });
  });

  it('shows the network: its municipalities, readings by period, subjects and tiers', async () => {
    const { api, post } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL}
      />
    );

    const summary = screen.getByTestId('ebook-reading-summary');
    expect(await within(summary).findByText('Municípios')).toBeInTheDocument();
    expect(within(summary).getByText('Escolas')).toBeInTheDocument();
    expect(
      await screen.findByText('Leituras realizadas por período')
    ).toBeInTheDocument();
    expect(screen.getByText('Seg: 4 leituras')).toBeInTheDocument();
    expect(
      await screen.findByText('Dados por componente curricular')
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('Língua Portuguesa').length
    ).toBeGreaterThanOrEqual(1);
    const municipalities = await screen.findByTestId(
      'ebook-reading-municipalities'
    );
    expect(within(municipalities).getByText('Curitiba')).toBeInTheDocument();
    expect(within(municipalities).getByText('Cascavel')).toBeInTheDocument();
    expect(
      await screen.findByText('Desempenho por quantidade de estudante')
    ).toBeInTheDocument();
    expect(screen.getByText('Sem leitura')).toBeInTheDocument();
    expect(
      await screen.findByRole('columnheader', { name: /Município/ })
    ).toBeInTheDocument();
    for (const route of [
      EBOOK_READING_ROUTE.TIMELINE,
      EBOOK_READING_ROUTE.BY_SUBJECT,
      EBOOK_READING_ROUTE.DISTRIBUTION,
    ]) {
      expect(bodiesTo(post, route)[0]).toEqual(FILTERS);
    }
    expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_MUNICIPALITY)).toEqual([
      { ...FILTERS, page: 1, limit: 100 },
    ]);
  });

  it('asks for no municipality outside the network view', async () => {
    const { api, post } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL_YEAR}
      />
    );

    await screen.findByText('4º ano');
    expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_MUNICIPALITY)).toEqual([]);
    expect(screen.queryByTestId('ebook-reading-municipalities')).toBeNull();
    expect(screen.queryByText('Municípios')).toBeNull();
  });

  it('lists the students of the filters, with where each one is', async () => {
    const { api, post } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.STUDENT}
      />
    );

    expect(
      await screen.findByRole('heading', { name: 'Desempenho por estudante' })
    ).toBeInTheDocument();
    expect(await screen.findByText('Ana Beatriz')).toBeInTheDocument();
    expect(screen.getByText('Escola Cecília Meireles')).toBeInTheDocument();
    expect(screen.queryByText('Voltar para as turmas')).toBeNull();
    expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_STUDENT)).toEqual([
      { ...FILTERS, page: 1, limit: 10 },
    ]);
    expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_SCHOOL)).toEqual([]);

    fireEvent.click(screen.getByText('Ana Beatriz'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('keeps the rest of the report when a part fails', async () => {
    const { api, post } = createApi();
    post.mockImplementation((route: string, body: Body) =>
      route === EBOOK_READING_ROUTE.BY_SUBJECT
        ? Promise.reject(new Error('rede'))
        : Promise.resolve({
            data: { message: 'ok', data: ROUTES[route](body) },
          })
    );
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL}
      />
    );

    expect(
      await screen.findByText(
        'Não foi possível carregar os dados por componente curricular.'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Leituras realizadas por período')
    ).toBeInTheDocument();
  });

  it('ranks the themes on their tab', async () => {
    const { api, post } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL}
      />
    );
    await screen.findByText('O Caso da Couve Mordida');

    fireEvent.click(screen.getByRole('tab', { name: 'Temas' }));

    expect(await screen.findByText('Temas mais lidos')).toBeInTheDocument();
    expect(await screen.findByText('Educação 4.0 e 5.0')).toBeInTheDocument();
    expect(bodiesTo(post, EBOOK_READING_ROUTE.RANKINGS).at(-1)).toMatchObject({
      dimension: 'CATEGORY',
    });
  });

  it('hands a chosen school to the app', async () => {
    const { api } = createApi();
    const onSchoolSelect = jest.fn();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL}
        onSchoolSelect={onSchoolSelect}
      />
    );

    fireEvent.click(await screen.findByText('Escola Monteiro Lobato'));

    expect(onSchoolSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'school-1' })
    );
  });

  it('lists the school years without opening them', async () => {
    const { api } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL_YEAR}
      />
    );

    expect(
      await screen.findByRole('heading', { name: 'Desempenho por série' })
    ).toBeInTheDocument();
    fireEvent.click(await screen.findByText('4º ano'));

    expect(screen.queryByText(/Desempenho por estudante/)).toBeNull();
  });

  it('opens a class on its students, and goes back to the classes', async () => {
    const { api, post } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.CLASS}
      />
    );
    expect(
      await screen.findByRole('heading', { name: 'Desempenho por turma' })
    ).toBeInTheDocument();

    fireEvent.click(await screen.findByText('Turma A'));

    expect(
      await screen.findByRole('heading', {
        name: 'Desempenho por estudante: Turma A',
      })
    ).toBeInTheDocument();
    expect(await screen.findByText('Ana Beatriz')).toBeInTheDocument();
    expect(screen.getByText('01:02:05')).toBeInTheDocument();
    expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_STUDENT)[0]).toMatchObject({
      ...FILTERS,
      classId: 'class-a',
      page: 1,
      limit: 10,
    });

    fireEvent.click(screen.getByText('Voltar para as turmas'));

    expect(
      await screen.findByRole('heading', { name: 'Desempenho por turma' })
    ).toBeInTheDocument();
  });

  describe('when the filters change', () => {
    /** Twelve classes: two pages of ten. */
    const twoPages = () => ({
      rows: [group('class-a', 'Turma A', 10, '4º ano')],
      pagination: {
        page: 1,
        limit: 10,
        total: 12,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      },
    });
    const OTHER_FILTERS = { ...FILTERS, schoolIds: ['school-2'] };

    it('asks the table for its first page again', async () => {
      const { api, post } = createApi({
        [EBOOK_READING_ROUTE.BY_CLASS]: twoPages,
      });
      const { rerender } = render(
        <EbookReadingReport
          api={api}
          filters={FILTERS}
          groupBy={EBOOK_READING_GROUP.CLASS}
        />
      );
      await screen.findByText('Turma A');
      fireEvent.click(screen.getByText('Próxima'));
      await waitFor(() =>
        expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_CLASS).at(-1)).toEqual({
          ...FILTERS,
          page: 2,
          limit: 10,
        })
      );

      rerender(
        <EbookReadingReport
          api={api}
          filters={OTHER_FILTERS}
          groupBy={EBOOK_READING_GROUP.CLASS}
        />
      );

      await waitFor(() =>
        expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_CLASS).at(-1)).toEqual({
          ...OTHER_FILTERS,
          page: 1,
          limit: 10,
        })
      );
      // Never page 2 of the new filter, not even for a moment
      expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_CLASS)).not.toContainEqual({
        ...OTHER_FILTERS,
        page: 2,
        limit: 10,
      });
    });

    it('closes the class that was open', async () => {
      const { api, post } = createApi();
      const { rerender } = render(
        <EbookReadingReport
          api={api}
          filters={FILTERS}
          groupBy={EBOOK_READING_GROUP.CLASS}
        />
      );
      fireEvent.click(await screen.findByText('Turma A'));
      expect(await screen.findByText('Ana Beatriz')).toBeInTheDocument();

      rerender(
        <EbookReadingReport
          api={api}
          filters={OTHER_FILTERS}
          groupBy={EBOOK_READING_GROUP.CLASS}
        />
      );

      expect(
        await screen.findByRole('heading', { name: 'Desempenho por turma' })
      ).toBeInTheDocument();
      expect(screen.queryByText('Ana Beatriz')).toBeNull();
      expect(bodiesTo(post, EBOOK_READING_ROUTE.BY_STUDENT)).toHaveLength(1);
    });
  });

  it("opens a student's reading, book by book", async () => {
    const { api, post } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.CLASS}
      />
    );
    fireEvent.click(await screen.findByText('Turma A'));

    fireEvent.click(await screen.findByText('Ana Beatriz'));

    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('Desempenho em 7 dias')).toBeInTheDocument();
    expect(
      await within(modal).findByText('Histórico completo')
    ).toBeInTheDocument();
    expect(
      within(modal).getByText('Escola Cecília Meireles • Turma A • 4º ano')
    ).toBeInTheDocument();
    expect(within(modal).getByText('Lido')).toBeInTheDocument();
    expect(within(modal).getByText('Em leitura')).toBeInTheDocument();
    expect(within(modal).getByText('Aberto')).toBeInTheDocument();
    expect(bodiesTo(post, EBOOK_READING_ROUTE.STUDENT)[0]).toEqual({
      ...FILTERS,
      userInstitutionId: 'student-1',
    });
  });

  it('closes the student modal', async () => {
    const { api } = createApi();
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.CLASS}
      />
    );
    fireEvent.click(await screen.findByText('Turma A'));
    fireEvent.click(await screen.findByText('Ana Beatriz'));
    const modal = await screen.findByRole('dialog');

    fireEvent.click(within(modal).getByRole('button', { name: /fechar/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('shows a dash for a class without its school year', async () => {
    const { api, post } = createApi();
    const byClass = ROUTES[EBOOK_READING_ROUTE.BY_CLASS];
    post.mockImplementation((route: string, body: Body) =>
      Promise.resolve({
        data: {
          message: 'ok',
          data:
            route === EBOOK_READING_ROUTE.BY_CLASS
              ? page([group('class-b', 'Turma B', 0)])
              : (ROUTES[route] ?? byClass)(body),
        },
      })
    );
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.CLASS}
      />
    );

    const row = (await screen.findByText('Turma B')).closest('tr');
    expect(within(row as HTMLElement).getByText('—')).toBeInTheDocument();
    expect(screen.getByTestId('reading-tier-none')).toBeInTheDocument();
  });

  it('offers to try again when the table does not load', async () => {
    const { api, post } = createApi();
    post.mockImplementation((route: string, body: Body) =>
      route === EBOOK_READING_ROUTE.BY_SCHOOL
        ? Promise.reject(new Error('rede'))
        : Promise.resolve({
            data: { message: 'ok', data: ROUTES[route](body) },
          })
    );
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL}
      />
    );

    expect(
      await screen.findByText('Não foi possível carregar a tabela de leitura.')
    ).toBeInTheDocument();
    post.mockImplementation((route: string, body: Body) =>
      Promise.resolve({ data: { message: 'ok', data: ROUTES[route](body) } })
    );
    const alert = screen
      .getByText('Não foi possível carregar a tabela de leitura.')
      .closest('[role="alert"]') as HTMLElement;
    fireEvent.click(within(alert).getByText('Tentar novamente'));

    expect(
      await screen.findByText('Escola Monteiro Lobato')
    ).toBeInTheDocument();
  });

  it('offers to try again when a part does not load', async () => {
    const { api, post } = createApi();
    post.mockImplementationOnce(() => Promise.reject(new Error('rede')));
    render(
      <EbookReadingReport
        api={api}
        filters={FILTERS}
        groupBy={EBOOK_READING_GROUP.SCHOOL}
      />
    );

    const alert = await screen.findByText(
      'Não foi possível carregar o resumo de leitura.'
    );
    fireEvent.click(
      within(alert.closest('[role="alert"]') as HTMLElement).getByText(
        'Tentar novamente'
      )
    );

    await waitFor(() =>
      expect(
        within(screen.getByTestId('ebook-reading-summary')).getByText('1.234')
      ).toBeInTheDocument()
    );
  });
});
