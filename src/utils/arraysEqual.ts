/**
 * Compares two arrays for equality (order-independent)
 * @param a - First array
 * @param b - Second array
 * @param comparator - Optional comparator function. If not provided, uses string conversion and localeCompare
 * @returns true if arrays contain the same elements, false otherwise
 */
export function arraysEqual<T>(
  a: T[],
  b: T[],
  comparator?: (x: T, y: T) => number
): boolean {
  if (a.length !== b.length) return false;

  if (a.length === 0 && b.length === 0) return true;

  if (comparator) {
    const sortedA = [...a].sort(comparator);
    const sortedB = [...b].sort(comparator);
    return sortedA.every((val, index) => val === sortedB[index]);
  }

  const sortedA = [...a].sort((x, y) => String(x).localeCompare(String(y)));
  const sortedB = [...b].sort((x, y) => String(x).localeCompare(String(y)));
  return sortedA.every((val, index) => val === sortedB[index]);
}
