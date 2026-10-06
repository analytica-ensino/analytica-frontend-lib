import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DailyEvolutionSection } from './DailyEvolutionSection';
import type { EnemMomentDay } from './types';

const moments = [
  { examId: 'day-1', label: 'Momento 1' },
  { examId: 'day-2', label: 'Momento 2' },
];

/** A day with its moments' counts; the running totals are the test's. */
const day = (
  date: string,
  byExam: Record<string, number>,
  accumulatedParticipations: number,
  accumulatedAverageScore: number | null = 5.2
): EnemMomentDay => ({
  day: date,
  byExam: moments.map((moment) => ({
    examId: moment.examId,
    participations: byExam[moment.examId] ?? 0,
  })),
  participations: Object.values(byExam).reduce((sum, n) => sum + n, 0),
  accumulatedParticipations,
  accumulatedAverageScore,
});

// Out of order on purpose: the section sorts by date. The 25th has both.
const days: EnemMomentDay[] = [
  day('2026-09-29', { 'day-2': 300 }, 910),
  day('2026-09-21', { 'day-1': 100 }, 100),
  day('2026-09-22', { 'day-1': 200 }, 300, 5.14),
  day('2026-09-23', { 'day-1': 50 }, 350, null),
  day('2026-09-24', { 'day-1': 50 }, 400),
  day('2026-09-25', { 'day-1': 10, 'day-2': 50 }, 460),
  day('2026-09-28', { 'day-2': 150 }, 610),
];

function renderSection(
  overrides: Partial<{
    days: EnemMomentDay[] | null;
    loading: boolean;
    error: string | null;
  }> = {}
) {
  const { days: dataDays = days, loading = false, error = null } = overrides;
  return render(
    <DailyEvolutionSection
      daily={{
        data: dataDays === null ? null : { days: dataDays },
        loading,
        error,
      }}
      moments={moments}
    />
  );
}

/** The days table on screen — not the chart's sr-only data table. */
const daysTable = () =>
  screen
    .getAllByRole('table')
    .find((table) => !table.classList.contains('sr-only')) as HTMLElement;

/** The visual legend only, ignoring the sr-only data table headers. */
const LEGEND_ONLY = { ignore: 'script, style, th' };

const rowTexts = () =>
  within(daysTable())
    .getAllByRole('row')
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
        .join(' | ')
    );

/** Types in the table's search and lets its debounce run out. */
function search(value: string) {
  jest.useFakeTimers();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value } });
  act(() => {
    jest.advanceTimersByTime(300);
  });
  jest.useRealTimers();
}

const sortByDay = () =>
  fireEvent.click(
    within(
      within(daysTable()).getByRole('columnheader', { name: /Dia/ })
    ).getByRole('button')
  );

