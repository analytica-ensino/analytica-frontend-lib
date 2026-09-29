import type { ReactNode } from 'react';
import { MedalIcon } from '@phosphor-icons/react/dist/csr/Medal';
import { SealWarningIcon } from '@phosphor-icons/react/dist/csr/SealWarning';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import {
  RankingCard,
  type StudentRankingItem,
  type StudentRankingVariant,
} from '../StudentRanking/StudentRanking';
import { SectionContent } from './SectionContent';
import type { EnemMomentSectionState, EnemMomentStudentRow } from './types';
import { formatScore } from './utils';

/** Students each ranking card lists. */
export const RANKING_ROWS = 3;

/** Both ranking cards, when nobody of the cut has a score. */
export const EMPTY_RANKING_TEXT =
  'Nenhum estudante finalizou o simulado neste recorte.';

/** A student of a ranking, with their position in it. */
export type EnemMomentRankedStudent = EnemMomentStudentRow & {
  position: number;
  averageScore: number;
};

/** "Nota 9,0" where the lib's row prints a percentage, in the card's color. */
export function ScoreBadge({
  score,
  variant,
}: Readonly<{ score: number; variant: StudentRankingVariant }>) {
  return (
    <Text
      size="xs"
      weight="medium"
      className={cn(
        'shrink-0 flex items-center h-5.5 px-2 rounded bg-background',
        variant === 'highlight' ? 'text-success-700' : 'text-error-700'
      )}
    >
      {`Nota ${formatScore(score)}`}
    </Text>
  );
}

/**
 * A ranking card of the report — the lib's, with its loading and error, whose
 * row click hands back the student of that row.
 */
export function EnemMomentRankingCard({
  title,
  variant,
  ranking,
  toItem,
  headerIcon,
  emptyText = EMPTY_RANKING_TEXT,
  footer,
  onStudentClick,
}: Readonly<{
  title: string;
  variant: StudentRankingVariant;
  ranking: EnemMomentSectionState<EnemMomentRankedStudent[]>;
  toItem: (student: EnemMomentRankedStudent) => StudentRankingItem;
  headerIcon: ReactNode;
  emptyText?: string;
  footer?: ReactNode;
  /** Opens the student's modal. Without it the rows are not clickable. */
  onStudentClick?: (student: EnemMomentRankedStudent) => void;
}>) {
  const top = (ranking.data ?? []).slice(0, RANKING_ROWS);

  // The card hands back the row it drew, so the student comes from the id it
  // carries — the enrolment, which is what the modal is fetched by.
  const handleClick = onStudentClick
    ? (item: StudentRankingItem) => {
        const student = top.find(
          (candidate) => candidate.userInstitutionId === item.id
        );
        if (student) onStudentClick(student);
      }
    : undefined;

  return (
    <SectionContent
      loading={ranking.loading}
      error={ranking.error}
      minHeight="min-h-[254px]"
    >
      <RankingCard
        title={title}
        variant={variant}
        students={top.map(toItem)}
        onStudentClick={handleClick}
        headerIcon={headerIcon}
        emptyText={emptyText}
        footer={footer}
      />
    </SectionContent>
  );
}

/**
 * A student of the unit's rankings: the name alone — the school is the
 * report's — and the score in the card's color.
 */
const toUnitRankingItem =
  (variant: StudentRankingVariant) =>
  (student: EnemMomentRankedStudent): StudentRankingItem => ({
    id: student.userInstitutionId,
    position: student.position,
    name: student.studentName,
    percentage: student.hitRate ?? 0,
    badge: <ScoreBadge score={student.averageScore} variant={variant} />,
  });

const toHighlightItem = toUnitRankingItem('highlight');
const toAttentionItem = toUnitRankingItem('attention');

/**
 * "Estudantes em destaque" and "Estudantes com maior dificuldade" side by
 * side: the top and the bottom three scores of the unit's cut.
 */
export function UnitStudentRankings({
  highlights,
  struggling,
  onStudentClick,
}: Readonly<{
  highlights: EnemMomentSectionState<EnemMomentRankedStudent[]>;
  struggling: EnemMomentSectionState<EnemMomentRankedStudent[]>;
  /** Opens the student's modal. Without it the rows are not clickable. */
  onStudentClick?: (student: EnemMomentRankedStudent) => void;
}>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <EnemMomentRankingCard
        title="Estudantes em destaque"
        variant="highlight"
        ranking={highlights}
        toItem={toHighlightItem}
        onStudentClick={onStudentClick}
        headerIcon={
          <MedalIcon size={14} className="text-text-950" aria-hidden="true" />
        }
      />
      <EnemMomentRankingCard
        title="Estudantes com maior dificuldade"
        variant="attention"
        ranking={struggling}
        toItem={toAttentionItem}
        onStudentClick={onStudentClick}
        headerIcon={
          <SealWarningIcon size={14} className="text-text" aria-hidden="true" />
        }
      />
    </div>
  );
}
