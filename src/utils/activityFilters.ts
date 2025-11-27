import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';

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
