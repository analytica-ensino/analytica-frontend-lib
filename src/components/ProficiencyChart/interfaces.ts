import type { HTMLAttributes } from 'react';

/**
 * Proficiency level counters
 */
export interface ProficiencyCounters {
  highlight: number;
  aboveAverage: number;
  belowAverage: number;
  attentionPoint: number;
}

/**
 * Props for the ProficiencyChart component
 */
export interface ProficiencyChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Proficiency level counters */
  counters?: ProficiencyCounters;
  /** Total number of students */
  totalStudents?: number;
}

/**
 * Internal slice data for pie chart rendering
 */
export interface SliceData {
  key: string;
  label: string;
  value: number;
  percentage: number;
  colorClass: string;
  fillColor: string;
}

/**
 * Props for the internal PieChart sub-component
 */
export interface PieChartProps {
  slices: SliceData[];
  hoveredSlice: string | null;
  onSliceHover: (key: string | null) => void;
}
