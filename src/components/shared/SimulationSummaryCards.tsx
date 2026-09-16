import type { ReactNode } from 'react';
import { ExamIcon } from '@phosphor-icons/react/dist/csr/Exam';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import { MinusCircleIcon } from '@phosphor-icons/react/dist/csr/MinusCircle';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import { CardAccordation } from '../Accordation';
import { UserIcon } from '../UserIcon/UserIcon';
import { cn } from '../../utils/utils';
import { formatScoreOutOfTen } from '../../utils/simulatedScore';
import {
  formatDateToBrazilian,
  formatTimeSpent,
} from '../../utils/activityDetailsUtils';

/**
 * Summary blocks of a student's simulados: header, "Dados de simulados" cards,
 * the coloured stat cards and the best/worst subtema pair.
 *
 * Shared by the two modals that show them — the Simulados page modal and the
 * Simulados report modal — so the design is described once. Everything here is
 * presentational: it takes already-fetched numbers and returns markup.
 */

/**
 * The only field these cards read from a subtema, so both the Simulados page
 * shape and the report shape satisfy it.
 */
export interface SimulationContentSummary {
  readonly contentName: string;
}

/** The fields the "Duração · Nota · Feito em" line reads from a simulado. */
export interface SimulationMetaSource {
  readonly timeSpentSeconds?: number;
  readonly score?: number;
  readonly answeredAt?: string | null;
}

/**
 * "Duração · Nota · Feito em" line of a simulado card. Each segment only joins
 * when its field came in the payload, so an older backend shows a shorter line
 * instead of "undefined".
 */
export function buildSimulationMeta(simulation: SimulationMetaSource): string {
  const parts: string[] = [];
  if (simulation.timeSpentSeconds !== undefined) {
    parts.push(`Duração: ${formatTimeSpent(simulation.timeSpentSeconds)}`);
  }
  if (simulation.score !== undefined) {
    parts.push(`Nota: ${formatScoreOutOfTen(simulation.score)}`);
  }
  if (simulation.answeredAt) {
    parts.push(`Feito em: ${formatDateToBrazilian(simulation.answeredAt)}`);
  }
  return parts.join(' · ');
}

/** Section heading, "Dados de simulados" and its siblings (14px bold). */
export function SectionTitle({ children }: { readonly children: ReactNode }) {
  return (
    <Text as="h3" size="sm" weight="bold" className="text-text-950">
      {children}
    </Text>
  );
}

/**
 * White card with a centred uppercase label and the value in a rectangular
 * info badge: the "Dados de simulados" pair.
 */
export function DataCard({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border-50 bg-background px-3 py-4">
      <Text
        size="2xs"
        weight="medium"
        className="text-center uppercase text-text-800"
      >
        {label}
      </Text>
      <span className="rounded-sm bg-info-background px-2 py-1 text-sm text-info-800">
        {value}
      </span>
    </div>
  );
}

/** Tone of a coloured stat card; each maps to one token family. */
type StatTone = 'grade' | 'correct' | 'incorrect' | 'blank';

const STAT_TONE_CLASSES: Record<
  StatTone,
  { card: string; circle: string; icon: string; value: string }
> = {
  grade: {
    card: 'bg-warning-background',
    circle: 'bg-warning-300',
    icon: 'text-text',
    value: 'text-warning-600',
  },
  correct: {
    card: 'bg-success-200',
    circle: 'bg-indicator-positive',
    icon: 'text-text-950',
    value: 'text-success-700',
  },
  incorrect: {
    card: 'bg-error-100',
    circle: 'bg-error-500',
    icon: 'text-text',
    value: 'text-error-700',
  },
  blank: {
    card: 'bg-info-background',
    circle: 'bg-info-500',
    icon: 'text-text',
    value: 'text-info-700',
  },
};

/**
 * Coloured stat card, laid out as a centred column: icon in a circle, tiny
 * uppercase label and the large value.
 */
function SimulationStatCard({
  tone,
  icon,
  label,
  value,
}: {
  readonly tone: StatTone;
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  const classes = STAT_TONE_CLASSES[tone];
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center gap-1 rounded-xl border border-border-50 px-3 py-4',
        classes.card
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          classes.circle,
          classes.icon
        )}
      >
        {icon}
      </span>
      <Text
        as="span"
        weight="bold"
        className="text-center text-[8px] leading-3 uppercase text-text-800"
      >
        {label}
      </Text>
      <Text
        size="xl"
        weight="bold"
        className={cn('text-center', classes.value)}
      >
        {value}
      </Text>
    </div>
  );
}

/**
 * The four cards of a cut: grade, correct, incorrect and blank. The grade card
 * is skipped when no score was sent, so an older API still renders the three
 * counts it always had.
 */
