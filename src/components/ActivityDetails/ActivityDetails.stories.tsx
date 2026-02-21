import type { Story } from '@ladle/react';
import { ActivityDetails } from './ActivityDetails';
import type { ActivityDetailsProps } from './ActivityDetails';
import { STUDENT_ACTIVITY_STATUS } from '../../types/activityDetails';
import type {
  ActivityDetailsData,
  ActivityDetailsApiResponse,
  QuizResponse,
  PresignedUrlResponse,
} from '../../types/activityDetails';
import type {
  StudentActivityCorrectionData,
  QuestionsAnswersByStudentResponse,
} from '../../utils/studentActivityCorrection';
import type { BaseApiClient } from '../../types/api';
import {
  QUESTION_TYPE,
  QUESTION_DIFFICULTY,
  ANSWER_STATUS,
  type Question,
  type QuestionResult,
} from '../Quiz/useQuizStore';

/**
 * Mock activity details data
 */
const mockActivityData: ActivityDetailsData = {
  activity: {
    id: 'activity-123',
    title: 'Prova de Matemática - 1º Bimestre',
    startDate: '2024-01-15',
    finalDate: '2024-01-20',
    schoolName: 'Escola Municipal São Paulo',
    year: '2024',
    subjectName: 'Matemática',
    className: '9º Ano A',
  },
  students: [
    {
      studentId: 'student-1',
      studentName: 'João Silva',
      answeredAt: '2024-01-16T10:30:00Z',
      timeSpent: 3600,
      score: 8.5,
      status: STUDENT_ACTIVITY_STATUS.CONCLUIDO,
    },
    {
      studentId: 'student-2',
      studentName: 'Maria Santos',
      answeredAt: '2024-01-17T14:20:00Z',
      timeSpent: 2700,
      score: null,
      status: STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO,
    },
    {
      studentId: 'student-3',
      studentName: 'Pedro Oliveira',
      answeredAt: null,
      timeSpent: 0,
      score: null,
      status: STUDENT_ACTIVITY_STATUS.AGUARDANDO_RESPOSTA,
    },
    {
      studentId: 'student-4',
      studentName: 'Ana Costa',
      answeredAt: '2024-01-18T09:00:00Z',
      timeSpent: 1800,
      score: 7,
      status: STUDENT_ACTIVITY_STATUS.NAO_ENTREGUE,
    },
    {
      studentId: 'student-5',
      studentName: 'Lucas Ferreira',
      answeredAt: '2024-01-16T11:45:00Z',
      timeSpent: 4200,
      score: 9.5,
      status: STUDENT_ACTIVITY_STATUS.CONCLUIDO,
    },
  ],
  pagination: {
    total: 5,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  generalStats: {
    averageScore: 7.5,
    completionPercentage: 60,
  },
  questionStats: {
    mostCorrect: [0, 2, 4],
    mostIncorrect: [1, 3],
    notAnswered: 1,
  },
};

/**
 * Helper function to create a Question in Quiz format
 */
const createQuestion = (
  id: string,
  statement: string,
  questionType: QUESTION_TYPE,
  options?: Array<{ id: string; option: string }>,
  correctOptionIds?: string[]
): Question => {
  return {
    id,
    statement,
    questionType,
    difficultyLevel: QUESTION_DIFFICULTY.MEDIO,
    description: '',
    examBoard: null,
    examYear: null,
    solutionExplanation: null,
    answer: null,
    answerStatus: ANSWER_STATUS.PENDENTE_AVALIACAO,
    options: options || [],
    knowledgeMatrix: [
      {
        areaKnowledge: { id: 'area1', name: 'Área de Conhecimento' },
        subject: {
          id: 'subject1',
          name: 'Matemática',
          color: '#FF6B6B',
          icon: 'Calculator',
        },
        topic: { id: 'topic1', name: 'Tópico' },
        subtopic: { id: 'subtopic1', name: 'Subtópico' },
        content: { id: 'content1', name: 'Conteúdo' },
      },
    ],
    correctOptionIds: correctOptionIds || [],
  };
};

/**
 * Helper function to create a QuestionResult answer in Quiz format
 */
const createQuestionResult = (
  id: string,
  questionId: string,
  answerStatus: ANSWER_STATUS,
  answer: string | null = null,
  selectedOptions: Array<{ optionId: string }> = [],
  options?: Array<{ id: string; option: string; isCorrect: boolean }>,
  teacherFeedback: string | null = null,
  statement: string = '',
  questionType: QUESTION_TYPE = QUESTION_TYPE.ALTERNATIVA,
  difficultyLevel: QUESTION_DIFFICULTY = QUESTION_DIFFICULTY.MEDIO,
  solutionExplanation: string | null = null
): QuestionResult['answers'][number] => {
  return {
    id,
    questionId,
    answer,
    selectedOptions,
    answerStatus,
    statement,
    questionType,
    difficultyLevel,
    solutionExplanation,
    correctOption: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    options: options || [],
    knowledgeMatrix: [],
    teacherFeedback,
    attachment: null,
    score: null,
    gradedAt: null,
    gradedBy: null,
  };
};

/**
 * Mock correction data with mixed question types
 */
const mockCorrectionData: StudentActivityCorrectionData = {
  studentId: 'student-2',
  studentName: 'Maria Santos',
  score: 7.5,
  correctCount: 3,
  incorrectCount: 1,
  blankCount: 1,
  questions: [
    {
      question: createQuestion(
        'q1',
        'Qual é a capital do Brasil?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Brasília' },
          { id: 'opt2', option: 'São Paulo' },
          { id: 'opt3', option: 'Rio de Janeiro' },
          { id: 'opt4', option: 'Salvador' },
        ],
        ['opt1']
      ),
      result: createQuestionResult(
        'a1',
        'q1',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }],
        [
          { id: 'opt1', option: 'Brasília', isCorrect: true },
          { id: 'opt2', option: 'São Paulo', isCorrect: false },
          { id: 'opt3', option: 'Rio de Janeiro', isCorrect: false },
          { id: 'opt4', option: 'Salvador', isCorrect: false },
        ],
        null,
        'Qual é a capital do Brasil?',
        QUESTION_TYPE.ALTERNATIVA
      ),
      questionNumber: 1,
    },
    {
      question: createQuestion(
        'q2',
        'Qual o maior planeta do sistema solar?',
        QUESTION_TYPE.ALTERNATIVA,
        [
          { id: 'opt1', option: 'Terra' },
          { id: 'opt2', option: 'Marte' },
          { id: 'opt3', option: 'Júpiter' },
          { id: 'opt4', option: 'Saturno' },
        ],
        ['opt3']
      ),
      result: createQuestionResult(
        'a2',
        'q2',
        ANSWER_STATUS.RESPOSTA_INCORRETA,
        null,
        [{ optionId: 'opt2' }],
        [
          { id: 'opt1', option: 'Terra', isCorrect: false },
          { id: 'opt2', option: 'Marte', isCorrect: false },
          { id: 'opt3', option: 'Júpiter', isCorrect: true },
          { id: 'opt4', option: 'Saturno', isCorrect: false },
        ],
        null,
        'Qual o maior planeta do sistema solar?',
        QUESTION_TYPE.ALTERNATIVA
      ),
      questionNumber: 2,
    },
    {
      question: createQuestion(
        'q3',
        'Quais são os números primos? (Selecione todas as opções corretas)',
        QUESTION_TYPE.MULTIPLA_ESCOLHA,
        [
          { id: 'opt1', option: '2' },
          { id: 'opt2', option: '4' },
          { id: 'opt3', option: '7' },
          { id: 'opt4', option: '9' },
        ],
        ['opt1', 'opt3']
      ),
      result: createQuestionResult(
        'a3',
        'q3',
        ANSWER_STATUS.RESPOSTA_CORRETA,
        null,
        [{ optionId: 'opt1' }, { optionId: 'opt3' }],
        [
          { id: 'opt1', option: '2', isCorrect: true },
          { id: 'opt2', option: '4', isCorrect: false },
          { id: 'opt3', option: '7', isCorrect: true },
          { id: 'opt4', option: '9', isCorrect: false },
        ],
        null,
        'Quais são os números primos? (Selecione todas as opções corretas)',
        QUESTION_TYPE.MULTIPLA_ESCOLHA
      ),
      questionNumber: 3,
    },
    {
      question: createQuestion(
        'q4',
        'Explique o processo de fotossíntese e sua importância.',
        QUESTION_TYPE.DISSERTATIVA
      ),
      result: createQuestionResult(
        'a4',
        'q4',
        ANSWER_STATUS.PENDENTE_AVALIACAO,
        'A fotossíntese é o processo pelo qual as plantas convertem luz solar em energia. É importante porque produz oxigênio.',
        [],
        [],
        null,
        'Explique o processo de fotossíntese e sua importância.',
        QUESTION_TYPE.DISSERTATIVA
      ),
      questionNumber: 4,
      correction: {
        isCorrect: null,
        teacherFeedback: '',
      },
    },
    {
      question: createQuestion(
        'q5',
        'Marque Verdadeiro ou Falso:',
        QUESTION_TYPE.VERDADEIRO_FALSO,
        [
          { id: 'opt1', option: 'A água ferve a 100°C ao nível do mar.' },
          { id: 'opt2', option: 'O sol é uma estrela.' },
        ],
        ['opt1', 'opt2']
      ),
      result: createQuestionResult(
        'a5',
        'q5',
        ANSWER_STATUS.NAO_RESPONDIDO,
        null,
        [],
        [
          {
            id: 'opt1',
            option: 'A água ferve a 100°C ao nível do mar.',
            isCorrect: true,
          },
          { id: 'opt2', option: 'O sol é uma estrela.', isCorrect: true },
        ],
        null,
        'Marque Verdadeiro ou Falso:',
        QUESTION_TYPE.VERDADEIRO_FALSO
      ),
      questionNumber: 5,
    },
  ],
};

