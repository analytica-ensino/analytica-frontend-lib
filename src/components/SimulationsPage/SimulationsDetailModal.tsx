import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { PaperclipIcon } from '@phosphor-icons/react/dist/csr/Paperclip';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';
import { CardAccordation } from '../Accordation';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { QuestionCommentField } from '../shared/QuestionCommentField';
import {
  TrueFalseStatementList,
  type TrueFalseStatement,
} from '../shared/TrueFalseStatementList';
import { ImageAnswerView } from '../shared/ImageAnswerView';
import { DEFAULT_IMAGE_TOLERANCE } from '../../utils/image/imageAnswer.utils';
import { AlternativesList } from '../Alternative/Alternative';
import { HtmlMathRenderer } from '../HtmlMathRenderer';
import { OptionStatus } from '../../enums/Options';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import {
  getQuestionStatusBadgeConfig,
  QUESTION_STATUS,
  type QuestionStatus,
} from '../../utils/studentActivityCorrection';
import {
  buildSimulationMeta,
  ContentCards,
  DataCard,
  SectionTitle,
  SimulationCardShell,
  SimulationStatCards,
  StudentSummaryHeader,
} from '../shared/SimulationSummaryCards';
import { cn } from '../../utils/utils';
import { formatQuestionDuration } from '../../utils/questionDuration';
import { formatTimeSpent } from '../../utils/activityDetailsUtils';
import type { BaseApiClient } from '../../types/api';
import { createUseSimulations } from '../../hooks/useSimulations';
import {
  useSimulationCardDetails,
  type SimulationCardHandlers,
  type SimulationDetailState,
  type SimulationNoteState,
} from '../../hooks/useSimulationCardDetails';
import type {
  SimulationsListData,
  SimulationDetailQuestion,
  StudentSimulationItem,
  NoteData,
} from '../../types/simulations';

export interface SimulationsDetailModalProps {
  /** API client used to fetch the student's simulations */
  readonly api: BaseApiClient;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  /** The student whose simulations are shown (null closes the modal) */
  readonly student: { userInstitutionId: string; name: string } | null;
}

/** Map the simulation question status to the shared correction status. */
const QUESTION_STATUS_MAP: Record<
  SimulationDetailQuestion['status'],
  QuestionStatus
> = {
  CORRECT: QUESTION_STATUS.CORRETA,
  INCORRECT: QUESTION_STATUS.INCORRETA,
  BLANK: QUESTION_STATUS.EM_BRANCO,
  PENDING: QUESTION_STATUS.PENDENTE,
};

/** Label of the inner accordion holding the student's answer. */
function getAnswerAccordionTitle(questionType: string): string {
  if (questionType === QUESTION_TYPE.DISSERTATIVA) {
    return 'Resposta do aluno';
  }
  if (questionType === QUESTION_TYPE.VERDADEIRO_FALSO) {
    return 'Afirmações';
  }
  if (questionType === QUESTION_TYPE.IMAGEM) {
    return 'Imagem';
  }
  return 'Alternativas';
}

// ---------------------------------------------------------------------------
// Level 2 — Question (reuses the shared alternatives renderer + status badge)
// ---------------------------------------------------------------------------

export interface SimulationQuestionItemProps {
  readonly question: SimulationDetailQuestion;
  /** Zero-based position in the simulation; shown as "Questão N". */
  readonly index: number;
  /** Persist the teacher comment on this question; an empty string clears it. */
  readonly onSaveComment: (comment: string) => Promise<void>;
}

/**
 * One question of a student's simulation: an accordion with the status badge
 * in its header and, inside, the statement, the student's answer (alternatives,
 * true/false marks, essay text or image click, by question type) and the
 * teacher comment field.
 *
 * Exported so consumers that list a student's simulations in their own layout
 * (the Desempenho report of the teacher app) render questions exactly as the
 * Simulados page does.
 */
