import { renderHook, act, waitFor } from '@testing-library/react';
import {
  createUseRecommendedLessonsPage,
  createRecommendedLessonsPageHook,
} from './useRecommendedLessonsPage';
import type {
  UseRecommendedLessonsPageConfig,
  RecommendedLessonsUserData,
  RecommendedLessonsApiClient,
} from './useRecommendedLessonsPage';
import { GoalDraftType, GoalDisplayStatus } from '../types/recommendedLessons';
import type {
  GoalsHistoryApiResponse,
  GoalModelsApiResponse,
  GoalTableItem,
  GoalModelTableItem,
} from '../types/recommendedLessons';
import type { SendLessonFormData } from '../components/SendLessonModal/types';
import { SubjectEnum } from '../enums/SubjectEnum';

/**
 * Test suite for useRecommendedLessonsPage hook factory
 */
describe('useRecommendedLessonsPage', () => {
  const mockNavigate = jest.fn();

  const mockApi: RecommendedLessonsApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserData: RecommendedLessonsUserData = {
    userInstitutions: [
      {
        school: { id: 'school-1', name: 'School One' },
        schoolYear: { id: 'year-1', name: '2024' },
        class: { id: 'class-1', name: 'Class A' },
      },
      {
        school: { id: 'school-2', name: 'School Two' },
        schoolYear: { id: 'year-2', name: '2024' },
        class: { id: 'class-2', name: 'Class B' },
      },
    ],
    subTeacherTopicClasses: [
      {
        subject: { id: 'subject-1', name: 'Mathematics' },
        class: { id: 'class-1', name: 'Class A' },
      },
      {
        subject: { id: 'subject-2', name: 'Portuguese' },
        class: { id: 'class-2', name: 'Class B' },
      },
    ],
  };

  const mockPaths = {
    createLesson: '/create-lesson',
    createModel: '/create-lesson?mode=model',
    lessonDetails: '/lessons',
    editLesson: '/lessons',
    editModel: '/create-lesson?mode=model&id=',
  };

  const mockEndpoints = {
    goalsHistory: '/recommended-class/history',
    goalDrafts: '/recommended-class/drafts',
    submitGoal: '/goals',
  };

  const mockTexts = {
    title: 'Recommended Lessons History',
    createButtonText: 'Create Lesson',
    searchPlaceholder: 'Search lesson',
  };

  const mockMapSubjectNameToEnum = jest.fn(
    (subjectName: string): SubjectEnum | null => {
      if (subjectName === 'Mathematics') return SubjectEnum.MATEMATICA;
      if (subjectName === 'Portuguese') return SubjectEnum.PORTUGUES;
      return null;
    }
  );

  const createConfig = (
    overrides?: Partial<UseRecommendedLessonsPageConfig>
  ): UseRecommendedLessonsPageConfig => ({
    api: mockApi,
    navigate: mockNavigate,
    userData: mockUserData,
    paths: mockPaths,
    endpoints: mockEndpoints,
    texts: mockTexts,
    emptyStateImage: '/empty.png',
    noSearchImage: '/no-search.png',
    mapSubjectNameToEnum: mockMapSubjectNameToEnum,
    ...overrides,
  });

  const validGoalsHistoryResponse: GoalsHistoryApiResponse = {
    message: 'Success',
    data: {
      recommendedClass: [
        {
          recommendedClass: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Goal',
            startDate: '2024-06-01T10:00:00Z',
            finalDate: '2024-06-15T14:30:00Z',
            createdAt: '2024-06-01T10:00:00Z',
            progress: 50,
            totalLessons: 10,
          },
          subject: { id: 'subject-1', name: 'Mathematics' },
          creator: { id: 'creator-1', name: 'Teacher' },
          stats: {
            totalStudents: 30,
            completedCount: 15,
            completionPercentage: 50,
          },
          breakdown: [
            {
              classId: 'class-1',
              className: 'Class A',
              schoolId: 'school-1',
              schoolName: 'School One',
              studentCount: 30,
              completedCount: 15,
            },
          ],
        },
      ],
      total: 1,
    },
  };

  const validGoalModelsResponse: GoalModelsApiResponse = {
    message: 'Success',
    data: {
      drafts: [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          type: GoalDraftType.MODELO,
          title: 'Test Model',
          description: 'Test description',
          creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174002',
          subjectId: 'subject-1',
          startDate: null,
          finalDate: null,
          createdAt: '2024-06-01T10:00:00Z',
          updatedAt: '2024-06-01T10:00:00Z',
        },
      ],
      total: 1,
    },
  };

  const testModel: GoalModelTableItem = {
    id: 'model-123',
    title: 'Test Model',
    savedAt: '01/06/2024',
    subject: 'Mathematics',
    subjectId: 'subject-1',
  };

  const testFormData: SendLessonFormData = {
    students: [{ studentId: 'student-1', userInstitutionId: 'inst-1' }],
    startDate: '2024-06-01',
    startTime: '08:00',
    finalDate: '2024-06-15',
    finalTime: '23:59',
  };

  /**
   * Helper to create hook and render it
   */
  function setupHook(overrides?: Partial<UseRecommendedLessonsPageConfig>) {
    const config = createConfig(overrides);
    const useHook = createUseRecommendedLessonsPage(config);
    return renderHook(() => useHook());
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Factory function tests
  it('should return a hook function', () => {
    const config = createConfig();
    const useRecommendedLessonsPage = createUseRecommendedLessonsPage(config);
    expect(useRecommendedLessonsPage).toBeInstanceOf(Function);
  });

  it('should return historyProps, modalProps, and navigate', () => {
    const { result } = setupHook();
    expect(result.current.historyProps).toBeDefined();
    expect(result.current.modalProps).toBeDefined();
    expect(result.current.navigate).toBeDefined();
  });

  // historyProps tests
  it('historyProps: should have all required properties', () => {
    const { result } = setupHook();
    const { historyProps } = result.current;

    expect(historyProps.fetchGoalsHistory).toBeInstanceOf(Function);
    expect(historyProps.fetchGoalModels).toBeInstanceOf(Function);
    expect(historyProps.deleteGoalModel).toBeInstanceOf(Function);
    expect(historyProps.onCreateLesson).toBeInstanceOf(Function);
    expect(historyProps.onCreateModel).toBeInstanceOf(Function);
    expect(historyProps.onRowClick).toBeInstanceOf(Function);
    expect(historyProps.onEditGoal).toBeInstanceOf(Function);
    expect(historyProps.onEditModel).toBeInstanceOf(Function);
    expect(historyProps.onSendLesson).toBeInstanceOf(Function);
    expect(historyProps.emptyStateImage).toBe('/empty.png');
    expect(historyProps.noSearchImage).toBe('/no-search.png');
    expect(historyProps.mapSubjectNameToEnum).toBe(mockMapSubjectNameToEnum);
    expect(historyProps.title).toBe('Recommended Lessons History');
    expect(historyProps.createButtonText).toBe('Create Lesson');
    expect(historyProps.searchPlaceholder).toBe('Search lesson');
  });

  it('historyProps: should provide userFilterData from userData', () => {
    const { result } = setupHook();
    const { userFilterData } = result.current.historyProps;

    expect(userFilterData.schools).toHaveLength(2);
    expect(userFilterData.schools[0].name).toBe('School One');
    expect(userFilterData.classes).toHaveLength(2);
    expect(userFilterData.classes[0].name).toBe('Class A');
    expect(userFilterData.subjects).toHaveLength(2);
    expect(userFilterData.subjects[0].name).toBe('Mathematics');
  });

  it('historyProps: should provide subjectsMap from userData', () => {
    const { result } = setupHook();
    const { subjectsMap } = result.current.historyProps;

    expect(subjectsMap.size).toBe(2);
    expect(subjectsMap.get('subject-1')).toBe('Mathematics');
    expect(subjectsMap.get('subject-2')).toBe('Portuguese');
  });

  it('historyProps: should handle null userData', () => {
    const { result } = setupHook({ userData: null });
    const { userFilterData, subjectsMap } = result.current.historyProps;

    expect(userFilterData.schools).toEqual([]);
    expect(userFilterData.classes).toEqual([]);
    expect(userFilterData.subjects).toEqual([]);
    expect(subjectsMap.size).toBe(0);
  });

  it('historyProps: should handle userData without userInstitutions', () => {
    const { result } = setupHook({
      userData: { subTeacherTopicClasses: mockUserData.subTeacherTopicClasses },
    });
    const { userFilterData } = result.current.historyProps;

    expect(userFilterData.schools).toEqual([]);
    expect(userFilterData.classes).toEqual([]);
    expect(userFilterData.subjects).toHaveLength(2);
  });

  it('historyProps: should handle userData without subTeacherTopicClasses', () => {
    const { result } = setupHook({
      userData: { userInstitutions: mockUserData.userInstitutions },
    });
    const { userFilterData } = result.current.historyProps;

    expect(userFilterData.schools).toHaveLength(2);
    expect(userFilterData.classes).toHaveLength(2);
    expect(userFilterData.subjects).toEqual([]);
  });

  // fetchGoalsHistory tests
  it('fetchGoalsHistory: should fetch and return data', async () => {
    (mockApi.get as jest.Mock).mockResolvedValueOnce({
      data: validGoalsHistoryResponse,
    });

    const { result } = setupHook();
    let response: GoalsHistoryApiResponse | undefined;

    await act(async () => {
      response = await result.current.historyProps.fetchGoalsHistory({
        page: 1,
        limit: 10,
      });
    });

    expect(mockApi.get).toHaveBeenCalledWith('/recommended-class/history', {
      params: { page: 1, limit: 10 },
    });
    expect(response).toEqual(validGoalsHistoryResponse);
  });

  it('fetchGoalsHistory: should call API without filters', async () => {
    (mockApi.get as jest.Mock).mockResolvedValueOnce({
      data: validGoalsHistoryResponse,
    });

    const { result } = setupHook();
    await act(async () => {
      await result.current.historyProps.fetchGoalsHistory();
    });

    expect(mockApi.get).toHaveBeenCalledWith('/recommended-class/history', {
      params: {},
    });
  });

  it('fetchGoalsHistory: should filter out undefined values', async () => {
    (mockApi.get as jest.Mock).mockResolvedValueOnce({
      data: validGoalsHistoryResponse,
    });

    const { result } = setupHook();
    await act(async () => {
      await result.current.historyProps.fetchGoalsHistory({
        page: 1,
        limit: undefined,
        search: undefined,
      });
    });

    expect(mockApi.get).toHaveBeenCalledWith('/recommended-class/history', {
      params: { page: 1 },
    });
  });

  // fetchGoalModels tests
  it('fetchGoalModels: should fetch with MODELO type', async () => {
    (mockApi.get as jest.Mock).mockResolvedValueOnce({
      data: validGoalModelsResponse,
    });

    const { result } = setupHook();
    let response: GoalModelsApiResponse | undefined;

    await act(async () => {
      response = await result.current.historyProps.fetchGoalModels({
        page: 1,
        limit: 10,
      });
    });

    expect(mockApi.get).toHaveBeenCalledWith('/recommended-class/drafts', {
      params: { page: 1, limit: 10, type: GoalDraftType.MODELO },
    });
    expect(response).toEqual(validGoalModelsResponse);
  });

  // deleteGoalModel tests
  it('deleteGoalModel: should call delete API', async () => {
    (mockApi.delete as jest.Mock).mockResolvedValueOnce({ data: {} });

    const { result } = setupHook();
    await act(async () => {
      await result.current.historyProps.deleteGoalModel('model-id');
    });

    expect(mockApi.delete).toHaveBeenCalledWith(
      '/recommended-class/drafts/model-id'
    );
  });

  // Navigation handler tests
  it('navigation: onCreateLesson should navigate correctly', () => {
    const { result } = setupHook();
    act(() => {
      result.current.historyProps.onCreateLesson();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/create-lesson');
  });

  it('navigation: onCreateModel should navigate correctly', () => {
    const { result } = setupHook();
    act(() => {
      result.current.historyProps.onCreateModel();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/create-lesson?mode=model');
  });

  it('navigation: onRowClick should navigate to lesson details', async () => {
    (mockApi.get as jest.Mock).mockResolvedValueOnce({
      data: validGoalsHistoryResponse,
    });

    const { result } = setupHook();

    await act(async () => {
      await result.current.historyProps.fetchGoalsHistory();
    });

    const row: GoalTableItem = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      startDate: '01/06',
      deadline: '15/06',
      title: 'Test Goal',
      school: 'School One',
      year: '-',
      subject: 'Mathematics',
      class: 'Class A',
      status: GoalDisplayStatus.ATIVA,
      completionPercentage: 50,
    };

    act(() => {
      result.current.historyProps.onRowClick(row);
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/lessons/123e4567-e89b-12d3-a456-426614174000',
      {
        state: { goalData: validGoalsHistoryResponse.data.recommendedClass[0] },
      }
    );
  });

  it('navigation: onEditGoal should navigate correctly', () => {
    const { result } = setupHook();
    act(() => {
      result.current.historyProps.onEditGoal('goal-123');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lessons/goal-123/editar');
  });

  it('navigation: onEditModel should navigate correctly', () => {
    const { result } = setupHook();
    act(() => {
      result.current.historyProps.onEditModel(testModel);
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      '/create-lesson?mode=model&id=model-123'
    );
  });

  // modalProps tests
  it('modalProps: should have correct initial state', () => {
    const { result } = setupHook();
    const { modalProps } = result.current;

    expect(modalProps.isOpen).toBe(false);
    expect(modalProps.isLoading).toBe(false);
    expect(modalProps.categories).toEqual([]);
    expect(modalProps.modalTitle).toBeUndefined();
    expect(modalProps.onClose).toBeInstanceOf(Function);
    expect(modalProps.onSubmit).toBeInstanceOf(Function);
    expect(modalProps.onCategoriesChange).toBeInstanceOf(Function);
  });

  it('modalProps: onSendLesson should open modal and set categories', () => {
    const { result } = setupHook();

    act(() => {
      result.current.historyProps.onSendLesson(testModel);
    });

    expect(result.current.modalProps.isOpen).toBe(true);
    expect(result.current.modalProps.modalTitle).toBe('Test Model');
    expect(result.current.modalProps.categories).toHaveLength(1);
    expect(result.current.modalProps.categories[0].key).toBe('students');
    expect(result.current.modalProps.categories[0].itens).toHaveLength(2);
  });

  it('modalProps: onClose should reset state', () => {
    const { result } = setupHook();

    act(() => {
      result.current.historyProps.onSendLesson(testModel);
    });
    expect(result.current.modalProps.isOpen).toBe(true);

    act(() => {
      result.current.modalProps.onClose();
    });

    expect(result.current.modalProps.isOpen).toBe(false);
    expect(result.current.modalProps.modalTitle).toBeUndefined();
  });

  it('modalProps: onCategoriesChange should update categories', () => {
    const { result } = setupHook();

    const newCategories = [
      {
        key: 'students',
        label: 'Turmas',
        selectedIds: ['class-1'],
        itens: [
          {
            id: 'class-1',
            name: 'Class A',
            studentId: 'class-1',
            userInstitutionId: 'class-1',
          },
        ],
      },
    ];

    act(() => {
      result.current.modalProps.onCategoriesChange(newCategories);
    });

    expect(result.current.modalProps.categories).toEqual(newCategories);
  });

  it('modalProps: onSubmit should submit lesson successfully', async () => {
    (mockApi.post as jest.Mock).mockResolvedValueOnce({ data: {} });

    const { result } = setupHook();

    act(() => {
      result.current.historyProps.onSendLesson(testModel);
    });

    await act(async () => {
      await result.current.modalProps.onSubmit(testFormData);
    });

    expect(mockApi.post).toHaveBeenCalledWith('/goals', {
      draftId: 'model-123',
      students: [{ studentId: 'student-1', userInstitutionId: 'inst-1' }],
      startDate: '2024-06-01T08:00:00',
      finalDate: '2024-06-15T23:59:00',
    });
    expect(result.current.modalProps.isOpen).toBe(false);
  });

  it('modalProps: should set loading state during submission', async () => {
    let resolvePost: () => void;
    const postPromise = new Promise<{ data: object }>((resolve) => {
      resolvePost = () => resolve({ data: {} });
    });
    (mockApi.post as jest.Mock).mockReturnValueOnce(postPromise);

    const { result } = setupHook();

    act(() => {
      result.current.historyProps.onSendLesson(testModel);
    });

    act(() => {
      result.current.modalProps.onSubmit({ ...testFormData, students: [] });
    });

    await waitFor(() => {
      expect(result.current.modalProps.isLoading).toBe(true);
    });

    await act(async () => {
      resolvePost!();
      await postPromise;
    });

    expect(result.current.modalProps.isLoading).toBe(false);
  });

  it('modalProps: should not submit if no model selected', async () => {
    const { result } = setupHook();

    await act(async () => {
      await result.current.modalProps.onSubmit(testFormData);
    });

    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('modalProps: should reset loading state on error', async () => {
    (mockApi.post as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = setupHook();

    act(() => {
      result.current.historyProps.onSendLesson(testModel);
    });

    try {
      await act(async () => {
        await result.current.modalProps.onSubmit(testFormData);
      });
    } catch {
      // Expected error
    }

    expect(result.current.modalProps.isLoading).toBe(false);
  });

  it('navigate: should expose navigate function from config', () => {
    const { result } = setupHook();
    expect(result.current.navigate).toBe(mockNavigate);
  });

  // Edge cases
  it('edge case: should handle empty school/class with nullish values', () => {
    const { result } = setupHook({
      userData: {
        userInstitutions: [
          {
            school: { id: '', name: '' },
            schoolYear: { id: 'year-1', name: '2024' },
            class: { id: '', name: '' },
          },
        ],
        subTeacherTopicClasses: [],
      },
    });

    expect(result.current.historyProps.userFilterData.schools).toEqual([]);
    expect(result.current.historyProps.userFilterData.classes).toEqual([]);
  });

  it('edge case: should handle empty subject with nullish values', () => {
    const { result } = setupHook({
      userData: {
        userInstitutions: [],
        subTeacherTopicClasses: [
          {
            subject: { id: '', name: '' },
            class: { id: 'class-1', name: 'Class A' },
          },
        ],
      },
    });

    expect(result.current.historyProps.userFilterData.subjects).toEqual([]);
  });

  it('edge case: should deduplicate schools in userFilterData', () => {
    const { result } = setupHook({
      userData: {
        userInstitutions: [
          {
            school: { id: 'school-1', name: 'School One' },
            schoolYear: { id: 'year-1', name: '2024' },
            class: { id: 'class-1', name: 'Class A' },
          },
          {
            school: { id: 'school-1', name: 'School One' },
            schoolYear: { id: 'year-1', name: '2024' },
            class: { id: 'class-2', name: 'Class B' },
          },
        ],
      },
    });

    expect(result.current.historyProps.userFilterData.schools).toHaveLength(1);
  });

  it('edge case: should deduplicate subjects in subjectsMap', () => {
    const { result } = setupHook({
      userData: {
        subTeacherTopicClasses: [
          {
            subject: { id: 'subject-1', name: 'Mathematics' },
            class: { id: 'class-1', name: 'Class A' },
          },
          {
            subject: { id: 'subject-1', name: 'Mathematics' },
            class: { id: 'class-2', name: 'Class B' },
          },
        ],
      },
    });

    expect(result.current.historyProps.subjectsMap.size).toBe(1);
  });

  it('edge case: onSendLesson with no classes should open modal with empty categories', () => {
    const { result } = setupHook({
      userData: {
        userInstitutions: [],
        subTeacherTopicClasses: [],
      },
    });

    act(() => {
      result.current.historyProps.onSendLesson(testModel);
    });

    expect(result.current.modalProps.isOpen).toBe(true);
    expect(result.current.modalProps.categories).toEqual([]);
  });

  // createRecommendedLessonsPageHook alias tests
  it('createRecommendedLessonsPageHook: should be an alias', () => {
    expect(createRecommendedLessonsPageHook).toBe(
      createUseRecommendedLessonsPage
    );
  });

  it('createRecommendedLessonsPageHook: should create functional hook', () => {
    const config = createConfig();
    const useHook = createRecommendedLessonsPageHook(config);
    const { result } = renderHook(() => useHook());

    expect(result.current.historyProps).toBeDefined();
    expect(result.current.modalProps).toBeDefined();
    expect(result.current.navigate).toBeDefined();
  });
});
