export interface AnswerSheetStudentData {
  student: { id: string; name: string };
  activity: { id?: string; title: string; totalQuestoes: number };
  qrCodeUrl: string;
  schoolClass?: string | null;
}

/**
 * Response of `GET /exams/:id/answer-sheets` — the answer sheet data of every
 * student in one call, used to print the whole exam package at once.
 */
export interface ExamAnswerSheetsResponse {
  message: string;
  data: {
    exam: { id: string; title: string; totalQuestions: number };
    students: Array<{
      student: { id: string; name: string };
      qrCodeUrl: string;
      schoolClass?: string | null;
    }>;
  };
}
