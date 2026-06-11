/**
 * Extract error message from an unknown error
 *
 * @param err - The caught error
 * @param fallbackMessage - Default message if error is not an Error instance
 * @returns The error message string
 */
export function getErrorMessage(err: unknown, fallbackMessage: string): string {
  return err instanceof Error ? err.message : fallbackMessage;
}
