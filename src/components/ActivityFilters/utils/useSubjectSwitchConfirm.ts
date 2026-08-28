import { useCallback, useEffect, useRef, useState } from 'react';

const noop = () => {};

/**
 * Props ready to be spread onto an `AlertDialog`.
 */
export interface SubjectSwitchConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  cancelButtonLabel: string;
  submitButtonLabel: string;
  submitAction: 'negative';
  closeOnBackdropClick: false;
  closeOnEscape: false;
  onChangeOpen: (open: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface UseSubjectSwitchConfirmParams {
  /** How many questions/lessons are currently in the preview */
  itemCount: number;
  /** Called when the user confirms — should empty the preview */
  onConfirmClear: () => void;
  /** Builds the dialog copy for the subject the user is switching to */
  buildDescription: (nextSubjectId: string | null) => string;
  /** Dialog title */
  title?: string;
  cancelButtonLabel?: string;
  submitButtonLabel?: string;
}

export interface UseSubjectSwitchConfirmResult {
  /**
   * Gate to run before applying a subject change.
   *
   * Resolves `true` when the change may proceed (nothing in the preview, or the
   * user confirmed discarding it) and `false` when the user backed out.
   */
  requestSubjectChange: (nextSubjectId: string | null) => Promise<boolean>;
  alertDialogProps: SubjectSwitchConfirmDialogProps;
}

/**
 * Confirmation gate for switching the selected subject.
 *
 * An activity/recommended class is bound to a single subject, so swapping it
 * while questions or lessons are already in the preview would mix subjects and
 * get rejected by the backend. This hook asks the user to confirm discarding
 * the preview before the swap goes through.
 *
 * @param params - Item count, clear callback and dialog copy
 * @returns The gate to call before applying a change plus the dialog props
 *
 * @example
 * ```tsx
 * const { requestSubjectChange, alertDialogProps } = useSubjectSwitchConfirm({
 *   itemCount: questions.length,
 *   onConfirmClear: handleRemoveAll,
 *   buildDescription: (next) => `...`,
 * });
 *
 * <ActivityFilters onBeforeSubjectChange={requestSubjectChange} />
 * <AlertDialog {...alertDialogProps} />
 * ```
 */
export function useSubjectSwitchConfirm({
  itemCount,
  onConfirmClear,
  buildDescription,
  title = 'Trocar de componente curricular?',
  cancelButtonLabel = 'Cancelar',
  submitButtonLabel = 'Remover e trocar',
}: UseSubjectSwitchConfirmParams): UseSubjectSwitchConfirmResult {
  // `undefined` means "no pending request"; `null` is a pending clear.
  const [pendingSubjectId, setPendingSubjectId] = useState<
    string | null | undefined
  >(undefined);
  const resolverRef = useRef<((allowed: boolean) => void) | null>(null);

  // Read through refs so `requestSubjectChange` keeps a stable identity — it is
  // passed down as a prop and stored inside child components.
  const itemCountRef = useRef(itemCount);
  const onConfirmClearRef = useRef(onConfirmClear);
  useEffect(() => {
    itemCountRef.current = itemCount;
    onConfirmClearRef.current = onConfirmClear;
  }, [itemCount, onConfirmClear]);

  const settle = useCallback((allowed: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setPendingSubjectId(undefined);
    resolve?.(allowed);
  }, []);

  const requestSubjectChange = useCallback(
    (nextSubjectId: string | null) => {
      if (itemCountRef.current === 0) {
        return Promise.resolve(true);
      }

      // Defensive: never leave an earlier request hanging.
      settle(false);

      setPendingSubjectId(nextSubjectId);
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    [settle]
  );

  // Don't leave a caller awaiting forever if the component goes away.
  useEffect(() => {
    return () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    };
  }, []);

  const handleSubmit = useCallback(() => {
    onConfirmClearRef.current();
    settle(true);
  }, [settle]);

  const handleCancel = useCallback(() => settle(false), [settle]);

  const isOpen = pendingSubjectId !== undefined;

  return {
    requestSubjectChange,
    alertDialogProps: {
      isOpen,
      title,
      description: isOpen ? buildDescription(pendingSubjectId ?? null) : '',
      cancelButtonLabel,
      submitButtonLabel,
      submitAction: 'negative',
      // The dialog is a decision point: the two buttons are the only exits, so
      // `onChangeOpen` never fires on its own and settling stays deterministic.
      closeOnBackdropClick: false,
      closeOnEscape: false,
      onChangeOpen: noop,
      onSubmit: handleSubmit,
      onCancel: handleCancel,
    },
  };
}
