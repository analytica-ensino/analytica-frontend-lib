import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UserCircle } from 'phosphor-react';
import Modal from '../Modal/Modal';
import Text from '../Text/Text';
import Button from '../Button/Button';
import TextArea from '../TextArea/TextArea';
import { CardAccordation } from '../Accordation';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { StatCard } from '../shared/StatCard';
import { AlternativesList } from '../Alternative/Alternative';
import { HtmlMathRenderer } from '../HtmlMathRenderer';
import { OptionStatus } from '../../enums/Options';
import {
  getQuestionStatusBadgeConfig,
  QUESTION_STATUS,
  type QuestionStatus,
} from '../../utils/studentActivityCorrection';
import { cn } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import { createUseSimulations } from '../../hooks/useSimulations';
import type {
  SimulationsListData,
  SimulationDetailData,
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
};

// ---------------------------------------------------------------------------
// Level 2 — Question (reuses the shared alternatives renderer + status badge)
// ---------------------------------------------------------------------------

function QuestionItem({
  question,
  index,
}: {
  readonly question: SimulationDetailQuestion;
  readonly index: number;
}) {
  const badge = getQuestionStatusBadgeConfig(
    QUESTION_STATUS_MAP[question.status]
  );

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

  return (
    <CardAccordation
      value={question.questionId}
      trigger={
        <div className="flex flex-1 items-center justify-between gap-3 py-3">
          <Text size="sm" weight="bold" className="text-text-950">
            Questão {index + 1}
          </Text>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
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
          value={`${question.questionId}-options`}
          trigger={
            <div className="flex-1 py-2">
              <Text size="sm" weight="medium" className="text-text-950">
                Alternativas
              </Text>
            </div>
          }
          contentClassName="px-3 pb-3"
        >
          <AlternativesList
            mode="readonly"
            layout="compact"
            name={`question-${question.questionId}`}
            alternatives={alternatives}
            selectedValue={question.selectedOptionId ?? ''}
          />
        </CardAccordation>
      </div>
    </CardAccordation>
  );
}

// ---------------------------------------------------------------------------
// Note ("Observação")
// ---------------------------------------------------------------------------

function NoteRow({
  note,
  loading,
  onSave,
}: {
  readonly note: NoteData | null;
  readonly loading: boolean;
  readonly onSave: (text: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setDraft(note?.note ?? '');
    setError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } catch {
      // Keep the editing UI open (draft preserved) and surface the failure.
      setError('Erro ao salvar a observação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonCard className="h-14" />;
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border-200 p-3">
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
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => setEditing(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            size="small"
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border-200 p-3">
      <div className="flex min-w-0 flex-col">
        <Text size="sm" weight="bold" className="text-text-950">
          Observação
        </Text>
        {note?.note && (
          <Text size="sm" className="truncate text-text-700">
            {note.note}
          </Text>
        )}
      </div>
      <Button variant="solid" size="small" onClick={startEditing}>
        {note?.note ? 'Editar' : 'Incluir'}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Level 1 — Simulation
// ---------------------------------------------------------------------------

function SimulationItem({
  simulation,
  index,
  expanded,
  onToggle,
  detail,
  note,
  onSaveNote,
}: {
  readonly simulation: StudentSimulationItem;
  readonly index: number;
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly detail: DetailState | undefined;
  readonly note: NoteState | undefined;
  readonly onSaveNote: (text: string) => Promise<void>;
}) {
  return (
    <CardAccordation
      value={simulation.id}
      expanded={expanded}
      onToggleExpanded={onToggle}
      trigger={
        <div className="flex-1 py-4">
          <Text weight="bold" className="text-text-950">
            {simulation.title?.trim()
              ? simulation.title.trim()
              : `Simulado ${index + 1}`}
          </Text>
        </div>
      }
      contentClassName="px-3 pb-4"
    >
      {detail?.loading && <SkeletonCard className="h-40" />}
      {detail?.error && (
        <Text size="sm" className="text-error-600">
          {detail.error}
        </Text>
      )}
      {detail?.data && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <StatCard
              label="Nº de questões corretas"
              value={detail.data.counts.correct}
              variant="correct"
              className="flex-1"
            />
            <StatCard
              label="Nº de questões incorretas"
              value={detail.data.counts.incorrect}
              variant="incorrect"
              className="flex-1"
            />
            <StatCard
              label="Nº de questões em branco"
              value={detail.data.counts.blank}
              variant="blank"
              className="flex-1"
            />
          </div>

          <NoteRow
            note={note?.data ?? null}
            loading={note?.loading ?? false}
            onSave={onSaveNote}
          />

          <div className="flex flex-col gap-2">
            <Text weight="bold" className="text-text-950">
              Respostas
            </Text>
            {detail.data.questions.map((question, qIndex) => (
              <QuestionItem
                key={question.questionId}
                question={question}
                index={qIndex}
              />
            ))}
          </div>
        </div>
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
    saveNote,
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

  const makeSaveNote = useCallback(
    (simulationId: string) => async (text: string) => {
      if (!student) return;
      const requestEpoch = requestEpochRef.current;
      const saved = await saveNote(
        student.userInstitutionId,
        simulationId,
        text
      );
      if (isStaleResponse(requestEpoch)) return;
      setNotes((prev) => ({
        ...prev,
        [simulationId]: { loading: false, data: saved },
      }));
    },
    [student, saveNote, isStaleResponse]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulados" size="xl">
      {student && (
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <UserCircle size={24} weight="fill" className="text-info-700" />
              <Text weight="bold" className="text-text-950">
                {student.name}
              </Text>
            </span>
            <Text size="sm" className="text-info-700">
              {list?.student.simulationsAnswered ?? 0} simulados respondidos
            </Text>
          </div>

          {listLoading && <SkeletonCard className="h-20" />}
          {listError && (
            <Text size="sm" className="text-error-600">
              {listError}
            </Text>
          )}
          {list?.simulations.data.length === 0 && !listLoading && (
            <Text size="sm" className="text-text-600">
              Este estudante ainda não respondeu nenhum simulado.
            </Text>
          )}

          {list && (
            <div className="flex flex-col gap-3">
              {list.simulations.data.map((simulation, index) => (
                <SimulationItem
                  key={simulation.id}
                  simulation={simulation}
                  index={index}
                  expanded={expandedId === simulation.id}
                  onToggle={() => handleToggle(simulation.id)}
                  detail={details[simulation.id]}
                  note={notes[simulation.id]}
                  onSaveNote={makeSaveNote(simulation.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
