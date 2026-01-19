import { useLessonFiltersStore } from './lessonFiltersStore';
import type { LessonFiltersData } from '../types/lessonFilters';
import type { Lesson, LessonsPagination } from '../types/lessons';

const sampleFilters: LessonFiltersData = {
  subjectIds: ['subject-1'],
  topicIds: ['topic-1'],
  subtopicIds: ['subtopic-1'],
  contentIds: ['content-1'],
};

const sampleLessons: Lesson[] = [
  { id: 'lesson-1', title: 'Lesson 1' },
  { id: 'lesson-2', title: 'Lesson 2' },
];

const samplePagination: LessonsPagination = {
  page: 1,
  limit: 10,
  total: 100,
  totalPages: 10,
  hasNext: true,
  hasPrev: false,
};

describe('lessonFiltersStore', () => {
  beforeEach(() => {
    // reset store state without recreating actions
    useLessonFiltersStore.setState({
      draftFilters: null,
      appliedFilters: null,
      cachedLessons: [],
      cachedPagination: null,
      cachedFilters: null,
    });
  });

  describe('initial state', () => {
    it('should start with null draft and applied filters', () => {
      const { draftFilters, appliedFilters } = useLessonFiltersStore.getState();

      expect(draftFilters).toBeNull();
      expect(appliedFilters).toBeNull();
    });

    it('should start with empty cached lessons', () => {
      const { cachedLessons, cachedPagination, cachedFilters } =
        useLessonFiltersStore.getState();

      expect(cachedLessons).toEqual([]);
      expect(cachedPagination).toBeNull();
      expect(cachedFilters).toBeNull();
    });
  });

  describe('setDraftFilters', () => {
    it('should set draft filters without changing applied filters', () => {
      const { setDraftFilters } = useLessonFiltersStore.getState();

      setDraftFilters(sampleFilters);

      const state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toEqual(sampleFilters);
      expect(state.appliedFilters).toBeNull();
    });

    it('should allow setting draft filters to null', () => {
      useLessonFiltersStore.setState({
        draftFilters: sampleFilters,
      });

      const { setDraftFilters } = useLessonFiltersStore.getState();
      setDraftFilters(null);

      const state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toBeNull();
    });

    it('should overwrite existing draft filters', () => {
      const { setDraftFilters } = useLessonFiltersStore.getState();

      setDraftFilters(sampleFilters);

      const newFilters: LessonFiltersData = {
        subjectIds: ['subject-2'],
        topicIds: ['topic-2'],
        subtopicIds: ['subtopic-2'],
        contentIds: ['content-2'],
      };

      setDraftFilters(newFilters);

      const state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toEqual(newFilters);
    });
  });

  describe('applyFilters', () => {
    it('should apply draft filters to applied filters', () => {
      const { setDraftFilters, applyFilters } =
        useLessonFiltersStore.getState();

      setDraftFilters(sampleFilters);
      applyFilters();

      const state = useLessonFiltersStore.getState();
      expect(state.appliedFilters).toEqual(sampleFilters);
    });

    it('should reset applied filters when applying empty draft', () => {
      useLessonFiltersStore.setState({
        draftFilters: null,
        appliedFilters: sampleFilters,
      });

      const { applyFilters } = useLessonFiltersStore.getState();
      applyFilters();

      const state = useLessonFiltersStore.getState();
      expect(state.appliedFilters).toBeNull();
    });

    it('should keep draft filters unchanged after applying', () => {
      const { setDraftFilters, applyFilters } =
        useLessonFiltersStore.getState();

      setDraftFilters(sampleFilters);
      applyFilters();

      const state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toEqual(sampleFilters);
      expect(state.appliedFilters).toEqual(sampleFilters);
    });
  });

  describe('clearFilters', () => {
    it('should clear draft and applied filters', () => {
      useLessonFiltersStore.setState({
        draftFilters: sampleFilters,
        appliedFilters: sampleFilters,
      });

      const { clearFilters } = useLessonFiltersStore.getState();
      clearFilters();

      const state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toBeNull();
      expect(state.appliedFilters).toBeNull();
    });

    it('should also clear cached lessons when clearing filters', () => {
      useLessonFiltersStore.setState({
        draftFilters: sampleFilters,
        appliedFilters: sampleFilters,
        cachedLessons: sampleLessons,
        cachedPagination: samplePagination,
        cachedFilters: sampleFilters,
      });

      const { clearFilters } = useLessonFiltersStore.getState();
      clearFilters();

      const state = useLessonFiltersStore.getState();
      expect(state.cachedLessons).toEqual([]);
      expect(state.cachedPagination).toBeNull();
      expect(state.cachedFilters).toBeNull();
    });
  });

  describe('setCachedLessons', () => {
    it('should set cached lessons with pagination and filters', () => {
      const { setCachedLessons } = useLessonFiltersStore.getState();

      setCachedLessons(sampleLessons, samplePagination, sampleFilters);

      const state = useLessonFiltersStore.getState();
      expect(state.cachedLessons).toEqual(sampleLessons);
      expect(state.cachedPagination).toEqual(samplePagination);
      expect(state.cachedFilters).toEqual(sampleFilters);
    });

    it('should allow setting cached lessons with null pagination', () => {
      const { setCachedLessons } = useLessonFiltersStore.getState();

      setCachedLessons(sampleLessons, null, sampleFilters);

      const state = useLessonFiltersStore.getState();
      expect(state.cachedLessons).toEqual(sampleLessons);
      expect(state.cachedPagination).toBeNull();
      expect(state.cachedFilters).toEqual(sampleFilters);
    });

    it('should allow setting cached lessons with null filters', () => {
      const { setCachedLessons } = useLessonFiltersStore.getState();

      setCachedLessons(sampleLessons, samplePagination, null);

      const state = useLessonFiltersStore.getState();
      expect(state.cachedLessons).toEqual(sampleLessons);
      expect(state.cachedPagination).toEqual(samplePagination);
      expect(state.cachedFilters).toBeNull();
    });

    it('should allow setting empty lessons array', () => {
      const { setCachedLessons } = useLessonFiltersStore.getState();

      setCachedLessons([], samplePagination, sampleFilters);

      const state = useLessonFiltersStore.getState();
      expect(state.cachedLessons).toEqual([]);
      expect(state.cachedPagination).toEqual(samplePagination);
      expect(state.cachedFilters).toEqual(sampleFilters);
    });

    it('should overwrite existing cached data', () => {
      useLessonFiltersStore.setState({
        cachedLessons: sampleLessons,
        cachedPagination: samplePagination,
        cachedFilters: sampleFilters,
      });

      const newLessons: Lesson[] = [{ id: 'lesson-3', title: 'Lesson 3' }];
      const newPagination: LessonsPagination = {
        page: 2,
        limit: 20,
        total: 200,
        totalPages: 10,
        hasNext: false,
        hasPrev: true,
      };
      const newFilters: LessonFiltersData = {
        subjectIds: ['subject-2'],
        topicIds: [],
        subtopicIds: [],
        contentIds: [],
      };

      const { setCachedLessons } = useLessonFiltersStore.getState();
      setCachedLessons(newLessons, newPagination, newFilters);

      const state = useLessonFiltersStore.getState();
      expect(state.cachedLessons).toEqual(newLessons);
      expect(state.cachedPagination).toEqual(newPagination);
      expect(state.cachedFilters).toEqual(newFilters);
    });
  });

  describe('clearCachedLessons', () => {
    it('should clear cached lessons', () => {
      useLessonFiltersStore.setState({
        cachedLessons: sampleLessons,
        cachedPagination: samplePagination,
        cachedFilters: sampleFilters,
      });

      const { clearCachedLessons } = useLessonFiltersStore.getState();
      clearCachedLessons();

      const state = useLessonFiltersStore.getState();
      expect(state.cachedLessons).toEqual([]);
      expect(state.cachedPagination).toBeNull();
      expect(state.cachedFilters).toBeNull();
    });

    it('should not affect draft and applied filters', () => {
      useLessonFiltersStore.setState({
        draftFilters: sampleFilters,
        appliedFilters: sampleFilters,
        cachedLessons: sampleLessons,
        cachedPagination: samplePagination,
        cachedFilters: sampleFilters,
      });

      const { clearCachedLessons } = useLessonFiltersStore.getState();
      clearCachedLessons();

      const state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toEqual(sampleFilters);
      expect(state.appliedFilters).toEqual(sampleFilters);
    });
  });

  describe('combined operations', () => {
    it('should handle full workflow: set draft -> apply -> cache -> clear all', () => {
      const { setDraftFilters, applyFilters, setCachedLessons, clearFilters } =
        useLessonFiltersStore.getState();

      // Set draft filters
      setDraftFilters(sampleFilters);
      let state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toEqual(sampleFilters);

      // Apply filters
      applyFilters();
      state = useLessonFiltersStore.getState();
      expect(state.appliedFilters).toEqual(sampleFilters);

      // Cache lessons
      setCachedLessons(sampleLessons, samplePagination, sampleFilters);
      state = useLessonFiltersStore.getState();
      expect(state.cachedLessons).toEqual(sampleLessons);

      // Clear all filters (should also clear cache)
      clearFilters();
      state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toBeNull();
      expect(state.appliedFilters).toBeNull();
      expect(state.cachedLessons).toEqual([]);
      expect(state.cachedPagination).toBeNull();
      expect(state.cachedFilters).toBeNull();
    });

    it('should handle clearing cache without affecting filters', () => {
      const {
        setDraftFilters,
        applyFilters,
        setCachedLessons,
        clearCachedLessons,
      } = useLessonFiltersStore.getState();

      // Setup state
      setDraftFilters(sampleFilters);
      applyFilters();
      setCachedLessons(sampleLessons, samplePagination, sampleFilters);

      // Clear only cache
      clearCachedLessons();

      const state = useLessonFiltersStore.getState();
      expect(state.draftFilters).toEqual(sampleFilters);
      expect(state.appliedFilters).toEqual(sampleFilters);
      expect(state.cachedLessons).toEqual([]);
      expect(state.cachedPagination).toBeNull();
      expect(state.cachedFilters).toBeNull();
    });
  });
});
