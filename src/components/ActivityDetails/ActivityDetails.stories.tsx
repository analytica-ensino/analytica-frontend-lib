import type { Story } from '@ladle/react';
import { ActivityDetails } from './ActivityDetails';
import type { ActivityDetailsProps } from './ActivityDetails';
import { STUDENT_ACTIVITY_STATUS } from '../../types/activityDetails';
import type { ActivityDetailsData } from '../../types/activityDetails';
import { QUESTION_STATUS } from '../../types/studentActivityCorrection';
import type { StudentActivityCorrectionData } from '../../types/studentActivityCorrection';

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
    notAnswered: [5],
  },
};

/**
 * Mock correction data with alternatives
 */
const mockCorrectionData: StudentActivityCorrectionData = {
  studentId: 'student-2',
  studentName: 'Maria Santos',
  score: 7,
  correctCount: 3,
  incorrectCount: 1,
  blankCount: 1,
  questions: [
    {
      questionNumber: 1,
      status: QUESTION_STATUS.CORRETA,
      studentAnswer: 'A',
      correctAnswer: 'A',
      questionText: 'Qual é a capital do Brasil?',
      alternatives: [
        { value: 'A', label: 'Brasília', isCorrect: true },
        { value: 'B', label: 'São Paulo', isCorrect: false },
        { value: 'C', label: 'Rio de Janeiro', isCorrect: false },
        { value: 'D', label: 'Salvador', isCorrect: false },
      ],
    },
    {
      questionNumber: 2,
      status: QUESTION_STATUS.INCORRETA,
      studentAnswer: 'B',
      correctAnswer: 'C',
      questionText: 'Qual o maior planeta do sistema solar?',
      alternatives: [
        { value: 'A', label: 'Terra', isCorrect: false },
        { value: 'B', label: 'Marte', isCorrect: false },
        { value: 'C', label: 'Júpiter', isCorrect: true },
        { value: 'D', label: 'Saturno', isCorrect: false },
      ],
    },
    {
      questionNumber: 3,
      status: QUESTION_STATUS.CORRETA,
      studentAnswer: 'D',
      correctAnswer: 'D',
      questionText: 'Qual elemento químico é representado pelo símbolo "O"?',
      alternatives: [
        { value: 'A', label: 'Ouro', isCorrect: false },
        { value: 'B', label: 'Osmio', isCorrect: false },
        { value: 'C', label: 'Óganesson', isCorrect: false },
        { value: 'D', label: 'Oxigênio', isCorrect: true },
      ],
    },
    {
      questionNumber: 4,
      status: QUESTION_STATUS.CORRETA,
      studentAnswer: 'A',
      correctAnswer: 'A',
      questionText: 'Qual é o resultado de 2 + 2?',
      alternatives: [
        { value: 'A', label: '4', isCorrect: true },
        { value: 'B', label: '5', isCorrect: false },
        { value: 'C', label: '22', isCorrect: false },
        { value: 'D', label: '3', isCorrect: false },
      ],
    },
    {
      questionNumber: 5,
      status: QUESTION_STATUS.EM_BRANCO,
      studentAnswer: undefined,
      correctAnswer: 'B',
      questionText: 'Qual é a fórmula da água?',
      alternatives: [
        { value: 'A', label: 'CO2', isCorrect: false },
        { value: 'B', label: 'H2O', isCorrect: true },
        { value: 'C', label: 'NaCl', isCorrect: false },
        { value: 'D', label: 'O2', isCorrect: false },
      ],
    },
  ],
};

/**
 * Default props for stories
 */
const defaultProps: ActivityDetailsProps = {
  activityId: 'activity-123',
  fetchActivityDetails: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockActivityData;
  },
  fetchStudentCorrection: async (
    _activityId: string,
    _studentId: string,
    _studentName: string
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockCorrectionData;
  },
  submitObservation: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
  onBack: () => console.log('Navigate back clicked'),
  onViewActivity: () => console.log('View activity clicked'),
};

/**
 * Default story
 */
export const Default: Story = () => <ActivityDetails {...defaultProps} />;

/**
 * Loading state story
 */
export const Loading: Story = () => (
  <ActivityDetails
    {...defaultProps}
    fetchActivityDetails={() => new Promise(() => {})}
  />
);

/**
 * Error state story
 */
export const ErrorState: Story = () => (
  <ActivityDetails
    {...defaultProps}
    fetchActivityDetails={() =>
      Promise.reject<ActivityDetailsData>(new Error('Erro ao carregar dados'))
    }
  />
);

/**
 * Empty students story
 */
export const EmptyStudents: Story = () => (
  <ActivityDetails
    {...defaultProps}
    fetchActivityDetails={async () => ({
      ...mockActivityData,
      students: [],
    })}
  />
);

/**
 * High completion rate story
 */
export const HighCompletionRate: Story = () => (
  <ActivityDetails
    {...defaultProps}
    fetchActivityDetails={async () => ({
      ...mockActivityData,
      generalStats: {
        averageScore: 9.2,
        completionPercentage: 95,
      },
    })}
  />
);

/**
 * Low completion rate story
 */
export const LowCompletionRate: Story = () => (
  <ActivityDetails
    {...defaultProps}
    fetchActivityDetails={async () => ({
      ...mockActivityData,
      generalStats: {
        averageScore: 5.5,
        completionPercentage: 25,
      },
    })}
  />
);

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

  return (
    <ActivityDetails
      {...defaultProps}
      fetchActivityDetails={async () => ({
        ...mockActivityData,
        students: manyStudents,
        pagination: {
          total: 20,
          page: 1,
          limit: 10,
          totalPages: 2,
        },
      })}
    />
  );
};
