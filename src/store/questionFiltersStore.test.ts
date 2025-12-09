import { useQuestionFiltersStore } from './questionFiltersStore';
import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';
import type { ActivityFiltersData } from '../types/activityFilters';

const sampleFilters: ActivityFiltersData = {
  types: [QUESTION_TYPE.ALTERNATIVA],
  bankIds: ['bank-1'],
  yearIds: ['year-1'],
  knowledgeIds: ['knowledge-1'],
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
    const { setDraftFilters, applyFilters } = useQuestionFiltersStore.getState();

    setDraftFilters(sampleFilters);
    applyFilters();

    const state = useQuestionFiltersStore.getState();
    expect(state.appliedFilters).toEqual(sampleFilters);
  });

  it('should clear draft and applied filters', () => {
    useQuestionFiltersStore.setState({
      draftFilters: sampleFilters,
      appliedFilters: sampleFilters,
    });

    const { clearFilters } = useQuestionFiltersStore.getState();
    clearFilters();

    const state = useQuestionFiltersStore.getState();
    expect(state.draftFilters).toBeNull();
    expect(state.appliedFilters).toBeNull();
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
});

