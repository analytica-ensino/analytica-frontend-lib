import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { ExamIcon } from '@phosphor-icons/react/dist/csr/Exam';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';
import { MinusCircleIcon } from '@phosphor-icons/react/dist/csr/MinusCircle';
import { PaperclipIcon } from '@phosphor-icons/react/dist/csr/Paperclip';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';
import ProgressBar from '../ProgressBar/ProgressBar';
import { UserIcon } from '../UserIcon/UserIcon';
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
import { cn } from '../../utils/utils';
import { formatQuestionDuration } from '../../utils/questionDuration';
import {
  formatDateToBrazilian,
  formatTimeSpent,
} from '../../utils/activityDetailsUtils';
import type { BaseApiClient } from '../../types/api';
import { createUseSimulations } from '../../hooks/useSimulations';
import type {
  SimulationsListData,
  SimulationDetailData,
  SimulationDetailQuestion,
  StudentSimulationContent,
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

interface DetailState {
  loading: boolean;
  error: string | null;
  data: SimulationDetailData | null;
}

interface NoteState {
  loading: boolean;
  data: NoteData | null;
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

/**
 * Format a 0-100 score as a 0-10 grade with one decimal, pt-BR ("7,1").
 */
function formatScoreOutOfTen(percentage: number): string {
  return (percentage / 10).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

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
// Summary blocks — header, "Dados de simulados", stat and subtema cards
// ---------------------------------------------------------------------------

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
 * The four cards of one simulado: grade, correct, incorrect and blank. The
 * grade card is skipped when the backend did not send a score, so an older
 * API still renders the three counts it always had.
 */
function SimulationStatCards({
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
  readonly content: StudentSimulationContent | null;
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

/** Best/worst subtema pair; "—" when the simulado has no answered content. */
function ContentCards({
  best,
  worst,
}: {
  readonly best: StudentSimulationContent | null;
  readonly worst: StudentSimulationContent | null;
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
 * Header: avatar, name and "Escola • Turma • Ano". The names come from the
 * list response; until it arrives only the name the caller already has shows.
 */
function StudentHeader({
  name,
  student,
}: {
  readonly name: string;
  readonly student: SimulationsListData['student'] | null;
}) {
  const location = [
    student?.school,
    student?.class,
    student?.schoolYear,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className="flex flex-col gap-2 border-b border-border-200 pb-4">
      <div className="flex items-center gap-2">
        <UserIcon size={24} className="shrink-0" />
        <Text size="md" className="min-w-0 flex-1 truncate text-text-950">
          {name}
        </Text>
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

/**
 * "Duração · Nota · Feito em" line of a simulado card. Each segment only joins
 * when its field came in the payload, so an older backend shows a shorter line
 * instead of "undefined".
 */
function buildSimulationMeta(simulation: StudentSimulationItem): string {
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

// ---------------------------------------------------------------------------
// Level 1 — Simulation
// ---------------------------------------------------------------------------

/**
 * Observation and question list of one simulado, loaded when its card is
 * first expanded.
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
  onSaveNote,
  onSaveQuestionComment,
}: {
  readonly simulation: StudentSimulationItem;
  readonly index: number;
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
  const title = simulation.title?.trim()
    ? simulation.title.trim()
    : `Simulado ${index + 1}`;
  const meta = buildSimulationMeta(simulation);

  return (
    <CardAccordation
      value={simulation.id}
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
              value={simulation.correctCount}
              max={simulation.totalQuestions}
              variant="green"
              size="small"
              className="flex-1"
            />
            <Text size="xs" weight="medium" className="shrink-0 text-text-950">
              {`${simulation.correctCount} de ${simulation.totalQuestions} corretas`}
            </Text>
          </div>
        </div>
      }
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
          onSaveNote={onSaveNote}
          onSaveQuestionComment={onSaveQuestionComment}
        />
      )}
    </CardAccordation>
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
  const {
    fetchStudentSimulations,
    fetchSimulationDetail,
    fetchNote,
    uploadNoteAttachment,
    saveNote,
    saveQuestionComment,
  } = useSimulations();

  const [list, setList] = useState<SimulationsListData | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, DetailState>>({});
  const [notes, setNotes] = useState<Record<string, NoteState>>({});

  // Guards async state updates against the modal unmounting mid-request.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Bumped on every new session (open / student change) so in-flight responses
  // from a previous student are ignored instead of writing into the new one.
  const requestEpochRef = useRef(0);
  useEffect(() => {
    requestEpochRef.current += 1;
  }, [isOpen, student?.userInstitutionId]);

  const isStaleResponse = useCallback(
    (epoch: number) => !mountedRef.current || requestEpochRef.current !== epoch,
    []
  );

  useEffect(() => {
    if (!isOpen || !student) return;

    setList(null);
    setExpandedId(null);
    setDetails({});
    setNotes({});
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

  const handleToggle = useCallback(
    (simulationId: string) => {
      if (!student) return;
      const requestEpoch = requestEpochRef.current;
      const next = expandedId === simulationId ? null : simulationId;
      setExpandedId(next);

      if (next && !details[simulationId]) {
        setDetails((prev) => ({
          ...prev,
          [simulationId]: { loading: true, error: null, data: null },
        }));
        fetchSimulationDetail(student.userInstitutionId, simulationId)
          .then((data) => {
            if (isStaleResponse(requestEpoch)) return;
            setDetails((prev) => ({
              ...prev,
              [simulationId]: { loading: false, error: null, data },
            }));
          })
          .catch(() => {
            if (isStaleResponse(requestEpoch)) return;
            setDetails((prev) => ({
              ...prev,
              [simulationId]: {
                loading: false,
                error: 'Erro ao carregar o simulado',
                data: null,
              },
            }));
          });

        setNotes((prev) => ({
          ...prev,
          [simulationId]: { loading: true, data: null },
        }));
        fetchNote(student.userInstitutionId, simulationId)
          .then((data) => {
            if (isStaleResponse(requestEpoch)) return;
            setNotes((prev) => ({
              ...prev,
              [simulationId]: { loading: false, data },
            }));
          })
          .catch(() => {
            if (isStaleResponse(requestEpoch)) return;
            setNotes((prev) => ({
              ...prev,
              [simulationId]: { loading: false, data: null },
            }));
          });
      }
    },
    [
      student,
      expandedId,
      details,
      fetchSimulationDetail,
      fetchNote,
      isStaleResponse,
    ]
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
        if (!student) return;
        const requestEpoch = requestEpochRef.current;
        const attachment = file
          ? await uploadNoteAttachment(file)
          : existingAttachment;
        const saved = await saveNote(
          student.userInstitutionId,
          simulationId,
          text,
          attachment
        );
        if (isStaleResponse(requestEpoch)) return;
        setNotes((prev) => ({
          ...prev,
          [simulationId]: { loading: false, data: saved },
        }));
      },
    [student, uploadNoteAttachment, saveNote, isStaleResponse]
  );

  /**
   * Save a comment on one question and reflect it in the loaded detail, so the
   * field's saved value matches what the server now holds without a refetch.
   */
  const makeSaveQuestionComment = useCallback(
    (simulationId: string) => async (questionId: string, comment: string) => {
      if (!student) return;
      const requestEpoch = requestEpochRef.current;
      const saved = await saveQuestionComment(
        student.userInstitutionId,
        simulationId,
        questionId,
        comment
      );
      if (isStaleResponse(requestEpoch)) return;
      setDetails((prev) => {
        const current = prev[simulationId];
        if (!current?.data) return prev;
        return {
          ...prev,
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
    [student, saveQuestionComment, isStaleResponse]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulados" size="xl">
      {student && (
        <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto pr-1">
          <StudentHeader name={student.name} student={list?.student ?? null} />

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
                      onToggle={() => handleToggle(simulation.id)}
                      detail={details[simulation.id]}
                      note={notes[simulation.id]}
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