/**
 * Create mock API client for stories
 */
const createMockApiClient = (): BaseApiClient => ({
  get: async <T,>(
    url: string,
    _config?: { params?: Record<string, unknown> }
  ) => {
    // Handle activity details endpoint
    if (url === '/activities/activity-123/details') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const response: ActivityDetailsApiResponse = {
        message: 'Success',
        data: {
          students: mockActivityData.students,
          pagination: mockActivityData.pagination,
          generalStats: mockActivityData.generalStats,
          questionStats: mockActivityData.questionStats,
        },
      };
      return { data: response as T };
    }

    // Handle quiz endpoint
    if (url === '/activities/activity-123/quiz') {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const activity = mockActivityData.activity!;
      const response: QuizResponse = {
        message: 'Success',
        data: {
          ...activity,
          type: 'QUIZ',
        },
      };
      return { data: response as T };
    }

    // Handle student correction endpoint
    if (url.includes('/questions/activity/') && url.includes('/user/')) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const apiResponse: QuestionsAnswersByStudentResponse = {
        data: {
          answers: mockCorrectionData.questions.map((q) => q.result),
          statistics: {
            totalAnswered:
              mockCorrectionData.correctCount +
              mockCorrectionData.incorrectCount +
              mockCorrectionData.blankCount,
            correctAnswers: mockCorrectionData.correctCount,
            incorrectAnswers: mockCorrectionData.incorrectCount,
            pendingAnswers: mockCorrectionData.questions.filter(
              (q) => q.result.answerStatus === 'PENDENTE_AVALIACAO'
            ).length,
            score: mockCorrectionData.score || 0,
            timeSpent: 0,
          },
        },
      };
      return { data: apiResponse as T };
    }

    throw new Error(`Unknown endpoint: ${url}`);
  },
  post: async <T,>(url: string, body?: Record<string, unknown>) => {
    // Handle presigned URL endpoint
    if (url === '/user/get-pre-signed-url') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const response: PresignedUrlResponse = {
        data: {
          url: 'https://mock-s3-url.com/',
          fields: {
            key: 'mock-key',
            'Content-Type': 'application/pdf',
          },
        },
      };
      return { data: response as T };
    }

    // Handle observation submission
    if (url.includes('/feedback/observation')) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log('Observation submitted:', body);
      return { data: { message: 'Success' } as T };
    }

    // Handle question correction submission
    if (url.includes('/questions/correction')) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Question correction submitted:', body);
      return { data: { message: 'Success' } as T };
    }

    throw new Error(`Unknown endpoint: ${url}`);
  },
  patch: async () => {
    throw new Error('PATCH not implemented in mock');
  },
  delete: async () => {
    throw new Error('DELETE not implemented in mock');
  },
});