export function SimulationStatCards({
  score,
  correct,
  incorrect,
  blank,
}: {
  readonly score: number | undefined;
  readonly correct: number;
  readonly incorrect: number;
  readonly blank: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {score !== undefined && (
        <SimulationStatCard
          tone="grade"
          icon={<ExamIcon size={16} weight="bold" />}
          label="Nota média"
          value={formatScoreOutOfTen(score)}
        />
      )}
      <SimulationStatCard
        tone="correct"
        icon={<CheckCircleIcon size={16} weight="bold" />}
        label="Nº de questões corretas"
        value={String(correct)}
      />
      <SimulationStatCard
        tone="incorrect"
        icon={<XCircleIcon size={16} weight="bold" />}
        label="Nº de questões incorretas"
        value={String(incorrect)}
      />
      <SimulationStatCard
        tone="blank"
        icon={<MinusCircleIcon size={16} weight="bold" />}
        label="Nº de questões em branco"
        value={String(blank)}
      />
    </div>
  );
}

/** One subtema card: centred coloured label over the content name. */
function ContentCard({
  label,
  labelClassName,
  content,
}: {
  readonly label: string;
  readonly labelClassName: string;
  readonly content: SimulationContentSummary | null;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border-50 bg-background p-4">
      <Text
        size="2xs"
        weight="medium"
        className={cn('text-center uppercase', labelClassName)}
      >
        {label}
      </Text>
      <Text size="md" className="text-center text-text-950">
        {content?.contentName ?? '—'}
      </Text>
    </div>
  );
}

/** Best/worst subtema pair; "—" when the cut has no answered content. */
export function ContentCards({
  best,
  worst,
}: {
  readonly best: SimulationContentSummary | null;
  readonly worst: SimulationContentSummary | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <ContentCard
        label="Subtema com melhor resultado"
        labelClassName="text-success-300"
        content={best}
      />
      <ContentCard
        label="Subtema com maior dificuldade"
        labelClassName="text-error-300"
        content={worst}
      />
    </div>
  );
}

/**
 * Expandable card of one simulado: title and meta line on top, the hit
 * progress below, and whatever the caller renders inside.
 *
 * The two modals list simulados from different endpoints, with different field
 * names, but the card itself is the same object on screen — so the shape lives
 * here and each caller passes the values it has.
 */
export function SimulationCardShell({
  value,
  title,
  meta,
  correct,
  totalQuestions,
  expanded,
  onToggle,
  children,
}: {
  /** Accordion id, unique within the list */
  readonly value: string;
  readonly title: string;
  /** "Duração · Nota · Feito em"; an empty string hides the line */
  readonly meta: string;
  readonly correct: number;
  readonly totalQuestions: number;
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly children: ReactNode;
}) {
  return (
    <CardAccordation
      value={value}
      expanded={expanded}
      onToggleExpanded={onToggle}
      triggerClassName="p-4"
      contentClassName="flex flex-col gap-4 pt-0"
      trigger={
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Text size="lg" weight="bold" className="min-w-0 text-text-950">
              {title}
            </Text>
            {meta && (
              <Text
                size="xs"
                weight="semibold"
                className="shrink-0 text-text-600"
              >
                {meta}
              </Text>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ProgressBar
              value={correct}
              max={totalQuestions}
              variant="green"
              size="small"
              className="flex-1"
            />
            <Text size="xs" weight="medium" className="shrink-0 text-text-950">
              {`${correct} de ${totalQuestions} corretas`}
            </Text>
          </div>
        </div>
      }
    >
      {children}
    </CardAccordation>
  );
}

/**
 * Header: avatar, name, an optional badge and "Escola • Turma • Ano".
 *
 * `location` takes the parts in display order and drops the empty ones, so a
 * caller whose payload has not arrived yet simply shows the name alone.
 */
export function StudentSummaryHeader({
  name,
  location,
  badge,
  badgePlacement = 'start',
}: {
  readonly name: string;
  readonly location: readonly (string | null | undefined)[];
  readonly badge?: ReactNode;
  /**
   * Where the badge sits: right after the name (`start`) or pushed to the
   * far end of the row (`end`), as the Atividades student modal draws it.
   */
  readonly badgePlacement?: 'start' | 'end';
}) {
  const parts = location.filter((part): part is string => Boolean(part));

  return (
    <div className="flex flex-col gap-2 border-b border-border-200 pb-4">
      <div className="flex items-center gap-2">
        <UserIcon size={24} className="shrink-0" />
        <Text
          size="md"
          className={cn(
            'min-w-0 truncate text-text-950',
            badgePlacement === 'start' && 'flex-1'
          )}
        >
          {name}
        </Text>
        {badge && badgePlacement === 'end' ? (
          <span className="ml-auto shrink-0">{badge}</span>
        ) : (
          badge
        )}
      </div>
      {parts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {parts.map((part, index) => (
            <span key={part} className="flex items-center gap-2">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="size-1 rounded-full bg-border-600"
                />
              )}
              <Text size="xs" className="text-text-600">
                {part}
              </Text>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
