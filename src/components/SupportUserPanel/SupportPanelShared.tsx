import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Text from '../Text/Text';
import useToastStore from '../Toast/utils/ToastStore';

/** Grey stat tile: small muted label over a bold value */
export const StatTile = ({
  label,
  value,
  valueSize = 'sm',
}: {
  label: string;
  value: ReactNode;
  /** `sm` (14px) on the ticket grid, `md` (16px) on the history summary */
  valueSize?: 'sm' | 'md';
}) => (
  <div className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-background-100 px-3 py-2.5">
    <Text size="xs" color="text-text-600" className="truncate">
      {label}
    </Text>
    <Text
      size={valueSize}
      weight="bold"
      color="text-text-950"
      className="truncate"
    >
      {value}
    </Text>
  </div>
);

/** Section title used above fields (13px / 600) */
export const FieldLabel = ({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) => (
  <Text id={id} size="sm" weight="semibold" color="text-text-950">
    {children}
  </Text>
);

/**
 * Optimistic auto-save: applies the value right away, calls `save`, shows
 * "Salvo" on success and rolls back with an error toast on failure.
 *
 * @param value - Value coming from props (source of truth after a save)
 * @param save - Persists the new value; reject to trigger the rollback
 * @returns The value to render and the setter that saves it
 */
export function useOptimisticValue<T>(
  value: T,
  save: ((next: T) => Promise<void> | void) | undefined
): [T, (next: T) => Promise<void>] {
  const [current, setCurrent] = useState(value);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  const update = useCallback(
    async (next: T) => {
      if (!save) return;
      const previous = current;
      setCurrent(next);
      try {
        await save(next);
        addToast({ title: 'Salvo', action: 'success', position: 'top-right' });
      } catch {
        setCurrent(previous);
        addToast({
          title: 'Não foi possível salvar',
          description: 'A alteração foi desfeita. Tente novamente.',
          action: 'warning',
          position: 'top-right',
        });
      }
    },
    [addToast, current, save]
  );

  return [current, update];
}

/**
 * Current time, refreshed every `intervalMs` while `active` — drives the
 * live wait/total counters of an open ticket.
 */
export function useNow(active: boolean, intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!active) return undefined;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  return now;
}
