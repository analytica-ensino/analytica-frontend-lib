import { bgClassToCssVar, polarToCartesian, describeArc } from './chartUtils';

describe('bgClassToCssVar', () => {
  it.each([
    ['bg-success-800', 'var(--color-success-800)'],
    ['bg-warning-400', 'var(--color-warning-400)'],
    ['bg-indicator-positive', 'var(--color-indicator-positive)'],
    ['bg-background-200', 'var(--color-background-200)'],
    ['bg-success-200', 'var(--color-success-200)'],
  ])('converts "%s" to "%s"', (input, expected) => {
    expect(bgClassToCssVar(input)).toBe(expected);
  });
});

describe('polarToCartesian', () => {
  const cx = 50;
  const cy = 50;
  const r = 40;

  it('points to the top at 0 degrees', () => {
    const p = polarToCartesian(cx, cy, r, 0);
    expect(p.x).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(10); // cy - r
  });

  it('points to the right at 90 degrees', () => {
    const p = polarToCartesian(cx, cy, r, 90);
    expect(p.x).toBeCloseTo(90); // cx + r
    expect(p.y).toBeCloseTo(50);
  });

  it('points to the bottom at 180 degrees', () => {
    const p = polarToCartesian(cx, cy, r, 180);
    expect(p.x).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(90); // cy + r
  });

  it('points to the left at 270 degrees', () => {
    const p = polarToCartesian(cx, cy, r, 270);
    expect(p.x).toBeCloseTo(10); // cx - r
    expect(p.y).toBeCloseTo(50);
  });

  it('works with origin center and r=10 at 90 degrees', () => {
    const p = polarToCartesian(0, 0, 10, 90);
    expect(p.x).toBeCloseTo(10);
    expect(p.y).toBeCloseTo(0);
  });

  it('returns center when r is 0', () => {
    const p = polarToCartesian(30, 70, 0, 45);
    expect(p.x).toBeCloseTo(30);
    expect(p.y).toBeCloseTo(70);
  });
});

describe('describeArc', () => {
  it('returns a path string starting with M cx cy L', () => {
    const path = describeArc(50, 50, 40, 0, 90);
    expect(path).toMatch(/^M 50 50 L/);
  });

  it('returns a path string ending with Z', () => {
    const path = describeArc(50, 50, 40, 0, 90);
    expect(path).toMatch(/Z$/);
  });

  it('embeds the correct radius in the arc command', () => {
    const path = describeArc(50, 50, 40, 0, 90);
    expect(path).toMatch(/A 40 40/);
  });

  it('uses largeArc flag 0 when sweep is less than 180 degrees', () => {
    const path = describeArc(50, 50, 40, 0, 90);
    expect(path).toMatch(/A 40 40 0 0 0/);
  });

  it('uses largeArc flag 0 when sweep is exactly 180 degrees', () => {
    const path = describeArc(50, 50, 40, 0, 180);
    expect(path).toMatch(/A 40 40 0 0 0/);
  });

  it('uses largeArc flag 1 when sweep is greater than 180 degrees', () => {
    const path = describeArc(50, 50, 40, 0, 270);
    expect(path).toMatch(/A 40 40 0 1 0/);
  });

  it('uses the correct center when cx and cy differ from 50', () => {
    const path = describeArc(30, 70, 20, 0, 90);
    expect(path).toMatch(/^M 30 70/);
  });
});
