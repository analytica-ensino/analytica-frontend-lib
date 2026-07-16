import { renderHook, act, waitFor } from '@testing-library/react';
import {
  createUseActivitiesHistory,
  createActivitiesHistoryHook,
  transformActivityToTableItem,
  buildActivityHistoryQueryParams,
  DEFAULT_ACTIVITIES_PAGINATION,
} from './useActivitiesHistory';
import {
  ActivityApiStatus,
  ActivityDisplayStatus,
} from '../types/activitiesHistory';
import type {
  ActivityHistoryResponse,
  ActivitiesHistoryApiResponse,
} from '../types/activitiesHistory';
import type { BaseApiClient } from '../types/api';

// Mock dayjs
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return Object.assign((date?: string | Date) => {
    if (date) return actual(date);
    // Return a fixed "now" date for testing
    return actual('2024-06-15');
  }, actual);
});

describe('useActivitiesHistory', () => {
  describe('DEFAULT_ACTIVITIES_PAGINATION', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_ACTIVITIES_PAGINATION).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('transformActivityToTableItem', () => {
    const baseActivity: ActivityHistoryResponse = {
      id: 'activity-123',
      title: 'Test Activity',
      startDate: '2024-06-01',
      finalDate: '2024-12-31',
      status: ActivityApiStatus.A_VENCER,
      completionPercentage: 75,
      subject: {
        id: 'subject-1',
        name: 'Matemática',
        areaKnowledgeId: 'area-1',
      },
      creator: { id: 'creator-1', name: 'Prof. Maria' },
      breakdown: [
        {
          school: { id: 'school-1', name: 'Escola Exemplo' },
          schoolYear: { id: 'year-1', name: '2024' },
          class: { id: 'class-1', name: 'Turma A' },
          totalStudents: 30,
          answeredStudents: 20,
          completionPercentage: 75,
        },
      ],
    };

    it('should transform activity correctly with all fields', () => {
      const result = transformActivityToTableItem(baseActivity);

      expect(result.id).toBe('activity-123');
      expect(result.title).toBe('Test Activity');
      expect(result.startDate).toBe('01/06');
      expect(result.deadline).toBe('31/12');
      expect(result.creator).toBe('Prof. Maria');
      expect(result.school).toBe('Escola Exemplo');
      expect(result.year).toBe('2024');
      expect(result.subject).toBe('Matemática');
      expect(result.class).toBe('Turma A');
      expect(result.completionPercentage).toBe(75);
      expect(result.status).toBe(ActivityDisplayStatus.ATIVA);
    });

    it('should handle null startDate', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        startDate: null,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.startDate).toBe('-');
    });

    it('should handle null finalDate', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        finalDate: null,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.deadline).toBe('-');
    });

    it('should use "-" when breakdown is absent', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        breakdown: undefined,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.school).toBe('-');
      expect(result.year).toBe('-');
      expect(result.class).toBe('-');
    });

    it('should use "-" when breakdown is empty array', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        breakdown: [],
      };

      const result = transformActivityToTableItem(activity);
      expect(result.school).toBe('-');
      expect(result.year).toBe('-');
      expect(result.class).toBe('-');
    });

    it('should use "-" when subject is null', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        subject: null,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.subject).toBe('-');
    });

    it('should use "-" when breakdown school is null', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        breakdown: [
          {
            school: null,
            schoolYear: { id: 'year-1', name: '2024' },
            class: { id: 'class-1', name: 'Turma A' },
            totalStudents: 30,
            answeredStudents: 20,
            completionPercentage: 75,
          },
        ],
      };

      const result = transformActivityToTableItem(activity);
      expect(result.school).toBe('-');
      expect(result.year).toBe('2024');
      expect(result.class).toBe('Turma A');
    });

    it('should use "-" when breakdown schoolYear is null', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        breakdown: [
          {
            school: { id: 'school-1', name: 'Escola Exemplo' },
            schoolYear: null,
            class: { id: 'class-1', name: 'Turma A' },
            totalStudents: 30,
            answeredStudents: 20,
            completionPercentage: 75,
          },
        ],
      };

      const result = transformActivityToTableItem(activity);
      expect(result.year).toBe('-');
      expect(result.school).toBe('Escola Exemplo');
      expect(result.class).toBe('Turma A');
    });

    it('should use "-" when breakdown class is null', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        breakdown: [
          {
            school: { id: 'school-1', name: 'Escola Exemplo' },
            schoolYear: { id: 'year-1', name: '2024' },
            class: null,
            totalStudents: 30,
            answeredStudents: 20,
            completionPercentage: 75,
          },
        ],
      };

      const result = transformActivityToTableItem(activity);
      expect(result.class).toBe('-');
      expect(result.school).toBe('Escola Exemplo');
      expect(result.year).toBe('2024');
    });

    it('should use first breakdown entry for school/year/class', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        breakdown: [
          {
            school: { id: 'school-1', name: 'Escola Exemplo' },
            schoolYear: { id: 'year-1', name: '2024' },
            class: { id: 'class-1', name: 'Turma A' },
            totalStudents: 30,
            answeredStudents: 20,
            completionPercentage: 75,
          },
          {
            school: { id: 'school-2', name: 'Outra Escola' },
            schoolYear: { id: 'year-2', name: '2025' },
            class: { id: 'class-2', name: 'Turma B' },
            totalStudents: 25,
            answeredStudents: 15,
            completionPercentage: 60,
          },
        ],
      };

      const result = transformActivityToTableItem(activity);
      expect(result.school).toBe('Escola Exemplo');
      expect(result.year).toBe('2024');
      expect(result.class).toBe('Turma A');
    });

    it('should map A_VENCER status to ATIVA', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        status: ActivityApiStatus.A_VENCER,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.status).toBe(ActivityDisplayStatus.ATIVA);
    });

    it('should map VENCIDA status to VENCIDA', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        status: ActivityApiStatus.VENCIDA,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.status).toBe(ActivityDisplayStatus.VENCIDA);
    });

    it('should map CONCLUIDA status to CONCLUÍDA', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        status: ActivityApiStatus.CONCLUIDA,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.status).toBe(ActivityDisplayStatus.CONCLUIDA);
    });

    it('should map creator name when creator is present', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        creator: { id: 'creator-1', name: 'Prof. João' },
      };

      const result = transformActivityToTableItem(activity);
      expect(result.creator).toBe('Prof. João');
    });

    it('should use "-" when creator is null', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        creator: null,
      };

      const result = transformActivityToTableItem(activity);
      expect(result.creator).toBe('-');
    });

    it('should use "-" when creator name is empty string', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        creator: { id: 'creator-1', name: '' },
      };

      const result = transformActivityToTableItem(activity);
      expect(result.creator).toBe('-');
    });

    it('should use "-" when creator name is whitespace only', () => {
      const activity: ActivityHistoryResponse = {
        ...baseActivity,
        creator: { id: 'creator-1', name: '   ' },
      };

      const result = transformActivityToTableItem(activity);
      expect(result.creator).toBe('-');
    });
  });

  describe('createUseActivitiesHistory', () => {
    const createMockApiClient = (): jest.Mocked<BaseApiClient> => ({
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    });

    const validApiResponse: ActivitiesHistoryApiResponse = {
      message: 'Success',
      data: {
        activities: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Activity',
            startDate: '2024-06-01',
            finalDate: '2024-12-31',
            status: ActivityApiStatus.A_VENCER,
            completionPercentage: 75,
            subject: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              name: 'Matemática',
              areaKnowledgeId: 'area-1',
            },
            creator: { id: 'creator-1', name: 'Prof. Maria' },
            breakdown: [
              {
                school: { id: 'school-1', name: 'Escola Exemplo' },
                schoolYear: { id: 'year-1', name: '2024' },
                class: { id: 'class-1', name: 'Turma A' },
                totalStudents: 30,
                answeredStudents: 20,
                completionPercentage: 75,
              },
            ],
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    };

    let mockApiClient: jest.Mocked<BaseApiClient>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockApiClient = createMockApiClient();
    });

    it('should return initial state', () => {
      const useActivitiesHistory = createUseActivitiesHistory(mockApiClient);
      const { result } = renderHook(() => useActivitiesHistory());

      expect(result.current.activities).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual(DEFAULT_ACTIVITIES_PAGINATION);
      expect(result.current.fetchActivities).toBeInstanceOf(Function);
    });

    it('should fetch activities successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: validApiResponse });

      const useActivitiesHistory = createUseActivitiesHistory(mockApiClient, {
        activityCategory: 'ATIVIDADE',
      });
      const { result } = renderHook(() => useActivitiesHistory());

      await act(async () => {
        await result.current.fetchActivities({ page: 1, limit: 10 });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activities/history', {
        params: expect.objectContaining({
          page: 1,
          limit: 10,
          type: 'ATIVIDADE',
        }),
      });
      expect(result.current.activities).toHaveLength(1);
      expect(result.current.activities[0].title).toBe('Test Activity');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: {
        data: ActivitiesHistoryApiResponse;
      }) => void;
      const promise = new Promise<{ data: ActivitiesHistoryApiResponse }>(
        (resolve) => {
          resolvePromise = resolve;
        }
      );

      mockApiClient.get.mockReturnValueOnce(promise);

      const useActivitiesHistory = createUseActivitiesHistory(mockApiClient);
      const { result } = renderHook(() => useActivitiesHistory());

      act(() => {
        result.current.fetchActivities();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolvePromise!({ data: validApiResponse });
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const useActivitiesHistory = createUseActivitiesHistory(mockApiClient);
      const { result } = renderHook(() => useActivitiesHistory());

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'Erro ao carregar histórico de atividades'
      );
      expect(result.current.activities).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('should clear error on new fetch', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      const useActivitiesHistory = createUseActivitiesHistory(mockApiClient);
      const { result } = renderHook(() => useActivitiesHistory());

      // First fetch - should fail
      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.error).toBe(
        'Erro ao carregar histórico de atividades'
      );

      // Second fetch - should clear error
      mockApiClient.get.mockResolvedValueOnce({ data: validApiResponse });

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(result.current.error).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should fetch activities without filters', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: validApiResponse });

      const useActivitiesHistory = createUseActivitiesHistory(mockApiClient);
      const { result } = renderHook(() => useActivitiesHistory());

      await act(async () => {
        await result.current.fetchActivities();
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activities/history', {
        params: {},
      });
      expect(result.current.activities).toHaveLength(1);
    });

    it('should pass activityCategory to API params', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: validApiResponse });

      const useActivitiesHistory = createUseActivitiesHistory(mockApiClient, {
        activityCategory: 'PROVA',
      });
      const { result } = renderHook(() => useActivitiesHistory());

      await act(async () => {
        await result.current.fetchActivities({ page: 1, limit: 10 });
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/activities/history', {
        params: expect.objectContaining({
          type: 'PROVA',
        }),
      });
    });
  });

  describe('createActivitiesHistoryHook', () => {
    it('should be an alias for createUseActivitiesHistory', () => {
      expect(createActivitiesHistoryHook).toBe(createUseActivitiesHistory);
    });

    it('should create a functional hook', () => {
      const mockApiClient: BaseApiClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            message: 'Success',
            data: {
              activities: [],
              pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
            },
          },
        }),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      };

      const useHook = createActivitiesHistoryHook(mockApiClient);
      const { result } = renderHook(() => useHook());

      expect(result.current.fetchActivities).toBeInstanceOf(Function);
      expect(result.current.activities).toEqual([]);
    });
  });
});

