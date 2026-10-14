import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import Text from '../Text/Text';
import useToastStore from '../Toast/utils/ToastStore';
import { cn } from '../../utils/utils';

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
 * Tag chips with an inline "+ Adicionar" input. Enter creates the tag,
 * Esc cancels. Tags already present are ignored.
 */
export const TagList = ({
  tags,
  onAdd,
  onRemove,
  readOnly = false,
  emptyLabel,
  label,
}: {
  tags: string[];
  onAdd?: (tag: string) => void;
  onRemove?: (tag: string) => void;
  readOnly?: boolean;
  /** Chip shown when there are no tags (e.g. "sem tags") */
  emptyLabel?: string;
  /** Accessible name of the list */
  label: string;
}) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const close = () => {
    setAdding(false);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const tag = draft.trim();
    if (tag && !tags.includes(tag)) onAdd?.(tag);
    close();
  };

  const canEdit = !readOnly && Boolean(onAdd);
  const chipClasses =
    'inline-flex items-center gap-1 rounded bg-background-100 px-2 py-1 text-xs text-text-950';

  return (
    <ul aria-label={label} className="flex flex-wrap items-center gap-1.5">
      {tags.length === 0 && emptyLabel && (
        <li className={cn(chipClasses, 'text-text-600')}>{emptyLabel}</li>
      )}
      {tags.map((tag) => (
        <li key={tag} className={chipClasses}>
          {tag}
          {!readOnly && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(tag)}
              aria-label={`Remover tag ${tag}`}
              className="rounded-sm text-text-600 hover:text-text-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
            >
              <XIcon size={10} weight="bold" aria-hidden="true" />
            </button>
          )}
        </li>
      ))}
      {canEdit && (
        <li>
          {adding ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={close}
              aria-label="Nova tag"
              placeholder="Nova tag"
              className="w-24 rounded border border-border-200 bg-background px-2 py-1 text-xs text-text-950 placeholder:text-text-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded border border-dashed border-border-300 px-2 py-1 text-xs text-text-600 hover:text-text-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
            >
              + Adicionar
            </button>
          )}
        </li>
      )}
    </ul>
  );
};

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
        addToast({ title: 'Salvo', action: 'success' });
      } catch {
        setCurrent(previous);
        addToast({
          title: 'Não foi possível salvar',
          description: 'A alteração foi desfeita. Tente novamente.',
          action: 'warning',
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
