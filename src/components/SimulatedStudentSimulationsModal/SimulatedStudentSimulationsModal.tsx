import type { ReactNode } from 'react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { SimulationAnswers } from '../SimulationsPage/SimulationsDetailModal';
import {
  buildSimulationMeta,
  ContentCards,
  DataCard,
  SectionTitle,
  SimulationCardShell,
  SimulationStatCards,
  StudentSummaryHeader,
} from '../shared/SimulationSummaryCards';
import {
  useSimulationCardDetails,
  type SimulationCardHandlers,
} from '../../hooks/useSimulationCardDetails';
import type { BaseApiClient } from '../../types/api';
import { formatTimeSpent } from '../../utils/activityDetailsUtils';
import dayjs from 'dayjs';
import {
  SIMULATED_SIMULATIONS_TAG_CONFIG,
  type SimulatedPerformanceTag,
  type StudentAccessSummary,
  type StudentPendingActivity,
  type StudentSimulationItem,
  type StudentSimulationsData,
} from './types';

/**
 * Band badge, in the gestor tables' palette.
 *
 * Exported so a consuming table can label its Desempenho column with exactly
 * the badge the modal header shows.
 */
export function PerformanceBadge({
  tag,
}: {
  readonly tag: SimulatedPerformanceTag;
}) {
  const config = SIMULATED_SIMULATIONS_TAG_CONFIG[tag];
  if (!config) return null;

  return (
    <Badge
      variant="solid"
      action="neutral"
      size="small"
      className={config.badgeClassName}
    >
      {config.label}
    </Badge>
  );
}

/**
 * The copy that names what the list holds.
 *
 * The modal was written for simulados and its defaults say so; the teacher's
 * Atividades report lists activities through the same endpoint and hands over
 * its own wording. Only these four strings differ between the two — the
 * "Tempo total" and "Desempenho geral" blocks read the same either way.
 */
export interface SimulatedStudentSimulationsModalLabels {
  /** Title of the first section, e.g. "Dados de simulados" */
  readonly dataSection: string;
  /** Label of the count card, e.g. "Simulados realizados" */
  readonly completedCount: string;
  /**
   * Label of a third card of the data section, with the questions the
   * student answered (correct + incorrect + blank). Left out, the card is
   * not rendered — the Simulados report does not show it.
   */
  readonly questionsAnswered?: string;
  /** Title of the list section, e.g. "Simulados realizados" */
  readonly listTitle: string;
  /** Shown when the list is empty, e.g. "Nenhum simulado no período" */
  readonly empty: string;
  /** Title of the logins section, rendered when `data.access` is present */
  readonly accessSection: string;
  readonly accessCount: string;
  readonly timeOnline: string;
  readonly lastLogin: string;
  /** Shown inside the card of an assigned activity not answered yet */
  readonly pendingMessage: string;
}

/** The simulado wording, applied when the caller names nothing. */
export const DEFAULT_SIMULATED_STUDENT_SIMULATIONS_LABELS: SimulatedStudentSimulationsModalLabels =
  {
    dataSection: 'Dados de simulados',
    completedCount: 'Simulados realizados',
    listTitle: 'Simulados realizados',
    empty: 'Nenhum simulado no período',
    accessSection: 'Dados de acesso',
    accessCount: 'Quantidade de acessos',
    timeOnline: 'Tempo total online',
    lastLogin: 'Último login',
    pendingMessage: 'Sem dados ainda! A atividade ainda não foi feita.',
  };

/** "dd/mm/aaaa • HH:mmh" of the last login, or a dash when there was none. */
function formatLastAccess(lastAccess: string | null): string {
  return lastAccess ? dayjs(lastAccess).format('DD/MM/YYYY • HH:mm[h]') : '—';
}

/** The logins section: how often, for how long and when last. */
function AccessSection({
  access,
  labels,
}: {
  readonly access: StudentAccessSummary;
  readonly labels: SimulatedStudentSimulationsModalLabels;
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>{labels.accessSection}</SectionTitle>
      <div className="flex flex-col gap-2 md:flex-row">
        <DataCard
          label={labels.accessCount}
          value={String(access.accessCount).padStart(2, '0')}
        />
        <DataCard
          label={labels.timeOnline}
          value={formatTimeSpent(access.totalTimeMinutes * 60)}
        />
        <DataCard
          label={labels.lastLogin}
          value={formatLastAccess(access.lastAccess)}
        />
      </div>
    </section>
  );
}

/**
 * One assigned activity the student has not answered yet.
 *
 * Same frame as the answered cards, but nothing to expand: there is no score,
 * no answers and no date, only the title and the reason the card is empty.
 */
function PendingCard({
  activity,
  message,
}: {
  readonly activity: StudentPendingActivity;
  readonly message: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-200 bg-background p-4">
      <Text size="lg" weight="bold" className="text-text-950">
        {activity.title}
      </Text>
      <Text size="xs" className="text-text-500">
        {message}
      </Text>
    </div>
  );
}

/** One expandable simulado of the "Simulados realizados" list. */
function SimulationCard({
  simulation,
  expanded,
  showAnswers,
  onToggle,
  detail,
  note,
  onRetryNote,
  onSaveNote,
  onSaveQuestionComment,
}: SimulationCardHandlers & {
  readonly simulation: StudentSimulationItem;
  readonly expanded: boolean;
  /** Whether the expanded card lists the questions and the observation */
  readonly showAnswers: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <SimulationCardShell
      value={simulation.activityId}
      title={simulation.title}
      meta={buildSimulationMeta(simulation)}
      correct={simulation.correct}
      totalQuestions={simulation.totalQuestions}
      expanded={expanded}
      onToggle={onToggle}
    >
      <SimulationStatCards
        score={simulation.score}
        correct={simulation.correct}
        incorrect={simulation.incorrect}
        blank={simulation.blank}
      />
      <ContentCards
        best={simulation.bestContent}
        worst={simulation.worstContent}
      />
      {expanded && showAnswers && (
        <SimulationAnswers
          detail={detail}
          note={note}
          onRetryNote={onRetryNote}
          onSaveNote={onSaveNote}
          onSaveQuestionComment={onSaveQuestionComment}
        />
      )}
    </SimulationCardShell>
  );
}

