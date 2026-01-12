import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuestionsData } from './QuestionsData';

describe('QuestionsData', () => {
  const mockData = {
    total: 100,
    corretas: 60,
    incorretas: 30,
    emBranco: 10,
  };

  describe('Rendering', () => {
    it('should render with default title', () => {
      render(<QuestionsData data={mockData} />);

      expect(screen.getByText('Dados de questões')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<QuestionsData title="Estatísticas" data={mockData} />);

      expect(screen.getByText('Estatísticas')).toBeInTheDocument();
    });

    it('should render legend items', () => {
      render(<QuestionsData data={mockData} />);

      expect(
        screen.getByText('Total de questões respondidas')
      ).toBeInTheDocument();
      expect(screen.getByText('Questões corretas')).toBeInTheDocument();
      expect(screen.getByText('Questões incorretas')).toBeInTheDocument();
    });

    it('should render bar labels', () => {
      render(<QuestionsData data={mockData} />);

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Corretas')).toBeInTheDocument();
      expect(screen.getByText('Incorretas')).toBeInTheDocument();
    });

    it('should not render blank questions by default', () => {
      render(<QuestionsData data={mockData} />);

      expect(screen.queryByText('Questões em branco')).not.toBeInTheDocument();
      expect(screen.queryByText('Em branco')).not.toBeInTheDocument();
    });

    it('should render blank questions when showEmBranco is true', () => {
      render(<QuestionsData data={mockData} showEmBranco />);

      expect(screen.getByText('Questões em branco')).toBeInTheDocument();
      expect(screen.getByText('Em branco')).toBeInTheDocument();
    });

    it('should apply additional className', () => {
      const { container } = render(
        <QuestionsData data={mockData} className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Y-Axis', () => {
    it('should render Y-axis ticks', () => {
      render(<QuestionsData data={mockData} />);

      // With maxValue of 100, ticks should be 100, 75, 50, 25, 0
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should calculate nice tick values for odd numbers', () => {
      render(
        <QuestionsData
          data={{
            total: 87,
            corretas: 50,
            incorretas: 30,
          }}
        />
      );

      // 87 rounds up to 90, ticks: 90, 68, 45, 23, 0
      expect(screen.getByText('90')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Styles', () => {
    it('should have correct container classes', () => {
      const { container } = render(<QuestionsData data={mockData} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-background');
      expect(wrapper).toHaveClass('border-border-50');
      expect(wrapper).toHaveClass('rounded-xl');
    });

    it('should render blue bar for total', () => {
      const { container } = render(<QuestionsData data={mockData} />);

      const blueBar = container.querySelector('.bg-info-600');
      expect(blueBar).toBeInTheDocument();
    });

    it('should render green bar for correct', () => {
      const { container } = render(<QuestionsData data={mockData} />);

      const greenBar = container.querySelector('.bg-success-200');
      expect(greenBar).toBeInTheDocument();
    });

    it('should render orange bar for incorrect', () => {
      const { container } = render(<QuestionsData data={mockData} />);

      const orangeBar = container.querySelector('.bg-warning-400');
      expect(orangeBar).toBeInTheDocument();
    });

    it('should render gray bar for blank when enabled', () => {
      const { container } = render(
        <QuestionsData data={mockData} showEmBranco />
      );

      const grayBar = container.querySelector('.bg-background-300');
      expect(grayBar).toBeInTheDocument();
    });

    it('should render legend dots with correct colors', () => {
      const { container } = render(
        <QuestionsData data={mockData} showEmBranco />
      );

      // Legend dots are 8x8 rounded-full elements
      const legendDots = container.querySelectorAll('.w-2.h-2.rounded-full');
      expect(legendDots).toHaveLength(4);
    });
  });

  describe('Bar Heights', () => {
    it('should calculate correct bar heights', () => {
      const { container } = render(
        <QuestionsData data={mockData} chartHeight={180} />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      const totalBar = bars[0] as HTMLElement;
      const correctBar = bars[1] as HTMLElement;
      const incorrectBar = bars[2] as HTMLElement;

      // Total = 100, max = 100 → 100% → 180px
      expect(totalBar.style.height).toBe('180px');
      // Correct = 60, max = 100 → 60% → 108px
      expect(correctBar.style.height).toBe('108px');
      // Incorrect = 30, max = 100 → 30% → 54px
      expect(incorrectBar.style.height).toBe('54px');
    });

    it('should use custom maxValue for calculations', () => {
      const { container } = render(
        <QuestionsData data={mockData} maxValue={200} chartHeight={180} />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      const totalBar = bars[0] as HTMLElement;

      // Total = 100, max adjusted to 200 → 50% → 90px
      expect(totalBar.style.height).toBe('90px');
    });

    it('should handle zero total gracefully', () => {
      const { container } = render(
        <QuestionsData
          data={{
            total: 0,
            corretas: 0,
            incorretas: 0,
          }}
        />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      bars.forEach((bar) => {
        expect((bar as HTMLElement).style.height).toBe('0px');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle large numbers', () => {
      render(
        <QuestionsData
          data={{
            total: 10000,
            corretas: 8000,
            incorretas: 1500,
            emBranco: 500,
          }}
          showEmBranco
        />
      );

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Corretas')).toBeInTheDocument();
    });

    it('should not show blank bar when emBranco is undefined', () => {
      render(
        <QuestionsData
          data={{
            total: 100,
            corretas: 80,
            incorretas: 20,
          }}
          showEmBranco
        />
      );

      expect(screen.queryByText('Em branco')).not.toBeInTheDocument();
    });

    it('should render three bars without showEmBranco', () => {
      const { container } = render(<QuestionsData data={mockData} />);

      const bars = container.querySelectorAll('.rounded-lg');
      expect(bars).toHaveLength(3);
    });

    it('should render four bars with showEmBranco', () => {
      const { container } = render(
        <QuestionsData data={mockData} showEmBranco />
      );

      const bars = container.querySelectorAll('.rounded-lg');
      expect(bars).toHaveLength(4);
    });

    it('should render four legend items with showEmBranco', () => {
      const { container } = render(
        <QuestionsData data={mockData} showEmBranco />
      );

      const legendDots = container.querySelectorAll('.w-2.h-2.rounded-full');
      expect(legendDots).toHaveLength(4);
    });

    it('should use custom chart height', () => {
      const { container } = render(
        <QuestionsData data={mockData} chartHeight={200} />
      );

      const barContainers = container.querySelectorAll(
        '.flex.items-end.justify-center'
      );
      barContainers.forEach((container) => {
        expect((container as HTMLElement).style.height).toBe('200px');
      });
    });
  });

  describe('Accessibility', () => {
    it('should use semantic heading for title', () => {
      render(<QuestionsData data={mockData} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Dados de questões');
    });

    it('should have readable legend content', () => {
      render(<QuestionsData data={mockData} showEmBranco />);

      expect(screen.getByText('Total de questões respondidas')).toBeVisible();
      expect(screen.getByText('Questões corretas')).toBeVisible();
      expect(screen.getByText('Questões incorretas')).toBeVisible();
      expect(screen.getByText('Questões em branco')).toBeVisible();
    });

    it('should have readable bar labels', () => {
      render(<QuestionsData data={mockData} showEmBranco />);

      expect(screen.getByText('Total')).toBeVisible();
      expect(screen.getByText('Corretas')).toBeVisible();
      expect(screen.getByText('Incorretas')).toBeVisible();
      expect(screen.getByText('Em branco')).toBeVisible();
    });
  });
});
