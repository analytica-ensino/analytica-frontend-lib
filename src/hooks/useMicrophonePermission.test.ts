import { renderHook, act, waitFor } from '@testing-library/react';
import { useMicrophonePermission } from './useMicrophonePermission';

/**
 * Minimal shape of a PermissionStatus we control in tests: exposes `state` and a
 * settable `onchange` so we can simulate the browser flipping the permission.
 */
interface MockPermissionStatus {
  state: string;
  onchange: (() => void) | null;
}

const createPermissionStatus = (state: string): MockPermissionStatus => ({
  state,
  onchange: null,
});

/**
 * Fake MediaStream whose tracks record `stop()` calls — the hook is expected to
 * stop every track right after obtaining the permission.
 */
const createMockStream = () => {
  const track = { stop: jest.fn() };
  return {
    stream: { getTracks: jest.fn(() => [track]) },
    track,
  };
};

/**
 * Deferred promise so a test can keep `permissions.query` pending (to observe
 * the initial `checking` state) and resolve/reject it on demand.
 */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Install `navigator.mediaDevices` / `navigator.permissions`. jsdom implements
 * neither, so we define them per-test and restore the originals afterwards.
 * Passing `undefined` simulates a browser that lacks the API.
 */
const setMediaDevices = (value: unknown) => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    writable: true,
    value,
  });
};

const setPermissions = (value: unknown) => {
  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    writable: true,
    value,
  });
};

const originalMediaDevices = Object.getOwnPropertyDescriptor(
  navigator,
  'mediaDevices'
);
const originalPermissions = Object.getOwnPropertyDescriptor(
  navigator,
  'permissions'
);

const restoreNavigator = (
  key: 'mediaDevices' | 'permissions',
  original: PropertyDescriptor | undefined
) => {
  if (original) {
    Object.defineProperty(navigator, key, original);
  } else {
    Object.defineProperty(navigator, key, {
      configurable: true,
      writable: true,
      value: undefined,
    });
  }
};

