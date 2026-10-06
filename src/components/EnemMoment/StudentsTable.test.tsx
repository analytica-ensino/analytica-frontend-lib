import type { ComponentProps } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  StudentsTableSection,
  createStudentColumns,
  participationOf,
  toStudentsTableFilters,
  toStudentsTableQuery,
  tookAnyExam,
} from './StudentsTable';
import type { EnemMomentStudentRow, EnemMomentStudentsExport } from './types';

const mockPrint = jest.fn();
jest.mock('react-to-print', () => ({
  useReactToPrint: jest.fn(() => mockPrint),
}));

const row: EnemMomentStudentRow = {
  userInstitutionId: 'student-1',
  studentName: 'Ana Beatriz',
  classId: 'class-1',
  className: 'A',
  schoolId: 'school-1',
  schoolName: 'Escola',
  city: 'Curitiba',
  participatedExams: 2,
  partialParticipation: false,
  totalElapsedSeconds: 4805,
  answered: 108,
  correct: 65,
  incorrect: 38,
  blank: 5,
  hitRate: 60.2,
  averageScore: 7,
  performance: 'ABOVE_AVERAGE',
};

const absent: EnemMomentStudentRow = {
  ...row,
  userInstitutionId: 'student-2',
  studentName: 'Bruno Lima',
  participatedExams: 0,
  totalElapsedSeconds: null,
  answered: 0,
  correct: 0,
  incorrect: 0,
  blank: 0,
  hitRate: null,
  averageScore: null,
  performance: 'NO_EXAM',
};

const partial: EnemMomentStudentRow = {
  ...row,
  userInstitutionId: 'student-3',
  studentName: 'Carla Souza',
  participatedExams: 1,
  partialParticipation: true,
};

const classes = [
  { classId: 'class-1', className: 'A', schoolYearName: '3ª série' },
  { classId: 'class-0', className: null, schoolYearName: null },
];

const STUDENT_COLUMNS = createStudentColumns(classes);

type Column = (typeof STUDENT_COLUMNS)[number];

const cellOf = (column: Column, value: EnemMomentStudentRow) =>
  column.render
    ? column.render(value[column.key as keyof EnemMomentStudentRow], value, 0)
    : String(value[column.key as keyof EnemMomentStudentRow]);

const byKey = (key: string, columns: Column[] = STUDENT_COLUMNS) =>
  columns.find((column) => column.key === key)!;

describe('participationOf', () => {
  it('reads who took all, some or none of the moments', () => {
    expect(participationOf(row)).toBe('PARTICIPATED');
    expect(participationOf(partial)).toBe('PARTIAL');
    expect(participationOf(absent)).toBe('NOT_PARTICIPATED');
  });
});

describe('tookAnyExam', () => {
  it('opens only a student who took some exam of the cut', () => {
    expect(tookAnyExam(row)).toBe(true);
    expect(tookAnyExam(partial)).toBe(true);
    expect(tookAnyExam(absent)).toBe(false);
  });
});

