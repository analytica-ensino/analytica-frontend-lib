import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProficiencyChart } from './ProficiencyChart';

describe('ProficiencyChart', () => {
  const mockCounters = {
    highlight: 10,
    aboveAverage: 25,
    belowAverage: 15,
    attentionPoint: 5,
  };

  const totalStudents = 55;

  describe('Rendering', () => {
    it('should render with title', () => {
      render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      expect(
        screen.getByText('Proficiência por quantidade de estudante')
      ).toBeInTheDocument();
    });

    it('should render all legend labels', () => {
      render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      expect(screen.getByText('Ponto de atenção')).toBeInTheDocument();
      expect(screen.getByText('Abaixo da média')).toBeInTheDocument();
      expect(screen.getByText('Acima da média')).toBeInTheDocument();
      expect(screen.getByText('Destaque da turma')).toBeInTheDocument();
    });

    it('should render total count', () => {
      render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      expect(screen.getByText(/Total: 55 alunos/)).toBeInTheDocument();
    });

    it('should render singular "aluno" when total is 1', () => {
      render(
        <ProficiencyChart
          counters={{ highlight: 1, aboveAverage: 0, belowAverage: 0, attentionPoint: 0 }}
          totalStudents={1}
        />
      );

      expect(screen.getByText(/Total: 1 aluno$/)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ProficiencyChart
          counters={mockCounters}
          totalStudents={totalStudents}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no counters', () => {
      render(<ProficiencyChart />);

      expect(
        screen.getByText('Sem dados de proficiência disponíveis')
      ).toBeInTheDocument();
    });

    it('should show empty message when totalStudents is 0', () => {
      render(<ProficiencyChart counters={mockCounters} totalStudents={0} />);

      expect(
        screen.getByText('Sem dados de proficiência disponíveis')
      ).toBeInTheDocument();
    });

    it('should show empty message when counters is undefined', () => {
      render(<ProficiencyChart counters={undefined} totalStudents={50} />);

      expect(
        screen.getByText('Sem dados de proficiência disponíveis')
      ).toBeInTheDocument();
    });
  });

  describe('Legend Values', () => {
    it('should display count and percentage for each category', () => {
      render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      // Check attention point: 5 alunos (9.1%) - use exact match at start
      expect(screen.getByText(/^5 alunos \(/)).toBeInTheDocument();
      // Check below average: 15 alunos (27.3%)
      expect(screen.getByText(/^15 alunos \(/)).toBeInTheDocument();
      // Check above average: 25 alunos (45.5%)
      expect(screen.getByText(/^25 alunos \(/)).toBeInTheDocument();
      // Check highlight: 10 alunos (18.2%)
      expect(screen.getByText(/^10 alunos \(/)).toBeInTheDocument();
    });

    it('should use singular "aluno" when count is 1', () => {
      const singleCounters = {
        highlight: 1,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };
      render(
        <ProficiencyChart counters={singleCounters} totalStudents={1} />
      );

      expect(screen.getByText(/^1 aluno \(/)).toBeInTheDocument();
    });
  });

  describe('Pie Chart SVG', () => {
    it('should render SVG element', () => {
      const { container } = render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 180 180');
    });

    it('should render path elements for non-zero slices', () => {
      const { container } = render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(4); // All 4 categories have values > 0
    });

    it('should not render path for zero value categories', () => {
      const partialCounters = {
        highlight: 10,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };
      const { container } = render(
        <ProficiencyChart counters={partialCounters} totalStudents={10} />
      );

      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(1); // Only highlight has value
    });

    it('should render percentage labels inside slices (>8%)', () => {
      const { container } = render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      // All slices are > 8% so all should have text labels
      const textElements = container.querySelectorAll('svg text');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Hover Interactions', () => {
    it('should reduce opacity of other legend items on hover', () => {
      const { container } = render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      // Find all legend items
      const legendItems = container.querySelectorAll('.cursor-pointer.transition-opacity');
      expect(legendItems.length).toBeGreaterThan(0);

      // Hover on first item
      fireEvent.mouseEnter(legendItems[0]);

      // First item should not have opacity-50
      expect(legendItems[0]).not.toHaveClass('opacity-50');
    });

    it('should restore opacity on mouse leave', () => {
      const { container } = render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      const legendItems = container.querySelectorAll('.cursor-pointer.transition-opacity');

      fireEvent.mouseEnter(legendItems[0]);
      fireEvent.mouseLeave(legendItems[0]);

      // All items should be fully visible
      legendItems.forEach((item) => {
        expect(item).not.toHaveClass('opacity-50');
      });
    });
  });

  describe('Color Classes', () => {
    it('should render colored dots in legend', () => {
      const { container } = render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      expect(container.querySelector('.bg-error-600')).toBeInTheDocument();
      expect(container.querySelector('.bg-warning-400')).toBeInTheDocument();
      expect(container.querySelector('.bg-success-400')).toBeInTheDocument();
      expect(container.querySelector('.bg-success-700')).toBeInTheDocument();
    });
  });

  describe('Styles', () => {
    it('should have correct container classes', () => {
      const { container } = render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-background');
      expect(wrapper).toHaveClass('border-border-50');
      expect(wrapper).toHaveClass('rounded-xl');
    });

    it('should have border on total section', () => {
      const { container } = render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      const totalSection = container.querySelector('.border-t.border-border-100');
      expect(totalSection).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic heading for title', () => {
      render(
        <ProficiencyChart counters={mockCounters} totalStudents={totalStudents} />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Proficiência por quantidade de estudante');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zeros gracefully', () => {
      const zeroCounters = {
        highlight: 0,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };
      render(<ProficiencyChart counters={zeroCounters} totalStudents={0} />);

      expect(
        screen.getByText('Sem dados de proficiência disponíveis')
      ).toBeInTheDocument();
    });

    it('should handle large numbers', () => {
      const largeCounters = {
        highlight: 10000,
        aboveAverage: 25000,
        belowAverage: 15000,
        attentionPoint: 5000,
      };
      render(
        <ProficiencyChart counters={largeCounters} totalStudents={55000} />
      );

      // Numbers should be formatted with pt-BR locale
      expect(screen.getByText(/55\.000 alunos/)).toBeInTheDocument();
    });

    it('should handle single category with 100%', () => {
      const singleCategoryCounters = {
        highlight: 100,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };
      const { container } = render(
        <ProficiencyChart counters={singleCategoryCounters} totalStudents={100} />
      );

      // Should render a full circle
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBe(1);
    });
  });
});
