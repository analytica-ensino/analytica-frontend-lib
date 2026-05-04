import { ScoreType } from '../types/common';

/**
 * Format score based on score type
 * @param value - Score value
 * @param scoreType - Score display enum
 * @returns Formatted score string
 */
export function formatScore(value: number, scoreType: ScoreType): string {
  if (scoreType === ScoreType.TRI) {
    return Math.round(value).toString();
  }

  return `${value.toFixed(1).replace('.', ',')}%`;
}
