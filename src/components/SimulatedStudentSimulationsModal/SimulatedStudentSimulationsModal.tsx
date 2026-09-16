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
  /** Placeholder of the observation editor of an expanded card */
  readonly notePlaceholder: string;
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
    notePlaceholder: 'Escreva uma observação para este simulado',
  };

/** A count as the design writes it: at least two digits, so 6 reads "06". */
function formatCount(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * "dd/mm/aaaa • HH:mmh" of the last login. A student who never logged in
 * gets the zeroed date the design uses as its placeholder, not a dash.
 */
function formatLastAccess(lastAccess: string | null): string {
  return lastAccess
    ? dayjs(lastAccess).format('DD/MM/YYYY • HH:mm[h]')
    : '00/00/0000 • 00:00h';
}

/** What the list shows when there is nothing to list, answered or pending. */
export interface SimulatedStudentSimulationsEmptyState {
  /** Illustration above the title; omitted, only the text is shown */
  readonly image?: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Empty list with an illustration: the teacher has not assigned anything to
 * this student yet, so there is nothing to answer, let alone to show.
 */
function ListEmptyState({
  image,
  title,
  description,
}: SimulatedStudentSimulationsEmptyState) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center gap-4 rounded-xl border border-border-50 bg-background p-6">
      {image && <img src={image} alt="" className="h-20 w-auto" />}
      <div className="flex flex-col items-center gap-1">
        <Text size="lg" weight="bold" className="text-center text-text-950">
          {title}
        </Text>
        <Text size="xs" className="text-center text-text-500">
          {description}
        </Text>
      </div>
    </div>
  );
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
          value={formatCount(access.accessCount)}
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
  notePlaceholder,
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
  /** Placeholder of the observation editor */
  readonly notePlaceholder: string;
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
          notePlaceholder={notePlaceholder}
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
   * Off for lists of a type the detail endpoint does not serve (it answers
   * for simulados and activities), so the card shows its stat and content
   * cards alone. Default true.
   */
  readonly detailsEnabled?: boolean;
  /** Where the band badge sits in the header. Default `start`. */
  readonly badgePlacement?: 'start' | 'end';
  /**
   * Whether to render the logins section from `data.access`. Off by default:
   * the endpoint answers it for every caller, but only the Atividades
   * ranking modal shows it. Default false.
   */
  readonly showAccess?: boolean;
  /**
   * Whether to list the assignments of `data.pending` after the answered
   * ones. Off by default, for the same reason. Default false.
   */
  readonly showPending?: boolean;
  /**
   * Illustrated empty state of the list, shown when the student has nothing
   * answered and nothing pending. Omitted, the list shows `labels.empty`
   * as a single line.
   */
  readonly emptyState?: SimulatedStudentSimulationsEmptyState;
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
  showAccess = false,
  showPending = false,
  emptyState,
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
    const pending = showPending ? (data.pending ?? []) : [];
    // Nothing answered in the period: the totals are all zero and the
    // average is meaningless, so the cards show placeholders, not results.
    const hasAnswers = data.simulations.length > 0;
    const listIsEmpty = !hasAnswers && pending.length === 0;
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

        {showAccess && data.access && (
          <AccessSection access={data.access} labels={copy} />
        )}

        <section className="flex flex-col gap-3">
          <SectionTitle>{copy.dataSection}</SectionTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <DataCard
              label={copy.completedCount}
              value={
                hasAnswers
                  ? String(data.totals.simulationsCount)
                  : formatCount(0)
              }
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
            empty={!hasAnswers}
          />
          <ContentCards best={data.bestContent} worst={data.worstContent} />
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>{copy.listTitle}</SectionTitle>
          {listIsEmpty && emptyState && <ListEmptyState {...emptyState} />}
          {listIsEmpty && !emptyState && (
            <div className="flex items-center justify-center rounded-xl border border-border-50 bg-background p-6">
              <Text size="sm" className="text-text-500">
                {copy.empty}
              </Text>
            </div>
          )}
          {!listIsEmpty && (
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
                  notePlaceholder={copy.notePlaceholder}
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
