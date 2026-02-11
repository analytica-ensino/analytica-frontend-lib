import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TimeChart,
  TIME_CHART_CATEGORY_KEY,
  STUDENT_CATEGORIES,
  DEFAULT_CATEGORIES,
  calculateHourTicks,
  bgClassToCssVar,
} from './TimeChart';
import type { TimeChartData } from './TimeChart';

const studentData: TimeChartData = {
  categories: STUDENT_CATEGORIES,
  hoursByPeriod: [
    {
      label: 'SEG',
      activities: 3,
      content: 4,
      simulations: 3,
      questionnaires: 1,
    },
    {
      label: 'TER',
      activities: 2,
      content: 3,
      simulations: 0,
      questionnaires: 1,
    },
    {
      label: 'QUA',
      activities: 4,
      content: 1,
      simulations: 2,
      questionnaires: 0,
    },
    {
      label: 'QUI',
      activities: 1,
      content: 2,
      simulations: 3,
      questionnaires: 1,
    },
    {
      label: 'SEX',
      activities: 2,
      content: 1,
      simulations: 1,
      questionnaires: 2,
    },
    {
      label: 'SAB',
      activities: 0.5,
      content: 0.5,
      simulations: 0,
      questionnaires: 0,
    },
    {
      label: 'DOM',
      activities: 0,
      content: 0,
      simulations: 0,
      questionnaires: 0,
    },
  ],
};

const teacherData: TimeChartData = {
  categories: DEFAULT_CATEGORIES,
  hoursByPeriod: [
    { label: 'SEG', activities: 0, recommendedLessons: 11 },
    { label: 'TER', activities: 3, recommendedLessons: 7 },
    { label: 'QUA', activities: 9, recommendedLessons: 2 },
    { label: 'QUI', activities: 0, recommendedLessons: 11 },
    { label: 'SEX', activities: 1, recommendedLessons: 6 },
    { label: 'SAB', activities: 0, recommendedLessons: 6 },
    { label: 'DOM', activities: 0, recommendedLessons: 11 },
  ],
};

const zeroData: TimeChartData = {
  categories: STUDENT_CATEGORIES,
  hoursByPeriod: [
    {
      label: 'SEG',
      activities: 0,
      content: 0,
      simulations: 0,
      questionnaires: 0,
    },
    {
      label: 'TER',
      activities: 0,
      content: 0,
      simulations: 0,
      questionnaires: 0,
    },
  ],
};

