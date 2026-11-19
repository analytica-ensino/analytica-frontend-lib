import Text from '../Text/Text';
import { SkeletonCard } from '../Skeleton/Skeleton';
import {
  RankingCard,
  type StudentRankingItem,
} from '../StudentRanking/StudentRanking';
import { formatPercent } from './readingReport';
import type { EbookReadingGroupRow } from './types';

/** Municipalities in each card. */
export const MUNICIPALITY_RANKING_SIZE = 3;

/** The municipalities of each card. */
export interface MunicipalityRanking {
  highlight: EbookReadingGroupRow[];
  attention: EbookReadingGroupRow[];
}

/**
 * Best first: the share of readers, then the readers, then the name.
 * @param {EbookReadingGroupRow} a - A municipality
 * @param {EbookReadingGroupRow} b - Another
 * @returns {number} The order
 */
const byReading = (a: EbookReadingGroupRow, b: EbookReadingGroupRow): number =>
  b.readerRate - a.readerRate ||
  b.readers - a.readers ||
  a.name.localeCompare(b.name);

/**
 * The municipalities that read the most and the least, by share of readers.
 * A municipality is in one card only: with few of them, the attention card
 * takes what the highlight card left.
 * @param {EbookReadingGroupRow[]} rows - Every municipality in scope
 * @returns {MunicipalityRanking} The cards' municipalities
 */
export const rankMunicipalities = (
  rows: EbookReadingGroupRow[]
): MunicipalityRanking => {
  const sorted = [...rows].sort(byReading);
  const highlight = sorted.slice(0, MUNICIPALITY_RANKING_SIZE);
  const attention = sorted
    .slice(MUNICIPALITY_RANKING_SIZE)
    .reverse()
    .slice(0, MUNICIPALITY_RANKING_SIZE);
  return { highlight, attention };
};

/**
 * A municipality as a ranking row, with its share of readers in the badge.
 * @param {EbookReadingGroupRow} row - The municipality
 * @param {number} index - Its place in the card, from 0
 * @returns {StudentRankingItem} The row
 */
const toRankingRow = (
  row: EbookReadingGroupRow,
  index: number
): StudentRankingItem => ({
  id: row.id,
  position: index + 1,
  name: row.name,
  percentage: row.readerRate,
  badge: (
    <Text
      as="span"
      size="xs"
      weight="medium"
      className="shrink-0 rounded bg-background px-2 py-0.5 text-text-700"
    >
      {`${formatPercent(row.readerRate)} de leitura`}
    </Text>
  ),
});

export interface EbookReadingMunicipalitiesProps {
  /** Every municipality in scope, or `null` before they load */
  rows: EbookReadingGroupRow[] | null;
  loading: boolean;
}

/**
 * "Municípios em destaque" and "Municípios precisando de atenção": the
 * municipalities with the highest and the lowest share of readers.
 * @param {EbookReadingMunicipalitiesProps} props - The municipalities
 * @returns {JSX.Element} The cards
 */
export const EbookReadingMunicipalities = ({
  rows,
  loading,
}: Readonly<EbookReadingMunicipalitiesProps>) => {
  if (loading && !rows) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard className="h-[220px]" />
        <SkeletonCard className="h-[220px]" />
      </div>
    );
  }
  const { highlight, attention } = rankMunicipalities(rows ?? []);
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      data-testid="ebook-reading-municipalities"
    >
      <RankingCard
        title="Municípios em destaque"
        variant="highlight"
        students={highlight.map(toRankingRow)}
        showPercentage={false}
        emptyText="Nenhum município no período."
      />
      <RankingCard
        title="Municípios precisando de atenção"
        variant="attention"
        students={attention.map(toRankingRow)}
        showPercentage={false}
        emptyText="Nenhum outro município no período."
      />
    </div>
  );
};
