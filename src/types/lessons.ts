/**
 * Basic lesson data structure for the lesson bank
 */
export interface Lesson {
  id: string;
  title: string;
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

