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
 * Default labels for the component
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
