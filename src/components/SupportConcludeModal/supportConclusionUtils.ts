import {
  SUPPORT_CONCLUDED_STATUS,
  type ConcludeSupportTicketRequest,
  type SupportConclusionFormData,
  type SupportConclusionReason,
  type SupportProblemType,
} from '../../types/supportConclusion';

/** Fallback shown when the API error has no message */
export const CONCLUDE_TICKET_ERROR_MESSAGE =
  'Não foi possível concluir o atendimento.';

/**
 * Extracts the API error message (`response.data.message`) of a failed request.
 *
 * @param error - Error thrown by the API client
 * @returns API message, or a generic fallback
 */
export function getConcludeTicketErrorMessage(error: unknown): string {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === 'string' && message
    ? message
    : CONCLUDE_TICKET_ERROR_MESSAGE;
}

/**
 * Finds the selected reason in the catalog.
 *
 * @param reasons - Reasons catalog
 * @param value - Selected reason value
 * @returns The reason, or undefined when nothing (or an unknown value) is selected
 */
export function findConclusionReason(
  reasons: SupportConclusionReason[],
  value: string
): SupportConclusionReason | undefined {
  return reasons.find((reason) => reason.value === value);
}

/**
 * Finds the reason that maps to a backend problem type.
 *
 * @param reasons - Reasons catalog
 * @param problemType - Problem type stored on the ticket, if any
 * @returns The reason, or undefined when the ticket has no known problem type
 */
export function findConclusionReasonByProblemType(
  reasons: SupportConclusionReason[],
  problemType?: SupportProblemType | null
): SupportConclusionReason | undefined {
  return reasons.find((reason) => reason.problemType === problemType);
}

/**
 * Checks whether every required field of the conclusion form is filled:
 * a reason and its sub-reason (when it has any). The description of a
 * reason like "Outros" is optional.
 *
 * @param form - Current form values
 * @param reasons - Reasons catalog
 * @returns True when the ticket can be concluded
 */
export function isConclusionFormValid(
  form: SupportConclusionFormData,
  reasons: SupportConclusionReason[]
): boolean {
  const reason = findConclusionReason(reasons, form.reason);
  if (!reason) return false;
  if (reason.subReasons.length > 0 && !form.subReason) return false;
  return true;
}

/**
 * Builds the `PATCH /support/admin/:id` body that concludes the ticket.
 * The reason description and the internal note go to `notes`, the only
 * free-text field the backend stores.
 *
 * @param form - Valid form values
 * @param reason - Selected reason
 * @returns Request body
 */
export function buildConcludeTicketRequest(
  form: SupportConclusionFormData,
  reason: SupportConclusionReason
): ConcludeSupportTicketRequest {
  const description = reason.requiresDescription ? form.description.trim() : '';
  const notes = [description, form.internalNote.trim()]
    .filter((part) => part.length > 0)
    .join('\n\n');

  return {
    status: SUPPORT_CONCLUDED_STATUS,
    problemType: reason.problemType,
    notes: notes || null,
  };
}
