import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BaseApiClient } from '../types/api';
import type { NoteData, SimulationDetailData } from '../types/simulations';
import { createUseSimulations } from './useSimulations';

/** Lazily loaded question detail of one simulado. */
export interface SimulationDetailState {
  readonly loading: boolean;
  readonly error: string | null;
  readonly data: SimulationDetailData | null;
}

/**
 * Lazily loaded teacher observation of one simulado.
 *
 * `error` exists so a failed request is never shown as "this simulado has no
 * observation": that would offer the teacher an empty field whose save is a
 * create-or-replace, silently overwriting a note they were never shown.
 */
export interface SimulationNoteState {
  readonly loading: boolean;
  readonly error: string | null;
  readonly data: NoteData | null;
}

/** Save handler of one simulado's observation, as the note row expects it. */
export type SaveSimulationNote = (
  text: string,
  file: File | null,
  existingAttachment: string | null
) => Promise<void>;

/**
 * What one simulado card needs from this hook: the two loaded pieces and the
 * three actions on them, already bound to that simulado.
 */
export interface SimulationCardHandlers {
  readonly detail: SimulationDetailState | undefined;
  readonly note: SimulationNoteState | undefined;
  /** Load the observation again after a failed request */
  readonly onRetryNote: () => void;
  readonly onSaveNote: SaveSimulationNote;
  readonly onSaveQuestionComment: (
    questionId: string,
    comment: string
  ) => Promise<void>;
}

export interface UseSimulationCardDetailsParams {
  /** API client used to load and save the per-simulado data */
  readonly api: BaseApiClient;
  /** Enrollment whose simulados are listed; null while there is no student */
  readonly userInstitutionId: string | null;
  /** Whether the modal is open; reopening starts a fresh session */
  readonly isOpen: boolean;
  /**
   * Whether expanding a card loads its questions and observation.
   *
   * Those two come from `/performance/simulations/students/...`, which the
   * backend answers for simulados and activities but not for every activity
   * type. A modal listing a type it does not serve still expands its cards —
   * the stat and content cards travel with the list — but must not ask for a
   * detail that would 404. Default true.
   */
  readonly enabled?: boolean;
}

export interface UseSimulationCardDetailsReturn {
  readonly expandedId: string | null;
  readonly details: Record<string, SimulationDetailState>;
  readonly notes: Record<string, SimulationNoteState>;
  /** Expand or collapse one simulado, loading its data the first time */
  readonly toggle: (simulationId: string) => void;
  /** Load the observation again after a failed request */
  readonly retryNote: (simulationId: string) => void;
  readonly makeSaveNote: (simulationId: string) => SaveSimulationNote;
  readonly makeSaveQuestionComment: (
    simulationId: string
  ) => (questionId: string, comment: string) => Promise<void>;
}

/**
 * Per-simulado detail state of a student's simulados modal.
 *
 * Owns what both modals that list simulados need: which card is expanded, the
 * questions and observation of each expanded card, and the two save actions.
 * The list itself stays with the caller, because each modal gets it from a
 * different endpoint.
 *
 * Responses are tagged with a session. The session changes whenever the modal
 * opens, the student changes or the API client changes, and a response from an
 * older session is dropped instead of written into the current one.
 *
 * @param params - API client, the enrollment being shown and the open flag
 * @returns Expanded card, loaded details and notes, and the actions on them
 *
 * @example
 * ```tsx
 * const { expandedId, details, notes, toggle } = useSimulationCardDetails({
 *   api,
 *   userInstitutionId: student?.userInstitutionId ?? null,
 *   isOpen,
 * });
 * ```
 */
