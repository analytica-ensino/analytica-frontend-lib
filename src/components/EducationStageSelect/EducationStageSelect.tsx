import { useEffect } from 'react';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';

/** One "Série" option: the value the API speaks and the label the screen shows. */
export interface EducationStageOption<T extends string> {
  value: T;
  label: string;
}

/**
 * The value the "all" item carries inside the Select. Not an empty string: the
 * Select treats an unresolved value as "show the placeholder", and "Todas as
 * séries" is a pick, not the absence of one.
 */
const ALL_STAGES_VALUE = '__all__';

/**
 * The options to offer, given what the scope actually has.
 *
 * Keeps the order of `options` instead of the caller's `availableStages`, so the
 * séries read in sequence however the scope came back.
 *
 * @param options - Every option, in display order
 * @param availableStages - Stages the scope has; `undefined` means unknown
 * @returns The options to render
 */
const resolveOfferedOptions = <T extends string>(
  options: ReadonlyArray<EducationStageOption<T>>,
  availableStages?: readonly T[]
) => {
  if (!availableStages) return options;
  return options.filter((option) => availableStages.includes(option.value));
};

/**
 * The "Série" select of the report headers: the teaching stage of the classes.
 *
 * Generic over the vocabulary, because the reports speak different ones — the
 * Momento ENEM offers "3ª série regular", EJA and Subsequente (the exam already
 * restricts the year); the Acesso report splits the regular stage by série.
 *
 * Two shapes:
 * - without `allLabel`, a stage is always picked (the Momento ENEM). When the
 *   scope stops offering it, the first offered one takes its place;
 * - with `allLabel`, an "all" item comes first and `null` is "every stage"
 *   (the Acesso report). When the scope stops offering the pick, it goes back
 *   to "all" — a filter the screen no longer shows must not keep narrowing it.
 *
 * A scope with a single option has nothing to pick, so nothing is rendered: an
 * only option is a statement, not a choice, and it invites the manager to look
 * for the others.
 */
export function EducationStageSelect<T extends string>({
  value,
  onChange,
  options,
  availableStages,
  allLabel,
}: Readonly<{
  /** The pick; `null` is "every stage", offered only with `allLabel`. */
  value: T | null;
  onChange: (value: T | null) => void;
  /** Every option, in display order. */
  options: ReadonlyArray<EducationStageOption<T>>;
  /**
   * Stages the scope has, in the options' vocabulary. `undefined` is "not
   * known yet" and keeps every option on offer.
   */
  availableStages?: readonly T[];
  /** Label of the leading "all" item, e.g. "Todas as séries". */
  allLabel?: string;
}>) {
  const offered = resolveOfferedOptions(options, availableStages);
  const valueIsOffered =
    value === null
      ? allLabel !== undefined
      : offered.some((option) => option.value === value);

  /*
    A primitive, and not the options array: `resolveOfferedOptions` filters, so
    it hands back a new array on every render and an effect watching it would
    fire forever. `undefined` is "nothing to correct"; `null` is "go back to
    all". It settles as soon as the pick is corrected.
  */
  let fallback: T | null | undefined;
  if (valueIsOffered) {
    fallback = undefined;
  } else if (allLabel !== undefined) {
    fallback = null;
  } else {
    fallback = offered.length > 0 ? offered[0].value : undefined;
  }

  useEffect(() => {
    if (fallback === undefined) return;
    onChange(fallback);
  }, [fallback, onChange]);

  if (offered.length <= 1) return null;

  return (
    // The width goes on the root, not only on the trigger: the root is
    // `w-full`, and in a header that wraps (the gestor's) a full-width item
    // drops to a line of its own, far from its neighbours.
    <Select
      value={value ?? ALL_STAGES_VALUE}
      onValueChange={(picked) =>
        onChange(picked === ALL_STAGES_VALUE ? null : (picked as T))
      }
      className="w-auto"
    >
      <SelectTrigger className="w-auto min-w-45 gap-2" aria-label="Série">
        <SelectValue placeholder="Série" />
      </SelectTrigger>
      <SelectContent>
        {allLabel !== undefined && (
          <SelectItem value={ALL_STAGES_VALUE}>{allLabel}</SelectItem>
        )}
        {offered.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default EducationStageSelect;
