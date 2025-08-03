import { renderHook, act } from '@testing-library/react';
import {
  QUESTION_DIFFICULTY,
  QUESTION_TYPE,
  QUESTION_STATUS,
  useQuizStore,
} from './useQuizStore';

// Mock data for testing
const mockQuestion1 = {
  id: 'q1',
  questionText: 'What is 2 + 2?',
  correctOptionId: 'opt1',
  description: 'Basic math question',
  type: QUESTION_TYPE.ALTERNATIVA,
  status: QUESTION_STATUS.APROVADO,
  difficulty: QUESTION_DIFFICULTY.FACIL,
  examBoard: 'ENEM',
  examYear: '2024',
  answerKey: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  knowledgeMatrix: [
    {
      areaKnowledgeId: 'matematica',
      subjectId: 'algebra',
      topicId: 'operacoes',
      subtopicId: 'soma',
      contentId: 'matematica',
    },
  ],
  options: [
    { id: 'opt1', option: '4' },
    { id: 'opt2', option: '3' },
    { id: 'opt3', option: '5' },
    { id: 'opt4', option: '6' },
  ],
  createdBy: 'user1',
};

const mockQuestion2 = {
  id: 'q2',
  questionText: 'What is the capital of France?',
  correctOptionId: 'opt2',
  description: 'Geography question',
  type: QUESTION_TYPE.ALTERNATIVA,
  status: QUESTION_STATUS.APROVADO,
  difficulty: QUESTION_DIFFICULTY.FACIL,
  examBoard: 'ENEM',
  examYear: '2024',
  answerKey: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  knowledgeMatrix: [
    {
      areaKnowledgeId: 'geografia',
      subjectId: 'geografia-geral',
      topicId: 'capitais',
      subtopicId: 'europa',
      contentId: 'geografia',
    },
  ],
  options: [
    { id: 'opt1', option: 'London' },
    { id: 'opt2', option: 'Paris' },
    { id: 'opt3', option: 'Berlin' },
    { id: 'opt4', option: 'Madrid' },
  ],
  createdBy: 'user1',
};

const mockSimulado = {
  id: 'simulado-1',
  title: 'Test Simulado',
  category: 'Enem',
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

      // Verify that the question's answerKey was updated
      const currentQuestion = result.current.getCurrentQuestion();
      expect(currentQuestion?.answerKey).toBe('opt1');

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(1); // Apenas as respondidas
      const answeredQuestion = userAnswers.find((q) => q.questionId === 'q1');
      expect(answeredQuestion?.answer).toBe('opt1');
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

      // Verify that the question's answerKey was NOT updated (since the function returns early when userId is falsy)
      const currentQuestion = result.current.getCurrentQuestion();
      expect(currentQuestion?.answerKey).toBe(null);

      consoleSpy.mockRestore();
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
      expect(userAnswerItem?.answer).toBe('opt1');
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

      expect(currentAnswer).toBe('opt1');
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
      expect(answeredQuestion?.answer).toBe('opt1');
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
        category: 'Enem',
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
      expect(updatedQuestion?.answer).not.toBe(null);

      // Check that the current answer is updated
      expect(result.current.getCurrentAnswer()).toBe('opt2');
    });

    it('should handle question not found in addUserAnswer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setUserId('test-user-id');
        result.current.addUserAnswer('nonexistent', 'opt1');
      });

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(1); // Only the added answer
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
      expect(updatedQuestion?.answer).toBe('opt1');

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
      expect(updatedQuestion?.answer).toBe('opt1');

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
      expect(updatedQuestion?.answer).toBe('opt2');
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
        expect(userAnswer?.answer).toBe('opt1');
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

        expect(q1Answer?.answer).toBe('opt1');
        expect(q2Answer?.answer).toBe(null);
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
        expect(answer.answer).toBe('opt1');
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
        },
        {
          questionId: 'q2',
          activityId: 'activity-1',
          userId: 'user-1',
          answer: null,
          optionId: null,
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
        },
      ];

      const newUserAnswers = [
        {
          questionId: 'q2',
          activityId: 'activity-1',
          userId: 'user-1',
          answer: 'opt2',
          optionId: 'opt2',
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
        result.current.setCurrentQuestion(mockQuestion2); // q2 is at index 1
      });

      expect(result.current.currentQuestionIndex).toBe(1);
      expect(result.current.getCurrentQuestion()).toEqual(mockQuestion2);
    });

    it('should set current question index to 0 when question is first in quiz', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setCurrentQuestion(mockQuestion1); // q1 is at index 0
      });

      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.getCurrentQuestion()).toEqual(mockQuestion1);
    });

    it('should not change current question index when no quiz is set', () => {
      const { result } = renderHook(() => useQuizStore());

      // Ensure no quiz is set by explicitly clearing any existing quiz
      act(() => {
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: undefined,
        });
      });

      const initialIndex = result.current.currentQuestionIndex;

      act(() => {
        // Don't set any quiz
        result.current.setCurrentQuestion(mockQuestion1);
      });

      expect(result.current.currentQuestionIndex).toBe(initialIndex);
      expect(result.current.getCurrentQuestion()).toBeNull();
    });

    it('should set current question index to -1 when question does not exist in quiz', () => {
      const { result } = renderHook(() => useQuizStore());

      const nonExistentQuestion = {
        ...mockQuestion1,
        id: 'non-existent-question',
      };

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.setCurrentQuestion(nonExistentQuestion);
      });

      // Should set to -1 since question was not found (findIndex returns -1)
      expect(result.current.currentQuestionIndex).toBe(-1);
      expect(result.current.getCurrentQuestion()).toBeUndefined();
    });

    it('should work with atividade quiz type', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByActivity(mockAtividade);
        result.current.setCurrentQuestion(mockQuestion2); // q2 is at index 1
      });

      expect(result.current.currentQuestionIndex).toBe(1);
      expect(result.current.getCurrentQuestion()).toEqual(mockQuestion2);
    });

    it('should work with questionary quiz type', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByQuestionary(mockQuestionary);
        result.current.setCurrentQuestion(mockQuestion1); // q1 is at index 0
      });

      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.getCurrentQuestion()).toEqual(mockQuestion1);
    });
  });
});
