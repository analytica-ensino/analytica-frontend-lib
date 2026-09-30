/**
 * Performance counters by category
 */
export interface SimulatedPerformanceCounters {
  highlight: number;
  aboveAverage: number;
  belowAverage: number;
  attentionPoint: number;
  /**
   * Students who took nothing — a fifth slice, "Não participou", when given
   * (the Momento ENEM report). Left out, the chart has the four tiers alone.
   */
  notParticipated?: number;
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