describe('createStudentColumns', () => {
  it('has the columns of the Figma, in order', () => {
    expect(STUDENT_COLUMNS.map((column) => column.label)).toEqual([
      'Nome',
      'Turma',
      // No "Tempo": ten columns did not fit the card once the second status
      // one arrived, and a column reachable only by dragging sideways is the
      // same as a column that is not there.
      'Corretas',
      'Incorretas',
      'Em branco',
      'Taxa de acerto',
      'Nota',
      // Both, always: it used to be one, and which one depended on where the
      // manager had come into the report from.
      'Desempenho',
      'Participação',
    ]);
  });

  it('writes the numbers of a student who took the exam', () => {
    expect(cellOf(byKey('correct'), row)).toBe('65');
    expect(cellOf(byKey('incorrect'), row)).toBe('38');
    expect(cellOf(byKey('blank'), row)).toBe('5');
    expect(cellOf(byKey('averageScore'), row)).toBe('7,0');
    expect(cellOf(byKey('className'), row)).toBe('A');
    render(<>{cellOf(byKey('hitRate'), row)}</>);
    expect(screen.getByText('60,2%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute(
      'value',
      '60.2'
    );
  });

  it('names the student beside the avatar', () => {
    const { container } = render(<>{cellOf(byKey('studentName'), row)}</>);

    expect(screen.getByText('Ana Beatriz')).toHaveClass('truncate');
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('marks every number of a student who took nothing, zeros included', () => {
    for (const key of [
      'correct',
      'incorrect',
      'blank',
      'hitRate',
      'averageScore',
    ]) {
      expect(cellOf(byKey(key), absent)).toBe('—');
    }
  });

  it('marks a student without a class', () => {
    expect(cellOf(byKey('className'), { ...row, className: null })).toBe('—');
  });

  it('draws each participation as its badge', () => {
    render(
      <>
        {cellOf(byKey('participatedExams'), row)}
        {cellOf(byKey('participatedExams'), absent)}
      </>
    );

    expect(screen.getByText('PARTICIPOU')).toBeInTheDocument();
    expect(screen.getByText('NÃO PARTICIPOU')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('explains, on hover, a student who took one moment only', async () => {
    const user = userEvent.setup();
    render(<>{cellOf(byKey('participatedExams'), partial)}</>);

    await user.hover(screen.getByText('PARTICIPOU'));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Participou em somente 1 momento'
    );
    expect(
      screen.getByLabelText('Participou em somente 1 momento')
    ).toBeInTheDocument();
  });

  it('filters by the school’s classes, by id', () => {
    const filter = byKey('className').filter!;

    expect(filter).toMatchObject({
      paramKey: 'classIds',
      allLabel: 'Todas as turmas',
      searchable: true,
      searchPlaceholder: 'Buscar turma...',
    });
    expect(
      filter.options.map((option) => [option.value, option.label])
    ).toEqual([
      ['class-1', 'A (3ª série)'],
      ['class-0', 'Sem turma'],
    ]);
  });

  it('offers no class while the options load', () => {
    expect(
      byKey('className', createStudentColumns([])).filter!.options
    ).toEqual([]);
  });

  it('filters by participation', () => {
    const filter = byKey('participatedExams').filter!;

    expect(filter.paramKey).toBe('participation');
    expect(filter.multiple).toBeUndefined();
    expect(
      filter.options.map((option) => [option.value, option.searchText])
    ).toEqual([
      ['PARTICIPATED', 'Participou'],
      ['NOT_PARTICIPATED', 'Não participou'],
    ]);
  });
});

describe('createStudentColumns — both status columns', () => {
  const columns = createStudentColumns([]);
  const performance = byKey('performance', columns);

  it('ends in Desempenho and Participação, without picking between them', () => {
    expect(columns.map((column) => column.label).slice(-3)).toEqual([
      'Nota',
      'Desempenho',
      'Participação',
    ]);
    expect(columns.some((column) => column.key === 'participatedExams')).toBe(
      true
    );
  });

  it('draws each student’s tier, and "Não participou" for who took nothing', () => {
    render(
      <>
        {cellOf(performance, row)}
        {cellOf(performance, absent)}
      </>
    );

    expect(screen.getByText('ACIMA DA MÉDIA')).toBeInTheDocument();
    expect(screen.getByText('NÃO PARTICIPOU')).toBeInTheDocument();
  });

  it('marks who started and has no score yet, in no tier', () => {
    expect(cellOf(performance, { ...row, performance: null })).toBe('—');
  });

  it('filters by any of the five tiers', () => {
    expect(performance.filter).toMatchObject({
      paramKey: 'performances',
      multiple: true,
      allLabel: 'Todos',
    });
    expect(
      performance.filter!.options.map((option) => [
        option.value,
        option.searchText,
      ])
    ).toEqual([
      ['HIGHLIGHT', 'DESTAQUE'],
      ['ABOVE_AVERAGE', 'ACIMA DA MÉDIA'],
      ['BELOW_AVERAGE', 'ABAIXO DA MÉDIA'],
      ['ATTENTION_POINT', 'PONTO DE ATENÇÃO'],
      ['NO_EXAM', 'NÃO PARTICIPOU'],
    ]);
  });
});

describe('toStudentsTableQuery', () => {
  it('asks for the table’s page, search, order and filters', () => {
    expect(
      toStudentsTableQuery({
        page: 2,
        limit: 20,
        search: 'Ana',
        classIds: 'class-1',
        participation: 'NOT_PARTICIPATED',
        sortBy: 'studentName',
        sortOrder: 'desc',
      })
    ).toEqual({
      page: 2,
      limit: 20,
      search: 'Ana',
      classIds: ['class-1'],
      participation: 'NOT_PARTICIPATED',
      performances: undefined,
      orderBy: 'name',
      order: 'desc',
    });
  });

  it('leaves out what the table does not narrow, and an order the API lacks', () => {
    expect(
      toStudentsTableQuery({
        page: 1,
        limit: 10,
        search: '',
        classIds: '',
        participation: 'OUTRO',
        sortBy: 'className',
        sortOrder: 'desc',
      })
    ).toEqual({
      page: 1,
      limit: 10,
      search: undefined,
      classIds: undefined,
      participation: undefined,
      performances: undefined,
      orderBy: undefined,
      order: undefined,
    });
  });

  it('sends no order without a column', () => {
    expect(
      toStudentsTableQuery({ page: 1, limit: 10, sortOrder: 'asc' })
    ).toMatchObject({ orderBy: undefined, order: undefined });
  });

  it.each([
    ['blank', 'blank'],
    ['correct', 'correct'],
    ['incorrect', 'incorrect'],
    ['hitRate', 'hitRate'],
    ['averageScore', 'averageScore'],
  ])('orders the column %s by the API’s %s', (sortBy, orderBy) => {
    expect(
      toStudentsTableQuery({ page: 1, limit: 10, sortBy, sortOrder: 'asc' })
    ).toMatchObject({ orderBy, order: 'asc' });
  });

  it('asks for the tiers picked in the Desempenho filter, none meaning every one', () => {
    expect(
      toStudentsTableQuery({
        page: 1,
        limit: 10,
        performances: ['HIGHLIGHT', 'NO_EXAM'],
      }).performances
    ).toEqual(['HIGHLIGHT', 'NO_EXAM']);
    expect(
      toStudentsTableQuery({ page: 1, limit: 10, performances: [] })
        .performances
    ).toBeUndefined();
    expect(
      toStudentsTableQuery({ page: 1, limit: 10, performances: 'HIGHLIGHT' })
        .performances
    ).toBeUndefined();
  });
});

type SectionProps = ComponentProps<typeof StudentsTableSection>;

const pagination = { page: 1, limit: 10, total: 50, totalPages: 5 };

function renderSection(overrides: Partial<SectionProps> = {}) {
  const props: SectionProps = {
    rows: [row, absent, partial],
    pagination,
    loading: false,
    error: null,
    classes,
    onQueryChange: jest.fn(),
    ...overrides,
  };
  const view = render(<StudentsTableSection {...props} />);
  return {
    ...view,
    props,
    rerenderWith: (next: Partial<SectionProps>) =>
      view.rerender(<StudentsTableSection {...props} {...next} />),
  };
}

const lastQuery = (onQueryChange: SectionProps['onQueryChange']) =>
  (onQueryChange as jest.Mock).mock.lastCall?.[0];

const rowOf = (name: string) => screen.getByText(name).closest('tr')!;

const pickFilter = (column: string, option: string) => {
  fireEvent.click(
    screen.getByRole('button', { name: `Filtrar por ${column}` })
  );
  fireEvent.click(
    within(screen.getByRole('menu')).getByText(option, { exact: true })
  );
};

describe('toStudentsTableFilters', () => {
  it('keeps what the table filters by and drops the page it is on', () => {
    expect(
      toStudentsTableFilters({
        page: 3,
        limit: 20,
        search: 'Ana',
        classIds: ['class-1'],
        participation: 'PARTICIPATED',
        performances: ['HIGHLIGHT'],
        orderBy: 'averageScore',
        order: 'desc',
      })
    ).toEqual({
      search: 'Ana',
      classIds: ['class-1'],
      participation: 'PARTICIPATED',
      performances: ['HIGHLIGHT'],
      orderBy: 'averageScore',
      order: 'desc',
    });
  });
});

describe('StudentsTableSection', () => {
  beforeEach(() => {
    // The table keeps its sort and filters in the URL: start each test clean.
    globalThis.history.replaceState({}, '', '/');
  });

  it('titles the table and draws the rows it is handed', () => {
    renderSection();

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Desempenho por estudante',
      })
    ).toBeInTheDocument();
    expect(
      within(rowOf('Ana Beatriz'))
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual([
      'Ana Beatriz',
      'A',
      '65',
      '38',
      '5',
      '60,2%',
      '7,0',
      'ACIMA DA MÉDIA',
      'PARTICIPOU',
    ]);
    expect(
      within(rowOf('Bruno Lima'))
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual([
      'Bruno Lima',
      'A',
      '—',
      '—',
      '—',
      '—',
      '—',
      // Someone who took nothing reads "NÃO PARTICIPOU" in both columns: the
      // performance tier of a student with no score IS "não participou", and
      // the column beside it says the same. That repetition is the price of
      // showing both.
      'NÃO PARTICIPOU',
      'NÃO PARTICIPOU',
    ]);
  });

  it('sorts by every column the API orders by — not Turma — starting by name', () => {
    renderSection();

    const sortable = screen
      .getAllByRole('columnheader')
      .filter((header) => header.hasAttribute('aria-sort'));
    expect(sortable.map((header) => header.textContent)).toEqual([
      'Nome',
      'Corretas',
      'Incorretas',
      'Em branco',
      'Taxa de acerto',
      'Nota',
    ]);
    expect(sortable[0]).toHaveAttribute('aria-sort', 'ascending');
  });

  it('asks for the first page by name as it opens', () => {
    const { props } = renderSection();

    expect(props.onQueryChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: undefined,
      classIds: undefined,
      participation: undefined,
      performances: undefined,
      orderBy: 'name',
      order: 'asc',
    });
  });

  it('asks for the order picked in a header', () => {
    const { props } = renderSection();

    fireEvent.click(
      within(screen.getByRole('columnheader', { name: 'Nota' })).getByRole(
        'button'
      )
    );

    expect(lastQuery(props.onQueryChange)).toMatchObject({
      orderBy: 'averageScore',
      order: 'asc',
    });
  });

  it('asks for the students of the class picked in the Turma filter', () => {
    const { props } = renderSection();

    pickFilter('Turma', 'A (3ª série)');

    expect(lastQuery(props.onQueryChange)).toMatchObject({
      page: 1,
      classIds: ['class-1'],
    });
  });

  it('asks for who did not take it in the Participação filter', () => {
    const { props } = renderSection();

    pickFilter('Participação', 'NÃO PARTICIPOU');

    expect(lastQuery(props.onQueryChange)).toMatchObject({
      participation: 'NOT_PARTICIPATED',
    });
  });

  it('brings Desempenho beside Participação, with both filters', () => {
    const { props } = renderSection();

    expect(
      screen.getByRole('columnheader', { name: /Desempenho/ })
    ).toBeInTheDocument();
    // And the other one is still there: a school's page and the unit report
    // became the same table, with the same columns.
    expect(
      screen.getByRole('button', { name: 'Filtrar por Participação' })
    ).toBeInTheDocument();
    expect(
      within(rowOf('Ana Beatriz')).getByText('ACIMA DA MÉDIA')
    ).toBeInTheDocument();

    pickFilter('Desempenho', 'DESTAQUE');
    fireEvent.click(
      within(screen.getByRole('menu')).getByText('NÃO PARTICIPOU', {
        exact: true,
      })
    );

    expect(lastQuery(props.onQueryChange)).toMatchObject({
      performances: ['HIGHLIGHT', 'NO_EXAM'],
    });
  });

  it('offers no download unless the app can fetch the list', () => {
    renderSection();

    expect(
      screen.queryByRole('button', { name: /Baixar tabela/ })
    ).not.toBeInTheDocument();
  });

  it('offers the download beside the search when the app can fetch the list', () => {
    renderSection({ loadExport: jest.fn() });

    const button = screen.getByRole('button', { name: /Baixar tabela/ });
    const search = screen.getByRole('searchbox');
    expect(
      button.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Desempenho por estudante',
      })
    ).toBeInTheDocument();
  });

  it('prints in the PDF what the table is filtering when it is asked for', async () => {
    const exportData: EnemMomentStudentsExport = {
      exams: [{ examId: 'exam-1', title: 'Simulado 1' }],
      students: [
        {
          userInstitutionId: row.userInstitutionId,
          studentName: row.studentName,
          email: 'ana@escola.pr.gov.br',
          className: 'A',
          moments: [{ examId: 'exam-1', status: 'DONE' }],
        },
      ],
    };
    const loadFilteredStudents = jest.fn().mockResolvedValue([row]);
    renderSection({
      loadExport: jest.fn().mockResolvedValue(exportData),
      loadFilteredStudents,
    });

    jest.useFakeTimers();
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Ana' },
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    jest.useRealTimers();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Baixar tabela/ }));
    await user.click(screen.getByTestId('download-pdf-option'));
    await user.click(screen.getByTestId('download-confirm-btn'));

    await waitFor(() => expect(mockPrint).toHaveBeenCalledTimes(1));
    expect(loadFilteredStudents).toHaveBeenCalledTimes(1);
    expect(loadFilteredStudents).toHaveBeenCalledWith({
      search: 'Ana',
      orderBy: 'name',
      order: 'asc',
    });
  });

  it('keeps searching with the download in the header', () => {
    const { props } = renderSection({ loadExport: jest.fn() });

    jest.useFakeTimers();
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Ana' },
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    jest.useRealTimers();

    expect(lastQuery(props.onQueryChange)).toMatchObject({ search: 'Ana' });
  });

  it('asks for the students whose name matches the search', () => {
    const { props } = renderSection();

    jest.useFakeTimers();
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Ana' },
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    jest.useRealTimers();

    expect(lastQuery(props.onQueryChange)).toMatchObject({
      page: 1,
      search: 'Ana',
    });
  });

  it('pages by student, with the API’s totals', () => {
    const { props } = renderSection();

    expect(screen.getByText('Página 1 de 5')).toBeInTheDocument();
    expect(screen.getByText(/de 50 estudantes/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(lastQuery(props.onQueryChange)).toMatchObject({ page: 2 });
  });

  it('pages over nothing before the first answer', () => {
    renderSection({ pagination: null, rows: [row] });

    expect(screen.getByText(/de 0 estudantes/)).toBeInTheDocument();
  });

  it('opens the student of a row', () => {
    const onStudentClick = jest.fn();
    renderSection({ onStudentClick });

    fireEvent.click(screen.getByText('Carla Souza'));

    expect(onStudentClick).toHaveBeenCalledWith(partial);
    expect(rowOf('Carla Souza')).toHaveClass('cursor-pointer');
  });

  it('leaves the rows of students who took nothing out of the click', () => {
    const onStudentClick = jest.fn();
    renderSection({ onStudentClick });

    fireEvent.click(screen.getByText('Bruno Lima'));

    expect(onStudentClick).not.toHaveBeenCalled();
    expect(rowOf('Bruno Lima')).not.toHaveClass('cursor-pointer');
  });

  it('opens nothing without a handler', () => {
    renderSection();

    expect(rowOf('Ana Beatriz')).not.toHaveClass('cursor-pointer');
    expect(() =>
      fireEvent.click(screen.getByText('Ana Beatriz'))
    ).not.toThrow();
  });

  it('keeps its params under the table id it is given', () => {
    renderSection({ tableId: 'unitStudents' });

    expect(globalThis.location.search).toContain(
      'unitStudents_sortBy=studentName'
    );
  });

  it('namespaces its params as the students table by default', () => {
    renderSection();

    expect(globalThis.location.search).toContain(
      'enemMomentStudents_sortBy=studentName'
    );
  });

  it('says so when no student matches', () => {
    renderSection({ rows: [], pagination: { ...pagination, total: 0 } });

    expect(screen.getByText('Nenhum estudante encontrado')).toBeInTheDocument();
  });

  it('shows the error in place of the table when it fails', () => {
    renderSection({ error: 'Erro ao carregar os estudantes.' });

    expect(
      screen.getByText('Erro ao carregar os estudantes.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  describe('while a page loads', () => {
    const busyArea = () =>
      screen.getByRole('table').parentElement!.closest('[aria-busy]')!;

    it('shows a skeleton on the first load', () => {
      const { container } = renderSection({ rows: [], loading: true });

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(busyArea()).toHaveAttribute('aria-busy', 'false');
    });

    it('does not show the rows of another cut while the first page loads', () => {
      // Keyed on the cut, the table starts over: the rows in memory are stale.
      const { container } = renderSection({ rows: [row], loading: true });

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(screen.queryByText('Ana Beatriz')).not.toBeInTheDocument();
    });

    it('keeps the previous rows on screen, dimmed, when a new page loads', () => {
      const { container, rerenderWith } = renderSection({
        rows: [],
        loading: true,
      });
      rerenderWith({ rows: [row], loading: false });
      expect(busyArea()).toHaveAttribute('aria-busy', 'false');
      expect(busyArea()).not.toHaveClass('opacity-50');

      rerenderWith({ rows: [row], loading: true });

      expect(screen.getByText('Ana Beatriz')).toBeInTheDocument();
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
      expect(busyArea()).toHaveAttribute('aria-busy', 'true');
      expect(busyArea()).toHaveClass('opacity-50', 'pointer-events-none');

      rerenderWith({ rows: [partial], loading: false });
      expect(screen.getByText('Carla Souza')).toBeInTheDocument();
      expect(busyArea()).toHaveAttribute('aria-busy', 'false');
    });

    it('goes back to the skeleton when there is nothing to keep', () => {
      const { container, rerenderWith } = renderSection({
        rows: [],
        loading: true,
      });
      rerenderWith({ rows: [], loading: false });
      expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();

      rerenderWith({ rows: [], loading: true });

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });
});
