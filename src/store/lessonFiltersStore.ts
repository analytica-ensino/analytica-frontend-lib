import { create } from 'zustand';
import type { LessonFiltersData } from '../types/lessonFilters';
import type { Lesson, LessonsPagination } from '../types/lessons';

export interface LessonFiltersState {
  // Filter states
  draftFilters: LessonFiltersData | null;
  appliedFilters: LessonFiltersData | null;
  setDraftFilters: (filters: LessonFiltersData | null) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Lessons cache state
  cachedLessons: Lesson[];
  cachedPagination: LessonsPagination | null;
  cachedFilters: LessonFiltersData | null;
  setCachedLessons: (
    lessons: Lesson[],
    pagination: LessonsPagination | null,
    filters: LessonFiltersData | null
  ) => void;
  clearCachedLessons: () => void;
}

/**
 * Zustand store to manage lesson filters with draft vs applied separation
 * and cache for lessons list to avoid unnecessary refetches
 */
export const useLessonFiltersStore = create<LessonFiltersState>((set) => ({
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
      // Clear cached lessons when filters are cleared
      cachedLessons: [],
      cachedPagination: null,
      cachedFilters: null,
    });
  },

  // Lessons cache state
  cachedLessons: [],
  cachedPagination: null,
  cachedFilters: null,
  setCachedLessons: (lessons, pagination, filters) => {
    set({
      cachedLessons: lessons,
      cachedPagination: pagination,
      cachedFilters: filters,
    });
  },
  clearCachedLessons: () => {
    set({
      cachedLessons: [],
      cachedPagination: null,
      cachedFilters: null,
    });
  },
}));
