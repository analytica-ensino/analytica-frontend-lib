/**
 * Activity progress data for the accordion section
 */
export interface ActivityProgress {
  /** Unique identifier */
  id: string;
  /** Activity name */
  name: string;
  /** Number of correct answers */
  correctCount: number;
  /** Total number of questions */
  totalCount: number;
  /** True if activity has not been completed yet */
  hasNoData?: boolean;
  /** Optional description shown when accordion is expanded */
  description?: string;
}

/**
 * Complete student performance details data
 */
export interface StudentPerformanceDetailsData {
  /** Student name */
  studentName: string;
  /** Main stat: NOTA (grade/score) */
  grade: {
    /** Grade value (e.g., 9.0) */
    value: number;
    /** Performance label (e.g., "Acima da média") */
    performanceLabel: string;
  };
  /** Main stat: N° DE QUESTÕES CORRETAS */
  correctQuestions: {
    /** Number of correct answers */
    value: number;
    /** Best result topic name */
    bestResultTopic: string | null;
  };
  /** Main stat: N° DE QUESTÕES INCORRETAS */
  incorrectQuestions: {
    /** Number of incorrect answers */
    value: number;
    /** Hardest topic name */
    hardestTopic: string | null;
  };
  /** Secondary stat: ATIVIDADES REALIZADAS */
  activitiesCompleted: number | string;
  /** Secondary stat: CONTEÚDOS CONCLUÍDOS (deprecated - not displayed) */
  contentsCompleted?: number | string;
  /** Secondary stat: QUESTÕES RESPONDIDAS */
  questionsAnswered: number | string;
  /** Tertiary stat: QUANTIDADE DE ACESSOS */
  accessCount: number | string;
  /** Tertiary stat: TEMPO ONLINE (format: "00:00:00") */
  timeOnline: string;
  /** Tertiary stat: ÚLTIMO LOGIN (format: "00/00/0000 • 00:00h") */
  lastLogin: string;
  /** Activity progress list */
  activities: ActivityProgress[];
}

/**
 * Customizable labels for the modal
 */
export interface StudentPerformanceDetailsLabels {
  /** Modal title */
  title: string;
  /** Grade card label */
  gradeLabel: string;
  /** Correct questions card label */
  correctQuestionsLabel: string;
  /** Incorrect questions card label */
  incorrectQuestionsLabel: string;
  /** Performance tag label */
  performanceTagLabel: string;
  /** Best result label */
  bestResultLabel: string;
  /** Hardest topic label */
  hardestTopicLabel: string;
  /** Activities completed label */
  activitiesLabel: string;
  /** Contents completed label (deprecated - not displayed) */
  contentsLabel?: string;
  /** Questions answered label */
  questionsLabel: string;
  /** Access count label */
  accessCountLabel: string;
  /** Time online label */
  timeOnlineLabel: string;
  /** Last login label */
  lastLoginLabel: string;
  /** Activities progress section title */
  activitiesProgressTitle: string;
  /** No data message */
  noDataMessage: string;
  /** Activity progress text template (use {correct} and {total} placeholders) */
  activityProgressText: string;
  /** Activity details unavailable message */
  activityDetailsUnavailable: string;
}

/**
 * Default labels in Portuguese (pt-BR)
 */
export const DEFAULT_PERFORMANCE_DETAILS_LABELS: StudentPerformanceDetailsLabels =
  {
    title: 'Desempenho em 7 dias',
    gradeLabel: 'NOTA',
    correctQuestionsLabel: 'N° DE QUESTÕES CORRETAS',
    incorrectQuestionsLabel: 'N° DE QUESTÕES INCORRETAS',
    performanceTagLabel: 'DESEMPENHO',
    bestResultLabel: 'MELHOR RESULTADO',
    hardestTopicLabel: 'MAIOR DIFICULDADE',
    activitiesLabel: 'ATIVIDADES REALIZADAS',
    contentsLabel: 'CONTEÚDOS CONCLUÍDOS',
    questionsLabel: 'QUESTÕES RESPONDIDAS',
    accessCountLabel: 'QUANTIDADE DE ACESSOS',
    timeOnlineLabel: 'TEMPO ONLINE',
    lastLoginLabel: 'ÚLTIMO LOGIN',
    activitiesProgressTitle: 'Desempenho atividades',
    noDataMessage: 'Sem dados ainda! A atividade ainda não foi feita.',
    activityProgressText: '{correct} de {total} corretas',
    activityDetailsUnavailable: 'Detalhes da atividade não disponíveis.',
  };

/**
 * Props for StudentPerformanceDetailsModal component
 */
export interface StudentPerformanceDetailsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Student performance data */
  data: StudentPerformanceDetailsData | null;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Custom labels */
  labels?: Partial<StudentPerformanceDetailsLabels>;
}
