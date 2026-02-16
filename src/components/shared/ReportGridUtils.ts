/**
 * Get responsive grid columns class based on item count.
 * Shared between TimeReport and PerformanceReport.
 */
export const getGridColumnsClass = (count: number): string => {
  if (count >= 5) return 'lg:grid-cols-5';
  if (count === 4) return 'lg:grid-cols-4';
  if (count === 3) return 'lg:grid-cols-3';
  if (count === 2) return 'lg:grid-cols-2';
  return '';
};
