import { z } from 'zod';

/**
 * Factory function to create a fetch error handler
 * This reduces code duplication across data fetching hooks
 *
 * @param validationErrorMessage - Message to display for Zod validation errors
 * @param genericErrorMessage - Message to display for other errors
 * @returns Error handler function that returns appropriate error message
 *
 * @example
 * ```typescript
 * const handleFetchError = createFetchErrorHandler(
 *   'Erro ao validar dados',
 *   'Erro ao carregar dados'
 * );
 *
 * try {
 *   // fetch data
 * } catch (error) {
 *   const errorMessage = handleFetchError(error);
 * }
 * ```
 */
export const createFetchErrorHandler =
  (validationErrorMessage: string, genericErrorMessage: string) =>
  (error: unknown): string => {
    if (error instanceof z.ZodError) {
      console.error(validationErrorMessage, error);
      return validationErrorMessage;
    }

    console.error(genericErrorMessage, error);
    return genericErrorMessage;
  };
