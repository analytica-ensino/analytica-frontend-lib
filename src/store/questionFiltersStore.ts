import { create } from 'zustand';
import type { ActivityFiltersData } from '../types/activityFilters';

export interface QuestionFiltersState {
  draftFilters: ActivityFiltersData | null;
  appliedFilters: ActivityFiltersData | null;
  setDraftFilters: (filters: ActivityFiltersData | null) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

/**
 * Zustand store to manage question filters with draft vs applied separation.
 */
export const useQuestionFiltersStore = create<QuestionFiltersState>((set) => ({
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
    });
  },
}));

