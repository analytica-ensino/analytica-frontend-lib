import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export enum QUESTION_DIFFICULTY {
  FACIL = 'FACIL',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFICIL',
}

export enum QUESTION_TYPE {
  ALTERNATIVA = 'ALTERNATIVA',
  DISSERTATIVA = 'DISSERTATIVA',
  MULTIPLA_CHOICE = 'MULTIPLA_CHOICE',
  VERDADEIRO_FALSO = 'VERDADEIRO_FALSO',
  LIGAR_PONTOS = 'LIGAR_PONTOS',
  PREENCHER = 'PREENCHER',
  IMAGEM = 'IMAGEM',
}

export enum QUESTION_STATUS {
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
}

export enum ANSWER_STATUS {
  RESPOSTA_CORRETA = 'RESPOSTA_CORRETA',
  RESPOSTA_INCORRETA = 'RESPOSTA_INCORRETA',
  PENDENTE_AVALIACAO = 'PENDENTE_AVALIACAO',
}

export interface Question {
  id: string;
  questionText: string;
  description: string;
  type: QUESTION_TYPE;
  status: QUESTION_STATUS;
  difficulty: QUESTION_DIFFICULTY;
  examBoard: string;
  examYear: string;
  answerKey: null | string;
  institutionIds: string[];
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
    isCorrect: boolean;
  }[];
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

interface UserAnswerItem {
  questionId: string;
  activityId: string;
  userId: string;
  answer: string | null;
  optionId: string | null;
  questionType: QUESTION_TYPE;
  answerStatus: ANSWER_STATUS;
}

interface QuizState {
  // Data
  bySimulated?: Simulado;
  byActivity?: Atividade;
  byQuestionary?: Aula;

  // UI State
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  userAnswers: UserAnswerItem[];
  timeElapsed: number;
  isStarted: boolean;
  isFinished: boolean;
  userId: string;
  // Actions
  setBySimulated: (simulado: Simulado) => void;
  setByActivity: (atividade: Atividade) => void;
  setByQuestionary: (aula: Aula) => void;
  setUserId: (userId: string) => void;
  setUserAnswers: (userAnswers: UserAnswerItem[]) => void;

  // Quiz Navigation
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;
  getActiveQuiz: () => {
    quiz: Simulado | Atividade | Aula;
    type: 'bySimulated' | 'byActivity' | 'byQuestionary';
  } | null;

  // Quiz Actions
  selectAnswer: (questionId: string, answerId: string) => void;
  selectMultipleAnswer: (questionId: string, answerIds: string[]) => void;
  selectDissertativeAnswer: (questionId: string, answer: string) => void;
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
  getCurrentAnswer: () => UserAnswerItem | undefined;
  getAllCurrentAnswer: () => UserAnswerItem[] | undefined;
  getQuizTitle: () => string;
  formatTime: (seconds: number) => string;
  getUserAnswers: () => UserAnswerItem[];
  getUnansweredQuestionsFromUserAnswers: () => number[];
  getQuestionsGroupedBySubject: () => { [key: string]: Question[] };
  getUserId: () => string;
  setCurrentQuestion: (question: Question) => void;

  // New methods for userAnswers
  getUserAnswerByQuestionId: (questionId: string) => UserAnswerItem | null;
  isQuestionAnsweredByUserAnswers: (questionId: string) => boolean;
  getQuestionStatusFromUserAnswers: (
    questionId: string
  ) => 'answered' | 'unanswered' | 'skipped';
  getUserAnswersForActivity: () => UserAnswerItem[];

  // Answer status management
  setAnswerStatus: (questionId: string, status: ANSWER_STATUS) => void;
  getAnswerStatus: (questionId: string) => ANSWER_STATUS | null;
}

