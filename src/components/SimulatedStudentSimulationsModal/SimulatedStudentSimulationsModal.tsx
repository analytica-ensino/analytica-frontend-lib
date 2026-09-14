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
import {
  SIMULATED_SIMULATIONS_TAG_CONFIG,
  type SimulatedPerformanceTag,
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

/** One expandable simulado of the "Simulados realizados" list. */
function SimulationCard({
  simulation,
  expanded,
  onToggle,
  detail,
  note,
  onRetryNote,
  onSaveNote,
  onSaveQuestionComment,
}: SimulationCardHandlers & {
  readonly simulation: StudentSimulationItem;
  readonly expanded: boolean;
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
      {expanded && (
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
}

export function SimulatedStudentSimulationsModal({
  api,
  isOpen,
  onClose,
  title,
  data,
  loading,
  error,
}: SimulatedStudentSimulationsModalProps) {
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
        />

        <section className="flex flex-col gap-3">
          <SectionTitle>Dados de simulados</SectionTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <DataCard
              label="Simulados realizados"
              value={String(data.totals.simulationsCount)}
            />
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
          <SectionTitle>Simulados realizados</SectionTitle>
          {data.simulations.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-border-50 bg-background p-6">
              <Text size="sm" className="text-text-500">
                Nenhum simulado no período
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
