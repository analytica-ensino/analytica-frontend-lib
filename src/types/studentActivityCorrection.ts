import type {
  Question,
  QuestionResult,
  ANSWER_STATUS,
} from '../components/Quiz/useQuizStore';

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

/**
 * Map ANSWER_STATUS from Quiz to QUESTION_STATUS for correction modal
 * @param answerStatus - Answer status from QuestionResult
 * @returns QuestionStatus for UI display
 */
export const mapAnswerStatusToQuestionStatus = (
  answerStatus: ANSWER_STATUS
): QuestionStatus => {
  switch (answerStatus) {
    case 'RESPOSTA_CORRETA':
      return QUESTION_STATUS.CORRETA;
    case 'RESPOSTA_INCORRETA':
      return QUESTION_STATUS.INCORRETA;
    case 'NAO_RESPONDIDO':
      return QUESTION_STATUS.EM_BRANCO;
    case 'PENDENTE_AVALIACAO':
      return QUESTION_STATUS.PENDENTE;
    default:
      return QUESTION_STATUS.EM_BRANCO;
  }
};

/**
 * Correction data for essay questions (dissertativas)
 * Used for teacher evaluation of essay answers
 */
export interface EssayQuestionCorrection {
  /** Whether the answer is correct (true/false/null for not evaluated) */
  isCorrect: boolean | null;
  /** Teacher observation/feedback */
  teacherFeedback: string;
}

/**
 * Combined question data for correction modal
 * Combines Question (from Quiz format) with QuestionResult answer data
 */
export interface CorrectionQuestionData {
  /** Question data in Quiz format */
  question: Question;
  /** Student answer data from QuestionResult */
  result: QuestionResult['answers'][number];
  /** Question number in the activity (1-indexed) */
  questionNumber: number;
  /** Correction data for essay questions (only for DISSERTATIVA type) */
  correction?: EssayQuestionCorrection;
}

/**
 * Legacy interface for backward compatibility
 * @deprecated Use CorrectionQuestionData instead
 */
export interface StudentQuestion {
  questionNumber: number;
  status: QuestionStatus;
  studentAnswer?: string;
  correctAnswer?: string;
  questionText?: string;
  questionType?: string;
  alternatives?: Array<{
    value: string;
    label: string;
    isCorrect: boolean;
  }>;
  isCorrect?: boolean | null;
  teacherFeedback?: string;
}

/**
 * Student activity correction data interface
 * Uses Quiz format (Question + QuestionResult) for questions
 */
export interface StudentActivityCorrectionData {
  studentId: string;
  studentName: string;
  score: number | null;
  correctCount: number;
  incorrectCount: number;
  blankCount: number;
  /** Questions with their answers in Quiz format */
  questions: CorrectionQuestionData[];
  /** Teacher observation text (general observation for the activity) */
  observation?: string;
  /** URL of attached file */
  attachment?: string;
}

/**
 * Payload for saving question correction (for essay questions)
 */
export interface SaveQuestionCorrectionPayload {
  /** Question ID from Question interface */
  questionId: string;
  /** Question number in the activity (for reference) */
  questionNumber: number;
  /** Whether the answer is correct */
  isCorrect: boolean;
  /** Teacher observation/feedback */
  teacherFeedback?: string;
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

/**
 * API response structure for fetchQuestionsAnswersByStudent
 * Returns student answers and statistics for an activity
 */
export interface QuestionsAnswersByStudentResponse {
  data: QuestionResult;
}

/**
 * Convert QuestionResult from API to StudentActivityCorrectionData
 * This function transforms the API response into the format expected by CorrectActivityModal
 * @param apiResponse - API response with answers and statistics
 * @param studentId - Student ID
 * @param studentName - Student name
 * @param observation - Optional teacher observation
 * @param attachment - Optional attachment URL
 * @returns StudentActivityCorrectionData formatted for the modal
 */
export const convertApiResponseToCorrectionData = (
  apiResponse: QuestionsAnswersByStudentResponse,
  studentId: string,
  studentName: string,
  observation?: string,
  attachment?: string
): StudentActivityCorrectionData => {
  const { answers, statistics } = apiResponse.data;

  // Calculate counts from statistics
  const correctCount = statistics.correctAnswers;
  const incorrectCount = statistics.incorrectAnswers;
  const blankCount = statistics.totalAnswered - correctCount - incorrectCount;

  // Convert answers to CorrectionQuestionData format
  const questions: CorrectionQuestionData[] = answers.map((answer, index) => {
    // Build Question object from answer data
    const question: Question = {
      id: answer.questionId,
      statement: answer.statement,
      questionType: answer.questionType,
      difficultyLevel: answer.difficultyLevel,
      description: '',
      examBoard: null,
      examYear: null,
      solutionExplanation: answer.solutionExplanation || null,
      answer: null,
      answerStatus: answer.answerStatus,
      options: answer.options || [],
      knowledgeMatrix: answer.knowledgeMatrix.map((matrix) => ({
        areaKnowledge: matrix.areaKnowledge || {
          id: '',
          name: '',
        },
        subject: matrix.subject || {
          id: '',
          name: '',
          color: '',
          icon: '',
        },
        topic: matrix.topic || {
          id: '',
          name: '',
        },
        subtopic: matrix.subtopic || {
          id: '',
          name: '',
        },
        content: matrix.content || {
          id: '',
          name: '',
        },
      })),
      correctOptionIds:
        answer.options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) ||
        [],
    };

    // Desacoplando a lógica para determinar isCorrect de forma separada
    function getIsCorrect(answerStatus: string): boolean | null {
      if (answerStatus === 'RESPOSTA_CORRETA') return true;
      if (answerStatus === 'RESPOSTA_INCORRETA') return false;
      return null;
    }

    // Build correction data for essay questions
    const correction: EssayQuestionCorrection | undefined =
      answer.questionType === 'DISSERTATIVA'
        ? {
            isCorrect: getIsCorrect(answer.answerStatus),
            teacherFeedback: answer.teacherFeedback || '',
          }
        : undefined;

    return {
      question,
      result: answer,
      questionNumber: index + 1,
      correction,
    };
  });

  return {
    studentId,
    studentName,
    score: statistics.score || null,
    correctCount,
    incorrectCount,
    blankCount,
    questions,
    observation,
    attachment,
  };
};
