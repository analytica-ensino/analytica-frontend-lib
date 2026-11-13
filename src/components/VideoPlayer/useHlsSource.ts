import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { default as Hls, HlsConfig } from 'hls.js';
import { fetchMasterPlaylist } from './hlsMasterPlaylist';
import { AUTO_QUALITY, type QualitySelection } from './videoQuality';

/** What plays the current source: still deciding, the MP4, hls.js or Safari. */
export type PlaybackEngine = 'pending' | 'mp4' | 'hlsjs' | 'native';

const HLS_MIME_TYPE = 'application/vnd.apple.mpegurl';

/**
 * Height of the rendition hls.js starts on. With ABR deciding the first
 * segment (`startLevel: -1`) some lessons opened at 360p (AE-3280); 480p is
 * the start the conversion also lists first in the master playlist.
 */
const START_HEIGHT = 480;

/**
 * hls.js settings.
 *
 * - `autoStartLoad: false`: loading starts once the start level is chosen.
 * - Buffer of 30 s, up to 60 s, instead of the 600 s ceiling of the default.
 * - `capLevelToPlayerSize`: ABR does not fetch more pixels than the player
 *   shows. It only limits the automatic choice; a rendition picked in the
 *   menu still plays.
 * - Captions come from the sidecar `<track>` (`url_subtitle`), so hls.js
 *   does not look for subtitles or CEA-608 captions inside the stream.
 */
export const HLS_CONFIG: Partial<HlsConfig> = {
  autoStartLoad: false,
  capLevelToPlayerSize: true,
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
  enableWebVTT: false,
  enableIMSC1: false,
  enableCEA708Captions: false,
};

/**
 * How long native playback may sit without data before it falls back to the
 * MP4. Safari does not raise an error on a missing segment: it waits for it
 * forever (AE-3290).
 */
export const NATIVE_STALL_TIMEOUT_MS = 15_000;

/** How often the stall watchdog looks at the element. */
const STALL_CHECK_INTERVAL_MS = 1_000;

/** `readyState` from which the element has data to keep playing. */
const HAVE_FUTURE_DATA = 3;

/**
 * Calls `onStall` once when the video should be playing but has been waiting
 * for data, without its time moving, for `timeoutMs`.
 *
 * Paused or ended video, and video that has data (`readyState` from
 * HAVE_FUTURE_DATA on), never counts; any movement of the time, a short wait
 * on a slow network or a seek that lands, starts the count over.
 *
 * @param video - The video element
 * @param timeoutMs - How long a stall lasts before `onStall`
 * @param onStall - Called once when the stall reaches `timeoutMs`
 * @returns Stops the watchdog
 */
export const watchForStall = (
  video: HTMLMediaElement,
  timeoutMs: number,
  onStall: () => void
): (() => void) => {
  let lastTime = video.currentTime;
  let stalledSince: number | null = null;

  const timer = globalThis.setInterval(() => {
    const waitingForData =
      !video.paused && !video.ended && video.readyState < HAVE_FUTURE_DATA;
    const moved = video.currentTime !== lastTime;
    lastTime = video.currentTime;
    if (!waitingForData || moved) {
      stalledSince = null;
      return;
    }

    const now = Date.now();
    stalledSince ??= now;
    if (now - stalledSince >= timeoutMs) {
      globalThis.clearInterval(timer);
      onStall();
    }
  }, STALL_CHECK_INTERVAL_MS);

  return () => globalThis.clearInterval(timer);
};

/** The part of an hls.js level this module reads. */
interface LevelInfo {
  height: number;
  bitrate: number;
}

/**
 * Chooses how to play an HLS source on this browser.
 *
 * Safari, on macOS and iOS (where every browser is WebKit), plays HLS
 * natively, which is what the system player needs in iPhone fullscreen. Other
 * browsers go through hls.js over Media Source Extensions, even when they
 * report some native HLS support (recent Chrome does), because hls.js is what
 * drives the quality menu there. Without either, the MP4 plays.
 *
 * @param video - The video element that will play the source
 * @returns The engine to use
 */
export const pickPlaybackEngine = (
  video: HTMLMediaElement
): Exclude<PlaybackEngine, 'pending'> => {
  const playsHlsNatively = video.canPlayType(HLS_MIME_TYPE) !== '';
  const isAppleWebKit = (globalThis.navigator?.vendor ?? '').startsWith(
    'Apple'
  );
  if (playsHlsNatively && isAppleWebKit) return 'native';

  const hasMediaSource =
    typeof globalThis.MediaSource === 'function' ||
    'ManagedMediaSource' in globalThis;
  if (hasMediaSource) return 'hlsjs';

  return playsHlsNatively ? 'native' : 'mp4';
};

