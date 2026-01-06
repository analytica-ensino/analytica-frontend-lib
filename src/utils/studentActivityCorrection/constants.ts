/**
 * Question status enum for student activity correction
 * Maps from ANSWER_STATUS to a simpler status for UI display
 */
export const QUESTION_STATUS = {
  CORRETA: 'CORRETA',
  INCORRETA: 'INCORRETA',
  EM_BRANCO: 'EM_BRANCO',
  /** Reserved for future use - pending teacher evaluation for essay questions */
  PENDENTE: 'PENDENTE',
} as const;

export type QuestionStatus =
  (typeof QUESTION_STATUS)[keyof typeof QUESTION_STATUS];