export function SimulationQuestionItem({
  question,
  index,
  onSaveComment,
}: SimulationQuestionItemProps) {
  const badge = getQuestionStatusBadgeConfig(
    QUESTION_STATUS_MAP[question.status]
  );

  // Subject and duration only join the label when they exist: a question with
  // no subject in the knowledge matrix and a simulation answered before
  // per-question telemetry both fall back to a plain "Questão N".
  const label = [
    `Questão ${index + 1}`,
    question.subject,
    formatQuestionDuration(question.timeSpent),
  ]
    .filter(Boolean)
    .join(' - ');

  const alternatives = question.options.map((option) => {
    let status: OptionStatus;
    if (option.isCorrect) {
      status = OptionStatus.CORRECT;
    } else if (option.isSelected) {
      status = OptionStatus.INCORRECT;
    } else {
      status = OptionStatus.NEUTRAL;
    }
    return { label: option.option, value: option.id, status };
  });

  // An essay has no alternatives to show — it has the text the student wrote.
  // Rendering the "Alternativas" accordion for it produced an empty box and hid
  // the answer entirely, leaving the teacher to comment on nothing.
  const isEssay = question.questionType === QUESTION_TYPE.DISSERTATIVA;

  // True/false never writes `option_id`, so `isSelected` is always false and the
  // student's marks live in each option's `selectedValue`. Sending it through
  // the alternatives branch showed the answer key as if it were the student's
  // answer, and no mark at all.
  const isTrueFalse = question.questionType === QUESTION_TYPE.VERDADEIRO_FALSO;
  const trueFalseStatements: TrueFalseStatement[] = question.options.map(
    (option) => ({
      id: option.id,
      statement: option.option,
      studentMark: option.selectedValue ?? null,
      isTrue: option.isCorrect,
    })
  );

  // IMAGEM has no alternatives either: the answer is a point on an image. The
  // alternatives branch rendered the answer key's raw JSON as an option label,
  // painted green, and never showed where the student clicked.
  const isImage = question.questionType === QUESTION_TYPE.IMAGEM;

  /**
   * Render the student's answer, shaped by the question type.
   */
  const renderAnswerArea = () => {
    if (isImage) {
      return (
        <ImageAnswerView
          imageUrl={question.additionalContent ?? ''}
          correctPoint={question.correctPoint}
          studentPoint={
            question.imageAnswer
              ? {
                  x: question.imageAnswer.coordinateX,
                  y: question.imageAnswer.coordinateY,
                }
              : null
          }
          toleranceRadius={question.imageTolerance ?? DEFAULT_IMAGE_TOLERANCE}
        />
      );
    }

    if (isEssay) {
      return (
        <div className="rounded-lg border border-border-100 bg-background-50 p-3">
          {question.answer ? (
            <HtmlMathRenderer
              content={question.answer}
              className="text-sm text-text-800"
            />
          ) : (
            <Text size="sm" className="text-text-600">
              Nenhuma resposta fornecida
            </Text>
          )}
        </div>
      );
    }

    if (isTrueFalse) {
      return <TrueFalseStatementList statements={trueFalseStatements} />;
    }

    return (
      <AlternativesList
        mode="readonly"
        layout="compact"
        name={`question-${question.questionId}`}
        alternatives={alternatives}
        selectedValue={question.selectedOptionId ?? ''}
      />
    );
  };

  return (
    <CardAccordation
      value={question.questionId}
      trigger={
        <div className="flex flex-1 items-center justify-between gap-3 py-3">
          <Text size="sm" weight="bold" className="min-w-0 text-text-950">
            {label}
          </Text>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
              badge.bgColor,
              badge.textColor
            )}
          >
            {badge.label}
          </span>
        </div>
      }
      contentClassName="px-3 pb-3"
    >
      <div className="flex flex-col gap-3">
        <HtmlMathRenderer
          content={question.statement}
          className="text-sm text-text-800"
        />
        <CardAccordation
          value={`${question.questionId}-answer`}
          trigger={
            <div className="flex-1 py-2">
              <Text size="sm" weight="medium" className="text-text-950">
                {getAnswerAccordionTitle(question.questionType)}
              </Text>
            </div>
          }
          contentClassName="px-3 pb-3"
        >
          {renderAnswerArea()}
        </CardAccordation>
        <QuestionCommentField
          value={question.teacherComment ?? ''}
          onSave={onSaveComment}
        />
      </div>
    </CardAccordation>
  );
}

