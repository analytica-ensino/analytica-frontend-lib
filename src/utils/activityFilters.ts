import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type { ActivityFiltersData } from '../types/activityFilters';

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

/**
 * Compares two arrays for equality (order-independent)
 * @param a - First array
 * @param b - Second array
 * @param comparator - Optional comparator function. If not provided, uses string conversion and localeCompare
 * @returns true if arrays contain the same elements, false otherwise
 */
function arraysEqual<T>(
  a: T[],
  b: T[],
  comparator?: (x: T, y: T) => number
): boolean {
  if (a.length !== b.length) return false;

  if (comparator) {
    const sortedA = [...a].sort(comparator);
    const sortedB = [...b].sort(comparator);
    return sortedA.every((val, index) => val === sortedB[index]);
  }

  const sortedA = [...a].sort((x, y) => String(x).localeCompare(String(y)));
  const sortedB = [...b].sort((x, y) => String(x).localeCompare(String(y)));
  return sortedA.every((val, index) => val === sortedB[index]);
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
