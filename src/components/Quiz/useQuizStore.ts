import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export enum QUESTION_DIFFICULTY {
  FACIL = 'FACIL',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFICIL',
}

// Enum para tipos de quiz
export enum QUIZ_TYPE {
  SIMULADO = 'SIMULADO',
  QUESTIONARIO = 'QUESTIONARIO',
  ATIVIDADE = 'ATIVIDADE',
}

export enum QUESTION_TYPE {
  ALTERNATIVA = 'ALTERNATIVA',
  DISSERTATIVA = 'DISSERTATIVA',
  MULTIPLA_ESCOLHA = 'MULTIPLA_ESCOLHA',
  VERDADEIRO_FALSO = 'VERDADEIRO_FALSO',
  LIGAR_PONTOS = 'LIGAR_PONTOS',
  PREENCHER = 'PREENCHER',
  IMAGEM = 'IMAGEM',
}

export enum QUESTION_STATUS {
  PENDENTE_AVALIACAO = 'PENDENTE_AVALIACAO',
  RESPOSTA_CORRETA = 'RESPOSTA_CORRETA',
  RESPOSTA_INCORRETA = 'RESPOSTA_INCORRETA',
  NAO_RESPONDIDO = 'NAO_RESPONDIDO',
}

export enum ANSWER_STATUS {
  RESPOSTA_CORRETA = 'RESPOSTA_CORRETA',
  RESPOSTA_INCORRETA = 'RESPOSTA_INCORRETA',
  PENDENTE_AVALIACAO = 'PENDENTE_AVALIACAO',
  NAO_RESPONDIDO = 'NAO_RESPONDIDO',
}

export enum SUBTYPE_ENUM {
  PROVA = 'PROVA',
  ENEM_PROVA_1 = 'ENEM_PROVA_1',
  ENEM_PROVA_2 = 'ENEM_PROVA_2',
  VESTIBULAR = 'VESTIBULAR',
  SIMULADO = 'SIMULADO',
  SIMULADAO = 'SIMULADAO',
}

export interface QuestionResult {
  answers: {
    id: string;
    questionId: string;
    answer: string | null;
    selectedOptions: {
      optionId: string;
    }[];
    answerStatus: ANSWER_STATUS;
    statement: string;
    questionType: QUESTION_TYPE;
    difficultyLevel: QUESTION_DIFFICULTY;
    solutionExplanation: string | null;
    correctOption: string;
    createdAt: string;
    updatedAt: string;
    options?: {
      id: string;
      option: string;
      isCorrect: boolean;
    }[];
    knowledgeMatrix: {
      areaKnowledge: {
        id: string;
        name: string;
      } | null;
      subject: {
        id: string;
        name: string;
        color: string;
        icon: string;
      } | null;
      topic: {
        id: string;
        name: string;
      } | null;
      subtopic: {
        id: string;
        name: string;
      } | null;
      content: {
        id: string;
        name: string;
      } | null;
    }[];
    teacherFeedback: string | null;
    attachment: string | null;
    score: number | null;
    gradedAt: string | null;
    gradedBy: string | null;
  }[];
  statistics: {
    totalAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    pendingAnswers: number;
    score: number;
    timeSpent: number;
  };
}

export interface Question {
  id: string;
  statement: string;
  questionType: QUESTION_TYPE;
  difficultyLevel: QUESTION_DIFFICULTY;
  description: string;
  examBoard: string | null;
  examYear: string | null;
  solutionExplanation: string | null;
  answer: null;
  answerStatus: ANSWER_STATUS;
  options: {
    id: string;
    option: string;
  }[];
  knowledgeMatrix: {
    areaKnowledge: {
      id: string;
      name: string;
    };
    subject: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
    topic: {
      id: string;
      name: string;
    };
    subtopic: {
      id: string;
      name: string;
    };
    content: {
      id: string;
      name: string;
    };
  }[];
  correctOptionIds?: string[];
}

