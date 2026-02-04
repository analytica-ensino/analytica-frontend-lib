/**
 * Status of lesson progress
 */
export type LessonProgressStatus = 'completed' | 'in_progress' | 'no_data';

/**
 * Lesson progress item with optional nested children
 * Supports multi-level hierarchy: Topic > Subtopic > Lesson
 */
export interface LessonProgressItem {
  /** Unique identifier */
  id: string;
  /** Topic/subtopic/lesson name */
  topic: string;
  /** Progress percentage (0-100), null if no data */
  progress: number | null;
  /** Progress status */
  status: LessonProgressStatus;
  /** Nested children for hierarchical display */
  children?: LessonProgressItem[];
}

/**
 * Student lesson progress data structure
 * Matches backend GET /performance/student/:studentId response
 */
export interface StudentLessonProgressData {
  /** Student name */
  name: string;
  /** Overall completion rate percentage (0-100) */
  overallCompletionRate: number;
  /** Topic with best result */
  bestResult: string | null;
  /** Topic with biggest difficulty */
  biggestDifficulty: string | null;
  /** Lesson progress items (can be nested) */
  lessonProgress: LessonProgressItem[];
}

/**
 * Customizable labels for the modal
 */
export interface StudentLessonProgressLabels {
  /** Modal title */
  title: string;
  /** Completion rate label */
  completionRateLabel: string;
  /** Best result label */
  bestResultLabel: string;
  /** Biggest difficulty label */
  biggestDifficultyLabel: string;
  /** Lesson progress section title */
  lessonProgressTitle: string;
  /** No data message */
  noDataMessage: string;
  /** Error message prefix */
  errorMessagePrefix: string;
}

/**
 * Default labels in Portuguese (pt-BR)
 */
export const DEFAULT_LESSON_PROGRESS_LABELS: StudentLessonProgressLabels = {
  title: 'Desempenho',
  completionRateLabel: 'CONCLUÍDO',
  bestResultLabel: 'MELHOR RESULTADO',
  biggestDifficultyLabel: 'MAIOR DIFICULDADE',
  lessonProgressTitle: 'Conclusão das aulas',
  noDataMessage: 'Sem dados ainda!',
  errorMessagePrefix: 'Erro ao carregar dados',
};

/**
 * Props for StudentLessonProgressModal component
 */
export interface StudentLessonProgressModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Student lesson progress data */
  data: StudentLessonProgressData | null;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Custom labels */
  labels?: Partial<StudentLessonProgressLabels>;
}