/**
 * Heights offered in the quality menu, tallest first, each one once.
 *
 * @param levels - hls.js levels
 * @returns Distinct picture heights in descending order
 */
export const qualitiesFromLevels = (levels: readonly LevelInfo[]): number[] =>
  [...new Set(levels.map((level) => level.height).filter((h) => h > 0))].sort(
    (a, b) => b - a
  );

/**
 * Index of the level that plays a height; the highest bit rate wins a tie.
 *
 * @param levels - hls.js levels
 * @param height - Picture height chosen in the menu
 * @returns Level index, or -1 when no level has that height
 */
export const findLevelIndex = (
  levels: readonly LevelInfo[],
  height: number
): number =>
  levels.reduce(
    (best, level, index) =>
      level.height === height &&
      (best === -1 || level.bitrate > levels[best].bitrate)
        ? index
        : best,
    -1
  );

/**
 * Level hls.js starts on: 480p when it exists, else the tallest one below it.
 * A level without a picture size (no `RESOLUTION` in the master) is never
 * picked; with no known level up to 480p, ABR chooses the start. ABR takes
 * over from there either way.
 *
 * @param levels - hls.js levels
 * @returns Level index, or -1 to let ABR choose
 */
export const pickStartLevel = (levels: readonly LevelInfo[]): number => {
  const below = levels
    .map((level) => level.height)
    .filter((height) => height > 0 && height <= START_HEIGHT);
  return below.length ? findLevelIndex(levels, Math.max(...below)) : -1;
};

/** How the video was playing right before its source changed. */
interface PlaybackSnapshot {
  time: number;
  playing: boolean;
  playbackRate: number;
  /** Mode of each `<track>` child (the sidecar captions), in DOM order. */
  trackModes: TextTrack['mode'][];
  /** Speed, captions and play state are back; only the position is left. */
  settingsRestored: boolean;
}

/**
 * Text tracks of the `<track>` children. Tracks the stream itself exposes (an
 * in-band track in Safari) come and go with each source, so only these are
 * restored.
 */
const sidecarTracks = (video: HTMLVideoElement): TextTrack[] =>
  // `track` is missing where text tracks are not implemented (jsdom).
  Array.from(video.querySelectorAll('track')).flatMap((element) =>
    element.track ? [element.track] : []
  );

/**
 * Puts back the speed, the caption mode and the play state, which the load of
 * a new source resets.
 *
 * Only what still shows the reset value is touched: a speed or caption the
 * user changed while the source loaded is kept.
 *
 * @param video - The video element
 * @param snapshot - State recorded before the source changed
 */
const restoreSettings = (
  video: HTMLVideoElement,
  snapshot: PlaybackSnapshot
): void => {
  snapshot.settingsRestored = true;
  if (video.playbackRate === video.defaultPlaybackRate) {
    video.playbackRate = snapshot.playbackRate;
  }
  sidecarTracks(video).forEach((track, index) => {
    const mode = snapshot.trackModes[index];
    if (mode && track.mode === 'disabled') track.mode = mode;
  });
  if (snapshot.playing && video.paused) {
    video.play().catch(() => {
      // Blocked by the browser: the player shows its play button.
    });
  }
};

interface SourceState {
  /** Identifies the source pair this state belongs to. */
  key: string;
  engine: PlaybackEngine;
  /** URL Safari plays: the master, or the variant picked in the menu. */
  nativeUrl?: string;
  /** Heights for the quality menu, tallest first; empty hides it. */
  qualities: number[];
  selected: QualitySelection;
}

const initialState = (key: string, hlsSrc?: string): SourceState => ({
  key,
  engine: hlsSrc ? 'pending' : 'mp4',
  qualities: [],
  selected: AUTO_QUALITY,
});

/** The `src` attribute of the `<video>` for a state. */
const videoSrcFor = (state: SourceState, src: string): string | undefined => {
  switch (state.engine) {
    case 'mp4':
      return src;
    case 'native':
      return state.nativeUrl;
    default:
      // While deciding, and while hls.js owns the element (it sets a blob:
      // URL itself), React must not set a source.
      return undefined;
  }
};

