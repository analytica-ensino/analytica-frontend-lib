import { renderHook, act } from '@testing-library/react';
import { useQuizStore } from './useQuizStore';

// Mock data for testing
const mockQuestion1 = {
  id: 'q1',
  questionText: 'What is 2 + 2?',
  correctOptionId: 'opt1',
  description: 'Basic math question',
  type: 'ALTERNATIVA' as const,
  status: 'APROVADO' as const,
  difficulty: 'FACIL' as const,
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
      contentId: 'matematica'
    }
  ],
  options: [
    { id: 'opt1', option: '4' },
    { id: 'opt2', option: '3' },
    { id: 'opt3', option: '5' },
    { id: 'opt4', option: '6' }
  ],
  createdBy: 'user1'
};

const mockQuestion2 = {
  id: 'q2',
  questionText: 'What is the capital of France?',
  correctOptionId: 'opt2',
  description: 'Geography question',
  type: 'ALTERNATIVA' as const,
  status: 'APROVADO' as const,
  difficulty: 'FACIL' as const,
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
      contentId: 'geografia'
    }
  ],
  options: [
    { id: 'opt1', option: 'London' },
    { id: 'opt2', option: 'Paris' },
    { id: 'opt3', option: 'Berlin' },
    { id: 'opt4', option: 'Madrid' }
  ],
  createdBy: 'user1'
};

const mockSimulado = {
  id: 'simulado-1',
  title: 'Test Simulado',
  questions: [mockQuestion1, mockQuestion2]
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
    it('should set bySimulado', () => {
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.setBySimulado(mockSimulado);
      });
      
      expect(result.current.bySimulado).toEqual(mockSimulado);
    });

    it('should set byAtividade', () => {
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.setByAtividade(mockSimulado);
      });
      
      expect(result.current.byAtividade).toEqual(mockSimulado);
    });

    it('should set byAula', () => {
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.setByAula(mockSimulado);
      });
      
      expect(result.current.byAula).toEqual(mockSimulado);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setBySimulado(mockSimulado);
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
        useQuizStore.getState().setBySimulado(mockSimulado);
      });
    });

    it('should select answer', () => {
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.selectAnswer('q1', 'opt1');
      });
      
      expect(result.current.selectedAnswers['q1']).toBe('opt1');
      expect(result.current.userAnswers).toHaveLength(1);
      expect(result.current.userAnswers[0].id).toBe('q1');
      expect(result.current.userAnswers[0].answerKey).toBe('opt1');
      expect(result.current.userAnswers[0].isSkipped).toBe(false);
    });

    it('should skip question', () => {
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.skipQuestion();
      });
      
      expect(result.current.skippedQuestions).toContain('q1');
      expect(result.current.userAnswers).toHaveLength(1);
      expect(result.current.userAnswers[0].id).toBe('q1');
      expect(result.current.userAnswers[0].isSkipped).toBe(true);
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
    it('should update time', () => {
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.updateTime(120);
      });
      
      expect(result.current.timeElapsed).toBe(120);
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      act(() => {
        useQuizStore.getState().setBySimulado(mockSimulado);
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
        result.current.selectAnswer('q1', 'opt1');
      });
      
      const userAnswers = result.current.getUserAnswers();
      
      expect(userAnswers).toHaveLength(1);
      expect(userAnswers[0].id).toBe('q1');
      expect(userAnswers[0].answerKey).toBe('opt1');
    });

    it('should get unanswered questions from user answers', () => {
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
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
        knowledgeMatrix: []
      };
      
      const simuladoWithQuestionWithoutMatrix = {
        ...mockSimulado,
        questions: [questionWithoutMatrix]
      };
      
      act(() => {
        useQuizStore.getState().setBySimulado(simuladoWithQuestionWithoutMatrix);
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
        useQuizStore.getState().setBySimulado(mockSimulado);
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
        questions: []
      };
      
      act(() => {
        useQuizStore.getState().setBySimulado(emptySimulado);
      });
      
      const { result } = renderHook(() => useQuizStore());
      const progress = result.current.getProgress();
      
      expect(progress).toBe(0);
    });

    it('should return 0% when quiz is not set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulado: undefined,
          byAtividade: undefined,
          byAula: undefined
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
        questions: [mockQuestion1, mockQuestion2, mockQuestion1] // 3 questions
      };
      
      act(() => {
        useQuizStore.getState().setBySimulado(threeQuestionSimulado);
      });
      
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.selectAnswer('q1', 'opt1'); // 1 out of 3 = 33.33%
      });
      
      const progress = result.current.getProgress();
      
      expect(progress).toBeCloseTo(33.33, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty quiz', () => {
      // Reset to ensure no quiz data and clear all quiz data
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulado: undefined,
          byAtividade: undefined,
          byAula: undefined
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
        useQuizStore.getState().setBySimulado(mockSimulado);
      });
      
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.selectAnswer('q1', 'opt1');
        result.current.selectAnswer('q1', 'opt2'); // Update answer
      });
      
      expect(result.current.userAnswers).toHaveLength(1);
      expect(result.current.userAnswers[0].answerKey).toBe('opt2');
    });

    it('should handle question not found in addUserAnswer', () => {
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.addUserAnswer('nonexistent', 'opt1');
      });
      
      expect(result.current.userAnswers).toHaveLength(0);
    });

    it('should return undefined for current answer when no quiz is set', () => {
      // Reset to ensure no quiz data
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulado: undefined,
          byAtividade: undefined,
          byAula: undefined
        });
      });
      
      const { result } = renderHook(() => useQuizStore());
      expect(result.current.getCurrentAnswer()).toBeUndefined();
    });

    it('should return empty array for unanswered questions when no quiz is set', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulado: undefined,
          byAtividade: undefined,
          byAula: undefined
        });
      });
      
      const { result } = renderHook(() => useQuizStore());
      expect(result.current.getUnansweredQuestionsFromUserAnswers()).toEqual([]);
    });

    it('should group questions correctly by subject', () => {
      act(() => {
        useQuizStore.getState().setBySimulado(mockSimulado);
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
          bySimulado: undefined,
          byAtividade: undefined,
          byAula: undefined
        });
      });
      
      const { result } = renderHook(() => useQuizStore());
      expect(result.current.getQuestionsGroupedBySubject()).toEqual({});
    });

    it('should handle invalid question id in addUserAnswer', () => {
      act(() => {
        useQuizStore.getState().resetQuiz();
        useQuizStore.setState({
          bySimulado: undefined,
          byAtividade: undefined,
          byAula: undefined
        });
      });
      
      const { result } = renderHook(() => useQuizStore());
      
      act(() => {
        result.current.addUserAnswer('invalid-id', 'option');
      });
      
      expect(result.current.userAnswers).toHaveLength(0);
    });
  });
}); 