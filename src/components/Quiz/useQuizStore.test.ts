import { renderHook, act } from '@testing-library/react';
import {
  QUESTION_DIFFICULTY,
  QUESTION_TYPE,
  ANSWER_STATUS,
  useQuizStore,
  QuestionResult,
} from './useQuizStore';

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
  type: 'ENEM',
  subtype: 'Simulado',
  difficulty: 'MEDIO',
  notification: null,
  status: 'ATIVO',
  startDate: new Date('2024-01-01'),
  finalDate: new Date('2024-12-31'),
  canRetry: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  questions: [mockQuestion1, mockQuestion2],
};

const mockAtividade = {
  id: 'atividade-1',
  title: 'Test Atividade',
  questions: [mockQuestion1, mockQuestion2],
};

const mockQuestionary = {
  id: 'aula-1',
  title: 'Test Aula',
  questions: [mockQuestion1, mockQuestion2],
};

describe('useQuizStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useQuizStore.getState().resetQuiz();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useQuizStore());

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
    it('should set bySimulated', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
      });

      expect(result.current.bySimulated).toEqual(mockSimulado);
    });

    it('should set byActivity', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByActivity(mockAtividade);
      });

      expect(result.current.byActivity).toEqual(mockAtividade);
    });

    it('should set byQuestionary', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByQuestionary(mockQuestionary);
      });

      expect(result.current.byQuestionary).toEqual(mockQuestionary);
    });

    it('should set userId', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setUserId('test-user-id');
      });

      expect(result.current.userId).toBe('test-user-id');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setBySimulated(mockSimulado);
      });
    });

    it('should go to next question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.goToNextQuestion();
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('should not go beyond last question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.goToNextQuestion(); // Go to question 1
        result.current.goToNextQuestion(); // Try to go beyond
      });

      expect(result.current.currentQuestionIndex).toBe(1); // Should stay at last question
    });

    it('should go to previous question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.goToNextQuestion(); // Go to question 1
        result.current.goToPreviousQuestion(); // Go back to 0
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should not go before first question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.goToPreviousQuestion(); // Try to go before first
      });

      expect(result.current.currentQuestionIndex).toBe(0); // Should stay at first question
    });

    it('should go to specific question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.goToQuestion(1);
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it('should not go to invalid question index', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.goToQuestion(5); // Invalid index
      });

      expect(result.current.currentQuestionIndex).toBe(0); // Should stay at current
    });
  });

  describe('Quiz Actions', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setBySimulated(mockSimulado);
      });
    });

    it('should select answer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(1); // Apenas as respondidas
      const answeredQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(answeredQuestion?.optionId).toBe('opt1');
    });

    it('should warn and return early when selectAnswer is called without userId set', () => {
      const { result } = renderHook(() => useQuizStore());
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      act(() => {
        result.current.setBySimulated(mockSimulado);
        // Don't set userId - it should be empty string by default
        result.current.selectAnswer('q1', 'opt1');
      });

      // Verify that console.warn was called with the expected message
      expect(consoleSpy).toHaveBeenCalledWith(
        'selectAnswer called before userId is set'
      );

      // Verify that no user answer was created (since userId is falsy)
      const userAnswerItem = result.current.getUserAnswerByQuestionId('q1');
      expect(userAnswerItem).toBeNull();

      // Verify that the question's answer was NOT updated (since the function returns early when userId is falsy)
      const currentQuestion = result.current.getCurrentQuestion();
      expect(currentQuestion?.answer).toBe(null);

      consoleSpy.mockRestore();
    });

    it('should return early when selectAnswer is called with non-existent question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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

    it('should warn and return early when selectMultipleAnswer is called without userId set', () => {
      const { result } = renderHook(() => useQuizStore());
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      act(() => {
        result.current.setBySimulated(mockSimulado);
        // Don't set userId - it should be empty string by default
        result.current.selectMultipleAnswer('q1', ['opt1', 'opt2']);
      });

      // Verify that console.warn was called with the expected message
      expect(consoleSpy).toHaveBeenCalledWith(
        'selectMultipleAnswer called before userId is set'
      );

      // Verify that no user answers were created (since userId is falsy)
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(0);

      consoleSpy.mockRestore();
    });

    it('should handle empty answerIds array in selectMultipleAnswer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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

    it('should skip question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.timeElapsed).toBe(0);
    });

    it('should finish quiz', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.finishQuiz();
      });

      expect(result.current.isFinished).toBe(true);
    });

    it('should reset quiz', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.updateTime(120);
      });

      expect(result.current.timeElapsed).toBe(120);
    });

    it('should start timer when starting quiz', () => {
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz();
        jest.advanceTimersByTime(65000); // Advance 65 seconds (1:05)
      });

      expect(result.current.formatTime(result.current.timeElapsed)).toBe(
        '01:05'
      );
    });

    it('should handle timer with long duration', () => {
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
        useQuizStore.getState().setBySimulated(mockSimulado);
      });
    });

    it('should get current question', () => {
      const { result } = renderHook(() => useQuizStore());

      const currentQuestion = result.current.getCurrentQuestion();

      expect(currentQuestion).toEqual(mockQuestion1);
    });

    it('should get total questions', () => {
      const { result } = renderHook(() => useQuizStore());

      const total = result.current.getTotalQuestions();

      expect(total).toBe(2);
    });

    it('should get answered questions count', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const answered = result.current.getAnsweredQuestions();

      expect(answered).toBe(1);
    });

    it('should get unanswered questions', () => {
      const { result } = renderHook(() => useQuizStore());

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
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());
      expect(result.current.getUnansweredQuestions()).toEqual([]);
    });

    it('should get skipped questions count', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion();
      });

      const skipped = result.current.getSkippedQuestions();

      expect(skipped).toBe(1);
    });

    it('should get progress percentage', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const progress = result.current.getProgress();

      expect(progress).toBe(50); // 1 out of 2 questions = 50%
    });

    it('should check if question is answered', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    // Additional comprehensive tests for isQuestionAnswered
    it('should return false when no quiz is set', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        // Ensure no quiz is set
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
      expect(result.current.isQuestionAnswered('nonexistent')).toBe(false);
    });

    it('should return false when quiz is null', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        // Set quiz to null explicitly
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should return false for non-existent question ID', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
      });

      expect(result.current.isQuestionAnswered('nonexistent')).toBe(false);
      expect(result.current.isQuestionAnswered('invalid-id')).toBe(false);
    });

    it('should return false for question with null answerKey', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
      });

      // Both questions start with answerKey: null
      expect(result.current.isQuestionAnswered('q1')).toBe(false);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    it('should return true for question with valid answerKey', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    it('should return true for question with empty string answerKey', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.addUserAnswer('q1', '');
      });

      // Empty string is converted to null in addUserAnswer
      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should work with byActivity quiz type', () => {
      const mockAtividade = {
        id: 'atividade1',
        title: 'Test Atividade',
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByActivity(mockAtividade);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    it('should work with byQuestionary quiz type', () => {
      const mockQuestionary = {
        id: 'aula1',
        title: 'Test Aula',
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByQuestionary(mockQuestionary);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q2', 'opt2');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
      expect(result.current.isQuestionAnswered('q2')).toBe(true);
    });

    it('should handle multiple answered questions', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.selectAnswer('q2', 'opt2');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(true);
    });

    it('should handle question with answerKey set to null after being answered', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.addUserAnswer('q1', undefined); // Set to null
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should handle question with answerKey set to empty string', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.addUserAnswer('q1', ''); // Set to empty string (converted to null)
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should handle case sensitivity in question ID', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(simuladoWithSpecialChars);
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

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(simuladoWithLongId);
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

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(simuladoWithNumericId);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('12345', 'opt1');
      });

      expect(result.current.isQuestionAnswered('12345')).toBe(true);
      expect(
        result.current.isQuestionAnswered(12345 as unknown as string)
      ).toBe(false); // Should handle type mismatch
    });

    it('should check if question is skipped', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.skipQuestion();
      });

      expect(result.current.isQuestionSkipped('q1')).toBe(true);
      expect(result.current.isQuestionSkipped('q2')).toBe(false);
    });

    it('should get current answer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const currentAnswer = result.current.getCurrentAnswer();

      expect(currentAnswer?.optionId).toBe('opt1');
    });

    it('should get quiz title', () => {
      const { result } = renderHook(() => useQuizStore());

      const title = result.current.getQuizTitle();

      expect(title).toBe('Test Simulado');
    });

    it('should format time correctly', () => {
      const { result } = renderHook(() => useQuizStore());

      expect(result.current.formatTime(65)).toBe('01:05');
      expect(result.current.formatTime(125)).toBe('02:05');
      expect(result.current.formatTime(0)).toBe('00:00');
    });

    it('should get user answers', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const userAnswers = result.current.getUserAnswers();

      expect(userAnswers).toHaveLength(1);
      const answeredQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(answeredQuestion?.optionId).toBe('opt1');
    });

    it('should get unanswered questions from user answers', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const unanswered = result.current.getUnansweredQuestionsFromUserAnswers();

      expect(unanswered).toEqual([2]); // Only question 2 is unanswered
    });

    it('should get questions grouped by subject', () => {
      const { result } = renderHook(() => useQuizStore());

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
        useQuizStore
          .getState()
          .setBySimulated(simuladoWithQuestionWithoutMatrix);
      });

      const { result } = renderHook(() => useQuizStore());
      const grouped = result.current.getQuestionsGroupedBySubject();

      expect(grouped).toHaveProperty('Sem matéria');
      expect(grouped['Sem matéria']).toHaveLength(1);
    });
  });

  describe('getAllCurrentAnswer', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setBySimulated(mockSimulado);
      });
    });

    it('should return undefined when no current question exists', () => {
      // Reset to ensure no quiz data
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());
      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toBeUndefined();
    });

    it('should return empty array when current question has no user answers', () => {
      const { result } = renderHook(() => useQuizStore());

      const allCurrentAnswer = result.current.getAllCurrentAnswer();

      expect(allCurrentAnswer).toEqual([]);
    });

    it('should return user answers for current question when answers exist', () => {
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setByActivity(mockAtividade);
      });

      const { result } = renderHook(() => useQuizStore());

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
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setByQuestionary(mockQuestionary);
      });

      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
        useQuizStore.getState().setBySimulated(simuladoWithSpecialChars);
      });

      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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
        useQuizStore.getState().setBySimulated(simuladoWithLongId);
      });

      const { result } = renderHook(() => useQuizStore());

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
        useQuizStore.getState().setBySimulated(simuladoWithNumericId);
      });

      const { result } = renderHook(() => useQuizStore());

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
        useQuizStore.getState().setBySimulated(mockSimulado);
      });
    });

    it('should return 0% when no questions are answered', () => {
      const { result } = renderHook(() => useQuizStore());

      const progress = result.current.getProgress();

      expect(progress).toBe(0);
    });

    it('should return 50% when one out of two questions is answered', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      const progress = result.current.getProgress();

      expect(progress).toBe(50);
    });

    it('should return 100% when all questions are answered', () => {
      const { result } = renderHook(() => useQuizStore());

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
        type: 'ENEM',
        subtype: 'Simulado',
        difficulty: 'MEDIO',
        notification: null,
        status: 'ATIVO',
        startDate: new Date('2024-01-01'),
        finalDate: new Date('2024-12-31'),
        canRetry: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        questions: [],
      };

      act(() => {
        useQuizStore.getState().setBySimulated(emptySimulado);
      });

      const { result } = renderHook(() => useQuizStore());
      const progress = result.current.getProgress();

      expect(progress).toBe(0);
    });

    it('should return 0% when quiz is not set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());
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
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());

      expect(result.current.getCurrentQuestion()).toBeNull();
      expect(result.current.getTotalQuestions()).toBe(0);
      expect(result.current.getQuizTitle()).toBe('Quiz');
    });

    it('should handle updating existing user answer', () => {
      // Reset and set up quiz data
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.getState().setBySimulated(mockSimulado);
      });

      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());
      expect(result.current.getCurrentAnswer()).toBeUndefined();
    });

    it('should return empty array for unanswered questions when no quiz is set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());
      expect(result.current.getUnansweredQuestionsFromUserAnswers()).toEqual(
        []
      );
    });

    it('should group questions correctly by subject', () => {
      act(() => {
        useQuizStore.getState().setBySimulated(mockSimulado);
      });

      const { result } = renderHook(() => useQuizStore());
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
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());
      expect(result.current.getQuestionsGroupedBySubject()).toEqual({});
    });

    it('should handle invalid question id in addUserAnswer', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.addUserAnswer('invalid-id', 'option');
      });

      expect(result.current.userAnswers).toHaveLength(0);
    });

    // Consolidated tests for quiz type handling
    it('should handle all quiz types (bySimulated, byActivity, byQuestionary) in selectAnswer and addUserAnswer', () => {
      const mockAtividade = {
        id: 'atividade1',
        title: 'Test Atividade',
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const mockQuestionary = {
        id: 'aula1',
        title: 'Test Aula',
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const { result } = renderHook(() => useQuizStore());

      // Test bySimulated
      act(() => {
        useQuizStore.setState({
          bySimulated: mockSimulado,
          byActivity: undefined,
          byQuestionary: undefined,
        });
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
      });

      let userAnswers = result.current.getUserAnswers();
      let updatedQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(updatedQuestion?.optionId).toBe('opt1');

      // Test byActivity
      act(() => {
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: mockAtividade,
          byQuestionary: undefined,
        });
        result.current.selectAnswer('q1', 'opt1');
      });

      userAnswers = result.current.getUserAnswers();
      updatedQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(updatedQuestion?.optionId).toBe('opt1');

      // Test byQuestionary
      act(() => {
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: mockQuestionary,
        });
        result.current.selectAnswer('q2', 'opt2');
      });

      userAnswers = result.current.getUserAnswers();
      updatedQuestion = userAnswers.find((q) => q.questionId === 'q2');
      expect(updatedQuestion?.optionId).toBe('opt2');
    });

    it('should handle scenarios when no quiz is defined', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        // Ensure no quiz is set
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        // Ensure no quiz is set
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
        result.current.skipQuestion();
      });

      // Should not throw error and should not change anything
      expect(result.current.getCurrentQuestion()).toBeNull();
      expect(result.current.getUserAnswers()).toEqual([]);
    });
  });

  describe('User Answers Methods (Lines 544-557)', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setBySimulated(mockSimulado);
      });
    });

    describe('getUserAnswerByQuestionId', () => {
      it('should return user answer when question is answered', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setUserId('test-user-id');
          result.current.selectAnswer('q1', 'opt1');
        });

        const userAnswer = result.current.getUserAnswerByQuestionId('q1');
        expect(userAnswer).not.toBeNull();
        expect(userAnswer?.questionId).toBe('q1');
        expect(userAnswer?.answer).toBe(null);
        expect(userAnswer?.optionId).toBe('opt1');
      });

      it('should return user answer when question is skipped', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setBySimulated(mockSimulado);
          result.current.setUserId('test-user-id');
          result.current.skipQuestion();
        });

        const userAnswer = result.current.getUserAnswerByQuestionId('q1');
        expect(userAnswer).not.toBeNull();
        expect(userAnswer?.questionId).toBe('q1');
        expect(userAnswer?.answer).toBe(null);
        expect(userAnswer?.optionId).toBe(null);
      });

      it('should return null when question is not answered', () => {
        const { result } = renderHook(() => useQuizStore());

        const userAnswer = result.current.getUserAnswerByQuestionId('q1');
        expect(userAnswer).toBeNull();
      });

      it('should return null for non-existent question ID', () => {
        const { result } = renderHook(() => useQuizStore());

        const userAnswer =
          result.current.getUserAnswerByQuestionId('nonexistent');
        expect(userAnswer).toBeNull();
      });
    });

    describe('isQuestionAnsweredByUserAnswers', () => {
      it('should return true when question is answered', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setUserId('test-user-id');
          result.current.selectAnswer('q1', 'opt1');
        });

        expect(result.current.isQuestionAnsweredByUserAnswers('q1')).toBe(true);
      });
    });

    describe('getQuestionStatusFromUserAnswers', () => {
      it('should return answered when question is answered', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setUserId('test-user-id');
          result.current.selectAnswer('q1', 'opt1');
        });

        expect(result.current.getQuestionStatusFromUserAnswers('q1')).toBe(
          'answered'
        );
      });

      it('should return unanswered when question is not answered', () => {
        const { result } = renderHook(() => useQuizStore());

        expect(result.current.getQuestionStatusFromUserAnswers('q1')).toBe(
          'unanswered'
        );
      });

      it('should return skipped when question is skipped', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setBySimulated(mockSimulado);
          result.current.setUserId('test-user-id');
          result.current.skipQuestion();
        });

        expect(result.current.getQuestionStatusFromUserAnswers('q1')).toBe(
          'skipped'
        );
      });

      it('should return unanswered for non-existent question ID', () => {
        const { result } = renderHook(() => useQuizStore());

        expect(
          result.current.getQuestionStatusFromUserAnswers('nonexistent')
        ).toBe('unanswered');
      });

      it('should handle multiple questions with different statuses', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setUserId('test-user-id');
          result.current.selectAnswer('q1', 'opt1'); // Answered
          result.current.skipQuestion(); // Skip current question (q1 again, should update)
          result.current.goToNextQuestion(); // Go to q2
          result.current.skipQuestion(); // Skip q2
        });

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
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setUserId('test-user-id');
          result.current.selectAnswer('q1', 'opt1');
          result.current.goToNextQuestion();
          result.current.skipQuestion();
        });

        const userAnswers = result.current.getUserAnswersForActivity();
        expect(userAnswers).toHaveLength(2);

        const q1Answer = userAnswers.find(
          (answer) => answer.questionId === 'q1'
        );
        const q2Answer = userAnswers.find(
          (answer) => answer.questionId === 'q2'
        );

        expect(q1Answer?.optionId).toBe('opt1');
        expect(q2Answer?.optionId).toBe(null);
      });

      it('should return empty array when no answers are given', () => {
        const { result } = renderHook(() => useQuizStore());

        const userAnswers = result.current.getUserAnswersForActivity();
        expect(userAnswers).toHaveLength(0);
      });

      it('should return user answers with correct structure', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setUserId('test-user-id');
          result.current.selectAnswer('q1', 'opt1');
        });

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
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setBySimulated(mockSimulado);
        });

        // Test with a questionId that doesn't exist in userAnswers
        const isAnswered = result.current.isQuestionAnsweredByUserAnswers(
          'nonexistent-question'
        );
        expect(isAnswered).toBe(false);
      });

      it('should return true when answer exists and is not null for isQuestionAnsweredByUserAnswers', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setUserId('test-user-id');
          result.current.setBySimulated(mockSimulado);
          result.current.selectAnswer('q1', 'opt1');
        });

        const isAnswered = result.current.isQuestionAnsweredByUserAnswers('q1');
        expect(isAnswered).toBe(true);
      });

      it('should return false when answer exists but is null (skipped question) for isQuestionAnsweredByUserAnswers', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setUserId('test-user-id');
          result.current.setBySimulated(mockSimulado);
          result.current.skipQuestion(); // This creates an answer with null value
        });

        const isAnswered = result.current.isQuestionAnsweredByUserAnswers('q1');
        expect(isAnswered).toBe(false);
      });
    });
  });

  describe('Specific Line Coverage Tests', () => {
    describe('startTimer isFinished guard', () => {
      beforeEach(() => {
        // Clear any existing timers
        jest.clearAllTimers();
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should not start timer when quiz is finished', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setBySimulated(mockSimulado);
          result.current.finishQuiz(); // Set isFinished to true
          result.current.startTimer(); // Try to start timer
        });

        // Timer should not be running because quiz is finished
        act(() => {
          jest.advanceTimersByTime(1000);
        });

        expect(result.current.timeElapsed).toBe(0);
      });

      it('should start timer normally when quiz is not finished', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setBySimulated(mockSimulado);
          result.current.startTimer(); // Start timer when not finished
        });

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        expect(result.current.timeElapsed).toBe(1);
      });

      it('should prevent timer from starting after quiz is finished', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setBySimulated(mockSimulado);
          result.current.startQuiz(); // Start quiz normally
          jest.advanceTimersByTime(1000);
        });

        expect(result.current.timeElapsed).toBe(1);

        act(() => {
          result.current.finishQuiz(); // Finish the quiz
          result.current.startTimer(); // Try to start timer again
          jest.advanceTimersByTime(1000);
        });

        // Time should not increase because timer is blocked by isFinished guard
        expect(result.current.timeElapsed).toBe(1);
      });
    });
  });

  describe('setUserAnswers Tests', () => {
    it('should set userAnswers correctly', () => {
      const { result } = renderHook(() => useQuizStore());

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
      const { result } = renderHook(() => useQuizStore());

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

  describe('skipQuestion userId validation Tests', () => {
    it('should return early when userId is not set in skipQuestion', () => {
      const { result } = renderHook(() => useQuizStore());
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      act(() => {
        result.current.setBySimulated(mockSimulado);
        // Don't set userId - it should be empty string by default
        result.current.skipQuestion();
      });

      // Verify that console.warn was called with the expected message
      expect(consoleSpy).toHaveBeenCalledWith(
        'skipQuestion called before userId is set'
      );

      // Verify that no user answer was created (since userId is falsy)
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('should return early when userId is empty string in skipQuestion', () => {
      const { result } = renderHook(() => useQuizStore());
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId(''); // Set empty string
        result.current.skipQuestion();
      });

      // Verify that console.warn was called with the expected message
      expect(consoleSpy).toHaveBeenCalledWith(
        'skipQuestion called before userId is set'
      );

      // Verify that no user answer was created (since userId is empty)
      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('setCurrentQuestion Tests', () => {
    it('should set current question index when question exists in quiz', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should set current question index to 0 when question is first in quiz', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should not change current question index when no quiz is set', () => {
      const { result } = renderHook(() => useQuizStore());
      const initialIndex = result.current.currentQuestionIndex;

      act(() => {
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(initialIndex);
    });

    it('should not change current question index when question does not exist in quiz', () => {
      const { result } = renderHook(() => useQuizStore());
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setCurrentQuestion({
          ...mockQuestion1,
          id: 'non-existent-question',
        });
      });

      expect(result.current.currentQuestionIndex).toBe(0); // Should remain at initial index
      expect(consoleSpy).toHaveBeenCalledWith(
        'Question with id "non-existent-question" not found in active quiz'
      );

      consoleSpy.mockRestore();
    });

    it('should work with atividade quiz type', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByActivity(mockAtividade);
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it('should work with questionary quiz type', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByQuestionary(mockQuestionary);
        result.current.setCurrentQuestion(mockQuestion1);
      });

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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
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

    it('should use selectDissertativeAnswer for dissertative questions', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
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

    it('should warn when selectDissertativeAnswer is called for non-dissertative question', () => {
      const { result } = renderHook(() => useQuizStore());
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectDissertativeAnswer('q1', 'Resposta dissertativa');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'selectDissertativeAnswer called for non-dissertative question'
      );

      consoleSpy.mockRestore();
    });

    it('should return dissertative answer in getCurrentAnswer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('dissertative-q1', 'Resposta dissertativa');
        result.current.setCurrentQuestion(mockDissertativeQuestion);
      });

      const currentAnswer = result.current.getCurrentAnswer();
      expect(currentAnswer?.answer).toBe('Resposta dissertativa');
    });

    it('should count dissertative answers as answered questions', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('dissertative-q1', 'Resposta dissertativa');
        result.current.selectAnswer('q2', 'opt2');
      });

      expect(result.current.getAnsweredQuestions()).toBe(2);
      expect(result.current.isQuestionAnswered('dissertative-q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(true);
    });

    it('should handle selectDissertativeAnswer with existing answer update', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
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

    it('should warn when selectDissertativeAnswer is called without userId', () => {
      const { result } = renderHook(() => useQuizStore());
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
        // Don't set userId
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta sem userId'
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'selectDissertativeAnswer called before userId is set'
      );

      consoleSpy.mockRestore();
    });

    it('should handle selectDissertativeAnswer with empty userId', () => {
      const { result } = renderHook(() => useQuizStore());
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
        result.current.setUserId(''); // Empty userId
        result.current.selectDissertativeAnswer(
          'dissertative-q1',
          'Resposta com userId vazio'
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'selectDissertativeAnswer called before userId is set'
      );

      consoleSpy.mockRestore();
    });

    it('should handle selectDissertativeAnswer with non-existent question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
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
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimuladoWithDissertative);
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
  });

  describe('Answer Status Management Tests', () => {
    it('should set answer status correctly', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.setAnswerStatus('q1', ANSWER_STATUS.RESPOSTA_CORRETA);
      });

      const answerStatus = result.current.getAnswerStatus('q1');
      expect(answerStatus).toBe(ANSWER_STATUS.RESPOSTA_CORRETA);
    });

    it('should return null for non-existent question status', () => {
      const { result } = renderHook(() => useQuizStore());

      const answerStatus = result.current.getAnswerStatus('non-existent');
      expect(answerStatus).toBeNull();
    });

    it('should update existing answer status', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.selectAnswer('q1', 'opt1');
        result.current.setAnswerStatus('q1', ANSWER_STATUS.RESPOSTA_INCORRETA);
        result.current.setAnswerStatus('q1', ANSWER_STATUS.RESPOSTA_CORRETA);
      });

      const answerStatus = result.current.getAnswerStatus('q1');
      expect(answerStatus).toBe(ANSWER_STATUS.RESPOSTA_CORRETA);
    });

    it('should not update status for non-existent answer', () => {
      const { result } = renderHook(() => useQuizStore());

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
        useQuizStore.getState().setBySimulated(mockSimulado);
      });
    });

    it('should return correct question index for existing questions', () => {
      const { result } = renderHook(() => useQuizStore());

      const questionIndex1 = result.current.getQuestionIndex('q1');
      const questionIndex2 = result.current.getQuestionIndex('q2');

      expect(questionIndex1).toBe(1); // First question (index 0 + 1)
      expect(questionIndex2).toBe(2); // Second question (index 1 + 1)
    });

    it('should return 0 when no quiz is set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const { result } = renderHook(() => useQuizStore());
      const questionIndex = result.current.getQuestionIndex('q1');

      expect(questionIndex).toBe(0);
    });

    it('should return 0 when quiz has no questions', () => {
      const emptySimulado = {
        id: 'empty-simulado',
        title: 'Empty Quiz',
        type: 'ENEM',
        subtype: 'Simulado',
        difficulty: 'MEDIO',
        notification: null,
        status: 'ATIVO',
        startDate: new Date('2024-01-01'),
        finalDate: new Date('2024-12-31'),
        canRetry: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        questions: [],
      };

      act(() => {
        useQuizStore.getState().setBySimulated(emptySimulado);
      });

      const { result } = renderHook(() => useQuizStore());
      const questionIndex = result.current.getQuestionIndex('q1');

      expect(questionIndex).toBe(0);
    });

    it('should return 0 for non-existent question ID', () => {
      const { result } = renderHook(() => useQuizStore());

      const questionIndex = result.current.getQuestionIndex(
        'non-existent-question'
      );

      expect(questionIndex).toBe(0);
    });

    it('should work with byActivity quiz type', () => {
      const mockAtividade = {
        id: 'atividade-1',
        title: 'Test Atividade',
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setByActivity(mockAtividade);
      });

      const { result } = renderHook(() => useQuizStore());

      const questionIndex1 = result.current.getQuestionIndex('q1');
      const questionIndex2 = result.current.getQuestionIndex('q2');

      expect(questionIndex1).toBe(1);
      expect(questionIndex2).toBe(2);
    });

    it('should work with byQuestionary quiz type', () => {
      const mockQuestionary = {
        id: 'aula-1',
        title: 'Test Aula',
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setByQuestionary(mockQuestionary);
      });

      const { result } = renderHook(() => useQuizStore());

      const questionIndex1 = result.current.getQuestionIndex('q1');
      const questionIndex2 = result.current.getQuestionIndex('q2');

      expect(questionIndex1).toBe(1);
      expect(questionIndex2).toBe(2);
    });

    it('should handle case sensitivity in question ID', () => {
      const { result } = renderHook(() => useQuizStore());

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

      act(() => {
        useQuizStore.getState().setBySimulated(simuladoWithSpecialChars);
      });

      const { result } = renderHook(() => useQuizStore());

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

      act(() => {
        useQuizStore.getState().setBySimulated(simuladoWithLongId);
      });

      const { result } = renderHook(() => useQuizStore());

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

      act(() => {
        useQuizStore.getState().setBySimulated(simuladoWithNumericId);
      });

      const { result } = renderHook(() => useQuizStore());

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

      act(() => {
        useQuizStore.getState().setBySimulated(simuladoWithManyQuestions);
      });

      const { result } = renderHook(() => useQuizStore());

      const questionIndex1 = result.current.getQuestionIndex('q1');
      const questionIndex50 = result.current.getQuestionIndex('q50');
      const questionIndex100 = result.current.getQuestionIndex('q100');

      expect(questionIndex1).toBe(1);
      expect(questionIndex50).toBe(50);
      expect(questionIndex100).toBe(100);
    });

    it('should handle quiz type switching correctly', () => {
      const { result } = renderHook(() => useQuizStore());

      // Start with bySimulated
      let questionIndex = result.current.getQuestionIndex('q1');
      expect(questionIndex).toBe(1);

      // Switch to byActivity
      const mockAtividade = {
        id: 'atividade-1',
        title: 'Test Atividade',
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setByActivity(mockAtividade);
      });

      questionIndex = result.current.getQuestionIndex('q1');
      expect(questionIndex).toBe(1);

      // Switch to byQuestionary
      const mockQuestionary = {
        id: 'aula-1',
        title: 'Test Aula',
        questions: [mockQuestion1, mockQuestion2],
      };

      act(() => {
        useQuizStore.getState().setByQuestionary(mockQuestionary);
      });

      questionIndex = result.current.getQuestionIndex('q1');
      expect(questionIndex).toBe(1);
    });

    it('should handle empty string question ID', () => {
      const { result } = renderHook(() => useQuizStore());

      const questionIndex = result.current.getQuestionIndex('');

      expect(questionIndex).toBe(0);
    });

    it('should handle null question ID', () => {
      const { result } = renderHook(() => useQuizStore());

      const questionIndex = result.current.getQuestionIndex(
        null as unknown as string
      );

      expect(questionIndex).toBe(0);
    });

    it('should handle undefined question ID', () => {
      const { result } = renderHook(() => useQuizStore());

      const questionIndex = result.current.getQuestionIndex(
        undefined as unknown as string
      );

      expect(questionIndex).toBe(0);
    });
  });

  describe('Question Result Functions', () => {
    // Reset store state before each test in this describe block
    beforeEach(() => {
      act(() => {
        useQuizStore
          .getState()
          .setQuestionsResult(null as unknown as QuestionResult);
        useQuizStore
          .getState()
          .setCurrentQuestionResult(
            null as unknown as QuestionResult['answers']
          );
      });
    });

    const mockQuestionResult = {
      answers: [
        {
          id: 'answer1',
          questionId: 'q1',
          answer: 'opt1',
          optionId: 'opt1',
          selectedOptionText: '4',
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
          optionId: 'opt2',
          selectedOptionText: 'Paris',
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
      },
    };

    describe('setQuestionsResult', () => {
      it('should set questions result data', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setQuestionsResult(mockQuestionResult);
        });

        expect(useQuizStore.getState().questionsResult).toEqual(
          mockQuestionResult
        );
      });

      it('should handle null questions result', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setQuestionsResult(null as unknown as QuestionResult);
        });

        expect(useQuizStore.getState().questionsResult).toBeNull();
      });
    });

    describe('getQuestionResult', () => {
      it('should return complete question result data', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setQuestionsResult(mockQuestionResult);
        });

        const questionResult = result.current.getQuestionResult();

        expect(questionResult).toEqual(mockQuestionResult);
      });

      it('should return null when no question result is set', () => {
        const { result } = renderHook(() => useQuizStore());

        const questionResult = result.current.getQuestionResult();

        expect(questionResult).toBeNull();
      });
    });

    describe('getQuestionResultStatistics', () => {
      it('should return statistics from question result', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setQuestionsResult(mockQuestionResult);
        });

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics).toEqual(mockQuestionResult.statistics);
      });

      it('should return null when no question result is set', () => {
        const { result } = renderHook(() => useQuizStore());

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics).toBeNull();
      });

      it('should return null when question result has no statistics', () => {
        const { result } = renderHook(() => useQuizStore());

        const questionResultWithoutStats = {
          answers: mockQuestionResult.answers,
          statistics: null as unknown as QuestionResult['statistics'],
        };

        act(() => {
          result.current.setQuestionsResult(questionResultWithoutStats);
        });

        const statistics = result.current.getQuestionResultStatistics();

        expect(statistics).toBeNull();
      });
    });

    describe('getQuestionResultByQuestionId', () => {
      it('should return answer for existing question ID', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setQuestionsResult(mockQuestionResult);
        });

        const answer = result.current.getQuestionResultByQuestionId('q1');

        expect(answer).toEqual(mockQuestionResult.answers[0]);
      });

      it('should return null for non-existing question ID', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setQuestionsResult(mockQuestionResult);
        });

        const answer = result.current.getQuestionResultByQuestionId('q999');

        expect(answer).toBeNull();
      });

      it('should return null when no question result is set', () => {
        const { result } = renderHook(() => useQuizStore());

        const answer = result.current.getQuestionResultByQuestionId('q1');

        expect(answer).toBeNull();
      });

      it('should handle empty question ID', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setQuestionsResult(mockQuestionResult);
        });

        const answer = result.current.getQuestionResultByQuestionId('');

        expect(answer).toBeNull();
      });

      it('should handle multiple answers for same question ID', () => {
        const { result } = renderHook(() => useQuizStore());

        const questionResultWithDuplicates = {
          ...mockQuestionResult,
          answers: [
            ...mockQuestionResult.answers,
            {
              ...mockQuestionResult.answers[0],
              id: 'answer1_duplicate',
            },
          ],
        };

        act(() => {
          result.current.setQuestionsResult(questionResultWithDuplicates);
        });

        const answer = result.current.getQuestionResultByQuestionId('q1');

        // Should return the first match
        expect(answer?.id).toBe('answer1');
      });
    });

    describe('setCurrentQuestionResult', () => {
      it('should set current question result data', () => {
        const { result } = renderHook(() => useQuizStore());

        const currentQuestionResult = mockQuestionResult.answers;

        act(() => {
          result.current.setCurrentQuestionResult(currentQuestionResult);
        });

        expect(useQuizStore.getState().currentQuestionResult).toEqual(
          currentQuestionResult
        );
      });

      it('should handle null current question result', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setCurrentQuestionResult(
            null as unknown as QuestionResult['answers']
          );
        });

        expect(useQuizStore.getState().currentQuestionResult).toBeNull();
      });
    });

    describe('getCurrentQuestionResult', () => {
      it('should return current question result data', () => {
        const { result } = renderHook(() => useQuizStore());

        const currentQuestionResult = mockQuestionResult.answers;

        act(() => {
          result.current.setCurrentQuestionResult(currentQuestionResult);
        });

        const retrieved = result.current.getCurrentQuestionResult();

        expect(retrieved).toEqual(currentQuestionResult);
      });

      it('should return null when no current question result is set', () => {
        const { result } = renderHook(() => useQuizStore());

        const retrieved = result.current.getCurrentQuestionResult();

        expect(retrieved).toBeNull();
      });
    });

    describe('Integration tests', () => {
      it('should work correctly with question result and statistics together', () => {
        const { result } = renderHook(() => useQuizStore());

        act(() => {
          result.current.setQuestionsResult(mockQuestionResult);
        });

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
        const { result } = renderHook(() => useQuizStore());

        // Set initial result
        act(() => {
          result.current.setQuestionsResult(mockQuestionResult);
        });

        expect(
          result.current.getQuestionResultStatistics()?.correctAnswers
        ).toBe(2);

        // Update with different result
        const updatedResult = {
          ...mockQuestionResult,
          statistics: {
            ...mockQuestionResult.statistics,
            correctAnswers: 1,
            incorrectAnswers: 1,
            score: 50,
          },
        };

        act(() => {
          result.current.setQuestionsResult(updatedResult);
        });

        expect(
          result.current.getQuestionResultStatistics()?.correctAnswers
        ).toBe(1);
        expect(result.current.getQuestionResultStatistics()?.score).toBe(50);
      });
    });
  });
});
