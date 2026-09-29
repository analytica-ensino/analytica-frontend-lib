import type { ReactNode } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { PieChartCard, type PieSlice } from '../shared/ChartComponents';
import { ChatCircleIcon } from '@phosphor-icons/react/dist/csr/ChatCircle';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import { StatCard } from '../StatisticsCard/StatisticsCard';
import SimpleBarChart from '../SimpleBarChart/SimpleBarChart';
import type {
  EnemMomentExamData,
  EnemMomentParticipation,
  EnemMomentScoreBand,
} from './types';
import { formatCount, formatHoursMinutes, formatMinutesSeconds } from './utils';

/**
 * The cards of the "Dados do simulado" block of the Momento ENEM screens: the
 * pie cards (Idioma, Participação), on the lib's PieChartCard, the Tempo card
 * and the score histogram.
 */

const CARD_CLASS =
  'flex flex-col min-w-0 p-5 gap-4 bg-background border border-border-50 rounded-xl';

const plural = (count: number, singular: string, pluralForm: string) =>
  `${formatCount(count)} ${count === 1 ? singular : pluralForm}`;

export const students = (count: number) =>
  plural(count, 'estudante', 'estudantes');
export const schools = (count: number) => plural(count, 'escola', 'escolas');

/** Title, optional icon and the gray line under it — every card's header. */
function CardHeader({
  title,
  subtitle,
  icon,
}: Readonly<{ title: string; subtitle: string; icon?: ReactNode }>) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-text-950">
        {icon}
        <Text
          as="h3"
          size="lg"
          weight="bold"
          className="text-text-950 tracking-[0.2px]"
        >
          {title}
        </Text>
      </div>
      <Text size="sm" className="text-text-600">
        {subtitle}
      </Text>
    </div>
  );
}

/** A part of a pie of students, in a CSS color. */
const slice = (key: string, label: string, value: number, color: string) =>
  ({ key, label, value, color, colorClass: '' }) satisfies PieSlice;

/**
 * Whether the Idioma card shows: the cut has a day 1, with a language to pick.
 * While the exams are not known (`null`), whether somebody picked one.
 */
export const showsLanguageCard = (
  hasLanguageChoice: boolean | null,
  language: EnemMomentExamData['language']
) => hasLanguageChoice ?? language.ingles + language.espanhol > 0;

/** Foreign language picked by the students who took the exam. */
export function LanguageCard({
  language,
}: Readonly<{ language: EnemMomentExamData['language'] }>) {
  return (
    <PieChartCard
      title="Idioma"
      subtitle="Língua estrangeira escolhida por quem fez a prova"
      icon={<ChatCircleIcon size={20} aria-hidden="true" />}
      emptyText="Ninguém fez a prova"
      formatValue={students}
      slices={[
        slice(
          'english',
          'Escolheram Inglês',
          language.ingles,
          'var(--color-info-300)'
        ),
        slice(
          'spanish',
          'Escolheram Espanhol',
          language.espanhol,
          'var(--color-indicator-positive)'
        ),
      ]}
    />
  );
}

/**
 * Students who took the exam and who did not. The labels are white with a
 * shadow: black would vanish on the dark "Não participou" slice, and the lib's
 * pie takes a single label color for every slice.
 */
export function ParticipationCard({
  participation,
}: Readonly<{ participation: EnemMomentParticipation }>) {
  return (
    <PieChartCard
      title="Participação"
      subtitle="Porcentagem de estudantes por participação no simulado"
      icon={<ChatCircleIcon size={20} aria-hidden="true" />}
      emptyText="Nenhum estudante neste recorte"
      formatValue={students}
      labelColor="var(--color-text)"
      labelTextShadow="0 0 3px rgba(0, 0, 0, 0.45)"
      slices={[
        slice(
          'participated',
          'Participou',
          participation.participated,
          'var(--color-success-200)'
        ),
        slice(
          'notParticipated',
          'Não participou',
          participation.notParticipated,
          'var(--color-indicator-primary)'
        ),
      ]}
    />
  );
}

/**
 * The three times. Stacked beside other cards; alone on a row (`fullWidth`,
 * a cut with no language choice on the report) the card takes the whole row
 * and they line up.
 *
 * The exam's duration comes with the times only once somebody took it; until
 * then it is the one the exams declare (`examDurationSeconds`).
 */
export function TimeCard({
  time,
  examDurationSeconds,
  fullWidth = false,
}: Readonly<{
  time: EnemMomentExamData['time'];
  examDurationSeconds: number | null;
  fullWidth?: boolean;
}>) {
  return (
    <div className={cn(CARD_CLASS, fullWidth && 'lg:col-span-2')}>
      <CardHeader
        title="Tempo"
        subtitle="Do início ao envio, entre os estudantes que finalizaram"
        icon={<ClockIcon size={20} aria-hidden="true" />}
      />
      <div
        className={cn('grid grid-cols-1 gap-4', fullWidth && 'md:grid-cols-3')}
      >
        <StatCard
          item={{
            label: 'Tempo médio de prova',
            value: formatHoursMinutes(time.averageTotalSeconds),
            variant: 'total',
          }}
        />
        <StatCard
          item={{
            label: 'Tempo médio por questão',
            value: formatMinutesSeconds(time.averageSecondsPerQuestion),
            variant: 'total',
          }}
        />
        <StatCard
          item={{
            label: 'Duração da prova',
            value: formatHoursMinutes(
              time.durationSeconds ?? examDurationSeconds
            ),
            variant: 'total',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Participação, Idioma and Tempo side by side — a school's page and the unit
 * report. A cut where nobody picked a language (a day 2 on its own) has no
 * Idioma card, and the other two share the row.
 */
export function ExamCardsRow({
  participation,
  examData,
  hasLanguageChoice,
  examDurationSeconds,
}: Readonly<{
  participation: EnemMomentParticipation;
  examData: EnemMomentExamData;
  /** Whether the cut has a day 1 — `null` while the exams are not known. */
  hasLanguageChoice: boolean | null;
  /** The cut's time limit, from its exams — `null` while they are not known. */
  examDurationSeconds: number | null;
}>) {
  const withLanguage = showsLanguageCard(hasLanguageChoice, examData.language);

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        withLanguage ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
      )}
    >
      <ParticipationCard participation={participation} />
      {withLanguage && <LanguageCard language={examData.language} />}
      <TimeCard
        time={examData.time}
        examDurationSeconds={examDurationSeconds}
      />
    </div>
  );
}

/** A score histogram, with its total under the title ("200 estudantes"). */
export function ScoreBandChart({
  title,
  bands,
  formatTotal,
  barColor,
}: Readonly<{
  title: string;
  bands: EnemMomentScoreBand[];
  formatTotal: (total: number) => string;
  barColor: string;
}>) {
  const total = bands.reduce((sum, band) => sum + band.count, 0);

  return (
    <SimpleBarChart
      title={title}
      subtitle={formatTotal(total)}
      data={bands.map((band) => ({ label: band.label, value: band.count }))}
      barColor={barColor}
    />
  );
}
