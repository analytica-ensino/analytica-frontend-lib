import { renderHook, waitFor } from '@testing-library/react';
import { useSentQuestionIds } from './useSentQuestionIds';
import type { BaseApiClient } from '../types/api';

const createApiClient = (get: BaseApiClient['get']): BaseApiClient =>
  ({
    get,
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }) as unknown as BaseApiClient;

describe('useSentQuestionIds', () => {
  it('should start with an empty set before the request resolves', () => {
    const get = jest.fn().mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      useSentQuestionIds(createApiClient(get))
    );

    expect(result.current.size).toBe(0);
  });

  it('should expose the question ids returned by the API', async () => {
    const get = jest.fn().mockResolvedValue({
      data: {
        message: 'Questões já enviadas obtidas com sucesso',
        data: { questionIds: ['question-1', 'question-2'] },
      },
    });

    const { result } = renderHook(() =>
      useSentQuestionIds(createApiClient(get))
    );

    await waitFor(() => expect(result.current.size).toBe(2));

    expect(get).toHaveBeenCalledWith('/activities/my-sent-question-ids');
    expect(result.current.has('question-1')).toBe(true);
    expect(result.current.has('question-2')).toBe(true);
    expect(result.current.has('question-3')).toBe(false);
  });

  it('should keep an empty set when the payload has no question ids', async () => {
    const get = jest.fn().mockResolvedValue({ data: { message: 'ok' } });

    const { result } = renderHook(() =>
      useSentQuestionIds(createApiClient(get))
    );

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));

    expect(result.current.size).toBe(0);
  });

  it('should keep an empty set when the request fails', async () => {
    const get = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useSentQuestionIds(createApiClient(get))
    );

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));

    expect(result.current.size).toBe(0);
  });

  it('should fetch only once across rerenders', async () => {
    const get = jest.fn().mockResolvedValue({
      data: { message: 'ok', data: { questionIds: ['question-1'] } },
    });
    const apiClient = createApiClient(get);

    const { result, rerender } = renderHook(() =>
      useSentQuestionIds(apiClient)
    );

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
      useSentQuestionIds(createApiClient(get))
    );

    unmount();
    resolveRequest({
      data: { message: 'ok', data: { questionIds: ['question-1'] } },
    });

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));

    expect(result.current.size).toBe(0);
  });

  it('should keep using the client captured at mount when the prop changes', async () => {
    const initialGet = jest.fn().mockResolvedValue({
      data: { message: 'ok', data: { questionIds: ['question-1'] } },
    });
    const laterGet = jest.fn();

    const { result, rerender } = renderHook(
      ({ client }) => useSentQuestionIds(client),
      { initialProps: { client: createApiClient(initialGet) } }
    );

    await waitFor(() => expect(result.current.size).toBe(1));

    rerender({ client: createApiClient(laterGet) });

    expect(initialGet).toHaveBeenCalledTimes(1);
    expect(laterGet).not.toHaveBeenCalled();
    expect(result.current.has('question-1')).toBe(true);
  });
});
