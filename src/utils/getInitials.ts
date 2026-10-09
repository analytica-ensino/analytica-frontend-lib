/**
 * Builds up to two uppercase initials from a person's name
 * (first letter of the first two words).
 *
 * @param name - Full name, e.g. "Marina Costa"
 * @returns Initials, e.g. "MC"; empty string for blank names
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}
