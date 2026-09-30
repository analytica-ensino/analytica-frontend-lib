import type { SimulatedPerformanceTag } from '../SimulatedStudentSimulationsModal/types';

/**
 * Types of the "Simulados Momento ENEM" report — the gestor's (Gestor NRE,
 * Gestor Geral, Gestor de Unidade) and the professor's.
 *
 * The response shapes mirror the backend's `/enem-moment-report` endpoints
 * (backend-monolito `src/schemas/enemMomentReport/response.schema.ts`); the
 * few types that are the screen's own say so.
 */

/**
 * What a section of the report is handed: the apps fetch, the sections draw.
 * `data` is `null` until the first answer.
 */
export interface EnemMomentSectionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * An exam by the name the report gives it — "Momento N", N its position in
 * the report's list of exams.
 */
export interface EnemMomentMoment {
  examId: string;
  label: string;
}

/** Students who took the exams of a cut and who did not. */
export interface EnemMomentParticipation {
  participated: number;
  notParticipated: number;
}

/**
 * "Série" of the header: the teaching stage of the classes. Absent from a
 * request means every stage.
 */
export type EnemMomentEducationStage = 'REGULAR' | 'EJA' | 'SUBSEQUENTE';

/**
 * "Desempenho" of a student, a class or a school: the lib's simulado band of
 * its average score (HIGHLIGHT ≥ 9 · ABOVE_AVERAGE ≥ 7 · BELOW_AVERAGE ≥ 4 ·
 * ATTENTION_POINT < 4), or `NO_EXAM` — nobody took the exam, which is the
 * absence of a score, not the worst band.
 */
export type EnemMomentPerformance = SimulatedPerformanceTag | 'NO_EXAM';

/**
 * Body shared by every endpoint of the report. Nothing is required: `{}` is
 * the "Geral" tab with no header picks.
 */
export interface EnemMomentRequest {
  /** The exam of a Momento tab; absent on "Geral" — every exam of the flag. */
  examIds?: string[];
  educationStage?: EnemMomentEducationStage;
  /**
   * "Tempo de prova" picks, each the minute its 30-minute range ends at
   * (30 … 210). Independent ranges: `[60]` is "finished between 30min and
   * 1h". Absent means every time.
   */
  timeBuckets?: number[];
  /** NREs — narrows inside what the token allows. */
  schoolGroupIds?: string[];
  /** A school's page: the cut of that one school. */
  schoolIds?: string[];
  /** Narrows to these classes — a table's Turma filter. */
  classIds?: string[];
  /**
   * Narrows to one municipality, spelled as `/filter-options` lists it (the
   * map's names are canonicalised and would match no school).
   */
  cityName?: string;
}

/** The picks the cut is made of — the screen's own shape. */
export interface EnemMomentFilters {
  /** The exam of the active tab; `null` on "Geral", the sum of all of them. */
  examId: string | null;
  educationStage: EnemMomentEducationStage;
  /** "Tempo de prova" picks, in minutes. Empty means every time. */
  durations: number[];
}

/** Pagination of the two tables. */
export interface EnemMomentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * The four cards and the "Realizado em" window.
 *
 * `POST /enem-moment-report/summary`. The two participation rates are not
 * derived from each other: the cards count schools, the map students.
 */
/** One exam of the report, as `/summary` describes it. */
export interface EnemMomentSummaryExam {
  examId: string;
  /** What "Respostas" is fetched by. */
  activityId: string;
  title: string;
  /** Day 1 of the ENEM — the one with a foreign language to pick. */
  languageChoice: boolean;
  durationMinutes: number;
  /** 0–10, scoped by the request; `null` while nobody took it. */
  averageScore: number | null;
}