/**
 * Default props for stories
 */
const defaultProps: ActivityDetailsProps = {
  activityId: 'activity-123',
  apiClient: createMockApiClient(),
  onBack: () => console.log('Navigate back clicked'),
};

/**
 * Default story
 */
export const Default: Story = () => <ActivityDetails {...defaultProps} />;

/**
 * Loading state story
 */
export const Loading: Story = () => {
  const loadingApiClient: BaseApiClient = {
    ...createMockApiClient(),
    get: () => new Promise(() => {}), // Never resolves
  };

  return <ActivityDetails {...defaultProps} apiClient={loadingApiClient} />;
};

/**
 * Error state story
 */
export const ErrorState: Story = () => {
  const errorApiClient: BaseApiClient = {
    ...createMockApiClient(),
    get: () => Promise.reject(new Error('Erro ao carregar dados')),
  };

  return <ActivityDetails {...defaultProps} apiClient={errorApiClient} />;
};

/**
 * Empty students story
 */
export const EmptyStudents: Story = () => {
  const emptyApiClient: BaseApiClient = {
    ...createMockApiClient(),
    get: async <T,>(url: string) => {
      if (url === '/activities/activity-123/details') {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response: ActivityDetailsApiResponse = {
          message: 'Success',
          data: {
            ...mockActivityData,
            students: [],
          },
        };
        return { data: response as T };
      }
      return createMockApiClient().get<T>(url);
    },
  };

  return <ActivityDetails {...defaultProps} apiClient={emptyApiClient} />;
};

