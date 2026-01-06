import type { Question } from '../../components/Quiz/useQuizStore';
import { QUESTION_TYPE } from '../../components/Quiz/useQuizStore';
import type {
  QuestionsAnswersByStudentResponse,
  StudentActivityCorrectionData,
  CorrectionQuestionData,
  EssayQuestionCorrection,
} from './types';
import { getIsCorrect } from './utils';

/**
 * Build Question object from answer data
 * @param answer - Answer data from QuestionResult
 * @returns Question object in Quiz format
 */
const buildQuestionFromAnswer = (
  answer: QuestionsAnswersByStudentResponse['data']['answers'][number]
): Question => {
  return {
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
      answer.options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) || [],
  };
};

/**
 * Build correction data for essay questions
 * @param answer - Answer data from QuestionResult
 * @returns EssayQuestionCorrection if question is DISSERTATIVA, undefined otherwise
 */
const buildEssayCorrection = (
  answer: QuestionsAnswersByStudentResponse['data']['answers'][number]
): EssayQuestionCorrection | undefined => {
  if (answer.questionType === QUESTION_TYPE.DISSERTATIVA) {
    return {
      isCorrect: getIsCorrect(answer.answerStatus),
      teacherFeedback: answer.teacherFeedback || '',
    };
  }
  return undefined;
};

/**
 * Convert a single answer to CorrectionQuestionData format
 * @param answer - Answer data from QuestionResult
 * @param index - Index of the answer (0-based)
 * @returns CorrectionQuestionData formatted for the modal
 */
const convertAnswerToQuestionData = (
  answer: QuestionsAnswersByStudentResponse['data']['answers'][number],
  index: number
): CorrectionQuestionData => {
  const question = buildQuestionFromAnswer(answer);
  const correction = buildEssayCorrection(answer);

  return {
    question,
    result: answer,
    questionNumber: index + 1,
    correction,
  };
};

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
  const questions: CorrectionQuestionData[] = answers.map((answer, index) =>
    convertAnswerToQuestionData(answer, index)
  );

  return {
    studentId,
    studentName,
    score: statistics.score ?? null,
    correctCount,
    incorrectCount,
    blankCount,
    questions,
    observation,
    attachment,
  };
};
