import { useMemo } from 'react';
import { BookOpenIcon } from '@phosphor-icons/react/dist/csr/BookOpen';
import { UsersIcon } from '@phosphor-icons/react/dist/csr/Users';
import { UserCheckIcon } from '@phosphor-icons/react/dist/csr/UserCheck';
import { CursorClickIcon } from '@phosphor-icons/react/dist/csr/CursorClick';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { ChartLineUpIcon } from '@phosphor-icons/react/dist/csr/ChartLineUp';
import { MapPinIcon } from '@phosphor-icons/react/dist/csr/MapPin';
import { BuildingsIcon } from '@phosphor-icons/react/dist/csr/Buildings';
import { TimeCard, type TimeCardData } from '../TimeReport/TimeReport';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { formatHoursMinutes } from '../EnemMoment/utils';
import { formatCount } from '../../utils/reportFormat';
import { cn } from '../../utils/utils';
import { formatPercent } from './readingReport';
import type { EbookReadingSummaryData } from './types';

/** Number of cards, so the loading state keeps the same grid. */
const CARD_COUNT = 6;

/** The cards the network view adds: municipalities and schools. */
const PLACE_CARD_COUNT = 2;

export interface EbookReadingSummaryProps {
  data: EbookReadingSummaryData | null;
  loading: boolean;
  /** The network view: how many municipalities and schools there are */
  showPlaces?: boolean;
}

/**
 * The cards of the reading report: readings, students and readers, accesses,
 * time and average progress; in the network view, the municipalities and
 * schools too.
 * @param {EbookReadingSummaryData} data - The measures
 * @param {boolean} showPlaces - Whether to count municipalities and schools
 * @returns {TimeCardData[]} The cards
 */
export const buildSummaryCards = (
  data: EbookReadingSummaryData,
  showPlaces = false
): TimeCardData[] => [
  {
    id: 'effective-readings',
    label: 'Leituras realizadas',
    value: formatCount(data.effectiveReadings),
    icon: <BookOpenIcon />,
  },
  ...(showPlaces
    ? [
        {
          id: 'municipalities',
          label: 'Municípios',
          value: formatCount(data.municipalities),
          icon: <MapPinIcon />,
        },
        {
          id: 'schools',
          label: 'Escolas',
          value: formatCount(data.schools),
          icon: <BuildingsIcon />,
        },
      ]
    : []),
  {
    id: 'total-students',
    label: 'Total de estudantes',
    value: formatCount(data.totalStudents),
    icon: <UsersIcon />,
  },
  {
    id: 'readers',
    label: 'Estudantes leitores',
    value: formatCount(data.readers),
    subtitle: `${formatPercent(data.readerRate)} dos estudantes`,
    icon: <UserCheckIcon />,
  },
  {
    id: 'accesses',
    label: 'Acessos',
    value: formatCount(data.accesses),
    icon: <CursorClickIcon />,
  },
  {
    id: 'total-time',
    label: 'Tempo em leitura',
    value: formatHoursMinutes(data.totalTimeSeconds),
    subtitle: `${formatHoursMinutes(data.averageTimeSeconds)} por leitor`,
    icon: <ClockIcon />,
  },
  {
    id: 'average-progress',
    label: 'Progresso médio',
    value: formatPercent(data.averageProgress),
    icon: <ChartLineUpIcon />,
  },
];

/**
 * The summary cards of the reading report, with a skeleton while they load.
 * @param {EbookReadingSummaryProps} props - The measures and whether they load
 * @returns {JSX.Element} The cards
 */
export const EbookReadingSummary = ({
  data,
  loading,
  showPlaces = false,
}: Readonly<EbookReadingSummaryProps>) => {
  const cards = useMemo(
    () => (data ? buildSummaryCards(data, showPlaces) : []),
    [data, showPlaces]
  );
  const count = CARD_COUNT + (showPlaces ? PLACE_CARD_COUNT : 0);
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4',
        showPlaces ? 'xl:grid-cols-4' : 'xl:grid-cols-6'
      )}
      data-testid="ebook-reading-summary"
    >
      {loading && !data
        ? Array.from({ length: count }, (_, index) => (
            <SkeletonCard key={index} className="h-[104px]" />
          ))
        : cards.map((card) => <TimeCard key={card.id} data={card} />)}
    </div>
  );
};
