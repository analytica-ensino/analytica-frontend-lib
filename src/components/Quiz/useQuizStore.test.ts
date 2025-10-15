import { renderHook, act } from '@testing-library/react';
import {
  QUESTION_DIFFICULTY,
  QUESTION_TYPE,
  ANSWER_STATUS,
  useQuizStore,
  QuestionResult,
  MINUTE_INTERVAL_MS,
  QUIZ_TYPE,
  QuizInterface,
} from './useQuizStore';

// Type alias for question answers in result context
type QuestionAnswer = QuestionResult['answers'][0];

// Mock data for testing
const mockQuestion1 = {
  id: 'q1',
  statement: 'What is 2 + 2?',
  questionType: QUESTION_TYPE.ALTERNATIVA,
  difficultyLevel: QUESTION_DIFFICULTY.FACIL,
  description: 'Basic math question',
  examBoard: 'ENEM',
  examYear: '2024',
  solutionExplanation: null,
  answer: null,
  answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
  options: [
    { id: 'opt1', option: '4' },
    { id: 'opt2', option: '3' },
    { id: 'opt3', option: '5' },
    { id: 'opt4', option: '6' },
  ],
  correctOptionIds: ['opt1'],
  knowledgeMatrix: [
    {
      areaKnowledge: {
        id: 'matematica',
        name: 'Matemática',
      },
      subject: {
        id: 'algebra',
        name: 'Álgebra',
        color: '#FF6B6B',
        icon: 'Calculator',
      },
      topic: {
        id: 'operacoes',
        name: 'Operações',
      },
      subtopic: {
        id: 'soma',
        name: 'Soma',
      },
      content: {
        id: 'matematica',
        name: 'Matemática',
      },
    },
  ],
};

const mockQuestion2 = {
  id: 'q2',
  statement: 'What is the capital of France?',
  questionType: QUESTION_TYPE.ALTERNATIVA,
  difficultyLevel: QUESTION_DIFFICULTY.FACIL,
  description: 'Geography question',
  examBoard: 'ENEM',
  examYear: '2024',
  solutionExplanation: null,
  answer: null,
  answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
  options: [
    { id: 'opt1', option: 'London' },
    { id: 'opt2', option: 'Paris' },
    { id: 'opt3', option: 'Berlin' },
    { id: 'opt4', option: 'Madrid' },
  ],
  correctOptionIds: ['opt2'],
  knowledgeMatrix: [
    {
      areaKnowledge: {
        id: 'geografia',
        name: 'Geografia',
      },
      subject: {
        id: 'geografia-geral',
        name: 'Geografia Geral',
        color: '#4ECDC4',
        icon: 'Globe',
      },
      topic: {
        id: 'capitais',
        name: 'Capitais',
      },
      subtopic: {
        id: 'europa',
        name: 'Europa',
      },
      content: {
        id: 'geografia',
        name: 'Geografia',
      },
    },
  ],
};

const mockSimulado = {
  id: 'simulado-1',
  title: 'Test Simulado',
  type: QUIZ_TYPE.SIMULADO,
  subtype: 'Simulado',
  difficulty: 'MEDIO',
  notification: null,
  status: 'ATIVO',
  startDate: '2024-01-01',
  finalDate: '2024-12-31',
  canRetry: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  questions: [mockQuestion1, mockQuestion2],
};

const mockAtividade = {
  id: 'atividade-1',
  title: 'Test Atividade',
  type: QUIZ_TYPE.ATIVIDADE,
  subtype: 'ATIVIDADE',
  difficulty: null,
  notification: null,
  status: 'active',
  startDate: null,
  finalDate: null,
  canRetry: true,
  createdAt: null,
  updatedAt: null,
  questions: [mockQuestion1, mockQuestion2],
};

const mockQuestionary = {
  id: 'aula-1',
  title: 'Test Aula',
  type: QUIZ_TYPE.QUESTIONARIO,
  subtype: 'AULA',
  difficulty: null,
  notification: null,
  status: 'active',
  startDate: null,
  finalDate: null,
  canRetry: true,
  createdAt: null,
  updatedAt: null,
  questions: [mockQuestion1, mockQuestion2],
};

// Helper function to avoid nested function violations (S2004)
const renderQuizStoreHook = () => renderHook(() => useQuizStore());

/**
 * Helper function to set current question result without excessive nesting
 * @param result - The hook result
 * @param currentQuestionResult - The question result to set
 */
const setCurrentQuestionResultAction = (
  result: ReturnType<typeof renderQuizStoreHook>['result'],
  currentQuestionResult: QuestionResult['answers'] | null
) => {
  result.current.setCurrentQuestionResult(
    currentQuestionResult as QuestionResult['answers']
  );
};

/**
 * Helper function to set questions result without excessive nesting
 * @param result - The hook result
 * @param questionResult - The question result to set
 */
const setQuestionsResultAction = (
  result: ReturnType<typeof renderQuizStoreHook>['result'],
  questionResult: QuestionResult | null
) => {
  result.current.setQuestionsResult(questionResult as QuestionResult);
};

/**
 * Helper function to find answer by question ID without excessive nesting
 * @param answer - The answer object
 * @param questionId - The question ID to match
 */
const answerMatchesQuestionId = (
  answer: { questionId: string },
  questionId: string
) => answer.questionId === questionId;

/**
 * Helper function to find answer by question ID
 * @param answers - Array of user answers
 * @param questionId - The question ID to find
 */
const findAnswerByQuestionId = (
  answers: ReturnType<typeof useQuizStore.getState>['userAnswers'],
  questionId: string
) => answers.find((answer) => answerMatchesQuestionId(answer, questionId));

