import { useMemo } from 'react';
import { BookOpenIcon } from '@phosphor-icons/react/dist/csr/BookOpen';
import { UsersIcon } from '@phosphor-icons/react/dist/csr/Users';
import { UserCheckIcon } from '@phosphor-icons/react/dist/csr/UserCheck';
import { CursorClickIcon } from '@phosphor-icons/react/dist/csr/CursorClick';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { ChartLineUpIcon } from '@phosphor-icons/react/dist/csr/ChartLineUp';
import { TimeCard, type TimeCardData } from '../TimeReport/TimeReport';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { formatHoursMinutes } from '../EnemMoment/utils';
import { formatCount } from '../../utils/reportFormat';
import { formatPercent } from './readingReport';
import type { EbookReadingMetrics } from './types';

/** Number of cards, so the loading state keeps the same grid. */
const CARD_COUNT = 6;

export interface EbookReadingSummaryProps {
  data: EbookReadingMetrics | null;
  loading: boolean;
}

/**
 * The cards of the reading report: readings, students and readers, accesses,
 * time and average progress.
 * @param {EbookReadingMetrics} data - The measures
 * @returns {TimeCardData[]} The cards
 */
export const buildSummaryCards = (
  data: EbookReadingMetrics
): TimeCardData[] => [
  {
    id: 'effective-readings',
    label: 'Leituras realizadas',
    value: formatCount(data.effectiveReadings),
    icon: <BookOpenIcon />,
  },
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
}: Readonly<EbookReadingSummaryProps>) => {
  const cards = useMemo(() => (data ? buildSummaryCards(data) : []), [data]);

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      data-testid="ebook-reading-summary"
    >
      {loading && !data
        ? Array.from({ length: CARD_COUNT }, (_, index) => (
            <SkeletonCard key={index} className="h-[104px]" />
          ))
        : cards.map((card) => <TimeCard key={card.id} data={card} />)}
    </div>
  );
};