describe('DailyEvolutionSection', () => {
  beforeEach(() => {
    // The table keeps its sort in the URL: start each test from a clean one.
    globalThis.history.replaceState({}, '', '/');
  });

  it('opens with the "Evolução por dia" heading', () => {
    renderSection();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Evolução por dia' })
    ).toBeInTheDocument();
  });

  it('totals the simulados, overall and per moment', () => {
    renderSection();

    expect(screen.getByText('910 simulados totais')).toBeInTheDocument();
    expect(screen.getByText('Momento 1', LEGEND_ONLY)).toBeInTheDocument();
    expect(screen.getByText('410 simulados')).toBeInTheDocument();
    expect(screen.getByText('Momento 2', LEGEND_ONLY)).toBeInTheDocument();
    expect(screen.getByText('500 simulados')).toBeInTheDocument();
  });

  it('lists only the moments that have days in the cut', () => {
    renderSection({
      days: [day('2026-09-21', { 'day-1': 100 }, 100)].map((only) => ({
        ...only,
        byExam: only.byExam.filter((exam) => exam.examId === 'day-1'),
      })),
    });

    expect(screen.getByText('Momento 1', LEGEND_ONLY)).toBeInTheDocument();
    expect(screen.queryByText('Momento 2')).not.toBeInTheDocument();
  });

  it('writes the singular forms', () => {
    renderSection({ days: [day('2026-09-21', { 'day-1': 1 }, 1)] });

    expect(screen.getByText('1 simulado total')).toBeInTheDocument();
    expect(screen.getByText('1 dia total')).toBeInTheDocument();
  });

  it('draws a bar per day, in date order, split in the color of each moment', () => {
    renderSection();

    const bars = screen.getAllByTestId(/^day-bar-\d{4}-\d{2}-\d{2}$/);
    expect(bars.map((bar) => bar.dataset.testid)).toEqual([
      'day-bar-2026-09-21',
      'day-bar-2026-09-22',
      'day-bar-2026-09-23',
      'day-bar-2026-09-24',
      'day-bar-2026-09-25',
      'day-bar-2026-09-28',
      'day-bar-2026-09-29',
    ]);
    expect(bars[0]).not.toHaveAttribute('aria-label');
    expect(
      screen.getByTestId('day-bar-2026-09-21-day-1').style.backgroundColor
    ).toBe('var(--color-info-300)');
    expect(
      screen.getByTestId('day-bar-2026-09-25-day-2').style.backgroundColor
    ).toBe('var(--color-warning-300)');
    // A moment with nothing that day draws no segment.
    expect(
      screen.queryByTestId('day-bar-2026-09-21-day-2')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Dia 21/09')).toBeInTheDocument();
  });

  it('exposes the chart as an image described by an sr-only data table', () => {
    renderSection();

    const chart = screen.getByRole('img', {
      name: 'Simulados realizados por dia',
    });
    const table = screen.getByRole('table', {
      name: 'Dados do gráfico: Simulados realizados por dia',
    });
    expect(chart).toHaveAttribute('aria-describedby', table.id);
    const firstRow = within(table).getAllByRole('row')[1];
    expect(
      within(firstRow)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['100 simulados', '0 simulados', '100 simulados']);
    expect(within(firstRow).getByRole('rowheader')).toHaveTextContent('21/09');
  });

  it('sizes each segment against the tallest day', () => {
    renderSection();

    const height = (testId: string) =>
      Number.parseFloat(screen.getByTestId(testId).style.height);
    // 300 is twice 150, whatever the top of the axis.
    expect(height('day-bar-2026-09-29-day-2')).toBeCloseTo(
      2 * height('day-bar-2026-09-28-day-2')
    );
    expect(height('day-bar-2026-09-29-day-2')).toBeLessThanOrEqual(180);
  });

  it('names the moment and its count over a hovered segment', () => {
    renderSection();

    fireEvent.mouseEnter(
      screen.getByTestId('day-bar-2026-09-25-day-2').parentElement!
    );

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Momento 2 · 50 simulados'
    );
  });

  it('draws an exam the tabs lack in the first color, as "Momento"', () => {
    renderSection({
      days: [
        {
          day: '2026-09-21',
          byExam: [{ examId: 'other', participations: 5 }],
          participations: 5,
          accumulatedParticipations: 5,
          accumulatedAverageScore: 6,
        },
      ],
    });

    const segment = screen.getByTestId('day-bar-2026-09-21-other');
    expect(segment.style.backgroundColor).toBe('var(--color-info-300)');
    fireEvent.mouseEnter(segment.parentElement!);
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Momento · 5 simulados'
    );
    // Not in the legend: it is no moment of the report.
    expect(screen.queryByText('Momento 1')).not.toBeInTheDocument();
  });

  it('lists the days in date order, numbered, with the running totals', () => {
    renderSection();

    expect(screen.getByText('7 dias totais')).toBeInTheDocument();
    expect(rowTexts()).toEqual([
      'Dia 1 · 21/09 | 100 | 100 | 5,2',
      'Dia 2 · 22/09 | 200 | 300 | 5,1',
      'Dia 3 · 23/09 | 50 | 350 | —',
      'Dia 4 · 24/09 | 50 | 400 | 5,2',
      'Dia 5 · 25/09 | 60 | 460 | 5,2',
      'Dia 6 · 28/09 | 150 | 610 | 5,2',
    ]);
  });

  it('shows every day behind "Mostrar todos os dias", and folds back', () => {
    renderSection();

    fireEvent.click(
      screen.getByRole('button', { name: /Mostrar todos os dias/ })
    );
    expect(rowTexts()).toHaveLength(7);

    fireEvent.click(screen.getByRole('button', { name: /Mostrar menos/ }));
    expect(rowTexts()).toHaveLength(6);
  });

  it('has no "Mostrar todos" when every day already fits', () => {
    renderSection({ days: days.slice(0, 3) });

    expect(
      screen.queryByRole('button', { name: /Mostrar todos os dias/ })
    ).not.toBeInTheDocument();
  });

  it('sorts every day before folding, keeping each day its number', () => {
    renderSection();

    sortByDay();

    expect(rowTexts()[0]).toBe('Dia 7 · 29/09 | 300 | 910 | 5,2');
    expect(rowTexts()).toHaveLength(6);

    // One more click drops the sort: back to date order.
    sortByDay();
    expect(rowTexts()[0]).toBe('Dia 1 · 21/09 | 100 | 100 | 5,2');
  });

  it('searches by day number or date', () => {
    renderSection();

    search('28/09');
    expect(rowTexts()).toEqual(['Dia 6 · 28/09 | 150 | 610 | 5,2']);

    search('dia 3');
    expect(rowTexts()).toEqual(['Dia 3 · 23/09 | 50 | 350 | —']);
  });

  it('says so when the search finds no day', () => {
    renderSection();

    search('31/12');

    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Mostrar todos os dias/ })
    ).not.toBeInTheDocument();
  });

  it('says so when nobody submitted in the cut yet', () => {
    renderSection({ days: [] });

    expect(
      screen.getByText('Ainda não há provas entregues neste recorte.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('treats a cut the API has not answered yet as empty', () => {
    renderSection({ days: null });

    expect(
      screen.getByText('Ainda não há provas entregues neste recorte.')
    ).toBeInTheDocument();
  });

  it('shows a skeleton while it loads', () => {
    const { container } = renderSection({ days: null, loading: true });

    expect(container.querySelector('.min-h-\\[480px\\]')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the error when it fails', () => {
    renderSection({ days: null, error: 'Erro ao carregar.' });

    expect(screen.getByText('Erro ao carregar.')).toBeInTheDocument();
  });
});
