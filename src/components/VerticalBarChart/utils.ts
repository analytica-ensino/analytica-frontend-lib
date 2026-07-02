/**
 * Chart axis utilities for VerticalBarChart
 */

/**
 * Calculate a "nice" step value for Y-axis ticks.
 * Returns a round number (1, 2, 5, 10, 20, 50, 100, etc.) that divides
 * the range into approximately 4-5 intervals.
 */
export const niceStep = (maxValue: number): number => {
  const roughStep = maxValue / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  let niceNormalized: number;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;

  return Math.max(1, niceNormalized * magnitude);
};

/**
 * Calculate Y-axis tick values for count display.
 * Uses "nice numbers" to create evenly spaced, human-readable ticks.
 */
export const calculateTicks = (maxValue: number): number[] => {
  if (maxValue <= 0) return [0];

  const step = niceStep(maxValue);
  const ticks: number[] = [];

  for (let i = 0; i <= maxValue; i += step) {
    ticks.push(i);
  }

  if (ticks.at(-1)! < maxValue) {
    ticks.push(ticks.at(-1)! + step);
  }

  return ticks.reverse();
};