/**
 * High completion rate story
 */
export const HighCompletionRate: Story = () => {
  const highRateApiClient: BaseApiClient = {
    ...createMockApiClient(),
    get: async <T,>(url: string) => {
      if (url === '/activities/activity-123/details') {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response: ActivityDetailsApiResponse = {
          message: 'Success',
          data: {
            ...mockActivityData,
            generalStats: {
              averageScore: 9.2,
              completionPercentage: 95,
            },
          },
        };
        return { data: response as T };
      }
      return createMockApiClient().get<T>(url);
    },
  };

  return <ActivityDetails {...defaultProps} apiClient={highRateApiClient} />;
};

/**
 * Low completion rate story
 */
export const LowCompletionRate: Story = () => {
  const lowRateApiClient: BaseApiClient = {
    ...createMockApiClient(),
    get: async <T,>(url: string) => {
      if (url === '/activities/activity-123/details') {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response: ActivityDetailsApiResponse = {
          message: 'Success',
          data: {
            ...mockActivityData,
            generalStats: {
              averageScore: 5.5,
              completionPercentage: 25,
            },
          },
        };
        return { data: response as T };
      }
      return createMockApiClient().get<T>(url);
    },
  };

  return <ActivityDetails {...defaultProps} apiClient={lowRateApiClient} />;
};

/**
 * Many students story
 */
export const ManyStudents: Story = () => {
  const manyStudents = Array.from({ length: 20 }, (_, i) => ({
    studentId: `student-${i + 1}`,
    studentName: `Aluno ${i + 1}`,
    answeredAt: i % 3 === 0 ? null : '2024-01-16T10:30:00Z',
    timeSpent: Math.floor(Math.random() * 5000),
    score: i % 4 === 0 ? null : Math.random() * 10,
    status: Object.values(STUDENT_ACTIVITY_STATUS)[i % 4],
  }));

  const manyStudentsApiClient: BaseApiClient = {
    ...createMockApiClient(),
    get: async <T,>(url: string) => {
      if (url === '/activities/activity-123/details') {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response: ActivityDetailsApiResponse = {
          message: 'Success',
          data: {
            ...mockActivityData,
            students: manyStudents,
            pagination: {
              total: 20,
              page: 1,
              limit: 10,
              totalPages: 2,
            },
          },
        };
        return { data: response as T };
      }
      return createMockApiClient().get<T>(url);
    },
  };

  return (
    <ActivityDetails {...defaultProps} apiClient={manyStudentsApiClient} />
  );
};