/** What an engine needs to start playing a source. */
interface StartContext {
  video: HTMLVideoElement;
  hlsSrc: string;
  /** Aborts the requests when the source changes or the player unmounts. */
  signal: AbortSignal;
  /** False once the source changed or the player unmounted. */
  isActive: () => boolean;
  update: (patch: Partial<SourceState>) => void;
  /** Same media, another source (recovery): keeps position and play state. */
  beginSourceChange: () => void;
  /** First source of this media: keeps only speed and captions. */
  beginNewMedia: () => void;
  fallBackToMp4: () => void;
}

/**
 * Hands the master playlist to Safari and lists its variants for the menu.
 *
 * @param context - Start context
 * @param onVariants - Receives the variant URL of each height
 */
const startNativePlayback = (
  context: StartContext,
  onVariants: (urls: Map<number, string>) => void
): void => {
  context.beginNewMedia();
  context.update({ engine: 'native', nativeUrl: context.hlsSrc });
  fetchMasterPlaylist(context.hlsSrc, context.signal)
    .then((renditions) => {
      if (!context.isActive()) return;
      onVariants(
        new Map(
          renditions.map((rendition) => [rendition.height, rendition.url])
        )
      );
      context.update({
        qualities: renditions.map((rendition) => rendition.height),
      });
    })
    .catch(() => {
      // Without the list the menu stays hidden; playback does not need it.
    });
};

/**
 * Loads hls.js (a separate chunk) and attaches it to the video.
 *
 * @param context - Start context
 * @param onCreated - Receives the instance, which the caller destroys
 * @returns Resolves once hls.js is attached; rejects when the chunk fails
 */
const startHlsJsPlayback = async (
  context: StartContext,
  onCreated: (hls: Hls) => void
): Promise<void> => {
  const { default: HlsPlayer } = await import('hls.js');
  if (!context.isActive()) return;
  if (!HlsPlayer.isSupported()) {
    context.fallBackToMp4();
    return;
  }

  const { video, hlsSrc } = context;
  const hls = new HlsPlayer(HLS_CONFIG);
  onCreated(hls);
  let triedMediaRecovery = false;

  hls.on(HlsPlayer.Events.MANIFEST_PARSED, (_event, data) => {
    hls.startLevel = pickStartLevel(data.levels);
    hls.startLoad(video.currentTime > 0 ? video.currentTime : -1);
    context.update({ qualities: qualitiesFromLevels(data.levels) });
  });
  hls.on(HlsPlayer.Events.ERROR, (_event, data) => {
    // Non-fatal errors (a stalled append, a retried segment) are handled by
    // hls.js itself.
    if (!data.fatal || !context.isActive()) return;
    if (data.type === HlsPlayer.ErrorTypes.MEDIA_ERROR && !triedMediaRecovery) {
      triedMediaRecovery = true;
      // Recovery attaches a new MediaSource to the same element.
      context.beginSourceChange();
      hls.recoverMediaError();
      return;
    }
    context.fallBackToMp4();
  });

  context.beginNewMedia();
  hls.loadSource(hlsSrc);
  hls.attachMedia(video);
  context.update({ engine: 'hlsjs' });
};

export interface UseHlsSourceParams {
  /** The player's video element. */
  videoRef: RefObject<HTMLVideoElement | null>;
  /** MP4 URL: plays when there is no HLS and is the fallback when HLS fails. */
  src: string;
  /** HLS master playlist URL. Without it, the MP4 plays as it always did. */
  hlsSrc?: string;
  /**
   * How long native HLS (Safari) may stall before falling back to the MP4.
   * Defaults to `NATIVE_STALL_TIMEOUT_MS`.
   */
  stallTimeoutMs?: number;
  /**
   * Identity of the media (the lesson). Another key is another media: speed
   * and captions carry over, position and play state do not. The same key
   * with another source (the MP4 flag switched at runtime) keeps them.
   */
  mediaKey?: string;
}

export interface UseHlsSourceResult {
  /** Value for the `src` attribute of the `<video>`. */
  videoSrc: string | undefined;
  /** Heights for the quality menu, tallest first; empty means no menu. */
  qualities: number[];
  /** Current choice in the quality menu. */
  selectedQuality: QualitySelection;
  /** Applies a choice from the quality menu. */
  selectQuality: (quality: QualitySelection) => void;
  /**
   * True while the element changes source (MP4 fallback, Safari quality
   * switch). The element reports time 0 in between; the player ignores time
   * updates meanwhile so progress and the saved position never drop to 0.
   */
  isSwitchingSource: () => boolean;
}

