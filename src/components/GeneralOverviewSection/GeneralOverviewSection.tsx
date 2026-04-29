import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import IconRender from '../IconRender/IconRender';
import { cn } from '../../utils/utils';
import type {
  GeneralOverviewSectionProps,
  AreaKnowledgePerformance,
  EssayPerformance,
  SubjectItem,
  ScoreType,
} from './types';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format score based on score type
 * @param value - Score value
 * @param scoreType - 'percentage' or 'tri'
 * @returns Formatted score string
 */
function formatScore(value: number, scoreType: ScoreType): string {
  if (scoreType === 'tri') {
    return Math.round(value).toString();
  }
  // Percentage format with 1 decimal place
  return `${value.toFixed(1).replace('.', ',')}%`;
}

/**
 * Area knowledge card colors based on area name patterns
 */
const AREA_COLORS: Record<string, { bg: string; fallbackColor: string }> = {
  linguagens: {
    bg: 'bg-blue-50',
    fallbackColor: '#3B82F6',
  },
  humanas: {
    bg: 'bg-amber-50',
    fallbackColor: '#F59E0B',
  },
  natureza: {
    bg: 'bg-green-50',
    fallbackColor: '#22C55E',
  },
  matemática: {
    bg: 'bg-purple-50',
    fallbackColor: '#8B5CF6',
  },
  redação: {
    bg: 'bg-rose-50',
    fallbackColor: '#F43F5E',
  },
};

/**
 * Get color scheme for an area based on its name
 */
function getAreaColors(areaName: string): {
  bg: string;
  fallbackColor: string;
} {
  const nameLower = areaName.toLowerCase();

  if (nameLower.includes('linguagens') || nameLower.includes('códigos')) {
    return AREA_COLORS.linguagens;
  }
  if (nameLower.includes('humanas') || nameLower.includes('sociais')) {
    return AREA_COLORS.humanas;
  }
  if (nameLower.includes('natureza') || nameLower.includes('ciências da nat')) {
    return AREA_COLORS.natureza;
  }
  if (nameLower.includes('matemática')) {
    return AREA_COLORS.matemática;
  }
  if (nameLower.includes('redação')) {
    return AREA_COLORS.redação;
  }

  // Default fallback
  return { bg: 'bg-gray-50', fallbackColor: '#6B7280' };
}

/**
 * Get icon and color from the first subject linked to the area
 */
function getAreaIconAndColor(
  areaId: string,
  subjects: SubjectItem[]
): { icon: string; color: string } | null {
  const firstSubject = subjects.find((s) => s.areaKnowledgeId === areaId);
  if (firstSubject) {
    return { icon: firstSubject.icon, color: firstSubject.color };
  }
  return null;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Area knowledge card component
 */
function AreaCard({
  area,
  subjects,
  scoreType = 'percentage',
}: {
  readonly area: AreaKnowledgePerformance;
  readonly subjects: SubjectItem[];
  readonly scoreType?: ScoreType;
}) {
  const colors = getAreaColors(area.name);
  const subjectStyle = getAreaIconAndColor(area.id, subjects);

  // Use subject icon/color if available, otherwise use fallback
  const iconName = subjectStyle?.icon || 'shapes';
  const iconColor = subjectStyle?.color || colors.fallbackColor;

  return (
    <div
      className={cn(
        'flex-1 min-w-0 flex flex-col items-center justify-center p-4 rounded-xl',
        colors.bg
      )}
    >
      {/* Icon with rounded background */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full mb-2"
        style={{ backgroundColor: iconColor }}
      >
        <IconRender iconName={iconName} size={18} color="white" />
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
 * Displays essay performance using the fixed rose color scheme
 * Note: Essays always use percentage, TRI doesn't apply to essays
 */
function EssayCard({ essay }: { readonly essay: EssayPerformance }) {
  const colors = AREA_COLORS.redação;

  return (
    <div
      className={cn(
        'flex-1 min-w-0 flex flex-col items-center justify-center p-4 rounded-xl',
        colors.bg
      )}
    >
      {/* Icon with rounded background */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full mb-2"
        style={{ backgroundColor: colors.fallbackColor }}
      >
        <IconRender iconName="article" size={18} color="white" />
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
        {formatScore(essay.percentage, 'percentage')}
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * GeneralOverviewSection - General overview section for simulated exams
 *
 * Displays overall proficiency percentage and performance by area of knowledge.
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
 *   subjects={subjects}
 *   scoreType="tri"
 * />
 * ```
 */
export function GeneralOverviewSection({
  data,
  loading = false,
  error = null,
  subjects = [],
  scoreType = 'percentage',
}: GeneralOverviewSectionProps) {
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
          realizados em toda as áreas do conhecimento
        </Text>
      </div>

      {/* Overall progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <ProgressBar
            value={
              scoreType === 'tri'
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
            <AreaCard
              key={area.id}
              area={area}
              subjects={subjects}
              scoreType={scoreType}
            />
          ))}
          {data.essay && <EssayCard essay={data.essay} />}
        </div>
      )}
    </div>
  );
}

export default GeneralOverviewSection;