export interface QuizInterface {
  id: string;
  title: string;
  type: QUIZ_TYPE;
  subtype: SUBTYPE_ENUM | string;
  difficulty: string | null;
  notification: string | null;
  status: string;
  startDate: string | null;
  finalDate: string | null;
  canRetry: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  questions: Question[];
}

export interface UserAnswerItem {
  questionId: string;
  activityId: string;
  userId: string;
  answer: string | null;
  optionId: string | null;
  questionType: QUESTION_TYPE;
  answerStatus: ANSWER_STATUS;
}

export interface QuizState {
  // Data
  quiz: QuizInterface | null;

  // UI State
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  userAnswers: UserAnswerItem[];
  timeElapsed: number;
  isStarted: boolean;
  isFinished: boolean;
  userId: string;
  variant: 'result' | 'default';
  minuteCallback: (() => void) | null;
  // Actions
  setQuiz: (quiz: QuizInterface) => void;
  setQuestionResult: (questionResult: QuestionResult) => void;
  setUserId: (userId: string) => void;
  setUserAnswers: (userAnswers: UserAnswerItem[]) => void;
  setVariant: (variant: 'result' | 'default') => void;
  // Quiz Navigation
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;

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

  // Minute Callback
  setMinuteCallback: (callback: (() => void) | null) => void;
  startMinuteCallback: () => void;
  stopMinuteCallback: () => void;

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
  getQuestionIndex: (questionId: string) => number;
  getUserAnswerByQuestionId: (questionId: string) => UserAnswerItem | null;
  isQuestionAnsweredByUserAnswers: (questionId: string) => boolean;
  getQuestionStatusFromUserAnswers: (
    questionId: string
  ) => 'answered' | 'unanswered' | 'skipped';
  getUserAnswersForActivity: () => UserAnswerItem[];
  // Answer status management
  setAnswerStatus: (questionId: string, status: ANSWER_STATUS) => void;
  getAnswerStatus: (questionId: string) => ANSWER_STATUS | null;

  // Question Result
  questionsResult: QuestionResult | null;
  currentQuestionResult: QuestionResult['answers'] | null;
  setQuestionsResult: (questionsResult: QuestionResult) => void;
  setCurrentQuestionResult: (
    currentQuestionResult: QuestionResult['answers']
  ) => void;
  getQuestionResultByQuestionId: (
    questionId: string
  ) => QuestionResult['answers'][number] | null;
  getQuestionResultStatistics: () => QuestionResult['statistics'] | null;
  getQuestionResult: () => QuestionResult | null;
  getCurrentQuestionResult: () => QuestionResult['answers'] | null;
}

// Constants
export const MINUTE_INTERVAL_MS = 60000; // 60 seconds = 1 minute

