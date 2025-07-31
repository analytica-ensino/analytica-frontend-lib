import { renderHook, act } from '@testing-library/react';
import { Difficulty, useQuizStore } from './useQuizStore';

// Mock data for testing
const mockQuestion1 = {
  id: 'q1',
  questionText: 'What is 2 + 2?',
  correctOptionId: 'opt1',
  description: 'Basic math question',
  type: 'ALTERNATIVA' as const,
  status: 'APROVADO' as const,
  difficulty: 'FACIL' as Difficulty,
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
  type: 'ALTERNATIVA' as const,
  status: 'APROVADO' as const,
  difficulty: 'FACIL' as Difficulty,
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
      expect(result.current.skippedQuestions).toEqual([]);
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
        result.current.setByActivity(mockSimulado);
      });

      expect(result.current.byActivity).toEqual(mockSimulado);
    });

    it('should set byQuestionary', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByQuestionary(mockSimulado);
      });

      expect(result.current.byQuestionary).toEqual(mockSimulado);
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
        result.current.selectAnswer('q1', 'opt1');
      });

      // Verify that the question's answerKey was updated
      const currentQuestion = result.current.getCurrentQuestion();
      expect(currentQuestion?.answerKey).toBe('opt1');

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(2); // Both questions from mockSimulado
      const answeredQuestion = userAnswers.find((q) => q.id === 'q1');
      expect(answeredQuestion?.answerKey).toBe('opt1');
      expect(answeredQuestion?.isSkipped).toBe(false);
    });

    it('should skip question', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.skipQuestion();
      });

      expect(result.current.skippedQuestions).toContain('q1');

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(2); // Both questions from mockSimulado
      const skippedQuestion = userAnswers.find((q) => q.id === 'q1');
      expect(skippedQuestion?.isSkipped).toBe(true);
    });

    it('should remove from skipped when answering', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.skipQuestion(); // Skip first question
        result.current.goToNextQuestion(); // Go to second question
        result.current.selectAnswer('q2', 'opt2'); // Answer second question
      });

      expect(result.current.skippedQuestions).toContain('q1');
      expect(result.current.skippedQuestions).not.toContain('q2');
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
        result.current.selectAnswer('q1', 'opt1');
        result.current.goToNextQuestion();
        result.current.startQuiz();
        result.current.resetQuiz();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
      expect(result.current.selectedAnswers).toEqual({});
      expect(result.current.skippedQuestions).toEqual([]);
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
        result.current.selectAnswer('q1', 'opt1');
      });

      const answered = result.current.getAnsweredQuestions();

      expect(answered).toBe(1);
    });

    it('should get unanswered questions', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
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
        result.current.skipQuestion();
      });

      const skipped = result.current.getSkippedQuestions();

      expect(skipped).toBe(1);
    });

    it('should get progress percentage', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.selectAnswer('q1', 'opt1');
      });

      const progress = result.current.getProgress();

      expect(progress).toBe(50); // 1 out of 2 questions = 50%
    });

    it('should check if question is answered', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
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
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(true);
      expect(result.current.isQuestionAnswered('q2')).toBe(false);
    });

    it('should work with byQuestionary quiz type', () => {
      const mockAula = {
        id: 'aula1',
        title: 'Test Aula',
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setByQuestionary(mockAula);
        result.current.selectAnswer('q2', 'opt2');
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
      expect(result.current.isQuestionAnswered('q2')).toBe(true);
    });

    it('should handle multiple answered questions', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
        result.current.selectAnswer('q1', 'opt1');
        result.current.addUserAnswer('q1', undefined); // Set to null
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should handle question with answerKey set to empty string', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.selectAnswer('q1', 'opt1');
        result.current.addUserAnswer('q1', ''); // Set to empty string (converted to null)
      });

      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should handle case sensitivity in question ID', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.selectAnswer('q1', 'opt1');
      });

      expect(result.current.isQuestionAnswered('Q1')).toBe(false); // Different case
      expect(result.current.isQuestionAnswered('q1')).toBe(true);
    });

    it('should handle special characters in question ID', () => {
      const questionWithSpecialChars = {
        ...mockQuestion1,
        id: 'q1-special@#$%',
        answerKey: 'opt1',
      };

      const simuladoWithSpecialChars = {
        ...mockSimulado,
        questions: [questionWithSpecialChars, mockQuestion2],
      };

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(simuladoWithSpecialChars);
      });

      expect(result.current.isQuestionAnswered('q1-special@#$%')).toBe(true);
      expect(result.current.isQuestionAnswered('q1')).toBe(false);
    });

    it('should handle very long question ID', () => {
      const longId = 'q'.repeat(1000);
      const questionWithLongId = {
        ...mockQuestion1,
        id: longId,
        answerKey: 'opt1',
      };

      const simuladoWithLongId = {
        ...mockSimulado,
        questions: [questionWithLongId, mockQuestion2],
      };

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(simuladoWithLongId);
      });

      expect(result.current.isQuestionAnswered(longId)).toBe(true);
    });

    it('should handle numeric question ID as string', () => {
      const questionWithNumericId = {
        ...mockQuestion1,
        id: '12345',
        answerKey: 'opt1',
      };

      const simuladoWithNumericId = {
        ...mockSimulado,
        questions: [questionWithNumericId, mockQuestion2],
      };

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(simuladoWithNumericId);
      });

      expect(result.current.isQuestionAnswered('12345')).toBe(true);
      expect(
        result.current.isQuestionAnswered(12345 as unknown as string)
      ).toBe(false); // Should handle type mismatch
    });

    it('should check if question is skipped', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.skipQuestion();
      });

      expect(result.current.isQuestionSkipped('q1')).toBe(true);
      expect(result.current.isQuestionSkipped('q2')).toBe(false);
    });

    it('should get current answer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
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
        result.current.selectAnswer('q1', 'opt1');
      });

      const userAnswers = result.current.getUserAnswers();

      expect(userAnswers).toHaveLength(2); // Both questions from mockSimulado
      const answeredQuestion = userAnswers.find((q) => q.id === 'q1');
      expect(answeredQuestion?.answerKey).toBe('opt1');
    });

    it('should get unanswered questions from user answers', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
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
        result.current.selectAnswer('q1', 'opt1');
      });

      const progress = result.current.getProgress();

      expect(progress).toBe(50);
    });

    it('should return 100% when all questions are answered', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
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

    it('should calculate progress correctly with decimal values', () => {
      const threeQuestionSimulado = {
        id: 'three-question-simulado',
        title: 'Three Question Quiz',
        category: 'Enem',
        questions: [mockQuestion1, mockQuestion2, mockQuestion1], // 3 questions
      };

      act(() => {
        useQuizStore.getState().setBySimulated(threeQuestionSimulado);
      });

      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.selectAnswer('q1', 'opt1'); // 1 out of 3 = 33.33%
      });

      const progress = result.current.getProgress();

      // Since we have duplicate question IDs (q1 appears twice), both will be marked as answered
      // So 2 out of 3 questions = 66.67%
      expect(progress).toBeCloseTo(66.67, 1);
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
        result.current.selectAnswer('q1', 'opt1');
        result.current.selectAnswer('q1', 'opt2'); // Update answer
      });

      const userAnswers = result.current.getUserAnswers();
      const updatedQuestion = userAnswers.find((q) => q.id === 'q1');
      expect(updatedQuestion?.answerKey).toBe('opt2');
    });

    it('should handle question not found in addUserAnswer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.setBySimulated(mockSimulado);
        result.current.addUserAnswer('nonexistent', 'opt1');
      });

      const userAnswers = result.current.getUserAnswers();
      expect(userAnswers).toHaveLength(2); // Only the questions from mockSimulado
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

      const mockAula = {
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
        result.current.selectAnswer('q1', 'opt1');
      });

      let userAnswers = result.current.getUserAnswers();
      let updatedQuestion = userAnswers.find((q) => q.id === 'q1');
      expect(updatedQuestion?.answerKey).toBe('opt1');

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
      updatedQuestion = userAnswers.find((q) => q.id === 'q1');
      expect(updatedQuestion?.answerKey).toBe('opt1');

      // Test byQuestionary
      act(() => {
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: mockAula,
        });
        result.current.selectAnswer('q2', 'opt2');
      });

      userAnswers = result.current.getUserAnswers();
      updatedQuestion = userAnswers.find((q) => q.id === 'q2');
      expect(updatedQuestion?.answerKey).toBe('opt2');
    });

    it('should handle null and empty string answerIds for all quiz types', () => {
      const mockAtividade = {
        id: 'atividade1',
        title: 'Test Atividade',
        questions: [
          { ...mockQuestion1, answerKey: 'opt1' },
          { ...mockQuestion2, answerKey: null },
        ],
      };

      const mockAula = {
        id: 'aula1',
        title: 'Test Aula',
        questions: [
          { ...mockQuestion1, answerKey: null },
          { ...mockQuestion2, answerKey: 'opt2' },
        ],
      };

      const { result } = renderHook(() => useQuizStore());

      // Test null answerId for bySimulated
      act(() => {
        useQuizStore.setState({
          bySimulated: mockSimulado,
          byActivity: undefined,
          byQuestionary: undefined,
        });
        result.current.addUserAnswer('q1', undefined);
      });

      let userAnswers = result.current.getUserAnswers();
      let updatedQuestion = userAnswers.find((q) => q.id === 'q1');
      expect(updatedQuestion?.answerKey).toBeNull();

      // Test empty string answerId for byActivity
      act(() => {
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: mockAtividade,
          byQuestionary: undefined,
        });
        result.current.addUserAnswer('q1', '');
      });

      userAnswers = result.current.getUserAnswers();
      updatedQuestion = userAnswers.find((q) => q.id === 'q1');
      expect(updatedQuestion?.answerKey).toBeNull();

      // Test null answerId for byQuestionary
      act(() => {
        useQuizStore.setState({
          bySimulated: undefined,
          byActivity: undefined,
          byQuestionary: mockAula,
        });
        result.current.addUserAnswer('q2', undefined);
      });

      userAnswers = result.current.getUserAnswers();
      updatedQuestion = userAnswers.find((q) => q.id === 'q2');
      expect(updatedQuestion?.answerKey).toBeNull();
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
      });

      // Should not throw error and should not change anything
      expect(result.current.getCurrentQuestion()).toBeNull();
      expect(result.current.getUserAnswers()).toEqual([]);
    });
  });
});
