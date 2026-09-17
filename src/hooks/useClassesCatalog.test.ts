import { renderHook, act } from '@testing-library/react';
import { createUseClassesCatalog } from './useClassesCatalog';
import type { BaseApiClient } from '../types/api';
import type { KnowledgeArea } from '../types/lessonsCatalog';

function makeApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

const AREAS: KnowledgeArea[] = [
  {
    id: 'area-1',
    name: 'Ciências da Natureza',
    subjects: [
      {
        id: 's-1',
        name: 'Biologia',
        color: '#0f0',
        icon: 'Dna',
        progress: { totalLessons: 10, completedLessons: 5, percentage: 50 },
      },
      { id: 's-2', name: 'Física', color: '#00f', icon: 'Atom' },
    ],
  },
  {
    id: 'area-2',
    name: 'Matemática',
    subjects: [{ id: 's-3', name: 'Álgebra', color: '#f00', icon: 'Plus' }],
  },
];

describe('createUseClassesCatalog', () => {
  it('loads the knowledge areas', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({ data: { message: 'ok', data: AREAS } });
    const { result } = renderHook(() => createUseClassesCatalog(api)());

    await act(async () => {
      await result.current.getKnowledgeAreas();
    });

    expect(api.get).toHaveBeenCalledWith('/knowledge');
    expect(result.current.knowledgeAreas).toHaveLength(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('accepts subjects without progress', async () => {
    const api = makeApi();
    api.get.mockResolvedValue({ data: { message: 'ok', data: AREAS } });
    const { result } = renderHook(() => createUseClassesCatalog(api)());

    await act(async () => {
      await result.current.getKnowledgeAreas();
    });

    // Teachers and managers get the matrix without any progress field.
    expect(result.current.knowledgeAreas[0].subjects[1].progress).toBeUndefined();
  });

  it('exposes the error message on failure', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('403'));
    const { result } = renderHook(() => createUseClassesCatalog(api)());

    await act(async () => {
      await result.current.getKnowledgeAreas();
    });

    expect(result.current.error).toBe('403');
    expect(result.current.loading).toBe(false);
  });

  it('falls back to a generic message for a non-Error rejection', async () => {
    const api = makeApi();
    api.get.mockRejectedValue('nope');
    const { result } = renderHook(() => createUseClassesCatalog(api)());

    await act(async () => {
      await result.current.getKnowledgeAreas();
    });

    expect(result.current.error).toBe('Ocorreu um erro inesperado');
  });

  describe('searchSubjects', () => {
    it('matches across areas, case-insensitively', async () => {
      const api = makeApi();
      api.get.mockResolvedValue({ data: { message: 'ok', data: AREAS } });
      const { result } = renderHook(() => createUseClassesCatalog(api)());

      await act(async () => {
        await result.current.getKnowledgeAreas();
      });

      expect(result.current.searchSubjects('bio').map((s) => s.id)).toEqual([
        's-1',
      ]);
      expect(result.current.searchSubjects('A').length).toBeGreaterThan(1);
    });

    it('returns nothing for a blank term', () => {
      const api = makeApi();
      const { result } = renderHook(() => createUseClassesCatalog(api)());

      expect(result.current.searchSubjects('   ')).toEqual([]);
    });
  });

  it('clears the error and resets the state', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => createUseClassesCatalog(api)());

    await act(async () => {
      await result.current.getKnowledgeAreas();
    });
    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();

    act(() => result.current.resetState());
    expect(result.current.knowledgeAreas).toEqual([]);
  });
});
