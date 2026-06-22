import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  SimpleBarChart,
  type SimpleBarChartDataItem,
} from './SimpleBarChart';

// ─── Mock data ────────────────────────────────────────────────

const mockData: SimpleBarChartDataItem[] = [
  { label: 'SEG', value: 150 },
  { label: 'TER', value: 200 },
  { label: 'QUA', value: 100 },
  { label: 'QUI', value: 175 },
  { label: 'SEX', value: 125 },
];

const mockDataWithZeros: SimpleBarChartDataItem[] = [
  { label: 'SEG', value: 0 },
  { label: 'TER', value: 0 },
  { label: 'QUA', value: 0 },
];

const mockDataSingleItem: SimpleBarChartDataItem[] = [
  { label: 'Total', value: 500 },
];

describe('SimpleBarChart', () => {
  describe('Rendering', () => {
    it('should render chart title', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Quantidade de acessos por período"
        />
      );

      expect(
        screen.getByText('Quantidade de acessos por período')
      ).toBeInTheDocument();
    });

    it('should render all data labels', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
        />
      );

      expect(screen.getByTestId('label-SEG')).toBeInTheDocument();
      expect(screen.getByTestId('label-TER')).toBeInTheDocument();
      expect(screen.getByTestId('label-QUA')).toBeInTheDocument();
      expect(screen.getByTestId('label-QUI')).toBeInTheDocument();
      expect(screen.getByTestId('label-SEX')).toBeInTheDocument();
    });

    it('should render bars for items with positive values', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
        />
      );

      expect(screen.getByTestId('bar-SEG')).toBeInTheDocument();
      expect(screen.getByTestId('bar-TER')).toBeInTheDocument();
      expect(screen.getByTestId('bar-QUA')).toBeInTheDocument();
    });

    it('should not render bars for items with zero values', () => {
      render(
        <SimpleBarChart
          data={mockDataWithZeros}
          title="Test Chart"
        />
      );

      expect(screen.queryByTestId('bar-SEG')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bar-TER')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bar-QUA')).not.toBeInTheDocument();
    });

    it('should render Y-axis ticks', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
        />
      );

      // Y-axis should show tick values including 0
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render with single data item', () => {
      render(
        <SimpleBarChart
          data={mockDataSingleItem}
          title="Single Item Chart"
        />
      );

      expect(screen.getByTestId('label-Total')).toBeInTheDocument();
      expect(screen.getByTestId('bar-Total')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply default bar color', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
        />
      );

      const bar = screen.getByTestId('bar-SEG');
      expect(bar).toHaveClass('bg-info-500');
    });

    it('should apply custom bar color', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
          barColor="bg-success-500"
        />
      );

      const bar = screen.getByTestId('bar-SEG');
      expect(bar).toHaveClass('bg-success-500');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
          className="custom-class"
        />
      );

      const chartContainer = container.firstChild;
      expect(chartContainer).toHaveClass('custom-class');
    });

    it('should apply default container styles', () => {
      const { container } = render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
        />
      );

      const chartContainer = container.firstChild;
      expect(chartContainer).toHaveClass('flex');
      expect(chartContainer).toHaveClass('flex-col');
      expect(chartContainer).toHaveClass('rounded-xl');
    });
  });

  describe('Chart height', () => {
    it('should use default chart height', () => {
      const { container } = render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
        />
      );

      // Check that chart area exists with default height
      const bar = screen.getByTestId('bar-SEG');
      expect(bar.parentElement).toHaveStyle({ height: '180px' });
    });

    it('should apply custom chart height', () => {
      const { container } = render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
          chartHeight={250}
        />
      );

      const bar = screen.getByTestId('bar-SEG');
      expect(bar.parentElement).toHaveStyle({ height: '250px' });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on container', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Acessos por dia"
        />
      );

      const chart = screen.getByLabelText('Acessos por dia');
      expect(chart).toBeInTheDocument();
    });

    it('should have aria-label on each bar', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
        />
      );

      const barSEG = screen.getByTestId('bar-SEG');
      expect(barSEG).toHaveAttribute('aria-label', 'SEG: 150');

      const barTER = screen.getByTestId('bar-TER');
      expect(barTER).toHaveAttribute('aria-label', 'TER: 200');
    });

    it('should have aria-hidden on Y-axis', () => {
      const { container } = render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
        />
      );

      const yAxis = container.querySelector('[aria-hidden="true"]');
      expect(yAxis).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty data array', () => {
      render(
        <SimpleBarChart
          data={[]}
          title="Empty Chart"
        />
      );

      expect(screen.getByText('Empty Chart')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle all zero values', () => {
      render(
        <SimpleBarChart
          data={mockDataWithZeros}
          title="Zero Values Chart"
        />
      );

      expect(screen.getByText('Zero Values Chart')).toBeInTheDocument();
      // Should still render labels
      expect(screen.getByTestId('label-SEG')).toBeInTheDocument();
    });

    it('should handle very large values', () => {
      const largeData: SimpleBarChartDataItem[] = [
        { label: 'A', value: 1000000 },
        { label: 'B', value: 500000 },
      ];

      render(
        <SimpleBarChart
          data={largeData}
          title="Large Values Chart"
        />
      );

      expect(screen.getByTestId('bar-A')).toBeInTheDocument();
      expect(screen.getByTestId('bar-B')).toBeInTheDocument();
    });
  });

  describe('Props spreading', () => {
    it('should spread additional HTML attributes', () => {
      render(
        <SimpleBarChart
          data={mockData}
          title="Test Chart"
          data-testid="custom-chart"
          id="chart-1"
        />
      );

      const chart = screen.getByTestId('custom-chart');
      expect(chart).toHaveAttribute('id', 'chart-1');
    });
  });
});
