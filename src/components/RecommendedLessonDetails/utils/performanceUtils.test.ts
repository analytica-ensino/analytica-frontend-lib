import { ANSWER_STATUS } from '../../Quiz/useQuizStore';
import {
  getIsCorrectFromStatus,
  convertAnswerToLessonQuestion,
  convertActivityToPerformance,
  convertLessonToPerformance,
  convertStudentAnswersToPerformanceData,
  type StudentAnswerData,
  type StudentActivityData,
  type StudentLessonData,
  type StudentAnswersResponse,
} from './performanceUtils';

describe('performanceUtils', () => {
  describe('getIsCorrectFromStatus', () => {
    it('should return true for RESPOSTA_CORRETA status', () => {
      expect(getIsCorrectFromStatus(ANSWER_STATUS.RESPOSTA_CORRETA)).toBe(true);
    });

    it('should return false for RESPOSTA_INCORRETA status', () => {
      expect(getIsCorrectFromStatus(ANSWER_STATUS.RESPOSTA_INCORRETA)).toBe(
        false
      );
    });

    it('should return null for PENDENTE_AVALIACAO status', () => {
      expect(getIsCorrectFromStatus(ANSWER_STATUS.PENDENTE_AVALIACAO)).toBe(
        null
      );
    });

    it('should return null for NAO_RESPONDIDO status', () => {
      expect(getIsCorrectFromStatus(ANSWER_STATUS.NAO_RESPONDIDO)).toBe(null);
    });

    it('should return null for unknown status', () => {
      expect(getIsCorrectFromStatus('UNKNOWN_STATUS')).toBe(null);
    });

    it('should return null for empty string', () => {
      expect(getIsCorrectFromStatus('')).toBe(null);
    });
  });

  describe('convertAnswerToLessonQuestion', () => {
    const baseAnswer: StudentAnswerData = {
      id: 'answer-1',
      questionId: 'question-1',
      answer: 'Test answer',
      selectedOptions: [],
      answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
      statement: 'What is the capital of Brazil?',
      questionType: 'MULTIPLA_ESCOLHA',
      difficultyLevel: 'MEDIUM',
      solutionExplanation: 'Brasília is the capital',
      correctOption: 'option-2',
      teacherFeedback: 'Good job!',
      attachment: null,
      score: 10,
      options: [
        { id: 'option-1', option: 'São Paulo', isCorrect: false },
        { id: 'option-2', option: 'Brasília', isCorrect: true },
        { id: 'option-3', option: 'Rio de Janeiro', isCorrect: false },
      ],
      knowledgeMatrix: [],
    };

    it('should convert answer to LessonQuestion format', () => {
      const result = convertAnswerToLessonQuestion(baseAnswer, 0, 'activity-1');

      expect(result).toEqual({
        id: 'question-1',
        answerId: 'answer-1',
        activityId: 'activity-1',
        title: 'Questão 1',
        statement: 'What is the capital of Brazil?',
        questionType: 'MULTIPLA_ESCOLHA',
        isCorrect: true,
        teacherFeedback: 'Good job!',
        alternatives: [
          {
            id: 'option-1',
            text: 'São Paulo',
            isCorrect: false,
            isSelected: false,
          },
          {
            id: 'option-2',
            text: 'Brasília',
            isCorrect: true,
            isSelected: false,
          },
          {
            id: 'option-3',
            text: 'Rio de Janeiro',
            isCorrect: false,
            isSelected: false,
          },
        ],
      });
    });

    it('should generate correct title based on index', () => {
      const result0 = convertAnswerToLessonQuestion(
        baseAnswer,
        0,
        'activity-1'
      );
      const result1 = convertAnswerToLessonQuestion(
        baseAnswer,
        1,
        'activity-1'
      );
      const result4 = convertAnswerToLessonQuestion(
        baseAnswer,
        4,
        'activity-1'
      );

      expect(result0.title).toBe('Questão 1');
      expect(result1.title).toBe('Questão 2');
      expect(result4.title).toBe('Questão 5');
    });

    it('should handle answer with incorrect status', () => {
      const incorrectAnswer = {
        ...baseAnswer,
        answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
      };

      const result = convertAnswerToLessonQuestion(
        incorrectAnswer,
        0,
        'activity-1'
      );
      expect(result.isCorrect).toBe(false);
    });

    it('should handle answer with pending status', () => {
      const pendingAnswer = {
        ...baseAnswer,
        answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
      };

      const result = convertAnswerToLessonQuestion(
        pendingAnswer,
        0,
        'activity-1'
      );
      expect(result.isCorrect).toBe(null);
    });

    it('should mark selected options correctly', () => {
      const answerWithSelection = {
        ...baseAnswer,
        selectedOptions: [{ optionId: 'option-2' }],
      };

      const result = convertAnswerToLessonQuestion(
        answerWithSelection,
        0,
        'activity-1'
      );

      expect(result.alternatives[0].isSelected).toBe(false);
      expect(result.alternatives[1].isSelected).toBe(true);
      expect(result.alternatives[2].isSelected).toBe(false);
    });

    it('should handle multiple selected options', () => {
      const answerWithMultipleSelections = {
        ...baseAnswer,
        selectedOptions: [{ optionId: 'option-1' }, { optionId: 'option-3' }],
      };

      const result = convertAnswerToLessonQuestion(
        answerWithMultipleSelections,
        0,
        'activity-1'
      );

      expect(result.alternatives[0].isSelected).toBe(true);
      expect(result.alternatives[1].isSelected).toBe(false);
      expect(result.alternatives[2].isSelected).toBe(true);
    });

    it('should handle answer without options', () => {
      const answerWithoutOptions = {
        ...baseAnswer,
        options: undefined,
      };

      const result = convertAnswerToLessonQuestion(
        answerWithoutOptions,
        0,
        'activity-1'
      );
      expect(result.alternatives).toEqual([]);
    });

    it('should handle empty options array', () => {
      const answerWithEmptyOptions = {
        ...baseAnswer,
        options: [],
      };

      const result = convertAnswerToLessonQuestion(
        answerWithEmptyOptions,
        0,
        'activity-1'
      );
      expect(result.alternatives).toEqual([]);
    });

    it('should handle null statement', () => {
      const answerWithNullStatement = {
        ...baseAnswer,
        statement: null as unknown as string,
      };

      const result = convertAnswerToLessonQuestion(
        answerWithNullStatement,
        0,
        'activity-1'
      );
      expect(result.statement).toBe('');
    });

    it('should handle empty statement', () => {
      const answerWithEmptyStatement = {
        ...baseAnswer,
        statement: '',
      };

      const result = convertAnswerToLessonQuestion(
        answerWithEmptyStatement,
        0,
        'activity-1'
      );
      expect(result.statement).toBe('');
    });

    it('should handle null teacherFeedback', () => {
      const answerWithNullFeedback = {
        ...baseAnswer,
        teacherFeedback: null,
      };

      const result = convertAnswerToLessonQuestion(
        answerWithNullFeedback,
        0,
        'activity-1'
      );
      expect(result.teacherFeedback).toBe(null);
    });

    it('should handle options without isCorrect property', () => {
      const answerWithUndefinedIsCorrect = {
        ...baseAnswer,
        options: [
          {
            id: 'option-1',
            option: 'Option A',
            isCorrect: undefined as unknown as boolean,
          },
        ],
      };

      const result = convertAnswerToLessonQuestion(
        answerWithUndefinedIsCorrect,
        0,
        'activity-1'
      );
      expect(result.alternatives[0].isCorrect).toBe(false);
    });

    it('should handle undefined selectedOptions', () => {
      const answerWithUndefinedSelectedOptions = {
        ...baseAnswer,
        selectedOptions: undefined as unknown as Array<{ optionId: string }>,
      };

      const result = convertAnswerToLessonQuestion(
        answerWithUndefinedSelectedOptions,
        0,
        'activity-1'
      );
      expect(result.alternatives[0].isSelected).toBe(false);
    });
  });

  describe('convertActivityToPerformance', () => {
    const baseActivity: StudentActivityData = {
      id: 'activity-1',
      title: 'Atividade de Matemática',
      sequence: 1,
      answers: [
        {
          id: 'answer-1',
          questionId: 'question-1',
          answer: 'A',
          selectedOptions: [{ optionId: 'option-1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          statement: 'What is 2+2?',
          questionType: 'ALTERNATIVA',
          difficultyLevel: 'EASY',
          solutionExplanation: null,
          correctOption: 'option-1',
          teacherFeedback: null,
          attachment: null,
          score: 10,
          options: [
            { id: 'option-1', option: '4', isCorrect: true },
            { id: 'option-2', option: '5', isCorrect: false },
          ],
          knowledgeMatrix: [],
        },
      ],
      statistics: {
        totalAnswered: 1,
        correctAnswers: 1,
        incorrectAnswers: 0,
        pendingAnswers: 0,
        score: 10,
        timeSpent: 120,
      },
    };

    it('should convert activity to PerformanceActivity format', () => {
      const result = convertActivityToPerformance(baseActivity);

      expect(result.id).toBe('activity-1');
      expect(result.title).toBe('Atividade de Matemática');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].id).toBe('question-1');
      expect(result.questions[0].activityId).toBe('activity-1');
    });

    it('should handle activity with multiple answers', () => {
      const activityWithMultipleAnswers: StudentActivityData = {
        ...baseActivity,
        answers: [
          ...baseActivity.answers,
          {
            id: 'answer-2',
            questionId: 'question-2',
            answer: 'B',
            selectedOptions: [],
            answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
            statement: 'What is 3+3?',
            questionType: 'ALTERNATIVA',
            difficultyLevel: 'EASY',
            solutionExplanation: null,
            correctOption: 'option-3',
            teacherFeedback: 'Try again',
            attachment: null,
            score: 0,
            options: [],
            knowledgeMatrix: [],
          },
        ],
      };

      const result = convertActivityToPerformance(activityWithMultipleAnswers);

      expect(result.questions).toHaveLength(2);
      expect(result.questions[0].title).toBe('Questão 1');
      expect(result.questions[1].title).toBe('Questão 2');
      expect(result.questions[1].isCorrect).toBe(false);
    });

    it('should handle activity with no answers', () => {
      const activityWithNoAnswers: StudentActivityData = {
        ...baseActivity,
        answers: [],
      };

      const result = convertActivityToPerformance(activityWithNoAnswers);

      expect(result.questions).toHaveLength(0);
    });
  });

  describe('convertLessonToPerformance', () => {
    const baseLesson: StudentLessonData = {
      id: 'lesson-1',
      title: 'Aula de Fotossíntese',
      sequence: 1,
      progress: 75,
      completedAt: '2024-01-15T10:00:00Z',
      questionnaire: null,
    };

    it('should convert lesson to PerformanceLesson format', () => {
      const result = convertLessonToPerformance(baseLesson);

      expect(result).toEqual({
        id: 'lesson-1',
        title: 'Aula de Fotossíntese',
        progress: 75,
      });
    });

    it('should handle lesson with 0% progress', () => {
      const lessonWithZeroProgress = {
        ...baseLesson,
        progress: 0,
      };

      const result = convertLessonToPerformance(lessonWithZeroProgress);
      expect(result.progress).toBe(0);
    });

    it('should handle lesson with 100% progress', () => {
      const lessonWithFullProgress = {
        ...baseLesson,
        progress: 100,
      };

      const result = convertLessonToPerformance(lessonWithFullProgress);
      expect(result.progress).toBe(100);
    });
  });

  describe('convertStudentAnswersToPerformanceData', () => {
    const baseResponse: StudentAnswersResponse = {
      message: 'Success',
      data: {
        activities: [
          {
            id: 'activity-1',
            title: 'Atividade 1',
            sequence: 1,
            answers: [
              {
                id: 'answer-1',
                questionId: 'question-1',
                answer: 'A',
                selectedOptions: [],
                answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
                statement: 'Question 1',
                questionType: 'ALTERNATIVA',
                difficultyLevel: 'EASY',
                solutionExplanation: null,
                correctOption: null,
                teacherFeedback: null,
                attachment: null,
                score: 10,
                options: [],
                knowledgeMatrix: [],
              },
            ],
            statistics: {
              totalAnswered: 1,
              correctAnswers: 1,
              incorrectAnswers: 0,
              pendingAnswers: 0,
              score: 10,
              timeSpent: 60,
            },
          },
        ],
        lessons: [
          {
            id: 'lesson-1',
            title: 'Lesson 1',
            sequence: 1,
            progress: 50,
            completedAt: null,
            questionnaire: null,
          },
        ],
      },
    };

    it('should convert full response to StudentActivityPerformanceData', () => {
      const result = convertStudentAnswersToPerformanceData(
        baseResponse,
        'user-institution-1',
        'user-1',
        'João Silva'
      );

      expect(result.userInstitutionId).toBe('user-institution-1');
      expect(result.userId).toBe('user-1');
      expect(result.studentName).toBe('João Silva');
      expect(result.correctAnswers).toBe(1);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.score).toBe(10);
      expect(result.activities).toHaveLength(1);
      expect(result.lessons).toHaveLength(1);
    });

    it('should aggregate statistics from multiple activities', () => {
      const responseWithMultipleActivities: StudentAnswersResponse = {
        ...baseResponse,
        data: {
          ...baseResponse.data,
          activities: [
            {
              ...baseResponse.data.activities[0],
              statistics: {
                totalAnswered: 5,
                correctAnswers: 3,
                incorrectAnswers: 2,
                pendingAnswers: 0,
                score: 6,
                timeSpent: 120,
              },
            },
            {
              id: 'activity-2',
              title: 'Atividade 2',
              sequence: 2,
              answers: [],
              statistics: {
                totalAnswered: 10,
                correctAnswers: 7,
                incorrectAnswers: 3,
                pendingAnswers: 0,
                score: 7,
                timeSpent: 180,
              },
            },
          ],
        },
      };

      const result = convertStudentAnswersToPerformanceData(
        responseWithMultipleActivities,
        'user-institution-1',
        'user-1',
        'João Silva'
      );

      expect(result.correctAnswers).toBe(10); // 3 + 7
      expect(result.incorrectAnswers).toBe(5); // 2 + 3
      expect(result.score).toBe(6.5); // (6 + 7) / 2
    });

    it('should handle empty activities array', () => {
      const responseWithNoActivities: StudentAnswersResponse = {
        ...baseResponse,
        data: {
          ...baseResponse.data,
          activities: [],
        },
      };

      const result = convertStudentAnswersToPerformanceData(
        responseWithNoActivities,
        'user-institution-1',
        'user-1',
        'João Silva'
      );

      expect(result.activities).toHaveLength(0);
      expect(result.correctAnswers).toBe(0);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.score).toBe(null);
    });

    it('should handle empty lessons array', () => {
      const responseWithNoLessons: StudentAnswersResponse = {
        ...baseResponse,
        data: {
          ...baseResponse.data,
          lessons: [],
        },
      };

      const result = convertStudentAnswersToPerformanceData(
        responseWithNoLessons,
        'user-institution-1',
        'user-1',
        'João Silva'
      );

      expect(result.lessons).toHaveLength(0);
    });

    it('should handle activities with null score', () => {
      const responseWithNullScore: StudentAnswersResponse = {
        ...baseResponse,
        data: {
          ...baseResponse.data,
          activities: [
            {
              ...baseResponse.data.activities[0],
              statistics: {
                ...baseResponse.data.activities[0].statistics,
                score: null,
              },
            },
          ],
        },
      };

      const result = convertStudentAnswersToPerformanceData(
        responseWithNullScore,
        'user-institution-1',
        'user-1',
        'João Silva'
      );

      expect(result.score).toBe(null);
    });

    it('should calculate average score ignoring null values', () => {
      const responseWithMixedScores: StudentAnswersResponse = {
        ...baseResponse,
        data: {
          ...baseResponse.data,
          activities: [
            {
              ...baseResponse.data.activities[0],
              id: 'activity-1',
              statistics: {
                ...baseResponse.data.activities[0].statistics,
                score: 8,
              },
            },
            {
              ...baseResponse.data.activities[0],
              id: 'activity-2',
              statistics: {
                ...baseResponse.data.activities[0].statistics,
                score: null,
              },
            },
            {
              ...baseResponse.data.activities[0],
              id: 'activity-3',
              statistics: {
                ...baseResponse.data.activities[0].statistics,
                score: 10,
              },
            },
          ],
        },
      };

      const result = convertStudentAnswersToPerformanceData(
        responseWithMixedScores,
        'user-institution-1',
        'user-1',
        'João Silva'
      );

      // Average should be (8 + 10) / 2 = 9, ignoring null
      expect(result.score).toBe(9);
    });

    it('should set default null values for completionTime, bestResult, and hardestTopic', () => {
      const result = convertStudentAnswersToPerformanceData(
        baseResponse,
        'user-institution-1',
        'user-1',
        'João Silva'
      );

      expect(result.completionTime).toBe(null);
      expect(result.bestResult).toBe(null);
      expect(result.hardestTopic).toBe(null);
    });
  });
});
