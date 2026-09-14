import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ExamIcon } from '@phosphor-icons/react/dist/csr/Exam';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import { MinusCircleIcon } from '@phosphor-icons/react/dist/csr/MinusCircle';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import { CardAccordation } from '../Accordation';
import { UserIcon } from '../UserIcon/UserIcon';
import { SkeletonCard } from '../Skeleton/Skeleton';
import {
  SimulationNoteRow,
  SimulationQuestionItem,
  type SimulationNoteRowProps,
} from '../SimulationsPage/SimulationsDetailModal';
import { createUseSimulations } from '../../hooks/useSimulations';
import type { BaseApiClient } from '../../types/api';
import type { NoteData, SimulationDetailData } from '../../types/simulations';
import {
  formatDateToBrazilian,
  formatTimeSpent,
} from '../../utils/activityDetailsUtils';
import { formatScoreOutOfTen } from '../../utils/simulatedScore';
import {
  SIMULATED_SIMULATIONS_TAG_CONFIG,
  type SimulatedPerformanceTag,
  type StudentContentHitRate,
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

/** Lazily loaded question detail of one simulado. */
interface DetailState {
  loading: boolean;
  error: string | null;
  data: SimulationDetailData | null;
}

/** Lazily loaded teacher observation of one simulado. */
interface NoteState {
  loading: boolean;
  data: NoteData | null;
}

/** Section heading, "Dados de simulados" and its siblings (14px bold). */
function SectionTitle({ children }: { readonly children: ReactNode }) {
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
function DataCard({
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
function StatCard({
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
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl border border-border-50 px-3 py-4 ${classes.card}`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${classes.circle} ${classes.icon}`}
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
      <Text size="xl" weight="bold" className={`text-center ${classes.value}`}>
        {value}
      </Text>
    </div>
  );
}

/**
 * The four "Desempenho geral" cards. Reused inside each expanded simulado with
 * that simulado's own numbers.
 */
function StatCards({
  score,
  correct,
  incorrect,
  blank,
}: {
  readonly score: number;
  readonly correct: number;
  readonly incorrect: number;
  readonly blank: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <StatCard
        tone="grade"
        icon={<ExamIcon size={16} weight="bold" />}
        label="Nota média"
        value={formatScoreOutOfTen(score)}
      />
      <StatCard
        tone="correct"
        icon={<CheckCircleIcon size={16} weight="bold" />}
        label="Nº de questões corretas"
        value={String(correct)}
      />
      <StatCard
        tone="incorrect"
        icon={<XCircleIcon size={16} weight="bold" />}
        label="Nº de questões incorretas"
        value={String(incorrect)}
      />
      <StatCard
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
  readonly content: StudentContentHitRate | null;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border-50 bg-background p-4">
      <Text
        size="2xs"
        weight="medium"
        className={`text-center uppercase ${labelClassName}`}
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
function ContentCards({
  best,
  worst,
}: {
  readonly best: StudentContentHitRate | null;
  readonly worst: StudentContentHitRate | null;
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
 * Observation and question list of one simulado, loaded when its card is
 * first expanded. Both come from the Simulados endpoints the lib already
 * wraps, so the questions render exactly as on the Simulados page.
 */
function SimulationAnswers({
  detail,
  note,
  onSaveNote,
  onSaveQuestionComment,
}: {
  readonly detail: DetailState | undefined;
  readonly note: NoteState | undefined;
  readonly onSaveNote: SimulationNoteRowProps['onSave'];
  readonly onSaveQuestionComment: (
    questionId: string,
    comment: string
  ) => Promise<void>;
}) {
  if (!detail || detail.loading) {
    return <SkeletonCard className="min-h-[160px]" />;
  }

  if (detail.error) {
    return (
      <Text size="sm" className="text-error-600">
        {detail.error}
      </Text>
    );
  }

  if (!detail.data) return null;

  return (
    <>
      <SimulationNoteRow
        note={note?.data ?? null}
        loading={note?.loading ?? false}
        onSave={onSaveNote}
      />
      <div className="flex flex-col gap-2 pt-2">
        <Text as="h4" size="lg" weight="bold" className="text-text-950">
          Respostas
        </Text>
        {detail.data.questions.map((question, index) => (
          <SimulationQuestionItem
            key={question.questionId}
            question={question}
            index={index}
            onSaveComment={(comment) =>
              onSaveQuestionComment(question.questionId, comment)
            }
          />
        ))}
      </div>
    </>
  );
}

/** One expandable simulado of the "Simulados realizados" list. */
function SimulationCard({
  simulation,
  expanded,
  onToggle,
  detail,
  note,
  onSaveNote,
  onSaveQuestionComment,
}: {
  readonly simulation: StudentSimulationItem;
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly detail: DetailState | undefined;
  readonly note: NoteState | undefined;
  readonly onSaveNote: SimulationNoteRowProps['onSave'];
  readonly onSaveQuestionComment: (
    questionId: string,
    comment: string
  ) => Promise<void>;
}) {
  const doneAt = simulation.answeredAt
    ? formatDateToBrazilian(simulation.answeredAt)
    : '—';

  return (
    <CardAccordation
      value={simulation.activityId}
      expanded={expanded}
      onToggleExpanded={onToggle}
      triggerClassName="p-4"
      contentClassName="flex flex-col gap-4 pt-0"
      trigger={
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Text size="lg" weight="bold" className="min-w-0 text-text-950">
              {simulation.title}
            </Text>
            <Text
              size="xs"
              weight="semibold"
              className="shrink-0 text-text-600"
            >
              {`Duração: ${formatTimeSpent(simulation.timeSpentSeconds)} · Nota: ${formatScoreOutOfTen(simulation.score)} · Feito em: ${doneAt}`}
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <ProgressBar
              value={simulation.correct}
              max={simulation.totalQuestions}
              variant="green"
              size="small"
              className="flex-1"
            />
            <Text size="xs" weight="medium" className="shrink-0 text-text-950">
              {`${simulation.correct} de ${simulation.totalQuestions} corretas`}
            </Text>
          </div>
        </div>
      }
    >
      <StatCards
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
          onSaveNote={onSaveNote}
          onSaveQuestionComment={onSaveQuestionComment}
        />
      )}
    </CardAccordation>
  );
}

/** Header: avatar, name, band badge and "Escola • Turma • Ano". */
function StudentHeader({
  student,
}: {
  readonly student: StudentSimulationsData['student'];
}) {
  const location = [student.school, student.class, student.schoolYear].filter(
    Boolean
  );

  return (
    <div className="flex flex-col gap-2 border-b border-border-200 pb-4">
      <div className="flex items-center gap-2">
        <UserIcon size={24} className="shrink-0" />
        <Text size="md" className="min-w-0 flex-1 truncate text-text-950">
          {student.name}
        </Text>
        <PerformanceBadge tag={student.performance} />
      </div>
      {location.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {location.map((part, index) => (
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
  const useSimulations = useMemo(() => createUseSimulations(api), [api]);
  const {
    fetchSimulationDetail,
    fetchNote,
    uploadNoteAttachment,
    saveNote,
    saveQuestionComment,
  } = useSimulations();

  const userInstitutionId = data?.student.userInstitutionId ?? null;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, DetailState>>({});
  const [notes, setNotes] = useState<Record<string, NoteState>>({});

  // Bumped whenever the modal opens for a (possibly different) student, so a
  // slow response from the previous one is dropped instead of written into
  // the new one.
  const sessionRef = useRef(0);
  useEffect(() => {
    sessionRef.current += 1;
    setExpandedId(null);
    setDetails({});
    setNotes({});
  }, [isOpen, userInstitutionId]);

  const handleToggle = useCallback(
    (simulationId: string) => {
      if (!userInstitutionId) return;
      const session = sessionRef.current;
      const isStale = () => sessionRef.current !== session;
      const next = expandedId === simulationId ? null : simulationId;
      setExpandedId(next);

      if (!next || details[simulationId]) return;

      setDetails((previous) => ({
        ...previous,
        [simulationId]: { loading: true, error: null, data: null },
      }));
      fetchSimulationDetail(userInstitutionId, simulationId)
        .then((detail) => {
          if (isStale()) return;
          setDetails((previous) => ({
            ...previous,
            [simulationId]: { loading: false, error: null, data: detail },
          }));
        })
        .catch(() => {
          if (isStale()) return;
          setDetails((previous) => ({
            ...previous,
            [simulationId]: {
              loading: false,
              error: 'Erro ao carregar as questões do simulado.',
              data: null,
            },
          }));
        });

      setNotes((previous) => ({
        ...previous,
        [simulationId]: { loading: true, data: null },
      }));
      fetchNote(userInstitutionId, simulationId)
        .then((note) => {
          if (isStale()) return;
          setNotes((previous) => ({
            ...previous,
            [simulationId]: { loading: false, data: note },
          }));
        })
        .catch(() => {
          if (isStale()) return;
          setNotes((previous) => ({
            ...previous,
            [simulationId]: { loading: false, data: null },
          }));
        });
    },
    [userInstitutionId, expandedId, details, fetchSimulationDetail, fetchNote]
  );

  /**
   * Save the observation of one simulado, uploading a newly chosen file first
   * so only its public URL travels with the note.
   */
  const makeSaveNote = useCallback(
    (simulationId: string) =>
      async (
        text: string,
        file: File | null,
        existingAttachment: string | null
      ) => {
        if (!userInstitutionId) return;
        const session = sessionRef.current;
        const attachment = file
          ? await uploadNoteAttachment(file)
          : existingAttachment;
        const saved = await saveNote(
          userInstitutionId,
          simulationId,
          text,
          attachment
        );
        if (sessionRef.current !== session) return;
        setNotes((previous) => ({
          ...previous,
          [simulationId]: { loading: false, data: saved },
        }));
      },
    [userInstitutionId, uploadNoteAttachment, saveNote]
  );

  /**
   * Save a comment on one question and reflect it in the loaded detail, so the
   * field shows what the server now holds without a refetch.
   */
  const makeSaveQuestionComment = useCallback(
    (simulationId: string) => async (questionId: string, comment: string) => {
      if (!userInstitutionId) return;
      const session = sessionRef.current;
      const saved = await saveQuestionComment(
        userInstitutionId,
        simulationId,
        questionId,
        comment
      );
      if (sessionRef.current !== session) return;
      setDetails((previous) => {
        const current = previous[simulationId];
        if (!current?.data) return previous;
        return {
          ...previous,
          [simulationId]: {
            ...current,
            data: {
              ...current.data,
              questions: current.data.questions.map((question) =>
                question.questionId === questionId
                  ? { ...question, teacherComment: saved?.teacherComment ?? '' }
                  : question
              ),
            },
          },
        };
      });
    },
    [userInstitutionId, saveQuestionComment]
  );

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
        <StudentHeader student={data.student} />

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
          <StatCards
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
                  onToggle={() => handleToggle(simulation.activityId)}
                  detail={details[simulation.activityId]}
                  note={notes[simulation.activityId]}
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
