/**
 * Performance counters by category
 */
export interface SimulatedPerformanceCounters {
  highlight: number;
  aboveAverage: number;
  belowAverage: number;
  attentionPoint: number;
}

/**
 * Slice data for pie chart
 */
export interface SliceData {
  key: string;
  label: string;
  value: number;
  percentage: number;
  colorClass: string;
}

/**
 * Props for PerformanceDistributionChart
 */
export interface PerformanceDistributionChartProps {
  readonly counters: SimulatedPerformanceCounters | undefined;
  readonly totalStudents?: number;
  readonly loading?: boolean;
  readonly title?: string;
}
