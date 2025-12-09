import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

/**
 * Question interface
 */
export interface Question {
  id: string;
  statement: string;
  questionType: QUESTION_TYPE;
  [key: string]: unknown;
}

/**
 * Pagination interface
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Questions filter body interface
 */
export interface QuestionsFilterBody {
  types?: QUESTION_TYPE[];
  bankIds?: string[];
  yearIds?: string[];
  knowledgeIds?: string[];
  topicIds?: string[];
  subtopicIds?: string[];
  contentIds?: string[];
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

/**
 * Questions list response interface
 */
export interface QuestionsListResponse {
  message: string;
  data: {
    questions: Question[];
    pagination: Pagination;
  };
}
