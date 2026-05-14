import { renderHook, act, waitFor } from '@testing-library/react';
import { useActivityDraft } from './useActivityDraft';
import type {
  BaseApiClient,
  ActivityFiltersData,
  PreviewQuestion,
} from '../../..';
import { QUESTION_TYPE } from '../../..';
import { ActivityType } from '../ActivityCreate.types';
import type {
  ActivityData,
  ActivityPreFiltersInput,
} from '../ActivityCreate.types';

/**
 * Helper to create test questions with proper typing
 */
const createTestQuestion = (
  overrides: Partial<PreviewQuestion> = {}
): PreviewQuestion => ({
  id: 'q1',
  enunciado: 'Test',
  questionType: QUESTION_TYPE.ALTERNATIVA,
  ...overrides,
});

// Mock the utility functions
jest.mock('../ActivityCreate.utils', () => ({
  convertFiltersToBackendFormat: jest.fn((filters) => ({
    questionTypes: filters?.types || [],
    questionBanks: filters?.bankIds || [],
    subjects: filters?.subjectIds || [],
    topics: filters?.topicIds || [],
    subtopics: filters?.subtopicIds || [],
    contents: filters?.contentIds || [],
  })),
  convertQuestionToPreview: jest.fn((q) => ({
    id: q.id,
    enunciado: q.statement,
    questionType: q.questionType,
  })),
  formatErrorMessage: jest.fn((error, defaultMessage) =>
    error instanceof Error ? error.message : defaultMessage
  ),
  generateTitle: jest.fn(
    (type, subjectId, knowledgeAreas) =>
      `${type} - ${knowledgeAreas.find((k: { id: string }) => k.id === subjectId)?.name || subjectId}`
  ),
  extractDraftFromResponse: jest.fn((response) => response.data.data.draft),
  buildActivityDataFromDraft: jest.fn((draft, questionIds) => ({
    id: draft.id,
    type: draft.type,
    title: draft.title,
    subjectId: draft.subjectId,
    filters: draft.filters,
    questionIds,
    updatedAt: draft.updatedAt,
  })),
  buildPartialActivityUpdate: jest.fn((prevActivity, draft, questionIds) => ({
    id: draft.id,
    type: draft.type,
    title: draft.title,
    subjectId: draft.subjectId,
    filters: prevActivity.filters,
    questionIds,
    updatedAt: draft.updatedAt,
  })),
  buildPayloadWithTypeOverride: jest.fn(
    (payload, typeOverride, customTitle, subjectId, knowledgeAreas) => ({
      ...payload,
      type: typeOverride,
      title:
        customTitle ||
        `${typeOverride} - ${knowledgeAreas.find((k: { id: string }) => k.id === subjectId)?.name || subjectId}`,
    })
  ),
  getSubjectIdOrThrow: jest.fn(
    (activitySubjectId, appliedFiltersSubjectIds) => {
      const subjectId = activitySubjectId || appliedFiltersSubjectIds?.[0];
      if (!subjectId) throw new Error('Subject ID não encontrado');
      return subjectId;
    }
  ),
  shouldSkipAutoSave: jest.fn(
    ({
      loadingInitialQuestions,
      questionsCount,
      hasFirstSaveBeenDone,
      appliedFilters,
    }) => {
      if (loadingInitialQuestions) return true;
      if (questionsCount === 0 && !hasFirstSaveBeenDone) return true;
      if (!appliedFilters) return true;
      return false;
    }
  ),
  hasQuestionsChanged: jest.fn((current, lastSaved) => {
    const currentIds = current.map((q: { id: string }) => q.id).join(',');
    const lastSavedIds = lastSaved.map((q: { id: string }) => q.id).join(',');
    return currentIds !== lastSavedIds;
  }),
  hasRequiredSubjectIds: jest.fn(
    (subjectIds) => Array.isArray(subjectIds) && subjectIds.length > 0
  ),
}));

jest.mock('../../../utils/activityFilters', () => ({
  areFiltersEqual: jest.fn((a, b) => JSON.stringify(a) === JSON.stringify(b)),
}));

