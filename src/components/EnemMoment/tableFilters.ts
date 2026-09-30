import type { ColumnFilterConfig } from '../TableProvider/TableProvider';
import type { EnemMomentFilterOptions } from './types';

/**
 * A searchable, single-choice header filter — the Município and Turma filters
 * of the Momento ENEM tables.
 */
export const listFilter = (
  paramKey: string,
  allLabel: string,
  searchPlaceholder: string,
  options: ReadonlyArray<{ value: string; label: string }>
): ColumnFilterConfig => ({
  paramKey,
  allLabel,
  searchable: true,
  searchPlaceholder,
  options: options.map((option) => ({
    value: option.value,
    label: option.label,
    searchText: option.label,
  })),
});

/** A class as the Turma filter names it: "A (3ª série)", "Sem turma". */
export const classOptionLabel = (
  option: EnemMomentFilterOptions['classes'][number]
) => {
  const name = option.className ?? 'Sem turma';
  return option.schoolYearName ? `${name} (${option.schoolYearName})` : name;
};

/**
 * The single value a filter reports in the table params: a string, or nothing
 * for "all".
 */
export const pickedValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;