describe('buildActivityHistoryQueryParams', () => {
  it('adds type from activityCategory', () => {
    const params = buildActivityHistoryQueryParams({}, 'ATIVIDADE');
    expect(params.type).toBe('ATIVIDADE');
  });

  it('maps school[] to comma-separated schoolIds', () => {
    const params = buildActivityHistoryQueryParams({
      school: ['school-1', 'school-2'],
    });
    expect(params.schoolIds).toBe('school-1,school-2');
    expect(params.school).toBeUndefined();
  });

  it('maps class[] to classIds and schoolYear[] to schoolYearIds (CSV)', () => {
    const params = buildActivityHistoryQueryParams({
      class: ['c1', 'c2'],
      schoolYear: ['y1'],
    });
    expect(params.classIds).toBe('c1,c2');
    expect(params.schoolYearIds).toBe('y1');
  });

  it('collapses single-select filters to the first value', () => {
    const params = buildActivityHistoryQueryParams({
      status: ['A_VENCER', 'VENCIDA'],
      subject: ['subj-1', 'subj-2'],
      creatorType: ['own'],
    });
    expect(params.status).toBe('A_VENCER');
    expect(params.subjectId).toBe('subj-1');
    expect(params.creatorType).toBe('own');
    expect(params.subject).toBeUndefined();
  });

  it('forwards pagination, search and sorting untouched', () => {
    const params = buildActivityHistoryQueryParams({
      page: 2,
      limit: 20,
      search: 'prova',
      sortBy: 'finalDate',
      sortOrder: 'asc',
    });
    expect(params).toMatchObject({
      page: 2,
      limit: 20,
      search: 'prova',
      sortBy: 'finalDate',
      sortOrder: 'asc',
    });
  });

  it('omits empty filter arrays', () => {
    const params = buildActivityHistoryQueryParams({
      school: [],
      status: [],
      subject: [],
    });
    expect(params.schoolIds).toBeUndefined();
    expect(params.status).toBeUndefined();
    expect(params.subjectId).toBeUndefined();
  });

  it('honors legacy singular subjectId as a fallback', () => {
    const params = buildActivityHistoryQueryParams({ subjectId: 'subj-1' });
    expect(params.subjectId).toBe('subj-1');
  });

  it('honors legacy singular schoolId as a fallback', () => {
    const params = buildActivityHistoryQueryParams({ schoolId: 'school-1' });
    expect(params.schoolId).toBe('school-1');
    expect(params.schoolIds).toBeUndefined();
  });

  it('honors legacy singular classId as a fallback', () => {
    const params = buildActivityHistoryQueryParams({ classId: 'class-1' });
    expect(params.classId).toBe('class-1');
    expect(params.classIds).toBeUndefined();
  });

  it('prefers raw subject[] over legacy subjectId', () => {
    const params = buildActivityHistoryQueryParams({
      subject: ['a'],
      subjectId: 'b',
    });
    expect(params.subjectId).toBe('a');
  });

  it('prefers raw school[] over legacy schoolId', () => {
    const params = buildActivityHistoryQueryParams({
      school: ['a', 'b'],
      schoolId: 'c',
    });
    expect(params.schoolIds).toBe('a,b');
    expect(params.schoolId).toBeUndefined();
  });

  it('prefers raw class[] over legacy classId', () => {
    const params = buildActivityHistoryQueryParams({
      class: ['a', 'b'],
      classId: 'c',
    });
    expect(params.classIds).toBe('a,b');
    expect(params.classId).toBeUndefined();
  });

  it('accepts a bare-string status', () => {
    expect(buildActivityHistoryQueryParams({ status: 'A_VENCER' }).status).toBe(
      'A_VENCER'
    );
  });

  it('forwards startDate and finalDate', () => {
    const params = buildActivityHistoryQueryParams({
      startDate: '01/01/2026',
      finalDate: '31/01/2026',
    });
    expect(params.startDate).toBe('01/01/2026');
    expect(params.finalDate).toBe('31/01/2026');
  });
});
