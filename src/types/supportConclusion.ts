/**
 * Support (SAC) ticket conclusion types
 */

/**
 * Problem type stored on the ticket (backend `support.problem_type`).
 * The backend requires one before a ticket can move to `FECHADO`.
 */
export const SUPPORT_PROBLEM_TYPE = {
  OTHER: 'OUTROS',
  LOGIN: 'PROBLEMA_LOGIN',
  CONTENT: 'PROBLEMA_CONTEUDO',
  QUESTION_ERROR: 'ERRO_QUESTAO',
  PLATFORM_ERROR: 'ERRO_PLATAFORMA',
} as const;

export type SupportProblemType =
  (typeof SUPPORT_PROBLEM_TYPE)[keyof typeof SUPPORT_PROBLEM_TYPE];

/**
 * Backend status value of a concluded ticket ("Resolvido" in the backoffice)
 */
export const SUPPORT_CONCLUDED_STATUS = 'FECHADO' as const;

/**
 * Answer to "Resolvido?" in the conclusion modal
 */
export const SUPPORT_CONCLUSION_OUTCOME = {
  RESOLVED: 'RESOLVED',
  NOT_RESOLVED_FORWARDED: 'NOT_RESOLVED_FORWARDED',
  NO_USER_RESPONSE: 'NO_USER_RESPONSE',
} as const;

export type SupportConclusionOutcome =
  (typeof SUPPORT_CONCLUSION_OUTCOME)[keyof typeof SUPPORT_CONCLUSION_OUTCOME];

/**
 * Sub-reason of a conclusion reason
 */
export interface SupportConclusionSubReason {
  value: string;
  label: string;
}

/**
 * Reason (category) used to classify a concluded ticket
 */
export interface SupportConclusionReason {
  value: string;
  label: string;
  /** Problem type sent to the backend */
  problemType: SupportProblemType;
  subReasons: SupportConclusionSubReason[];
  /** Requires a free-text description (e.g. "Outros") */
  requiresDescription?: boolean;
  /** Offers the "Abrir ticket técnico" option (platform errors) */
  suggestsTechTicket?: boolean;
}

/**
 * Values collected by the conclusion modal
 */
export interface SupportConclusionFormData {
  reason: string;
  subReason: string;
  description: string;
  outcome: SupportConclusionOutcome;
  internalNote: string;
  suggestFaq: boolean;
  openTechTicket: boolean;
}

/**
 * Body of `PATCH /support/admin/:id` used to conclude a ticket
 */
export interface ConcludeSupportTicketRequest {
  status: typeof SUPPORT_CONCLUDED_STATUS;
  problemType: SupportProblemType;
  notes: string | null;
}
