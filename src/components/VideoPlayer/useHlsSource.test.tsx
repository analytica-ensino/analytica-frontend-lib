import { useRef } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { MockHls } from '../../testing/mockHlsJs';
import {
  HLS_CONFIG,
  NATIVE_STALL_TIMEOUT_MS,
  findLevelIndex,
  pickPlaybackEngine,
  pickStartLevel,
  qualitiesFromLevels,
  useHlsSource,
  watchForStall,
  type UseHlsSourceResult,
} from './useHlsSource';

jest.mock('hls.js', () => ({
  __esModule: true,
  default: jest.requireActual('../../testing/mockHlsJs').MockHls,
}));

const MP4 = 'https://cdn.example.com/lesson.mp4';
const HLS = 'https://cdn.example.com/hls/lesson/master.m3u8';
const MASTER = [
  '#EXTM3U',
  '#EXT-X-STREAM-INF:BANDWIDTH=361268,RESOLUTION=854x480',
  '480p/index.m3u8',
  '#EXT-X-STREAM-INF:BANDWIDTH=242463,RESOLUTION=640x360',
  '360p/index.m3u8',
  '#EXT-X-STREAM-INF:BANDWIDTH=595017,RESOLUTION=1280x720',
  '720p/index.m3u8',
].join('\n');
const LEVELS = [
  { height: 480, bitrate: 361268 },
  { height: 360, bitrate: 242463 },
  { height: 720, bitrate: 595017 },
  { height: 1080, bitrate: 1260097 },
];

/** Playback state of the `<video>`, which jsdom does not implement. */
interface MediaState {
  currentTime: number;
  paused: boolean;
  ended: boolean;
  playbackRate: number;
}

const mockMedia = (video: HTMLVideoElement) => {
  const media: MediaState = {
    currentTime: 0,
    paused: true,
    ended: false,
    playbackRate: 1,
  };
  (Object.keys(media) as (keyof MediaState)[]).forEach((key) => {
    Object.defineProperty(video, key, {
      configurable: true,
      get: () => media[key],
      set: (value) => {
        (media as unknown as Record<string, unknown>)[key] = value;
      },
    });
  });
  Object.defineProperty(video, 'defaultPlaybackRate', {
    configurable: true,
    get: () => 1,
  });
  const play = jest.fn(() => {
    media.paused = false;
    return Promise.resolve();
  });
  Object.defineProperty(video, 'play', { configurable: true, value: play });
  return { media, play };
};

/** Gives the `<track>` a text track, which jsdom does not implement. */
const mockCaptionTrack = (video: HTMLVideoElement, mode: string) => {
  const track = { mode };
  Object.defineProperty(video.querySelector('track'), 'track', {
    value: track,
  });
  return track;
};

/** A `<video>` with a captions `<track>`, driven by the hook. */
const Harness = ({
  src,
  hlsSrc,
  onResult,
}: Readonly<{
  src: string;
  hlsSrc?: string;
  onResult: (result: UseHlsSourceResult) => void;
}>) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const result = useHlsSource({ videoRef, src, hlsSrc });
  onResult(result);
  return (
    <video ref={videoRef} src={result.videoSrc}>
      <track kind="captions" />
    </video>
  );
};

const renderSource = (hlsSrc?: string, src = MP4) => {
  let latest: UseHlsSourceResult | undefined;
  const onResult = (result: UseHlsSourceResult) => {
    latest = result;
  };
  const view = render(
    <Harness src={src} hlsSrc={hlsSrc} onResult={onResult} />
  );
  const video = view.container.querySelector('video') as HTMLVideoElement;
  return {
    ...view,
    video,
    result: () => latest as UseHlsSourceResult,
    rerenderWith: (nextHls?: string, nextSrc = src) =>
      view.rerender(
        <Harness src={nextSrc} hlsSrc={nextHls} onResult={onResult} />
      ),
  };
};

const fire = (video: HTMLVideoElement, type: string) =>
  act(() => {
    video.dispatchEvent(new Event(type));
  });

const setMediaSource = (value: unknown) => {
  Object.defineProperty(globalThis, 'MediaSource', {
    configurable: true,
    writable: true,
    value,
  });
};

let canPlayTypeSpy: jest.SpyInstance;
let vendorSpy: jest.SpyInstance;

