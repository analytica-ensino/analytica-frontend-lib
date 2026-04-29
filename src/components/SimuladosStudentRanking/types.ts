// Reuse ScoreType from GeneralOverviewSection
export type { ScoreType } from '../GeneralOverviewSection/types';

/**
 * Ranking variant type
 */
export type RankingVariant = 'highlight' | 'attention';

/**
 * Student item for ranking
 */
export interface SimuladosStudentRankingItem {
  position: number;
  name: string;
  average: number;
}

/**
 * Props for SimuladosStudentRanking component
 */
export interface SimuladosStudentRankingProps {
  /** Title for highlight section */
  readonly highlightTitle?: string;
  /** Title for attention section */
  readonly attentionTitle?: string;
  /** Students in highlight (top performers) */
  readonly highlightStudents: SimuladosStudentRankingItem[];
  /** Students needing attention (lower performers) */
  readonly attentionStudents: SimuladosStudentRankingItem[];
  /** Score display type: percentage (0-100%) or tri (0-1000) */
  readonly scoreType?: 'percentage' | 'tri';
}

/**
 * Props for individual RankingCard
 */
export interface SimuladosRankingCardProps {
  /** Card title */
  readonly title: string;
  /** Card variant (highlight or attention) */
  readonly variant: RankingVariant;
  /** List of students */
  readonly students: SimuladosStudentRankingItem[];
  /** Icon to display */
  readonly icon: React.ReactNode;
  /** Score display type */
  readonly scoreType?: 'percentage' | 'tri';
}
