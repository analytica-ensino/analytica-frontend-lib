import type React from 'react';
import { ScoreType } from '../../types/common';

/**
 * Ranking variant type
 */
export type RankingVariant = 'highlight' | 'attention';

/**
 * Item for ranking (can be student, class, or municipality)
 */
export interface SimulatedStudentRankingItem {
  position: number;
  name: string;
  average: number;
  userInstitutionId?: string;
  /** Optional subtitle for additional context (e.g., "3 students", "2 schools, 15 students") */
  subtitle?: string;
}

/**
 * Props for SimulatedStudentRanking component
 */
export interface SimulatedStudentRankingProps {
  /** Title for highlight section */
  readonly highlightTitle?: string;
  /** Title for attention section */
  readonly attentionTitle?: string;
  /** Students in highlight (top performers) */
  readonly highlightStudents: SimulatedStudentRankingItem[];
  /** Students needing attention (lower performers) */
  readonly attentionStudents: SimulatedStudentRankingItem[];
  /** Score display type: percentage (0-100%) or tri (0-1000) */
  readonly scoreType?: ScoreType;
}

/**
 * Props for individual RankingCard
 */
export interface SimulatedRankingCardProps {
  /** Card title */
  readonly title: string;
  /** Card variant (highlight or attention) */
  readonly variant: RankingVariant;
  /** List of students */
  readonly students: SimulatedStudentRankingItem[];
  /** Icon to display */
  readonly icon: React.ReactNode;
  /** Score display type */
  readonly scoreType?: ScoreType;
}