export interface EnemMomentSummary {
  /**
   * The exams of the request's `examIds` (all of the flag's without it), in
   * the order of the flag. Not narrowed by the other picks.
   */
  exams: EnemMomentSummaryExam[];
  /** Exams this reading covers. */
  examsCount: number;
  /** Of those, how many somebody already took. */
  examsWithParticipation: number;
  totalSchools: number;
  municipalitiesCount: number;
  /**
   * Classes the population of the cut occupies — the "N turmas" of the unit
   * report's first card. Scoped like `totalStudents`.
   */
  totalClasses: number;
  /** The enrolment: the denominator of everything. */
  totalStudents: number;
  schoolsWithParticipation: number;
  schoolsWithoutParticipation: number;
  /** 0–100, one decimal; `null` without schools. */
  schoolParticipationPercentage: number | null;
  participatingStudents: number;
  studentsWithoutParticipation: number;
  /** 0–100, one decimal; `null` without students. */
  studentParticipationPercentage: number | null;
  /** Exams submitted — two moments taken count two. */
  totalParticipations: number;
  /** 0–10; `null` while nobody took the exam. */
  averageScore: number | null;
  /** ISO; `null` while nobody took the exam. */
  firstAnsweredAt: string | null;
  lastAnsweredAt: string | null;
}

/** Students of one "Desempenho" tier. */
export interface EnemMomentPerformanceBand {
  tag: EnemMomentPerformance;
  count: number;
}

/** One band of a score histogram: "0 a 2" … "8 a 10". */
export interface EnemMomentScoreBand {
  label: string;
  count: number;
}

/**
 * The "Dados do simulado" block.
 *
 * `POST /enem-moment-report/exam-data`. Who took no exam is in no band, so the
 * bars add up to the participants, not to the enrolment.
 */
export interface EnemMomentExamData {
  studentScoreBands: EnemMomentScoreBand[];
  schoolScoreBands: EnemMomentScoreBand[];
  /** Students per foreign language picked; a day 2 has no choice. */
  language: { ingles: number; espanhol: number; withoutChoice: number };
  time: {
    averageTotalSeconds: number | null;
    /** Total time over questions answered. */
    averageSecondsPerQuestion: number | null;
    /** The exam's time limit — on "Geral", the longest of them. */
    durationSeconds: number | null;
  };
  /**
   * Students of the cut per "Desempenho" tier, in the legend's order, who
   * took nothing under `NO_EXAM` — the pie of the unit report ("Desempenho
   * por quantidade de estudante"). Cut at 4/7/9, not at the score bands'
   * 2/4/6/8: neither distribution sums into the other.
   */
  studentPerformanceBands: EnemMomentPerformanceBand[];
  /**
   * Students who started and have no score yet: in no tier, so while this is
   * above zero the tiers fall short of the enrolment by this much.
   */
  studentsWithoutScore: number;
}

/** One day with submissions, in Brasília time. */
export interface EnemMomentDay {
  /** `YYYY-MM-DD`. */
  day: string;
  /** Exams submitted that day, one entry per exam of the cut. */
  byExam: Array<{ examId: string; participations: number }>;
  participations: number;
  accumulatedParticipations: number;
  /** 0–10, of every exam submitted up to that day. */
  accumulatedAverageScore: number | null;
}

/**
 * The "Evolução por dia" block: days without submissions do not come.
 *
 * `POST /enem-moment-report/daily`.
 */
export interface EnemMomentDailyEvolution {
  days: EnemMomentDay[];
}

/** Answers to a set of questions; `answered` counts the blank ones too. */
export interface EnemMomentAnswerCounts {
  answered: number;
  correct: number;
  incorrect: number;
  blank: number;
}

/** Answers to one componente curricular's questions. */
export interface EnemMomentSubjectPerformance extends EnemMomentAnswerCounts {
  subjectId: string;
  subjectName: string;
  areaKnowledgeId: string;
  areaKnowledgeName: string;
  /** 0–100, one decimal, over `answered`; `null` when there is none. */
  correctPercentage: number | null;
}

/**
 * The "Desempenho por área de conhecimento" block.
 *
 * `POST /enem-moment-report/questions`. A question mapped to two subjects
 * counts in both rows and once in the totals: the rows do not add up to them.
 */
export interface EnemMomentQuestionsPerformance {
  totals: EnemMomentAnswerCounts & {
    correctPercentage: number | null;
    incorrectPercentage: number | null;
    blankPercentage: number | null;
    /**
     * 0–10, derived from the hit rate — not the corrected score of
     * `/summary`. The one to show beside these counts, like the areas'.
     */
    averageScore: number | null;
  };
  /**
   * One row per area of knowledge, counted on its own: a question in two
   * subjects of one area counts once here, so this is not the sum of the
   * area's subjects.
   */
  areas: EnemMomentAreaPerformance[];
  /** Worst hit rate first. */
  subjects: EnemMomentSubjectPerformance[];
}

