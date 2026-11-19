import Menu, { MenuContent, MenuItem } from '../Menu/Menu';
import Text from '../Text/Text';
import { SkeletonCard } from '../Skeleton/Skeleton';
import {
  RankingCard,
  type StudentRankingItem,
} from '../StudentRanking/StudentRanking';
import { formatCount } from '../../utils/reportFormat';
import {
  EBOOK_RANKING_DIMENSION,
  type EbookRankingDimension,
  type EbookRankingItem,
  type EbookRankings,
} from './types';

/** A tab of "Preferências de leitura": what it ranks and its card titles. */
interface PreferenceTab {
  dimension: EbookRankingDimension;
  label: string;
  mostRead: string;
  leastRead: string;
}

/** The tabs, in order: books, then their themes. */
export const PREFERENCE_TABS: PreferenceTab[] = [
  {
    dimension: EBOOK_RANKING_DIMENSION.EBOOK,
    label: 'Livros',
    mostRead: 'Livros mais lidos',
    leastRead: 'Livros menos lidos',
  },
  {
    dimension: EBOOK_RANKING_DIMENSION.CATEGORY,
    label: 'Temas',
    mostRead: 'Temas mais lidos',
    leastRead: 'Temas menos lidos',
  },
];

/**
 * "12 leitores", "1 leitor".
 * @param {number} readers - Students who opened it
 * @returns {string} The text
 */
export const readersLabel = (readers: number): string =>
  `${formatCount(readers)} ${readers === 1 ? 'leitor' : 'leitores'}`;

/**
 * A ranked item as a ranking row, with its readers in the badge.
 * @param {EbookRankingItem} item - The book or theme
 * @param {number} index - Its place in the list, from 0
 * @returns {StudentRankingItem} The row
 */
const toRankingRow = (
  item: EbookRankingItem,
  index: number
): StudentRankingItem => ({
  id: item.id,
  position: index + 1,
  name: item.name,
  percentage: 0,
  badge: (
    <Text
      as="span"
      size="xs"
      weight="medium"
      className="shrink-0 rounded bg-background px-2 py-0.5 text-text-700"
    >
      {readersLabel(item.readers)}
    </Text>
  ),
});

export interface EbookReadingPreferencesProps {
  dimension: EbookRankingDimension;
  onDimensionChange: (dimension: EbookRankingDimension) => void;
  data: EbookRankings | null;
  loading: boolean;
}

/**
 * "Preferências de leitura": the most and the least read books, or themes,
 * by number of readers.
 * @param {EbookReadingPreferencesProps} props - The ranking and its tab
 * @returns {JSX.Element} The section
 */
export const EbookReadingPreferences = ({
  dimension,
  onDimensionChange,
  data,
  loading,
}: Readonly<EbookReadingPreferencesProps>) => {
  const tab =
    PREFERENCE_TABS.find((entry) => entry.dimension === dimension) ??
    PREFERENCE_TABS[0];
  const showSkeleton = loading && !data;

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="ebook-reading-preferences-title"
    >
      <Text
        id="ebook-reading-preferences-title"
        as="h2"
        size="lg"
        weight="bold"
        className="text-text-950"
      >
        Preferências de leitura
      </Text>
      {/* As compact as the tab captions, as in the Figma. */}
      <div className="w-fit">
        <Menu
          defaultValue={PREFERENCE_TABS[0].dimension}
          value={tab.dimension}
          variant="breadcrumb"
          semantics="tabs"
          className="px-0!"
          onValueChange={(value) =>
            onDimensionChange(value as EbookRankingDimension)
          }
        >
          <MenuContent className="px-0!" aria-label="Preferências de leitura">
            {PREFERENCE_TABS.map((entry) => (
              <MenuItem
                key={entry.dimension}
                variant="menu2"
                value={entry.dimension}
              >
                {entry.label}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {showSkeleton ? (
          <>
            <SkeletonCard className="h-[220px]" />
            <SkeletonCard className="h-[220px]" />
          </>
        ) : (
          <>
            <RankingCard
              title={tab.mostRead}
              variant="highlight"
              students={(data?.mostRead ?? []).map(toRankingRow)}
              showPercentage={false}
              emptyText="Nenhuma leitura no período."
            />
            <RankingCard
              title={tab.leastRead}
              variant="attention"
              students={(data?.leastRead ?? []).map(toRankingRow)}
              showPercentage={false}
              emptyText="Nenhuma leitura no período."
            />
          </>
        )}
      </div>
    </section>
  );
};