/** Loading placeholder of the whole modal. */
function ModalSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonCard className="min-h-[72px]" />
      <SkeletonCard className="min-h-[120px]" />
      <SkeletonCard className="min-h-[200px]" />
    </div>
  );
}

/**
 * Student details modal of the Simulados report, opened by clicking a row of
 * "Desempenho por estudante".
 *
 * The summary data, loading and error are owned by the caller: that request
 * depends on the tab and the time window the report is on, and the report
 * already knows both. The `title` arrives ready for the same reason — the
 * professor app names a fixed period while the gestor may name an arbitrary
 * calendar range. What this modal owns is the per-simulado detail (observation
 * and questions), fetched from the Simulados endpoints when a card is first
 * expanded.
 */
export interface SimulatedStudentSimulationsModalProps {
  /** API client used to load each simulado's questions and observation */
  readonly api: BaseApiClient;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  /** Modal title, e.g. "Simulados Enem em 1 mês" */
  readonly title: string;
  readonly data: StudentSimulationsData | null;
  readonly loading: boolean;
  readonly error: string | null;
  /** Wording of the list; whatever is omitted keeps the simulado copy */
  readonly labels?: Partial<SimulatedStudentSimulationsModalLabels>;
  /**
   * Whether an expanded card loads and lists its questions and observation.
   * Off for lists whose items are not simulados: the detail endpoint answers
   * only for those, so the card shows its stat and content cards alone.
   * Default true.
   */
  readonly detailsEnabled?: boolean;
  /** Where the band badge sits in the header. Default `start`. */
  readonly badgePlacement?: 'start' | 'end';
}

export function SimulatedStudentSimulationsModal({
  api,
  isOpen,
  onClose,
  title,
  data,
  loading,
  error,
  labels,
  detailsEnabled = true,
  badgePlacement = 'start',
}: SimulatedStudentSimulationsModalProps) {
  const copy = { ...DEFAULT_SIMULATED_STUDENT_SIMULATIONS_LABELS, ...labels };
  const {
    expandedId,
    details,
    notes,
    toggle,
    retryNote,
    makeSaveNote,
    makeSaveQuestionComment,
  } = useSimulationCardDetails({
    api,
    userInstitutionId: data?.student.userInstitutionId ?? null,
    isOpen,
    enabled: detailsEnabled,
  });

  let content: ReactNode = null;
  if (loading) {
    content = <ModalSkeleton />;
  } else if (error) {
    content = (
      <div className="flex min-h-[160px] items-center justify-center">
        <Text size="sm" className="text-text-500">
          {error}
        </Text>
      </div>
    );
  } else if (data) {
    const pending = data.pending ?? [];
    content = (
      <div className="flex flex-col gap-6">
        <StudentSummaryHeader
          name={data.student.name}
          location={[
            data.student.school,
            data.student.class,
            data.student.schoolYear,
          ]}
          badge={<PerformanceBadge tag={data.student.performance} />}
          badgePlacement={badgePlacement}
        />

        {data.access && <AccessSection access={data.access} labels={copy} />}

        <section className="flex flex-col gap-3">
          <SectionTitle>{copy.dataSection}</SectionTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <DataCard
              label={copy.completedCount}
              value={String(data.totals.simulationsCount)}
            />
            {copy.questionsAnswered && (
              <DataCard
                label={copy.questionsAnswered}
                value={String(
                  data.totals.correct +
                    data.totals.incorrect +
                    data.totals.blank
                )}
              />
            )}
            <DataCard
              label="Tempo total"
              value={formatTimeSpent(data.totals.totalTimeSeconds)}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>Desempenho geral</SectionTitle>
          <SimulationStatCards
            score={data.student.average}
            correct={data.totals.correct}
            incorrect={data.totals.incorrect}
            blank={data.totals.blank}
          />
          <ContentCards best={data.bestContent} worst={data.worstContent} />
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>{copy.listTitle}</SectionTitle>
          {data.simulations.length === 0 && pending.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-border-50 bg-background p-6">
              <Text size="sm" className="text-text-500">
                {copy.empty}
              </Text>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.simulations.map((simulation) => (
                <SimulationCard
                  // Keyed by the student too: the comment fields keep a dirty
                  // draft through a `value` change, and a draft written for
                  // one student must never survive into another.
                  key={`${data.student.userInstitutionId}-${simulation.activityId}`}
                  simulation={simulation}
                  expanded={expandedId === simulation.activityId}
                  showAnswers={detailsEnabled}
                  onToggle={() => toggle(simulation.activityId)}
                  detail={details[simulation.activityId]}
                  note={notes[simulation.activityId]}
                  onRetryNote={() => retryNote(simulation.activityId)}
                  onSaveNote={makeSaveNote(simulation.activityId)}
                  onSaveQuestionComment={makeSaveQuestionComment(
                    simulation.activityId
                  )}
                />
              ))}
              {pending.map((activity) => (
                <PendingCard
                  key={`${data.student.userInstitutionId}-pending-${activity.activityId}`}
                  activity={activity}
                  message={copy.pendingMessage}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      {content}
    </Modal>
  );
}