/** Answers to one area of knowledge's questions. */
export interface EnemMomentAreaPerformance extends EnemMomentAnswerCounts {
  areaKnowledgeId: string;
  areaKnowledgeName: string;
  correctPercentage: number | null;
  /** 0–10, derived from the hit rate. */
  averageScore: number | null;
}

/**
 * A subject as the table draws it: the block's row plus the chip's color and
 * icon, which come from `GET /knowledge/subjects` — the screen's own shape.
 */
export type EnemMomentSubjectRow = EnemMomentSubjectPerformance & {
  color: string;
  icon: string;
};

/** The questions block with its subjects ready to draw. */
export interface EnemMomentQuestionsView {
  totals: EnemMomentQuestionsPerformance['totals'];
  areas: EnemMomentAreaPerformance[];
  subjects: EnemMomentSubjectRow[];
}

/**
 * A student of the cut — a row of "Desempenho por estudante", and of the
 * ranking behind "Estudantes em destaque".
 *
 * Who took nothing is listed too, with `performance: 'NO_EXAM'` and `null`
 * scores and times. A type, not an interface: the table's rows must fit
 * `Record<string, unknown>`.
 */
export type EnemMomentStudentRow = {
  userInstitutionId: string;
  studentName: string;
  classId: string | null;
  className: string | null;
  schoolId: string;
  schoolName: string;
  city: string;
  /** Moments taken. */
  participatedExams: number;
  /** Took some of the moments already run, not all — "somente 1 momento". */
  partialParticipation: boolean;
  totalElapsedSeconds: number | null;
  answered: number;
  correct: number;
  incorrect: number;
  blank: number;
  /** 0–100, one decimal. */
  hitRate: number | null;
  /** 0–10. */
  averageScore: number | null;
  /** `null`: started, with no score yet — in no tier, shown as "—". */
  performance: EnemMomentPerformance | null;
};

/** Columns the students list orders by. */
export type EnemMomentStudentsOrderBy =
  | 'name'
  | 'averageScore'
  | 'totalElapsedSeconds'
  | 'correct'
  | 'incorrect'
  | 'blank'
  | 'hitRate';

/** Whether a student took any exam of the cut — the Participação filter. */
export type EnemMomentParticipationFilter = 'PARTICIPATED' | 'NOT_PARTICIPATED';

/**
 * The students list's request: the cut plus page, search, order and the
 * Participação filter. Without `orderBy`, by name.
 */
export interface EnemMomentStudentsQuery extends EnemMomentRequest {
  page: number;
  /** At most 100. */
  limit: number;
  /** Matches the student's name. */
  search?: string;
  participation?: EnemMomentParticipationFilter;
  /**
   * Narrows to these "Desempenho" tiers — the column's filter. `NO_EXAM` is
   * who took nothing, the same rows as `participation: NOT_PARTICIPATED`.
   */
  performances?: EnemMomentPerformance[];
  orderBy?: EnemMomentStudentsOrderBy;
  /** Nulls go last either way. */
  order?: 'asc' | 'desc';
}

/** `POST /enem-moment-report/students`. */
export interface EnemMomentStudentsPage {
  examsCount: number;
  students: EnemMomentStudentRow[];
  pagination: EnemMomentPagination;
}

/**
 * One school — a row of "Participação e desempenho por escola". The school
 * years the exam admits still decide who counts, but are no column.
 * A type, not an interface: the table's rows must fit `Record<string, unknown>`.
 */
export type EnemMomentSchoolRow = {
  schoolId: string;
  schoolName: string;
  city: string;
  totalStudents: number;
  participatingStudents: number;
  /** 0–100, one decimal: the school's students who took the exam. */
  participationPercentage: number;
  averageElapsedSeconds: number | null;
  scoreSum: number | null;
  scoreCount: number;
  averageScore: number | null;
  /** `null`: nobody of the school has a score yet. */
  performance: EnemMomentPerformance | null;
};

/** Columns the schools table orders by. */
export type EnemMomentSchoolsOrderBy =
  | 'schoolName'
  | 'averageScore'
  | 'participationPercentage';

/**
 * The schools table's request: the cut plus page, search, order and the
 * Desempenho filter. Without `orderBy`, by school name.
 */
