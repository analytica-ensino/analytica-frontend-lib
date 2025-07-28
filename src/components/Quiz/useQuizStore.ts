import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Question {
  id: string;
  questionText: string;
  correctOptionId: string;
  description: string;
  type: 'ALTERNATIVA' | 'DISSERTATIVA' | 'MULTIPLA_CHOICE';
  status: 'APROVADO' | 'REPROVADO';
  difficulty: 'FACIL' | "MEDIO" | 'DIFICIL';
  examBoard: string | null;
  examYear: string | null;
  answerKey: string | null;
  createdAt: string;
  updatedAt: string;
  knowledgeMatrix: {
    areaKnowledgeId: string;
    subjectId: string;
    topicId: string;
    subtopicId: string;
    contentId: string;
  }[];
  options: {
    id: string;
    option: string;
  }[];
  createdBy: string;
}

interface Simulado {
  id: string;
  title: string;
  questions: Question[];
}

interface Atividade {
  id: string;
  title: string;
  questions: Question[];
}

interface Aula {
  id: string;
  title: string;
  questions: Question[];
}

interface UserAnswer extends Question {
  isSkipped: boolean;
}

interface QuizState {
  // Data
  bySimulado?: Simulado;
  byAtividade?: Atividade;
  byAula?: Aula;
  
  // UI State
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  skippedQuestions: string[];
  userAnswers: UserAnswer[];
  timeElapsed: number;
  isStarted: boolean;
  isFinished: boolean;
  
  // Actions
  setBySimulado: (simulado: Simulado) => void;
  setByAtividade: (atividade: Atividade) => void;
  setByAula: (aula: Aula) => void;
  
  // Quiz Navigation
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;
  
  // Quiz Actions
  selectAnswer: (questionId: string, answerId: string) => void;
  skipQuestion: () => void;
  addUserAnswer: (questionId: string, answerId?: string) => void;
  startQuiz: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  
  // Timer
  updateTime: (time: number) => void;
  
  // Getters
  getCurrentQuestion: () => Question | null;
  getTotalQuestions: () => number;
  getAnsweredQuestions: () => number;
  getUnansweredQuestions: () => number[];
  getSkippedQuestions: () => number;
  getProgress: () => number;
  isQuestionAnswered: (questionId: string) => boolean;
  isQuestionSkipped: (questionId: string) => boolean;
  getCurrentAnswer: () => string | undefined;
  getQuizTitle: () => string;
  formatTime: (seconds: number) => string;
  getUserAnswers: () => UserAnswer[];
  getUnansweredQuestionsFromUserAnswers: () => number[];
  getQuestionsGroupedBySubject: () => { [key: string]: Question[] };
}