// ---------------------------------------------------------------------------
// Note ("Observação")
// ---------------------------------------------------------------------------

export interface SimulationNoteRowProps {
  /** Current observation, null when the teacher never wrote one. */
  readonly note: NoteData | null;
  readonly loading: boolean;
  /**
   * Message of a failed load. While it is set the row offers a retry instead
   * of the editor: writing over a note that could not be read would replace
   * it, and this save has no version to protect it.
   */
  readonly loadError?: string | null;
  /** Load the observation again; required whenever `loadError` can be set. */
  readonly onRetry?: () => void;
  /**
   * Persist the observation. `text` is already trimmed and non-empty; `file`
   * is a newly chosen attachment still to be uploaded (null when none), and
   * `existingAttachment` is the URL of the saved file the teacher kept — null
   * when there was none, when it was removed, or when a new file replaces it.
   */
  readonly onSave: (
    text: string,
    file: File | null,
    existingAttachment: string | null
  ) => Promise<void>;
}

/**
 * Human label of an attachment URL: its file name, or a generic word when the
 * URL carries none.
 */
function getAttachmentLabel(url: string): string {
  const lastSegment = url.split('?')[0].split('/').pop() ?? '';
  try {
    return decodeURIComponent(lastSegment) || 'Anexo';
  } catch {
    return lastSegment || 'Anexo';
  }
}

/**
 * Grey pill naming an attached file. Links to the file when `href` is given
 * and offers a remove button when `onRemove` is given — the same chip the
 * activity correction modal uses for its observation attachment.
 */
function AttachmentChip({
  label,
  href,
  onRemove,
}: {
  readonly label: string;
  readonly href?: string;
  readonly onRemove?: () => void;
}) {
  const content = (
    <>
      <PaperclipIcon size={18} className="shrink-0 text-text-800" />
      <span className="truncate text-md font-medium text-text-800">
        {label}
      </span>
    </>
  );

  return (
    <div className="flex h-10 min-w-0 max-w-[220px] items-center gap-2 rounded-full bg-secondary-500 px-5">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 items-center gap-2 hover:underline"
        >
          {content}
        </a>
      ) : (
        content
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-text-700 hover:text-text-950"
          aria-label={`Remover ${label}`}
        >
          <XIcon size={18} />
        </button>
      )}
    </div>
  );
}

/**
 * The simulation-wide teacher observation: a row with the saved text, the
 * attached file (if any) and an "Incluir"/"Editar" button that swaps into a
 * textarea with "Anexar" and "Salvar" — the same flow as the observation of
 * the activity correction modal.
 *
 * Exported for the same reason as {@link SimulationQuestionItem}.
 */