export function useSimulationCardDetails({
  api,
  userInstitutionId,
  isOpen,
  enabled = true,
}: UseSimulationCardDetailsParams): UseSimulationCardDetailsReturn {
  const useSimulations = useMemo(() => createUseSimulations(api), [api]);
  const {
    fetchSimulationDetail,
    fetchNote,
    uploadNoteAttachment,
    saveNote,
    saveQuestionComment,
  } = useSimulations();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, SimulationDetailState>>(
    {}
  );
  const [notes, setNotes] = useState<Record<string, SimulationNoteState>>({});

  // Guards state updates against the modal unmounting mid-request.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Bumped on every new session, so a slow response from the previous student
  // (or from a replaced API client) is dropped instead of written into the
  // current one.
  const sessionRef = useRef(0);
  useEffect(() => {
    sessionRef.current += 1;
    setExpandedId(null);
    setDetails({});
    setNotes({});
  }, [isOpen, userInstitutionId, api]);

  const isStale = useCallback(
    (session: number) => !mountedRef.current || sessionRef.current !== session,
    []
  );

  const loadDetail = useCallback(
    (enrollmentId: string, simulationId: string) => {
      const session = sessionRef.current;
      setDetails((previous) => ({
        ...previous,
        [simulationId]: { loading: true, error: null, data: null },
      }));
      fetchSimulationDetail(enrollmentId, simulationId)
        .then((data) => {
          if (isStale(session)) return;
          setDetails((previous) => ({
            ...previous,
            [simulationId]: { loading: false, error: null, data },
          }));
        })
        .catch(() => {
          if (isStale(session)) return;
          setDetails((previous) => ({
            ...previous,
            [simulationId]: {
              loading: false,
              error: 'Erro ao carregar as respostas',
              data: null,
            },
          }));
        });
    },
    [fetchSimulationDetail, isStale]
  );

  const loadNote = useCallback(
    (enrollmentId: string, simulationId: string) => {
      const session = sessionRef.current;
      setNotes((previous) => ({
        ...previous,
        [simulationId]: { loading: true, error: null, data: null },
      }));
      fetchNote(enrollmentId, simulationId)
        .then((data) => {
          if (isStale(session)) return;
          setNotes((previous) => ({
            ...previous,
            [simulationId]: { loading: false, error: null, data },
          }));
        })
        .catch(() => {
          if (isStale(session)) return;
          setNotes((previous) => ({
            ...previous,
            [simulationId]: {
              loading: false,
              error: 'Erro ao carregar a observação',
              data: null,
            },
          }));
        });
    },
    [fetchNote, isStale]
  );

  const toggle = useCallback(
    (simulationId: string) => {
      if (!userInstitutionId) return;
      const next = expandedId === simulationId ? null : simulationId;
      setExpandedId(next);
      // Collapsing loads nothing; so does a list whose items have no detail
      // endpoint behind them (see `enabled`).
      if (!next || !enabled) return;

      // The two requests are guarded separately: a loaded detail must not stop
      // the observation from being fetched, and the other way around.
      if (!details[simulationId]) loadDetail(userInstitutionId, simulationId);
      if (!notes[simulationId]) loadNote(userInstitutionId, simulationId);
    },
    [
      userInstitutionId,
      enabled,
      expandedId,
      details,
      notes,
      loadDetail,
      loadNote,
    ]
  );

  const retryNote = useCallback(
    (simulationId: string) => {
      if (!userInstitutionId) return;
      loadNote(userInstitutionId, simulationId);
    },
    [userInstitutionId, loadNote]
  );

  /**
   * Save the observation of one simulado, uploading a newly chosen file first
   * so only its public URL travels with the note.
   */
  const makeSaveNote = useCallback(
    (simulationId: string): SaveSimulationNote =>
      async (text, file, existingAttachment) => {
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
        if (isStale(session)) return;
        setNotes((previous) => ({
          ...previous,
          [simulationId]: { loading: false, error: null, data: saved },
        }));
      },
    [userInstitutionId, uploadNoteAttachment, saveNote, isStale]
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
      if (isStale(session)) return;
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
    [userInstitutionId, saveQuestionComment, isStale]
  );

  return {
    expandedId,
    details,
    notes,
    toggle,
    retryNote,
    makeSaveNote,
    makeSaveQuestionComment,
  };
}
