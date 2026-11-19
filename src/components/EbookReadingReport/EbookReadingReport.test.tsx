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
  type EbookReadingGroupRow,
  type EbookReadingMetrics,
  type EbookReadingStudentDetail,
  type EbookReadingStudentRow,
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
});

const STUDENT: EbookReadingStudentRow = {
  userInstitutionId: 'student-1',
  studentName: 'Ana Beatriz',
  avatarUrl: null,
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
  className: 'Turma A',
  schoolYearName: '4º ano',
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
  [EBOOK_READING_ROUTE.SUMMARY]: () => METRICS,
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
 * @returns {{ api: BaseApiClient; post: jest.Mock }} The client and its post
 */
const createApi = () => {
  const post = jest.fn((route: string, body: Body) =>
    Promise.resolve({ data: { message: 'ok', data: ROUTES[route](body) } })
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
    expect(within(modal).getByText('Turma A • 4º ano')).toBeInTheDocument();
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
