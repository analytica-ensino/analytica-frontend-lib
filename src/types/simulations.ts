import type { TrueFalseEnum } from '../enums/Quiz';
/**
 * Types for the teacher-facing Simulations feature.
 * Mirror the backend responses served under /performance/simulations.
 */

export interface SimulationsStudentItem {
  studentId: string;
  userInstitutionId: string;
  name: string;
  class: string | null;
  simulationsCount: number;
  // Index signature required by TableProvider's generic constraint.
  [key: string]: unknown;
}

export interface SimulationsStudentsPage {
  data: SimulationsStudentItem[];
  page: number;
  limit: number;
  total: number;
}

export interface SimulationsStudentsResponse {
  message: string;
  data: { students: SimulationsStudentsPage };
}

export interface SimulationsStudentsFilters {
  page?: number;
  limit?: number;
  search?: string;
  classIds?: string[];
}

// ---------------------------------------------------------------------------

export interface StudentSimulationItem {
  id: string;
  title: string;
  correctCount: number;
  incorrectCount: number;
  blankCount: number;
  totalQuestions: number;
  createdAt: string | null;
}

export interface SimulationsListData {
  student: {
    userInstitutionId: string;
    name: string;
    simulationsAnswered: number;
  };
  simulations: {
    data: StudentSimulationItem[];
    page: number;
    limit: number;
    total: number;
  };
}

export interface SimulationsListResponse {
  message: string;
  data: SimulationsListData;
}

export interface SimulationsListFilters {
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------

export type SimulationQuestionStatus =
  | 'CORRECT'
  | 'INCORRECT'
  | 'BLANK'
  /** Answered essay nobody graded yet — not the same thing as unanswered. */
  | 'PENDING';

export interface SimulationDetailOption {
  id: string;
  option: string;
  isCorrect: boolean;
  isSelected: boolean;
  /**
   * VERDADEIRO_FALSO only: what the student marked on this statement. Those
   * questions never write `option_id`, so `isSelected` is always false for them
   * and this is the only field carrying the answer. Null on other types and on
   * statements left blank.
   */
  selectedValue: TrueFalseEnum | null;
}

export interface SimulationDetailQuestion {
  questionId: string;
  statement: string;
  /** Decides how the answer is rendered: alternatives vs. the written text. */
  questionType: string;
  status: SimulationQuestionStatus;
  selectedOptionId: string | null;
  /**
   * The raw `answer` column. Free text for essay questions; for the other types
   * it holds encoded data already decoded into the fields below, which clients
   * should read instead of parsing this.
   */
  answer: string | null;
  /** IMAGEM only: URL of the image the student had to click on. */
  additionalContent: string | null;
  /** IMAGEM only: where the student clicked, in image percentage points. */
  imageAnswer: { coordinateX: number; coordinateY: number } | null;
  /** IMAGEM only: the answer key point, in image percentage points. */
  correctPoint: { x: number; y: number } | null;
  /**
   * IMAGEM only: radius within which a click counts as correct, in the same
   * percentage space. Sent so the drawn circle matches the grade.
   */
  imageTolerance: number | null;
  options: SimulationDetailOption[];
  /**
   * Teacher's comment on this specific question, shown to the student in their
   * result review. Distinct from the simulation-wide note in `NoteData`.
   */
  teacherComment: string | null;
}

export interface SimulationDetailData {
  simulationId: string;
  title: string;
  counts: {
    correct: number;
    incorrect: number;
    blank: number;
    pending: number;
  };
  questions: SimulationDetailQuestion[];
}

export interface SimulationDetailResponse {
  message: string;
  data: SimulationDetailData;
}

// ---------------------------------------------------------------------------

export interface NoteData {
  id: string;
  activityId: string;
  studentUserInstitutionId: string;
  note: string;
  updatedAt: string;
}

export interface NoteResponse {
  message: string;
  data: NoteData | null;
}

/** Teacher comment saved on one question of a student's simulation */
export interface QuestionCommentData {
  questionId: string;
  teacherComment: string | null;
}

export interface QuestionCommentResponse {
  message: string;
  data: QuestionCommentData | null;
}
