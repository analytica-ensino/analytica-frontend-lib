import { act, renderHook } from '@testing-library/react';
import { useSimulatedSubjects } from './useSimulatedSubjects';
import type {
  SimulatedSubjectItem,
  SimulatedSubjectsApiClient,
  SimulatedSubjectsApiResponse,
} from './types';

function createMockApi(): jest.Mocked<SimulatedSubjectsApiClient> {
  return {
    get: jest.fn(),
  };
}

function createMockSubjects(): SimulatedSubjectItem[] {
  return [
    { id: 'math', name: 'Matematica', color: '#22C55E', icon: 'calculator' },
    { id: 'lang', name: 'Linguagens', color: '#3B82F6', icon: 'book-open' },
  ];
}

describe('useSimulatedSubjects', () => {
  it('starts with initial state', () => {
    const api = createMockApi();
    const { result } = renderHook(() => useSimulatedSubjects(api));

    expect(result.current.subjects).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches subjects without areaKnowledgeId', async () => {
    const api = createMockApi();
    const response: SimulatedSubjectsApiResponse = {
      message: 'ok',
      data: createMockSubjects(),
    };
    api.get.mockResolvedValueOnce({ data: response });

    const { result } = renderHook(() => useSimulatedSubjects(api));

    await act(async () => {
      await result.current.fetchSubjects();
    });

    expect(api.get).toHaveBeenCalledWith('/performance/simulated/subjects');
    expect(result.current.subjects).toEqual(response.data);
    expect(result.current.error).toBeNull();
  });

  it('fetches subjects filtered by areaKnowledgeId', async () => {
    const api = createMockApi();
    api.get.mockResolvedValueOnce({
      data: { message: 'ok', data: createMockSubjects() },
    });

    const { result } = renderHook(() => useSimulatedSubjects(api));

    await act(async () => {
      await result.current.fetchSubjects('area-1');
    });

    expect(api.get).toHaveBeenCalledWith(
      '/performance/simulated/subjects?areaKnowledgeId=area-1'
    );
  });

  it('sets friendly error for non-Error throws', async () => {
    const api = createMockApi();
    api.get.mockRejectedValueOnce('network fail');

    const { result } = renderHook(() => useSimulatedSubjects(api));

    await act(async () => {
      await result.current.fetchSubjects();
    });

    expect(result.current.error).toBe('Erro ao carregar disciplinas');
    expect(result.current.subjects).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('reset restores initial state', async () => {
    const api = createMockApi();
    api.get.mockResolvedValueOnce({
      data: { message: 'ok', data: createMockSubjects() },
    });

    const { result } = renderHook(() => useSimulatedSubjects(api));

    await act(async () => {
      await result.current.fetchSubjects();
    });
    expect(result.current.subjects.length).toBeGreaterThan(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.subjects).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