export const useQuizStore = create<QuizState>()(
  devtools(
    (set, get) => {
      let timerInterval: ReturnType<typeof setInterval> | null = null;

      const startTimer = () => {
        if (get().isFinished) {
          return;
        }

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
        userAnswers: [],
        timeElapsed: 0,
        isStarted: false,
        isFinished: false,
        userId: '',

        // Setters
        setBySimulated: (simulado) => set({ bySimulated: simulado }),
        setByActivity: (atividade) => set({ byActivity: atividade }),
        setByQuestionary: (aula) => set({ byQuestionary: aula }),
        setUserId: (userId) => set({ userId }),
        setUserAnswers: (userAnswers) => set({ userAnswers }),
        getUserId: () => get().userId,

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

        getActiveQuiz: () => {
          const { bySimulated, byActivity, byQuestionary } = get();
          if (bySimulated)
            return { quiz: bySimulated, type: 'bySimulated' as const };
          if (byActivity)
            return { quiz: byActivity, type: 'byActivity' as const };
          if (byQuestionary)
            return { quiz: byQuestionary, type: 'byQuestionary' as const };
          return null;
        },

        selectAnswer: (questionId, answerId) => {
          const { getActiveQuiz, userAnswers } = get();
          const activeQuiz = getActiveQuiz();

          if (!activeQuiz) return;

          const activityId = activeQuiz.quiz.id;
          const userId = get().getUserId();

          if (!userId || userId === '') {
            console.warn('selectAnswer called before userId is set');
            return;
          }

          const question = activeQuiz.quiz.questions.find(
            (q) => q.id === questionId
          );
          if (!question) return;

          const existingAnswerIndex = userAnswers.findIndex(
            (answer) => answer.questionId === questionId
          );

          const newUserAnswer: UserAnswerItem = {
            questionId,
            activityId,
            userId,
            answer:
              question.type === QUESTION_TYPE.DISSERTATIVA ? answerId : null,
            optionId:
              question.type === QUESTION_TYPE.DISSERTATIVA ? null : answerId,
            questionType: question.type,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          };

          let updatedUserAnswers;
          if (existingAnswerIndex !== -1) {
            updatedUserAnswers = [...userAnswers];
            updatedUserAnswers[existingAnswerIndex] = newUserAnswer;
          } else {
            updatedUserAnswers = [...userAnswers, newUserAnswer];
          }

          set({
            userAnswers: updatedUserAnswers,
          });
        },

        selectMultipleAnswer: (questionId, answerIds) => {
          const { getActiveQuiz, userAnswers } = get();
          const activeQuiz = getActiveQuiz();

          if (!activeQuiz) return;

          const activityId = activeQuiz.quiz.id;
          const userId = get().getUserId();

          if (!userId || userId === '') {
            console.warn('selectMultipleAnswer called before userId is set');
            return;
          }

          const question = activeQuiz.quiz.questions.find(
            (q) => q.id === questionId
          );
          if (!question) return;

          // Remove all existing answers for this questionId
          const filteredUserAnswers = userAnswers.filter(
            (answer) => answer.questionId !== questionId
          );

          // Create new UserAnswerItem objects for each answerId
          const newUserAnswers: UserAnswerItem[] = answerIds.map(
            (answerId) => ({
              questionId,
              activityId,
              userId,
              answer: null, // selectMultipleAnswer is for non-dissertative questions
              optionId: answerId, // selectMultipleAnswer should only set optionId
              questionType: question.type,
              answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            })
          );

          // Combine filtered answers with new answers
          const updatedUserAnswers = [
            ...filteredUserAnswers,
            ...newUserAnswers,
          ];

          set({
            userAnswers: updatedUserAnswers,
          });
        },

        selectDissertativeAnswer: (questionId, answer) => {
          const { getActiveQuiz, userAnswers } = get();
          const activeQuiz = getActiveQuiz();

          if (!activeQuiz) return;

          const activityId = activeQuiz.quiz.id;
          const userId = get().getUserId();

          if (!userId || userId === '') {
            console.warn(
              'selectDissertativeAnswer called before userId is set'
            );
            return;
          }

          const question = activeQuiz.quiz.questions.find(
            (q) => q.id === questionId
          );
          if (!question || question.type !== QUESTION_TYPE.DISSERTATIVA) {
            console.warn(
              'selectDissertativeAnswer called for non-dissertative question'
            );
            return;
          }

          const existingAnswerIndex = userAnswers.findIndex(
            (answerItem) => answerItem.questionId === questionId
          );

          const newUserAnswer: UserAnswerItem = {
            questionId,
            activityId,
            userId,
            answer: answer,
            optionId: null,
            questionType: QUESTION_TYPE.DISSERTATIVA,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          };

          let updatedUserAnswers;
          if (existingAnswerIndex !== -1) {
            updatedUserAnswers = [...userAnswers];
            updatedUserAnswers[existingAnswerIndex] = newUserAnswer;
          } else {
            updatedUserAnswers = [...userAnswers, newUserAnswer];
          }

          set({
            userAnswers: updatedUserAnswers,
          });
        },

        skipQuestion: () => {
          const { getCurrentQuestion, userAnswers, getActiveQuiz } = get();
          const currentQuestion = getCurrentQuestion();
          const activeQuiz = getActiveQuiz();

          if (!activeQuiz) return;

          if (currentQuestion) {
            const activityId = activeQuiz.quiz.id;
            const userId = get().getUserId();

            if (!userId || userId === '') {
              console.warn('skipQuestion called before userId is set');
              return;
            }

            const existingAnswerIndex = userAnswers.findIndex(
              (answer) => answer.questionId === currentQuestion.id
            );

            const newUserAnswer: UserAnswerItem = {
              questionId: currentQuestion.id,
              activityId,
              userId,
              answer: null,
              optionId: null,
              questionType: currentQuestion.type,
              answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
            };

            let updatedUserAnswers;
            if (existingAnswerIndex !== -1) {
              // Update existing answer
              updatedUserAnswers = [...userAnswers];
              updatedUserAnswers[existingAnswerIndex] = newUserAnswer;
            } else {
              // Add new answer
              updatedUserAnswers = [...userAnswers, newUserAnswer];
            }

            set({
              userAnswers: updatedUserAnswers,
            });
          }
        },

        addUserAnswer: (questionId, answerId) => {
          const { getActiveQuiz, userAnswers } = get();
          const activeQuiz = getActiveQuiz();

          if (!activeQuiz) return;

          // Add to userAnswers array with new structure
          const activityId = activeQuiz.quiz.id;
          const userId = get().getUserId();

          if (!userId || userId === '') {
            console.warn('addUserAnswer called before userId is set');
            return;
          }

          const question = activeQuiz.quiz.questions.find(
            (q) => q.id === questionId
          );
          if (!question) return;

          const existingAnswerIndex = userAnswers.findIndex(
            (answer) => answer.questionId === questionId
          );

          const newUserAnswer: UserAnswerItem = {
            questionId,
            activityId,
            userId,
            answer:
              question.type === QUESTION_TYPE.DISSERTATIVA
                ? answerId || null
                : null,
            optionId:
              question.type !== QUESTION_TYPE.DISSERTATIVA
                ? answerId || null
                : null,
            questionType: question.type,
            answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
          };

          if (existingAnswerIndex !== -1) {
            // Update existing answer
            const updatedUserAnswers = [...userAnswers];
            updatedUserAnswers[existingAnswerIndex] = newUserAnswer;
            set({ userAnswers: updatedUserAnswers });
          } else {
            // Add new answer
            set({ userAnswers: [...userAnswers, newUserAnswer] });
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
            userAnswers: [],
            timeElapsed: 0,
            isStarted: false,
            isFinished: false,
            userId: '',
          });
        },

        // Timer
        updateTime: (time) => set({ timeElapsed: time }),
        startTimer,
        stopTimer,

        // Getters
        getCurrentQuestion: () => {
          const { currentQuestionIndex, getActiveQuiz } = get();
          const activeQuiz = getActiveQuiz();

          if (!activeQuiz) {
            return null;
          }

          return activeQuiz.quiz.questions[currentQuestionIndex];
        },

        getTotalQuestions: () => {
          const { getActiveQuiz } = get();
          const activeQuiz = getActiveQuiz();

          return activeQuiz?.quiz?.questions?.length || 0;
        },

        getAnsweredQuestions: () => {
          const { userAnswers } = get();
          return userAnswers.filter(
            (answer) => answer.optionId !== null || answer.answer !== null
          ).length;
        },

        getUnansweredQuestions: () => {
          const { getActiveQuiz, userAnswers } = get();
          const activeQuiz = getActiveQuiz();
          if (!activeQuiz) return [];

          const unansweredQuestions: number[] = [];

          activeQuiz.quiz.questions.forEach((question, index) => {
            const userAnswer = userAnswers.find(
              (answer) => answer.questionId === question.id
            );
            const isAnswered =
              userAnswer &&
              (userAnswer.optionId !== null || userAnswer.answer !== null);
            const isSkipped =
              userAnswer &&
              userAnswer.optionId === null &&
              userAnswer.answer === null;

            if (!isAnswered && !isSkipped) {
              unansweredQuestions.push(index + 1); // index + 1 para mostrar número da questão
            }
          });
          return unansweredQuestions;
        },

        getSkippedQuestions: () => {
          const { userAnswers } = get();
          return userAnswers.filter(
            (answer) => answer.optionId === null && answer.answer === null
          ).length;
        },

        getProgress: () => {
          const { getTotalQuestions, getAnsweredQuestions } = get();
          const total = getTotalQuestions();
          const answered = getAnsweredQuestions();

          return total > 0 ? (answered / total) * 100 : 0;
        },

        isQuestionAnswered: (questionId) => {
          const { userAnswers } = get();
          const userAnswer = userAnswers.find(
            (answer) => answer.questionId === questionId
          );
          return userAnswer
            ? userAnswer.optionId !== null || userAnswer.answer !== null
            : false;
        },

        isQuestionSkipped: (questionId) => {
          const { userAnswers } = get();
          const userAnswer = userAnswers.find(
            (answer) => answer.questionId === questionId
          );
          return userAnswer
            ? userAnswer.optionId === null && userAnswer.answer === null
            : false;
        },

        getCurrentAnswer: () => {
          const { getCurrentQuestion, userAnswers } = get();
          const currentQuestion = getCurrentQuestion();

          if (!currentQuestion) return undefined;

          const userAnswer = userAnswers.find(
            (answer) => answer.questionId === currentQuestion.id
          );

          return userAnswer;
        },

        getAllCurrentAnswer: () => {
          const { getCurrentQuestion, userAnswers } = get();
          const currentQuestion = getCurrentQuestion();

          if (!currentQuestion) return undefined;

          const userAnswer = userAnswers.filter(
            (answer) => answer.questionId === currentQuestion.id
          );

          return userAnswer;
        },

        getQuizTitle: () => {
          const { getActiveQuiz } = get();
          const activeQuiz = getActiveQuiz();

          return activeQuiz?.quiz?.title || 'Quiz';
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
          const { getActiveQuiz, userAnswers } = get();
          const activeQuiz = getActiveQuiz();
          if (!activeQuiz) return [];

          const unansweredQuestions: number[] = [];

          activeQuiz.quiz.questions.forEach((question, index) => {
            const userAnswer = userAnswers.find(
              (answer) => answer.questionId === question.id
            );
            const hasAnswer =
              userAnswer &&
              (userAnswer.optionId !== null || userAnswer.answer !== null);
            const isSkipped =
              userAnswer &&
              userAnswer.optionId === null &&
              userAnswer.answer === null;

            // Se não há resposta do usuário OU se a questão foi pulada
            if (!hasAnswer || isSkipped) {
              unansweredQuestions.push(index + 1); // index + 1 para mostrar número da questão
            }
          });

          return unansweredQuestions;
        },

        getQuestionsGroupedBySubject: () => {
          const { getActiveQuiz } = get();
          const activeQuiz = getActiveQuiz();
          if (!activeQuiz) return {};

          const groupedQuestions: { [key: string]: Question[] } = {};

          activeQuiz.quiz.questions.forEach((question) => {
            const subjectId =
              question.knowledgeMatrix?.[0]?.subjectId || 'Sem matéria';

            if (!groupedQuestions[subjectId]) {
              groupedQuestions[subjectId] = [];
            }

            groupedQuestions[subjectId].push(question);
          });

          return groupedQuestions;
        },

        // New methods for userAnswers
        getUserAnswerByQuestionId: (questionId) => {
          const { userAnswers } = get();
          return (
            userAnswers.find((answer) => answer.questionId === questionId) ||
            null
          );
        },
        isQuestionAnsweredByUserAnswers: (questionId) => {
          const { userAnswers } = get();
          const answer = userAnswers.find(
            (answer) => answer.questionId === questionId
          );
          return answer
            ? answer.optionId !== null || answer.answer !== null
            : false;
        },
        getQuestionStatusFromUserAnswers: (questionId) => {
          const { userAnswers } = get();
          const answer = userAnswers.find(
            (answer) => answer.questionId === questionId
          );
          if (!answer) return 'unanswered';
          if (answer.optionId === null) return 'skipped';
          return 'answered';
        },
        getUserAnswersForActivity: () => {
          const { userAnswers } = get();
          return userAnswers;
        },
        setCurrentQuestion: (question) => {
          const { getActiveQuiz } = get();
          const activeQuiz = getActiveQuiz();
          if (!activeQuiz) return;

          const questionIndex = activeQuiz.quiz.questions.findIndex(
            (q) => q.id === question.id
          );

          // Validate that the question was found before updating currentQuestionIndex
          if (questionIndex === -1) {
            console.warn(
              `Question with id "${question.id}" not found in active quiz`
            );
            return;
          }

          set({ currentQuestionIndex: questionIndex });
        },

        setAnswerStatus: (questionId, status) => {
          const { userAnswers } = get();
          const existingAnswerIndex = userAnswers.findIndex(
            (answer) => answer.questionId === questionId
          );

          if (existingAnswerIndex !== -1) {
            const updatedUserAnswers = [...userAnswers];
            updatedUserAnswers[existingAnswerIndex] = {
              ...updatedUserAnswers[existingAnswerIndex],
              answerStatus: status,
            };
            set({ userAnswers: updatedUserAnswers });
          }
        },

        getAnswerStatus: (questionId) => {
          const { userAnswers } = get();
          const userAnswer = userAnswers.find(
            (answer) => answer.questionId === questionId
          );
          return userAnswer ? userAnswer.answerStatus : null;
        },
      };
    },
    {
      name: 'quiz-store',
    }
  )
);
