/**
 * Types for the lessons catalogue: the knowledge-matrix driven navigation of
 * subjects -> topics/subtopics -> lessons, plus the lesson page itself.
 *
 * Shared by the student portal (which tracks progress) and the teacher/manager
 * portals (which only preview the content). Anything that only exists for a
 * student is optional here, because the backend omits it for the other
 * profiles — `GET /knowledge` has an explicit branch that returns the matrix
 * without any progress for teachers and managers.
 *
 * Note: `src/types/lessons.ts` holds the *lesson bank* types used by the
 * recommended-lesson builder. These are a different view of the same domain
 * and intentionally kept apart.
 */

/**
 * Which audience the catalogue is rendered for.
 *
 * - `student`: progress bars, progress tracking, telemetry, resume position.
 * - `preview`: read-only browsing. No progress is shown, recorded or resumed.
 */
export type LessonsMode = 'student' | 'preview';

/** Generic `{ message, data }` envelope used by the knowledge endpoints. */
export interface LessonsApiResponse<T> {
  message: string;
  data: T;
}

/* -------------------------------------------------------------------------- */
/* Catalogue: subjects                                                        */
/* -------------------------------------------------------------------------- */

/** A curricular component as it appears in the trail. */
export interface TrailSubject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

/** Aggregated lesson progress of a subject, for students only. */
export interface SubjectProgress {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

/**
 * Subject as returned by `GET /knowledge`.
 *
 * `progress` is absent for teachers and managers — the backend skips the
 * progress calculation for them — so it must never be dereferenced without a
 * guard.
 */
export interface SubjectWithProgress extends TrailSubject {
  progress?: SubjectProgress;
}

/** Knowledge area grouping a set of subjects. */
export interface KnowledgeArea {
  id: string;
  name: string;
  subjects: SubjectWithProgress[];
}

/* -------------------------------------------------------------------------- */
/* Catalogue: topics and subtopics                                            */
/* -------------------------------------------------------------------------- */

/**
 * A subtopic, flattened for display. Despite the name, this is what the UI
 * calls a "tema" and what the lesson routes carry as `:topicId`.
 */
export interface Topic {
  id: string;
  name: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

/** A topic grouping subtopics (e.g. "Cinemática"). */
export interface TopicCategory {
  id: string;
  name: string;
  topics: Topic[];
}

/** View model of the topics screen. */
export interface ClassTopicsData {
  subjectId: string;
  subjectName: string;
  subjectIcon?: string;
  subjectColor?: string;
  categories: TopicCategory[];
}

export interface ApiLesson {
  lessonId: string;
  contentId: string;
  contentName: string;
  isCompleted: boolean;
}

export interface ApiSubtopic {
  id: string;
  name: string;
  /** Always 0 for profiles that do not accumulate progress. */
  finishedLessons: number;
  totalLessons: number;
  lessons: ApiLesson[];
}

export interface ApiTopic {
  id: string;
  name: string;
  subtopics: ApiSubtopic[];
}

export interface ApiSubject {
  id: string;
  name: string;
  color: string;
  icon: string;
  topics: ApiTopic[];
}

/** Response of `GET /knowledge/by-subject/:subjectId`. */
export type TopicsApiResponse = LessonsApiResponse<ApiSubject[]>;

/* -------------------------------------------------------------------------- */
/* Lesson page                                                                */
/* -------------------------------------------------------------------------- */

export interface Podcast {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  description?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questionsCount: number;
  completed: boolean;
  score?: number;
}

export interface BoardImage {
  id: string;
  imageUrl: string;
  title?: string;
  order: number;
}

export interface QuestionnaireWithStatistics {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  notification: string | null;
  status: string;
  startDate: string | null;
  finalDate: string | null;
  canRetry: boolean;
  updatedAt: string;
  createdAt: string;
  statistics: {
    totalAnswered: number;
    correctAnswers: number;
    incorrectAnswers: number;
    pendingAnswers: number;
    score: number;
  };
}

/** A student's progress on one lesson. */
export interface LessonProgress {
  lessonId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
  lastWatchedAt?: string;
  completedAt?: string;
  progressPercentage: number;
}

/** A lesson with everything the lesson page renders. */
export interface LessonDetails {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  videoDuration: number;
  thumbnailUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  contentId: string;
  bnccCode?: string;
  podcast?: Podcast;
  quiz?: Quiz;
  questionnaire: QuestionnaireWithStatistics | null;
  boardImages: BoardImage[];
  /** Absent in preview mode, where no progress is fetched or displayed. */
  progress?: LessonProgress;
  subtitleUrl?: string;
  urlDoc?: string;
  urlInitialFrame?: string;
  urlFinalFrame?: string;
  urlPodCast?: string;
}

/** Progress row as returned by the API. */
export interface ApiLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  progress: number;
  video: boolean;
  audio: boolean;
  initialFrame: boolean;
  finalFrame: boolean;
  lessonDoc: boolean;
  coin: number | null;
  scoreCoin: number | null;
  timeSpent: number;
  lastInteraction: string | null;
  contentDownloaded: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Raw lesson as returned by `GET /lesson/by-subtopic/:id` and `GET /lesson/:id`. */
export interface ApiLessonData {
  id: string;
  areaKnowledgeId: string;
  subjectId: string;
  topicId: string;
  subtopicId: string;
  contentId: string;
  urlVideo: string;
  urlPodCast: string;
  urlCover: string;
  urlInitialFrame: string;
  urlFinalFrame: string;
  urlDoc: string;
  urlSubtitle: string;
  videoTitle: string;
  podCastTitle: string;
  createdAt: string;
  updatedAt: string;
  /** Omitted for profiles without progress; never dereference unguarded. */
  progress?: ApiLessonProgress;
  questionnaire: QuestionnaireWithStatistics | null;
  areaKnowledge: { id: string; name: string };
  subject: { id: string; name: string; color: string; icon: string };
  topic: { id: string; name: string };
  subtopic: { id: string; name: string };
  content: { id: string; name: string; bnccCode: string };
}

/** Response of `GET /lesson/by-subtopic/:subtopicId`. */
export type LessonsBySubtopicResponse = LessonsApiResponse<ApiLessonData[]>;

/** Response of `PATCH /lesson/:lessonId/progress`. */
export interface UpdateProgressResponse {
  success: boolean;
  data: {
    lessonId: string;
    progress: number;
    completed: boolean;
    message: string;
  };
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

/** A single lesson hit from `GET /knowledge/search`. */
export interface LessonSearchResultItem {
  lessonId: string;
  videoTitle: string;
  areaKnowledge: { id: string; name: string };
  subject: { id: string; name: string; color: string; icon: string };
  topic: { id: string; name: string };
  subtopic: { id: string; name: string };
  content: { id: string; name: string; bnccCode: string | null };
}

export interface LessonSearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LessonSearchData {
  lessons: LessonSearchResultItem[];
  pagination: LessonSearchPagination;
}

export type LessonSearchResponse = LessonsApiResponse<LessonSearchData>;

export interface LessonSearchQuery {
  query: string;
  subjectId?: string;
  page?: number;
  limit?: number;
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Paths the catalogue navigates to. Injected by each app because the portals
 * mount the catalogue under different roots.
 *
 * `subtopicId` is what the lesson route carries as its `:topicId` segment —
 * the naming is historical and the backend reads it as a subtopic id.
 */
export interface LessonsCatalogRoutes {
  /** Catalogue root, e.g. `/aulas`. */
  root: string;
  /** Topics of a subject. */
  topics: (subjectId: string) => string;
  /** Lessons of a subtopic. */
  lessons: (subjectId: string, subtopicId: string) => string;
}

/** Navigation state carried between catalogue screens. */
export interface LessonsCatalogNavigationState {
  subjectName?: string;
  subjectIcon?: string;
  subjectColor?: string;
  topicName?: string;
  selectedLessonId?: string;
  selectedContentId?: string;
}
