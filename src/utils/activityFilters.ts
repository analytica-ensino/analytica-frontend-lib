import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type { ActivityFiltersData } from '../types/activityFilters';
import { arraysEqual } from './arraysEqual';

/**
 * Extracts selected IDs from knowledge categories by their keys
 * @param categories - Array of category configurations
 * @param keys - Object mapping output keys to category keys
 * @returns Object with extracted selected IDs for each output key
 */
export function getSelectedIdsFromCategories(
  categories: CategoryConfig[],
  keys: Record<string, string>
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const [outputKey, categoryKey] of Object.entries(keys)) {
    const category = categories.find((c) => c.key === categoryKey);
    result[outputKey] = category?.selectedIds || [];
  }

  return result;
}

/**
 * Toggles an item in an array (adds if not present, removes if present)
 * @param array - Current array
 * @param item - Item to toggle
 * @returns New array with item toggled
 */
export function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
}

/**
 * Toggles a single value (returns null if current value, otherwise returns new value)
 * @param currentValue - Current selected value
 * @param newValue - Value to toggle to
 * @returns New value or null if toggling off
 */
export function toggleSingleValue<T>(
  currentValue: T | null,
  newValue: T
): T | null {
  return currentValue === newValue ? null : newValue;
}

export function areFiltersEqual(
  filters1: ActivityFiltersData | null,
  filters2: ActivityFiltersData | null
): boolean {
  if (filters1 === filters2) return true;
  if (!filters1 || !filters2) return false;

  return (
    arraysEqual(filters1.types, filters2.types) &&
    arraysEqual(filters1.bankIds, filters2.bankIds) &&
    arraysEqual(filters1.yearIds, filters2.yearIds) &&
    arraysEqual(filters1.subjectIds, filters2.subjectIds) &&
    arraysEqual(filters1.topicIds, filters2.topicIds) &&
    arraysEqual(filters1.subtopicIds, filters2.subtopicIds) &&
    arraysEqual(filters1.contentIds, filters2.contentIds)
  );
}

/**
 * Type guard to check if an item has a valid id and a bankId within bankIds
 * @param item - The item to validate
 * @param bankIds - Array of valid bank IDs to check against
 * @returns True if item has valid id and bankId that matches bankIds
 */
function isValidBankYearItem(
  item: unknown,
  bankIds: string[]
): item is { id: string; bankId: string } {
  return (
    !!item &&
    typeof (item as { id?: unknown }).id === 'string' &&
    typeof (item as { bankId?: unknown }).bankId === 'string' &&
    bankIds.includes((item as { bankId: string }).bankId)
  );
}

/**
 * Derives year IDs from bank IDs when explicit year IDs are not provided
 * @param yearItens - Array of year items to filter
 * @param bankIds - Array of bank IDs to filter by
 * @param explicitYearIds - Explicitly provided year IDs (takes precedence)
 * @returns Array of year IDs
 */
export function deriveYearIdsFromBankIds(
  yearItens: unknown[],
  bankIds: string[],
  explicitYearIds: string[]
): string[] {
  if (explicitYearIds.length > 0) {
    return explicitYearIds;
  }
  return yearItens
    .filter((item) => isValidBankYearItem(item, bankIds))
    .map((item) => item.id);
}

/**
 * Builds the year IDs to send for a set of selected banks, handling mixed
 * selections: explicitly-selected years are retained for the banks that have
 * them, and every selected bank *without* an explicit year contributes all of
 * its available years (the backend filters only by bank-year, so a bank with no
 * year would otherwise match everything). The result is deduplicated.
 * @param yearItens - Array of year items (each with id/bankId)
 * @param bankIds - Array of selected bank IDs
 * @param explicitYearIds - Year IDs the user explicitly selected
 * @returns Deduplicated array of year IDs
 */
export function mergeYearIdsForSelectedBanks(
  yearItens: unknown[],
  bankIds: string[],
  explicitYearIds: string[]
): string[] {
  const validYears = yearItens.filter((item) =>
    isValidBankYearItem(item, bankIds)
  );
  const explicitSet = new Set(explicitYearIds);
  const result = new Set<string>(explicitYearIds);

  for (const bankId of bankIds) {
    const yearsForBank = validYears.filter((year) => year.bankId === bankId);
    const hasExplicitYear = yearsForBank.some((year) =>
      explicitSet.has(year.id)
    );
    if (!hasExplicitYear) {
      yearsForBank.forEach((year) => result.add(year.id));
    }
  }

  return Array.from(result);
}
