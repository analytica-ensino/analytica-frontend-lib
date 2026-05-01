import { act, renderHook } from '@testing-library/react';
import { useSimulatedStudentDetails } from './useSimulatedStudentDetails';
import type {
  StudentDetailsApiResponse,
  StudentSubjectsData,
  StudentContentsData,
} from './types';
import { SimulatedPerformanceTag } from './types';
import type { BaseApiClient } from '../../types/api';

function createMockApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

function createSubjectsData(): StudentSubjectsData {
  return {
    student: {
      studentId: 'student-1',
      institutionId: 'inst-1',
      name: 'Maria Silva',
      school: 'Escola A',
      schoolYear: '3 ano',
      class: 'A',
      average: 74,
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    },
    subjects: [
      {
        id: 'subject-1',
        name: 'Matematica',
        color: '#0EA5E9',
        icon: null,
        questionsCount: 10,
        performance: { correct: 7, incorrect: 3, correctPercentage: 70 },
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  };
}

function createContentsData(): StudentContentsData {
  return {
    student: {
      studentId: 'student-1',
      institutionId: 'inst-1',
      name: 'Maria Silva',
      school: 'Escola A',
      schoolYear: '3 ano',
      class: 'A',
      average: 74,
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    },
    subject: {
      id: 'subject-1',
      name: 'Matematica',
    },
    contents: [
      {
        contentId: 'content-1',
        contentName: 'Geometria',
        bnccCode: 'EM13MAT301',
        questionsCount: 5,
        performance: { correct: 3, incorrect: 2, correctPercentage: 60 },
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  };
}

describe('useSimulatedStudentDetails', () => {
  it('starts with initial state', () => {
    const api = createMockApi();
    const { result } = renderHook(() => useSimulatedStudentDetails(api));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fetchDetails).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('calls activities endpoint for enem-1 with query params', async () => {
    const api = createMockApi();
    const response: StudentDetailsApiResponse = {
      message: 'ok',
      data: createSubjectsData(),
    };
    api.post.mockResolvedValueOnce({ data: response });

    const { result } = renderHook(() => useSimulatedStudentDetails(api));

    await act(async () => {
      await result.current.fetchDetails({
        simulationType: 'enem-1',
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
      });
    });

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/student-details?types=SIMULADO',
      {
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
        subjectId: undefined,
        page: 1,
        limit: 20,
      }
    );
    expect(result.current.data).toEqual(response.data);
    expect(result.current.error).toBeNull();
  });

  it('calls activities endpoint for enem-2 and passes subject/page/limit', async () => {
    const api = createMockApi();
    const response: StudentDetailsApiResponse = {
      message: 'ok',
      data: createContentsData(),
    };
    api.post.mockResolvedValueOnce({ data: response });

    const { result } = renderHook(() => useSimulatedStudentDetails(api));

    await act(async () => {
      await result.current.fetchDetails({
        simulationType: 'enem-2',
        userInstitutionId: 'user-inst-1',
        period: '3_MONTHS',
        subjectId: 'subject-1',
        page: 2,
        limit: 15,
      });
    });

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulated/activities/student-details?types=SIMULADO',
      {
        userInstitutionId: 'user-inst-1',
        period: '3_MONTHS',
        subjectId: 'subject-1',
        page: 2,
        limit: 15,
      }
    );
  });

  it('calls essays endpoint for essays simulation type', async () => {
    const api = createMockApi();
    const response: StudentDetailsApiResponse = {
      message: 'ok',
      data: createSubjectsData(),
    };
    api.post.mockResolvedValueOnce({ data: response });

    const { result } = renderHook(() => useSimulatedStudentDetails(api));

    await act(async () => {
      await result.current.fetchDetails({
        simulationType: 'essays',
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
      });
    });

    expect(api.post).toHaveBeenCalledWith(
      '/performance/simulated/essays/student-details',
      expect.any(Object)
    );
  });

  it('sets friendly error when request fails with non-Error throw', async () => {
    const api = createMockApi();
    api.post.mockRejectedValueOnce('network error');

    const { result } = renderHook(() => useSimulatedStudentDetails(api));

    await act(async () => {
      await result.current.fetchDetails({
        simulationType: 'enem-1',
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.error).toBe(
      'Não foi possível carregar os detalhes do estudante'
    );
    expect(result.current.loading).toBe(false);
  });

  it('reset clears data, loading and error', async () => {
    const api = createMockApi();
    api.post.mockRejectedValueOnce(new Error('Erro customizado'));

    const { result } = renderHook(() => useSimulatedStudentDetails(api));

    await act(async () => {
      await result.current.fetchDetails({
        simulationType: 'enem-1',
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
      });
    });

    expect(result.current.error).toBe('Erro customizado');

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