beforeEach(() => {
  MockHls.reset();
  canPlayTypeSpy = jest
    .spyOn(HTMLMediaElement.prototype, 'canPlayType')
    .mockReturnValue('');
  vendorSpy = jest
    .spyOn(globalThis.navigator, 'vendor', 'get')
    .mockReturnValue('Google Inc.');
  // jsdom does not implement media loading.
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  delete (globalThis as { MediaSource?: unknown }).MediaSource;
  delete (globalThis as { ManagedMediaSource?: unknown }).ManagedMediaSource;
});

describe('pickPlaybackEngine', () => {
  const element = (support: string) =>
    ({ canPlayType: () => support }) as unknown as HTMLMediaElement;

  it('plays natively in Safari', () => {
    vendorSpy.mockReturnValue('Apple Computer, Inc.');
    setMediaSource(function MediaSource() {});
    expect(pickPlaybackEngine(element('maybe'))).toBe('native');
  });

  it('uses hls.js wherever Media Source Extensions exist, even with native HLS', () => {
    setMediaSource(function MediaSource() {});
    expect(pickPlaybackEngine(element('maybe'))).toBe('hlsjs');
  });

  it('uses hls.js with ManagedMediaSource alone', () => {
    (globalThis as { ManagedMediaSource?: unknown }).ManagedMediaSource =
      function ManagedMediaSource() {};
    expect(pickPlaybackEngine(element(''))).toBe('hlsjs');
  });

  it('plays natively without Media Source Extensions when it can', () => {
    expect(pickPlaybackEngine(element('maybe'))).toBe('native');
  });

  it('plays the MP4 when nothing plays HLS', () => {
    expect(pickPlaybackEngine(element(''))).toBe('mp4');
  });
});

describe('watchForStall', () => {
  const TIMEOUT = 15_000;
  let video: {
    currentTime: number;
    paused: boolean;
    ended: boolean;
    readyState: number;
  };
  let onStall: jest.Mock;
  let stop: () => void;

  beforeEach(() => {
    jest.useFakeTimers();
    // Playing, waiting for data: HAVE_CURRENT_DATA.
    video = { currentTime: 3.8, paused: false, ended: false, readyState: 2 };
    onStall = jest.fn();
    stop = watchForStall(
      video as unknown as HTMLMediaElement,
      TIMEOUT,
      onStall
    );
  });

  afterEach(() => stop());

  it('reports a stall that lasts the whole timeout, once', () => {
    jest.advanceTimersByTime(TIMEOUT);
    expect(onStall).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1_000);
    expect(onStall).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(TIMEOUT * 2);
    expect(onStall).toHaveBeenCalledTimes(1);
  });

  it('starts over whenever the time moves', () => {
    jest.advanceTimersByTime(TIMEOUT - 2_000);
    // A short wait on a slow network, or a seek that lands.
    video.currentTime = 4.2;
    jest.advanceTimersByTime(TIMEOUT - 2_000);
    expect(onStall).not.toHaveBeenCalled();

    jest.advanceTimersByTime(4_000);
    expect(onStall).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['paused', { paused: true }],
    ['ended', { ended: true }],
    ['playing with data', { readyState: 4 }],
  ])('never fires while the video is %s', (_label, state) => {
    Object.assign(video, state);
    jest.advanceTimersByTime(TIMEOUT * 4);
    expect(onStall).not.toHaveBeenCalled();
  });

  it('stops watching when told to', () => {
    stop();
    jest.advanceTimersByTime(TIMEOUT * 2);
    expect(onStall).not.toHaveBeenCalled();
  });
});

describe('level helpers', () => {
  it('lists each height once, tallest first', () => {
    expect(
      qualitiesFromLevels([
        { height: 360, bitrate: 1 },
        { height: 720, bitrate: 2 },
        { height: 720, bitrate: 3 },
        { height: 0, bitrate: 4 },
      ])
    ).toEqual([720, 360]);
  });

  it('finds the level of a height, preferring the higher bit rate', () => {
    const levels = [
      { height: 360, bitrate: 1 },
      { height: 720, bitrate: 5 },
      { height: 720, bitrate: 9 },
    ];
    expect(findLevelIndex(levels, 720)).toBe(2);
    expect(findLevelIndex(levels, 1080)).toBe(-1);
  });

  it('starts at 480p, else the tallest below it, else the shortest', () => {
    const level = (height: number) => ({ height, bitrate: height });
    expect(pickStartLevel([360, 480, 720].map(level))).toBe(1);
    expect(pickStartLevel([240, 360, 720].map(level))).toBe(1);
    expect(pickStartLevel([1080, 720].map(level))).toBe(1);
    expect(pickStartLevel([])).toBe(0);
  });
});

