import { renderHook, waitFor } from '@testing-library/react';
import { useSentLessonIds } from './useSentLessonIds';
import type { BaseApiClient } from '../types/api';

const createApiClient = (get: BaseApiClient['get']): BaseApiClient =>
  ({
    get,
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }) as unknown as BaseApiClient;

describe('useSentLessonIds', () => {
  it('should start with an empty set before the request resolves', () => {
    const get = jest.fn().mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useSentLessonIds(createApiClient(get)));

    expect(result.current.size).toBe(0);
  });

  it('should expose the question ids returned by the API', async () => {
    const get = jest.fn().mockResolvedValue({
      data: {
        message: 'Aulas já enviadas obtidas com sucesso',
        data: { lessonIds: ['lesson-1', 'lesson-2'] },
      },
    });

    const { result } = renderHook(() => useSentLessonIds(createApiClient(get)));

    await waitFor(() => expect(result.current.size).toBe(2));

    expect(get).toHaveBeenCalledWith('/recommended-class/my-sent-lesson-ids');
    expect(result.current.has('lesson-1')).toBe(true);
    expect(result.current.has('lesson-2')).toBe(true);
    expect(result.current.has('lesson-3')).toBe(false);
  });

  it('should keep an empty set when the payload has no lesson ids', async () => {
    const get = jest.fn().mockResolvedValue({ data: { message: 'ok' } });

    const { result } = renderHook(() => useSentLessonIds(createApiClient(get)));

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));

    expect(result.current.size).toBe(0);
  });

  it('should keep an empty set when the request fails', async () => {
    const get = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSentLessonIds(createApiClient(get)));

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));

    expect(result.current.size).toBe(0);
  });

  it('should fetch only once across rerenders', async () => {
    const get = jest.fn().mockResolvedValue({
      data: { message: 'ok', data: { lessonIds: ['lesson-1'] } },
    });
    const apiClient = createApiClient(get);

    const { result, rerender } = renderHook(() => useSentLessonIds(apiClient));

    await waitFor(() => expect(result.current.size).toBe(1));

    rerender();
    rerender();

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('should not update the state after unmount', async () => {
    let resolveRequest: (value: unknown) => void = () => {};
    const get = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const { result, unmount } = renderHook(() =>
      useSentLessonIds(createApiClient(get))
    );

    unmount();
    resolveRequest({
      data: { message: 'ok', data: { lessonIds: ['lesson-1'] } },
    });

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));

    expect(result.current.size).toBe(0);
  });
});
