import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useDateTimeHandlers } from './useDateTimeHandlers';
import type { UseDateTimeHandlersReturn } from './useDateTimeHandlers';
import type { StepErrors } from '../../../SendActivityModal/types';

/** Minimal shape required so date/time handlers can update the form */
interface DateTimeFields {
  startDate?: string;
  startTime?: string;
  finalDate?: string;
  finalTime?: string;
}

/**
 * Params for {@link useEditModalForm}.
 */
export interface UseEditModalFormParams<T extends DateTimeFields> {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Extra precondition for loading (e.g. has id + api client). Defaults to true. */
  enabled?: boolean;
  /** Fetches the entity and maps it to the form shape. Should be stable (useCallback). */
  load: () => Promise<T>;
  /** Called when the load fails (e.g. toast + close). Should be stable (useCallback). */
  onLoadError: () => void;
}

/**
 * Return value of {@link useEditModalForm}.
 */
export interface UseEditModalFormReturn<T extends DateTimeFields> {
  formData: T;
  setFormData: Dispatch<SetStateAction<T>>;
  errors: StepErrors;
  setErrors: Dispatch<SetStateAction<StepErrors>>;
  loading: boolean;
  saving: boolean;
  setSaving: Dispatch<SetStateAction<boolean>>;
  updateFormData: (data: Partial<T>) => void;
  dateHandlers: UseDateTimeHandlersReturn;
}

/**
 * Shared plumbing for "quick edit" modals (title/dates): form state, validation
 * errors, loading/saving flags, a merge helper that clears errors, date/time
 * handlers, and a generic load-on-open effect with cancellation.
 *
 * The modal-specific fetch + mapping lives in `load`; the error feedback
 * (toast/close) lives in `onLoadError`.
 *
 * @param params - {@link UseEditModalFormParams}
 * @returns form state and helpers ({@link UseEditModalFormReturn})
 */
export function useEditModalForm<T extends DateTimeFields>({
  isOpen,
  enabled = true,
  load,
  onLoadError,
}: UseEditModalFormParams<T>): UseEditModalFormReturn<T> {
  const [formData, setFormData] = useState<T>({} as T);
  const [errors, setErrors] = useState<StepErrors>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /** Merge a partial into the form and clear any standing validation errors */
  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setErrors({});
  }, []);

  const dateHandlers = useDateTimeHandlers<T>({ setFormData: updateFormData });

  // Keep the latest callbacks in refs so the load effect depends only on
  // [isOpen, enabled] and never loops when callers pass inline functions.
  const loadRef = useRef(load);
  loadRef.current = load;
  const onLoadErrorRef = useRef(onLoadError);
  onLoadErrorRef.current = onLoadError;

  useEffect(() => {
    if (!isOpen || !enabled) return;

    let active = true;
    const run = async () => {
      setLoading(true);
      setErrors({});
      try {
        const data = await loadRef.current();
        if (active) setFormData(data);
      } catch {
        if (active) onLoadErrorRef.current();
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [isOpen, enabled]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    loading,
    saving,
    setSaving,
    updateFormData,
    dateHandlers,
  };
}
