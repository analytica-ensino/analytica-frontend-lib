import { StatusBadgeConfig } from '@/types/activityDetails';
import {
  ANSWER_STATUS,
  QUESTION_TYPE,
} from '../../components/Quiz/useQuizStore';
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
 * Check if question can be auto-validated based on options
 * @param questionData - Correction question data
 * @returns true if can auto-validate, false otherwise
 */
export const canAutoValidate = (
  questionData: CorrectionQuestionData
): boolean => {
  const { result } = questionData;

  // Only auto-validate for types that have options with isCorrect
  const autoValidatableTypes = [
    QUESTION_TYPE.ALTERNATIVA,
    QUESTION_TYPE.MULTIPLA_ESCOLHA,
    QUESTION_TYPE.VERDADEIRO_FALSO,
  ];

  if (!autoValidatableTypes.includes(result.questionType)) {
    return false;
  }

  // Check if options have isCorrect defined
  return (
    result.options !== undefined &&
    result.options.some(
      (op) => op.isCorrect !== undefined && op.isCorrect !== null
    )
  );
};

type Option = {
  id: string;
  option: string;
  isCorrect: boolean;
};

/**
 * Validate alternativa (single choice) question
 * Must select exactly one correct option
 */
const validateAlternativa = (
  selected: Set<string>,
  options: Option[]
): ANSWER_STATUS => {
  if (selected.size !== 1) return ANSWER_STATUS.RESPOSTA_INCORRETA;

  const [selectedId] = selected;
  return options.find((o) => o.id === selectedId)?.isCorrect
    ? ANSWER_STATUS.RESPOSTA_CORRETA
    : ANSWER_STATUS.RESPOSTA_INCORRETA;
};

/**
 * Validate multipla escolha (multiple choice) question
 * Each option must match its correct state: selected if correct, not selected if incorrect
 */
const validateMultiplaEscolha = (
  selected: Set<string>,
  options: Option[]
): ANSWER_STATUS => {
  const allMatch = options.every((op) => selected.has(op.id) === op.isCorrect);

  return allMatch
    ? ANSWER_STATUS.RESPOSTA_CORRETA
    : ANSWER_STATUS.RESPOSTA_INCORRETA;
};

/**
 * Validate verdadeiro/falso (true/false) question
 * Each statement is evaluated individually: if statement is true, must be selected;
 * if statement is false, must not be selected
 */
const validateVerdadeiroFalso = validateMultiplaEscolha;

const validators: Partial<
  Record<QUESTION_TYPE, (s: Set<string>, o: Option[]) => ANSWER_STATUS>
> = {
  [QUESTION_TYPE.ALTERNATIVA]: validateAlternativa,
  [QUESTION_TYPE.MULTIPLA_ESCOLHA]: validateMultiplaEscolha,
  [QUESTION_TYPE.VERDADEIRO_FALSO]: validateVerdadeiroFalso,
};

/**
 * Auto-validate question based on selected options vs correct options
 * @param questionData - Correction question data
 * @returns ANSWER_STATUS if can determine, null otherwise
 */
export const autoValidateQuestion = (
  questionData: CorrectionQuestionData
): ANSWER_STATUS | null => {
  const { result } = questionData;

  if (!canAutoValidate(questionData) || !result.options) return null;

  const selected = new Set(
    result.selectedOptions?.map((o) => o.optionId) ?? []
  );

  if (selected.size === 0) return ANSWER_STATUS.NAO_RESPONDIDO;

  const validator = validators[result.questionType];
  if (!validator) return null;

  return validator(selected, result.options);
};

/**
 * Get question status from CorrectionQuestionData
 * Maps the result's answerStatus to QuestionStatus
 * If status is PENDENTE_AVALIACAO but can auto-validate, calculates status automatically
 * @param questionData - Correction question data
 * @returns QuestionStatus for UI display
 */
export const getQuestionStatusFromData = (
  questionData: CorrectionQuestionData
): QuestionStatus => {
  const { result } = questionData;

  // If pending evaluation, try to auto-validate
  if (
    result.answerStatus === ANSWER_STATUS.PENDENTE_AVALIACAO &&
    canAutoValidate(questionData)
  ) {
    const autoValidatedStatus = autoValidateQuestion(questionData);
    if (autoValidatedStatus !== null) {
      return mapAnswerStatusToQuestionStatus(autoValidatedStatus);
    }
  }

  return mapAnswerStatusToQuestionStatus(result.answerStatus);
};
