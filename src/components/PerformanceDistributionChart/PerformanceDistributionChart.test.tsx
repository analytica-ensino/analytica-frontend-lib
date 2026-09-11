import type React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceDistributionChart } from './PerformanceDistributionChart';
import type { SimulatedPerformanceCounters } from './types';

/**
 * Create mock counters with all categories
 */
function createMockCounters(): SimulatedPerformanceCounters {
  return {
    highlight: 10,
    aboveAverage: 25,
    belowAverage: 15,
    attentionPoint: 5,
  };
}

/**
 * Create mock counters with only some categories
 */
function createPartialCounters(): SimulatedPerformanceCounters {
  return {
    highlight: 5,
    aboveAverage: 20,
    belowAverage: 0,
    attentionPoint: 0,
  };
}

/**
 * Create empty counters
 */
function createEmptyCounters(): SimulatedPerformanceCounters {
  return {
    highlight: 0,
    aboveAverage: 0,
    belowAverage: 0,
    attentionPoint: 0,
  };
}

describe('PerformanceDistributionChart', () => {
  describe('Loading state', () => {
    it('renders skeleton when loading', () => {
      const { container } = render(
        <PerformanceDistributionChart counters={undefined} loading={true} />
      );

      // SkeletonCard should be rendered
      expect(container.querySelector('.min-h-\\[280px\\]')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders "Sem dados" when all counters are zero', () => {
      render(<PerformanceDistributionChart counters={createEmptyCounters()} />);

      expect(screen.getByText('Sem dados')).toBeInTheDocument();
    });

    it('does not render legend items when all counters are zero', () => {
      render(<PerformanceDistributionChart counters={createEmptyCounters()} />);

      // When total is 0, buildSlices returns empty array, so no legend items
      expect(screen.queryByText('Ponto de atenção')).not.toBeInTheDocument();
      expect(screen.queryByText('Abaixo da média')).not.toBeInTheDocument();
      expect(screen.queryByText('Acima da média')).not.toBeInTheDocument();
      expect(screen.queryByText('Destaque da turma')).not.toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('renders title', () => {
      render(<PerformanceDistributionChart counters={createMockCounters()} />);

      expect(
        screen.getByText('Desempenho por quantidade de estudante')
      ).toBeInTheDocument();
    });

    it('renders custom title', () => {
      render(
        <PerformanceDistributionChart
          counters={createMockCounters()}
          title="Distribuição de Desempenho"
        />
      );

      expect(
        screen.getByText('Distribuição de Desempenho')
      ).toBeInTheDocument();
    });

    it('renders all legend items, best band first', () => {
      render(<PerformanceDistributionChart counters={createMockCounters()} />);

      const labels = [
        'Destaque',
        'Acima da média',
        'Abaixo da média',
        'Ponto de atenção',
      ];
      for (const label of labels) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
      expect(screen.queryByText('Destaque da turma')).not.toBeInTheDocument();

      // Legend order matches the design: top-down from Destaque
      const positions = labels.map((label) =>
        Array.from(document.body.querySelectorAll('*')).indexOf(
          screen.getByText(label)
        )
      );
      expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    });

    it('renders student counts with a rounded percentage', () => {
      render(<PerformanceDistributionChart counters={createMockCounters()} />);

      // Total is 55 students
      expect(screen.getByText('10 estudantes (18%)')).toBeInTheDocument(); // highlight
      expect(screen.getByText('25 estudantes (45%)')).toBeInTheDocument(); // aboveAverage
      expect(screen.getByText('15 estudantes (27%)')).toBeInTheDocument(); // belowAverage
      expect(screen.getByText('5 estudantes (9%)')).toBeInTheDocument(); // attentionPoint
    });

    it('renders singular "estudante" for count of 1', () => {
      const counters: SimulatedPerformanceCounters = {
        highlight: 1,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };

      render(<PerformanceDistributionChart counters={counters} />);

      expect(screen.getByText('1 estudante (100%)')).toBeInTheDocument();
      expect(screen.getByText('1 estudante')).toBeInTheDocument();
    });

    it('renders the total row with the label and the count apart', () => {
      render(<PerformanceDistributionChart counters={createMockCounters()} />);

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('55 estudantes')).toBeInTheDocument();
    });

    // Greys and divider of the design: counts in text-600, divider in border-200
    it('uses the design greys for counts and the divider', () => {
      render(<PerformanceDistributionChart counters={createMockCounters()} />);

      expect(screen.getByText('10 estudantes (18%)')).toHaveClass(
        'text-text-600'
      );
      expect(screen.getByText('55 estudantes')).toHaveClass('text-text-600');
      expect(screen.getByText('Total')).toHaveClass('text-text-950');

      const totalRow = screen.getByTestId('performance-distribution-total');
      expect(totalRow).toHaveClass('border-t', 'border-border-200', 'pt-4');
    });

    // Legend and pie split the card in two halves; the pie sits centred in
    // the right one.
    it('gives the pie the right half of the card', () => {
      render(<PerformanceDistributionChart counters={createMockCounters()} />);

      const pieColumn = screen.getByTestId('performance-distribution-pie');
      expect(pieColumn).toHaveClass('basis-1/2', 'justify-center');
      expect(pieColumn.querySelector('svg')).not.toBeNull();
      expect(pieColumn.previousElementSibling).toHaveClass('basis-1/2');
    });

    it('renders custom totalStudents when provided', () => {
      render(
        <PerformanceDistributionChart
          counters={createMockCounters()}
          totalStudents={100}
        />
      );

      expect(screen.getByText('100 estudantes')).toBeInTheDocument();
    });

    it('renders SVG pie chart', () => {
      const { container } = render(
        <PerformanceDistributionChart counters={createMockCounters()} />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Partial data', () => {
    it('renders only non-zero slices in pie chart', () => {
      const { container } = render(
        <PerformanceDistributionChart counters={createPartialCounters()} />
      );

      // Should have paths for non-zero values
      const paths = container.querySelectorAll('svg path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('still renders all legend items even with zero values', () => {
      render(
        <PerformanceDistributionChart counters={createPartialCounters()} />
      );

      expect(screen.getByText('Ponto de atenção')).toBeInTheDocument();
      expect(screen.getByText('Abaixo da média')).toBeInTheDocument();
      expect(screen.getByText('Acima da média')).toBeInTheDocument();
      expect(screen.getByText('Destaque')).toBeInTheDocument();
    });
  });

  describe('Hover interactions', () => {
    it('changes opacity on legend hover', () => {
      const { container } = render(
        <PerformanceDistributionChart counters={createMockCounters()} />
      );

      const legendItems = container.querySelectorAll(
        '.flex.items-center.gap-3'
      );
      expect(legendItems.length).toBeGreaterThan(0);

      // Hover over first legend item
      fireEvent.mouseEnter(legendItems[0]);

      // Other items should have reduced opacity
      const opacityItems = container.querySelectorAll('.opacity-50');
      expect(opacityItems.length).toBeGreaterThan(0);

      // Mouse leave should restore opacity
      fireEvent.mouseLeave(legendItems[0]);
      const opacityItemsAfter = container.querySelectorAll('.opacity-50');
      expect(opacityItemsAfter.length).toBe(0);
    });
  });

  describe('Single category (100%)', () => {
    it('renders circle for 100% slice', () => {
      const counters: SimulatedPerformanceCounters = {
        highlight: 50,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };

      const { container } = render(
        <PerformanceDistributionChart counters={counters} />
      );

      // Should render a circle instead of path for 100%
      const circles = container.querySelectorAll('svg circle');
      expect(circles.length).toBeGreaterThan(0);
    });
  });

  describe('Percentage labels', () => {
    it('shows percentage label for slices >= 8%', () => {
      const { container } = render(
        <PerformanceDistributionChart counters={createMockCounters()} />
      );

      // Check for percentage text elements in SVG
      const textElements = container.querySelectorAll('svg text');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Undefined counters', () => {
    it('handles undefined counters gracefully', () => {
      render(<PerformanceDistributionChart counters={undefined} />);

      // No legend rows, but the total row still reads zero
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('0 estudantes')).toBeInTheDocument();
    });
  });
});

describe('PerformanceDistributionChart colours', () => {
  // The four bands share the semantic `map-*` tokens with the choropleth map,
  // and the legend dot and the pie slice must derive from the same class.
  it('paints legend dots and pie slices with the map band tokens', () => {
    const { container } = render(
      <PerformanceDistributionChart counters={createMockCounters()} />
    );

    const expected = [
      ['Destaque', 'bg-map-highlight', 'var(--color-map-highlight)'],
      ['Acima da média', 'bg-map-above-avg', 'var(--color-map-above-avg)'],
      ['Abaixo da média', 'bg-map-below-avg', 'var(--color-map-below-avg)'],
      ['Ponto de atenção', 'bg-map-attention', 'var(--color-map-attention)'],
    ] as const;

    for (const [label, dotClass, fill] of expected) {
      const legendRow = screen.getByText(label).closest('div')?.parentElement;
      expect(legendRow?.querySelector(`.${dotClass}`)).not.toBeNull();
      expect(container.querySelector(`path[fill="${fill}"]`)).not.toBeNull();
    }
  });
});