describe('useActivityDraft', () => {
  let mockApiClient: jest.Mocked<BaseApiClient>;
  let mockAddToast: jest.Mock;
  let mockOnSaveModel: jest.Mock;
  let mockGetTypeFromUrlString: jest.Mock;

  const defaultKnowledgeAreas = [
    { id: 'subject-1', name: 'Matemática' },
    { id: 'subject-2', name: 'Física' },
  ];

  const defaultAppliedFilters: ActivityFiltersData = {
    types: [],
    bankIds: [],
    subjectIds: ['subject-1'],
    topicIds: [],
    subtopicIds: [],
    contentIds: [],
    yearIds: [],
  };

  const createHookParams = (overrides = {}) => ({
    apiClient: mockApiClient,
    idParam: undefined,
    typeParam: undefined,
    activityCategory: 'ATIVIDADE' as const,
    isInPersonExam: false,
    knowledgeAreas: defaultKnowledgeAreas,
    appliedFilters: defaultAppliedFilters,
    onSaveModel: mockOnSaveModel,
    addToast: mockAddToast,
    getTypeFromUrlString: mockGetTypeFromUrlString,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockApiClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    mockAddToast = jest.fn();
    mockOnSaveModel = jest.fn();
    mockGetTypeFromUrlString = jest.fn((type) =>
      type === 'modelo' ? ActivityType.MODELO : ActivityType.RASCUNHO
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should return correct initial state values', () => {
      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      expect(result.current.activity).toBeNull();
      expect(result.current.preFilters).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.questions).toEqual([]);
      expect(result.current.loadingInitialQuestions).toBe(false);
      expect(result.current.draftId).toBeNull();
      expect(result.current.activityType).toBe(ActivityType.RASCUNHO);
      expect(result.current.lastSavedAt).toBeNull();
      expect(result.current.isSaving).toBe(false);
    });

    it('should use idParam as initial draftId when provided', () => {
      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'draft-123' }))
      );

      expect(result.current.draftId).toBe('draft-123');
    });

    it('should use typeParam to set initial activity type', () => {
      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ typeParam: 'modelo' }))
      );

      expect(result.current.activityType).toBe(ActivityType.MODELO);
      expect(mockGetTypeFromUrlString).toHaveBeenCalledWith('modelo');
    });
  });

  describe('Fetch Activity Draft', () => {
    it('should fetch activity draft when idParam is provided', async () => {
      const activityData = {
        id: 'draft-123',
        type: ActivityType.RASCUNHO,
        title: 'Test Draft',
        subjectId: 'subject-1',
        filters: { questionTypes: [], subjects: ['subject-1'] },
        updatedAt: '2024-01-01T00:00:00Z',
        selectedQuestions: [],
      };

      // API returns response where response.data is the activity directly
      mockApiClient.get.mockResolvedValueOnce({ data: activityData });

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'draft-123' }))
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activity-drafts/draft-123'
      );
      expect(result.current.activity).toEqual(activityData);
      expect(result.current.preFilters).toEqual(activityData.filters);
      expect(result.current.draftId).toBe('draft-123');
      expect(result.current.activityType).toBe(ActivityType.RASCUNHO);
    });

    it('should handle nested response format with data wrapper', async () => {
      const innerData = {
        id: 'draft-456',
        type: ActivityType.MODELO,
        title: 'Nested Draft',
        subjectId: 'subject-2',
        filters: {},
        selectedQuestions: [],
      };

      // When API returns { data: activityData }, response.data = { data: activityData }
      // The hook checks 'data' in response.data and extracts response.data.data
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          data: innerData,
        },
      });

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'draft-456' }))
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // The hook extracts the inner data if 'data' property exists
      expect(result.current.activity).toEqual(innerData);
    });

    it('should show error toast when fetch fails', async () => {
      const mockError = new Error('Network error');
      mockApiClient.get.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'draft-123' }))
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Erro ao carregar atividade',
        description: 'Network error',
        variant: 'solid',
        action: 'warning',
        position: 'top-right',
      });
    });

    it('should not fetch if idParam is undefined', () => {
      renderHook(() => useActivityDraft(createHookParams()));

      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should not re-fetch if idParam is the same', async () => {
      const activityData = {
        id: 'draft-123',
        type: ActivityType.RASCUNHO,
        title: 'Test Draft',
        subjectId: 'subject-1',
        filters: {},
        selectedQuestions: [],
      };

      mockApiClient.get.mockResolvedValue({ data: activityData });

      const { rerender } = renderHook((props) => useActivityDraft(props), {
        initialProps: createHookParams({ idParam: 'draft-123' }),
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      rerender(createHookParams({ idParam: 'draft-123' }));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Load Initial Questions', () => {
    it('should convert selected questions to preview format', async () => {
      const selectedQuestions = [
        {
          id: 'q1',
          statement: 'Question 1',
          questionType: 'ALTERNATIVA',
          options: [],
        },
        {
          id: 'q2',
          statement: 'Question 2',
          questionType: 'DISSERTATIVA',
          options: [],
        },
      ];

      const activityData = {
        id: 'draft-123',
        type: ActivityType.RASCUNHO,
        title: 'Test Draft',
        subjectId: 'subject-1',
        filters: {},
        selectedQuestions,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: activityData });

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'draft-123' }))
      );

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(2);
      });

      expect(result.current.questions[0]).toMatchObject({
        id: 'q1',
        enunciado: 'Question 1',
        questionType: 'ALTERNATIVA',
      });
      expect(result.current.questions[1]).toMatchObject({
        id: 'q2',
        enunciado: 'Question 2',
        questionType: 'DISSERTATIVA',
      });
    });

    it('should show error toast when question conversion fails', async () => {
      const { convertQuestionToPreview } = jest.requireMock(
        '../ActivityCreate.utils'
      );
      convertQuestionToPreview.mockImplementationOnce(() => {
        throw new Error('Conversion error');
      });

      const activityData = {
        id: 'draft-123',
        type: ActivityType.RASCUNHO,
        title: 'Test Draft',
        subjectId: 'subject-1',
        filters: {},
        selectedQuestions: [{ id: 'q1', statement: 'Q1' }],
      };

      mockApiClient.get.mockResolvedValueOnce({ data: activityData });

      renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'draft-123' }))
      );

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao carregar questões',
          })
        );
      });
    });
  });

  describe('saveDraft', () => {
    it('should create new draft when draftId is null', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'new-draft-123',
              type: ActivityType.RASCUNHO,
              title: 'New Draft',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      let savedDraftId: string | undefined;
      await act(async () => {
        savedDraftId = await result.current.saveDraft();
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activity-drafts',
        expect.objectContaining({
          type: ActivityType.RASCUNHO,
          activityType: 'ATIVIDADE',
          subjectId: 'subject-1',
          questionIds: ['q1'],
          isDigital: true,
        })
      );
      expect(savedDraftId).toBe('new-draft-123');
      expect(result.current.draftId).toBe('new-draft-123');
    });

    it('should update existing draft when draftId exists', async () => {
      const activityData = {
        id: 'existing-draft',
        type: ActivityType.RASCUNHO,
        title: 'Existing Draft',
        subjectId: 'subject-1',
        filters: {},
        selectedQuestions: [],
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockPatchResponse = {
        data: {
          data: {
            draft: {
              id: 'existing-draft',
              type: ActivityType.RASCUNHO,
              title: 'Updated Draft',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-02T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.get.mockResolvedValueOnce({ data: activityData });
      mockApiClient.patch.mockResolvedValueOnce(mockPatchResponse);

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'existing-draft' }))
      );

      await waitFor(() => {
        expect(result.current.activity).not.toBeNull();
      });

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/activity-drafts/existing-draft',
        expect.objectContaining({
          type: ActivityType.RASCUNHO,
          subjectId: 'subject-1',
          questionIds: ['q1'],
        })
      );
    });

    it('should save with type override when provided', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'new-draft-123',
              type: ActivityType.MODELO,
              title: 'Modelo - Matemática',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      await act(async () => {
        await result.current.saveDraft(ActivityType.MODELO);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activity-drafts',
        expect.objectContaining({
          type: ActivityType.MODELO,
        })
      );
    });

    it('should save with custom title when provided', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'new-draft-123',
              type: ActivityType.MODELO,
              title: 'Custom Title',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      await act(async () => {
        await result.current.saveDraft(ActivityType.MODELO, 'Custom Title');
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activity-drafts',
        expect.objectContaining({
          type: ActivityType.MODELO,
          title: 'Custom Title',
        })
      );
    });

    it('should call onSaveModel callback when saving as MODELO', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'modelo-draft-123',
              type: ActivityType.MODELO,
              title: 'Modelo Draft',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      await act(async () => {
        await result.current.saveDraft(ActivityType.MODELO);
      });

      expect(mockOnSaveModel).toHaveBeenCalledWith(mockResponse.data);
    });

    it('should show error toast when save fails', async () => {
      const mockError = new Error('Save failed');
      mockApiClient.post.mockRejectedValueOnce(mockError);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Erro ao salvar rascunho',
        description: 'Save failed',
        variant: 'solid',
        action: 'warning',
        position: 'top-right',
      });

      consoleSpy.mockRestore();
    });

    it('should skip save when appliedFilters is null', async () => {
      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ appliedFilters: null }))
      );

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(mockApiClient.patch).not.toHaveBeenCalled();
    });

    it('should skip save when no subjectIds in filters', async () => {
      const filtersWithoutSubject: ActivityFiltersData = {
        ...defaultAppliedFilters,
        subjectIds: [],
      };

      const { result } = renderHook(() =>
        useActivityDraft(
          createHookParams({ appliedFilters: filtersWithoutSubject })
        )
      );

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('should not save while isSaving is true', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'new-draft-123',
              type: ActivityType.RASCUNHO,
              title: 'New Draft',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      let resolveFirst: (value: unknown) => void;
      const firstPromise = new Promise<unknown>((resolve) => {
        resolveFirst = resolve;
      });

      mockApiClient.post.mockReturnValueOnce(
        firstPromise as ReturnType<typeof mockApiClient.post>
      );

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      // Start first save
      act(() => {
        result.current.saveDraft();
      });

      // Try second save while first is in progress
      await act(async () => {
        await result.current.saveDraft();
      });

      // Complete first save
      await act(async () => {
        resolveFirst!(mockResponse);
      });

      // Should only have been called once
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it('should set isDigital based on isInPersonExam', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'new-draft-123',
              type: ActivityType.RASCUNHO,
              title: 'New Draft',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ isInPersonExam: true }))
      );

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activity-drafts',
        expect.objectContaining({
          isDigital: false,
        })
      );
    });
  });

  describe('Auto-save Effect', () => {
    it('should trigger auto-save when questions change', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'auto-saved-draft',
              type: ActivityType.RASCUNHO,
              title: 'Draft',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      // Simulate first save being done
      act(() => {
        result.current.hasFirstSaveBeenDone.current = true;
      });

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      // Fast-forward timers
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      });
    });

    it('should debounce auto-save calls', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'auto-saved-draft',
              type: ActivityType.RASCUNHO,
              title: 'Draft',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.hasFirstSaveBeenDone.current = true;
      });

      // Multiple rapid changes
      act(() => {
        result.current.setQuestions([
          createTestQuestion({ id: 'q1', enunciado: 'Test 1' }),
        ]);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        result.current.setQuestions([
          createTestQuestion({ id: 'q1', enunciado: 'Test 1' }),
          createTestQuestion({ id: 'q2', enunciado: 'Test 2' }),
        ]);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        result.current.setQuestions([
          createTestQuestion({ id: 'q1', enunciado: 'Test 1' }),
          createTestQuestion({ id: 'q2', enunciado: 'Test 2' }),
          createTestQuestion({ id: 'q3', enunciado: 'Test 3' }),
        ]);
      });

      // Before debounce time
      expect(mockApiClient.post).not.toHaveBeenCalled();

      // Fast-forward past debounce time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        // Should only be called once due to debouncing
        expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      });
    });

    it('should skip auto-save when loading initial questions', async () => {
      const { shouldSkipAutoSave } = jest.requireMock(
        '../ActivityCreate.utils'
      );
      shouldSkipAutoSave.mockReturnValue(true);

      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setQuestions([createTestQuestion()]);
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(mockApiClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('State Setters', () => {
    it('should allow setting activity directly', () => {
      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      const newActivity: ActivityData = {
        id: 'test-activity',
        type: ActivityType.RASCUNHO,
        title: 'Test',
        subjectId: 'subject-1',
        filters: {
          questionTypes: [],
          questionBanks: [],
          subjects: [],
          topics: [],
          subtopics: [],
          contents: [],
        },
        questionIds: [],
      };

      act(() => {
        result.current.setActivity(newActivity);
      });

      expect(result.current.activity).toEqual(newActivity);
    });

    it('should allow setting preFilters directly', () => {
      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      const newPreFilters: ActivityPreFiltersInput = {
        subjects: ['subject-1'],
        topics: ['topic-1'],
      };

      act(() => {
        result.current.setPreFilters(newPreFilters);
      });

      expect(result.current.preFilters).toEqual(newPreFilters);
    });

    it('should allow setting questions directly', () => {
      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      const newQuestions: PreviewQuestion[] = [
        createTestQuestion({ id: 'q1', enunciado: 'Q1' }),
        createTestQuestion({
          id: 'q2',
          enunciado: 'Q2',
          questionType: QUESTION_TYPE.DISSERTATIVA,
        }),
      ];

      act(() => {
        result.current.setQuestions(newQuestions);
      });

      expect(result.current.questions).toEqual(newQuestions);
    });

    it('should allow setting draftId directly', () => {
      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setDraftId('new-draft-id');
      });

      expect(result.current.draftId).toBe('new-draft-id');
    });

    it('should allow setting activityType directly', () => {
      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      act(() => {
        result.current.setActivityType(ActivityType.MODELO);
      });

      expect(result.current.activityType).toBe(ActivityType.MODELO);
    });
  });

  describe('Refs', () => {
    it('should expose refs for external access', () => {
      const { result } = renderHook(() => useActivityDraft(createHookParams()));

      expect(result.current.hasFirstSaveBeenDone).toBeDefined();
      expect(result.current.saveTimeoutRef).toBeDefined();
      expect(result.current.lastSavedFiltersRef).toBeDefined();
      expect(result.current.lastSavedQuestionsRef).toBeDefined();
      expect(result.current.hasAppliedInitialFiltersRef).toBeDefined();
      expect(result.current.lastFetchedActivityIdRef).toBeDefined();
      expect(result.current.saveDraftRef).toBeDefined();
    });

    it('should update saveDraftRef when saveDraft changes', async () => {
      const { result, rerender } = renderHook(
        (props) => useActivityDraft(props),
        { initialProps: createHookParams() }
      );

      // Store initial ref to verify it exists before rerender
      const _initialRef = result.current.saveDraftRef.current;
      expect(_initialRef).toBeDefined();

      rerender(
        createHookParams({
          appliedFilters: {
            ...defaultAppliedFilters,
            subjectIds: ['subject-2'],
          },
        })
      );

      // The ref function should still be defined after rerender
      expect(result.current.saveDraftRef.current).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selectedQuestions array', async () => {
      const activityData = {
        id: 'draft-123',
        type: ActivityType.RASCUNHO,
        title: 'Test Draft',
        subjectId: 'subject-1',
        filters: {},
        selectedQuestions: [],
      };

      mockApiClient.get.mockResolvedValueOnce({ data: activityData });

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'draft-123' }))
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.questions).toEqual([]);
    });

    it('should handle undefined selectedQuestions', async () => {
      const activityData = {
        id: 'draft-123',
        type: ActivityType.RASCUNHO,
        title: 'Test Draft',
        subjectId: 'subject-1',
        filters: {},
      };

      mockApiClient.get.mockResolvedValueOnce({ data: activityData });

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ idParam: 'draft-123' }))
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.questions).toEqual([]);
    });

    it('should use PROVA as activityCategory for exams', async () => {
      const mockResponse = {
        data: {
          data: {
            draft: {
              id: 'exam-draft-123',
              type: ActivityType.RASCUNHO,
              title: 'Exam Draft',
              subjectId: 'subject-1',
              filters: {},
              updatedAt: '2024-01-01T00:00:00Z',
            },
          },
        },
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      // Ensure shouldSkipAutoSave returns false for this specific test
      const { shouldSkipAutoSave } = jest.requireMock(
        '../ActivityCreate.utils'
      );
      shouldSkipAutoSave.mockReturnValue(false);

      const { result } = renderHook(() =>
        useActivityDraft(createHookParams({ activityCategory: 'PROVA' }))
      );

      // Set questions and mark first save as done
      act(() => {
        result.current.setQuestions([createTestQuestion()]);
        result.current.hasFirstSaveBeenDone.current = true;
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/activity-drafts',
        expect.objectContaining({
          activityType: 'PROVA',
        })
      );
    });
  });
});
