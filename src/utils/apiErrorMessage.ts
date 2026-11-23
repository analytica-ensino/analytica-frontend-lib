/**
 * The reason the backend gave for refusing a request (`{ message }` in the
 * body of an Axios-like error), e.g. "Um ou mais alunos não têm acesso aos
 * e-books anexados". The HTTP client's own message ("Request failed with
 * status code 400") says nothing to the user, so it is never returned.
 *
 * @param error - What the request threw
 * @returns The backend's message, or undefined when there is none
 *
 * @example
 * ```typescript
 * addToast({ title: 'Erro', description: getApiErrorMessage(error) ?? fallback });
 * ```
 */
export const getApiErrorMessage = (error: unknown): string | undefined => {
  const message = (
    error as { response?: { data?: { message?: unknown } } } | null
  )?.response?.data?.message;
  return typeof message === 'string' && message.trim() ? message : undefined;
};
