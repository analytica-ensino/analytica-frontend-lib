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