describe('TimeChart', () => {
  describe('Rendering', () => {
    it('renders with default titles', () => {
      render(<TimeChart data={studentData} />);
      expect(screen.getByText('Dados de horas por semana')).toBeInTheDocument();
      expect(screen.getByText('Dados de horas por item')).toBeInTheDocument();
    });

    it('renders with custom titles', () => {
      render(
        <TimeChart
          data={studentData}
          barChartTitle="Custom Bar"
          pieChartTitle="Custom Pie"
        />
      );
      expect(screen.getByText('Custom Bar')).toBeInTheDocument();
      expect(screen.getByText('Custom Pie')).toBeInTheDocument();
    });

    it('renders correct number of legend items for student profile', () => {
      render(<TimeChart data={studentData} />);
      expect(screen.getAllByText('Atividades')).toHaveLength(2);
      expect(screen.getAllByText('Conteúdo')).toHaveLength(2);
      expect(screen.getAllByText('Simulados')).toHaveLength(2);
      expect(screen.getAllByText('Questionários')).toHaveLength(2);
    });

    it('renders correct number of legend items for teacher profile', () => {
      render(<TimeChart data={teacherData} />);
      expect(screen.getAllByText('Atividades')).toHaveLength(2);
      expect(screen.getAllByText('Aulas recomendadas')).toHaveLength(2);
    });

    it('renders weekday labels', () => {
      render(<TimeChart data={studentData} />);
      expect(screen.getByTestId('day-label-SEG')).toBeInTheDocument();
      expect(screen.getByTestId('day-label-TER')).toBeInTheDocument();
      expect(screen.getByTestId('day-label-QUA')).toBeInTheDocument();
      expect(screen.getByTestId('day-label-QUI')).toBeInTheDocument();
      expect(screen.getByTestId('day-label-SEX')).toBeInTheDocument();
      expect(screen.getByTestId('day-label-SAB')).toBeInTheDocument();
      expect(screen.getByTestId('day-label-DOM')).toBeInTheDocument();
    });

    it('renders both chart cards', () => {
      const { container } = render(<TimeChart data={studentData} />);
      const cards = container.querySelectorAll('.rounded-xl');
      expect(cards.length).toBe(2);
    });
  });

  describe('Stacked Bar Chart', () => {
    it('renders bar segments for days with data', () => {
      render(<TimeChart data={studentData} />);
      expect(
        screen.getByTestId('bar-segment-SEG-activities')
      ).toBeInTheDocument();
      expect(screen.getByTestId('bar-segment-SEG-content')).toBeInTheDocument();
      expect(
        screen.getByTestId('bar-segment-SEG-simulations')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('bar-segment-SEG-questionnaires')
      ).toBeInTheDocument();
    });

    it('does not render zero-value segments', () => {
      render(<TimeChart data={studentData} />);
      // DOM has 0 for all categories, so no segments should render
      expect(
        screen.queryByTestId('bar-segment-DOM-activities')
      ).not.toBeInTheDocument();
    });

    it('applies correct color classes to segments', () => {
      render(<TimeChart data={studentData} />);
      const segment = screen.getByTestId('bar-segment-SEG-activities');
      expect(segment.className).toContain('bg-success-700');
    });

    it('applies rounded corners correctly', () => {
      render(<TimeChart data={studentData} />);
      const firstSegment = screen.getByTestId('bar-segment-SEG-activities');
      expect(firstSegment.className).toContain('rounded-b-md');

      const lastSegment = screen.getByTestId('bar-segment-SEG-questionnaires');
      expect(lastSegment.className).toContain('rounded-t-md');
    });
  });

  describe('Pie Chart', () => {
    it('renders SVG element', () => {
      render(<TimeChart data={studentData} />);
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('renders slices for each category with data', () => {
      render(<TimeChart data={studentData} />);
      expect(screen.getByTestId('pie-slice-activities')).toBeInTheDocument();
      expect(screen.getByTestId('pie-slice-content')).toBeInTheDocument();
      expect(screen.getByTestId('pie-slice-simulations')).toBeInTheDocument();
      expect(
        screen.getByTestId('pie-slice-questionnaires')
      ).toBeInTheDocument();
    });

    it('displays percentage labels for slices >= 5%', () => {
      render(<TimeChart data={teacherData} />);
      // Teacher data has significant percentages for both categories
      const pieChart = screen.getByTestId('pie-chart');
      const textElements = pieChart.querySelectorAll('text');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('renders placeholder circle when all values are zero', () => {
      render(<TimeChart data={zeroData} />);
      const pieChart = screen.getByTestId('pie-chart');
      const circle = pieChart.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });
  });

  describe('Y-Axis', () => {
    it('renders Y-axis ticks with h suffix', () => {
      render(<TimeChart data={studentData} />);
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\dh/).length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero values without errors', () => {
      expect(() => render(<TimeChart data={zeroData} />)).not.toThrow();
    });

    it('handles missing category keys in period items', () => {
      const data: TimeChartData = {
        categories: STUDENT_CATEGORIES,
        hoursByPeriod: [
          { label: 'SEG', activities: 5 }, // missing other keys
        ],
      };
      expect(() => render(<TimeChart data={data} />)).not.toThrow();
    });

    it('supports custom className', () => {
      const { container } = render(
        <TimeChart data={studentData} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('calculateHourTicks', () => {
  it('returns [0] for maxHours = 0', () => {
    expect(calculateHourTicks(0)).toEqual([0]);
  });

  it('returns [0] for negative maxHours', () => {
    expect(calculateHourTicks(-5)).toEqual([0]);
  });

  it('returns [12, 9, 6, 3, 0] for maxHours around 10-12', () => {
    expect(calculateHourTicks(11)).toEqual([12, 9, 6, 3, 0]);
    expect(calculateHourTicks(12)).toEqual([12, 9, 6, 3, 0]);
  });

  it('returns evenly spaced ticks for small maxHours', () => {
    expect(calculateHourTicks(1)).toEqual([4, 3, 2, 1, 0]);
  });

  it('returns [8, 6, 4, 2, 0] for maxHours = 5', () => {
    expect(calculateHourTicks(5)).toEqual([8, 6, 4, 2, 0]);
  });
});

describe('bgClassToCssVar', () => {
  it('converts bg-success-800 to CSS variable', () => {
    expect(bgClassToCssVar('bg-success-800')).toBe('var(--color-success-800)');
  });

  it('converts bg-indicator-positive to CSS variable', () => {
    expect(bgClassToCssVar('bg-indicator-positive')).toBe(
      'var(--color-indicator-positive)'
    );
  });

  it('converts bg-warning-400 to CSS variable', () => {
    expect(bgClassToCssVar('bg-warning-400')).toBe('var(--color-warning-400)');
  });
});

describe('Predefined Categories', () => {
  it('STUDENT_CATEGORIES has 4 categories with enum keys', () => {
    expect(STUDENT_CATEGORIES).toHaveLength(4);
    expect(STUDENT_CATEGORIES.map((c) => c.key)).toEqual([
      TIME_CHART_CATEGORY_KEY.ACTIVITIES,
      TIME_CHART_CATEGORY_KEY.CONTENT,
      TIME_CHART_CATEGORY_KEY.SIMULATIONS,
      TIME_CHART_CATEGORY_KEY.QUESTIONNAIRES,
    ]);
  });

  it('DEFAULT_CATEGORIES has 2 categories with enum keys', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(2);
    expect(DEFAULT_CATEGORIES.map((c) => c.key)).toEqual([
      TIME_CHART_CATEGORY_KEY.ACTIVITIES,
      TIME_CHART_CATEGORY_KEY.RECOMMENDED_LESSONS,
    ]);
  });
});

describe('hoursByItem prop', () => {
  it('uses hoursByItem for pie chart when provided', () => {
    const data: TimeChartData = {
      categories: DEFAULT_CATEGORIES,
      hoursByPeriod: [{ label: 'SEG', activities: 1, recommendedLessons: 1 }],
      hoursByItem: { activities: 30, recommendedLessons: 70 },
    };
    render(<TimeChart data={data} />);
    const pieChart = screen.getByTestId('pie-chart');
    const texts = pieChart.querySelectorAll('text');
    const percentages = Array.from(texts).map((t) => t.textContent);
    expect(percentages).toContain('30%');
    expect(percentages).toContain('70%');
  });
});

describe('Hover interactions', () => {
  describe('Bar chart hover', () => {
    it('renders tooltip content for bars with data', () => {
      render(<TimeChart data={studentData} />);
      const tooltips = screen.getAllByRole('tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });

    it('renders hover overlay element for bars with data', () => {
      const { container } = render(<TimeChart data={studentData} />);
      const overlays = container.querySelectorAll('.bg-white\\/50');
      expect(overlays.length).toBeGreaterThan(0);
    });

    it('does not render hover overlay for zero-value bars', () => {
      const { container } = render(<TimeChart data={zeroData} />);
      const overlays = container.querySelectorAll('.bg-white\\/50');
      expect(overlays.length).toBe(0);
    });
  });

  describe('Pie chart hover', () => {
    it('shows tooltip on pie slice hover', () => {
      render(<TimeChart data={teacherData} />);
      const slice = screen.getByTestId('pie-slice-activities');
      fireEvent.mouseEnter(slice);
      // Pie tooltip shows percentage (e.g., "Atividades: 19%")
      const pieTooltip = screen.getByText(
        (_, el) =>
          el?.tagName === 'SPAN' &&
          el?.className.includes('font-bold') &&
          /Atividades:.*%/.test(el?.textContent ?? '')
      );
      expect(pieTooltip).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', () => {
      render(<TimeChart data={teacherData} />);
      const slice = screen.getByTestId('pie-slice-activities');
      const pieChart = screen.getByTestId('pie-chart');

      fireEvent.mouseEnter(slice);
      const pieTooltip = screen.queryByText(
        (_, el) =>
          el?.tagName === 'SPAN' &&
          el?.className.includes('font-bold') &&
          /Atividades:.*%/.test(el?.textContent ?? '')
      );
      expect(pieTooltip).toBeInTheDocument();

      fireEvent.mouseLeave(pieChart);
      const pieTooltipAfter = screen.queryByText(
        (_, el) =>
          el?.tagName === 'SPAN' &&
          el?.className.includes('font-bold') &&
          /Atividades:.*%/.test(el?.textContent ?? '')
      );
      expect(pieTooltipAfter).not.toBeInTheDocument();
    });

    it('renders white overlay on hovered slice', () => {
      const { container } = render(<TimeChart data={teacherData} />);
      const slice = screen.getByTestId('pie-slice-activities');

      // Before hover: no white overlay paths
      const overlaysBefore = container.querySelectorAll('[fill="white"]');
      expect(overlaysBefore.length).toBe(0);

      fireEvent.mouseEnter(slice);

      // After hover: white overlay path appears
      const overlaysAfter = container.querySelectorAll('[fill="white"]');
      expect(overlaysAfter.length).toBe(1);
    });

    it('renders circle overlay when hovering a 100% slice', () => {
      const singleCatData: TimeChartData = {
        categories: DEFAULT_CATEGORIES,
        hoursByPeriod: [
          { label: 'SEG', activities: 0, recommendedLessons: 10 },
        ],
      };
      const { container } = render(<TimeChart data={singleCatData} />);
      const slice = screen.getByTestId('pie-slice-recommendedLessons');

      fireEvent.mouseEnter(slice);

      // 100% slice renders a circle overlay instead of a path
      const overlayCircles = container.querySelectorAll('circle[fill="white"]');
      expect(overlayCircles.length).toBe(1);
    });
  });
});

describe('Branch coverage: nullish coalescing fallbacks', () => {
  it('handles missing category key in hoursByItem', () => {
    const data: TimeChartData = {
      categories: STUDENT_CATEGORIES,
      hoursByPeriod: [
        {
          label: 'SEG',
          activities: 5,
          content: 3,
          simulations: 2,
          questionnaires: 1,
        },
      ],
      // Missing 'questionnaires' key — should fallback to 0
      hoursByItem: { activities: 50, content: 30, simulations: 20 } as Record<
        string,
        number
      >,
    };
    expect(() => render(<TimeChart data={data} />)).not.toThrow();
    const pieChart = screen.getByTestId('pie-chart');
    // Only 3 slices rendered (questionnaires = 0 gets filtered out)
    const slices = pieChart.querySelectorAll('[data-testid^="pie-slice-"]');
    expect(slices.length).toBe(3);
  });

  it('handles missing category key in pie totals (no hoursByItem)', () => {
    const data: TimeChartData = {
      categories: DEFAULT_CATEGORIES,
      hoursByPeriod: [
        // Only activities key present, recommendedLessons missing
        { label: 'SEG', activities: 10 },
      ],
    };
    expect(() => render(<TimeChart data={data} />)).not.toThrow();
    const pieChart = screen.getByTestId('pie-chart');
    // Only activities slice rendered
    expect(screen.getByTestId('pie-slice-activities')).toBeInTheDocument();
    expect(
      screen.queryByTestId('pie-slice-recommendedLessons')
    ).not.toBeInTheDocument();

    // Verify pie has percentage text for the single 100% slice
    const texts = pieChart.querySelectorAll('text');
    expect(texts.length).toBe(1);
    expect(texts[0].textContent).toBe('100%');
  });
});
