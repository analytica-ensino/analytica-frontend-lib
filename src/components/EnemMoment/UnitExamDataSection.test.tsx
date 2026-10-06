import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnitExamDataSection } from './UnitExamDataSection';
import type {
  EnemMomentExamData,
  EnemMomentSectionState,
  EnemMomentSummary,
} from './types';

/** Label and value of each bar, read from the chart's sr-only data table. */
const chartRows = () =>
  within(screen.getByRole('table', { name: /^Dados do gráfico/ }))
    .getAllByRole('row')
    .slice(1)
    .map((row) =>
      Array.from(row.children)
        .map((cell) => cell.textContent)
        .join(': ')
    );

const summary = {
  totalStudents: 420,
  participatingStudents: 300,
  studentsWithoutParticipation: 120,
} as EnemMomentSummary;

const examData: EnemMomentExamData = {
  studentScoreBands: [
    { label: '0 a 5', count: 100 },
    { label: '5 a 10', count: 200 },
  ],
  schoolScoreBands: [{ label: '0 a 10', count: 1 }],
  language: { ingles: 120, espanhol: 180, withoutChoice: 0 },
  time: {
    averageTotalSeconds: 4800,
    averageSecondsPerQuestion: 89,
    durationSeconds: 10800,
  },
  studentPerformanceBands: [],
  studentsWithoutScore: 0,
};

const ready = <T,>(data: T): EnemMomentSectionState<T> => ({
  data,
  loading: false,
  error: null,
});
const loading = { data: null, loading: true, error: null };

function renderSection({
  summaryState = ready(summary),
  examDataState = ready(examData),
  hasLanguageChoice = true,
}: Partial<{
  summaryState: EnemMomentSectionState<EnemMomentSummary>;
  examDataState: EnemMomentSectionState<EnemMomentExamData>;
  hasLanguageChoice: boolean | null;
}> = {}) {
  return render(
    <UnitExamDataSection
      summary={summaryState}
      examData={examDataState}
      hasLanguageChoice={hasLanguageChoice}
      examDurationSeconds={null}
    />
  );
}

const heading3 = (name: string) =>
  screen.queryByRole('heading', { level: 3, name });

describe('UnitExamDataSection', () => {
  it('opens with the "Dados do simulado" heading', () => {
    renderSection();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Dados do simulado' })
    ).toBeInTheDocument();
  });

  it('shows how the students scored, with no school histogram', () => {
    renderSection();

    expect(heading3('Estudantes por faixa de nota')).toBeInTheDocument();
    expect(chartRows()).toEqual([
      '0 a 5: Média de 0 a 5: 100 estudantes',
      '5 a 10: Média de 5 a 10: 200 estudantes',
    ]);
    expect(screen.getByTestId('bar-0 a 5')).toHaveClass('bg-info-500');
    expect(screen.getAllByText('300 estudantes').length).toBeGreaterThan(0);
    expect(heading3('Escolas por faixa de média')).not.toBeInTheDocument();
  });

  it('splits the students of the cards in Participação', () => {
    renderSection();

    expect(heading3('Participação')).toBeInTheDocument();
    // 300 took it and 120 did not: 71% and 29% of the 420.
    expect(screen.getByText('300 estudantes (71%)')).toBeInTheDocument();
    expect(screen.getByText('120 estudantes (29%)')).toBeInTheDocument();
    expect(screen.getByText('420 estudantes')).toBeInTheDocument();
    expect(heading3('Idioma')).toBeInTheDocument();
    expect(heading3('Tempo')).toBeInTheDocument();
  });

  it('drops Idioma from a cut with no language to pick', () => {
    renderSection({ hasLanguageChoice: false });

    expect(heading3('Idioma')).not.toBeInTheDocument();
    expect(heading3('Participação')!.closest('.grid')).toHaveClass(
      'lg:grid-cols-2'
    );
  });

  it('waits for the cards and the exam data', () => {
    const { container, unmount } = renderSection({ summaryState: loading });

    expect(container.querySelector('.min-h-\\[520px\\]')).toBeInTheDocument();
    expect(heading3('Tempo')).not.toBeInTheDocument();
    unmount();

    renderSection({ examDataState: loading });
    expect(heading3('Tempo')).not.toBeInTheDocument();
  });

  it('shows the error of either request', () => {
    const { unmount } = renderSection({
      summaryState: { data: null, loading: false, error: 'Erro no resumo.' },
    });
    expect(screen.getByText('Erro no resumo.')).toBeInTheDocument();
    unmount();

    renderSection({
      examDataState: { data: null, loading: false, error: 'Erro nos dados.' },
    });
    expect(screen.getByText('Erro nos dados.')).toBeInTheDocument();
  });

  it('draws nothing but the heading until both have data', () => {
    renderSection({
      examDataState: { data: null, loading: false, error: null },
    });

    expect(
      screen.getByRole('heading', { level: 2, name: 'Dados do simulado' })
    ).toBeInTheDocument();
    expect(heading3('Participação')).not.toBeInTheDocument();
  });
});
