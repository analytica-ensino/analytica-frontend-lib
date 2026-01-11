import { create } from 'zustand';
import type { ActivityFiltersData } from '../types/activityFilters';
import type { Question, Pagination } from '../types/questions';

export interface QuestionFiltersState {
  // Filter states
  draftFilters: ActivityFiltersData | null;
  appliedFilters: ActivityFiltersData | null;
  setDraftFilters: (filters: ActivityFiltersData | null) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Questions cache state
  cachedQuestions: Question[];
  cachedPagination: Pagination | null;
  cachedFilters: ActivityFiltersData | null;
  setCachedQuestions: (
    questions: Question[],
    pagination: Pagination | null,
    filters: ActivityFiltersData | null
  ) => void;
  clearCachedQuestions: () => void;
}

/**
 * Zustand store to manage question filters with draft vs applied separation
 * and cache for questions list to avoid unnecessary refetches
 */
export const useQuestionFiltersStore = create<QuestionFiltersState>((set) => ({
  // Filter states
  draftFilters: null,
  appliedFilters: null,
  setDraftFilters: (filters) => {
    set({ draftFilters: filters });
  },
  applyFilters: () => {
    set((state) => ({
      appliedFilters: state.draftFilters,
    }));
  },
  clearFilters: () => {
    set({
      draftFilters: null,
      appliedFilters: null,
      // Clear cached questions when filters are cleared
      cachedQuestions: [],
      cachedPagination: null,
      cachedFilters: null,
    });
  },

  // Questions cache state
  cachedQuestions: [],
  cachedPagination: null,
  cachedFilters: null,
  setCachedQuestions: (questions, pagination, filters) => {
    set({
      cachedQuestions: questions,
      cachedPagination: pagination,
      cachedFilters: filters,
    });
  },
  clearCachedQuestions: () => {
    set({
      cachedQuestions: [],
      cachedPagination: null,
      cachedFilters: null,
    });
  },
}));
