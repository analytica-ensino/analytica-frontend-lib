import { useQuestionFiltersStore } from './questionFiltersStore';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';
import type { ActivityFiltersData } from '../types/activityFilters';

const sampleFilters: ActivityFiltersData = {
  types: [QUESTION_TYPE.ALTERNATIVA],
  bankIds: ['bank-1'],
  yearIds: ['year-1'],
  subjectIds: ['subject-1'],
  topicIds: ['topic-1'],
  subtopicIds: ['subtopic-1'],
  contentIds: ['content-1'],
};

describe('questionFiltersStore', () => {
  beforeEach(() => {
    // reset store state without recreating actions
    useQuestionFiltersStore.setState({
      draftFilters: null,
      appliedFilters: null,
      cachedQuestions: [],
      cachedPagination: null,
      cachedFilters: null,
    });
  });

  it('should start with null draft and applied filters', () => {
    const { draftFilters, appliedFilters } = useQuestionFiltersStore.getState();

    expect(draftFilters).toBeNull();
    expect(appliedFilters).toBeNull();
  });

  it('should set draft filters without changing applied filters', () => {
    const { setDraftFilters } = useQuestionFiltersStore.getState();

    setDraftFilters(sampleFilters);

    const state = useQuestionFiltersStore.getState();
    expect(state.draftFilters).toEqual(sampleFilters);
    expect(state.appliedFilters).toBeNull();
  });

  it('should apply draft filters to applied filters', () => {
    const { setDraftFilters, applyFilters } =
      useQuestionFiltersStore.getState();

    setDraftFilters(sampleFilters);
    applyFilters();

    const state = useQuestionFiltersStore.getState();
    expect(state.appliedFilters).toEqual(sampleFilters);
  });

  it('should clear draft and applied filters', () => {
    useQuestionFiltersStore.setState({
      draftFilters: sampleFilters,
      appliedFilters: sampleFilters,
      cachedQuestions: [],
      cachedPagination: null,
      cachedFilters: sampleFilters,
    });

    const { clearFilters } = useQuestionFiltersStore.getState();
    clearFilters();

    const state = useQuestionFiltersStore.getState();
    expect(state.draftFilters).toBeNull();
    expect(state.appliedFilters).toBeNull();
    expect(state.cachedQuestions).toEqual([]);
    expect(state.cachedPagination).toBeNull();
    expect(state.cachedFilters).toBeNull();
  });

  it('should reset applied filters when applying empty draft', () => {
    useQuestionFiltersStore.setState({
      draftFilters: null,
      appliedFilters: sampleFilters,
    });

    const { applyFilters } = useQuestionFiltersStore.getState();
    applyFilters();

    const state = useQuestionFiltersStore.getState();
    expect(state.appliedFilters).toBeNull();
  });

  it('should set cached questions with pagination and filters', () => {
    const mockPagination = {
      page: 1,
      pageSize: 10,
      total: 100,
      totalPages: 10,
      hasNext: true,
      hasPrevious: false,
    };

    const { setCachedQuestions } = useQuestionFiltersStore.getState();
    setCachedQuestions([], mockPagination, sampleFilters);

    const state = useQuestionFiltersStore.getState();
    expect(state.cachedQuestions).toEqual([]);
    expect(state.cachedPagination).toEqual(mockPagination);
    expect(state.cachedFilters).toEqual(sampleFilters);
  });

  it('should clear cached questions', () => {
    const mockPagination = {
      page: 1,
      pageSize: 10,
      total: 100,
      totalPages: 10,
      hasNext: true,
      hasPrevious: false,
    };

    useQuestionFiltersStore.setState({
      cachedQuestions: [],
      cachedPagination: mockPagination,
      cachedFilters: sampleFilters,
    });

    const { clearCachedQuestions } = useQuestionFiltersStore.getState();
    clearCachedQuestions();

    const state = useQuestionFiltersStore.getState();
    expect(state.cachedQuestions).toEqual([]);
    expect(state.cachedPagination).toBeNull();
    expect(state.cachedFilters).toBeNull();
  });
});
