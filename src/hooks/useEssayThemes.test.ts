import { renderHook, act, waitFor } from '@testing-library/react';
import { createUseEssayThemes } from './useEssayThemes';
import type { BaseApiClient } from '../types/api';

const themesResponse = {
  data: {
    message: 'ok',
    data: {
      themes: [
        {
          id: 'theme-1',
          title: 'Cidadania digital na era da informação',
          description: null,
          supportingTexts: [],
          isActive: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 4, totalPages: 1 },
    },
  },
};

const makeApi = (get: jest.Mock): BaseApiClient =>
  ({ get }) as unknown as BaseApiClient;

describe('useEssayThemes', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('starts empty and not loading', () => {
    const useEssayThemes = createUseEssayThemes(makeApi(jest.fn()));
    const { result } = renderHook(() => useEssayThemes());

    expect(result.current.themes).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.total).toBe(0);
  });

  it('reads the theme bank and exposes pagination', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse);
    const useEssayThemes = createUseEssayThemes(makeApi(get));
    const { result } = renderHook(() => useEssayThemes());

    await act(async () => {
      await result.current.fetchThemes();
    });

    expect(get).toHaveBeenCalledWith('/essays/themes', { params: {} });
    expect(result.current.themes).toHaveLength(1);
    expect(result.current.pagination.total).toBe(4);
    expect(result.current.loading).toBe(false);
  });

  it('forwards pagination and search', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse);
    const useEssayThemes = createUseEssayThemes(makeApi(get));
    const { result } = renderHook(() => useEssayThemes());

    await act(async () => {
      await result.current.fetchThemes({
        page: 2,
        limit: 20,
        search: 'cidadania',
      });
    });

    expect(get).toHaveBeenCalledWith('/essays/themes', {
      params: { page: 2, limit: 20, search: 'cidadania' },
    });
  });

  it('omits an empty search, which the backend rejects', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse);
    const useEssayThemes = createUseEssayThemes(makeApi(get));
    const { result } = renderHook(() => useEssayThemes());

    await act(async () => {
      await result.current.fetchThemes({ page: 1, limit: 20, search: '   ' });
    });

    expect(get).toHaveBeenCalledWith('/essays/themes', {
      params: { page: 1, limit: 20 },
    });
  });

  it('drops a slower earlier response so it cannot overwrite the newer list', async () => {
    let resolveFirst: (value: unknown) => void = () => {};
    const first = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const second = {
      data: {
        message: 'ok',
        data: {
          themes: [{ ...themesResponse.data.data.themes[0], id: 'theme-2' }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      },
    };

    const get = jest
      .fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(second);
    const useEssayThemes = createUseEssayThemes(makeApi(get));
    const { result } = renderHook(() => useEssayThemes());

    await act(async () => {
      const stale = result.current.fetchThemes({ search: 'a' });
      await result.current.fetchThemes({ search: 'ab' });
      resolveFirst(themesResponse);
      await stale;
    });

    // The newer search wins even though the older request resolved last.
    expect(result.current.themes[0].id).toBe('theme-2');
  });

  it('surfaces an error message when the request fails', async () => {
    const get = jest.fn().mockRejectedValue(new Error('403'));
    const useEssayThemes = createUseEssayThemes(makeApi(get));
    const { result } = renderHook(() => useEssayThemes());

    await act(async () => {
      await result.current.fetchThemes();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Erro ao carregar temas de redação');
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.themes).toEqual([]);
  });
});