describe('useQuizStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useQuizStore.getState().resetQuiz();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderQuizStoreHook();

      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.selectedAnswers).toEqual({});
      expect(result.current.userAnswers).toEqual([]);
      expect(result.current.userAnswers).toEqual([]);
      expect(result.current.timeElapsed).toBe(0);
      expect(result.current.isStarted).toBe(false);
      expect(result.current.isFinished).toBe(false);
    });
  });

  describe('Setters', () => {
    it('should set quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
      });

      expect(result.current.quiz).toEqual(mockSimulado);
    });

    it('should set userId', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
      });

      expect(result.current.userId).toBe('test-user-id');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
      });
    });

    it('should go to next question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.goToNextQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('should not go beyond last question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.goToNextQuestion(); // Go to question 1
        result.current.goToNextQuestion(); // Try to go beyond
      });

      expect(result.current.currentQuestionIndex).toBe(1); // Should stay at last question
    });

    it('should go to previous question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.goToNextQuestion(); // Go to question 1
        result.current.goToPreviousQuestion(); // Go back to 0
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should not go before first question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.goToPreviousQuestion(); // Try to go before first
      });

      expect(result.current.currentQuestionIndex).toBe(0); // Should stay at first question
    });

    it('should go to specific question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.goToQuestion(1);
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('should not go to invalid question index', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.goToQuestion(5); // Invalid index
      });

      expect(result.current.currentQuestionIndex).toBe(0); // Should stay at current
    });
  });

  describe('Quiz Actions', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
      });
    });

    it('should select answer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(1); // Apenas as respondidas
      const answeredQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(answeredQuestion?.optionId).toBe('opt1');
    });

    it('should return early when selectAnswer is called without userId set', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        // Don't set userId - it should be empty string by default
        result.current.selectAnswer('q1', 'opt1');
      });

      // Verify that no user answer was created (since userId is falsy)
      const userAnswerItem = result.current.getUserAnswerByQuestionId('q1');
      expect(userAnswerItem).toBeNull();

      // Verify that the question's answer was NOT updated (since the function returns early when userId is falsy)
      const currentQuestion = result.current.getCurrentQuestion();
      expect(currentQuestion?.answer).toBe(null);
    });

    it('should return early when selectAnswer is called with non-existent question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('non-existent-question', 'opt1');
      });

      // Verify that no user answer was created for non-existent question
      const userAnswerItem = result.current.getUserAnswerByQuestionId(
        'non-existent-question'
      );
      expect(userAnswerItem).toBeNull();

      // Verify that no user answers were created at all
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0);
    });

    it('should select multiple answers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectMultipleAnswer('q1', ['opt1', 'opt3']);
      });

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(2); // Two answers for the same question

      const q1Answers = userAnswers.filter(
        (answer) => answer.questionId === 'q1'
      );
      expect(q1Answers).toHaveLength(2);

      const answerIds = q1Answers.map((answer) => answer.optionId);
      expect(answerIds).toContain('opt1');
      expect(answerIds).toContain('opt3');
    });

    it('should replace existing answers when selecting multiple answers for the same question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // First, select single answer
        result.current.selectAnswer('q1', 'opt1');
        // Then, select multiple answers for the same question
        result.current.selectMultipleAnswer('q1', ['opt2', 'opt4']);
      });

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(2); // Should have 2 answers for q1 (replaced the single answer)

      const q1Answers = userAnswers.filter(
        (answer) => answer.questionId === 'q1'
      );
      expect(q1Answers).toHaveLength(2);

      const answerIds = q1Answers.map((answer) => answer.optionId);
      expect(answerIds).toContain('opt2');
      expect(answerIds).toContain('opt4');
      expect(answerIds).not.toContain('opt1'); // Should not contain the previous single answer
    });

    it('should return early when selectMultipleAnswer is called without userId set', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        // Don't set userId - it should be empty string by default
        result.current.selectMultipleAnswer('q1', ['opt1', 'opt2']);
      });

      // Verify that no user answers were created (since userId is falsy)
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0);
    });

    it('should handle empty answerIds array in selectMultipleAnswer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // First, select some answers
        result.current.selectAnswer('q1', 'opt1');
        result.current.selectAnswer('q2', 'opt2');
        // Then, select multiple answers with empty array (should remove existing answers for q1)
        result.current.selectMultipleAnswer('q1', []);
      });

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(1); // Only q2 answer should remain

      const q1Answers = userAnswers.filter(
        (answer) => answer.questionId === 'q1'
      );
      expect(q1Answers).toHaveLength(0); // No answers for q1

      const q2Answer = userAnswers.find((answer) => answer.questionId === 'q2');
      expect(q2Answer?.optionId).toBe('opt2'); // q2 answer should remain unchanged
    });

    it('should return early when selectMultipleAnswer is called with non-existent question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectMultipleAnswer('non-existent-question', [
          'opt1',
          'opt2',
        ]);
      });

      // Verify that no user answer was created for non-existent question
      const userAnswerItem = result.current.getUserAnswerByQuestionId(
        'non-existent-question'
      );
      expect(userAnswerItem).toBeNull();

      // Verify that no user answers were created at all
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0);
    });

    it('should return early when selectMultipleAnswer is called without active quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        // Explicitly reset quiz state and clear all quiz types
        result.current.resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
        // Don't set any quiz (bySimulated, byActivity, or byQuestionary)
        result.current.setUserId('test-user-id');
        result.current.selectMultipleAnswer('q1', ['opt1', 'opt2']);
      });

      // Verify that no user answers were created when no active quiz
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0);

      // Verify that the method returns early and doesn't create any user answer
      const userAnswerItem = result.current.getUserAnswerByQuestionId('q1');
      expect(userAnswerItem).toBeNull();
    });

    it('should skip question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion();
      });

      expect(result.current.isQuestionSkipped('q1')).toBe(true);

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(1); // Apenas as respondidas/skipped
      const skippedQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(skippedQuestion?.answer).toBe(null);
      expect(skippedQuestion?.optionId).toBe(null);
    });

    it('should handle existingAnswerIndex logic when skipping a previously answered question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // First, answer the current question
        result.current.selectAnswer('q1', 'opt1');
      });

      // Verify the question is answered
      expect(result.current.isQuestionAnswered('q1')).toBe(true);

      // Get the initial user answer to verify structure
      let userAnswerItem = result.current.getUserAnswerByQuestionId('q1');
      expect(userAnswerItem?.optionId).toBe('opt1');
      expect(userAnswerItem?.optionId).toBe('opt1');

      // Now skip the same question (this tests line 269 - existingAnswerIndex logic)
      act(() => {
        result.current.skipQuestion();
      });

      // Verify the question is now skipped
      expect(result.current.isQuestionSkipped('q1')).toBe(true);

      // Verify that the existing answer was updated (not added as new)
      userAnswerItem = result.current.getUserAnswerByQuestionId('q1');

      // Should have the same question in userAnswers array (updated, not duplicated)
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(1); // Apenas as respondidas/skipped
      expect(userAnswerItem?.answer).toBe(null); // Answer was set to null
      expect(userAnswerItem?.optionId).toBe(null); // OptionId was set to null
      expect(result.current.isQuestionSkipped('q1')).toBe(true); // Question is now skipped
    });

    it('should remove from skipped when answering', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.skipQuestion(); // Skip first question
        result.current.goToNextQuestion(); // Go to second question
        result.current.selectAnswer('q2', 'opt2'); // Answer second question
      });

      expect(result.current.isQuestionSkipped('q1')).toBe(true);
      expect(result.current.isQuestionSkipped('q2')).toBe(false);
    });

    it('should start quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.startQuiz();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.timeElapsed).toBe(0);
    });

    it('should finish quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.finishQuiz();
      });

      expect(result.current.isFinished).toBe(true);
    });

    it('should reset quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.goToNextQuestion();
        result.current.startQuiz();
        result.current.resetQuiz();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.selectedAnswers).toEqual({});
      expect(result.current.userAnswers).toEqual([]);
      expect(result.current.timeElapsed).toBe(0);
      expect(result.current.isStarted).toBe(false);
      expect(result.current.isFinished).toBe(false);
    });
  });

  describe('Timer', () => {
    beforeEach(() => {
      // Clear any existing timers
      jest.clearAllTimers();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should update time', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.updateTime(120);
      });

      expect(result.current.timeElapsed).toBe(120);
    });

    it('should start timer when starting quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.startQuiz();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.timeElapsed).toBe(0);

      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeElapsed).toBe(1);
    });

    it('should stop timer when finishing quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.startQuiz();
        jest.advanceTimersByTime(2000); // Advance 2 seconds
        result.current.finishQuiz();
      });

      expect(result.current.isFinished).toBe(true);
      expect(result.current.timeElapsed).toBe(2);

      // Timer should be stopped, so advancing time should not increase timeElapsed
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeElapsed).toBe(2); // Should remain at 2
    });

    it('should stop timer when resetting quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.startQuiz();
        jest.advanceTimersByTime(3000); // Advance 3 seconds
        result.current.resetQuiz();
      });

      expect(result.current.timeElapsed).toBe(0);
      expect(result.current.isStarted).toBe(false);
      expect(result.current.isFinished).toBe(false);

      // Timer should be stopped, so advancing time should not increase timeElapsed
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeElapsed).toBe(0); // Should remain at 0
    });

    it('should handle timer lifecycle (start, stop, restart, finish, reset)', () => {
      const { result } = renderQuizStoreHook();

      // Start timer
      act(() => {
        result.current.startQuiz();
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeElapsed).toBe(1);

      // Stop and restart timer
      act(() => {
        result.current.stopTimer();
        jest.advanceTimersByTime(1000); // Should not affect timeElapsed
        result.current.startTimer();
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeElapsed).toBe(2);

      // Finish quiz and reset
      act(() => {
        result.current.finishQuiz();
        result.current.resetQuiz();
      });

      expect(result.current.timeElapsed).toBe(0);
      expect(result.current.isStarted).toBe(false);
      expect(result.current.isFinished).toBe(false);

      // Timer should be completely stopped
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeElapsed).toBe(0);
    });

    it('should format time correctly with timer integration', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.startQuiz();
        jest.advanceTimersByTime(65000); // Advance 65 seconds (1:05)
      });

      expect(result.current.formatTime(result.current.timeElapsed)).toBe(
        '01:05'
      );
    });

    it('should handle timer with long duration', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.startQuiz();
        jest.advanceTimersByTime(125000); // Advance 125 seconds (2:05)
      });

      expect(result.current.timeElapsed).toBe(125);
      expect(result.current.formatTime(result.current.timeElapsed)).toBe(
        '02:05'
      );
    });

    it('should clear existing timer interval when starting new timer', () => {
      const { result } = renderQuizStoreHook();

      // Start first timer
      act(() => {
        result.current.startQuiz();
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeElapsed).toBe(1);

      // Start second timer (should clear the first one)
      act(() => {
        result.current.startTimer();
        jest.advanceTimersByTime(1000);
      });

      // Should continue from where it left off, not restart from 0
      expect(result.current.timeElapsed).toBe(2);
    });

    it('should handle multiple timer starts without clearing previous intervals', () => {
      const { result } = renderQuizStoreHook();

      // Start timer multiple times
      act(() => {
        result.current.startQuiz();
        result.current.startTimer();
        result.current.startTimer();
        jest.advanceTimersByTime(1000);
      });

      // Should only increment by 1 second, not by multiple intervals
      expect(result.current.timeElapsed).toBe(1);
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
      });
    });

    it('should get current question', () => {
      const { result } = renderQuizStoreHook();

      const currentQuestion = result.current.getCurrentQuestion();

      expect(currentQuestion).toEqual(mockQuestion1);
    });

    it('should get total questions', () => {
      const { result } = renderQuizStoreHook();

      const total = result.current.getTotalQuestions();

      expect(total).toBe(2);
    });

    it('should get answered questions count', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const answered = result.current.getAnsweredQuestions();

      expect(answered).toBe(1);
    });

    it('should get unanswered questions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const unanswered = result.current.getUnansweredQuestions();

      expect(unanswered).toEqual([2]); // Only question 2 is unanswered
    });

    it('should return empty array for unanswered questions when no quiz is set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();
      expect(result.current.getUnansweredQuestions()).toEqual([]);
    });

    it('should correctly identify answered questions in getUnansweredQuestions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1'); // Answer q1
      });

      const unanswered = result.current.getUnansweredQuestions();

      // q1 should be answered (isAnswered = true), so only q2 should be unanswered
      expect(unanswered).toEqual([2]);
    });

    it('should correctly identify skipped questions in getUnansweredQuestions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion(); // Skip q1 (current question)
      });

      const unanswered = result.current.getUnansweredQuestions();

      // q1 is skipped (isSkipped = true), so only q2 should be unanswered
      expect(unanswered).toEqual([2]);
    });

    it('should return all questions when none are answered or skipped in getUnansweredQuestions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // Don't answer or skip any questions
      });

      const unanswered = result.current.getUnansweredQuestions();

      // Both questions should be unanswered (!isAnswered && !isSkipped)
      expect(unanswered).toEqual([1, 2]);
    });

    it('should handle questions with optionId set to non-null in getUnansweredQuestions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1'); // This sets optionId !== null
        result.current.goToNextQuestion();
        result.current.selectAnswer('q2', 'opt2'); // This also sets optionId !== null
      });

      const unanswered = result.current.getUnansweredQuestions();

      // Both questions have optionId !== null, so isAnswered = true for both
      expect(unanswered).toEqual([]);
    });

    it('should handle dissertative questions with answer set to non-null in getUnansweredQuestions', () => {
      const mockDissertativeQuestion = {
        ...mockQuestion1,
        id: 'dissertative-q1',
        questionType: QUESTION_TYPE.DISSERTATIVA,
        options: [],
      };

      const mockSimuladoWithDissertative = {
        ...mockSimulado,
        questions: [mockDissertativeQuestion, mockQuestion2],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta dissertativa'
        ); // This sets answer !== null
      });

      const unanswered = result.current.getUnansweredQuestions();

      // dissertative-q1 has answer !== null, so isAnswered = true, only q2 should be unanswered
      expect(unanswered).toEqual([2]);
    });

    it('should handle questions with both optionId and answer null (skipped) in getUnansweredQuestions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion(); // This sets both optionId and answer to null
        result.current.goToNextQuestion();
        result.current.selectAnswer('q2', 'opt2'); // Answer the second question
      });

      const unanswered = result.current.getUnansweredQuestions();

      // q1 is skipped (isSkipped = true), q2 is answered (isAnswered = true)
      // No questions should be unanswered
      expect(unanswered).toEqual([]);
    });

    it('should handle mixed answered, skipped, and unanswered questions in getUnansweredQuestions', () => {
      const mockQuestion3 = {
        ...mockQuestion1,
        id: 'q3',
        statement: 'Third question',
      };

      const mockSimuladoWithThreeQuestions = {
        ...mockSimulado,
        questions: [mockQuestion1, mockQuestion2, mockQuestion3],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithThreeQuestions);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1'); // Answer q1
        result.current.goToNextQuestion();
        result.current.skipQuestion(); // Skip q2
        // Leave q3 unanswered
      });

      const unanswered = result.current.getUnansweredQuestions();

      // q1 is answered (isAnswered = true)
      // q2 is skipped (isSkipped = true)
      // q3 is neither answered nor skipped, so it should be unanswered
      expect(unanswered).toEqual([3]);
    });

    it('should get skipped questions count', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion();
      });

      const skipped = result.current.getSkippedQuestions();

      expect(skipped).toBe(1);
    });

    it('should get progress percentage', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const progress = result.current.getProgress();

      expect(progress).toBe(50); // 1 out of 2 questions = 50%
    });

    it('should check if question is answered', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    // Additional comprehensive tests for isQuestionAnswered
    it('should return false when no quiz is set', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        // Ensure no quiz is set
        useQuizStore.setState({
          quiz: null,
        });
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
      expect(result.current.isQuestionAnswered('nonexistent')).toBe(false);
    });

    it('should return false when quiz is null', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        // Set quiz to null explicitly
        useQuizStore.setState({
          quiz: null,
        });
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should return false for non-existent question ID', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
      });

      expect(result.current.isQuestionAnswered('nonexistent')).toBe(false);
      expect(result.current.isQuestionAnswered('invalid-id')).toBe(false);
    });

    it('should return false for question with null answerKey', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
      });

      // Both questions start with answerKey: null
      expect(result.current.isQuestionAnswered('q1')).toBe(false);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    it('should return true for question with valid answerKey', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    it('should return true for question with empty string answerKey', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.addUserAnswer('q1', '');
      });

      // Empty string is converted to null in addUserAnswer
      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should work with different quiz types', () => {
      const mockAtividade = {
        id: 'atividade1',
        title: 'Test Atividade',
        type: QUIZ_TYPE.ATIVIDADE,
        subtype: QUIZ_TYPE.ATIVIDADE,
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockAtividade);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    it('should work with questionary quiz type', () => {
      const mockQuestionary = {
        id: 'aula1',
        title: 'Test Aula',
        type: QUIZ_TYPE.QUESTIONARIO,
        subtype: 'AULA',
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockQuestionary);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q2', 'opt2');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
      expect(result.current.isQuestionAnswered('q2')).toBe(true);
    });

    it('should handle multiple answered questions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.selectAnswer('q2', 'opt2');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(true);
    });

    it('should handle question with answerKey set to null after being answered', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.addUserAnswer('q1', undefined); // Set to null
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should handle question with answerKey set to empty string', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.addUserAnswer('q1', ''); // Set to empty string (converted to null)
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should handle case sensitivity in question ID', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('Q1')).toBe(false); // Different case
      expect(result.current.isQuestionAnswered('q1')).toBe(true);
    });

    it('should handle special characters in question ID', () => {
      const questionWithSpecialChars = {
        ...mockQuestion1,
        id: 'q1-special@#$%',
      };

      const simuladoWithSpecialChars = {
        ...mockSimulado,
        questions: [questionWithSpecialChars, mockQuestion2],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(simuladoWithSpecialChars);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1-special@#$%', 'opt1');
      });

      expect(result.current.isQuestionAnswered('q1-special@#$%')).toBe(true);
      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should handle very long question ID', () => {
      const longId = 'q'.repeat(1000);
      const questionWithLongId = {
        ...mockQuestion1,
        id: longId,
      };

      const simuladoWithLongId = {
        ...mockSimulado,
        questions: [questionWithLongId, mockQuestion2],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(simuladoWithLongId);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer(longId, 'opt1');
      });

      expect(result.current.isQuestionAnswered(longId)).toBe(true);
    });

    it('should handle numeric question ID as string', () => {
      const questionWithNumericId = {
        ...mockQuestion1,
        id: '12345',
      };

      const simuladoWithNumericId = {
        ...mockSimulado,
        questions: [questionWithNumericId, mockQuestion2],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(simuladoWithNumericId);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('12345', 'opt1');
      });

      expect(result.current.isQuestionAnswered('12345')).toBe(true);
      expect(
        result.current.isQuestionAnswered(12345 as unknown as string)
      ).toBe(false); // Should handle type mismatch
    });

    it('should check if question is skipped', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion();
      });

      expect(result.current.isQuestionSkipped('q1')).toBe(true);
      expect(result.current.isQuestionSkipped('q2')).toBe(false);
    });

    it('should get current answer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const currentAnswer = result.current.getCurrentAnswer();

      expect(currentAnswer?.optionId).toBe('opt1');
    });

    it('should get quiz title', () => {
      const { result } = renderQuizStoreHook();

      const title = result.current.getQuizTitle();

      expect(title).toBe('Test Simulado');
    });

    it('should format time correctly', () => {
      const { result } = renderQuizStoreHook();

      expect(result.current.formatTime(65)).toBe('01:05');
      expect(result.current.formatTime(125)).toBe('02:05');
      expect(result.current.formatTime(0)).toBe('00:00');
    });

    it('should get user answers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const userAnswers = result.current.getUserAnswers();

      expect(userAnswers).toHaveLength(1);
      const answeredQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(answeredQuestion?.optionId).toBe('opt1');
    });

    it('should get unanswered questions from user answers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      expect(unanswered).toEqual([2]); // Only question 2 is unanswered
    });

    it('should correctly identify answered questions with optionId in getUnansweredQuestionsFromUserAnswers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1'); // hasAnswer = true (optionId !== null)
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      // q1 has hasAnswer = true, so only q2 should be unanswered
      expect(unanswered).toEqual([2]);
    });

    it('should correctly identify answered dissertative questions in getUnansweredQuestionsFromUserAnswers', () => {
      const mockDissertativeQuestion = {
        ...mockQuestion1,
        id: 'dissertative-q1',
        questionType: QUESTION_TYPE.DISSERTATIVA,
        options: [],
      };

      const mockSimuladoWithDissertative = {
        ...mockSimulado,
        questions: [mockDissertativeQuestion, mockQuestion2],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta dissertativa'
        ); // hasAnswer = true (answer !== null)
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      // dissertative-q1 has hasAnswer = true, so only q2 should be unanswered
      expect(unanswered).toEqual([2]);
    });

    it('should include skipped questions as unanswered in getUnansweredQuestionsFromUserAnswers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion(); // Skip q1 (isSkipped = true)
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      // q1 is skipped (isSkipped = true), q2 has no userAnswer
      // Both should be unanswered because condition is (!hasAnswer || isSkipped)
      expect(unanswered).toEqual([1, 2]);
    });

    it('should handle questions with no userAnswer in getUnansweredQuestionsFromUserAnswers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // Don't answer or skip any questions - no userAnswer exists
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      // Both questions have no userAnswer, so !hasAnswer = true for both
      expect(unanswered).toEqual([1, 2]);
    });

    it('should handle questions with userAnswer but both optionId and answer null in getUnansweredQuestionsFromUserAnswers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion(); // This creates userAnswer with optionId=null and answer=null
        result.current.goToNextQuestion();
        result.current.selectAnswer('q2', 'opt2'); // Answer q2
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      // q1: hasAnswer = false, isSkipped = true -> (!hasAnswer || isSkipped) = true
      // q2: hasAnswer = true, isSkipped = false -> (!hasAnswer || isSkipped) = false
      expect(unanswered).toEqual([1]);
    });

    it('should handle mixed scenarios in getUnansweredQuestionsFromUserAnswers', () => {
      const mockQuestion3 = {
        ...mockQuestion1,
        id: 'q3',
        statement: 'Third question',
      };

      const mockSimuladoWithThreeQuestions = {
        ...mockSimulado,
        questions: [mockQuestion1, mockQuestion2, mockQuestion3],
      };

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithThreeQuestions);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1'); // Answer q1: hasAnswer = true
        result.current.goToNextQuestion();
        result.current.skipQuestion(); // Skip q2: isSkipped = true
        // Leave q3 without userAnswer: !hasAnswer = true
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      // q1: hasAnswer = true -> (!hasAnswer || isSkipped) = false
      // q2: isSkipped = true -> (!hasAnswer || isSkipped) = true
      // q3: !hasAnswer = true -> (!hasAnswer || isSkipped) = true
      expect(unanswered).toEqual([2, 3]);
    });

    it('should return empty array when all questions are answered in getUnansweredQuestionsFromUserAnswers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1'); // Answer q1
        result.current.goToNextQuestion();
        result.current.selectAnswer('q2', 'opt2'); // Answer q2
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      // Both questions have hasAnswer = true, so no questions should be unanswered
      expect(unanswered).toEqual([]);
    });

    it('should get questions grouped by subject', () => {
      const { result } = renderQuizStoreHook();

      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toHaveProperty('algebra');
      expect(grouped).toHaveProperty('geografia-geral');
      expect(grouped.algebra).toHaveLength(1);
      expect(grouped['geografia-geral']).toHaveLength(1);
    });

    it('should handle questions without knowledge matrix', () => {
      const questionWithoutMatrix = {
        ...mockQuestion1,
        id: 'q3',
        knowledgeMatrix: [],
      };

      const simuladoWithQuestionWithoutMatrix = {
        ...mockSimulado,
        questions: [questionWithoutMatrix],
      };

      act(() => {
        useQuizStore.getState().setQuiz(simuladoWithQuestionWithoutMatrix);
      });

      const { result } = renderQuizStoreHook();
      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toHaveProperty('Sem matéria');
      expect(grouped['Sem matéria']).toHaveLength(1);
    });

    it('should get questions grouped by subject with result variant', () => {
      const { result } = renderQuizStoreHook();

      const mockQuestionResultForGrouping: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: 'q1',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            options: [
              { id: 'opt1', option: '4', isCorrect: true },
              { id: 'opt2', option: '3', isCorrect: false },
            ],
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is the capital of France?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Paris is the capital of France',
            options: [
              { id: 'opt1', option: 'London', isCorrect: false },
              { id: 'opt2', option: 'Paris', isCorrect: true },
            ],
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer3',
            questionId: 'q3',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'Another math question',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: 'Another math explanation',
            options: [
              { id: 'opt1', option: 'correct', isCorrect: true },
              { id: 'opt2', option: 'wrong', isCorrect: false },
            ],
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'equacoes', name: 'Equações' },
                subtopic: { id: 'linear', name: 'Linear' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 90,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 3,
          correctAnswers: 3,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 96.67,
          timeSpent: 180,
        },
      };

      act(() => {
        result.current.setVariant('result');
        result.current.setQuestionsResult(mockQuestionResultForGrouping);
      });

      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toHaveProperty('algebra');
      expect(grouped).toHaveProperty('geografia-geral');
      expect(grouped.algebra).toHaveLength(2); // Two algebra questions
      expect(grouped['geografia-geral']).toHaveLength(1); // One geography question

      // Verify the grouped questions are from QuestionResult.answers
      expect(grouped.algebra[0]).toHaveProperty('questionId', 'q1');
      expect(grouped.algebra[1]).toHaveProperty('questionId', 'q3');
      expect(grouped['geografia-geral'][0]).toHaveProperty('questionId', 'q2');
    });

    it('should handle questions without knowledge matrix in result variant', () => {
      const { result } = renderQuizStoreHook();

      const mockQuestionResultWithoutMatrix: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: 'q1',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'Question without knowledge matrix',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Explanation',
            options: [
              { id: 'opt1', option: 'correct', isCorrect: true },
              { id: 'opt2', option: 'wrong', isCorrect: false },
            ],
            knowledgeMatrix: [], // Empty knowledge matrix
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 1,
          correctAnswers: 1,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      act(() => {
        result.current.setVariant('result');
        result.current.setQuestionsResult(mockQuestionResultWithoutMatrix);
      });

      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toHaveProperty('Sem matéria');
      expect(grouped['Sem matéria']).toHaveLength(1);
      expect(grouped['Sem matéria'][0]).toHaveProperty('questionId', 'q1');
    });

    it('should return empty object when no question result is set in result variant', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setVariant('result');
        // Don't set questionsResult
      });

      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toEqual({});
    });

    it('should return empty object when question result is null in result variant', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setVariant('result');
        result.current.setQuestionsResult(null as unknown as QuestionResult);
      });

      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toEqual({});
    });

    it('should handle mixed subjects correctly in result variant', () => {
      const { result } = renderQuizStoreHook();

      const mockQuestionResultMixed: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: 'q1',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'Math question',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Math explanation',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'Geography question',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Geography explanation',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer3',
            questionId: 'q3',
            answer: null,
            selectedOptions: [],
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'Question without subject',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'No subject explanation',
            knowledgeMatrix: [], // No knowledge matrix
            teacherFeedback: null,
            attachment: null,
            score: 0,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer4',
            questionId: 'q4',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'Another math question',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
            solutionExplanation: 'Another math explanation',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'equacoes', name: 'Equações' },
                subtopic: { id: 'quadratica', name: 'Quadrática' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 4,
          correctAnswers: 3,
          incorrectAnswers: 0,
          pendingAnswers: 1,
          score: 75,
          timeSpent: 240,
        },
      };

      act(() => {
        result.current.setVariant('result');
        result.current.setQuestionsResult(mockQuestionResultMixed);
      });

      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toHaveProperty('algebra');
      expect(grouped).toHaveProperty('geografia-geral');
      expect(grouped).toHaveProperty('Sem matéria');

      expect(grouped.algebra).toHaveLength(2); // Two algebra questions
      expect(grouped['geografia-geral']).toHaveLength(1); // One geography question
      expect(grouped['Sem matéria']).toHaveLength(1); // One question without subject

      // Verify question IDs (cast to QuestionAnswer[] since we're using result variant)
      expect(
        (grouped.algebra as unknown as QuestionAnswer[]).map(
          (q) => q.questionId
        )
      ).toContain('q1');
      expect(
        (grouped.algebra as unknown as QuestionAnswer[]).map(
          (q) => q.questionId
        )
      ).toContain('q4');
      expect(
        (grouped['geografia-geral'][0] as unknown as QuestionAnswer).questionId
      ).toBe('q2');
      expect(
        (grouped['Sem matéria'][0] as unknown as QuestionAnswer).questionId
      ).toBe('q3');
    });
  });

  describe('getAllCurrentAnswer', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
      });
    });

    it('should return undefined when no current question exists', () => {
      // Reset to ensure no quiz data
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();
      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toBeUndefined();
    });

    it('should return empty array when current question has no user answers', () => {
      const { result } = renderQuizStoreHook();

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toEqual([]);
    });

    it('should return user answers for current question when answers exist', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('q1');
      expect(allCurrentAnswer?.[0].optionId).toBe('opt1');
    });

    it('should return multiple user answers for current question when multiple answers exist', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectMultipleAnswer('q1', ['opt1', 'opt3']);
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(2);
      expect(allCurrentAnswer?.[0].questionId).toBe('q1');
      expect(allCurrentAnswer?.[1].questionId).toBe('q1');
      expect(allCurrentAnswer?.map((answer) => answer.optionId)).toContain(
        'opt1'
      );
      expect(allCurrentAnswer?.map((answer) => answer.optionId)).toContain(
        'opt3'
      );
    });

    it('should return skipped answer for current question when question is skipped', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.skipQuestion();
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('q1');
      expect(allCurrentAnswer?.[0].optionId).toBe(null);
      expect(allCurrentAnswer?.[0].answer).toBe(null);
    });

    it('should return answers for different current question when navigating', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.goToNextQuestion(); // Go to q2
        result.current.selectAnswer('q2', 'opt2');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('q2');
      expect(allCurrentAnswer?.[0].optionId).toBe('opt2');
    });

    it('should not return answers for other questions when on current question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.goToNextQuestion(); // Go to q2
        result.current.selectAnswer('q2', 'opt2');
        result.current.goToPreviousQuestion(); // Go back to q1
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('q1');
      expect(allCurrentAnswer?.[0].optionId).toBe('opt1');
      // Should not include q2 answer
      expect(
        allCurrentAnswer?.find((answer) => answer.questionId === 'q2')
      ).toBeUndefined();
    });

    it('should work with byActivity quiz type', () => {
      const mockAtividade = {
        id: 'atividade-1',
        title: 'Test Atividade',
        type: QUIZ_TYPE.ATIVIDADE,
        subtype: QUIZ_TYPE.ATIVIDADE,
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockAtividade);
      });

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('q1');
      expect(allCurrentAnswer?.[0].optionId).toBe('opt1');
    });

    it('should work with byQuestionary quiz type', () => {
      const mockQuestionary = {
        id: 'aula-1',
        title: 'Test Aula',
        type: QUIZ_TYPE.QUESTIONARIO,
        subtype: 'AULA',
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockQuestionary);
      });

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('q1');
      expect(allCurrentAnswer?.[0].optionId).toBe('opt1');
    });

    it('should handle case sensitivity in question ID matching', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        // Add answer with different case
        result.current.addUserAnswer('Q1', 'opt1');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      // Should not find the answer because case doesn't match
      expect(allCurrentAnswer).toEqual([]);
    });

    it('should handle special characters in question ID', () => {
      const questionWithSpecialChars = {
        ...mockQuestion1,
        id: 'q1-special@#$%',
      };

      const simuladoWithSpecialChars = {
        ...mockSimulado,
        questions: [questionWithSpecialChars, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setQuiz(simuladoWithSpecialChars);
      });

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1-special@#$%', 'opt1');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('q1-special@#$%');
      expect(allCurrentAnswer?.[0].optionId).toBe('opt1');
    });

    it('should return empty array when current question exists but has no matching user answers', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        // Add answer for a different question
        result.current.addUserAnswer('q2', 'opt2');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      // Should return empty array because current question is q1 but we answered q2
      expect(allCurrentAnswer).toEqual([]);
    });

    it('should handle multiple answers for the same question with different optionIds', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        // First answer
        result.current.selectAnswer('q1', 'opt1');
        // Second answer (should replace the first)
        result.current.selectAnswer('q1', 'opt2');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('q1');
      expect(allCurrentAnswer?.[0].optionId).toBe('opt2');
    });

    it('should handle very long question ID', () => {
      const longId = 'q'.repeat(1000);
      const questionWithLongId = {
        ...mockQuestion1,
        id: longId,
      };

      const simuladoWithLongId = {
        ...mockSimulado,
        questions: [questionWithLongId, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setQuiz(simuladoWithLongId);
      });

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer(longId, 'opt1');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe(longId);
      expect(allCurrentAnswer?.[0].optionId).toBe('opt1');
    });

    it('should handle numeric question ID as string', () => {
      const questionWithNumericId = {
        ...mockQuestion1,
        id: '12345',
      };

      const simuladoWithNumericId = {
        ...mockSimulado,
        questions: [questionWithNumericId, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setQuiz(simuladoWithNumericId);
      });

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('12345', 'opt1');
      });

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toHaveLength(1);
      expect(allCurrentAnswer?.[0].questionId).toBe('12345');
      expect(allCurrentAnswer?.[0].optionId).toBe('opt1');
    });
  });

  describe('Progress Calculation', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
      });
    });

    it('should return 0% when no questions are answered', () => {
      const { result } = renderQuizStoreHook();

      const progress = result.current.getProgress();

      expect(progress).toBe(0);
    });

    it('should return 50% when one out of two questions is answered', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const progress = result.current.getProgress();

      expect(progress).toBe(50);
    });

    it('should return 100% when all questions are answered', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.selectAnswer('q2', 'opt2');
      });

      const progress = result.current.getProgress();

      expect(progress).toBe(100);
    });

    it('should return 0% when there are no questions in the quiz', () => {
      const emptySimulado = {
        id: 'empty-simulado',
        title: 'Empty Quiz',
        type: QUIZ_TYPE.SIMULADO,
        subtype: 'Simulado',
        difficulty: 'MEDIO',
        notification: null,
        status: 'ATIVO',
        startDate: '2024-01-01',
        finalDate: '2024-12-31',
        canRetry: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        questions: [],
      };

      act(() => {
        useQuizStore.getState().setQuiz(emptySimulado);
      });

      const { result } = renderQuizStoreHook();
      const progress = result.current.getProgress();

      expect(progress).toBe(0);
    });

    it('should return 0% when quiz is not set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();
      const progress = result.current.getProgress();

      expect(progress).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty quiz', () => {
      // Reset to ensure no quiz data and clear all quiz data
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();

      expect(result.current.getCurrentQuestion()).toBeNull();
      expect(result.current.getTotalQuestions()).toBe(0);
      expect(result.current.getQuizTitle()).toBe('Quiz');
    });

    it('should handle updating existing user answer', () => {
      // Reset and set up quiz data
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.getState().setQuiz(mockSimulado);
      });

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.selectAnswer('q1', 'opt2'); // Update answer
      });

      // Check that the question is answered (not skipped)
      const userAnswers = result.current.getUserAnswers();
      const updatedQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(updatedQuestion?.optionId).not.toBe(null);

      // Check that the current answer is updated
      expect(result.current.getCurrentAnswer()?.optionId).toBe('opt2');
    });

    it('should handle question not found in addUserAnswer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.addUserAnswer('nonexistent', 'opt1');
      });

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0); // No answer should be added for non-existent question
    });

    it('should return undefined for current answer when no quiz is set', () => {
      // Reset to ensure no quiz data
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();
      expect(result.current.getCurrentAnswer()).toBeUndefined();
    });

    it('should return empty array for unanswered questions when no quiz is set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();
      expect(result.current.getUnansweredQuestionsFromUserAnswers()).toEqual(
        []
      );
    });

    it('should group questions correctly by subject', () => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
      });

      const { result } = renderQuizStoreHook();
      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toHaveProperty('algebra');
      expect(grouped).toHaveProperty('geografia-geral');
      expect(grouped.algebra[0].id).toBe('q1');
      expect(grouped['geografia-geral'][0].id).toBe('q2');
    });

    it('should return empty object when no quiz is set for grouped questions', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();
      expect(result.current.getQuestionsGroupedBySubject()).toEqual({});
    });

    it('should handle invalid question id in addUserAnswer', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.addUserAnswer('invalid-id', 'option');
      });

      expect(result.current.userAnswers).toHaveLength(0);
    });

    // Consolidated tests for quiz type handling
    it('should handle different quiz types in selectAnswer and addUserAnswer', () => {
      const mockAtividade = {
        id: 'atividade1',
        title: 'Test Atividade',
        type: QUIZ_TYPE.ATIVIDADE,
        subtype: QUIZ_TYPE.ATIVIDADE,
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const mockQuestionary = {
        id: 'aula1',
        title: 'Test Aula',
        type: QUIZ_TYPE.QUESTIONARIO,
        subtype: 'AULA',
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const { result } = renderQuizStoreHook();

      // Test simulated quiz
      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      let userAnswers = result.current.getUserAnswers();
      let updatedQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(updatedQuestion?.optionId).toBe('opt1');

      // Test atividade quiz
      act(() => {
        result.current.setQuiz(mockAtividade);
        result.current.selectAnswer('q1', 'opt1');
      });

      userAnswers = result.current.getUserAnswers();
      updatedQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(updatedQuestion?.optionId).toBe('opt1');

      // Test questionary quiz
      act(() => {
        result.current.setQuiz(mockQuestionary);
        result.current.selectAnswer('q2', 'opt2');
      });

      userAnswers = result.current.getUserAnswers();
      updatedQuestion = userAnswers.find((q) => q.questionId === 'q2');
      expect(updatedQuestion?.optionId).toBe('opt2');
    });

    it('should handle scenarios when no quiz is defined', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        // Ensure no quiz is set
        useQuizStore.setState({
          quiz: null,
        });
        result.current.selectAnswer('q1', 'opt1');
        result.current.addUserAnswer('q1', 'opt1');
        result.current.skipQuestion();
      });

      // Should not throw error and should not change anything
      expect(result.current.getCurrentQuestion()).toBeNull();
      expect(result.current.getUserAnswers()).toEqual([]);
    });

    it('should return null when no quiz is set in skipQuestion', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        // Ensure no quiz is set
        useQuizStore.setState({
          quiz: null,
        });
        result.current.skipQuestion();
      });

      // Should not throw error and should not change anything
      expect(result.current.getCurrentQuestion()).toBeNull();
      expect(result.current.getUserAnswers()).toEqual([]);
    });
  });

  describe('Minute Callback', () => {
    beforeEach(() => {
      // Clear any existing timers
      jest.clearAllTimers();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set minute callback', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
      });

      expect(result.current.minuteCallback).toBe(mockCallback);
    });

    it('should clear minute callback when set to null', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
        result.current.setMinuteCallback(null);
      });

      expect(result.current.minuteCallback).toBeNull();
    });

    it('should start minute callback when starting quiz', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
        result.current.startQuiz();
      });

      expect(result.current.isStarted).toBe(true);

      // Advance timer by 1 minute
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should stop minute callback when finishing quiz', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
        result.current.startQuiz();
        result.current.finishQuiz();
      });

      expect(result.current.isFinished).toBe(true);

      // Advance timer by 1 minute - callback should not be called
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should stop minute callback when resetting quiz', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
        result.current.startQuiz();
        result.current.resetQuiz();
      });

      expect(result.current.minuteCallback).toBeNull();
      expect(result.current.isStarted).toBe(false);
      expect(result.current.isFinished).toBe(false);

      // Advance timer by 1 minute - callback should not be called
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not start minute callback if no callback is set', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.startQuiz();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.minuteCallback).toBeNull();

      // Advance timer by 1 minute - no callback should be called
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      // No callback to verify, but timer should still be running
      expect(result.current.timeElapsed).toBe(60);
    });

    it('should not start minute callback if quiz is finished', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
        result.current.finishQuiz();
        result.current.startMinuteCallback();
      });

      expect(result.current.isFinished).toBe(true);

      // Advance timer by 1 minute - callback should not be called
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should call callback multiple times for multiple minutes', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
        result.current.startQuiz();
      });

      // Advance timer by 3 minutes
      act(() => {
        jest.advanceTimersByTime(180000);
      });

      expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    it('should handle callback changes during quiz', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback1);
        result.current.startQuiz();
      });

      // Advance timer by 1 minute
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      expect(mockCallback1).toHaveBeenCalledTimes(1);

      // Change callback
      act(() => {
        result.current.setMinuteCallback(mockCallback2);
      });

      // Advance timer by another minute
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      expect(mockCallback1).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });

    it('should stop minute callback when callback is removed during quiz', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
        result.current.startQuiz();
      });

      // Advance timer by 1 minute
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Remove callback
      act(() => {
        result.current.setMinuteCallback(null);
      });

      // Advance timer by another minute
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1); // Should not increase
    });

    it('should handle multiple startMinuteCallback calls', () => {
      const { result } = renderQuizStoreHook();
      const mockCallback = jest.fn();

      act(() => {
        result.current.setMinuteCallback(mockCallback);
        result.current.startMinuteCallback();
        result.current.startMinuteCallback(); // Call multiple times
      });

      // Advance timer by 1 minute
      act(() => {
        jest.advanceTimersByTime(MINUTE_INTERVAL_MS);
      });

      // Should only be called once despite multiple start calls
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle stopMinuteCallback when no callback is running', () => {
      const { result } = renderQuizStoreHook();

      // Should not throw error when stopping non-existent callback
      act(() => {
        result.current.stopMinuteCallback();
      });

      expect(result.current.minuteCallback).toBeNull();
    });
  });

  describe('User Answers Methods (Lines 544-557)', () => {
    // Shared helper functions to avoid nested function violations (S2004) and duplicated functions (S4144)
    const setupUserAndSelectAnswer = (
      result: ReturnType<typeof renderQuizStoreHook>['result']
    ) => {
      result.current.setUserId('test-user-id');
      result.current.selectAnswer('q1', 'opt1');
    };

    const setupQuizAndSkipQuestion = (
      result: ReturnType<typeof renderQuizStoreHook>['result']
    ) => {
      result.current.setQuiz(mockSimulado);
      result.current.setUserId('test-user-id');
      result.current.skipQuestion();
    };

    const setupMultipleQuestionsWithStatuses = (
      result: ReturnType<typeof renderQuizStoreHook>['result']
    ) => {
      result.current.setUserId('test-user-id');
      result.current.selectAnswer('q1', 'opt1'); // Answered
      result.current.skipQuestion(); // Skip current question (q1 again, should update)
      result.current.goToNextQuestion(); // Go to q2
      result.current.skipQuestion(); // Skip q2
    };

    const setupUserAnswersForActivity = (
      result: ReturnType<typeof renderQuizStoreHook>['result']
    ) => {
      result.current.setUserId('test-user-id');
      result.current.selectAnswer('q1', 'opt1');
      result.current.goToNextQuestion();
      result.current.skipQuestion();
    };

    const setupQuizOnly = (
      result: ReturnType<typeof renderQuizStoreHook>['result']
    ) => {
      result.current.setQuiz(mockSimulado);
    };

    const setupUserQuizAndSelectAnswer = (
      result: ReturnType<typeof renderQuizStoreHook>['result']
    ) => {
      result.current.setUserId('test-user-id');
      result.current.setQuiz(mockSimulado);
      result.current.selectAnswer('q1', 'opt1');
    };

    const setupUserQuizAndSkip = (
      result: ReturnType<typeof renderQuizStoreHook>['result']
    ) => {
      result.current.setUserId('test-user-id');
      result.current.setQuiz(mockSimulado);
      result.current.skipQuestion(); // This creates an answer with null value
    };

    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
      });
    });

    describe('getUserAnswerByQuestionId', () => {
      it('should return user answer when question is answered', () => {
        const { result } = renderQuizStoreHook();

        act(setupUserAndSelectAnswer.bind(null, result));

        const userAnswer = result.current.getUserAnswerByQuestionId('q1');
        expect(userAnswer).not.toBeNull();
        expect(userAnswer?.questionId).toBe('q1');
        expect(userAnswer?.answer).toBe(null);
        expect(userAnswer?.optionId).toBe('opt1');
      });

      it('should return user answer when question is skipped', () => {
        const { result } = renderQuizStoreHook();

        act(setupQuizAndSkipQuestion.bind(null, result));

        const userAnswer = result.current.getUserAnswerByQuestionId('q1');
        expect(userAnswer).not.toBeNull();
        expect(userAnswer?.questionId).toBe('q1');
        expect(userAnswer?.answer).toBe(null);
        expect(userAnswer?.optionId).toBe(null);
      });

      it('should return null when question is not answered', () => {
        const { result } = renderQuizStoreHook();

        const userAnswer = result.current.getUserAnswerByQuestionId('q1');
        expect(userAnswer).toBeNull();
      });

      it('should return null for non-existent question ID', () => {
        const { result } = renderQuizStoreHook();

        const userAnswer =
          result.current.getUserAnswerByQuestionId('nonexistent');
        expect(userAnswer).toBeNull();
      });
    });

    describe('isQuestionAnsweredByUserAnswers', () => {
      it('should return true when question is answered', () => {
        const { result } = renderQuizStoreHook();

        act(setupUserAndSelectAnswer.bind(null, result));

        expect(result.current.isQuestionAnsweredByUserAnswers('q1')).toBe(true);
      });
    });

    describe('getQuestionStatusFromUserAnswers', () => {
      it('should return answered when question is answered', () => {
        const { result } = renderQuizStoreHook();

        act(setupUserAndSelectAnswer.bind(null, result));

        expect(result.current.getQuestionStatusFromUserAnswers('q1')).toBe(
          'answered'
        );
      });

      it('should return unanswered when question is not answered', () => {
        const { result } = renderQuizStoreHook();

        expect(result.current.getQuestionStatusFromUserAnswers('q1')).toBe(
          'unanswered'
        );
      });

      it('should return skipped when question is skipped', () => {
        const { result } = renderQuizStoreHook();

        act(setupQuizAndSkipQuestion.bind(null, result));

        expect(result.current.getQuestionStatusFromUserAnswers('q1')).toBe(
          'skipped'
        );
      });

      it('should return unanswered for non-existent question ID', () => {
        const { result } = renderQuizStoreHook();

        expect(
          result.current.getQuestionStatusFromUserAnswers('nonexistent')
        ).toBe('unanswered');
      });

      it('should handle multiple questions with different statuses', () => {
        const { result } = renderQuizStoreHook();

        act(setupMultipleQuestionsWithStatuses.bind(null, result));

        expect(result.current.getQuestionStatusFromUserAnswers('q1')).toBe(
          'skipped'
        );
        expect(result.current.getQuestionStatusFromUserAnswers('q2')).toBe(
          'skipped'
        );
      });
    });

    describe('getUserAnswersForActivity', () => {
      it('should return all user answers for the activity', () => {
        const { result } = renderQuizStoreHook();

        act(setupUserAnswersForActivity.bind(null, result));

        const userAnswers = result.current.getUserAnswersForActivity();
        expect(userAnswers).toHaveLength(2);

        const q1Answer = findAnswerByQuestionId(userAnswers, 'q1');
        const q2Answer = findAnswerByQuestionId(userAnswers, 'q2');

        expect(q1Answer?.optionId).toBe('opt1');
        expect(q2Answer?.optionId).toBe(null);
      });

      it('should return empty array when no answers are given', () => {
        const { result } = renderQuizStoreHook();

        const userAnswers = result.current.getUserAnswersForActivity();
        expect(userAnswers).toHaveLength(0);
      });

      it('should return user answers with correct structure', () => {
        const { result } = renderQuizStoreHook();

        act(setupUserAndSelectAnswer.bind(null, result));

        const userAnswers = result.current.getUserAnswersForActivity();
        expect(userAnswers).toHaveLength(1);

        const answer = userAnswers[0];
        expect(answer).toHaveProperty('questionId');
        expect(answer).toHaveProperty('activityId');
        expect(answer).toHaveProperty('userId');
        expect(answer).toHaveProperty('answer');
        expect(answer).toHaveProperty('optionId');

        expect(answer.questionId).toBe('q1');
        expect(answer.answer).toBe(null);
        expect(answer.optionId).toBe('opt1');
      });

      it('should return false when no answer is found for isQuestionAnsweredByUserAnswers', () => {
        const { result } = renderQuizStoreHook();

        act(setupQuizOnly.bind(null, result));

        // Test with a questionId that doesn't exist in userAnswers
        const isAnswered = result.current.isQuestionAnsweredByUserAnswers(
          'nonexistent-question'
        );
        expect(isAnswered).toBe(false);
      });

      it('should return true when answer exists and is not null for isQuestionAnsweredByUserAnswers', () => {
        const { result } = renderQuizStoreHook();

        act(setupUserQuizAndSelectAnswer.bind(null, result));

        const isAnswered = result.current.isQuestionAnsweredByUserAnswers('q1');
        expect(isAnswered).toBe(true);
      });

      it('should return false when answer exists but is null (skipped question) for isQuestionAnsweredByUserAnswers', () => {
        const { result } = renderQuizStoreHook();

        act(setupUserQuizAndSkip.bind(null, result));

        const isAnswered = result.current.isQuestionAnsweredByUserAnswers('q1');
        expect(isAnswered).toBe(false);
      });
    });
  });

  describe('Specific Line Coverage Tests', () => {
    describe('startTimer isFinished guard', () => {
      // Helper functions to avoid nested function violations (S2004)
      const setupQuizFinishAndStartTimer = (
        result: ReturnType<typeof renderQuizStoreHook>['result']
      ) => {
        result.current.setQuiz(mockSimulado);
        result.current.finishQuiz(); // Set isFinished to true
        result.current.startTimer(); // Try to start timer
      };

      const setupQuizAndStartTimer = (
        result: ReturnType<typeof renderQuizStoreHook>['result']
      ) => {
        result.current.setQuiz(mockSimulado);
        result.current.startTimer(); // Start timer when not finished
      };

      const advanceTimers = () => {
        jest.advanceTimersByTime(1000);
      };

      const setupQuizAndStart = (
        result: ReturnType<typeof renderQuizStoreHook>['result']
      ) => {
        result.current.setQuiz(mockSimulado);
        result.current.startQuiz(); // Start quiz normally
      };

      const setupFinishAndStartTimer = (
        result: ReturnType<typeof renderQuizStoreHook>['result']
      ) => {
        result.current.finishQuiz(); // Finish the quiz
        result.current.startTimer(); // Try to start timer again
        jest.advanceTimersByTime(1000);
      };

      beforeEach(() => {
        // Clear any existing timers
        jest.clearAllTimers();
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should not start timer when quiz is finished', () => {
        const { result } = renderQuizStoreHook();

        act(setupQuizFinishAndStartTimer.bind(null, result));

        // Timer should not be running because quiz is finished
        act(advanceTimers);

        expect(result.current.timeElapsed).toBe(0);
      });

      it('should start timer normally when quiz is not finished', () => {
        const { result } = renderQuizStoreHook();

        act(setupQuizAndStartTimer.bind(null, result));

        act(advanceTimers);

        expect(result.current.timeElapsed).toBe(1);
      });

      it('should prevent timer from starting after quiz is finished', () => {
        const { result } = renderQuizStoreHook();

        act(setupQuizAndStart.bind(null, result));
        act(advanceTimers);

        expect(result.current.timeElapsed).toBe(1);

        act(setupFinishAndStartTimer.bind(null, result));

        // Time should not increase because timer is blocked by isFinished guard
        expect(result.current.timeElapsed).toBe(1);
      });
    });
  });

  describe('setUserAnswers Tests', () => {
    it('should set userAnswers correctly', () => {
      const { result } = renderQuizStoreHook();

      const mockUserAnswers = [
        {
          questionId: 'q1',
          activityId: 'activity-1',
          userId: 'user-1',
          answer: 'opt1',
          optionId: 'opt1',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        },
        {
          questionId: 'q2',
          activityId: 'activity-1',
          userId: 'user-1',
          answer: null,
          optionId: null,
          questionType: QUESTION_TYPE.ALTERNATIVA,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        },
      ];

      act(() => {
        result.current.setUserAnswers(mockUserAnswers);
      });

      expect(result.current.getUserAnswers()).toEqual(mockUserAnswers);
    });

    it('should replace existing userAnswers when setUserAnswers is called', () => {
      const { result } = renderQuizStoreHook();

      const initialUserAnswers = [
        {
          questionId: 'q1',
          activityId: 'activity-1',
          userId: 'user-1',
          answer: 'opt1',
          optionId: 'opt1',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        },
      ];

      const newUserAnswers = [
        {
          questionId: 'q2',
          activityId: 'activity-1',
          userId: 'user-1',
          answer: 'opt2',
          optionId: 'opt2',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
        },
      ];

      act(() => {
        result.current.setUserAnswers(initialUserAnswers);
      });

      expect(result.current.getUserAnswers()).toEqual(initialUserAnswers);

      act(() => {
        result.current.setUserAnswers(newUserAnswers);
      });

      expect(result.current.getUserAnswers()).toEqual(newUserAnswers);
      expect(result.current.getUserAnswers()).not.toEqual(initialUserAnswers);
    });
  });

  describe('skipCurrentQuestionIfUnanswered Tests', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
      });
    });

    it('should skip current question when no answer is provided', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // Não responder a questão atual
        result.current.skipCurrentQuestionIfUnanswered();
      });

      // Verifica se a questão foi marcada como pulada
      expect(result.current.isQuestionSkipped('q1')).toBe(true);

      // Verifica se foi criado um userAnswer com valores null
      const userAnswer = result.current.getUserAnswerByQuestionId('q1');
      expect(userAnswer).toBeDefined();
      expect(userAnswer?.optionId).toBe(null);
      expect(userAnswer?.answer).toBe(null);
      expect(userAnswer?.answerStatus).toBe(ANSWER_STATUS.PENDENTE_AVALIACAO);
    });

    it('should skip current question when answer is null', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // Simular uma resposta null (questão não respondida)
        result.current.selectAnswer('q1', 'opt1');
        result.current.selectAnswer('q1', null as unknown as string); // Simula resposta vazia
        result.current.skipCurrentQuestionIfUnanswered();
      });

      // Verifica se a questão foi marcada como pulada
      expect(result.current.isQuestionSkipped('q1')).toBe(true);

      // Verifica se foi criado um userAnswer com valores null
      const userAnswer = result.current.getUserAnswerByQuestionId('q1');
      expect(userAnswer).toBeDefined();
      expect(userAnswer?.optionId).toBe(null);
      expect(userAnswer?.answer).toBe(null);
    });

    it('should not skip current question when answer is already provided', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // Responder a questão atual
        result.current.selectAnswer('q1', 'opt1');
        result.current.skipCurrentQuestionIfUnanswered();
      });

      // Verifica se a questão NÃO foi marcada como pulada
      expect(result.current.isQuestionSkipped('q1')).toBe(false);

      // Verifica se a resposta original foi mantida
      const userAnswer = result.current.getUserAnswerByQuestionId('q1');
      expect(userAnswer?.optionId).toBe('opt1');
      expect(userAnswer?.answer).toBe(null); // Para questões ALTERNATIVA, answer é sempre null
    });

    it('should do nothing when no current question exists', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        // Reset quiz to null to ensure no current question
        useQuizStore.getState().setQuiz(null as unknown as QuizInterface);
        result.current.setUserId('test-user-id');
        result.current.skipCurrentQuestionIfUnanswered();
      });

      // Verifica se não foi criado nenhum userAnswer
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0);
    });

    it('should do nothing when userId is not set', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        // Não definir userId
        result.current.skipCurrentQuestionIfUnanswered();
      });

      // Verifica se não foi criado nenhum userAnswer (devido à validação de userId)
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0);
    });

    it('should handle dissertative questions correctly', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        // Simular uma questão dissertativa não respondida
        result.current.selectDissertativeAnswer('q1', ''); // Resposta vazia
        result.current.skipCurrentQuestionIfUnanswered();
      });

      // Verifica se a questão foi marcada como pulada
      expect(result.current.isQuestionSkipped('q1')).toBe(true);

      // Verifica se foi criado um userAnswer com valores null
      const userAnswer = result.current.getUserAnswerByQuestionId('q1');
      expect(userAnswer).toBeDefined();
      expect(userAnswer?.optionId).toBe(null);
      expect(userAnswer?.answer).toBe(null);
    });
  });

  describe('skipQuestion userId validation Tests', () => {
    it('should return early when userId is not set in skipQuestion', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        // Don't set userId - it should be empty string by default
        result.current.skipQuestion();
      });

      // Verify that no user answer was created (since userId is falsy)
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toEqual([]);
    });

    it('should return early when userId is empty string in skipQuestion', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId(''); // Set empty string
        result.current.skipQuestion();
      });

      // Verify that no user answer was created (since userId is empty)
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toEqual([]);
    });
  });

  describe('setCurrentQuestion Tests', () => {
    it('should set current question index when question exists in quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should set current question index to 0 when question is first in quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should not change current question index when no quiz is set', () => {
      const { result } = renderQuizStoreHook();
      const initialIndex = result.current.currentQuestionIndex;

      act(() => {
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(initialIndex);
    });

    it('should return early when setCurrentQuestion is called without active quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        // Explicitly reset all quiz types to ensure no active quiz
        result.current.resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const initialIndex = result.current.currentQuestionIndex;

      act(() => {
        result.current.setCurrentQuestion(mockQuestion1);
      });

      // Verify that no state was changed when no active quiz
      expect(result.current.currentQuestionIndex).toBe(initialIndex);
      expect(useQuizStore.getState().currentQuestionIndex).toBe(initialIndex);

      // Verify quiz is null
      expect(result.current.quiz).toBeNull();
    });

    it('should not change current question index when question does not exist in quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setCurrentQuestion({
          ...mockQuestion1,
          id: 'non-existent-question',
        });
      });

      expect(result.current.currentQuestionIndex).toBe(0); // Should remain at initial index
    });

    it('should work with atividade quiz type', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockAtividade);
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should work with questionary quiz type', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockQuestionary);
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should work with result variant', () => {
      const { result } = renderQuizStoreHook();

      // Create a mock question result that matches the expected structure
      const mockQuestionResultForVariant: QuestionResult = {
        answers: [
          {
            id: 'result-answer-1',
            questionId: 'q1',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            options: [
              { id: 'opt1', option: '4', isCorrect: true },
              { id: 'opt2', option: '3', isCorrect: false },
            ],
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'result-answer-2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is the capital of France?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Paris is the capital of France',
            options: [
              { id: 'opt1', option: 'London', isCorrect: false },
              { id: 'opt2', option: 'Paris', isCorrect: true },
            ],
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 2,
          correctAnswers: 2,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      // Create a question that matches the result structure
      const questionForResult = {
        ...mockQuestion1,
        id: 'result-answer-2', // This should match the id in questionsResult.answers
      };

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setVariant('result');
        result.current.setQuestionsResult(mockQuestionResultForVariant);
        result.current.setCurrentQuestion(questionForResult);
      });

      // Should set to index 1 (second question) because the questionResult
      // with id 'result-answer-2' has questionId 'q2' which is at index 1
      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('should not change index when questionsResult is not set in result variant', () => {
      const { result } = renderQuizStoreHook();
      const initialIndex = result.current.currentQuestionIndex;

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setVariant('result');
        // Don't set questionsResult
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(initialIndex);
    });

    it('should not change index when question result is not found in result variant', () => {
      const { result } = renderQuizStoreHook();
      const initialIndex = result.current.currentQuestionIndex;

      const mockQuestionResultEmpty: QuestionResult = {
        answers: [],
        statistics: {
          totalAnswered: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 0,
          timeSpent: 0,
        },
      };

      const questionNotInResult = {
        ...mockQuestion1,
        id: 'non-existent-result-id',
      };

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setVariant('result');
        result.current.setQuestionsResult(mockQuestionResultEmpty);
        result.current.setCurrentQuestion(questionNotInResult);
      });

      expect(result.current.currentQuestionIndex).toBe(initialIndex);
    });

    it('should work with result variant when answer.id does not match but questionId does', () => {
      const { result } = renderQuizStoreHook();

      // Create a mock question result where answer.id is different from question.id
      // but answer.questionId matches question.id (testing the fallback logic)
      const mockQuestionResultForFallback: QuestionResult = {
        answers: [
          {
            id: 'different-answer-id', // This doesn't match question.id
            questionId: 'q1', // But this matches question.id
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            options: [
              { id: 'opt1', option: '4', isCorrect: true },
              { id: 'opt2', option: '3', isCorrect: false },
            ],
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 1,
          correctAnswers: 1,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      // Create a question with id 'q1' that will match answer.questionId but not answer.id
      const questionForFallback = {
        ...mockQuestion1,
        id: 'q1', // This matches answer.questionId but not answer.id
      };

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setVariant('result');
        result.current.setQuestionsResult(mockQuestionResultForFallback);
        result.current.setCurrentQuestion(questionForFallback);
      });

      // Should set to index 0 because q1 is the first question in mockSimulado
      expect(result.current.currentQuestionIndex).toBe(0);
    });
  });

  describe('Dissertative Answer Tests', () => {
    const mockDissertativeQuestion = {
      ...mockQuestion1,
      id: 'dissertative-q1',
      questionType: QUESTION_TYPE.DISSERTATIVA,
      options: [], // Dissertative questions don't have options
    };

    const mockSimuladoWithDissertative = {
      ...mockSimulado,
      questions: [mockDissertativeQuestion, mockQuestion2],
    };

    it('should handle dissertative answers correctly in selectAnswer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer(
          'dissertative-q1',
          'Esta é uma resposta dissertativa'
        );
      });

      const userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeTruthy();
      expect(userAnswer?.answer).toBe('Esta é uma resposta dissertativa');
      expect(userAnswer?.optionId).toBeNull();
      expect(userAnswer?.questionType).toBe(QUESTION_TYPE.DISSERTATIVA);
      expect(userAnswer?.answerStatus).toBe(ANSWER_STATUS.PENDENTE_AVALIACAO);
    });

    it('should handle dissertative answers correctly in addUserAnswer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.addUserAnswer(
          'dissertative-q1',
          'Outra resposta dissertativa'
        );
      });

      const userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeTruthy();
      expect(userAnswer?.answer).toBe('Outra resposta dissertativa');
      expect(userAnswer?.optionId).toBeNull();
      expect(userAnswer?.questionType).toBe(QUESTION_TYPE.DISSERTATIVA);
    });

    it('should handle undefined answerId for dissertative questions in addUserAnswer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.addUserAnswer('dissertative-q1', undefined);
      });

      const userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeTruthy();
      expect(userAnswer?.answer).toBeNull(); // answerId || null when answerId is undefined
      expect(userAnswer?.optionId).toBeNull();
      expect(userAnswer?.questionType).toBe(QUESTION_TYPE.DISSERTATIVA);
      expect(userAnswer?.answerStatus).toBe(ANSWER_STATUS.PENDENTE_AVALIACAO);
    });

    it('should handle empty string answerId for dissertative questions in addUserAnswer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.addUserAnswer('dissertative-q1', '');
      });

      const userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeTruthy();
      expect(userAnswer?.answer).toBeNull(); // '' || null results in null
      expect(userAnswer?.optionId).toBeNull();
      expect(userAnswer?.questionType).toBe(QUESTION_TYPE.DISSERTATIVA);
      expect(userAnswer?.answerStatus).toBe(ANSWER_STATUS.PENDENTE_AVALIACAO);
    });

    it('should use selectDissertativeAnswer for dissertative questions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta usando método específico'
        );
      });

      const userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeTruthy();
      expect(userAnswer?.answer).toBe('Resposta usando método específico');
      expect(userAnswer?.optionId).toBeNull();
      expect(userAnswer?.questionType).toBe(QUESTION_TYPE.DISSERTATIVA);
    });

    it('should return early when selectDissertativeAnswer is called for non-dissertative question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectDissertativeAnswer('q1', 'Resposta dissertativa');
      });

      // Verify that no answer was created (since question type doesn't match)
      const currentAnswer = result.current.getCurrentAnswer();
      expect(currentAnswer).toBeUndefined();
    });

    it('should return dissertative answer in getCurrentAnswer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('dissertative-q1', 'Resposta dissertativa');
        result.current.setCurrentQuestion(mockDissertativeQuestion);
      });

      const currentAnswer = result.current.getCurrentAnswer();
      expect(currentAnswer?.answer).toBe('Resposta dissertativa');
    });

    it('should return undefined for empty answers in getCurrentAnswer', () => {
      const { result } = renderQuizStoreHook();

      // Setup quiz with userAnswers containing empty answer
      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.setUserAnswers([
          {
            questionId: 'q1',
            activityId: 'test-activity',
            userId: 'test-user-id',
            answer: null,
            optionId: '',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          },
        ]);
      });

      const currentAnswer = result.current.getCurrentAnswer();
      expect(currentAnswer).toBeUndefined();
    });

    it('should return answer when optionId or answer has valid content', () => {
      const { result } = renderQuizStoreHook();

      // Setup quiz with userAnswers containing valid answer
      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.setUserAnswers([
          {
            questionId: 'q1',
            activityId: 'test-activity',
            userId: 'test-user-id',
            answer: null,
            optionId: 'opt1',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          },
        ]);
      });

      const currentAnswer = result.current.getCurrentAnswer();
      expect(currentAnswer).toBeDefined();
      expect(currentAnswer?.optionId).toBe('opt1');
    });

    it('should count dissertative answers as answered questions', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('dissertative-q1', 'Resposta dissertativa');
        result.current.selectAnswer('q2', 'opt2');
      });

      expect(result.current.getAnsweredQuestions()).toBe(2);
      expect(result.current.isQuestionAnswered('dissertative-q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(true);
    });

    it('should handle selectDissertativeAnswer with existing answer update', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        // First answer
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Primeira resposta dissertativa'
        );
      });

      let userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeTruthy();
      expect(userAnswer?.answer).toBe('Primeira resposta dissertativa');
      expect(userAnswer?.optionId).toBeNull();
      expect(userAnswer?.questionType).toBe(QUESTION_TYPE.DISSERTATIVA);
      expect(userAnswer?.answerStatus).toBe(ANSWER_STATUS.PENDENTE_AVALIACAO);

      // Update the answer
      act(() => {
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta atualizada'
        );
      });

      userAnswer = result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeTruthy();
      expect(userAnswer?.answer).toBe('Resposta atualizada');
      expect(userAnswer?.optionId).toBeNull();
      expect(userAnswer?.questionType).toBe(QUESTION_TYPE.DISSERTATIVA);
      expect(userAnswer?.answerStatus).toBe(ANSWER_STATUS.PENDENTE_AVALIACAO);
    });

    it('should return early when selectDissertativeAnswer is called without userId', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        // Don't set userId
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta sem userId'
        );
      });

      // Verify that no answer was created (since userId is not set)
      const userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeNull();
    });

    it('should return early when selectDissertativeAnswer with empty userId', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId(''); // Empty userId
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta com userId vazio'
        );
      });

      // Verify that no answer was created (since userId is empty)
      const userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeNull();
    });

    it('should handle selectDissertativeAnswer with non-existent question', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectDissertativeAnswer(
          'non-existent-question',
          'Resposta para questão inexistente'
        );
      });

      // Should not create any answer for non-existent question
      const userAnswer = result.current.getUserAnswerByQuestionId(
        'non-existent-question'
      );
      expect(userAnswer).toBeNull();
    });

    it('should handle selectDissertativeAnswer with empty answer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectDissertativeAnswer('dissertative-q1', '');
      });

      const userAnswer =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswer).toBeTruthy();
      expect(userAnswer?.answer).toBe('');
      expect(userAnswer?.optionId).toBeNull();
      expect(userAnswer?.questionType).toBe(QUESTION_TYPE.DISSERTATIVA);
      expect(userAnswer?.answerStatus).toBe(ANSWER_STATUS.PENDENTE_AVALIACAO);
    });

    it('should return early when selectDissertativeAnswer is called without active quiz', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        // Explicitly reset quiz state and clear all quiz types
        result.current.resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
        // Don't set any quiz (bySimulated, byActivity, or byQuestionary)
        result.current.setUserId('test-user-id');
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta dissertativa sem quiz'
        );
      });

      // Verify that no user answers were created when no active quiz
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0);

      // Verify that the method returns early and doesn't create any user answer
      const userAnswerItem =
        result.current.getUserAnswerByQuestionId('dissertative-q1');
      expect(userAnswerItem).toBeNull();
    });
  });

  describe('Answer Status Management Tests', () => {
    it('should set answer status correctly', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.setAnswerStatus('q1', ANSWER_STATUS.RESPOSTA_CORRETA);
      });

      const answerStatus = result.current.getAnswerStatus('q1');
      expect(answerStatus).toBe(ANSWER_STATUS.RESPOSTA_CORRETA);
    });

    it('should return null for non-existent question status', () => {
      const { result } = renderQuizStoreHook();

      const answerStatus = result.current.getAnswerStatus('non-existent');
      expect(answerStatus).toBeNull();
    });

    it('should update existing answer status', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setQuiz(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.setAnswerStatus('q1', ANSWER_STATUS.RESPOSTA_INCORRETA);
        result.current.setAnswerStatus('q1', ANSWER_STATUS.RESPOSTA_CORRETA);
      });

      const answerStatus = result.current.getAnswerStatus('q1');
      expect(answerStatus).toBe(ANSWER_STATUS.RESPOSTA_CORRETA);
    });

    it('should not update status for non-existent answer', () => {
      const { result } = renderQuizStoreHook();

      act(() => {
        result.current.setAnswerStatus(
          'non-existent',
          ANSWER_STATUS.RESPOSTA_CORRETA
        );
      });

      const answerStatus = result.current.getAnswerStatus('non-existent');
      expect(answerStatus).toBeNull();
    });
  });

  describe('getQuestionIndex Tests', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setQuiz(mockSimulado);
        // Add mock QuestionResult for getQuestionIndex to work
        const mockQuestionResultForIndex: QuestionResult = {
          answers: [
            {
              id: 'answer1',
              questionId: 'q1',
              answer: 'opt1',
              selectedOptions: [{ optionId: 'opt1' }],
              answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              statement: 'What is 2 + 2?',
              questionType: QUESTION_TYPE.ALTERNATIVA,
              correctOption: 'opt1',
              difficultyLevel: QUESTION_DIFFICULTY.FACIL,
              solutionExplanation: 'The answer is 4',
              options: [
                { id: 'opt1', option: '4', isCorrect: true },
                { id: 'opt2', option: '3', isCorrect: false },
              ],
              knowledgeMatrix: [
                {
                  areaKnowledge: { id: 'matematica', name: 'Matemática' },
                  subject: {
                    id: 'algebra',
                    name: 'Álgebra',
                    color: '#FF6B6B',
                    icon: 'Calculator',
                  },
                  topic: { id: 'operacoes', name: 'Operações' },
                  subtopic: { id: 'soma', name: 'Soma' },
                  content: { id: 'matematica', name: 'Matemática' },
                },
              ],
              teacherFeedback: null,
              attachment: null,
              score: 100,
              gradedAt: '2024-01-01T00:00:00Z',
              gradedBy: 'system',
            },
            {
              id: 'answer2',
              questionId: 'q2',
              answer: 'opt2',
              selectedOptions: [{ optionId: 'opt2' }],
              answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              statement: 'What is the capital of France?',
              questionType: QUESTION_TYPE.ALTERNATIVA,
              correctOption: 'opt2',
              difficultyLevel: QUESTION_DIFFICULTY.FACIL,
              solutionExplanation: 'Paris is the capital of France',
              options: [
                { id: 'opt1', option: 'London', isCorrect: false },
                { id: 'opt2', option: 'Paris', isCorrect: true },
              ],
              knowledgeMatrix: [
                {
                  areaKnowledge: { id: 'geografia', name: 'Geografia' },
                  subject: {
                    id: 'geografia-geral',
                    name: 'Geografia Geral',
                    color: '#4ECDC4',
                    icon: 'Globe',
                  },
                  topic: { id: 'capitais', name: 'Capitais' },
                  subtopic: { id: 'europa', name: 'Europa' },
                  content: { id: 'geografia', name: 'Geografia' },
                },
              ],
              teacherFeedback: null,
              attachment: null,
              score: 100,
              gradedAt: '2024-01-01T00:00:00Z',
              gradedBy: 'system',
            },
          ],
          statistics: {
            totalAnswered: 2,
            correctAnswers: 2,
            incorrectAnswers: 0,
            pendingAnswers: 0,
            score: 100,
            timeSpent: 120,
          },
        };
        useQuizStore.getState().setQuestionsResult(mockQuestionResultForIndex);
      });
    });

    it('should return correct question index for existing questions', () => {
      const { result } = renderQuizStoreHook();

      const questionIndex1 = result.current.getQuestionIndex('q1');
      const questionIndex2 = result.current.getQuestionIndex('q2');

      expect(questionIndex1).toBe(1); // First question (index 0 + 1)
      expect(questionIndex2).toBe(2); // Second question (index 1 + 1)
    });

    it('should return 0 when no quiz is set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          quiz: null,
        });
      });

      const { result } = renderQuizStoreHook();
      const questionIndex = result.current.getQuestionIndex('q1');

      expect(questionIndex).toBe(0);
    });

    it('should return 0 when quiz has no questions', () => {
      const emptySimulado = {
        id: 'empty-simulado',
        title: 'Empty Quiz',
        type: QUIZ_TYPE.SIMULADO,
        subtype: 'Simulado',
        difficulty: 'MEDIO',
        notification: null,
        status: 'ATIVO',
        startDate: '2024-01-01',
        finalDate: '2024-12-31',
        canRetry: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        questions: [],
      };

      const emptyQuestionResult: QuestionResult = {
        answers: [],
        statistics: {
          totalAnswered: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 0,
          timeSpent: 0,
        },
      };

      act(() => {
        useQuizStore.getState().setQuiz(emptySimulado);
        useQuizStore.getState().setQuestionsResult(emptyQuestionResult);
      });

      const { result } = renderQuizStoreHook();
      const questionIndex = result.current.getQuestionIndex('q1');

      expect(questionIndex).toBe(0);
    });

    it('should return 0 for non-existent question ID', () => {
      const { result } = renderQuizStoreHook();

      const questionIndex = result.current.getQuestionIndex(
        'non-existent-question'
      );

      expect(questionIndex).toBe(0);
    });

    it('should work with byActivity quiz type', () => {
      const mockAtividade = {
        id: 'atividade-1',
        title: 'Test Atividade',
        type: QUIZ_TYPE.ATIVIDADE,
        subtype: QUIZ_TYPE.ATIVIDADE,
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [mockQuestion1, mockQuestion2],
      };

      const mockQuestionResultActivity: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: 'q1',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is the capital of France?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Paris is the capital of France',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 2,
          correctAnswers: 2,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockAtividade);
        useQuizStore.getState().setQuestionsResult(mockQuestionResultActivity);
      });

      const { result } = renderQuizStoreHook();

      const questionIndex1 = result.current.getQuestionIndex('q1');
      const questionIndex2 = result.current.getQuestionIndex('q2');

      expect(questionIndex1).toBe(1);
      expect(questionIndex2).toBe(2);
    });

    it('should work with byQuestionary quiz type', () => {
      const mockQuestionary = {
        id: 'aula-1',
        title: 'Test Aula',
        type: QUIZ_TYPE.QUESTIONARIO,
        subtype: 'AULA',
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [mockQuestion1, mockQuestion2],
      };

      const mockQuestionResultQuestionary: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: 'q1',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is the capital of France?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Paris is the capital of France',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 2,
          correctAnswers: 2,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockQuestionary);
        useQuizStore
          .getState()
          .setQuestionsResult(mockQuestionResultQuestionary);
      });

      const { result } = renderQuizStoreHook();

      const questionIndex1 = result.current.getQuestionIndex('q1');
      const questionIndex2 = result.current.getQuestionIndex('q2');

      expect(questionIndex1).toBe(1);
      expect(questionIndex2).toBe(2);
    });

    it('should handle case sensitivity in question ID', () => {
      const { result } = renderQuizStoreHook();

      const questionIndexLower = result.current.getQuestionIndex('q1');
      const questionIndexUpper = result.current.getQuestionIndex('Q1');

      expect(questionIndexLower).toBe(1);
      expect(questionIndexUpper).toBe(0); // Different case, not found
    });

    it('should handle special characters in question ID', () => {
      const questionWithSpecialChars = {
        ...mockQuestion1,
        id: 'q1-special@#$%',
      };

      const simuladoWithSpecialChars = {
        ...mockSimulado,
        questions: [questionWithSpecialChars, mockQuestion2],
      };

      const mockQuestionResultSpecial: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: 'q1-special@#$%',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is the capital of France?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Paris is the capital of France',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 2,
          correctAnswers: 2,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      act(() => {
        useQuizStore.getState().setQuiz(simuladoWithSpecialChars);
        useQuizStore.getState().setQuestionsResult(mockQuestionResultSpecial);
      });

      const { result } = renderQuizStoreHook();

      const questionIndex = result.current.getQuestionIndex('q1-special@#$%');

      expect(questionIndex).toBe(1);
    });

    it('should handle very long question ID', () => {
      const longId = 'q'.repeat(1000);
      const questionWithLongId = {
        ...mockQuestion1,
        id: longId,
      };

      const simuladoWithLongId = {
        ...mockSimulado,
        questions: [questionWithLongId, mockQuestion2],
      };

      const mockQuestionResultLong: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: longId,
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is the capital of France?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Paris is the capital of France',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 2,
          correctAnswers: 2,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      act(() => {
        useQuizStore.getState().setQuiz(simuladoWithLongId);
        useQuizStore.getState().setQuestionsResult(mockQuestionResultLong);
      });

      const { result } = renderQuizStoreHook();

      const questionIndex = result.current.getQuestionIndex(longId);

      expect(questionIndex).toBe(1);
    });

    it('should handle numeric question ID as string', () => {
      const questionWithNumericId = {
        ...mockQuestion1,
        id: '12345',
      };

      const simuladoWithNumericId = {
        ...mockSimulado,
        questions: [questionWithNumericId, mockQuestion2],
      };

      const mockQuestionResultNumeric: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: '12345',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is the capital of France?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Paris is the capital of France',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 2,
          correctAnswers: 2,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      act(() => {
        useQuizStore.getState().setQuiz(simuladoWithNumericId);
        useQuizStore.getState().setQuestionsResult(mockQuestionResultNumeric);
      });

      const { result } = renderQuizStoreHook();

      const questionIndex = result.current.getQuestionIndex('12345');

      expect(questionIndex).toBe(1);
    });

    it('should return correct index when quiz has many questions', () => {
      const manyQuestions = Array.from({ length: 100 }, (_, index) => ({
        ...mockQuestion1,
        id: `q${index + 1}`,
      }));

      const simuladoWithManyQuestions = {
        ...mockSimulado,
        questions: manyQuestions,
      };

      const mockQuestionResultMany: QuestionResult = {
        answers: Array.from({ length: 100 }, (_, index) => ({
          id: `answer${index + 1}`,
          questionId: `q${index + 1}`,
          answer: 'opt1',
          selectedOptions: [{ optionId: 'opt1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: `Question ${index + 1}`,
          questionType: QUESTION_TYPE.ALTERNATIVA,
          correctOption: 'opt1',
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          solutionExplanation: 'The answer is correct',
          knowledgeMatrix: [
            {
              areaKnowledge: { id: 'matematica', name: 'Matemática' },
              subject: {
                id: 'algebra',
                name: 'Álgebra',
                color: '#FF6B6B',
                icon: 'Calculator',
              },
              topic: { id: 'operacoes', name: 'Operações' },
              subtopic: { id: 'soma', name: 'Soma' },
              content: { id: 'matematica', name: 'Matemática' },
            },
          ],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
        })),
        statistics: {
          totalAnswered: 100,
          correctAnswers: 100,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      act(() => {
        useQuizStore.getState().setQuiz(simuladoWithManyQuestions);
        useQuizStore.getState().setQuestionsResult(mockQuestionResultMany);
      });

      const { result } = renderQuizStoreHook();

      const questionIndex1 = result.current.getQuestionIndex('q1');
      const questionIndex50 = result.current.getQuestionIndex('q50');
      const questionIndex100 = result.current.getQuestionIndex('q100');

      expect(questionIndex1).toBe(1);
      expect(questionIndex50).toBe(50);
      expect(questionIndex100).toBe(100);
    });

    it('should handle quiz type switching correctly', () => {
      const { result } = renderQuizStoreHook();

      const baseQuestionResult: QuestionResult = {
        answers: [
          {
            id: 'answer1',
            questionId: 'q1',
            answer: 'opt1',
            selectedOptions: [{ optionId: 'opt1' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is 2 + 2?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt1',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'The answer is 4',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'matematica', name: 'Matemática' },
                subject: {
                  id: 'algebra',
                  name: 'Álgebra',
                  color: '#FF6B6B',
                  icon: 'Calculator',
                },
                topic: { id: 'operacoes', name: 'Operações' },
                subtopic: { id: 'soma', name: 'Soma' },
                content: { id: 'matematica', name: 'Matemática' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
          {
            id: 'answer2',
            questionId: 'q2',
            answer: 'opt2',
            selectedOptions: [{ optionId: 'opt2' }],
            answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            statement: 'What is the capital of France?',
            questionType: QUESTION_TYPE.ALTERNATIVA,
            correctOption: 'opt2',
            difficultyLevel: QUESTION_DIFFICULTY.FACIL,
            solutionExplanation: 'Paris is the capital of France',
            knowledgeMatrix: [
              {
                areaKnowledge: { id: 'geografia', name: 'Geografia' },
                subject: {
                  id: 'geografia-geral',
                  name: 'Geografia Geral',
                  color: '#4ECDC4',
                  icon: 'Globe',
                },
                topic: { id: 'capitais', name: 'Capitais' },
                subtopic: { id: 'europa', name: 'Europa' },
                content: { id: 'geografia', name: 'Geografia' },
              },
            ],
            teacherFeedback: null,
            attachment: null,
            score: 100,
            gradedAt: '2024-01-01T00:00:00Z',
            gradedBy: 'system',
          },
        ],
        statistics: {
          totalAnswered: 2,
          correctAnswers: 2,
          incorrectAnswers: 0,
          pendingAnswers: 0,
          score: 100,
          timeSpent: 120,
        },
      };

      // Start with bySimulated
      let questionIndex = result.current.getQuestionIndex('q1');
      expect(questionIndex).toBe(1);

      // Switch to byActivity
      const mockAtividade = {
        id: 'atividade-1',
        title: 'Test Atividade',
        type: QUIZ_TYPE.ATIVIDADE,
        subtype: QUIZ_TYPE.ATIVIDADE,
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockAtividade);
        useQuizStore.getState().setQuestionsResult(baseQuestionResult);
      });

      questionIndex = result.current.getQuestionIndex('q1');
      expect(questionIndex).toBe(1);

      // Switch to byQuestionary
      const mockQuestionary = {
        id: 'aula-1',
        title: 'Test Aula',
        type: QUIZ_TYPE.QUESTIONARIO,
        subtype: 'AULA',
        difficulty: null,
        notification: null,
        status: 'active',
        startDate: null,
        finalDate: null,
        canRetry: true,
        createdAt: null,
        updatedAt: null,
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockQuestionary);
        useQuizStore.getState().setQuestionsResult(baseQuestionResult);
      });

      questionIndex = result.current.getQuestionIndex('q1');
      expect(questionIndex).toBe(1);
    });

    it('should handle empty string question ID', () => {
      const { result } = renderQuizStoreHook();

      const questionIndex = result.current.getQuestionIndex('');

      expect(questionIndex).toBe(0);
    });

    it('should handle null question ID', () => {
      const { result } = renderQuizStoreHook();

      const questionIndex = result.current.getQuestionIndex(
        null as unknown as string
      );

      expect(questionIndex).toBe(0);
    });

    it('should handle undefined question ID', () => {
      const { result } = renderQuizStoreHook();

      const questionIndex = result.current.getQuestionIndex(
        undefined as unknown as string
      );

      expect(questionIndex).toBe(0);
    });
  });

  describe('Question Result Functions', () => {
    // Helper functions to avoid nested function violations (S2004)
    const resetQuestionResults = () => {
      useQuizStore
        .getState()
        .setQuestionsResult(null as unknown as QuestionResult);
      useQuizStore
        .getState()
        .setCurrentQuestionResult(null as unknown as QuestionResult['answers']);
    };

    const setQuestionResultAction = (
      result: ReturnType<typeof renderQuizStoreHook>['result'],
      data: QuestionResult | null
    ) => {
      result.current.setQuestionResult(data as QuestionResult);
    };

    // Reset store state before each test in this describe block
    beforeEach(() => {
      act(resetQuestionResults);
    });

    const mockQuestionResult: QuestionResult = {
      answers: [
        {
          id: 'answer1',
          questionId: 'q1',
          answer: 'opt1',
          selectedOptions: [{ optionId: 'opt1' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'What is 2 + 2?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          correctOption: 'opt1',
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          solutionExplanation: 'The answer is 4',
          options: [
            { id: 'opt1', option: '4', isCorrect: true },
            { id: 'opt2', option: '3', isCorrect: false },
          ],
          knowledgeMatrix: [
            {
              areaKnowledge: { id: 'matematica', name: 'Matemática' },
              subject: {
                id: 'algebra',
                name: 'Álgebra',
                color: '#FF6B6B',
                icon: 'Calculator',
              },
              topic: { id: 'operacoes', name: 'Operações' },
              subtopic: { id: 'soma', name: 'Soma' },
              content: { id: 'matematica', name: 'Matemática' },
            },
          ],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
        },
        {
          id: 'answer2',
          questionId: 'q2',
          answer: 'opt2',
          selectedOptions: [{ optionId: 'opt2' }],
          answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statement: 'What is the capital of France?',
          questionType: QUESTION_TYPE.ALTERNATIVA,
          correctOption: 'opt2',
          difficultyLevel: QUESTION_DIFFICULTY.FACIL,
          solutionExplanation: 'Paris is the capital of France',
          options: [
            { id: 'opt1', option: 'London', isCorrect: false },
            { id: 'opt2', option: 'Paris', isCorrect: true },
          ],
          knowledgeMatrix: [
            {
              areaKnowledge: { id: 'geografia', name: 'Geografia' },
              subject: {
                id: 'geografia-geral',
                name: 'Geografia Geral',
                color: '#4ECDC4',
                icon: 'Globe',
              },
              topic: { id: 'capitais', name: 'Capitais' },
              subtopic: { id: 'europa', name: 'Europa' },
              content: { id: 'geografia', name: 'Geografia' },
            },
          ],
          teacherFeedback: null,
          attachment: null,
          score: 100,
          gradedAt: '2024-01-01T00:00:00Z',
          gradedBy: 'system',
        },
      ],
      statistics: {
        totalAnswered: 2,
        correctAnswers: 2,
        incorrectAnswers: 0,
        pendingAnswers: 0,
        score: 100,
        timeSpent: 120,
      },
    };

    describe('setQuestionsResult', () => {
      it('should set questions result data', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        expect(useQuizStore.getState().questionsResult).toEqual(
          mockQuestionResult
        );
      });

      it('should handle null questions result', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, null));

        expect(useQuizStore.getState().questionsResult).toBeNull();
      });
    });

    describe('setQuestionResult', () => {
      it('should set question result data', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionResultAction.bind(null, result, mockQuestionResult));

        expect(useQuizStore.getState().questionsResult).toEqual(
          mockQuestionResult
        );
      });

      it('should handle null question result', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionResultAction.bind(null, result, null));

        expect(useQuizStore.getState().questionsResult).toBeNull();
      });

      it('should replace existing question result when called multiple times', () => {
        const { result } = renderQuizStoreHook();

        const firstQuestionResult: QuestionResult = {
          answers: [
            {
              id: 'answer1',
              questionId: 'q1',
              answer: 'opt1',
              selectedOptions: [{ optionId: 'opt1' }],
              answerStatus: ANSWER_STATUS.RESPOSTA_CORRETA,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              statement: 'First question',
              questionType: QUESTION_TYPE.ALTERNATIVA,
              correctOption: 'opt1',
              difficultyLevel: QUESTION_DIFFICULTY.FACIL,
              solutionExplanation: 'First explanation',
              knowledgeMatrix: [
                {
                  areaKnowledge: { id: 'matematica', name: 'Matemática' },
                  subject: {
                    id: 'algebra',
                    name: 'Álgebra',
                    color: '#FF6B6B',
                    icon: 'Calculator',
                  },
                  topic: { id: 'operacoes', name: 'Operações' },
                  subtopic: { id: 'soma', name: 'Soma' },
                  content: { id: 'matematica', name: 'Matemática' },
                },
              ],
              teacherFeedback: null,
              attachment: null,
              score: 100,
              gradedAt: '2024-01-01T00:00:00Z',
              gradedBy: 'system',
            },
          ],
          statistics: {
            totalAnswered: 1,
            correctAnswers: 1,
            incorrectAnswers: 0,
            pendingAnswers: 0,
            score: 100,
            timeSpent: 120,
          },
        };

        const secondQuestionResult: QuestionResult = {
          answers: [
            {
              id: 'answer2',
              questionId: 'q2',
              answer: 'opt2',
              selectedOptions: [{ optionId: 'opt2' }],
              answerStatus: ANSWER_STATUS.RESPOSTA_INCORRETA,
              createdAt: '2024-01-02T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
              statement: 'Second question',
              questionType: QUESTION_TYPE.ALTERNATIVA,
              correctOption: 'opt1',
              difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
              solutionExplanation: 'Second explanation',
              knowledgeMatrix: [
                {
                  areaKnowledge: { id: 'geografia', name: 'Geografia' },
                  subject: {
                    id: 'geografia-geral',
                    name: 'Geografia Geral',
                    color: '#4ECDC4',
                    icon: 'Globe',
                  },
                  topic: { id: 'capitais', name: 'Capitais' },
                  subtopic: { id: 'europa', name: 'Europa' },
                  content: { id: 'geografia', name: 'Geografia' },
                },
              ],
              teacherFeedback: null,
              attachment: null,
              score: 0,
              gradedAt: '2024-01-02T00:00:00Z',
              gradedBy: 'system',
            },
          ],
          statistics: {
            totalAnswered: 1,
            correctAnswers: 0,
            incorrectAnswers: 1,
            pendingAnswers: 0,
            score: 0,
            timeSpent: 0,
          },
        };

        // Set first result
        act(setQuestionResultAction.bind(null, result, firstQuestionResult));

        expect(useQuizStore.getState().questionsResult).toEqual(
          firstQuestionResult
        );

        // Set second result (should replace the first)
        act(setQuestionResultAction.bind(null, result, secondQuestionResult));

        expect(useQuizStore.getState().questionsResult).toEqual(
          secondQuestionResult
        );
        expect(useQuizStore.getState().questionsResult).not.toEqual(
          firstQuestionResult
        );
      });

      it('should handle undefined question result', () => {
        const { result } = renderQuizStoreHook();

        act(
          setQuestionResultAction.bind(
            null,
            result,
            undefined as unknown as QuestionResult
          )
        );

        expect(useQuizStore.getState().questionsResult).toBeUndefined();
      });

      it('should handle empty question result', () => {
        const { result } = renderQuizStoreHook();

        const emptyQuestionResult: QuestionResult = {
          answers: [],
          statistics: {
            totalAnswered: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            pendingAnswers: 0,
            score: 0,
            timeSpent: 0,
          },
        };

        act(setQuestionResultAction.bind(null, result, emptyQuestionResult));

        expect(useQuizStore.getState().questionsResult).toEqual(
          emptyQuestionResult
        );
        expect(useQuizStore.getState().questionsResult?.answers).toHaveLength(
          0
        );
        expect(
          useQuizStore.getState().questionsResult?.statistics.totalAnswered
        ).toBe(0);
      });

      it('should persist question result data across store access', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionResultAction.bind(null, result, mockQuestionResult));

        // Access through store state
        const storeState = useQuizStore.getState();
        expect(storeState.questionsResult).toEqual(mockQuestionResult);

        // Access through hook
        expect(result.current.getQuestionResult()).toEqual(mockQuestionResult);
      });
    });

    describe('getQuestionResult', () => {
      it('should return complete question result data', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        const questionResult = result.current.getQuestionResult();

        expect(questionResult).toEqual(mockQuestionResult);
      });

      it('should return null when no question result is set', () => {
        const { result } = renderQuizStoreHook();

        const questionResult = result.current.getQuestionResult();

        expect(questionResult).toBeNull();
      });
    });

    describe('getQuestionResultStatistics', () => {
      it('should return statistics from question result', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics).toEqual(mockQuestionResult.statistics);
      });

      it('should return null when no question result is set', () => {
        const { result } = renderQuizStoreHook();

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics).toBeNull();
      });

      it('should return null when question result has no statistics', () => {
        const { result } = renderQuizStoreHook();

        const questionResultWithoutStats: QuestionResult = {
          answers: mockQuestionResult.answers,
          statistics: null as unknown as QuestionResult['statistics'],
        };

        act(
          setQuestionsResultAction.bind(
            null,
            result,
            questionResultWithoutStats
          )
        );

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics).toBeNull();
      });

      it('should include timeSpent in statistics', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics?.timeSpent).toBe(120);
        expect(typeof statistics?.timeSpent).toBe('number');
      });

      it('should handle different timeSpent values correctly', () => {
        const { result } = renderQuizStoreHook();

        const questionResultWithDifferentTime: QuestionResult = {
          ...mockQuestionResult,
          statistics: {
            ...mockQuestionResult.statistics,
            timeSpent: 300,
          },
        };

        act(
          setQuestionsResultAction.bind(
            null,
            result,
            questionResultWithDifferentTime
          )
        );

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics?.timeSpent).toBe(300);
      });

      it('should handle zero timeSpent correctly', () => {
        const { result } = renderQuizStoreHook();

        const questionResultWithZeroTime: QuestionResult = {
          ...mockQuestionResult,
          statistics: {
            ...mockQuestionResult.statistics,
            timeSpent: 0,
          },
        };

        act(
          setQuestionsResultAction.bind(
            null,
            result,
            questionResultWithZeroTime
          )
        );

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics?.timeSpent).toBe(0);
      });
    });

    describe('getQuestionResultByQuestionId', () => {
      it('should return answer for existing question ID', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        const answer = result.current.getQuestionResultByQuestionId('q1');

        expect(answer).toEqual(mockQuestionResult.answers[0]);
      });

      it('should return null for non-existing question ID', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        const answer = result.current.getQuestionResultByQuestionId('q999');

        expect(answer).toBeNull();
      });

      it('should return null when no question result is set', () => {
        const { result } = renderQuizStoreHook();

        const answer = result.current.getQuestionResultByQuestionId('q1');

        expect(answer).toBeNull();
      });

      it('should handle empty question ID', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        const answer = result.current.getQuestionResultByQuestionId('');

        expect(answer).toBeNull();
      });

      it('should handle multiple answers for same question ID', () => {
        const { result } = renderQuizStoreHook();

        const questionResultWithDuplicates: QuestionResult = {
          ...mockQuestionResult,
          answers: [
            ...mockQuestionResult.answers,
            {
              ...mockQuestionResult.answers[0],
              id: 'answer1_duplicate',
            },
          ],
        };

        act(
          setQuestionsResultAction.bind(
            null,
            result,
            questionResultWithDuplicates
          )
        );

        const answer = result.current.getQuestionResultByQuestionId('q1');

        // Should return the first match
        expect(answer?.id).toBe('answer1');
      });
    });

    describe('setCurrentQuestionResult', () => {
      it('should set current question result data', () => {
        const { result } = renderQuizStoreHook();

        const currentQuestionResult = mockQuestionResult.answers;

        act(
          setCurrentQuestionResultAction.bind(
            null,
            result,
            currentQuestionResult
          )
        );

        expect(useQuizStore.getState().currentQuestionResult).toEqual(
          currentQuestionResult
        );
      });

      it('should handle null current question result', () => {
        const { result } = renderQuizStoreHook();

        act(setCurrentQuestionResultAction.bind(null, result, null));

        expect(useQuizStore.getState().currentQuestionResult).toBeNull();
      });
    });

    describe('getCurrentQuestionResult', () => {
      it('should return current question result data', () => {
        const { result } = renderQuizStoreHook();

        const currentQuestionResult = mockQuestionResult.answers;

        act(
          setCurrentQuestionResultAction.bind(
            null,
            result,
            currentQuestionResult
          )
        );

        const retrieved = result.current.getCurrentQuestionResult();

        expect(retrieved).toEqual(currentQuestionResult);
      });

      it('should return null when no current question result is set', () => {
        const { result } = renderQuizStoreHook();

        const retrieved = result.current.getCurrentQuestionResult();

        expect(retrieved).toBeNull();
      });
    });

    describe('Integration tests', () => {
      it('should work correctly with question result and statistics together', () => {
        const { result } = renderQuizStoreHook();

        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        // Test getting specific question result
        const q1Result = result.current.getQuestionResultByQuestionId('q1');
        expect(q1Result?.answerStatus).toBe(ANSWER_STATUS.RESPOSTA_CORRETA);

        // Test getting statistics
        const stats = result.current.getQuestionResultStatistics();
        expect(stats?.correctAnswers).toBe(2);
        expect(stats?.score).toBe(100);

        // Test getting complete result
        const fullResult = result.current.getQuestionResult();
        expect(fullResult?.answers).toHaveLength(2);
      });

      it('should handle question result updates correctly', () => {
        const { result } = renderQuizStoreHook();

        // Set initial result
        act(setQuestionsResultAction.bind(null, result, mockQuestionResult));

        expect(
          result.current.getQuestionResultStatistics()?.correctAnswers
        ).toBe(2);

        // Update with different result
        const updatedResult: QuestionResult = {
          ...mockQuestionResult,
          statistics: {
            ...mockQuestionResult.statistics,
            correctAnswers: 1,
            incorrectAnswers: 1,
            score: 50,
            timeSpent: 300,
          },
        };

        act(setQuestionsResultAction.bind(null, result, updatedResult));

        expect(
          result.current.getQuestionResultStatistics()?.correctAnswers
        ).toBe(1);
        expect(result.current.getQuestionResultStatistics()?.score).toBe(50);
      });
    });
  });
});
