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
  correctActivity: string;
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
  correctActivity: 'Corrigir atividade',
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
  /** Answer ID from the API (used for correction) */
  answerId: string;
  /** Activity ID this question belongs to */
  activityId: string;
  title: string;
  statement: string;
  /** Question type (e.g., 'DISSERTATIVA', 'MULTIPLA_ESCOLHA') */
  questionType: string;
  /** Whether the answer is correct (null for not yet evaluated) */
  isCorrect: boolean | null;
  /** Teacher feedback for the answer */
  teacherFeedback: string | null;
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

/**
 * Activity data for the StudentActivityPerformanceModal
 */
export interface PerformanceActivity {
  id: string;
  title: string;
  questions: LessonQuestion[];
}

/**
 * Lesson data for the StudentActivityPerformanceModal (placeholder for future)
 */
export interface PerformanceLesson {
  id: string;
  title: string;
  progress: number;
}

/**
 * Data for StudentActivityPerformanceModal
 */
export interface StudentActivityPerformanceData {
  /** User institution ID for API calls */
  userInstitutionId: string;
  /** User ID for correction API calls */
  userId: string;
  studentName: string;
  /** Student score (0-10) */
  score: number | null;
  /** Number of correct answers */
  correctAnswers: number;
  /** Number of incorrect answers */
  incorrectAnswers: number;
  /** Time to complete (formatted string, e.g., "30 dias") */
  completionTime: string | null;
  /** Best result topic */
  bestResult: string | null;
  /** Hardest topic */
  hardestTopic: string | null;
  /** List of activities with questions */
  activities: PerformanceActivity[];
  /** List of lessons (placeholder) */
  lessons?: PerformanceLesson[];
}

/**
 * Correction data for a question
 */
export interface QuestionCorrection {
  questionId: string;
  activityId: string;
  isCorrect: boolean | null;
  teacherFeedback: string;
}

/**
 * Labels for StudentActivityPerformanceModal (pt-BR)
 */
export interface StudentActivityPerformanceLabels {
  title: string;
  resultTitle: string;
  scoreLabel: string;
  correctAnswersLabel: string;
  incorrectAnswersLabel: string;
  completionTimeLabel: string;
  bestResultLabel: string;
  hardestTopicLabel: string;
  activitiesTitle: string;
  lessonsTitle: string;
  lessonsInDevelopment: string;
  feedbackPlaceholder: string;
  markCorrect: string;
  markIncorrect: string;
  /** Label for pending correction (e.g. essay not yet graded) */
  pending: string;
  /** Label for "yes" in "is correct?" radio (e.g. Sim) */
  correctYes: string;
  /** Label for "no" in "is correct?" radio (e.g. Não) */
  correctNo: string;
  /** Label for the "is correct?" question (e.g. Resposta está correta?) */
  isCorrectQuestionLabel: string;
  /** Label for the observation/feedback section (e.g. Incluir observação) */
  observationLabel: string;
  saveCorrection: string;
  saving: string;
}

/**
 * Default labels for StudentActivityPerformanceModal (pt-BR)
 */
export const DEFAULT_ACTIVITY_PERFORMANCE_LABELS: StudentActivityPerformanceLabels =
  {
    title: 'Corrigir atividade',
    resultTitle: 'Resultado da atividade',
    scoreLabel: 'NOTA',
    correctAnswersLabel: 'N° DE QUESTÕES CORRETAS',
    incorrectAnswersLabel: 'N° DE QUESTÕES INCORRETAS',
    completionTimeLabel: 'TEMPO DE CONCLUSÃO',
    bestResultLabel: 'MELHOR RESULTADO',
    hardestTopicLabel: 'MAIOR DIFICULDADE',
    activitiesTitle: 'Atividade',
    lessonsTitle: 'Aulas',
    lessonsInDevelopment: 'Em desenvolvimento',
    feedbackPlaceholder: 'Adicionar feedback para o aluno...',
    markCorrect: 'Correta',
    markIncorrect: 'Incorreta',
    pending: 'Pendente',
    correctYes: 'Sim',
    correctNo: 'Não',
    isCorrectQuestionLabel: 'Resposta está correta?',
    observationLabel: 'Incluir observação',
    saveCorrection: 'Salvar correção',
    saving: 'Salvando...',
  };
