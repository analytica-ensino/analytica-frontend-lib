import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PerformanceDistributionSection,
  toPerformanceCounters,
} from './PerformanceDistributionSection';
import type {
  EnemMomentExamData,
  EnemMomentPerformanceBand,
  EnemMomentSectionState,
} from './types';

const examData = (
  studentPerformanceBands: EnemMomentPerformanceBand[] = []
): EnemMomentSectionState<EnemMomentExamData> => ({
  data: {
    studentScoreBands: [],
    schoolScoreBands: [],
    language: { ingles: 0, espanhol: 0, withoutChoice: 0 },
    time: {
      averageTotalSeconds: null,
      averageSecondsPerQuestion: null,
      durationSeconds: null,
    },
    studentPerformanceBands,
    studentsWithoutScore: 0,
  },
  loading: false,
  error: null,
});

const counts: EnemMomentPerformanceBand[] = [
  { tag: 'HIGHLIGHT', count: 1 },
  { tag: 'ABOVE_AVERAGE', count: 1 },
  { tag: 'BELOW_AVERAGE', count: 1 },
  { tag: 'ATTENTION_POINT', count: 1 },
  { tag: 'NO_EXAM', count: 4 },
];

/** A legend row of the chart, by its label. */
const legendRow = (label: string) =>
  screen.getByText(label).closest('div')!.parentElement!;

describe('toPerformanceCounters', () => {
  it('maps each tier of the API onto the chart’s counters, "Não participou" too', () => {
    expect(
      toPerformanceCounters([
        { tag: 'NO_EXAM', count: 1 },
        { tag: 'HIGHLIGHT', count: 5 },
        { tag: 'ABOVE_AVERAGE', count: 4 },
        { tag: 'BELOW_AVERAGE', count: 3 },
        { tag: 'ATTENTION_POINT', count: 2 },
      ])
    ).toEqual({
      highlight: 5,
      aboveAverage: 4,
      belowAverage: 3,
      attentionPoint: 2,
      notParticipated: 1,
    });
  });

  it('counts nobody in a tier the API left out', () => {
    expect(toPerformanceCounters([{ tag: 'HIGHLIGHT', count: 2 }])).toEqual({
      highlight: 2,
      aboveAverage: 0,
      belowAverage: 0,
      attentionPoint: 0,
      notParticipated: 0,
    });
  });
});

describe('PerformanceDistributionSection', () => {
  it('lists every tier with its students and share, who did not take it included', () => {
    render(<PerformanceDistributionSection examData={examData(counts)} />);

    expect(
      screen.getByRole('heading', {
        name: 'Desempenho por quantidade de estudante',
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Destaque')).toBeInTheDocument();
    expect(screen.getByText('Não participou')).toBeInTheDocument();
    expect(screen.getAllByText('1 estudante (13%)')).toHaveLength(4);
    expect(screen.getByText('4 estudantes (50%)')).toBeInTheDocument();
    expect(screen.getByText('8 estudantes')).toBeInTheDocument();
  });

  it('paints the five tiers in the map’s colors, best first', () => {
    const { container } = render(
      <PerformanceDistributionSection examData={examData(counts)} />
    );

    const labels = [
      'Destaque',
      'Acima da média',
      'Abaixo da média',
      'Ponto de atenção',
      'Não participou',
    ];
    const positions = labels.map((label) =>
      Array.from(container.querySelectorAll('*')).indexOf(
        screen.getByText(label)
      )
    );
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);

    expect(
      Array.from(container.querySelectorAll('svg path')).map((path) =>
        path.getAttribute('fill')
      )
    ).toEqual([
      'var(--color-map-highlight)',
      'var(--color-map-above-avg)',
      'var(--color-map-below-avg)',
      'var(--color-map-attention)',
      'var(--color-indicator-primary)',
    ]);
    expect(
      legendRow('Não participou').querySelector('.bg-indicator-primary')
    ).not.toBeNull();
  });

  it('dims the other tiers while one is hovered in the legend', () => {
    render(<PerformanceDistributionSection examData={examData(counts)} />);

    fireEvent.mouseEnter(legendRow('Não participou'));
    expect(legendRow('Destaque')).toHaveClass('opacity-50');
    expect(legendRow('Não participou')).not.toHaveClass('opacity-50');

    fireEvent.mouseLeave(legendRow('Não participou'));
    expect(legendRow('Destaque')).not.toHaveClass('opacity-50');
  });

  it('shows an empty pie over a cut with nobody', () => {
    render(
      <PerformanceDistributionSection
        examData={examData(counts.map((band) => ({ ...band, count: 0 })))}
      />
    );

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.getByText('0 estudantes')).toBeInTheDocument();
  });

  it('shows an empty pie when the API sends no tiers', () => {
    render(<PerformanceDistributionSection examData={examData()} />);

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.queryByText('Destaque')).not.toBeInTheDocument();
  });

  it('waits for the exam data', () => {
    const { container } = render(
      <PerformanceDistributionSection
        examData={{ data: null, loading: true, error: null }}
      />
    );

    expect(container.querySelector('.min-h-\\[280px\\]')).toBeInTheDocument();
    expect(
      screen.queryByText('Desempenho por quantidade de estudante')
    ).not.toBeInTheDocument();
  });

  it('shows the error when it fails', () => {
    render(
      <PerformanceDistributionSection
        examData={{ data: null, loading: false, error: 'Erro ao carregar.' }}
      />
    );

    expect(screen.getByText('Erro ao carregar.')).toBeInTheDocument();
  });
});