export function SimulationNoteRow({
  note,
  loading,
  loadError,
  onRetry,
  onSave,
}: SimulationNoteRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** File chosen in this editing session, not uploaded yet. */
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  /** Saved attachment the teacher is keeping; null once removed. */
  const [keptAttachment, setKeptAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedAttachment = note?.attachment ?? null;

  const startEditing = () => {
    setDraft(note?.note ?? '');
    setPendingFile(null);
    setKeptAttachment(savedAttachment);
    setError(null);
    setEditing(true);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) setPendingFile(file);
    // Reset so the same file can be picked again after being removed.
    event.target.value = '';
  };

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(
        draft.trim(),
        pendingFile,
        pendingFile ? null : keptAttachment
      );
      setEditing(false);
    } catch {
      // Keep the editing UI open (draft preserved) and surface the failure.
      setError('Erro ao salvar a observação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  /** Left side of the footer: the chosen/kept file, or the "Anexar" button. */
  const renderAttachmentControl = () => {
    if (pendingFile) {
      return (
        <AttachmentChip
          label={pendingFile.name}
          onRemove={() => setPendingFile(null)}
        />
      );
    }
    if (keptAttachment) {
      return (
        <AttachmentChip
          label={getAttachmentLabel(keptAttachment)}
          href={keptAttachment}
          onRemove={() => setKeptAttachment(null)}
        />
      );
    }
    return (
      <Button
        type="button"
        variant="outline"
        size="medium"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <PaperclipIcon size={18} />
        Anexar
      </Button>
    );
  };

  if (loading) {
    return <SkeletonCard className="h-14" />;
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border-200 bg-background p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Text size="md" weight="bold" className="text-text-950">
            Observação
          </Text>
          <Text size="sm" className="text-error-600">
            {loadError}
          </Text>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="medium"
            onClick={onRetry}
            className="shrink-0"
          >
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border-200 bg-background p-4">
        <Text size="md" weight="bold" className="text-text-950">
          Observação
        </Text>
        <TextArea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escreva uma observação para este simulado"
          rows={3}
        />
        {error && (
          <Text size="sm" className="text-error-600">
            {error}
          </Text>
        )}
        {/* Only images: the pre-signed upload endpoint accepts nothing else. */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          aria-label="Selecionar arquivo"
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {renderAttachmentControl()}
          <Button
            type="button"
            variant="solid"
            size="medium"
            onClick={handleSave}
            disabled={saving || !draft.trim()}
          >
            Salvar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border-200 bg-background p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text size="md" weight="bold" className="text-text-950">
          Observação
        </Text>
        {note?.note && (
          <Text size="sm" className="truncate text-text-700">
            {note.note}
          </Text>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {savedAttachment && (
          <AttachmentChip
            label={getAttachmentLabel(savedAttachment)}
            href={savedAttachment}
          />
        )}
        <Button
          type="button"
          variant="solid"
          size="medium"
          onClick={startEditing}
        >
          {note?.note ? 'Editar' : 'Incluir'}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Level 1 — Simulation
// ---------------------------------------------------------------------------

/**
 * Observation and question list of one simulado, loaded when its card is
 * first expanded.
 */
export function SimulationAnswers({
  detail,
  note,
  onRetryNote,
  onSaveNote,
  onSaveQuestionComment,
}: {
  readonly detail: SimulationDetailState | undefined;
  readonly note: SimulationNoteState | undefined;
  /** Load the observation again after a failed request */
  readonly onRetryNote: () => void;
  readonly onSaveNote: SimulationNoteRowProps['onSave'];
  readonly onSaveQuestionComment: (
    questionId: string,
    comment: string
  ) => Promise<void>;
}) {
  if (!detail || detail.loading) {
    return <SkeletonCard className="h-40" />;
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
        loadError={note?.error ?? null}
        onRetry={onRetryNote}
        onSave={onSaveNote}
      />

      <div className="flex flex-col gap-2 pt-2">
        <Text as="h4" size="lg" weight="bold" className="text-text-950">
          Respostas
        </Text>
        {detail.data.questions.map((question, qIndex) => (
          <SimulationQuestionItem
            key={question.questionId}
            question={question}
            index={qIndex}
            onSaveComment={(comment) =>
              onSaveQuestionComment(question.questionId, comment)
            }
          />
        ))}
      </div>
    </>
  );
}

function SimulationItem({
  simulation,
  index,
  expanded,
  onToggle,
  detail,
  note,
  onRetryNote,
  onSaveNote,
  onSaveQuestionComment,
}: SimulationCardHandlers & {
  readonly simulation: StudentSimulationItem;
  readonly index: number;
  readonly expanded: boolean;
  readonly onToggle: () => void;
}) {
  const title = simulation.title?.trim()
    ? simulation.title.trim()
    : `Simulado ${index + 1}`;
  const meta = buildSimulationMeta(simulation);

  return (
    <SimulationCardShell
      value={simulation.id}
      title={title}
      meta={meta}
      correct={simulation.correctCount}
      totalQuestions={simulation.totalQuestions}
      expanded={expanded}
      onToggle={onToggle}
    >
      <SimulationStatCards
        score={simulation.score}
        correct={simulation.correctCount}
        incorrect={simulation.incorrectCount}
        blank={simulation.blankCount}
      />
      {/* Essays awaiting grading used to be counted as blank. */}
      {detail?.data && detail.data.counts.pending > 0 && (
        <Text size="sm" className="text-text-600">
          {`${detail.data.counts.pending} ${detail.data.counts.pending === 1 ? 'questão dissertativa aguarda' : 'questões dissertativas aguardam'} correção`}
        </Text>
      )}
      <ContentCards
        best={simulation.bestContent ?? null}
        worst={simulation.worstContent ?? null}
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

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

/**
 * Modal that shows a single student's answered simulations as a nested
 * accordion (simulation -> question -> options), lazily loading each
 * simulation's detail when it is expanded. Reuses the shared StatCard and
 * AlternativesList components so the detail matches the activity correction UI.
 */
export function SimulationsDetailModal({
  api,
  isOpen,
  onClose,
  student,
}: SimulationsDetailModalProps) {
  const useSimulations = useMemo(() => createUseSimulations(api), [api]);
  const { fetchStudentSimulations } = useSimulations();

  const [list, setList] = useState<SimulationsListData | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

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
    userInstitutionId: student?.userInstitutionId ?? null,
    isOpen,
  });

  useEffect(() => {
    if (!isOpen || !student) return;

    setList(null);
    setListLoading(true);
    setListError(null);

    let active = true;
    fetchStudentSimulations(student.userInstitutionId)
      .then((data) => {
        if (active) setList(data);
      })
      .catch(() => {
        if (active) setListError('Erro ao carregar os simulados do estudante');
      })
      .finally(() => {
        if (active) setListLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, student, fetchStudentSimulations]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulados" size="xl">
      {student && (
        <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto pr-1">
          <StudentSummaryHeader
            name={student.name}
            location={[
              list?.student.school,
              list?.student.class,
              list?.student.schoolYear,
            ]}
          />

          {listLoading && (
            <>
              <SkeletonCard className="h-20" />
              <SkeletonCard className="h-40" />
            </>
          )}
          {listError && (
            <Text size="sm" className="text-error-600">
              {listError}
            </Text>
          )}

          {list && (
            <section className="flex flex-col gap-3">
              <SectionTitle>Dados de simulados</SectionTitle>
              <div className="flex flex-col gap-2 md:flex-row">
                <DataCard
                  label="Simulados realizados"
                  value={String(list.student.simulationsAnswered)}
                />
                {list.student.totalTimeSeconds !== undefined && (
                  <DataCard
                    label="Tempo total"
                    value={formatTimeSpent(list.student.totalTimeSeconds)}
                  />
                )}
              </div>
            </section>
          )}

          {list && (
            <section className="flex flex-col gap-3">
              <SectionTitle>Simulados realizados</SectionTitle>
              {list.simulations.data.length === 0 ? (
                <div className="flex items-center justify-center rounded-xl border border-border-50 bg-background p-6">
                  <Text size="sm" className="text-text-600">
                    Este estudante ainda não respondeu nenhum simulado.
                  </Text>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {list.simulations.data.map((simulation, index) => (
                    <SimulationItem
                      // Keyed by the student too: the comment fields below keep
                      // a dirty draft through a `value` change so an in-flight
                      // save cannot discard it, and a note written for one
                      // student must never survive into another. Remounting
                      // resets it for free.
                      key={`${student.userInstitutionId}-${simulation.id}`}
                      simulation={simulation}
                      index={index}
                      expanded={expandedId === simulation.id}
                      onToggle={() => toggle(simulation.id)}
                      detail={details[simulation.id]}
                      note={notes[simulation.id]}
                      onRetryNote={() => retryNote(simulation.id)}
                      onSaveNote={makeSaveNote(simulation.id)}
                      onSaveQuestionComment={makeSaveQuestionComment(
                        simulation.id
                      )}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
