import { StatusBadgeConfig } from '@/types/activityDetails';
import { ANSWER_STATUS } from '../../components/Quiz/useQuizStore';
import { QUESTION_STATUS, type QuestionStatus } from './constants';
import type { CorrectionQuestionData } from './types';

/**
 * Returns whether the answer is correct, incorrect, or null based on the answer status.
 * @param answerStatus - Answer status from ANSWER_STATUS enum
 * @returns Returns true for correct, false for incorrect, or null if undefined.
 */
export const getIsCorrect = (answerStatus: ANSWER_STATUS): boolean | null => {
  if (answerStatus === ANSWER_STATUS.RESPOSTA_CORRETA) return true;
  if (answerStatus === ANSWER_STATUS.RESPOSTA_INCORRETA) return false;
  return null;
};

/**
 * Map ANSWER_STATUS from Quiz to QUESTION_STATUS for correction modal
 * @param answerStatus - Answer status from QuestionResult
 * @returns QuestionStatus for UI display
 */
export const mapAnswerStatusToQuestionStatus = (
  answerStatus: ANSWER_STATUS
): QuestionStatus => {
  switch (answerStatus) {
    case ANSWER_STATUS.RESPOSTA_CORRETA:
      return QUESTION_STATUS.CORRETA;
    case ANSWER_STATUS.RESPOSTA_INCORRETA:
      return QUESTION_STATUS.INCORRETA;
    case ANSWER_STATUS.NAO_RESPONDIDO:
      return QUESTION_STATUS.EM_BRANCO;
    case ANSWER_STATUS.PENDENTE_AVALIACAO:
      return QUESTION_STATUS.PENDENTE;
    default:
      return QUESTION_STATUS.EM_BRANCO;
  }
};

/**
 * Get question status badge configuration
 * @param status - Question status
 * @returns Badge configuration with label and colors
 */
export const getQuestionStatusBadgeConfig = (status: QuestionStatus) => {
  const configs: Partial<Record<QuestionStatus, StatusBadgeConfig>> = {
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

  const defaultConfig = {
    label: 'Sem categoria',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  };

  return configs[status] ?? defaultConfig;
};

/**
 * Get question status from CorrectionQuestionData
 * Maps the result's answerStatus to QuestionStatus
 * @param questionData - Correction question data
 * @returns QuestionStatus for UI display
 */
export const getQuestionStatusFromData = (
  questionData: CorrectionQuestionData
): QuestionStatus => {
  return mapAnswerStatusToQuestionStatus(questionData.result.answerStatus);
};
