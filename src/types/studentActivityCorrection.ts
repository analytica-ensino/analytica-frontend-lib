/**
 * Question status enum for student activity correction
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

/**
 * Represents an alternative for a question
 */
export interface QuestionAlternative {
  /** Alternative value (e.g., "A", "B", "C") */
  value: string;
  /** Alternative text content */
  label: string;
  /** Whether this is the correct answer */
  isCorrect: boolean;
}

/**
 * Student question data interface
 */
export interface StudentQuestion {
  questionNumber: number;
  status: QuestionStatus;
  studentAnswer?: string;
  correctAnswer?: string;
  /** Question text content */
  questionText?: string;
  /** List of alternatives (for multiple choice questions) */
  alternatives?: QuestionAlternative[];
}

/**
 * Student activity correction data interface
 */
export interface StudentActivityCorrectionData {
  studentId: string;
  studentName: string;
  score: number | null;
  correctCount: number;
  incorrectCount: number;
  blankCount: number;
  questions: StudentQuestion[];
  /** Teacher observation text */
  observation?: string;
  /** URL of attached file */
  attachment?: string;
}

/**
 * Get question status badge configuration
 * @param status - Question status
 * @returns Badge configuration with label and colors
 */
export const getQuestionStatusBadgeConfig = (status: QuestionStatus) => {
  const configs: Record<
    QuestionStatus,
    { label: string; bgColor: string; textColor: string }
  > = {
    [QUESTION_STATUS.CORRETA]: {
      label: 'Correta',
      bgColor: 'bg-success-background',
      textColor: 'text-success-800',
    },
    [QUESTION_STATUS.INCORRETA]: {
      label: 'Incorreta',
      bgColor: 'bg-error-background',
      textColor: 'text-error-800',
    },
    [QUESTION_STATUS.EM_BRANCO]: {
      label: 'Em branco',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
    },
    [QUESTION_STATUS.PENDENTE]: {
      label: 'Pendente',
      bgColor: 'bg-warning-background',
      textColor: 'text-warning-800',
    },
  };

  return configs[status];
};