export interface EnemMomentSchoolsQuery extends EnemMomentRequest {
  page: number;
  /** At most 100. */
  limit: number;
  /** Matches the school's name. */
  search?: string;
  performances?: EnemMomentPerformance[];
  orderBy?: EnemMomentSchoolsOrderBy;
  order?: 'asc' | 'desc';
}

/**
 * What the tables' filters offer: the municipalities and classes of the cut.
 *
 * `POST /enem-moment-report/filter-options`.
 */
export interface EnemMomentFilterOptions {
  /** Spelled as `cityName` compares them. */
  cities: string[];
  classes: Array<{
    classId: string;
    className: string | null;
    schoolYearName: string | null;
  }>;
}

/** `POST /enem-moment-report/schools`. */
export interface EnemMomentSchoolsPage {
  schools: EnemMomentSchoolRow[];
  pagination: EnemMomentPagination;
}

/**
 * One moment as the student took it — or did not: then all `null`. Whether
 * they took it is `participated`, never the length of the list.
 */
export interface EnemMomentStudentMoment {
  examId: string;
  examTitle: string;
  participated: boolean;
  /**
   * The exam's activity — what "Respostas" is fetched by, from
   * `GET /performance/simulations/students/:userInstitutionId/:activityId`
   * (typed by the lib's `SimulationDetailData`).
   */
  activityId: string;
  /** `INGLES` / `ESPANHOL`; `null` on a day 2 or when not taken. */
  language: string | null;
  answeredAt: string | null;
  elapsedSeconds: number | null;
  /** 0–10. */
  score: number | null;
}

/** The subtema a student did best or worst in. */
export interface EnemMomentSubtopicHighlight {
  subtopicId: string;
  subtopicName: string;
  answered: number;
  correct: number;
  hitRate: number;
}

/**
 * One student's modal, for the cut of the page it opened from.
 *
 * `POST /enem-moment-report/students/:userInstitutionId`, body
 * {@link EnemMomentRequest}. `momentos` has one item per exam of the cut,
 * taken or not, in the order of the flag.
 */
export interface EnemMomentStudentReport {
  student: {
    userInstitutionId: string;
    studentName: string;
    schoolId: string;
    schoolName: string;
    city: string;
    className: string | null;
    schoolYearName: string | null;
  };
  momentos: EnemMomentStudentMoment[];
  /** The moments taken, added up. */
  totalElapsedSeconds: number | null;
  averageSecondsPerQuestion: number | null;
  answered: number;
  correct: number;
  incorrect: number;
  blank: number;
  hitRate: number | null;
  /** 0–10: the average of the moments taken. */
  finalScore: number | null;
  /** The header's badge; `null` while the student has no score. */
  performance: EnemMomentPerformance | null;
  bestSubtopic: EnemMomentSubtopicHighlight | null;
  worstSubtopic: EnemMomentSubtopicHighlight | null;
}

/**
 * "Dados gerais" of a school's page — the screen's own shape, put together
 * from the school's summary and questions (see `useEnemMomentOverview`).
 */
export interface EnemMomentOverview {
  /** 0–10; `null` while nobody took the exam. */
  averageScore: number | null;
  /** On "Geral", each exam's average (0–10 or `null`); empty on a tab. */
  examScores: Array<{ examId: string; averageScore: number | null }>;
  correct: number;
  incorrect: number;
  blank: number;
  participation: EnemMomentParticipation;
}

/**
 * Where a student stands on one exam, for the download of the students table:
 * handed in with every question answered, opened and left with blanks (or not
 * handed in), or never opened.
 */
export type EnemMomentExamStatus = 'DONE' | 'PARTIAL' | 'NOT_DONE';

/**
 * The students table, whole, for its download.
 *
 * `GET /enem-moment-report/students/export`: every student in the caller's
 * scope — a teacher's classes, a unit manager's schools — whatever the screen
 * is filtering. `exams` are the exams of the flag, in its order; each student
 * carries one status per exam.
 */
export interface EnemMomentStudentsExport {
  exams: Array<{ examId: string; title: string }>;
  students: Array<{
    userInstitutionId: string;
    studentName: string;
    email: string;
    className: string | null;
    moments: Array<{ examId: string; status: EnemMomentExamStatus }>;
  }>;
}
