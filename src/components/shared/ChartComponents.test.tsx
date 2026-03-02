import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  calculateYAxisTicks,
  LegendItem,
  DataBar,
  GridLines,
  YAxis,
  SimplePieChart,
  LegendRow,
  LegendPieCard,
  type PieSlice,
} from './ChartComponents';

// ─── calculateYAxisTicks ──────────────────────────────────────

describe('calculateYAxisTicks', () => {
  it('returns [0] when maxValue is 0', () => {
    expect(calculateYAxisTicks(0)).toEqual([0]);
  });

  it('returns [0] when maxValue is negative', () => {
    expect(calculateYAxisTicks(-5)).toEqual([0]);
  });

  it('rounds up to nearest multiple of 10 and generates 5 ticks', () => {
    const ticks = calculateYAxisTicks(37);
    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toBe(40); // Math.ceil(37/10)*10
    expect(ticks[ticks.length - 1]).toBe(0);
  });

  it('handles exact multiples of 10', () => {
    const ticks = calculateYAxisTicks(100);
    expect(ticks[0]).toBe(100);
    expect(ticks[ticks.length - 1]).toBe(0);
    expect(ticks).toHaveLength(5);
  });
});

// ─── LegendItem ───────────────────────────────────────────────

describe('LegendItem', () => {
  it('renders the label text', () => {
    render(<LegendItem color="bg-success-700" label="Acertos" />);
    expect(screen.getByText('Acertos')).toBeInTheDocument();
  });

  it('applies the color class to the dot element', () => {
    const { container } = render(
      <LegendItem color="bg-warning-300" label="Erros" />
    );
    const dot = container.querySelector('.bg-warning-300');
    expect(dot).toBeInTheDocument();
  });
});

// ─── DataBar ──────────────────────────────────────────────────

describe('DataBar', () => {
  it('renders the label', () => {
    render(
      <DataBar
        label="Jan"
        value={50}
        maxValue={100}
        colorClass="bg-success-700"
        chartHeight={200}
      />
    );
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });

  it('renders bar with zero height when maxValue is 0', () => {
    const { container } = render(
      <DataBar
        label="Jan"
        value={50}
        maxValue={0}
        colorClass="bg-success-700"
        chartHeight={200}
      />
    );
    const bar = container.querySelector('.bg-success-700');
    expect(bar).toHaveStyle({ height: '0px' });
  });

  it('renders bar proportional to value', () => {
    const { container } = render(
      <DataBar
        label="Jan"
        value={50}
        maxValue={100}
        colorClass="bg-success-700"
        chartHeight={200}
      />
    );
    const bar = container.querySelector('.bg-success-700');
    expect(bar).toHaveStyle({ height: '100px' });
  });
});

// ─── GridLines ────────────────────────────────────────────────

describe('GridLines', () => {
  it('renders one line per tick', () => {
    const { container } = render(
      <GridLines ticks={[100, 75, 50, 25, 0]} chartHeight={200} />
    );
    const lines = container.querySelectorAll(
      '.border-t.border-dashed.border-border-200'
    );
    expect(lines).toHaveLength(5);
  });
});

// ─── YAxis ────────────────────────────────────────────────────

