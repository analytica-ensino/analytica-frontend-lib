import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import IconRender from '../IconRender/IconRender';
import { formatScore, hexToRgba } from '../../utils/utils';
import { ScoreType } from '../../types/common';
import {
  type GeneralOverviewSectionProps,
  type AreaKnowledgePerformance,
  type EssayPerformance,
} from './types';

/**
 * Area knowledge card component
 * Uses color and icon from API data
 */
function AreaCard({
  area,
  scoreType = ScoreType.PERCENTAGE,
}: {
  readonly area: AreaKnowledgePerformance;
  readonly scoreType?: ScoreType;
}) {
  const bgColor = hexToRgba(area.color, 0.1);

  return (
    <div
      className="flex-1 min-w-0 flex flex-col items-center justify-center p-4 rounded-xl"
      style={{ backgroundColor: bgColor }}
    >
      {/* Icon with rounded background */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full mb-2"
        style={{ backgroundColor: area.color }}
      >
        <IconRender iconName={area.icon} size={18} color="white" />
      </div>

      {/* Full name (uppercase, smaller) */}
      <Text
        size="xs"
        weight="semibold"
        className="text-center uppercase text-text-700 mb-1 line-clamp-2"
      >
        {area.name}
      </Text>

      {/* Score (percentage or TRI) */}
      <Text size="lg" weight="bold" className="text-text-950">
        {formatScore(area.percentage, scoreType)}
      </Text>
    </div>
  );
}

/**
 * Essay card component
 * Displays essay performance using color and icon from API
 * Note: Essays always use percentage, TRI doesn't apply to essays
 */
function EssayCard({ essay }: { readonly essay: EssayPerformance }) {
  const bgColor = hexToRgba(essay.color, 0.1);

  return (
    <div
      className="flex-1 min-w-0 flex flex-col items-center justify-center p-4 rounded-xl"
      style={{ backgroundColor: bgColor }}
    >
      {/* Icon with rounded background */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full mb-2"
        style={{ backgroundColor: essay.color }}
      >
        <IconRender iconName={essay.icon} size={18} color="white" />
      </div>

      {/* Name (uppercase, smaller) */}
      <Text
        size="xs"
        weight="semibold"
        className="text-center uppercase text-text-700 mb-1 line-clamp-2"
      >
        {essay.name}
      </Text>

      {/* Percentage large - Essays always use percentage */}
      <Text size="lg" weight="bold" className="text-text-950">
        {formatScore(essay.percentage, ScoreType.PERCENTAGE)}
      </Text>
    </div>
  );
}

/**
 * Skeleton loader for area cards
 */
function AreaCardSkeleton() {
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-4 rounded-xl bg-background-50">
      <SkeletonRounded className="h-8 w-8 rounded-full mb-2" />
      <SkeletonRounded className="h-3 w-16 mb-1" />
      <SkeletonRounded className="h-6 w-12" />
    </div>
  );
}

/**
 * GeneralOverviewSection - General overview section for simulated exams
 *
 * Displays overall proficiency percentage and performance by area of knowledge.
 * Uses color and icon directly from API data for each area.
 * This section is independent of areaKnowledgeId and subjectId filters -
 * it always shows consolidated data across all simulated exams.
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetchOverview } = useGeneralOverview(api);
 *
 * <GeneralOverviewSection
 *   data={data}
 *   loading={loading}
 *   error={error}
 *   scoreType="tri"
 * />
 * ```
 */
export function GeneralOverviewSection({
  data,
  loading = false,
  error = null,
  scoreType = ScoreType.PERCENTAGE,
}: Readonly<GeneralOverviewSectionProps>) {
  if (error) {
    return (
      <div className="p-4 bg-error-50 border border-error-200 rounded-xl">
        <Text size="sm" className="text-error-700">
          {error}
        </Text>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 p-5 bg-background border border-border-50 rounded-xl">
        {/* Header */}
        <div className="space-y-1">
          <Text size="lg" weight="bold" className="text-text-950">
            Geral
          </Text>
          <SkeletonRounded className="h-4 w-3/4" />
        </div>

        {/* Overall progress skeleton */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SkeletonRounded className="h-3 w-full rounded-full" />
          </div>
          <SkeletonRounded className="h-6 w-12" />
        </div>

        {/* Area cards skeleton */}
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <AreaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4 p-5 bg-background border border-border-50 rounded-xl">
      {/* Header with description */}
      <div className="space-y-1">
        <Text size="lg" weight="bold" className="text-text-950">
          Geral
        </Text>
        <Text size="sm" className="text-text-500">
          Dados que mostram a proficiência de todos os simulados digitais já
          realizados em todas as áreas do conhecimento
        </Text>
      </div>

      {/* Overall progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <ProgressBar
            value={
              scoreType === ScoreType.TRI
                ? data.overallPercentage / 10
                : data.overallPercentage
            }
            variant="green"
            size="small"
          />
        </div>
        <Text
          size="lg"
          weight="bold"
          className="text-text-950 min-w-[50px] text-right"
        >
          {formatScore(data.overallPercentage, scoreType)}
        </Text>
      </div>

      {/* Area knowledge cards + Essay card - flex to fill 100% equally */}
      {(data.areas.length > 0 || data.essay) && (
        <div className="flex gap-3">
          {data.areas.map((area) => (
            <AreaCard key={area.id} area={area} scoreType={scoreType} />
          ))}
          {data.essay && <EssayCard essay={data.essay} />}
        </div>
      )}
    </div>
  );
}

export default GeneralOverviewSection;
