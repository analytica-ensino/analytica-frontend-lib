import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

/**
 * Question difficulty enumerations
 * Defines the difficulty levels for questions and activities
 */
export enum DIFFICULTY_LEVEL_ENUM {
  FACIL = 'FACIL',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFICIL',
}

/**
 * Question status enumerations
 * Defines the possible statuses for questions in the system
 */
export enum QUESTION_STATUS_ENUM {
  APROVADO = 'APROVADO',
  REVISAR = 'REVISAR',
  REPROVADO = 'REPROVADO',
  DESATIVADO = 'DESATIVADO',
  CATEGORIZACAO = 'CATEGORIZACAO',
  DADOS_AUSENTES = 'DADOS AUSENTES',
}

/**
 * Question interface
 */
export interface Question {
  id: string;
  statement: string;
  description: string | null;
  questionType: QUESTION_TYPE;
  status: QUESTION_STATUS_ENUM;
  difficultyLevel: DIFFICULTY_LEVEL_ENUM;
  questionBankYearId: string;
  questionBankYear?: QuestionBankYearActivity;
  solutionExplanation: string | null;
  createdAt: string;
  updatedAt: string;
  knowledgeMatrix?: KnowledgeMatrixItemActivity[];
  options?: QuestionOptionActivity[];
  createdBy?: string;
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
  questionType?: QUESTION_TYPE[];
  questionBankYearId?: string[];
  subjectId?: string[];
  topicId?: string[];
  subtopicId?: string[];
  contentId?: string[];
  page?: number;
  pageSize?: number;
  selectedQuestionsIds?: string[];
  randomQuestions?: number;
  /** Filter for questions without any subject association */
  noSubject?: boolean;
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

/**
 * Option interface for questions
 */
export interface QuestionOptionActivity {
  id: string;
  option: string;
  correct?: boolean;
}

/**
 * Knowledge Matrix Item interface
 */
export interface KnowledgeMatrixItemActivity {
  areaKnowledge?: {
    id: string;
    name: string;
  } | null;
  subject?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  topic?: {
    id: string;
    name: string;
  } | null;
  subtopic?: {
    id: string;
    name: string;
  } | null;
  content?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Question Bank Year interface
 */
export interface QuestionBankYearActivity {
  id: string;
  year: string;
  questionBank: {
    id: string;
    name: string;
  };
}

/**
 * Pagination interface for questions list (API schema)
 * Based on paginationSchema - uses 'hasPrev' instead of 'hasPrevious'
 */
export interface PaginationActivity {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Questions list API response interface
 * Based on questionsListResponseSchema
 */
export interface QuestionsListResponseActivity {
  message?: string;
  data: {
    questions: Question[];
    pagination?: PaginationActivity;
  };
}

/**
 * Questions by IDs request body interface
 */
export interface QuestionsByIdsBody {
  questionsIds: string[];
}

/**
 * Questions by IDs response interface
 */
export interface QuestionsByIdsResponse {
  message?: string;
  data: {
    questions: Question[];
  };
}