export const useQuizStore = create<QuizState>()(
  devtools(
    (set, get) => {
      let timerInterval: ReturnType<typeof setInterval> | null = null;
      let minuteCallbackInterval: ReturnType<typeof setInterval> | null = null;

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

      const setMinuteCallback = (callback: (() => void) | null) => {
        set({ minuteCallback: callback });
      };

      const startMinuteCallback = () => {
        const { minuteCallback, isFinished } = get();

        if (isFinished || !minuteCallback) {
          return;
        }

        if (minuteCallbackInterval) {
          clearInterval(minuteCallbackInterval);
        }

        minuteCallbackInterval = setInterval(() => {
          const {
            minuteCallback: currentCallback,
            isFinished: currentIsFinished,
          } = get();

          if (currentIsFinished || !currentCallback) {
            stopMinuteCallback();
            return;
          }

          currentCallback();
        }, MINUTE_INTERVAL_MS);
      };

      const stopMinuteCallback = () => {
        if (minuteCallbackInterval) {
          clearInterval(minuteCallbackInterval);
          minuteCallbackInterval = null;
        }
      };

      return {
        // Initial State
        quiz: null,
        currentQuestionIndex: 0,
        selectedAnswers: {},
        userAnswers: [],
        timeElapsed: 0,
        isStarted: false,
        isFinished: false,
        userId: '',
        variant: 'default',
        minuteCallback: null,
        questionsResult: null,
        currentQuestionResult: null,
        // Setters
        setQuiz: (quiz) => set({ quiz }),
        setUserId: (userId) => set({ userId }),
        setUserAnswers: (userAnswers) => set({ userAnswers }),
        getUserId: () => get().userId,
        setVariant: (variant) => set({ variant }),
        setQuestionResult: (questionsResult) => set({ questionsResult }),
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

        selectAnswer: (questionId, answerId) => {
          const { quiz, userAnswers } = get();

          if (!quiz) return;

          const activityId = quiz.id;
          const userId = get().getUserId();

          if (!userId || userId === '') {
            // Silent validation - userId not set
            return;
          }

          const question = quiz.questions.find((q) => q.id === questionId);
          if (!question) return;

          const existingAnswerIndex = userAnswers.findIndex(
            (answer) => answer.questionId === questionId
          );

          const newUserAnswer: UserAnswerItem = {
            questionId,
            activityId,
            userId,
            answer:
              question.questionType === QUESTION_TYPE.DISSERTATIVA
                ? answerId
                : null,
            optionId:
              question.questionType === QUESTION_TYPE.DISSERTATIVA
                ? null
                : answerId,
            questionType: question.questionType,
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
          const { quiz, userAnswers } = get();

          if (!quiz) return;

          const activityId = quiz.id;
          const userId = get().getUserId();

          if (!userId || userId === '') {
            // Silent validation - userId not set
            return;
          }

          const question = quiz.questions.find((q) => q.id === questionId);
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
              questionType: question.questionType,
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
          const { quiz, userAnswers } = get();

          if (!quiz) return;

          const activityId = quiz.id;
          const userId = get().getUserId();

          if (!userId || userId === '') {
            // Silent validation - userId not set
            return;
          }

          const question = quiz.questions.find((q) => q.id === questionId);
          if (
            !question ||
            question.questionType !== QUESTION_TYPE.DISSERTATIVA
          ) {
            // Silent validation - wrong question type
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
          const { getCurrentQuestion, userAnswers, quiz } = get();
          const currentQuestion = getCurrentQuestion();

          if (!quiz) return;

          if (currentQuestion) {
            const activityId = quiz.id;
            const userId = get().getUserId();

            if (!userId || userId === '') {
              // Silent validation - userId not set
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
              questionType: currentQuestion.questionType,
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
          const { quiz, userAnswers } = get();

          if (!quiz) return;

          // Add to userAnswers array with new structure
          const activityId = quiz.id;
          const userId = get().getUserId();

          if (!userId || userId === '') {
            // Silent validation - userId not set
            return;
          }

          const question = quiz.questions.find((q) => q.id === questionId);
          if (!question) return;

          const existingAnswerIndex = userAnswers.findIndex(
            (answer) => answer.questionId === questionId
          );

          const newUserAnswer: UserAnswerItem = {
            questionId,
            activityId,
            userId,
            answer:
              question.questionType === QUESTION_TYPE.DISSERTATIVA
                ? answerId || null
                : null,
            optionId:
              question.questionType !== QUESTION_TYPE.DISSERTATIVA
                ? answerId || null
                : null,
            questionType: question.questionType,
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
          startMinuteCallback();
        },

        finishQuiz: () => {
          set({ isFinished: true });
          stopTimer();
          stopMinuteCallback();
        },

        resetQuiz: () => {
          stopTimer();
          stopMinuteCallback();
          set({
            quiz: null,
            currentQuestionIndex: 0,
            selectedAnswers: {},
            userAnswers: [],
            timeElapsed: 0,
            isStarted: false,
            isFinished: false,
            userId: '',
            variant: 'default',
            minuteCallback: null,
            questionsResult: null,
            currentQuestionResult: null,
          });
        },

        // Timer
        updateTime: (time) => set({ timeElapsed: time }),
        startTimer,
        stopTimer,

        // Minute Callback
        setMinuteCallback,
        startMinuteCallback,
        stopMinuteCallback,

        // Getters
        getCurrentQuestion: () => {
          const { currentQuestionIndex, quiz } = get();

          if (!quiz) {
            return null;
          }

          return quiz.questions[currentQuestionIndex];
        },

        getTotalQuestions: () => {
          const { quiz } = get();

          return quiz?.questions?.length || 0;
        },

        getAnsweredQuestions: () => {
          const { userAnswers } = get();
          return userAnswers.filter(
            (answer) => answer.optionId !== null || answer.answer !== null
          ).length;
        },

        getUnansweredQuestions: () => {
          const { quiz, userAnswers } = get();
          if (!quiz) return [];

          const unansweredQuestions: number[] = [];

          quiz.questions.forEach((question, index) => {
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

          // Retorna undefined se a resposta está vazia (não respondida)
          const hasAnswerContent = (ua?: UserAnswerItem | null) =>
            !!ua &&
            ((ua.optionId !== null && ua.optionId !== '') ||
              (ua.answer !== null && ua.answer !== ''));

          if (!hasAnswerContent(userAnswer)) {
            return undefined;
          }

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
          const { quiz } = get();

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
          const { quiz, userAnswers } = get();
          if (!quiz) return [];

          const unansweredQuestions: number[] = [];

          quiz.questions.forEach((question, index) => {
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
          const { getQuestionResult, quiz, variant } = get();
          const questions =
            variant == 'result'
              ? getQuestionResult()?.answers
              : quiz?.questions;
          if (!questions) return {};
          const groupedQuestions: {
            [key: string]: (Question | QuestionResult['answers'][number])[];
          } = {};
          questions.forEach((question) => {
            const subjectId =
              question.knowledgeMatrix?.[0]?.subject?.id || 'Sem matéria';

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
          const { quiz, variant, questionsResult } = get();
          if (!quiz) return;
          let questionIndex = 0;
          if (variant == 'result') {
            if (!questionsResult) return;
            const questionResult =
              questionsResult.answers.find((q) => q.id === question.id) ??
              questionsResult.answers.find((q) => q.questionId === question.id);
            if (!questionResult) return;
            questionIndex = quiz.questions.findIndex(
              (q) => q.id === questionResult.questionId
            );
          } else {
            questionIndex = quiz.questions.findIndex(
              (q) => q.id === question.id
            );
          }

          // Validate that the question was found before updating currentQuestionIndex
          if (questionIndex === -1) {
            // Silent validation - question not found
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
        getQuestionIndex: (questionId) => {
          const { questionsResult, variant, quiz } = get();
          if (variant == 'result') {
            if (!questionsResult) return 0;

            let idx = questionsResult.answers.findIndex(
              (q) => q.questionId === questionId
            );
            if (idx === -1) {
              idx = questionsResult.answers.findIndex(
                (q) => q.id === questionId
              );
            }
            return idx !== -1 ? idx + 1 : 0;
          } else {
            if (!quiz) return 0;
            const idx = quiz.questions.findIndex((q) => q.id === questionId);
            return idx !== -1 ? idx + 1 : 0;
          }
        },

        // Question Result
        getQuestionResultByQuestionId: (questionId) => {
          const { questionsResult } = get();
          const question = questionsResult?.answers.find(
            (answer) => answer.questionId === questionId
          );

          return question || null;
        },
        getQuestionResultStatistics: () => {
          const { questionsResult } = get();
          return questionsResult?.statistics || null;
        },
        getQuestionResult: () => {
          const { questionsResult } = get();
          return questionsResult;
        },
        setQuestionsResult: (questionsResult) => {
          set({ questionsResult });
        },
        setCurrentQuestionResult: (currentQuestionResult) => {
          set({ currentQuestionResult });
        },
        getCurrentQuestionResult: () => {
          const { currentQuestionResult } = get();
          return currentQuestionResult;
        },
      };
    },
    {
      name: 'quiz-store',
    }
  )
);
