import type { EnemMomentEducationStage } from './types';

/**
 * Options of the "Série" picker — the teaching stages of the classes. The
 * first is the default: the regular 3rd year is who the exams are sent to.
 */
export const EDUCATION_STAGE_OPTIONS: ReadonlyArray<{
  value: EnemMomentEducationStage;
  label: string;
}> = [
  { value: 'REGULAR', label: '3ª série regular' },
  { value: 'EJA', label: 'EJA' },
  { value: 'SUBSEQUENTE', label: 'Subsequente' },
];

export const DEFAULT_EDUCATION_STAGE: EnemMomentEducationStage = 'REGULAR';

/**
 * Options of the "Tempo de prova" picker: each the minute its 30-minute range
 * ends at — the backend's `timeBuckets`. Separate ranges, not "up to": the
 * labels say both ends so nobody reads "1h" as "até 1h".
 */
export const EXAM_DURATION_OPTIONS: ReadonlyArray<{
  value: number;
  label: string;
}> = [
  { value: 30, label: 'Até 30 min' },
  { value: 60, label: '30 min a 1h' },
  { value: 90, label: '1h a 1h 30min' },
  { value: 120, label: '1h 30min a 2h' },
  { value: 150, label: '2h a 2h 30min' },
  { value: 180, label: '2h 30min a 3h' },
  { value: 210, label: '3h a 3h 30min' },
];

/**
 * Color of each moment in the charts, by position: Momento 1 light blue,
 * Momento 2 orange, as in the Figma. Cycles past the fourth.
 */
export const MOMENT_COLORS = [
  'var(--color-info-300)',
  'var(--color-warning-300)',
  'var(--color-success-300)',
  'var(--color-error-300)',
] as const;

/** "Detalhes por dia" rows shown before "Mostrar todos os dias". */
export const COLLAPSED_DAY_ROWS = 6;
