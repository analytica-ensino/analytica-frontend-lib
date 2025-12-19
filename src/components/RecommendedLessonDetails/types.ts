import type { StudentLessonStatus } from '../../types/recommendedLessons';

/**
 * Internal student type for table display
 */
export interface DisplayStudent extends Record<string, unknown> {
  id: string;
  name: string;
  status: StudentLessonStatus;
  completionPercentage: number;
  duration: string | null;
}

/**
 * Labels for the RecommendedLessonDetails component
 */
export interface LessonDetailsLabels {
  viewLesson: string;
  viewPerformance: string;
  resultsTitle: string;
  completedLabel: string;
  bestResultLabel: string;
  hardestTopicLabel: string;
  studentColumn: string;
  statusColumn: string;
  completionColumn: string;
  durationColumn: string;
}

/**
 * Default labels for the component (pt-BR)
 */
export const DEFAULT_LABELS: LessonDetailsLabels = {
  viewLesson: 'Ver aula',
  viewPerformance: 'Ver desempenho',
  resultsTitle: 'Resultados da aula recomendada',
  completedLabel: 'CONCLUÍDO',
  bestResultLabel: 'MELHOR RESULTADO',
  hardestTopicLabel: 'MAIOR DIFICULDADE',
  studentColumn: 'Aluno',
  statusColumn: 'Status',
  completionColumn: 'Conclusão',
  durationColumn: 'Duração',
};

/**
 * Breadcrumb item type
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

/**
 * Question alternative data
 */
export interface QuestionAlternative {
  id: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
}

/**
 * Question data for the performance modal
 */
export interface LessonQuestion {
  id: string;
  title: string;
  statement: string;
  isCorrect: boolean;
  alternatives: QuestionAlternative[];
}

/**
 * Lesson progress data for the performance modal
 */
export interface LessonProgress {
  id: string;
  title: string;
  progress: number;
  questions: LessonQuestion[];
}

/**
 * Student performance data for the modal
 */
export interface StudentPerformanceData {
  studentName: string;
  correctAnswers: number;
  incorrectAnswers: number;
  bestResult: string | null;
  hardestTopic: string | null;
  lessons: LessonProgress[];
}

/**
 * Labels for the StudentPerformanceModal component (pt-BR)
 */
export interface StudentPerformanceLabels {
  title: string;
  correctAnswersLabel: string;
  incorrectAnswersLabel: string;
  bestResultLabel: string;
  hardestTopicLabel: string;
  lessonsTitle: string;
}

/**
 * Default labels for StudentPerformanceModal (pt-BR)
 */
export const DEFAULT_PERFORMANCE_LABELS: StudentPerformanceLabels = {
  title: 'Desempenho',
  correctAnswersLabel: 'N° DE QUESTÕES CORRETAS',
  incorrectAnswersLabel: 'N° DE QUESTÕES INCORRETAS',
  bestResultLabel: 'MELHOR RESULTADO',
  hardestTopicLabel: 'MAIOR DIFICULDADE',
  lessonsTitle: 'Aulas',
};
