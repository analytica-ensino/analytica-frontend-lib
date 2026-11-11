import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createUseLessonPlayback,
  PLAYBACK_SYNC_INTERVAL_MS,
  resumeSecondsFor,
} from './useLessonPlayback';
import { useAuthStore } from '../store/authStore';
import type { BaseApiClient } from '../types/api';

const API_URL = 'https://api.test';

function makeApi(
  point: { positionSeconds: number; durationSeconds: number } | null = null
) {
  return {
    get: jest.fn().mockResolvedValue({
      data: {
        success: true,
        message: 'ok',
        data: point && { lessonId: 'lesson-1', ...point },
      },
    }),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn().mockResolvedValue({ data: { success: true } }),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Required<BaseApiClient>>;
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
}

describe('resumeSecondsFor', () => {
  it.each([
    { label: 'no saved point', point: null, expected: 0 },
    {
      label: 'a point mid-video',
      point: { positionSeconds: 120, durationSeconds: 600 },
      expected: 120,
    },
    {
      label: 'a point at 95%',
      point: { positionSeconds: 570, durationSeconds: 600 },
      expected: 0,
    },
    {
      label: 'a point at the end',
      point: { positionSeconds: 600, durationSeconds: 600 },
      expected: 0,
    },
    {
      label: 'a point just under 95%',
      point: { positionSeconds: 569, durationSeconds: 600 },
      expected: 569,
    },
  ])('resumes $label at $expected', ({ point, expected }) => {
    expect(resumeSecondsFor(point)).toBe(expected);
  });
});

describe('createUseLessonPlayback', () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true });

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock.mockClear();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    setVisibility('visible');
    useAuthStore.setState({
      tokens: { token: 'token-1', refreshToken: 'refresh-1' },
    } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const render = (
    api: ReturnType<typeof makeApi>,
    options: {
      lessonId?: string;
      mode?: 'student' | 'preview';
      apiUrl?: string;
    } = {}
  ) => {
    const { lessonId = 'lesson-1', mode = 'student' } = options;
    // `in`, not a default value: `{ apiUrl: undefined }` must reach the hook
    // as "no base URL wired", not fall back to API_URL.
    const apiUrl = 'apiUrl' in options ? options.apiUrl : API_URL;
    const useLessonPlayback = createUseLessonPlayback(api, mode);
    return renderHook(
      ({ id }: { id: string }) => useLessonPlayback(id, { apiUrl }),
      { initialProps: { id: lessonId } }
    );
  };

  it('reads the saved point and resumes from it', async () => {
    const api = makeApi({ positionSeconds: 120, durationSeconds: 600 });
    const { result } = render(api);

    expect(result.current.resumeAt).toBeNull();
    await waitFor(() => expect(result.current.resumeAt).toBe(120));
    expect(api.get).toHaveBeenCalledWith('/lesson/lesson-1/playback');
  });

  it('starts from 0 when the read fails', async () => {
    const api = makeApi();
    api.get.mockRejectedValue(new Error('offline'));
    const { result } = render(api);

    await waitFor(() => expect(result.current.resumeAt).toBe(0));
  });

  it('saves every minute while the position moves, never the same one twice', async () => {
    const api = makeApi();
    const { result } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));

    act(() => result.current.handleTimeUpdate(30.7, 600.4));
    await act(async () => {
      jest.advanceTimersByTime(PLAYBACK_SYNC_INTERVAL_MS);
    });
    expect(api.put).toHaveBeenCalledTimes(1);
    expect(api.put).toHaveBeenCalledWith('/lesson/lesson-1/playback', {
      positionSeconds: 30,
      durationSeconds: 600,
    });

    // Paused: the position does not move, so nothing new is sent
    await act(async () => {
      jest.advanceTimersByTime(PLAYBACK_SYNC_INTERVAL_MS);
    });
    expect(api.put).toHaveBeenCalledTimes(1);

    act(() => result.current.handleTimeUpdate(91, 600));
    await act(async () => {
      jest.advanceTimersByTime(PLAYBACK_SYNC_INTERVAL_MS);
    });
    expect(api.put).toHaveBeenCalledTimes(2);
    expect(api.put).toHaveBeenLastCalledWith('/lesson/lesson-1/playback', {
      positionSeconds: 91,
      durationSeconds: 600,
    });
  });

  it('does not send before the player knows the duration', async () => {
    const api = makeApi();
    const { result } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));

    act(() => result.current.handleTimeUpdate(12));
    await act(async () => {
      jest.advanceTimersByTime(PLAYBACK_SYNC_INTERVAL_MS);
    });

    expect(api.put).not.toHaveBeenCalled();
  });

  it('saves right away when the video pauses', async () => {
    const api = makeApi();
    const { result } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));

    await act(async () => result.current.handlePause(45, 600));

    expect(api.put).toHaveBeenCalledWith('/lesson/lesson-1/playback', {
      positionSeconds: 45,
      durationSeconds: 600,
    });
  });

  it('keeps the position within the duration the API accepts', async () => {
    const api = makeApi();
    const { result } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));

    await act(async () => result.current.handlePause(600.9, 600.2));

    expect(api.put).toHaveBeenCalledWith('/lesson/lesson-1/playback', {
      positionSeconds: 600,
      durationSeconds: 600,
    });
  });

  it('saves when the tab is hidden', async () => {
    const api = makeApi();
    const { result } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));
    act(() => result.current.handleTimeUpdate(70, 600));

    setVisibility('hidden');
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(api.put).toHaveBeenCalledWith('/lesson/lesson-1/playback', {
      positionSeconds: 70,
      durationSeconds: 600,
    });
  });

  it('saves through fetch with keepalive when the tab closes', async () => {
    const api = makeApi();
    const { result } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));
    act(() => result.current.handleTimeUpdate(80, 600));

    act(() => {
      globalThis.dispatchEvent(new Event('pagehide'));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/lesson/lesson-1/playback`,
      {
        method: 'PUT',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: 'Bearer token-1',
        },
        body: JSON.stringify({ positionSeconds: 80, durationSeconds: 600 }),
      }
    );
    expect(api.put).not.toHaveBeenCalled();
  });

  it('skips only the save on closing the tab without an API URL', async () => {
    const api = makeApi();
    const { result } = render(api, { apiUrl: undefined });
    await waitFor(() => expect(result.current.resumeAt).toBe(0));
    act(() => result.current.handleTimeUpdate(80, 600));

    act(() => {
      globalThis.dispatchEvent(new Event('pagehide'));
    });
    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => result.current.handlePause(80, 600));
    expect(api.put).toHaveBeenCalledTimes(1);
  });

  it('closes the tab against the page origin when the client has no base URL', async () => {
    const api = makeApi();
    const { result } = render(api, { apiUrl: '' });
    await waitFor(() => expect(result.current.resumeAt).toBe(0));
    act(() => result.current.handleTimeUpdate(80, 600));

    act(() => {
      globalThis.dispatchEvent(new Event('pagehide'));
    });

    expect(fetchMock).toHaveBeenCalledWith('/lesson/lesson-1/playback', {
      method: 'PUT',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: 'Bearer token-1',
      },
      body: JSON.stringify({ positionSeconds: 80, durationSeconds: 600 }),
    });
  });

  it('saves the lesson being left when the student switches lessons', async () => {
    const api = makeApi();
    const { result, rerender } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));
    act(() => result.current.handleTimeUpdate(200, 600));

    await act(async () => rerender({ id: 'lesson-2' }));

    expect(api.put).toHaveBeenCalledWith('/lesson/lesson-1/playback', {
      positionSeconds: 200,
      durationSeconds: 600,
    });
    expect(api.get).toHaveBeenCalledWith('/lesson/lesson-2/playback');
  });

  it('holds the start position of a new lesson until its own point arrives', async () => {
    const api = makeApi({ positionSeconds: 120, durationSeconds: 600 });
    const { result, rerender } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(120));

    api.get.mockReturnValue(new Promise(() => {}));
    rerender({ id: 'lesson-2' });

    expect(result.current.resumeAt).toBeNull();
  });

  it('saves when the page unmounts', async () => {
    const api = makeApi();
    const { result, unmount } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));
    act(() => result.current.handleTimeUpdate(150, 600));

    await act(async () => unmount());

    expect(api.put).toHaveBeenCalledWith('/lesson/lesson-1/playback', {
      positionSeconds: 150,
      durationSeconds: 600,
    });
  });

  it('swallows a failed save and sends the position again next time', async () => {
    const api = makeApi();
    api.put.mockRejectedValueOnce(new Error('offline'));
    const { result } = render(api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));

    await act(async () => result.current.handlePause(45, 600));
    await act(async () => result.current.handlePause(45, 600));

    expect(api.put).toHaveBeenCalledTimes(2);
  });

  it('reads and sends nothing in preview', async () => {
    const api = makeApi({ positionSeconds: 120, durationSeconds: 600 });
    const { result, unmount } = render(api, { mode: 'preview' });

    expect(result.current.resumeAt).toBe(0);
    act(() => result.current.handleTimeUpdate(80, 600));
    await act(async () => result.current.handlePause(80, 600));
    setVisibility('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      globalThis.dispatchEvent(new Event('pagehide'));
    });
    await act(async () => {
      jest.advanceTimersByTime(PLAYBACK_SYNC_INTERVAL_MS);
    });
    unmount();

    expect(api.get).not.toHaveBeenCalled();
    expect(api.put).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does nothing when the client has no put', async () => {
    const api = makeApi();
    const { put, ...withoutPut } = api;
    const { result } = render(withoutPut as typeof api);
    await waitFor(() => expect(result.current.resumeAt).toBe(0));

    await act(async () => result.current.handlePause(45, 600));

    expect(put).not.toHaveBeenCalled();
  });
});