describe('YAxis', () => {
  it('renders one label per tick', () => {
    render(<YAxis ticks={[100, 75, 50, 25, 0]} chartHeight={200} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

// ─── SimplePieChart ───────────────────────────────────────────

const twoSlices: PieSlice[] = [
  { label: 'Corretas', value: 60, colorClass: 'bg-success-200' },
  { label: 'Incorretas', value: 40, colorClass: 'bg-warning-400' },
];

const singleSlice: PieSlice[] = [
  { label: 'Único', value: 100, colorClass: 'bg-success-700' },
];

const zeroSlices: PieSlice[] = [
  { label: 'Corretas', value: 0, colorClass: 'bg-success-200' },
  { label: 'Incorretas', value: 0, colorClass: 'bg-warning-400' },
];

describe('SimplePieChart', () => {
  it('renders a fallback circle when all values are zero', () => {
    const { container } = render(<SimplePieChart slices={zeroSlices} />);
    const circle = container.querySelector('.fill-background-200');
    expect(circle).toBeInTheDocument();
  });

  it('renders SVG paths for multi-slice chart', () => {
    const { container } = render(<SimplePieChart slices={twoSlices} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('renders a circle (not a path) for a whole slice (100%)', () => {
    const { container } = render(<SimplePieChart slices={singleSlice} />);
    // The slice is 100% so it renders as <circle> with fill, not <path>
    const circles = container.querySelectorAll('circle');
    // Should have at least one filled circle (the whole slice)
    expect(circles.length).toBeGreaterThan(0);
    // Should have no paths since isWhole=true means path = undefined
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(0);
  });

  it('renders percentage labels for slices >= 5%', () => {
    render(<SimplePieChart slices={twoSlices} />);
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('shows hover overlay path on mouseEnter for a non-whole slice', () => {
    const { container } = render(<SimplePieChart slices={twoSlices} />);
    const groups = container.querySelectorAll('g.cursor-pointer');
    expect(groups.length).toBeGreaterThan(0);

    fireEvent.mouseEnter(groups[0]);

    // Hover overlay is a path with opacity attribute
    const overlayPath = container.querySelector('path[opacity="0.4"]');
    expect(overlayPath).toBeInTheDocument();
  });

  it('shows hover overlay circle on mouseEnter for a whole slice', () => {
    const { container } = render(<SimplePieChart slices={singleSlice} />);
    const group = container.querySelector('g.cursor-pointer')!;

    fireEvent.mouseEnter(group);

    // Hover overlay is a circle with opacity attribute
    const overlayCircle = container.querySelector('circle[opacity="0.4"]');
    expect(overlayCircle).toBeInTheDocument();
  });

  it('clears hover overlay on mouseLeave from SVG', () => {
    const { container } = render(<SimplePieChart slices={twoSlices} />);
    const svg = container.querySelector('svg')!;
    const groups = container.querySelectorAll('g.cursor-pointer');

    fireEvent.mouseEnter(groups[0]);
    expect(container.querySelector('path[opacity="0.4"]')).toBeInTheDocument();

    fireEvent.mouseLeave(svg);
    expect(
      container.querySelector('path[opacity="0.4"]')
    ).not.toBeInTheDocument();
  });

  it('uses direct color prop over colorClass', () => {
    const coloredSlices: PieSlice[] = [
      {
        label: 'Web',
        value: 70,
        colorClass: 'bg-success-700',
        color: 'var(--Success-success700, #206F3E)',
      },
      { label: 'Celular', value: 30, colorClass: 'bg-success-300' },
    ];
    const { container } = render(<SimplePieChart slices={coloredSlices} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });
});

// ─── LegendRow ────────────────────────────────────────────────

describe('LegendRow', () => {
  it('renders label and value', () => {
    render(
      <LegendRow colorClass="bg-success-200" label="Corretas" value={60} />
    );
    expect(screen.getByText('Corretas')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('applies colorClass when no direct color is given', () => {
    const { container } = render(
      <LegendRow colorClass="bg-success-200" label="Corretas" value={60} />
    );
    expect(container.querySelector('.bg-success-200')).toBeInTheDocument();
  });

  it('does not apply colorClass to dot when direct color prop is given', () => {
    const { container } = render(
      <LegendRow
        colorClass="bg-success-200"
        color="var(--Success-success700, #206F3E)"
        label="Web"
        value={80}
      />
    );
    // When color is provided, colorClass is NOT applied (cn('...', !color && colorClass))
    expect(container.querySelector('.bg-success-200')).not.toBeInTheDocument();
    // The dot still exists with base classes
    const dot = container.querySelector('.w-2.h-2.rounded-full');
    expect(dot).toBeInTheDocument();
  });
});

// ─── LegendPieCard ────────────────────────────────────────────

describe('LegendPieCard', () => {
  it('renders all slice labels', () => {
    render(<LegendPieCard slices={twoSlices} />);
    expect(screen.getByText('Corretas')).toBeInTheDocument();
    expect(screen.getByText('Incorretas')).toBeInTheDocument();
  });

  it('renders the pie chart SVG', () => {
    const { container } = render(<LegendPieCard slices={twoSlices} />);
    expect(
      container.querySelector('svg[aria-hidden="true"]')
    ).toBeInTheDocument();
  });
});
