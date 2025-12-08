import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

/**
 * Activity Filters Data interface
 * Represents the current state of all filters
 */
export interface ActivityFiltersData {
  types: QUESTION_TYPE[];
  bankIds: string[];
  yearIds: string[];
  knowledgeIds: string[];
  topicIds: string[];
  subtopicIds: string[];
  contentIds: string[];
}

/**
 * Bank interface for vestibular banks
 */
export interface Bank {
  examInstitution: string;
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Bank Year interface for exam years
 */
export interface BankYear {
  id: string;
  name: string;
  bankId: string;
}

/**
 * Knowledge Area interface
 */
export interface KnowledgeArea {
  id: string;
  name: string;
  color: string;
  icon?: string;
  [key: string]: unknown;
}

/**
 * Knowledge Item interface for knowledge structure
 */
export interface KnowledgeItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Knowledge Structure State interface
 */
export interface KnowledgeStructureState {
  topics: KnowledgeItem[];
  subtopics: KnowledgeItem[];
  contents: KnowledgeItem[];
  loading: boolean;
  error: string | null;
}
