import { act, renderHook, waitFor } from '@testing-library/react';
import type { BaseApiClient } from '../../types/api';
import { useEbookReadingRequest } from './useEbookReadingRequest';

/** A request the test answers when it wants. */
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/** An API client whose `post` the test controls. */
const createApi = (post: jest.Mock): BaseApiClient => ({
  get: jest.fn(),
  post,
  patch: jest.fn(),
  delete: jest.fn(),
});

/** The client's answer to a report route: the body, under `data`. */
const answer = <T,>(data: T) => ({ data: { message: 'ok', data } });

describe('useEbookReadingRequest', () => {
  it('posts the body and keeps the answer', async () => {
    const post = jest.fn().mockResolvedValue(answer({ readers: 4 }));
    const api = createApi(post);
    const { result } = renderHook(() =>
      useEbookReadingRequest(api, '/route', { period: '7_DAYS' })
    );

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ readers: 4 }));
    expect(post).toHaveBeenCalledWith('/route', { period: '7_DAYS' });
    expect(result.current).toMatchObject({ loading: false, error: false });
  });

  it('asks through the given loader', async () => {
    const post = jest.fn();
    const api = createApi(post);
    const load = jest.fn().mockResolvedValue([{ id: 'PR:Curitiba' }]);
    const { result } = renderHook(() =>
      useEbookReadingRequest(api, '/route', { period: '7_DAYS' }, load)
    );

    await waitFor(() =>
      expect(result.current.data).toEqual([{ id: 'PR:Curitiba' }])
    );
    expect(load).toHaveBeenCalledWith(api, '/route', { period: '7_DAYS' });
    expect(post).not.toHaveBeenCalled();
  });

  it('asks nothing without a body', () => {
    const post = jest.fn();
    const api = createApi(post);
    const { result } = renderHook(() =>
      useEbookReadingRequest(api, '/route', null)
    );

    expect(post).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      data: null,
      loading: false,
      error: false,
    });
  });

  it('does not ask again for a new object with the same filters', async () => {
    const post = jest.fn().mockResolvedValue(answer(1));
    const api = createApi(post);
    const { rerender } = renderHook(
      ({ body }) => useEbookReadingRequest(api, '/route', body),
      { initialProps: { body: { period: '7_DAYS' } } }
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));

    rerender({ body: { period: '7_DAYS' } });

    expect(post).toHaveBeenCalledTimes(1);
  });

  it('keeps only the answer to the latest request', async () => {
    const first = deferred<unknown>();
    const second = deferred<unknown>();
    const post = jest
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const api = createApi(post);
    const { result, rerender } = renderHook(
      ({ body }) => useEbookReadingRequest<string>(api, '/route', body),
      { initialProps: { body: { period: '7_DAYS' } } }
    );

    rerender({ body: { period: '1_YEAR' } });
    await act(async () => {
      second.resolve(answer('year'));
      first.resolve(answer('week'));
    });

    expect(result.current.data).toBe('year');
  });

  it('ignores the failure of a request that is no longer the latest', async () => {
    const first = deferred<unknown>();
    const post = jest
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(answer('year'));
    const api = createApi(post);
    const { result, rerender } = renderHook(
      ({ body }) => useEbookReadingRequest<string>(api, '/route', body),
      { initialProps: { body: { period: '7_DAYS' } } }
    );

    rerender({ body: { period: '1_YEAR' } });
    await waitFor(() => expect(result.current.data).toBe('year'));
    await act(async () => first.reject(new Error('late')));

    expect(result.current.error).toBe(false);
  });

  it('reports a failure and asks again on retry', async () => {
    const post = jest
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce(answer('ok'));
    const api = createApi(post);
    const { result } = renderHook(() =>
      useEbookReadingRequest<string>(api, '/route', { a: 1 })
    );
    await waitFor(() => expect(result.current.error).toBe(true));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.data).toBe('ok'));
    expect(result.current.error).toBe(false);
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('clears the answer when the body goes away', async () => {
    const post = jest.fn().mockResolvedValue(answer('student'));
    const api = createApi(post);
    const { result, rerender } = renderHook(
      ({ body }: { body: object | null }) =>
        useEbookReadingRequest<string>(api, '/route', body),
      { initialProps: { body: { id: 'a' } as object | null } }
    );
    await waitFor(() => expect(result.current.data).toBe('student'));

    rerender({ body: null });

    expect(result.current.data).toBeNull();
  });
});
