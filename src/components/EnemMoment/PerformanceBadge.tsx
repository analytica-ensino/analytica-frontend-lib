import type { ReactNode } from 'react';
import { InfoIcon } from '@phosphor-icons/react/dist/csr/Info';
import Badge from '../Badge/Badge';
import { Tooltip } from '../Tooltip/Tooltip';
import { useTheme } from '../../hooks/useTheme';
import type { EnemMomentPerformance } from './types';

/** The "Desempenho" tiers, best first — the order every menu lists them. */
export const ENEM_MOMENT_PERFORMANCE_ORDER: readonly EnemMomentPerformance[] = [
  'HIGHLIGHT',
  'ABOVE_AVERAGE',
  'BELOW_AVERAGE',
  'ATTENTION_POINT',
  'NO_EXAM',
];

/** A student's tier as its badge reads — who took nothing, "Não participou". */
export const ENEM_MOMENT_PERFORMANCE_LABELS: Record<
  EnemMomentPerformance,
  string
> = {
  HIGHLIGHT: 'DESTAQUE',
  ABOVE_AVERAGE: 'ACIMA DA MÉDIA',
  BELOW_AVERAGE: 'ABAIXO DA MÉDIA',
  ATTENTION_POINT: 'PONTO DE ATENÇÃO',
  NO_EXAM: 'NÃO PARTICIPOU',
};

/**
 * The fill of each tier: the map palette, the same in both themes, so a badge
 * carries the color of the pie slice of its tier. Tokens would not do — the
 * dark theme redefines them. Who took nothing is a neutral that flips with the
 * theme, to stay visible.
 */
const TIER_COLORS: Record<Exclude<EnemMomentPerformance, 'NO_EXAM'>, string> = {
  HIGHLIGHT: '#66b584',
  ABOVE_AVERAGE: '#f8cc2e',
  BELOW_AVERAGE: '#fb954b',
  ATTENTION_POINT: '#b91c1c',
};

const tierColor = (performance: EnemMomentPerformance, isDark: boolean) => {
  if (performance === 'NO_EXAM') return isDark ? '#e5e5e5' : '#2f2f2f';
  return TIER_COLORS[performance];
};

/**
 * White or near-black text for a fill, by its perceived luminance (ITU-R
 * BT.601): the yellow tier gets dark text, the darker ones white.
 */
export const readableTextColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7 ? '#171717' : '#ffffff';
};

/** A chip in the color of a tier, with whatever it says. */
export function EnemMomentTierBadge({
  performance,
  children,
}: Readonly<{ performance: EnemMomentPerformance; children: ReactNode }>) {
  const { isDark } = useTheme();
  const backgroundColor = tierColor(performance, isDark);

  return (
    <Badge
      variant="solid"
      action="info"
      size="small"
      style={{ backgroundColor, color: readableTextColor(backgroundColor) }}
    >
      {children}
    </Badge>
  );
}

/** A student's "Desempenho": the tier of their score, or "Não participou". */
export function EnemMomentPerformanceBadge({
  performance,
}: Readonly<{ performance: EnemMomentPerformance }>) {
  return (
    <EnemMomentTierBadge performance={performance}>
      {ENEM_MOMENT_PERFORMANCE_LABELS[performance]}
    </EnemMomentTierBadge>
  );
}

/**
 * Whether a student took the exams of the cut — `PARTIAL` only when there is
 * more than one moment run, and the student skipped one.
 */
export type EnemMomentStudentParticipation =
  | 'PARTICIPATED'
  | 'PARTIAL'
  | 'NOT_PARTICIPATED';

const PARTIAL_HINT = 'Participou em somente 1 momento';

/**
 * "Participou" / "Não participou", in the green of "Destaque" and the dark of
 * who took nothing. A student who took only one of the moments gets an info
 * icon, which explains itself on hover.
 */
export function ParticipationBadge({
  participation,
}: Readonly<{ participation: EnemMomentStudentParticipation }>) {
  if (participation === 'NOT_PARTICIPATED') {
    return (
      <EnemMomentTierBadge performance="NO_EXAM">
        NÃO PARTICIPOU
      </EnemMomentTierBadge>
    );
  }

  if (participation === 'PARTIAL') {
    return (
      <Tooltip content={PARTIAL_HINT} position="top">
        <EnemMomentTierBadge performance="HIGHLIGHT">
          <span className="inline-flex items-center gap-1">
            PARTICIPOU
            <InfoIcon size={14} aria-label={PARTIAL_HINT} />
          </span>
        </EnemMomentTierBadge>
      </Tooltip>
    );
  }

  return (
    <EnemMomentTierBadge performance="HIGHLIGHT">
      PARTICIPOU
    </EnemMomentTierBadge>
  );
}
