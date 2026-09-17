import { renderHook, act, waitFor } from '@testing-library/react';
import {
  createUseLessonSearch,
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from './useLessonSearch';
import type { BaseApiClient } from '../types/api';

function makeApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<BaseApiClient>;
}

function searchResponse(ids: string[]) {
  return {
    data: {
      message: 'ok',
      data: {
        lessons: ids.map((id) => ({ lessonId: id })),
        pagination: {
          page: 1,
          limit: 20,
          total: ids.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    },
  };
}

describe('createUseLessonSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('queries the backend after the debounce window', async () => {
    const api = makeApi();
    api.get.mockResolvedValue(searchResponse(['l-1']));
    const { result } = renderHook(() => createUseLessonSearch(api)());

    act(() => result.current.search('equacao'));
    expect(api.get).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/knowledge/search', {
        params: { query: 'equacao' },
      })
    );
    await waitFor(() => expect(result.current.results).toHaveLength(1));
  });

  it('does not search below the minimum length', () => {
    const api = makeApi();
    const { result } = renderHook(() => createUseLessonSearch(api)());

    act(() => result.current.search('a'.repeat(MIN_SEARCH_LENGTH - 1)));
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2);
    });

    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.hasSearched).toBe(false);
  });

  it('scopes the search to the default subject', async () => {
    const api = makeApi();
    api.get.mockResolvedValue(searchResponse([]));
    const { result } = renderHook(() =>
      createUseLessonSearch(api)('subject-1')
    );

    act(() => result.current.search('equacao'));
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/knowledge/search', {
        params: { query: 'equacao', subjectId: 'subject-1' },
      })
    );
  });

  it('lets an explicit subject override the default', async () => {
    const api = makeApi();
    api.get.mockResolvedValue(searchResponse([]));
    const { result } = renderHook(() =>
      createUseLessonSearch(api)('subject-1')
    );

    act(() => result.current.search('equacao', 'subject-2'));
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/knowledge/search', {
        params: { query: 'equacao', subjectId: 'subject-2' },
      })
    );
  });

  it('only fires once for a burst of keystrokes', async () => {
    const api = makeApi();
    api.get.mockResolvedValue(searchResponse(['l-1']));
    const { result } = renderHook(() => createUseLessonSearch(api)());

    act(() => {
      result.current.search('equ');
      result.current.search('equa');
      result.current.search('equac');
    });
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    expect(api.get).toHaveBeenCalledWith('/knowledge/search', {
      params: { query: 'equac' },
    });
  });

  it('discards a slow response that a newer search superseded', async () => {
    const api = makeApi();
    let resolveFirst: (value: unknown) => void = () => {};
    api.get
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce(searchResponse(['newer']));

    const { result } = renderHook(() => createUseLessonSearch(api)());

    act(() => result.current.search('primeiro'));
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    act(() => result.current.search('segundo'));
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() => expect(result.current.results).toHaveLength(1));

    await act(async () => {
      resolveFirst(searchResponse(['older', 'older-2']));
    });

    // The stale first response must not overwrite the newer results.
    expect(result.current.results.map((r) => r.lessonId)).toEqual(['newer']);
  });

  it('surfaces the API message on failure', async () => {
    const api = makeApi();
    api.get.mockRejectedValue({
      response: { data: { message: 'Busca indisponível' } },
    });
    const { result } = renderHook(() => createUseLessonSearch(api)());

    act(() => result.current.search('equacao'));
    await act(async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() => expect(result.current.error).toBe('Busca indisponível'));
    expect(result.current.results).toEqual([]);
  });

  it('falls back to a generic error message', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => createUseLessonSearch(api)());

    act(() => result.current.search('equacao'));
    await act(async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() =>
      expect(result.current.error).toBe('Erro ao buscar aulas')
    );
  });

  it('clear() cancels a pending search and empties the results', async () => {
    const api = makeApi();
    api.get.mockResolvedValue(searchResponse(['l-1']));
    const { result } = renderHook(() => createUseLessonSearch(api)());

    act(() => result.current.search('equacao'));
    act(() => result.current.clear());
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2);
    });

    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
    expect(result.current.hasSearched).toBe(false);
  });

  it('cancels a pending debounce on unmount', () => {
    const api = makeApi();
    const { result, unmount } = renderHook(() => createUseLessonSearch(api)());

    act(() => result.current.search('equacao'));
    unmount();
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS * 2);
    });

    expect(api.get).not.toHaveBeenCalled();
  });
});
