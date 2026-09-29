import { PerformanceDistributionChart } from '../PerformanceDistributionChart/PerformanceDistributionChart';
import type { SimulatedPerformanceCounters } from '../PerformanceDistributionChart/types';
import { SectionContent } from './SectionContent';
import type {
  EnemMomentExamData,
  EnemMomentPerformance,
  EnemMomentPerformanceBand,
  EnemMomentSectionState,
} from './types';

/**
 * The API's tiers as the chart's counters, "Não participou" too. A tier the
 * API left out is a tier of nobody.
 */
export function toPerformanceCounters(
  bands: EnemMomentPerformanceBand[]
): SimulatedPerformanceCounters {
  const count = (tag: EnemMomentPerformance) =>
    bands.find((band) => band.tag === tag)?.count ?? 0;
  return {
    highlight: count('HIGHLIGHT'),
    aboveAverage: count('ABOVE_AVERAGE'),
    belowAverage: count('BELOW_AVERAGE'),
    attentionPoint: count('ATTENTION_POINT'),
    notParticipated: count('NO_EXAM'),
  };
}

/**
 * "Desempenho por quantidade de estudante" of the unit report: the students
 * of the cut per "Desempenho" tier, who did not take it included.
 */
export function PerformanceDistributionSection({
  examData,
}: Readonly<{ examData: EnemMomentSectionState<EnemMomentExamData> }>) {
  const bands = examData.data?.studentPerformanceBands;

  return (
    <SectionContent
      loading={examData.loading}
      error={examData.error}
      minHeight="min-h-[280px]"
    >
      <PerformanceDistributionChart
        counters={bands ? toPerformanceCounters(bands) : undefined}
      />
    </SectionContent>
  );
}
