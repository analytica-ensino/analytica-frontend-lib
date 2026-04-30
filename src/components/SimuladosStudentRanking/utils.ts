import type { ScoreType } from './types';

/**
 * Format score based on score type
 */
export function formatScore(value: number, scoreType: ScoreType): string {
  if (scoreType === 'tri') {
    return Math.round(value).toString();
  }
  return `${value.toFixed(1).replace('.', ',')}%`;
}
