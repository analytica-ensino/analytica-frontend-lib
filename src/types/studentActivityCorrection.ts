/**
 * Student Activity Correction Module
 *
 * This module provides types, utilities, and converters for student activity correction.
 * The module is split into multiple files for better organization:
 * - types: TypeScript interfaces and types
 * - constants: Enums and constants
 * - utils: Helper functions
 * - converter: Data transformation functions
 *
 * @module studentActivityCorrection
 */

// Re-export types
export type {
  EssayQuestionCorrection,
  CorrectionQuestionData,
  StudentQuestion,
  StudentActivityCorrectionData,
  SaveQuestionCorrectionPayload,
  QuestionsAnswersByStudentResponse,
} from './studentActivityCorrection.types';

// Re-export constants
export {
  QUESTION_STATUS,
  type QuestionStatus,
} from './studentActivityCorrection.constants';

// Re-export utilities
export {
  getIsCorrect,
  mapAnswerStatusToQuestionStatus,
  getQuestionStatusBadgeConfig,
  getQuestionStatusFromData,
} from '../utils/studentActivityCorrectionUtils';

// Re-export converter
export { convertApiResponseToCorrectionData } from '../utils/studentActivityCorrectionConverter';
