/**
 * Question status enum for student activity correction
 */
export const QUESTION_STATUS = {
  CORRETA: 'CORRETA',
  INCORRETA: 'INCORRETA',
  EM_BRANCO: 'EM_BRANCO',
} as const;

export type QuestionStatus =
  (typeof QUESTION_STATUS)[keyof typeof QUESTION_STATUS];

/**
 * Student question data interface
 */
export interface StudentQuestion {
  questionNumber: number;
  status: QuestionStatus;
  studentAnswer?: string;
  correctAnswer?: string;
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
  observation?: string;
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
      bgColor: 'bg-success-200',
      textColor: 'text-success-700',
    },
    [QUESTION_STATUS.INCORRETA]: {
      label: 'Incorreta',
      bgColor: 'bg-error-100',
      textColor: 'text-error-700',
    },
    [QUESTION_STATUS.EM_BRANCO]: {
      label: 'Em branco',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
    },
  };

  return configs[status];
};
