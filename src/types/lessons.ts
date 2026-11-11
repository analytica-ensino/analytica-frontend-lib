/**
 * Basic lesson data structure for the lesson bank
 */
export interface Lesson {
  id: string;
  title?: string; // Kept for backwards compatibility
  areaKnowledgeId?: string;
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  contentId?: string;
  /** The lesson's MP4. Always kept: download, offline and the HLS fallback use it. */
  urlVideo?: string;
  /** HLS master (`master.m3u8`) of the video, or null while not converted. */
  urlVideoHls?: string | null;
  urlPodCast?: string;
  urlCover?: string;
  urlInitialFrame?: string;
  urlFinalFrame?: string;
  urlDoc?: string;
  urlSubtitle?: string;
  videoTitle?: string;
  podCastTitle?: string;
  createdAt?: string;
  updatedAt?: string;
  areaKnowledge?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  subtopic?: {
    id: string;
    name: string;
  };
  content?: {
    id: string;
    name: string;
    bnccCode?: string;
  };
  [key: string]: unknown;
}

/**
 * Pagination data for lessons list
 */
export interface LessonsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * API response for lessons list
 */
export interface LessonsListResponse {
  message: string;
  data: {
    lessons: Lesson[];
    pagination: LessonsPagination;
  };
}