/**
 * Plays a lesson's HLS stream with the MP4 as fallback, and drives the
 * quality menu.
 *
 * - hls.js is imported on demand, so pages without HLS video do not load it.
 * - Safari plays HLS natively; its quality menu switches the source between
 *   the variant playlists listed in the master ("Automático" returns to it).
 * - A fatal error (after one media recovery attempt in hls.js), or a native
 *   stall longer than `stallTimeoutMs`, switches to the MP4.
 * - Every source change keeps the position, the play/pause state, the speed
 *   and the caption mode.
 *
 * The hook only reads: the MP4 is never replaced, it stays the fallback and
 * the download file.
 *
 * @param params - Video element, MP4 URL and optional HLS URL
 * @returns The `<video>` source, the quality menu state and a guard for time updates
 */
export const useHlsSource = ({
  videoRef,
  src,
  hlsSrc,
  stallTimeoutMs = NATIVE_STALL_TIMEOUT_MS,
  mediaKey,
}: UseHlsSourceParams): UseHlsSourceResult => {
  const mediaKeyRef = useRef(mediaKey);
  mediaKeyRef.current = mediaKey;
  /** Media the last source started for. */
  const startedMediaKeyRef = useRef<string | undefined>(undefined);
  const key = `${src}\n${hlsSrc ?? ''}`;
  const [stored, setStored] = useState<SourceState>(() =>
    initialState(key, hlsSrc)
  );
  // A new source pair starts from scratch in this same render, so the
  // previous lesson's engine never reaches the new one's `<video>`.
  const state = stored.key === key ? stored : initialState(key, hlsSrc);

  const hlsRef = useRef<Hls | null>(null);
  const variantUrlsRef = useRef(new Map<number, string>());
  const snapshotRef = useRef<PlaybackSnapshot | null>(null);
  const switchingRef = useRef(false);

  /**
   * Records the state to put back once the next source loads: a quality
   * switch or a fallback keeps the position and the play state.
   */
  const beginSourceChange = useCallback(() => {
    switchingRef.current = true;
    const video = videoRef.current;
    if (!video) return;
    const inFlight = snapshotRef.current;
    // Until the previous load starts, the element reports the state that load
    // reset: the snapshot already taken is the right one.
    if (inFlight && !inFlight.settingsRestored) return;
    snapshotRef.current = {
      // Mid-load the element reports 0; the position still to restore wins.
      time: inFlight ? inFlight.time : video.currentTime,
      playing: !video.paused && !video.ended,
      playbackRate: video.playbackRate,
      trackModes: sidecarTracks(video).map((track) => track.mode),
      settingsRestored: false,
    };
  }, [videoRef]);

  /**
   * Starts a different media (another lesson) in the same element. Speed and
   * captions carry over, as the student chose them; the position and the
   * play state do not: they belong to the previous media, and the player
   * applies the new one's resume point and autoplay itself.
   */
  const beginNewMedia = useCallback(() => {
    beginSourceChange();
    const snapshot = snapshotRef.current;
    if (snapshot) {
      snapshot.time = 0;
      snapshot.playing = false;
    }
  }, [beginSourceChange]);

  // Loading a source pauses, sets the speed back to 1x and starts at 0. Speed,
  // captions and play state come back as soon as the load starts, so whatever
  // the user changes while it loads is kept; the position comes back once
  // there is a timeline.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const onLoadStart = () => {
      const snapshot = snapshotRef.current;
      if (snapshot && !snapshot.settingsRestored) {
        restoreSettings(video, snapshot);
      }
    };
    const onLoadedMetadata = () => {
      const snapshot = snapshotRef.current;
      if (!snapshot) return;
      snapshotRef.current = null;
      if (!snapshot.settingsRestored) restoreSettings(video, snapshot);
      if (snapshot.time > 0) {
        // The change ends on `seeked`.
        video.currentTime = snapshot.time;
      } else {
        switchingRef.current = false;
      }
    };
    const onSeeked = () => {
      if (!snapshotRef.current) switchingRef.current = false;
    };

    video.addEventListener('loadstart', onLoadStart);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('seeked', onSeeked);
    return () => {
      video.removeEventListener('loadstart', onLoadStart);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [videoRef]);

  useEffect(() => {
    snapshotRef.current = null;
    switchingRef.current = false;
    variantUrlsRef.current = new Map();
    const video = videoRef.current;
    if (!video || !hlsSrc) return undefined;

    let cancelled = false;
    const controller = new AbortController();

    const update = (patch: Partial<SourceState>) => {
      if (cancelled) return;
      setStored((previous) => ({
        ...(previous.key === key ? previous : initialState(key, hlsSrc)),
        ...patch,
      }));
    };
    const destroyHls = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
    let stopStallWatchdog = () => {};
    const fallBackToMp4 = () => {
      if (cancelled) return;
      // Once on the MP4 there is nothing else to fall back to.
      video.removeEventListener('error', fallBackToMp4);
      stopStallWatchdog();
      beginSourceChange();
      destroyHls();
      update({ engine: 'mp4', qualities: [], selected: AUTO_QUALITY });
    };

    const isNewMedia = startedMediaKeyRef.current !== mediaKeyRef.current;
    startedMediaKeyRef.current = mediaKeyRef.current;

    const context: StartContext = {
      video,
      hlsSrc,
      signal: controller.signal,
      isActive: () => !cancelled,
      update,
      beginSourceChange,
      // Same media from another source (the MP4 flag switched): a switch.
      beginNewMedia: isNewMedia ? beginNewMedia : beginSourceChange,
      fallBackToMp4,
    };
    const engine = pickPlaybackEngine(video);
    if (engine === 'mp4') {
      update({ engine: 'mp4' });
    } else if (engine === 'native') {
      // Safari reports a broken source with an error, but a missing segment
      // only as a stall.
      video.addEventListener('error', fallBackToMp4);
      stopStallWatchdog = watchForStall(video, stallTimeoutMs, fallBackToMp4);
      startNativePlayback(context, (urls) => {
        variantUrlsRef.current = urls;
      });
    } else {
      startHlsJsPlayback(context, (hls) => {
        hlsRef.current = hls;
      })
        // The chunk did not load (offline, or a deploy replaced it).
        .catch(fallBackToMp4);
    }

    return () => {
      cancelled = true;
      controller.abort();
      video.removeEventListener('error', fallBackToMp4);
      stopStallWatchdog();
      destroyHls();
    };
  }, [key, hlsSrc, videoRef, beginSourceChange, beginNewMedia, stallTimeoutMs]);

  const expectedSrc = videoSrcFor(state, src);
  // The player stays mounted from lesson to lesson. Moving from an hls.js
  // lesson to an MP4 one, React sets the new `src` first and only then does
  // the effect above clean up, destroying hls.js — which detaches by removing
  // `src` and reloading the element, wiping the MP4 that just went in. Effects
  // run after every cleanup, so this puts the source back.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !expectedSrc) return;
    if (video.getAttribute('src') === expectedSrc) return;
    video.setAttribute('src', expectedSrc);
    video.load();
  }, [videoRef, expectedSrc]);

  const { engine, nativeUrl } = state;
  const selectQuality = useCallback(
    (quality: QualitySelection) => {
      const hls = hlsRef.current;
      let patch: Partial<SourceState>;

      if (engine === 'hlsjs' && hls) {
        if (quality === AUTO_QUALITY) {
          // Back to ABR from the next segment on, without dropping the buffer.
          hls.nextLevel = -1;
        } else {
          const index = findLevelIndex(hls.levels, quality);
          if (index === -1) return;
          // Immediate switch: what is buffered at the old quality is dropped.
          hls.currentLevel = index;
        }
        patch = { selected: quality };
      } else if (engine === 'native') {
        const url =
          quality === AUTO_QUALITY
            ? hlsSrc
            : variantUrlsRef.current.get(quality);
        if (!url) return;
        if (url !== nativeUrl) beginSourceChange();
        patch = { selected: quality, nativeUrl: url };
      } else {
        return;
      }

      setStored((previous) =>
        previous.key === key ? { ...previous, ...patch } : previous
      );
    },
    [engine, nativeUrl, hlsSrc, key, beginSourceChange]
  );

  const isSwitchingSource = useCallback(() => switchingRef.current, []);

  return {
    videoSrc: videoSrcFor(state, src),
    qualities: state.qualities,
    selectedQuality: state.selected,
    selectQuality,
    isSwitchingSource,
  };
};
