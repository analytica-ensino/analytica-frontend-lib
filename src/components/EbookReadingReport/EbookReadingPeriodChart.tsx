import { SimpleBarChart } from '../SimpleBarChart/SimpleBarChart';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { formatCount } from '../../utils/reportFormat';
import type { EbookReadingTimeline } from './types';

export interface EbookReadingPeriodChartProps {
  data: EbookReadingTimeline | null;
  loading: boolean;
}

/**
 * "12 leituras", "1 leitura".
 * @param {number} readings - Effective readings
 * @returns {string} The text
 */
export const readingsLabel = (readings: number): string =>
  `${formatCount(readings)} ${readings === 1 ? 'leitura' : 'leituras'}`;

/**
 * "Leituras realizadas por período": the effective readings of each weekday,
 * week or month of the period, as the access charts bucket it.
 * @param {EbookReadingPeriodChartProps} props - The series and whether it loads
 * @returns {JSX.Element} The chart
 */
export const EbookReadingPeriodChart = ({
  data,
  loading,
}: Readonly<EbookReadingPeriodChartProps>) => {
  if (loading && !data) {
    return <SkeletonCard className="h-[260px]" />;
  }
  return (
    <SimpleBarChart
      title="Leituras realizadas por período"
      data={(data?.periods ?? []).map((period) => ({
        label: period.label,
        value: period.effectiveReadings,
      }))}
      formatTooltip={(item) => `${item.label}: ${readingsLabel(item.value)}`}
      data-testid="ebook-reading-period-chart"
    />
  );
};
