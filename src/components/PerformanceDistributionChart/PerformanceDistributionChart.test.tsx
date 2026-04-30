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
      render(
        <PerformanceDistributionChart counters={createEmptyCounters()} />
      );

      expect(screen.getByText('Sem dados')).toBeInTheDocument();
    });

    it('does not render legend items when all counters are zero', () => {
      render(
        <PerformanceDistributionChart counters={createEmptyCounters()} />
      );

      // When total is 0, buildSlices returns empty array, so no legend items
      expect(screen.queryByText('Ponto de atenção')).not.toBeInTheDocument();
      expect(screen.queryByText('Abaixo da média')).not.toBeInTheDocument();
      expect(screen.queryByText('Acima da média')).not.toBeInTheDocument();
      expect(screen.queryByText('Destaque da turma')).not.toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('renders title', () => {
      render(
        <PerformanceDistributionChart counters={createMockCounters()} />
      );

      expect(
        screen.getByText('Proficiência por quantidade de estudante')
      ).toBeInTheDocument();
    });

    it('renders custom title', () => {
      render(
        <PerformanceDistributionChart
          counters={createMockCounters()}
          title="Distribuição de Desempenho"
        />
      );

      expect(screen.getByText('Distribuição de Desempenho')).toBeInTheDocument();
    });

    it('renders all legend items', () => {
      render(
        <PerformanceDistributionChart counters={createMockCounters()} />
      );

      expect(screen.getByText('Ponto de atenção')).toBeInTheDocument();
      expect(screen.getByText('Abaixo da média')).toBeInTheDocument();
      expect(screen.getByText('Acima da média')).toBeInTheDocument();
      expect(screen.getByText('Destaque da turma')).toBeInTheDocument();
    });

    it('renders correct student counts', () => {
      render(
        <PerformanceDistributionChart counters={createMockCounters()} />
      );

      // Total is 55 students
      expect(screen.getByText(/5 alunos \(9\.1%\)/)).toBeInTheDocument(); // attentionPoint
      expect(screen.getByText(/15 alunos \(27\.3%\)/)).toBeInTheDocument(); // belowAverage
      expect(screen.getByText(/25 alunos \(45\.5%\)/)).toBeInTheDocument(); // aboveAverage
      expect(screen.getByText(/10 alunos \(18\.2%\)/)).toBeInTheDocument(); // highlight
    });

    it('renders singular "aluno" for count of 1', () => {
      const counters: SimulatedPerformanceCounters = {
        highlight: 1,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };

      render(<PerformanceDistributionChart counters={counters} />);

      expect(screen.getByText(/1 aluno \(100\.0%\)/)).toBeInTheDocument();
    });

    it('renders total count', () => {
      render(
        <PerformanceDistributionChart counters={createMockCounters()} />
      );

      expect(screen.getByText('Total: 55 alunos')).toBeInTheDocument();
    });

    it('renders custom totalStudents when provided', () => {
      render(
        <PerformanceDistributionChart
          counters={createMockCounters()}
          totalStudents={100}
        />
      );

      expect(screen.getByText('Total: 100 alunos')).toBeInTheDocument();
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
      expect(screen.getByText('Destaque da turma')).toBeInTheDocument();
    });
  });

  describe('Hover interactions', () => {
    it('changes opacity on legend hover', () => {
      const { container } = render(
        <PerformanceDistributionChart counters={createMockCounters()} />
      );

      const legendItems = container.querySelectorAll('.flex.items-center.gap-3');
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

      // Should show empty legend items
      expect(screen.getByText('Total: 0 alunos')).toBeInTheDocument();
    });
  });
});
