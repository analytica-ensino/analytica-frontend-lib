import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export enum Difficulty {
  FACIL = 'FACIL',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFICIL',
}

export interface Question {
  id: string;
  questionText: string;
  correctOptionId: string;
  description: string;
  type: 'ALTERNATIVA' | 'DISSERTATIVA' | 'MULTIPLA_CHOICE';
  status: 'APROVADO' | 'REPROVADO';
  difficulty: Difficulty;
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
  category: string;
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
  bySimulated?: Simulado;
  byActivity?: Atividade;
  byQuestionary?: Aula;

  // UI State
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  skippedQuestions: string[];
  userAnswers: UserAnswer[];
  timeElapsed: number;
  isStarted: boolean;
  isFinished: boolean;

  // Actions
  setBySimulated: (simulado: Simulado) => void;
  setByActivity: (atividade: Atividade) => void;
  setByQuestionary: (aula: Aula) => void;

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
  startTimer: () => void;
  stopTimer: () => void;

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
    (set, get) => {
      let timerInterval: ReturnType<typeof setInterval> | null = null;

      const startTimer = () => {
        if (timerInterval) {
          clearInterval(timerInterval);
        }

        timerInterval = setInterval(() => {
          const { timeElapsed } = get();
          set({ timeElapsed: timeElapsed + 1 });
        }, 1000);
      };

      const stopTimer = () => {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      };

      return {
        // Initial State
        currentQuestionIndex: 0,
        selectedAnswers: {},
        skippedQuestions: [],
        userAnswers: [],
        timeElapsed: 0,
        isStarted: false,
        isFinished: false,

        // Setters
        setBySimulated: (simulado) => set({ bySimulated: simulado }),
        setByActivity: (atividade) => set({ byActivity: atividade }),
        setByQuestionary: (aula) => set({ byQuestionary: aula }),

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
          const { bySimulated, byActivity, byQuestionary, skippedQuestions } =
            get();
          const quiz = bySimulated || byActivity || byQuestionary;

          if (!quiz) return;

          // Update the question's answerKey in the quiz
          const updatedQuestions = quiz.questions.map((question) =>
            question.id === questionId
              ? { ...question, answerKey: answerId }
              : question
          );

          let quizType: 'bySimulated' | 'byActivity' | 'byQuestionary';
          if (bySimulated) {
            quizType = 'bySimulated';
          } else if (byActivity) {
            quizType = 'byActivity';
          } else {
            quizType = 'byQuestionary';
          }
          const updatedQuiz = { ...quiz, questions: updatedQuestions };

          set({
            [quizType]: updatedQuiz,
            skippedQuestions: skippedQuestions.filter(
              (id) => id !== questionId
            ),
          });
        },

        skipQuestion: () => {
          const { getCurrentQuestion, skippedQuestions } = get();
          const currentQuestion = getCurrentQuestion();

          if (currentQuestion) {
            set({
              skippedQuestions: [...skippedQuestions, currentQuestion.id],
            });
          }
        },

        addUserAnswer: (questionId, answerId) => {
          const { bySimulated, byActivity, byQuestionary } = get();
          const quiz = bySimulated || byActivity || byQuestionary;

          if (!quiz) return;

          const question = quiz.questions.find((q) => q.id === questionId);

          if (!question) return;

          // Update the question's answerKey in the quiz
          const updatedQuestions = quiz.questions.map((q) =>
            q.id === questionId ? { ...q, answerKey: answerId || null } : q
          );

          // Update the appropriate quiz type
          if (bySimulated) {
            set({
              bySimulated: { ...bySimulated, questions: updatedQuestions },
            });
          }
          if (byActivity) {
            set({
              byActivity: { ...byActivity, questions: updatedQuestions },
            });
          }
          if (byQuestionary) {
            set({
              byQuestionary: { ...byQuestionary, questions: updatedQuestions },
            });
          }
        },

        startQuiz: () => {
          set({ isStarted: true, timeElapsed: 0 });
          startTimer();
        },

        finishQuiz: () => {
          set({ isFinished: true });
          stopTimer();
        },

        resetQuiz: () => {
          stopTimer();
          set({
            currentQuestionIndex: 0,
            selectedAnswers: {},
            skippedQuestions: [],
            userAnswers: [],
            timeElapsed: 0,
            isStarted: false,
            isFinished: false,
          });
        },

        // Timer
        updateTime: (time) => set({ timeElapsed: time }),
        startTimer,
        stopTimer,

        // Getters
        getCurrentQuestion: () => {
          const {
            bySimulated,
            byActivity,
            byQuestionary,
            currentQuestionIndex,
          } = get();
          const quiz = bySimulated || byActivity || byQuestionary;

          if (!quiz) {
            return null;
          }

          return quiz.questions[currentQuestionIndex];
        },

        getTotalQuestions: () => {
          const { bySimulated, byActivity, byQuestionary } = get();
          const quiz = bySimulated || byActivity || byQuestionary;

          return quiz?.questions?.length || 0;
        },

        getAnsweredQuestions: () => {
          const { bySimulated, byActivity, byQuestionary } = get();
          const quiz = bySimulated || byActivity || byQuestionary;

          if (!quiz) return 0;

          return quiz.questions.filter(
            (question) => question.answerKey !== null
          ).length;
        },

        getUnansweredQuestions: () => {
          const { bySimulated, byActivity, byQuestionary, skippedQuestions } =
            get();
          const quiz = bySimulated || byActivity || byQuestionary;
          if (!quiz) return [];

          const unansweredQuestions: number[] = [];

          quiz.questions.forEach((question, index) => {
            const isAnswered = question.answerKey !== null;
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
          const { bySimulated, byActivity, byQuestionary } = get();
          const quiz = bySimulated || byActivity || byQuestionary;

          if (!quiz) return false;

          const question = quiz.questions.find((q) => q.id === questionId);
          return question ? question.answerKey !== null : false;
        },

        isQuestionSkipped: (questionId) => {
          const { skippedQuestions } = get();
          return skippedQuestions.includes(questionId);
        },

        getCurrentAnswer: () => {
          const { getCurrentQuestion } = get();
          const currentQuestion = getCurrentQuestion();

          return currentQuestion?.answerKey || undefined;
        },

        getQuizTitle: () => {
          const { bySimulated, byActivity, byQuestionary } = get();
          const quiz = bySimulated || byActivity || byQuestionary;

          return quiz?.title || 'Quiz';
        },

        formatTime: (seconds: number) => {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        },

        getUserAnswers: () => {
          const { bySimulated, byActivity, byQuestionary, skippedQuestions } =
            get();
          const quiz = bySimulated || byActivity || byQuestionary;

          if (!quiz) return [];

          return quiz.questions.map((question) => ({
            ...question,
            isSkipped: skippedQuestions.includes(question.id),
          }));
        },

        getUnansweredQuestionsFromUserAnswers: () => {
          const { bySimulated, byActivity, byQuestionary, skippedQuestions } =
            get();
          const quiz = bySimulated || byActivity || byQuestionary;
          if (!quiz) return [];

          const unansweredQuestions: number[] = [];

          quiz.questions.forEach((question, index) => {
            const hasAnswer = question.answerKey !== null;
            const isSkipped = skippedQuestions.includes(question.id);

            // Se não há resposta do usuário OU se a questão foi pulada
            if (!hasAnswer || isSkipped) {
              unansweredQuestions.push(index + 1); // index + 1 para mostrar número da questão
            }
          });

          return unansweredQuestions;
        },

        getQuestionsGroupedBySubject: () => {
          const { bySimulated, byActivity, byQuestionary } = get();
          const quiz = bySimulated || byActivity || byQuestionary;
          if (!quiz) return {};

          const groupedQuestions: { [key: string]: Question[] } = {};

          quiz.questions.forEach((question) => {
            const subjectId =
              question.knowledgeMatrix?.[0]?.subjectId || 'Sem matéria';

            if (!groupedQuestions[subjectId]) {
              groupedQuestions[subjectId] = [];
            }

            groupedQuestions[subjectId].push(question);
          });

          return groupedQuestions;
        },
      };
    },
    {
      name: 'quiz-store',
    }
  )
);
