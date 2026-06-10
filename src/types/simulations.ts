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

export type SimulationQuestionStatus = 'CORRECT' | 'INCORRECT' | 'BLANK';

export interface SimulationDetailOption {
  id: string;
  option: string;
  isCorrect: boolean;
  isSelected: boolean;
}

export interface SimulationDetailQuestion {
  questionId: string;
  statement: string;
  status: SimulationQuestionStatus;
  selectedOptionId: string | null;
  options: SimulationDetailOption[];
}

export interface SimulationDetailData {
  simulationId: string;
  title: string;
  counts: { correct: number; incorrect: number; blank: number };
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
