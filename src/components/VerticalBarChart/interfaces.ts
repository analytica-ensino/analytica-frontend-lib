import type { HTMLAttributes } from 'react';

/**
 * Data item for VerticalBarChart
 */
export interface VerticalBarChartDataItem {
  label: string;
  value: number;
}

/**
 * Props for the VerticalBarChart component
 */
export interface VerticalBarChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Chart data with labels and values */
  data: VerticalBarChartDataItem[];
  /** Title for the chart card */
  title: string;
  /** Height of the bar chart area in pixels */
  chartHeight?: number;
  /** Color for the bars (hex, rgb, or CSS color) */
  barColor?: string;
}

/**
 * Props for the internal Bar sub-component
 */
export interface BarProps {
  item: VerticalBarChartDataItem;
  maxValue: number;
  chartHeight: number;
  barColor: string;
  isHovered: boolean;
  anyHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Props for the internal YAxis sub-component
 */
export interface YAxisProps {
  ticks: number[];
  chartHeight: number;
}

/**
 * Props for the internal XAxisLabels sub-component
 */
export interface XAxisLabelsProps {
  data: VerticalBarChartDataItem[];
}