describe('useMicrophonePermission', () => {
  afterEach(() => {
    jest.clearAllMocks();
    restoreNavigator('mediaDevices', originalMediaDevices);
    restoreNavigator('permissions', originalPermissions);
  });

  describe('support detection', () => {
    it('reports "unsupported" when mediaDevices is missing', async () => {
      setMediaDevices(undefined);
      setPermissions(undefined);

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('unsupported');
      });
      expect(result.current.isSupported).toBe(false);
      expect(result.current.isGranted).toBe(false);
      expect(result.current.shouldAsk).toBe(false);
    });

    it('reports "unsupported" when getUserMedia is missing', async () => {
      setMediaDevices({});
      setPermissions(undefined);

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('unsupported');
      });
      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('Permissions API', () => {
    it('assumes "prompt" when the Permissions API is unavailable', async () => {
      setMediaDevices({ getUserMedia: jest.fn() });
      setPermissions(undefined);

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('prompt');
      });
      expect(result.current.isSupported).toBe(true);
      expect(result.current.shouldAsk).toBe(true);
    });

    it('assumes "prompt" when permissions.query is unavailable', async () => {
      setMediaDevices({ getUserMedia: jest.fn() });
      setPermissions({});

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('prompt');
      });
    });

    it('starts in "checking" while the query is pending', () => {
      const pending = deferred<MockPermissionStatus>();
      setMediaDevices({ getUserMedia: jest.fn() });
      setPermissions({ query: jest.fn(() => pending.promise) });

      const { result } = renderHook(() => useMicrophonePermission());

      expect(result.current.status).toBe('checking');
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isSupported).toBe(true);
      expect(result.current.shouldAsk).toBe(false);
    });

    it.each([
      ['granted', { isGranted: true, isSupported: true, shouldAsk: false }],
      ['denied', { isGranted: false, isSupported: true, shouldAsk: true }],
      ['prompt', { isGranted: false, isSupported: true, shouldAsk: true }],
    ])(
      'reflects the queried "%s" state and derived flags',
      async (state, flags) => {
        const query = jest.fn(() =>
          Promise.resolve(createPermissionStatus(state))
        );
        setMediaDevices({ getUserMedia: jest.fn() });
        setPermissions({ query });

        const { result } = renderHook(() => useMicrophonePermission());

        await waitFor(() => {
          expect(result.current.status).toBe(state);
        });
        expect(query).toHaveBeenCalledWith({ name: 'microphone' });
        expect(result.current.isGranted).toBe(flags.isGranted);
        expect(result.current.isSupported).toBe(flags.isSupported);
        expect(result.current.shouldAsk).toBe(flags.shouldAsk);
      }
    );

    it('reacts to permission changes via onchange', async () => {
      const permissionStatus = createPermissionStatus('prompt');
      setMediaDevices({ getUserMedia: jest.fn() });
      setPermissions({ query: jest.fn(() => Promise.resolve(permissionStatus)) });

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('prompt');
      });
      expect(typeof permissionStatus.onchange).toBe('function');

      act(() => {
        permissionStatus.state = 'granted';
        permissionStatus.onchange?.();
      });

      expect(result.current.status).toBe('granted');
      expect(result.current.isGranted).toBe(true);
    });

    it('falls back to "prompt" when the query rejects', async () => {
      setMediaDevices({ getUserMedia: jest.fn() });
      setPermissions({
        query: jest.fn(() => Promise.reject(new Error('not queryable'))),
      });

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('prompt');
      });
    });

    it('ignores a late query resolution after unmount', async () => {
      const pending = deferred<MockPermissionStatus>();
      setMediaDevices({ getUserMedia: jest.fn() });
      setPermissions({ query: jest.fn(() => pending.promise) });

      const { result, unmount } = renderHook(() => useMicrophonePermission());

      expect(result.current.status).toBe('checking');

      unmount();
      await act(async () => {
        pending.resolve(createPermissionStatus('granted'));
        await pending.promise;
      });

      // Snapshot stays at the pre-unmount value: no setState after teardown.
      expect(result.current.status).toBe('checking');
    });

    it('ignores a late query rejection after unmount', async () => {
      const pending = deferred<MockPermissionStatus>();
      setMediaDevices({ getUserMedia: jest.fn() });
      setPermissions({ query: jest.fn(() => pending.promise) });

      const { result, unmount } = renderHook(() => useMicrophonePermission());

      expect(result.current.status).toBe('checking');

      unmount();
      await act(async () => {
        pending.reject(new Error('not queryable'));
        await pending.promise.catch(() => {});
      });

      expect(result.current.status).toBe('checking');
    });

    it('clears the onchange handler on unmount', async () => {
      const permissionStatus = createPermissionStatus('granted');
      setMediaDevices({ getUserMedia: jest.fn() });
      setPermissions({ query: jest.fn(() => Promise.resolve(permissionStatus)) });

      const { result, unmount } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('granted');
      });
      expect(typeof permissionStatus.onchange).toBe('function');

      unmount();

      expect(permissionStatus.onchange).toBeNull();
    });
  });

  describe('requestPermission', () => {
    it('returns false and marks "unsupported" when getUserMedia is missing', async () => {
      setMediaDevices(undefined);
      setPermissions(undefined);

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('unsupported');
      });

      let granted: boolean | undefined;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted).toBe(false);
      expect(result.current.status).toBe('unsupported');
    });

    it('grants the permission, stops the tracks and returns true', async () => {
      const { stream, track } = createMockStream();
      const getUserMedia = jest.fn(() => Promise.resolve(stream));
      setMediaDevices({ getUserMedia });
      setPermissions({
        query: jest.fn(() => Promise.resolve(createPermissionStatus('prompt'))),
      });

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('prompt');
      });

      let granted: boolean | undefined;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(track.stop).toHaveBeenCalledTimes(1);
      expect(granted).toBe(true);
      expect(result.current.status).toBe('granted');
      expect(result.current.isGranted).toBe(true);
    });

    it('marks "denied" and returns false when getUserMedia rejects', async () => {
      const getUserMedia = jest.fn(() =>
        Promise.reject(new Error('NotAllowedError'))
      );
      setMediaDevices({ getUserMedia });
      setPermissions({
        query: jest.fn(() => Promise.resolve(createPermissionStatus('prompt'))),
      });

      const { result } = renderHook(() => useMicrophonePermission());

      await waitFor(() => {
        expect(result.current.status).toBe('prompt');
      });

      let granted: boolean | undefined;
      await act(async () => {
        granted = await result.current.requestPermission();
      });

      expect(granted).toBe(false);
      expect(result.current.status).toBe('denied');
      expect(result.current.shouldAsk).toBe(true);
    });
  });
});