describe('useHlsSource', () => {
  it('plays the MP4 exactly as before without an HLS URL', () => {
    const { result, video } = renderSource(undefined);

    expect(result().videoSrc).toBe(MP4);
    expect(video.getAttribute('src')).toBe(MP4);
    expect(result().qualities).toEqual([]);
    expect(result().isSwitchingSource()).toBe(false);
    expect(MockHls.instances).toHaveLength(0);
  });

  it('plays the MP4 when the browser cannot play HLS', async () => {
    const { result } = renderSource(HLS);

    await waitFor(() => expect(result().videoSrc).toBe(MP4));
    expect(MockHls.instances).toHaveLength(0);

    act(() => result().selectQuality(360));
    expect(result().selectedQuality).toBe('auto');
  });

  describe('with hls.js', () => {
    beforeEach(() => {
      setMediaSource(function MediaSource() {});
    });

    const renderHlsJs = async () => {
      const view = renderSource(HLS);
      const mocks = mockMedia(view.video);
      await waitFor(() => expect(MockHls.instances).toHaveLength(1));
      return { ...view, ...mocks, hls: MockHls.last };
    };

    it('attaches hls.js without a src attribute and starts at 480p', async () => {
      const { hls, video, result } = await renderHlsJs();

      expect(hls.config).toBe(HLS_CONFIG);
      expect(hls.loadSource).toHaveBeenCalledWith(HLS);
      expect(hls.attachMedia).toHaveBeenCalledWith(video);
      expect(video.hasAttribute('src')).toBe(false);
      expect(result().videoSrc).toBeUndefined();

      act(() => hls.parseManifest(LEVELS));

      expect(hls.startLevel).toBe(1);
      expect(hls.startLoad).toHaveBeenCalledWith(-1);
      expect(result().qualities).toEqual([1080, 720, 480, 360]);
      expect(result().selectedQuality).toBe('auto');
    });

    it('caps ABR to the player size, keeps a short buffer and leaves captions to the <track>', () => {
      expect(HLS_CONFIG).toEqual({
        autoStartLoad: false,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        enableWebVTT: false,
        enableIMSC1: false,
        enableCEA708Captions: false,
      });
    });

    it('starts loading at the position the player already set', async () => {
      const { hls, media } = await renderHlsJs();
      media.currentTime = 42;

      act(() => hls.parseManifest(LEVELS));

      expect(hls.startLoad).toHaveBeenCalledWith(42);
    });

    it('switches renditions from the menu and back to Automático', async () => {
      const { hls, result } = await renderHlsJs();
      act(() => hls.parseManifest(LEVELS));

      act(() => result().selectQuality(360));
      expect(hls.currentLevel).toBe(0);
      expect(result().selectedQuality).toBe(360);

      act(() => result().selectQuality('auto'));
      expect(hls.nextLevel).toBe(-1);
      expect(result().selectedQuality).toBe('auto');

      act(() => result().selectQuality(240));
      expect(result().selectedQuality).toBe('auto');
    });

    it('ignores non-fatal errors', async () => {
      const { hls, result } = await renderHlsJs();

      act(() => hls.fail(MockHls.ErrorTypes.MEDIA_ERROR, false));

      expect(hls.recoverMediaError).not.toHaveBeenCalled();
      expect(hls.destroy).not.toHaveBeenCalled();
      expect(result().videoSrc).toBeUndefined();
    });

    it('recovers a fatal media error once, then falls back to the MP4', async () => {
      const { hls, result } = await renderHlsJs();
      act(() => hls.parseManifest(LEVELS));

      act(() => hls.fail(MockHls.ErrorTypes.MEDIA_ERROR, true));
      expect(hls.recoverMediaError).toHaveBeenCalledTimes(1);
      expect(result().videoSrc).toBeUndefined();

      act(() => hls.fail(MockHls.ErrorTypes.MEDIA_ERROR, true));
      expect(hls.recoverMediaError).toHaveBeenCalledTimes(1);
      expect(hls.destroy).toHaveBeenCalled();
      expect(result().videoSrc).toBe(MP4);
      expect(result().qualities).toEqual([]);
    });

    it('falls back on a fatal network error keeping position, play state and speed', async () => {
      const { hls, video, media, play, result } = await renderHlsJs();
      fire(video, 'loadedmetadata');
      expect(result().isSwitchingSource()).toBe(false);
      Object.assign(media, {
        currentTime: 37,
        paused: false,
        playbackRate: 1.5,
      });

      act(() => hls.fail(MockHls.ErrorTypes.NETWORK_ERROR, true));

      expect(result().videoSrc).toBe(MP4);
      expect(result().isSwitchingSource()).toBe(true);

      // The MP4 loads: the element starts over at 0, paused, at 1x.
      Object.assign(media, { currentTime: 0, paused: true, playbackRate: 1 });
      fire(video, 'seeked');
      expect(result().isSwitchingSource()).toBe(true);
      fire(video, 'loadedmetadata');

      expect(media.currentTime).toBe(37);
      expect(media.playbackRate).toBe(1.5);
      expect(play).toHaveBeenCalled();
      expect(result().isSwitchingSource()).toBe(true);
      fire(video, 'seeked');
      expect(result().isSwitchingSource()).toBe(false);
    });

    it('falls back without resuming playback when the video was paused at 0', async () => {
      const { hls, video, play, result } = await renderHlsJs();

      act(() => hls.fail(MockHls.ErrorTypes.OTHER_ERROR, true));
      fire(video, 'loadedmetadata');

      expect(result().videoSrc).toBe(MP4);
      expect(play).not.toHaveBeenCalled();
      expect(result().isSwitchingSource()).toBe(false);
    });

    it('falls back to the MP4 when hls.js is not supported', async () => {
      MockHls.isSupported.mockReturnValue(false);
      const { result } = renderSource(HLS);

      await waitFor(() => expect(result().videoSrc).toBe(MP4));
      expect(MockHls.instances).toHaveLength(0);
    });

    it('falls back to the MP4 when hls.js cannot start', async () => {
      MockHls.constructorError = new Error('chunk failed');
      const { result } = renderSource(HLS);

      await waitFor(() => expect(result().videoSrc).toBe(MP4));
    });

    it('replaces hls.js when the lesson changes and destroys it on unmount', async () => {
      const { hls, rerenderWith, unmount } = await renderHlsJs();
      const nextHls = 'https://cdn.example.com/hls/other/master.m3u8';

      rerenderWith(nextHls, 'https://cdn.example.com/other.mp4');

      await waitFor(() => expect(MockHls.instances).toHaveLength(2));
      expect(hls.destroy).toHaveBeenCalled();
      expect(MockHls.last.loadSource).toHaveBeenCalledWith(nextHls);

      unmount();
      expect(MockHls.last.destroy).toHaveBeenCalled();
    });

    it('does not attach hls.js after the player unmounts', async () => {
      const { unmount } = renderSource(HLS);
      unmount();

      await act(async () => {
        await Promise.resolve();
      });
      expect(MockHls.instances).toHaveLength(0);
    });

    it('plays the MP4 when the next lesson has no HLS', async () => {
      const { hls, result, rerenderWith } = await renderHlsJs();
      const nextMp4 = 'https://cdn.example.com/other.mp4';

      rerenderWith(undefined, nextMp4);

      expect(result().videoSrc).toBe(nextMp4);
      expect(hls.destroy).toHaveBeenCalled();
    });
  });

  describe('natively (Safari)', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      canPlayTypeSpy.mockReturnValue('maybe');
      vendorSpy.mockReturnValue('Apple Computer, Inc.');
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        url: HLS,
        text: () => Promise.resolve(MASTER),
      }) as unknown as typeof fetch;
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    const renderNative = async () => {
      const view = renderSource(HLS);
      const mocks = mockMedia(view.video);
      await waitFor(() =>
        expect(view.result().qualities).toEqual([720, 480, 360])
      );
      return { ...view, ...mocks };
    };

    it('hands the master playlist to the browser and lists its variants', async () => {
      const { result, video } = await renderNative();

      expect(result().videoSrc).toBe(HLS);
      expect(video.getAttribute('src')).toBe(HLS);
      expect(MockHls.instances).toHaveLength(0);
    });

    it('switches to a variant playlist and back to the master', async () => {
      const { result, video, media, play } = await renderNative();
      fire(video, 'loadedmetadata');
      const track = mockCaptionTrack(video, 'showing');
      Object.assign(media, { currentTime: 12, paused: false });

      act(() => result().selectQuality(360));

      expect(result().videoSrc).toBe(
        'https://cdn.example.com/hls/lesson/360p/index.m3u8'
      );
      expect(result().selectedQuality).toBe(360);
      expect(result().isSwitchingSource()).toBe(true);

      Object.assign(media, { currentTime: 0, paused: true });
      track.mode = 'disabled';
      fire(video, 'loadedmetadata');
      expect(media.currentTime).toBe(12);
      expect(track.mode).toBe('showing');
      expect(play).toHaveBeenCalled();

      act(() => result().selectQuality('auto'));
      expect(result().videoSrc).toBe(HLS);
      expect(result().selectedQuality).toBe('auto');
    });

    it('only updates the choice when the source would not change', async () => {
      const { result, video } = await renderNative();
      fire(video, 'loadedmetadata');

      act(() => result().selectQuality('auto'));
      expect(result().isSwitchingSource()).toBe(false);
      act(() => result().selectQuality(1080));

      expect(result().videoSrc).toBe(HLS);
      expect(result().selectedQuality).toBe('auto');
    });

    it('puts speed, captions and play state back as soon as the load starts', async () => {
      const { result, video, media, play } = await renderNative();
      fire(video, 'loadedmetadata');
      const track = mockCaptionTrack(video, 'showing');
      Object.assign(media, { currentTime: 12, paused: false, playbackRate: 2 });

      act(() => result().selectQuality(480));
      // The load resets the element.
      Object.assign(media, { currentTime: 0, paused: true, playbackRate: 1 });
      track.mode = 'disabled';
      fire(video, 'loadstart');

      expect(media.playbackRate).toBe(2);
      expect(track.mode).toBe('showing');
      expect(play).toHaveBeenCalledTimes(1);
      expect(media.currentTime).toBe(0);

      fire(video, 'loadedmetadata');
      expect(media.currentTime).toBe(12);
      expect(media.playbackRate).toBe(2);
      expect(play).toHaveBeenCalledTimes(1);
    });

    it('keeps what the user changes while the source loads', async () => {
      // The track exists from the start, so the first snapshot records it.
      const track = { mode: 'disabled' };
      Object.defineProperty(HTMLTrackElement.prototype, 'track', {
        configurable: true,
        get: () => track,
      });
      try {
        const { video, media, play } = await renderNative();

        // Before the master starts loading the user plays, turns captions on
        // and speeds up.
        Object.assign(media, { paused: false, playbackRate: 1.5 });
        track.mode = 'showing';
        fire(video, 'loadstart');
        fire(video, 'loadedmetadata');

        expect(media.playbackRate).toBe(1.5);
        expect(track.mode).toBe('showing');
        expect(play).not.toHaveBeenCalled();
      } finally {
        delete (HTMLTrackElement.prototype as { track?: unknown }).track;
      }
    });

    it('keeps the position to restore across two quick switches', async () => {
      const { result, video, media } = await renderNative();
      fire(video, 'loadedmetadata');
      Object.assign(media, { currentTime: 12, paused: false });

      // A second switch before the first load starts.
      act(() => result().selectQuality(360));
      Object.assign(media, { currentTime: 0, paused: true });
      act(() => result().selectQuality(480));
      fire(video, 'loadstart');
      // A third one after the second load started.
      Object.assign(media, { currentTime: 0 });
      act(() => result().selectQuality(720));
      fire(video, 'loadstart');
      fire(video, 'loadedmetadata');

      expect(result().videoSrc).toBe(
        'https://cdn.example.com/hls/lesson/720p/index.m3u8'
      );
      expect(media.currentTime).toBe(12);
      expect(media.paused).toBe(false);
    });

    it('falls back to the MP4 when playback stalls, keeping the position', async () => {
      jest.useFakeTimers();
      const { result, video, media, play } = await renderNative();
      fire(video, 'loadedmetadata');
      // A missing segment: Safari keeps waiting at 3.8 s (jsdom's readyState
      // stays at HAVE_NOTHING).
      Object.assign(media, { currentTime: 3.8, paused: false });

      act(() => {
        jest.advanceTimersByTime(NATIVE_STALL_TIMEOUT_MS - 2_000);
      });
      expect(result().videoSrc).toBe(HLS);

      // The count starts on the first check that sees the stall.
      act(() => {
        jest.advanceTimersByTime(5_000);
      });
      expect(result().videoSrc).toBe(MP4);
      expect(result().qualities).toEqual([]);

      Object.assign(media, { currentTime: 0, paused: true });
      fire(video, 'loadstart');
      fire(video, 'loadedmetadata');
      expect(play).toHaveBeenCalled();
      expect(media.currentTime).toBe(3.8);
    });

    it('does not fall back while the video is paused', async () => {
      jest.useFakeTimers();
      const { result } = await renderNative();

      act(() => {
        jest.advanceTimersByTime(NATIVE_STALL_TIMEOUT_MS * 4);
      });

      expect(result().videoSrc).toBe(HLS);
    });

    it('falls back to the MP4 when the browser reports a media error', async () => {
      const { result, video } = await renderNative();

      fire(video, 'error');
      expect(result().videoSrc).toBe(MP4);
      expect(result().qualities).toEqual([]);

      fire(video, 'error');
      expect(result().videoSrc).toBe(MP4);
    });

    it('plays without the menu when the master cannot be read', async () => {
      (globalThis.fetch as jest.Mock).mockRejectedValue(new Error('CORS'));
      const { result } = renderSource(HLS);

      await waitFor(() => expect(result().videoSrc).toBe(HLS));
      await act(async () => {
        await Promise.resolve();
      });
      expect(result().qualities).toEqual([]);
    });

    /** Lets the master playlist request of a new lesson settle. */
    const flushMasterFetch = () =>
      act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

    it('stops the stall watchdog when the player unmounts', async () => {
      jest.useFakeTimers();
      const { media, unmount } = await renderNative();
      Object.assign(media, { currentTime: 3.8, paused: false });
      expect(jest.getTimerCount()).toBe(1);

      unmount();

      expect(jest.getTimerCount()).toBe(0);
    });

    it('keeps a single stall watchdog across lesson changes', async () => {
      jest.useFakeTimers();
      const { rerenderWith } = await renderNative();

      rerenderWith(
        'https://cdn.example.com/hls/b/master.m3u8',
        'https://cdn.example.com/b.mp4'
      );
      rerenderWith(
        'https://cdn.example.com/hls/c/master.m3u8',
        'https://cdn.example.com/c.mp4'
      );

      // Counted before flushing: `act` itself leaves a timer per call.
      expect(jest.getTimerCount()).toBe(1);
      await flushMasterFetch();
    });

    it('leaves no listener behind across lesson changes and unmount', async () => {
      const added = jest.spyOn(HTMLMediaElement.prototype, 'addEventListener');
      const removed = jest.spyOn(
        HTMLMediaElement.prototype,
        'removeEventListener'
      );
      const { rerenderWith, unmount } = await renderNative();
      rerenderWith(
        'https://cdn.example.com/hls/b/master.m3u8',
        'https://cdn.example.com/b.mp4'
      );
      await flushMasterFetch();
      rerenderWith(undefined, 'https://cdn.example.com/c.mp4');
      rerenderWith(HLS, MP4);
      await flushMasterFetch();
      unmount();

      // React attaches its own media listeners to every <video> and never
      // removes them; only the hook's listeners are checked.
      const isReactListener = (listener: unknown) =>
        typeof listener === 'function' &&
        listener.name.startsWith('bound dispatch');
      const hookCalls = (spy: jest.SpyInstance) =>
        spy.mock.calls
          .filter(([, listener]) => !isReactListener(listener))
          .map(([type, listener]) => ({ type, listener }));
      const hookAdded = hookCalls(added);
      const hookRemoved = hookCalls(removed);

      expect(hookAdded.length).toBeGreaterThan(0);
      hookAdded.forEach(({ type, listener }) => {
        expect(hookRemoved).toContainEqual({ type, listener });
      });
    });

    it('drops the variant list of a lesson that is gone', async () => {
      const { result, unmount } = renderSource(HLS);
      unmount();

      await act(async () => {
        await Promise.resolve();
      });
      expect(result().qualities).toEqual([]);
    });
  });
});