export const useQuizStore = create<QuizState>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentQuestionIndex: 0,
      selectedAnswers: {},
      skippedQuestions: [],
      userAnswers: [],
      timeElapsed: 0,
      isStarted: false,
      isFinished: false,
      
      // Setters
      setBySimulado: (simulado) => set({ bySimulado: simulado }),
      setByAtividade: (atividade) => set({ byAtividade: atividade }),
      setByAula: (aula) => set({ byAula: aula }),
      
      // Navigation
      goToNextQuestion: () => {
        const { currentQuestionIndex, getTotalQuestions } = get();
        const totalQuestions = getTotalQuestions();
        
        if (currentQuestionIndex < totalQuestions - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },
      
      goToPreviousQuestion: () => {
        const { currentQuestionIndex } = get();
        
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },
      
      goToQuestion: (index) => {
        const { getTotalQuestions } = get();
        const totalQuestions = getTotalQuestions();
        
        if (index >= 0 && index < totalQuestions) {
          set({ currentQuestionIndex: index });
        }
      },
      
      // Quiz Actions
      selectAnswer: (questionId, answerId) => {
        const { selectedAnswers, skippedQuestions, addUserAnswer } = get();
        // Remove from skipped questions if it was skipped
        const newSkippedQuestions = skippedQuestions.filter(id => id !== questionId);
        set({
          selectedAnswers: {
            ...selectedAnswers,
            [questionId]: answerId
          },
          skippedQuestions: newSkippedQuestions
        });
        // Add to user answers
        addUserAnswer(questionId, answerId);
      },
      
      skipQuestion: () => {
        const { getCurrentQuestion, skippedQuestions, addUserAnswer } = get();
        const currentQuestion = getCurrentQuestion();
        
        if (currentQuestion) {
          set({
            skippedQuestions: [...skippedQuestions, currentQuestion.id]
          });
          // Add to user answers as skipped
          addUserAnswer(currentQuestion.id);
        }
      },

      addUserAnswer: (questionId, answerId) => {
        const { userAnswers, getCurrentQuestion, bySimulado, byAtividade, byAula } = get();
        const quiz = bySimulado || byAtividade || byAula;
        const question = quiz?.questions.find(q => q.id === questionId);
        
        if (!question) return;
        
        const existingAnswerIndex = userAnswers.findIndex(answer => answer.id === questionId);
        
        if (existingAnswerIndex !== -1) {
          // Update existing answer
          const updatedAnswers = [...userAnswers];
          updatedAnswers[existingAnswerIndex] = {
            ...question,
            answerKey: answerId || '',
            isSkipped: !answerId
          };
          set({ userAnswers: updatedAnswers });
        } else {
          // Add new answer
          set({
            userAnswers: [...userAnswers, {
              ...question,
              answerKey: answerId || null,
              isSkipped: !answerId
            }]
          });
        }
      },
      
      startQuiz: () => set({ isStarted: true, timeElapsed: 0 }),
      
      finishQuiz: () => set({ isFinished: true }),
      
      resetQuiz: () => set({
        currentQuestionIndex: 0,
        selectedAnswers: {},
        skippedQuestions: [],
        userAnswers: [],
        timeElapsed: 0,
        isStarted: false,
        isFinished: false
      }),
      
      // Timer
      updateTime: (time) => set({ timeElapsed: time }),
      
      // Getters
      getCurrentQuestion: () => {
        const { bySimulado, byAtividade, byAula, currentQuestionIndex } = get();
        const quiz = bySimulado || byAtividade || byAula;
        
        if (!quiz || !quiz.questions[currentQuestionIndex]) {
          return null;
        }
        
        return quiz.questions[currentQuestionIndex];
      },
      
      getTotalQuestions: () => {
        const { bySimulado, byAtividade, byAula } = get();
        const quiz = bySimulado || byAtividade || byAula;
        
        return quiz?.questions?.length || 0;
      },
      
      getAnsweredQuestions: () => {
        const { selectedAnswers } = get();
        return Object.keys(selectedAnswers).length;
      },
      
      getUnansweredQuestions: () => {
        const { bySimulado, byAtividade, byAula, selectedAnswers, skippedQuestions } = get();
        const quiz = bySimulado || byAtividade || byAula;
        if (!quiz) return [];
        
        const unansweredQuestions: number[] = [];
        
        quiz.questions.forEach((question, index) => {
          const isAnswered = question.id in selectedAnswers;
          const isSkipped = skippedQuestions.includes(question.id);
          
          if (!isAnswered && !isSkipped) {
            unansweredQuestions.push(index + 1); // index + 1 para mostrar número da questão
          }
        });
        return unansweredQuestions;
      },
      
      getSkippedQuestions: () => {
        const { skippedQuestions } = get();
        return skippedQuestions.length;
      },
      
      getProgress: () => {
        const { getTotalQuestions, getAnsweredQuestions } = get();
        const total = getTotalQuestions();
        const answered = getAnsweredQuestions();
        
        return total > 0 ? (answered / total) * 100 : 0;
      },
      
      isQuestionAnswered: (questionId) => {
        const { selectedAnswers } = get();
        return questionId in selectedAnswers;
      },
      
      isQuestionSkipped: (questionId) => {
        const { skippedQuestions } = get();
        return skippedQuestions.includes(questionId);
      },
      
      getCurrentAnswer: () => {
        const { getCurrentQuestion, selectedAnswers } = get();
        const currentQuestion = getCurrentQuestion();
        
        return selectedAnswers[currentQuestion?.id || ''];
      },
      
      getQuizTitle: () => {
        const { bySimulado, byAtividade, byAula } = get();
        const quiz = bySimulado || byAtividade || byAula;
        
        return quiz?.title || 'Quiz';
      },
      
      formatTime: (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      },

      getUserAnswers: () => {
        const { userAnswers } = get();
        return userAnswers;
      },

      getUnansweredQuestionsFromUserAnswers: () => {
        const { bySimulado, byAtividade, byAula, userAnswers } = get();
        const quiz = bySimulado || byAtividade || byAula;
        if (!quiz) return [];
        
        const unansweredQuestions: number[] = [];
        
        quiz.questions.forEach((question, index) => {
          const userAnswer = userAnswers.find(answer => answer.id === question.id);
          
          // Se não há resposta do usuário OU se a questão foi pulada (isSkipped = true)
          if (!userAnswer || userAnswer.isSkipped) {
            unansweredQuestions.push(index + 1); // index + 1 para mostrar número da questão
          }
        });
        
        return unansweredQuestions;
      },

      getQuestionsGroupedBySubject: () => {
        const { bySimulado, byAtividade, byAula } = get();
        const quiz = bySimulado || byAtividade || byAula;
        if (!quiz) return {};
        
        const groupedQuestions: { [key: string]: Question[] } = {};
        
        quiz.questions.forEach((question) => {
          const subjectId = question.knowledgeMatrix?.[0]?.subjectId || 'Sem matéria';
          
          if (!groupedQuestions[subjectId]) {
            groupedQuestions[subjectId] = [];
          }
          
          groupedQuestions[subjectId].push(question);
        });
        
        return groupedQuestions;
      }
    }),
    {
      name: 'quiz-store'
    }
  )
);