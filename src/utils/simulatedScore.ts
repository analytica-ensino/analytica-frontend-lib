/**
 * Format a 0-100 score as a 0-10 grade with one decimal, in pt-BR.
 *
 * The simulados stack carries scores as percentages, while every screen shows
 * them as a grade out of ten. Keeping the conversion in one place is what stops
 * the modal, the table and the cards from rounding differently.
 *
 * @param percentage - Score in the 0-100 scale
 * @returns The grade as a pt-BR string, e.g. `'7,1'`
 *
 * @example
 * ```typescript
 * formatScoreOutOfTen(71.25); // '7,1'
 * formatScoreOutOfTen(100);   // '10,0'
 * ```
 */
export function formatScoreOutOfTen(percentage: number): string {
  return (percentage / 10).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
