import {
  ANSWER_STATUS,
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
} from '../components/Quiz/useQuizStore';
import { QUESTION_STATUS } from '../types/studentActivityCorrection.constants';
import type { QuestionsAnswersByStudentResponse } from '../types/studentActivityCorrection.types';
import { convertApiResponseToCorrectionData } from './studentActivityCorrectionConverter';

describe('studentActivityCorrectionConverter', () => {
  const createMockAnswer = (
    overrides?: Partial<
      QuestionsAnswersByStudentResponse['data']['answers'][number]
    >
  ): QuestionsAnswersByStudentResponse['data']['answers'][number] => {
    return {
      id: 'answer-1',
      questionId: 'question-1',
      answer: null,
      selectedOptions: [],
      answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      statement: 'Test question statement',
      questionType: QUESTION_TYPE.ALTERNATIVA,
      difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
      solutionExplanation: null,
      correctOption: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      options: [],
      knowledgeMatrix: [],
      teacherFeedback: null,
      attachment: null,
      score: null,
      gradedAt: null,
      gradedBy: null,
      ...overrides,
    };
  };

  const createMockApiResponse = (
    answers: QuestionsAnswersByStudentResponse['data']['answers'],
    statistics?: Partial<QuestionsAnswersByStudentResponse['data']['statistics']>
  ): QuestionsAnswersByStudentResponse => {
    return {
      data: {
        answers,
        statistics: {
          totalAnswered: answers.length,
          correctAnswers: 0,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 0,
          timeSpent: 0,
          ...statistics,
        },
      },
    };
  };

  describe('convertApiResponseToCorrectionData', () => {
    it('should convert API response to StudentActivityCorrectionData', () => {
      const answer = createMockAnswer({
        questionId: 'q1',
        statement: 'What is 2+2?',
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      });

      const apiResponse = createMockApiResponse([answer], {
        correctAnswers: 1,
        incorrectAnswers: 0,
        totalAnswered: 1,
        score: 10.0,
      });

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result).toEqual({
        studentId: 'student-123',
        studentName: 'John Doe',
        score: 10.0,
        correctCount: 1,
        incorrectCount: 0,
        blankCount: 0,
        questions: [
          {
            question: expect.objectContaining({
              id: 'q1',
              statement: 'What is 2+2?',
              questionType: QUESTION_TYPE.ALTERNATIVA,
              answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            }),
            result: answer,
            questionNumber: 1,
            correction: undefined,
          },
        ],
        observation: undefined,
        attachment: undefined,
      });
    });

    it('should include observation and attachment when provided', () => {
      const answer = createMockAnswer();
      const apiResponse = createMockApiResponse([answer]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe',
        'Good work!',
        'https://example.com/attachment.pdf'
      );

      expect(result.observation).toBe('Good work!');
      expect(result.attachment).toBe('https://example.com/attachment.pdf');
    });

    it('should calculate blankCount correctly', () => {
      const answer1 = createMockAnswer({
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      });
      const answer2 = createMockAnswer({
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      });
      const answer3 = createMockAnswer({
        answerStatus: ANSWER_STATUS.NAO_RESPONDIDO,
      });

      const apiResponse = createMockApiResponse([answer1, answer2, answer3], {
        correctAnswers: 1,
        incorrectAnswers: 1,
        totalAnswered: 3,
      });

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.correctCount).toBe(1);
      expect(result.incorrectCount).toBe(1);
      expect(result.blankCount).toBe(1);
    });

    it('should handle multiple questions with correct numbering', () => {
      const answer1 = createMockAnswer({ questionId: 'q1' });
      const answer2 = createMockAnswer({ questionId: 'q2' });
      const answer3 = createMockAnswer({ questionId: 'q3' });

      const apiResponse = createMockApiResponse([answer1, answer2, answer3]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions).toHaveLength(3);
      expect(result.questions[0].questionNumber).toBe(1);
      expect(result.questions[1].questionNumber).toBe(2);
      expect(result.questions[2].questionNumber).toBe(3);
    });

    it('should create correction data for essay questions', () => {
      const answer = createMockAnswer({
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        teacherFeedback: 'Good explanation',
      });

      const apiResponse = createMockApiResponse([answer]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions[0].correction).toEqual({
        isCorrect: null,
        teacherFeedback: 'Good explanation',
      });
    });

    it('should not create correction data for non-essay questions', () => {
      const answer = createMockAnswer({
        questionType: QUESTION_TYPE.ALTERNATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      });

      const apiResponse = createMockApiResponse([answer]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions[0].correction).toBeUndefined();
    });

    it('should set isCorrect to true for correct essay answers', () => {
      const answer = createMockAnswer({
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
        teacherFeedback: 'Excellent',
      });

      const apiResponse = createMockApiResponse([answer]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions[0].correction?.isCorrect).toBe(true);
    });

    it('should set isCorrect to false for incorrect essay answers', () => {
      const answer = createMockAnswer({
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
        teacherFeedback: 'Needs improvement',
      });

      const apiResponse = createMockApiResponse([answer]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions[0].correction?.isCorrect).toBe(false);
    });

    it('should handle empty teacherFeedback for essay questions', () => {
      const answer = createMockAnswer({
        questionType: QUESTION_TYPE.DISSERTATIVA,
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        teacherFeedback: null,
      });

      const apiResponse = createMockApiResponse([answer]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions[0].correction?.teacherFeedback).toBe('');
    });

    it('should handle null score', () => {
      const answer = createMockAnswer();
      const apiResponse = createMockApiResponse([answer], {
        score: null as any,
      });

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.score).toBeNull();
    });

    it('should build Question object with correct structure', () => {
      const answer = createMockAnswer({
        questionId: 'q1',
        statement: 'Test question',
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
        solutionExplanation: 'Explanation text',
        options: [
          {
            id: 'opt1',
            option: 'Option 1',
            isCorrect: true,
          },
          {
            id: 'opt2',
            option: 'Option 2',
            isCorrect: false,
          },
        ],
      });

      const apiResponse = createMockApiResponse([answer]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions[0].question).toEqual({
        id: 'q1',
        statement: 'Test question',
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        difficultyLevel: QUESTION_DIFFICULTY.DIFICIL,
        description: '',
        examBoard: null,
        examYear: null,
        solutionExplanation: 'Explanation text',
        answer: null,
        answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
        options: [
          {
            id: 'opt1',
            option: 'Option 1',
            isCorrect: true,
          },
          {
            id: 'opt2',
            option: 'Option 2',
            isCorrect: false,
          },
        ],
        knowledgeMatrix: [],
        correctOptionIds: ['opt1'],
      });
    });

    it('should handle knowledgeMatrix with null values', () => {
      const answer = createMockAnswer({
        knowledgeMatrix: [
          {
            areaKnowledge: null,
            subject: null,
            topic: null,
            subtopic: null,
            content: null,
          },
        ],
      });

      const apiResponse = createMockApiResponse([answer]);

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions[0].question.knowledgeMatrix[0]).toEqual({
        areaKnowledge: { id: '', name: '' },
        subject: { id: '', name: '', color: '', icon: '' },
        topic: { id: '', name: '' },
        subtopic: { id: '', name: '' },
        content: { id: '', name: '' },
      });
    });

    it('should handle empty answers array', () => {
      const apiResponse = createMockApiResponse([], {
        totalAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
      });

      const result = convertApiResponseToCorrectionData(
        apiResponse,
        'student-123',
        'John Doe'
      );

      expect(result.questions).toHaveLength(0);
      expect(result.correctCount).toBe(0);
      expect(result.incorrectCount).toBe(0);
      expect(result.blankCount).toBe(0);
    });
  });
});

