import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VerticalBarChart } from './VerticalBarChart';

describe('VerticalBarChart', () => {
  const mockData = [
    { label: 'SEG', value: 150 },
    { label: 'TER', value: 200 },
    { label: 'QUA', value: 100 },
    { label: 'QUI', value: 175 },
    { label: 'SEX', value: 50 },
  ];

  describe('Rendering', () => {
    it('should render with title', () => {
      render(
        <VerticalBarChart data={mockData} title="Atividades por período" />
      );

      expect(screen.getByText('Atividades por período')).toBeInTheDocument();
    });

    it('should render all X-axis labels', () => {
      render(<VerticalBarChart data={mockData} title="Test" />);

      expect(screen.getByTestId('label-SEG')).toBeInTheDocument();
      expect(screen.getByTestId('label-TER')).toBeInTheDocument();
      expect(screen.getByTestId('label-QUA')).toBeInTheDocument();
      expect(screen.getByTestId('label-QUI')).toBeInTheDocument();
      expect(screen.getByTestId('label-SEX')).toBeInTheDocument();
    });

    it('should render all bars', () => {
      render(<VerticalBarChart data={mockData} title="Test" />);

      expect(screen.getByTestId('bar-SEG')).toBeInTheDocument();
      expect(screen.getByTestId('bar-TER')).toBeInTheDocument();
      expect(screen.getByTestId('bar-QUA')).toBeInTheDocument();
      expect(screen.getByTestId('bar-QUI')).toBeInTheDocument();
      expect(screen.getByTestId('bar-SEX')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <VerticalBarChart
          data={mockData}
          title="Test"
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should have accessible aria-label', () => {
      const { container } = render(
        <VerticalBarChart data={mockData} title="Atividades por período" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveAttribute('aria-label', 'Atividades por período');
    });
  });

  describe('Y-Axis', () => {
    it('should render Y-axis ticks', () => {
      render(<VerticalBarChart data={mockData} title="Test" />);

      // With max value of 200, should have ticks
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle zero values', () => {
      const zeroData = [
        { label: 'A', value: 0 },
        { label: 'B', value: 0 },
      ];
      render(<VerticalBarChart data={zeroData} title="Test" />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Bar Styles', () => {
    it('should apply default bar color', () => {
      render(<VerticalBarChart data={mockData} title="Test" />);

      const bar = screen.getByTestId('bar-SEG');
      expect(bar).toHaveStyle({ backgroundColor: '#4a7c59' });
    });

    it('should apply custom bar color', () => {
      render(
        <VerticalBarChart data={mockData} title="Test" barColor="#ff0000" />
      );

      const bar = screen.getByTestId('bar-SEG');
      expect(bar).toHaveStyle({ backgroundColor: '#ff0000' });
    });

    it('should set aria-label on bars', () => {
      render(<VerticalBarChart data={mockData} title="Test" />);

      const bar = screen.getByTestId('bar-SEG');
      expect(bar).toHaveAttribute('aria-label', 'SEG: 150');
    });
  });

  describe('Tooltip Interaction', () => {
    it('should show tooltip on hover', () => {
      render(<VerticalBarChart data={mockData} title="Test" />);

      const barContainer = screen.getByTestId('bar-TER').parentElement!;
      const initialCount = screen.queryAllByText('200').length;

      fireEvent.mouseEnter(barContainer);

      // Tooltip should appear, so count should increase
      const afterHoverCount = screen.queryAllByText('200').length;
      expect(afterHoverCount).toBeGreaterThan(initialCount);
    });

    it('should hide tooltip on mouse leave', () => {
      render(<VerticalBarChart data={mockData} title="Test" />);

      const barContainer = screen.getByTestId('bar-TER').parentElement!;
      const initialCount = screen.queryAllByText('200').length;

      fireEvent.mouseEnter(barContainer);
      fireEvent.mouseLeave(barContainer);

      // Tooltip should be gone
      const afterLeaveCount = screen.queryAllByText('200').length;
      expect(afterLeaveCount).toBe(initialCount);
    });

    it('should not show tooltip for zero value bars', () => {
      const dataWithZero = [
        { label: 'A', value: 100 },
        { label: 'B', value: 0 },
      ];
      render(<VerticalBarChart data={dataWithZero} title="Test" />);

      const initialZeroCount = screen.queryAllByText('0').length;
      const barContainer = screen.getByTestId('bar-B').parentElement!;
      fireEvent.mouseEnter(barContainer);

      // Should not add a tooltip for zero value
      const afterHoverCount = screen.queryAllByText('0').length;
      expect(afterHoverCount).toBe(initialZeroCount);
    });

    it('should reduce opacity of other bars when one is hovered', () => {
      render(<VerticalBarChart data={mockData} title="Test" />);

      const barContainer = screen.getByTestId('bar-SEG').parentElement!;
      fireEvent.mouseEnter(barContainer);

      const hoveredBar = screen.getByTestId('bar-SEG');
      const otherBar = screen.getByTestId('bar-TER');

      expect(hoveredBar).toHaveStyle({ opacity: '1' });
      expect(otherBar).toHaveStyle({ opacity: '0.5' });
    });
  });

  describe('Chart Height', () => {
    it('should use default chart height', () => {
      const { container } = render(
        <VerticalBarChart data={mockData} title="Test" />
      );

      const chartArea = container.querySelector('.border-l.border-b');
      expect(chartArea).toHaveStyle({ height: '200px' });
    });

    it('should use custom chart height', () => {
      const { container } = render(
        <VerticalBarChart data={mockData} title="Test" chartHeight={300} />
      );

      const chartArea = container.querySelector('.border-l.border-b');
      expect(chartArea).toHaveStyle({ height: '300px' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      render(<VerticalBarChart data={[]} title="Empty Chart" />);

      expect(screen.getByText('Empty Chart')).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const singleData = [{ label: 'Only', value: 100 }];
      render(<VerticalBarChart data={singleData} title="Test" />);

      expect(screen.getByTestId('bar-Only')).toBeInTheDocument();
    });

    it('should handle large numbers', () => {
      const largeData = [
        { label: 'A', value: 1000000 },
        { label: 'B', value: 500000 },
      ];
      render(<VerticalBarChart data={largeData} title="Test" />);

      expect(screen.getByTestId('bar-A')).toBeInTheDocument();
      expect(screen.getByTestId('bar-B')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic heading for title', () => {
      render(<VerticalBarChart data={mockData} title="Chart Title" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Chart Title');
    });

    it('should have aria-hidden on Y-axis', () => {
      const { container } = render(
        <VerticalBarChart data={mockData} title="Test" />
      );

      const yAxis = container.querySelector('[aria-hidden="true"]');
      expect(yAxis).toBeInTheDocument();
    });
  });

  describe('Styles', () => {
    it('should have correct container classes', () => {
      const { container } = render(
        <VerticalBarChart data={mockData} title="Test" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-background');
      expect(wrapper).toHaveClass('border-border-50');
      expect(wrapper).toHaveClass('rounded-xl');
    });
  });
});
