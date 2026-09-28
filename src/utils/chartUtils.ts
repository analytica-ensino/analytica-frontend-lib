/**
 * Extracts a CSS variable from a Tailwind bg- class for SVG fill/stroke usage.
 * E.g., "bg-success-800" → "var(--color-success-800)"
 */
export const bgClassToCssVar = (bgClass: string): string =>
  `var(--color-${bgClass.replace('bg-', '')})`;

/**
 * Converts polar coordinates to Cartesian for SVG arc path calculations.
 * Angles are in degrees, with 0° at the top (12 o'clock position).
 */
export const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/**
 * Generates an SVG filled arc (pie slice) path string.
 * Draws from the center outward, covering startAngle → endAngle (degrees).
 */
export const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string => {
  const s = polarToCartesian(cx, cy, r, endAngle);
  const e = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y} Z`;
};

/**
 * Compact pt-BR formatter for axis ticks, built once.
 *
 * `compact` and not grouping: an axis label is read for magnitude, not for
 * precision, and the exact number is a hover away on the bar itself. The
 * difference is not cosmetic — a 4.192.250 spelled out is nine characters and
 * overflowed the fixed 48px of the axis column, which is what broke the
 * "Dados de questões" chart of the Relatório Momento ENEM when the network
 * crossed four million answers.
 */
const COMPACT_TICK_FORMAT = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/**
 * A chart axis tick, as short as it can be read.
 *
 * Below a thousand nothing changes — 672 stays 672 — so the charts that count
 * students or schools look exactly as they did. Above it the magnitude wins:
 * 4.192.250 becomes "4,2 mi".
 *
 * @param tick - The value on the axis
 * @returns The label to print
 *
 * @example
 * ```typescript
 * formatAxisTick(672);      // '672'
 * formatAxisTick(2362);     // '2,4 mil'
 * formatAxisTick(4192250);  // '4,2 mi'
 * ```
 */
export const formatAxisTick = (tick: number): string =>
  COMPACT_TICK_FORMAT.format(tick);
