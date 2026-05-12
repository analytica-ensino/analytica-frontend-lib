import type { FilterConfig } from '../components/Filter/useTableFilter';
import type { ExamFilterOption } from '../types/examsHistory';

/**
 * Exam status options for filters
 * Used in exam history page - manually set by professor
 */
export const EXAM_STATUS_OPTIONS: ExamFilterOption[] = [
  { id: 'AGENDADA', name: 'Agendada' },
  { id: 'EM_ANDAMENTO', name: 'Em andamento' },
  { id: 'FINALIZADA', name: 'Finalizada' },
  { id: 'CANCELADA', name: 'Cancelada' },
];

/**
 * Filter category keys for exams
 */
export enum EXAM_FILTER_CATEGORY {
  SCHOOL = 'school',
  SCHOOL_YEAR = 'schoolYear',
  CLASS = 'class',
  SUBJECT = 'subject',
  STATUS = 'status',
}

/**
 * Filter group keys for exams
 */
export enum EXAM_FILTER_GROUP {
  ACADEMIC = 'academic',
  CONTENT = 'content',
  STATUS = 'status',
}

/**
 * Create filter configuration for exam drafts/models
 * Only subject filter (simpler than exams history)
 *
 * @param subjectOptions - Subject options for the filter
 * @returns Filter configuration array for drafts/models pages
 *
 * @example
 * ```tsx
 * const filterConfigs = createExamDraftsModelsFiltersConfig(subjectOptions);
 * ```
 */
export const createExamDraftsModelsFiltersConfig = (
  subjectOptions: ExamFilterOption[]
): FilterConfig[] => [
  {
    key: EXAM_FILTER_GROUP.CONTENT,
    label: 'CONTEUDO',
    categories: [
      {
        key: EXAM_FILTER_CATEGORY.SUBJECT,
        label: 'Materia',
        selectedIds: [],
        itens: subjectOptions,
      },
    ],
  },
];

/**
 * Create full filter configuration for exam history
 * Includes status, academic data, and content filters
 *
 * @param options - Filter options object with schools, classes, subjects, schoolYears
 * @returns Filter configuration array for exam history page
 *
 * @example
 * ```tsx
 * const filterConfigs = createExamHistoryFiltersConfig({
 *   schools: [...],
 *   classes: [...],
 *   subjects: [...],
 *   schoolYears: [...],
 * });
 * ```
 */
export const createExamHistoryFiltersConfig = (options: {
  schools?: ExamFilterOption[];
  classes?: ExamFilterOption[];
  subjects?: ExamFilterOption[];
  schoolYears?: ExamFilterOption[];
}): FilterConfig[] => [
  {
    key: EXAM_FILTER_GROUP.STATUS,
    label: 'STATUS',
    categories: [
      {
        key: EXAM_FILTER_CATEGORY.STATUS,
        label: 'Status da Prova',
        selectedIds: [],
        itens: EXAM_STATUS_OPTIONS,
      },
    ],
  },
  {
    key: EXAM_FILTER_GROUP.ACADEMIC,
    label: 'DADOS ACADEMICOS',
    categories: [
      {
        key: EXAM_FILTER_CATEGORY.SCHOOL,
        label: 'Escola',
        selectedIds: [],
        itens: options.schools ?? [],
      },
      {
        key: EXAM_FILTER_CATEGORY.SCHOOL_YEAR,
        label: 'Ano',
        selectedIds: [],
        itens: options.schoolYears ?? [],
      },
      {
        key: EXAM_FILTER_CATEGORY.CLASS,
        label: 'Turma',
        selectedIds: [],
        itens: options.classes ?? [],
      },
    ],
  },
  {
    key: EXAM_FILTER_GROUP.CONTENT,
    label: 'CONTEUDO',
    categories: [
      {
        key: EXAM_FILTER_CATEGORY.SUBJECT,
        label: 'Materia',
        selectedIds: [],
        itens: options.subjects ?? [],
      },
    ],
  },
];
