/**
 * Types of the student simulations details modal.
 *
 * They mirror `POST /performance/simulated/activities/student-simulations`,
 * the teacher/manager-scoped endpoint that answers everything the modal shows
 * for one student under a given simulado cut and time window.
 */

/**
 * Performance band of a student, as classified by the server.
 *
 * With `performanceMode=absolute` the server derives the band from the
 * percentage: >=90 HIGHLIGHT, >=70 ABOVE_AVERAGE, >=40 BELOW_AVERAGE, else
 * ATTENTION_POINT. See {@link SIMULATED_SIMULATIONS_TAG_CONFIG}.
 */
export type SimulatedPerformanceTag =
  | 'HIGHLIGHT'
  | 'ABOVE_AVERAGE'
  | 'BELOW_AVERAGE'
  | 'ATTENTION_POINT';

/**
 * Label and badge colours per band.
 *
 * The colours are the gestor's map-token palette for the same bands, so the
 * ranking tables, the distribution pie and this badge all read alike.
 *
 * Deliberately separate from `SIMULATED_PERFORMANCE_TAG_CONFIG` in
 * `SimulatedStudentDetailsModal`: that one maps a band to a `variant` for the
 * ENEM stack's own badge, while this one carries explicit classes. Merging them
 * would repaint the ENEM screens.
 */
export const SIMULATED_SIMULATIONS_TAG_CONFIG: Record<
  SimulatedPerformanceTag,
  { label: string; badgeClassName: string }
> = {
  HIGHLIGHT: {
    label: 'Destaque da turma',
    badgeClassName: 'bg-success-300 text-text',
  },
  ABOVE_AVERAGE: {
    label: 'Acima da média',
    badgeClassName: 'bg-indicator-positive text-warning-900',
  },
  BELOW_AVERAGE: {
    label: 'Abaixo da média',
    badgeClassName: 'bg-warning-400 text-text',
  },
  ATTENTION_POINT: {
    label: 'Ponto de atenção',
    badgeClassName: 'bg-error-700 text-text-100',
  },
};

/** A content (subtema) with the student's hit rate on it. */
export interface StudentContentHitRate {
  contentId: string;
  contentName: string;
  correct: number;
  totalQuestions: number;
  /** 0-100 */
  correctPercentage: number;
}

/**
 * One simulado the student answered, as the details modal lists it.
 *
 * `score` is a 0-100 percentage shown as a 0-10 grade; `answeredAt` is an ISO
 * string, null when the server has no date for the attempt.
 */
export interface StudentSimulationItem {
  activityId: string;
  title: string;
  subtype: string | null;
  score: number;
  timeSpentSeconds: number;
  answeredAt: string | null;
  correct: number;
  incorrect: number;
  blank: number;
  totalQuestions: number;
  bestContent: StudentContentHitRate | null;
  worstContent: StudentContentHitRate | null;
}

/** Everything the student details modal shows, for one student and one cut. */
export interface StudentSimulationsData {
  student: {
    studentId: string;
    userInstitutionId: string;
    institutionId: string | null;
    name: string;
    school: string | null;
    schoolYear: string | null;
    class: string | null;
    /** 0-100, averaged over the listed simulados */
    average: number;
    performance: SimulatedPerformanceTag;
  };
  totals: {
    simulationsCount: number;
    totalTimeSeconds: number;
    correct: number;
    incorrect: number;
    blank: number;
  };
  bestContent: StudentContentHitRate | null;
  worstContent: StudentContentHitRate | null;
  simulations: StudentSimulationItem[];
}
