import { render, screen } from '@testing-library/react';
import { RangeGauge, pointerPercent, type RangeGaugeZone } from './RangeGauge';

const ZONES: RangeGaugeZone[] = [
  { to: 40, colorClass: 'bg-indicator-positive', label: 'Ainda decodificando' },
  { to: 65, colorClass: 'bg-warning-400', label: 'Abaixo do esperado' },
  { colorClass: 'bg-success-400', label: 'Acima do esperado' },
];

const pointerLeft = () =>
  screen.getByTestId('range-gauge-pointer').style.left as string;

describe('pointerPercent', () => {
  it('places the value inside its own band slot', () => {
    // 1st of 3 bands (0-33.3%): 20 is halfway through 0..40
    expect(pointerPercent(20, ZONES, 0, 120)).toBeCloseTo(16.67, 1);
    // 2nd band (33.3-66.6%): 52.5 is halfway through 40..65
    expect(pointerPercent(52.5, ZONES, 0, 120)).toBeCloseTo(50, 1);
    // 3rd band (66.6-100%): 92.5 is halfway through 65..120
    expect(pointerPercent(92.5, ZONES, 0, 120)).toBeCloseTo(83.33, 1);
  });

  it('keeps the pointer within the band that matches the value', () => {
    // Just above the "expected" threshold must land in the LAST third,
    // never over the previous colour — a naive value/max would give 54%.
    expect(pointerPercent(66, ZONES, 0, 120)).toBeGreaterThanOrEqual(66.6);
  });

  it('clamps values outside the scale', () => {
    expect(pointerPercent(-10, ZONES, 0, 120)).toBe(0);
    expect(pointerPercent(999, ZONES, 0, 120)).toBe(100);
  });

  it('returns 0 when there are no zones', () => {
    expect(pointerPercent(10, [], 0, 100)).toBe(0);
  });

  it('does not divide by zero on a zero-width band', () => {
    const degenerate: RangeGaugeZone[] = [
      { to: 10, colorClass: 'a' },
      { to: 10, colorClass: 'b' },
      { colorClass: 'c' },
    ];
    expect(Number.isFinite(pointerPercent(10, degenerate, 10, 10))).toBe(true);
  });
});

describe('RangeGauge', () => {
  it('renders one segment per zone', () => {
    const { container } = render(
      <RangeGauge value={38} max={120} zones={ZONES} />
    );
    expect(container.querySelectorAll('.flex-1')).toHaveLength(3);
  });

  // The measurement and its band are shown as adjacent text by the consumer,
  // so the gauge itself is decorative and must not be announced twice.
  it('is hidden from assistive tech', () => {
    const { container } = render(
      <RangeGauge value={104} max={120} zones={ZONES} />
    );
    expect(
      container.querySelector('[data-component="RangeGauge"]')
    ).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });

  it('positions the pointer', () => {
    render(<RangeGauge value={20} max={120} zones={ZONES} />);
    expect(pointerLeft()).toBe('16.666666666666664%');
  });

  it('can hide the pointer', () => {
    render(
      <RangeGauge value={20} max={120} zones={ZONES} showPointer={false} />
    );
    expect(screen.queryByTestId('range-gauge-pointer')).not.toBeInTheDocument();
  });

  it('pins the pointer to the end on an explicit-max overflow', () => {
    render(<RangeGauge value={999} max={120} zones={ZONES} />);
    expect(pointerLeft()).toBe('100%');
  });

  // With `max` omitted the scale ends at the last bounded threshold (65), so
  // anything at or beyond it belongs at the end of the track — not at the
  // start of the open-ended band.
  it('pins the pointer to the end on an omitted-max overflow', () => {
    render(<RangeGauge value={70} zones={ZONES} />);
    expect(pointerLeft()).toBe('100%');
  });

  it('pins the pointer to the start below the scale', () => {
    render(<RangeGauge value={-5} max={120} zones={ZONES} />);
    expect(pointerLeft()).toBe('0%');
  });
});
