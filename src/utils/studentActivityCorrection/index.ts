/**
 * Student Activity Correction Module
 *
 * This module provides types, utilities, and converters for student activity correction.
 * All exports are centralized here for easy importing.
 *
 * @module studentActivityCorrection
 */

// Export constants
export { QUESTION_STATUS, type QuestionStatus } from './constants';

// Export types
export type {
  QuestionCorrection,
  CorrectionQuestionData,
  StudentQuestion,
  StudentActivityCorrectionData,
  SaveQuestionCorrectionPayload,
  SaveQuestionCommentPayload,
  QuestionsAnswersByStudentResponse,
} from './types';

// Export utilities
export {
  getIsCorrect,
  mapAnswerStatusToQuestionStatus,
  getQuestionStatusBadgeConfig,
  getQuestionStatusFromData,
} from './utils';

// Export the two cards the modal derives from the answers themselves
export { findBestAndWorstSubtopics } from './subtopics';
export { getCorrectionPerformanceTag } from './performanceTag';

// Export converter
export { convertApiResponseToCorrectionData } from './converter';
