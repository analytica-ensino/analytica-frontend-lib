import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { syncDropdownState } from './dropdown';
export {
  getSelectedIdsFromCategories,
  toggleArrayItem,
  toggleSingleValue,
  areFiltersEqual,
} from './activityFilters';
export {
  mapQuestionTypeToEnum,
  mapQuestionTypeToEnumRequired,
} from './questionTypeUtils';
export {
  getStatusBadgeConfig,
  formatTimeSpent,
  formatQuestionNumbers,
  formatDateToBrazilian,
  formatActivityDateToBrazilian,
} from './activityDetailsUtils';

/**
 * Format a number as a rounded percentage string
 * @param value - Number to format (0-100)
 * @returns Formatted string with % suffix (e.g., "72%")
 */
export function formatPercentageRounded(value: number): string {
  return `${Math.round(value)}%`;
}

export { formatScore } from './formatScore';

/**
 * Convert hex color to rgba with opacity for background
 * @param hex - Hex color (e.g., "#4B0082")
 * @param opacity - Opacity value (0-1)
 * @returns rgba string
 */
export function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(107, 114, 128, ${opacity})`; // fallback gray
  const r = Number.parseInt(result[1], 16);
  const g = Number.parseInt(result[2], 16);
  const b = Number.parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Maps Tailwind bg-* class to CSS variable
 * @param bgClass - Tailwind background class (e.g., "bg-error-600")
 * @returns CSS variable string (e.g., "var(--color-error-600)")
 */
export function bgClassToCssVar(bgClass: string): string {
  return `var(--color-${bgClass.replace('bg-', '')})`;
}

/**
 * Converts polar coordinates to Cartesian for SVG arc path calculations.
 * Angles are in degrees, with 0° at the top (12 o'clock position).
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param r - Radius
 * @param angleDeg - Angle in degrees
 * @returns Cartesian coordinates { x, y }
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Generates an SVG filled arc (pie slice) path string.
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param r - Radius
 * @param startAngle - Start angle in degrees
 * @param endAngle - End angle in degrees
 * @returns SVG path string for the arc
 */
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const span = endAngle - startAngle;

  // For full circle (or near-full), use two arcs to avoid SVG arc degeneracy
  if (span >= 359.99) {
    const midAngle = startAngle + 180;
    const s = polarToCartesian(cx, cy, r, startAngle);
    const m = polarToCartesian(cx, cy, r, midAngle);
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${m.x} ${m.y} A ${r} ${r} 0 1 1 ${s.x} ${s.y} Z`;
  }

  const s = polarToCartesian(cx, cy, r, endAngle);
  const e = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = span > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y} Z`;
}

/**
 * Retorna a cor hexadecimal com opacidade 0.3 (4d) se não estiver em dark mode.
 * Se estiver em dark mode, retorna a cor original.
 *
 * @param hexColor - Cor hexadecimal (ex: "#0066b8" ou "0066b8")
 * @param isDark - booleano indicando se está em dark mode
 * @returns string - cor hexadecimal com opacidade se necessário
 */
export function getSubjectColorWithOpacity(
  hexColor: string | undefined,
  isDark: boolean
): string | undefined {
  if (!hexColor) return undefined;
  // Remove o '#' se existir
  let color = hexColor.replace(/^#/, '').toLowerCase();

  if (isDark) {
    // Se está em dark mode, sempre remove opacidade se existir
    if (color.length === 8) {
      color = color.slice(0, 6);
    }
    return `#${color}`;
  } else {
    // Se não está em dark mode (light mode)
    let resultColor: string;
    if (color.length === 6) {
      // Adiciona opacidade 0.3 (4D) para cores de 6 dígitos
      resultColor = `#${color}4d`;
    } else if (color.length === 8) {
      // Já tem opacidade, retorna como está
      resultColor = `#${color}`;
    } else {
      // Para outros tamanhos (3, 4, 5 dígitos), retorna como está
      resultColor = `#${color}`;
    }
    return resultColor;
  }
}
