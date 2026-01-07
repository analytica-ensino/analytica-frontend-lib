import {
  ANSWER_STATUS,
  QUESTION_DIFFICULTY,
  QUESTION_TYPE,
} from '../../components/Quiz/useQuizStore';
import { QUESTION_STATUS } from './constants';
import type { CorrectionQuestionData } from './types';
import {
  getIsCorrect,
  mapAnswerStatusToQuestionStatus,
  getQuestionStatusBadgeConfig,
  getQuestionStatusFromData,
  canAutoValidate,
  autoValidateQuestion,
} from './utils';

describe('studentActivityCorrectionUtils', () => {
  describe('getIsCorrect', () => {
    it('should return true for RESPOSTA_CORRETA status', () => {
      const result = getIsCorrect(ANSWER_STATUS.RESPOSTA_CORRETA);
      expect(result).toBe(true);
    });

    it('should return false for RESPOSTA_INCORRETA status', () => {
      const result = getIsCorrect(ANSWER_STATUS.RESPOSTA_INCORRETA);
      expect(result).toBe(false);
    });

    it('should return null for NAO_RESPONDIDO status', () => {
      const result = getIsCorrect(ANSWER_STATUS.NAO_RESPONDIDO);
      expect(result).toBeNull();
    });

    it('should return null for PENDENTE_AVALIACAO status', () => {
      const result = getIsCorrect(ANSWER_STATUS.PENDENTE_AVALIACAO);
      expect(result).toBeNull();
    });
  });

  describe('mapAnswerStatusToQuestionStatus', () => {
    it('should map RESPOSTA_CORRETA to CORRETA', () => {
      const result = mapAnswerStatusToQuestionStatus(
        ANSWER_STATUS.RESPOSTA_CORRETA
      );
      expect(result).toBe(QUESTION_STATUS.CORRETA);
    });

    it('should map RESPOSTA_INCORRETA to INCORRETA', () => {
      const result = mapAnswerStatusToQuestionStatus(
        ANSWER_STATUS.RESPOSTA_INCORRETA
      );
      expect(result).toBe(QUESTION_STATUS.INCORRETA);
    });

    it('should map NAO_RESPONDIDO to EM_BRANCO', () => {
      const result = mapAnswerStatusToQuestionStatus(
        ANSWER_STATUS.NAO_RESPONDIDO
      );
      expect(result).toBe(QUESTION_STATUS.EM_BRANCO);
    });

    it('should map PENDENTE_AVALIACAO to PENDENTE', () => {
      const result = mapAnswerStatusToQuestionStatus(
        ANSWER_STATUS.PENDENTE_AVALIACAO
      );
      expect(result).toBe(QUESTION_STATUS.PENDENTE);
    });

    it('should return EM_BRANCO for unknown status', () => {
      const result = mapAnswerStatusToQuestionStatus(
        'UNKNOWN_STATUS' as ANSWER_STATUS
      );
      expect(result).toBe(QUESTION_STATUS.EM_BRANCO);
    });
  });

  describe('getQuestionStatusBadgeConfig', () => {
    it('should return correct config for CORRETA status', () => {
      const config = getQuestionStatusBadgeConfig(QUESTION_STATUS.CORRETA);

      expect(config).toEqual({
        label: 'Correta',
        bgColor: 'bg-success-background',
        textColor: 'text-success-800',
      });
    });

    it('should return correct config for INCORRETA status', () => {
      const config = getQuestionStatusBadgeConfig(QUESTION_STATUS.INCORRETA);

      expect(config).toEqual({
        label: 'Incorreta',
        bgColor: 'bg-error-background',
        textColor: 'text-error-800',
      });
    });

    it('should return correct config for EM_BRANCO status', () => {
      const config = getQuestionStatusBadgeConfig(QUESTION_STATUS.EM_BRANCO);

      expect(config).toEqual({
        label: 'Em branco',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
      });
    });

    it('should return correct config for PENDENTE status', () => {
      const config = getQuestionStatusBadgeConfig(QUESTION_STATUS.PENDENTE);

      expect(config).toEqual({
        label: 'Pendente',
        bgColor: 'bg-warning-background',
        textColor: 'text-warning-800',
      });
    });
  });

  describe('getQuestionStatusFromData', () => {
    it('should return CORRETA when answer status is RESPOSTA_CORRETA', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test question',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          statement: 'Test question',
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
        },
        questionNumber: 1,
      };

      const result = getQuestionStatusFromData(questionData);
      expect(result).toBe(QUESTION_STATUS.CORRETA);
    });

    it('should return INCORRETA when answer status is RESPOSTA_INCORRETA', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test question',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
          statement: 'Test question',
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
        },
        questionNumber: 1,
      };

      const result = getQuestionStatusFromData(questionData);
      expect(result).toBe(QUESTION_STATUS.INCORRETA);
    });

    it('should return EM_BRANCO when answer status is NAO_RESPONDIDO', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test question',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.NAO_RESPONDIDO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.NAO_RESPONDIDO,
          statement: 'Test question',
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
        },
        questionNumber: 1,
      };

      const result = getQuestionStatusFromData(questionData);
      expect(result).toBe(QUESTION_STATUS.EM_BRANCO);
    });

    it('should return PENDENTE when answer status is PENDENTE_AVALIACAO', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test question',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: 'Test answer',
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test question',
          questionType: QUESTION_TYPE.DISSERTATIVA,
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
        },
        questionNumber: 1,
      };

      const result = getQuestionStatusFromData(questionData);
      expect(result).toBe(QUESTION_STATUS.PENDENTE);
    });

    it('should auto-validate and return CORRETA when pending but can auto-validate with correct answer', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test question',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: ['opt1'],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [{ optionId: 'opt1' }],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test question',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          options: [
            { id: 'opt1', option: 'Correct', isCorrect: true },
            { id: 'opt2', option: 'Wrong', isCorrect: false },
          ],
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
        },
        questionNumber: 1,
      };

      const result = getQuestionStatusFromData(questionData);
      expect(result).toBe(QUESTION_STATUS.CORRETA);
    });

    it('should auto-validate and return INCORRETA when pending but can auto-validate with incorrect answer', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test question',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: ['opt1'],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [{ optionId: 'opt2' }],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test question',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          options: [
            { id: 'opt1', option: 'Correct', isCorrect: true },
            { id: 'opt2', option: 'Wrong', isCorrect: false },
          ],
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
        },
        questionNumber: 1,
      };

      const result = getQuestionStatusFromData(questionData);
      expect(result).toBe(QUESTION_STATUS.INCORRETA);
    });
  });

  describe('canAutoValidate', () => {
    it('should return true for ALTERNATIVA type with isCorrect defined', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          options: [
            { id: 'opt1', option: 'Option 1', isCorrect: true },
            { id: 'opt2', option: 'Option 2', isCorrect: false },
          ],
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
        },
        questionNumber: 1,
      };

      expect(canAutoValidate(questionData)).toBe(true);
    });

    it('should return true for MULTIPLA_ESCOLHA type with isCorrect defined', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
          questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          options: [{ id: 'opt1', option: 'Option 1', isCorrect: true }],
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
        },
        questionNumber: 1,
      };

      expect(canAutoValidate(questionData)).toBe(true);
    });

    it('should return true for VERDADEIRO_FALSO type with isCorrect defined', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
          questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          options: [{ id: 'opt1', option: 'Statement', isCorrect: true }],
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
        },
        questionNumber: 1,
      };

      expect(canAutoValidate(questionData)).toBe(true);
    });

    it('should return false for DISSERTATIVA type', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: 'Answer',
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
          questionType: QUESTION_TYPE.DISSERTATIVA,
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
        },
        questionNumber: 1,
      };

      expect(canAutoValidate(questionData)).toBe(false);
    });

    it('should return true for ALTERNATIVA type even when options is undefined', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          options: undefined,
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
        },
        questionNumber: 1,
      };

      expect(canAutoValidate(questionData)).toBe(true);
    });

    it('should return true for ALTERNATIVA type even when options is empty', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
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
        },
        questionNumber: 1,
      };

      expect(canAutoValidate(questionData)).toBe(true);
    });

    it('should return true for ALTERNATIVA type even when no option has isCorrect defined', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          options: [
            // @ts-expect-error - isCorrect is not required
            { id: 'opt1', option: 'Option 1' },
            // @ts-expect-error - isCorrect is not required
            { id: 'opt2', option: 'Option 2' },
          ],
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
        },
        questionNumber: 1,
      };

      expect(canAutoValidate(questionData)).toBe(true);
    });
  });

  describe('autoValidateQuestion', () => {
    describe('ALTERNATIVA type', () => {
      it('should return RESPOSTA_CORRETA when correct option is selected', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Correct', isCorrect: true },
              { id: 'opt2', option: 'Wrong', isCorrect: false },
              { id: 'opt3', option: 'Also Wrong', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.RESPOSTA_CORRETA
        );
      });

      it('should return RESPOSTA_INCORRETA when wrong option is selected', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Correct', isCorrect: true },
              { id: 'opt2', option: 'Wrong', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.RESPOSTA_INCORRETA
        );
      });

      it('should return NAO_RESPONDIDO when no option is selected', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Correct', isCorrect: true },
              { id: 'opt2', option: 'Wrong', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.NAO_RESPONDIDO
        );
      });

      it('should return RESPOSTA_INCORRETA when more than one option is selected (invalid for single choice)', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [{ optionId: 'opt1' }, { optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Correct', isCorrect: true },
              { id: 'opt2', option: 'Wrong', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.RESPOSTA_INCORRETA
        );
      });
    });

    describe('MULTIPLA_ESCOLHA type', () => {
      it('should return RESPOSTA_CORRETA when all correct options are selected and no incorrect', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1', 'opt2'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [{ optionId: 'opt1' }, { optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Correct 1', isCorrect: true },
              { id: 'opt2', option: 'Correct 2', isCorrect: true },
              { id: 'opt3', option: 'Wrong', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.RESPOSTA_CORRETA
        );
      });

      it('should return RESPOSTA_INCORRETA when some correct options are missing', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1', 'opt2'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Correct 1', isCorrect: true },
              { id: 'opt2', option: 'Correct 2', isCorrect: true },
              { id: 'opt3', option: 'Wrong', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.RESPOSTA_INCORRETA
        );
      });

      it('should return RESPOSTA_INCORRETA when incorrect option is selected', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1', 'opt2'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [
              { optionId: 'opt1' },
              { optionId: 'opt2' },
              { optionId: 'opt3' },
            ],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Correct 1', isCorrect: true },
              { id: 'opt2', option: 'Correct 2', isCorrect: true },
              { id: 'opt3', option: 'Wrong', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.RESPOSTA_INCORRETA
        );
      });

      it('should return NAO_RESPONDIDO when no options are selected', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1', 'opt2'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Correct 1', isCorrect: true },
              { id: 'opt2', option: 'Correct 2', isCorrect: true },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.NAO_RESPONDIDO
        );
      });
    });

    describe('VERDADEIRO_FALSO type', () => {
      it('should return RESPOSTA_CORRETA when all correct options are selected', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Statement is true', isCorrect: true },
              { id: 'opt2', option: 'Statement is false', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.RESPOSTA_CORRETA
        );
      });

      it('should return RESPOSTA_INCORRETA when wrong option is selected', () => {
        const questionData: CorrectionQuestionData = {
          question: {
            id: 'q1',
            statement: 'Test',
            questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            description: '',
            examBoard: null,
            examYear: null,
            solutionExplanation: null,
            answer: null,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            options: [],
            knowledgeMatrix: [],
            correctOptionIds: ['opt1'],
          },
          result: {
            id: 'a1',
            questionId: 'q1',
            answer: null,
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            statement: 'Test',
            questionType: QUESTION_TYPE.VERDADEIRO_FALSO,
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: null,
            correctOption: '',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            options: [
              { id: 'opt1', option: 'Statement is true', isCorrect: true },
              { id: 'opt2', option: 'Statement is false', isCorrect: false },
            ],
            knowledgeMatrix: [],
            teacherFeedback: null,
            attachment: null,
            score: null,
            gradedAt: null,
            gradedBy: null,
          },
          questionNumber: 1,
        };

        expect(autoValidateQuestion(questionData)).toBe(
          ANSWER_STATUS.RESPOSTA_INCORRETA
        );
      });
    });

    it('should return null when cannot auto-validate', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.DISSERTATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: 'Answer',
          selectedOptions: [],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
          questionType: QUESTION_TYPE.DISSERTATIVA,
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
        },
        questionNumber: 1,
      };

      expect(autoValidateQuestion(questionData)).toBeNull();
    });

    it('should return null when options is undefined', () => {
      const questionData: CorrectionQuestionData = {
        question: {
          id: 'q1',
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          description: '',
          examBoard: null,
          examYear: null,
          solutionExplanation: null,
          answer: null,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          options: [],
          knowledgeMatrix: [],
          correctOptionIds: [],
        },
        result: {
          id: 'a1',
          questionId: 'q1',
          answer: null,
          selectedOptions: [{ optionId: 'opt1' }],
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          statement: 'Test',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
          solutionExplanation: null,
          correctOption: '',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          options: undefined,
          knowledgeMatrix: [],
          teacherFeedback: null,
          attachment: null,
          score: null,
          gradedAt: null,
          gradedBy: null,
        },
        questionNumber: 1,
      };

      expect(autoValidateQuestion(questionData)).toBeNull();
    });
  });
});
