/**
 * In-classroom ENEM simulation ("Simulação do ENEM em sala de aula").
 *
 * Shapes of the student-facing API (`/enem-classroom/*`), shared by the
 * student web app and the backoffice so both read the same vocabulary.
 */

/**
 * Foreign language the student sits the exam in. Picks which of the two
 * language blocks of the exam the student receives.
 */
export const ENEM_CLASSROOM_LANGUAGE = {
  INGLES: 'INGLES',
  ESPANHOL: 'ESPANHOL',
} as const;

export type EnemClassroomLanguage =
  (typeof ENEM_CLASSROOM_LANGUAGE)[keyof typeof ENEM_CLASSROOM_LANGUAGE];

/** Human labels for each language, in the order the student sees them. */
export const ENEM_CLASSROOM_LANGUAGE_LABELS: Record<
  EnemClassroomLanguage,
  string
> = {
  INGLES: 'Inglês',
  ESPANHOL: 'Espanhol',
};

/** Where the student stands in the exam. FINISHED is final. */
export const ENEM_CLASSROOM_PARTICIPATION_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
} as const;

export type EnemClassroomParticipationStatus =
  (typeof ENEM_CLASSROOM_PARTICIPATION_STATUS)[keyof typeof ENEM_CLASSROOM_PARTICIPATION_STATUS];

/**
 * One socio-economic question asked before the exam starts. Free text with a
 * "skip" option — every field is written by the backoffice.
 */
export interface EnemClassroomSurveyQuestion {
  id: string;
  position: number;
  /** Short name of the step in the stepper ("Curso"). */
  stepLabel: string;
  /** The question itself ("Você já tem o curso que quer fazer em mente?"). */
  prompt: string;
  /** Label of the option that opens the text field ("Se sim, escreva o seu curso"). */
  inputLabel: string;
  /** Placeholder of the text field ("Escreva o curso"). */
  inputPlaceholder: string;
  /** Label of the option that skips the question ("Não, ainda estou pensando"). */
  skipLabel: string;
}

/** The exam as the student sees it before starting. */
export interface EnemClassroomExam {
  id: string;
  title: string;
  /** Introduction video shown on the first step; null when there is none. */
  videoUrl: string | null;
  /** How long the student has once they start. */
  durationMinutes: number;
  /**
   * Whether the student picks English or Spanish before starting (ENEM's
   * day 1). Off, the exam has no foreign-language block and the choice step
   * is not shown (day 2).
   */
  languageChoice: boolean;
  /** The texts of the panel card and of the start modal, as the backoffice wrote them. */
  studentTexts: EnemClassroomStudentTexts;
  surveyQuestions: EnemClassroomSurveyQuestion[];
}

/**
 * Every text the student sees around the exam — the panel card and the
 * introduction step of the start modal. The backoffice rewrites them per
 * exam; the API always sends the full set.
 */
export interface EnemClassroomStudentTexts {
  /** The card's first line. */
  bannerTitle: string;
  /** The card's second line; empty hides it. */
  bannerSubtitle: string;
  /** The card's body line. */
  bannerText: string;
  /** Bullet list under the body; empty hides it. */
  bannerItems: string[];
  /** The call to action on the card's right. */
  bannerCta: string;
  /** Above the introduction video; only shown when the exam has one. */
  introVideoText: string;
  /** The heading over the warnings of the introduction step. */
  introHeading: string;
  /** The first warning's title (the other two are fixed). */
  introWarningTitle: string;
  /** The first warning's description. */
  introWarningText: string;
}

/** The texts the API sends unless the backoffice wrote others; stories and tests start from here. */
export const ENEM_CLASSROOM_DEFAULT_STUDENT_TEXTS: EnemClassroomStudentTexts = {
  bannerTitle: 'Simulação do ENEM em sala de aula!',
  bannerSubtitle: '',
  bannerText: 'Sua prova está liberada.',
  bannerItems: [],
  bannerCta: 'Toque para começar.',
  introVideoText: 'Assista às orientações.',
  introHeading: 'Ei, lê isso antes de começar!',
  introWarningTitle: 'Só vale em sala de aula',
  introWarningText:
    'Essa simulação precisa ser feita com seu professor presente. Não vale fazer em casa!',
};

/** A survey answer; `null` means the student skipped the question. */
export interface EnemClassroomSurveyAnswer {
  questionId: string;
  answer: string | null;
}

/** The student's own record of the exam. */
export interface EnemClassroomParticipation {
  status: EnemClassroomParticipationStatus;
  language: EnemClassroomLanguage | null;
  /** ISO 8601 */
  startedAt: string | null;
  /** ISO 8601. `startedAt + durationMinutes`; the exam is submitted at this point. */
  deadlineAt: string | null;
  /** The shared activity behind the exam — what drafts and answers address. */
  activityId: string;
  surveyAnswers: EnemClassroomSurveyAnswer[];
}

/** `GET /enem-classroom/current` */
export interface EnemClassroomCurrentResponse {
  message: string;
  data: {
    /** Null when the institution has no active exam. */
    exam: EnemClassroomExam | null;
    /** Null until the student starts. */
    participation: EnemClassroomParticipation | null;
  };
}

/** `POST /enem-classroom/exams/:id/start` body */
export interface EnemClassroomStartPayload {
  /** Null when the exam offers no language choice. */
  language: EnemClassroomLanguage | null;
  surveyAnswers: EnemClassroomSurveyAnswer[];
}

/** `POST /enem-classroom/exams/:id/start` response */
export interface EnemClassroomStartResponse {
  message: string;
  data: {
    activityId: string;
    startedAt: string;
    deadlineAt: string;
  };
}
