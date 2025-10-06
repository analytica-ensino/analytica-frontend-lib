import {
  useRef,
  useState,
  useEffect,
  useCallback,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Pause,
  SpeakerHigh,
  SpeakerSlash,
  ArrowsOutSimple,
  ArrowsInSimple,
  ClosedCaptioning,
  DotsThreeVertical,
} from 'phosphor-react';
import { cn } from '../../utils/utils';
import IconButton from '../IconButton/IconButton';
import Text from '../Text/Text';
import { useMobile } from '../../hooks/useMobile';
import DownloadButton, {
  DownloadContent,
} from '../DownloadButton/DownloadButton';

// Constants for timeout durations
const CONTROLS_HIDE_TIMEOUT = 3000; // 3 seconds for normal control hiding
const LEAVE_HIDE_TIMEOUT = 1000; // 1 second when mouse leaves the video area
const INIT_DELAY = 100; // ms delay to initialize controls on mount

/**
 * VideoPlayer component props interface
 */
interface VideoPlayerProps {
  /** Video source URL */
  src: string;
  /** Video poster/thumbnail URL */
  poster?: string;
  /** Subtitles URL */
  subtitles?: string;
  /** Video title */
  title?: string;
  /** Video subtitle/description */
  subtitle?: string;
  /** Initial playback time in seconds */
  initialTime?: number;
  /** Callback fired when video time updates (seconds) */
  onTimeUpdate?: (seconds: number) => void;
  /** Callback fired with progress percentage (0-100) */
  onProgress?: (progress: number) => void;
  /** Callback fired when video completes (>95% watched) */
  onVideoComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Auto-save progress to localStorage */
  autoSave?: boolean;
  /** localStorage key for saving progress */
  storageKey?: string;
  /** Download content URLs for lesson materials */
  downloadContent?: DownloadContent;
  /** Show download button in header */
  showDownloadButton?: boolean;
  /** Callback fired when download starts */
  onDownloadStart?: (contentType: string) => void;
  /** Callback fired when download completes */
  onDownloadComplete?: (contentType: string) => void;
  /** Callback fired when download fails */
  onDownloadError?: (contentType: string, error: Error) => void;
}

/**
 * Format seconds to MM:SS display format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
const formatTime = (seconds: number): string => {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Progress bar component props
 */
interface ProgressBarProps {
  currentTime: number;
  duration: number;
  progressPercentage: number;
  onSeek: (time: number) => void;
}

/**
 * Progress bar subcomponent
 */
const ProgressBar = ({
  currentTime,
  duration,
  progressPercentage,
  onSeek,
  className = 'px-4 pb-2',
}: ProgressBarProps & { className?: string }) => (
  <div className={className}>
    <input
      type="range"
      min={0}
      max={duration || 100}
      value={currentTime}
      onChange={(e) => onSeek(Number.parseFloat(e.target.value))}
      className="w-full h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer slider:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label="Video progress"
      style={{
        background: `linear-gradient(to right, var(--color-primary-700) ${progressPercentage}%, var(--color-secondary-300) ${progressPercentage}%)`,
      }}
    />
  </div>
);

/**
 * Volume controls component props
 */
interface VolumeControlsProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  iconSize?: number;
  showSlider?: boolean;
}

/**
 * Volume controls subcomponent
 */
const VolumeControls = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  iconSize = 24,
  showSlider = true,
}: VolumeControlsProps) => (
  <div className="flex items-center gap-2">
    <IconButton
      icon={
        isMuted ? (
          <SpeakerSlash size={iconSize} />
        ) : (
          <SpeakerHigh size={iconSize} />
        )
      }
      onClick={onToggleMute}
      aria-label={isMuted ? 'Unmute' : 'Mute'}
      className="!bg-transparent !text-white hover:!bg-white/20"
    />

    {showSlider && (
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        onChange={(e) => onVolumeChange(Number.parseInt(e.target.value))}
        className="w-20 h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Volume control"
        style={{
          background: `linear-gradient(to right, var(--color-primary-700) ${volume * 100}%, var(--color-secondary-300) ${volume * 100}%)`,
        }}
      />
    )}
  </div>
);

/**
 * Speed menu component props
 */
interface SpeedMenuProps {
  showSpeedMenu: boolean;
  playbackRate: number;
  onToggleMenu: () => void;
  onSpeedChange: (speed: number) => void;
  isFullscreen: boolean;
  iconSize?: number;
  isTinyMobile?: boolean;
}

/**
 * Speed menu subcomponent
 */
const SpeedMenu = ({
  showSpeedMenu,
  playbackRate,
  onToggleMenu,
  onSpeedChange,
  isFullscreen,
  iconSize = 24,
  isTinyMobile = false,
}: SpeedMenuProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const speedMenuContainerRef = useRef<HTMLDivElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const getMenuPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    const rect = buttonRef.current.getBoundingClientRect();

    // Adjust positioning for tiny mobile screens
    const menuHeight = isTinyMobile ? 150 : 180;
    const menuWidth = isTinyMobile ? 60 : 80;
    const padding = isTinyMobile ? 4 : 8;

    return {
      // Fixed coords are viewport-based — no scroll offsets.
      top: Math.max(padding, rect.top - menuHeight),
      left: Math.max(padding, rect.right - menuWidth),
    };
  };

  const position = getMenuPosition();

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;

      // Check if click is outside both the container and the menu
      const isOutsideContainer =
        speedMenuContainerRef.current &&
        !speedMenuContainerRef.current.contains(target);
      const isOutsideMenu =
        speedMenuRef.current && !speedMenuRef.current.contains(target);

      // Only close if click is outside both refs (null-safe checks)
      if (isOutsideContainer && isOutsideMenu) {
        onToggleMenu();
      }
    };

    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpeedMenu, onToggleMenu]);

  const menuContent = (
    <div
      ref={speedMenuRef}
      role="menu"
      aria-label="Playback speed"
      className={
        isFullscreen
          ? 'absolute bottom-12 right-0 bg-background border border-border-100 rounded-lg shadow-lg p-2 min-w-24 z-[9999]'
          : 'fixed bg-background border border-border-100 rounded-lg shadow-lg p-2 min-w-24 z-[9999]'
      }
      style={
        isFullscreen
          ? undefined
          : {
              top: `${position.top}px`,
              left: `${position.left}px`,
            }
      }
    >
      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
        <button
          key={speed}
          role="menuitemradio"
          aria-checked={playbackRate === speed}
          onClick={() => onSpeedChange(speed)}
          className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-border-50 transition-colors ${
            playbackRate === speed
              ? 'bg-primary-950 text-secondary-100 font-medium'
              : 'text-text-950'
          }`}
        >
          {speed}x
        </button>
      ))}
    </div>
  );

  // SSR-safe portal content
  const portalContent =
    showSpeedMenu &&
    globalThis.window !== undefined &&
    globalThis.document !== undefined &&
    !!globalThis.document?.body
      ? createPortal(menuContent, globalThis.document.body)
      : null;

  return (
    <div className="relative" ref={speedMenuContainerRef}>
      <IconButton
        ref={buttonRef}
        icon={<DotsThreeVertical size={iconSize} />}
        onClick={onToggleMenu}
        aria-label="Playback speed"
        aria-haspopup="menu"
        aria-expanded={showSpeedMenu}
        className="!bg-transparent !text-white hover:!bg-white/20"
      />
      {showSpeedMenu && (isFullscreen ? menuContent : portalContent)}
    </div>
  );
};

/**
 * Video player component with controls and progress tracking
 * Integrates with backend lesson progress system
 *
 * @param props - VideoPlayer component props
 * @returns Video player element with controls
 */
const VideoPlayer = ({
  src,
  poster,
  subtitles,
  title,
  subtitle: subtitleText,
  initialTime = 0,
  onTimeUpdate,
  onProgress,
  onVideoComplete,
  className,
  autoSave = true,
  storageKey = 'video-progress',
  downloadContent,
  showDownloadButton = false,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isUltraSmallMobile, isTinyMobile } = useMobile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [subtitlesValidation, setSubtitlesValidation] = useState<
    'idle' | 'validating' | 'valid' | 'invalid'
  >('idle');

  // Reset completion flag when changing videos
  useEffect(() => {
    setHasCompleted(false);
  }, [src]);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const lastSaveTimeRef = useRef(0);
  const trackRef = useRef<HTMLTrackElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });

  /**
   * Check if user is currently interacting with controls
   */
  const isUserInteracting = useCallback(() => {
    // Check if speed menu is open
    if (showSpeedMenu) {
      return true;
    }

    // Check if any control element has focus
    const activeElement = document.activeElement;
    const videoContainer = videoRef.current?.parentElement;

    if (activeElement && videoContainer?.contains(activeElement)) {
      // Ignore the video element itself - it should not prevent control hiding
      if (activeElement === videoRef.current) {
        return false;
      }

      // Check if focused element is a control (button, input, etc.)
      const isControl = activeElement.matches('button, input, [tabindex]');
      if (isControl) {
        return true;
      }
    }

    return false;
  }, [showSpeedMenu]);

  /**
   * Clear controls timeout
   */
  const clearControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, []);

  /**
   * Show controls and set auto-hide timer
   */
  const showControlsWithTimer = useCallback(() => {
    setShowControls(true);
    clearControlsTimeout();

    // In fullscreen mode, only hide if video is playing
    if (isFullscreen) {
      if (isPlaying) {
        controlsTimeoutRef.current = globalThis.setTimeout(() => {
          setShowControls(false);
        }, CONTROLS_HIDE_TIMEOUT) as unknown as number;
      }
    } else {
      // In normal mode, always set a timer to hide controls
      controlsTimeoutRef.current = globalThis.setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_TIMEOUT) as unknown as number;
    }
  }, [isFullscreen, isPlaying, clearControlsTimeout]);

  /**
   * Handle mouse move with position detection
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const currentX = event.clientX;
      const currentY = event.clientY;
      const lastPos = lastMousePositionRef.current;

      // Check if mouse actually moved (minimum 5px threshold)
      const hasMoved =
        Math.abs(currentX - lastPos.x) > 5 ||
        Math.abs(currentY - lastPos.y) > 5;

      if (hasMoved) {
        lastMousePositionRef.current = { x: currentX, y: currentY };
        showControlsWithTimer();
      }
    },
    [showControlsWithTimer]
  );

  /**
   * Handle mouse enter to show controls with appropriate timer logic
   */
  const handleMouseEnter = useCallback(() => {
    showControlsWithTimer();
  }, [showControlsWithTimer]);

  /**
   * Handle mouse leave to hide controls faster
   */
  const handleMouseLeave = useCallback(() => {
    const userInteracting = isUserInteracting();
    clearControlsTimeout();

    // Hide controls when mouse leaves, except when in fullscreen or user is interacting
    if (!isFullscreen && !userInteracting) {
      // Use shorter timeout when mouse leaves
      controlsTimeoutRef.current = globalThis.setTimeout(() => {
        setShowControls(false);
      }, LEAVE_HIDE_TIMEOUT) as unknown as number;
    }
  }, [isFullscreen, clearControlsTimeout, isUserInteracting]);

  /**
   * Initialize video element properties
   */
  useEffect(() => {
    // Set initial volume
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  /**
   * Synchronize isPlaying state with media events
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  /**
   * Set iOS/Safari inline playback attributes imperatively
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure inline playback on iOS/Safari
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
  }, []);

  /**
   * Handle controls auto-hide when play state changes
   */
  useEffect(() => {
    if (isPlaying) {
      // Start timer when video starts playing
      showControlsWithTimer();
    } else {
      // Keep controls visible when paused only in fullscreen
      clearControlsTimeout();
      if (isFullscreen) {
        setShowControls(true);
      } else {
        // In normal mode (not fullscreen), initialize timer even when paused
        // This ensures controls will hide properly from the start
        showControlsWithTimer();
      }
    }
  }, [isPlaying, isFullscreen, showControlsWithTimer, clearControlsTimeout]);

  /**
   * Handle fullscreen state changes from browser events
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      // Show controls when entering fullscreen, hide after timeout if playing
      if (isCurrentlyFullscreen) {
        showControlsWithTimer();
      }
    };

    // Safari iOS-specific fullscreen event handlers
    const handleWebkitBeginFullscreen = () => {
      setIsFullscreen(true);
      showControlsWithTimer();
    };

    const handleWebkitEndFullscreen = () => {
      setIsFullscreen(false);
    };

    // Standard fullscreen events
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Safari iOS fullscreen events
    video.addEventListener(
      'webkitbeginfullscreen',
      handleWebkitBeginFullscreen
    );
    video.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      video.removeEventListener(
        'webkitbeginfullscreen',
        handleWebkitBeginFullscreen
      );
      video.removeEventListener(
        'webkitendfullscreen',
        handleWebkitEndFullscreen
      );
    };
  }, [showControlsWithTimer]);

  /**
   * Initialize controls behavior on component mount
   * This ensures controls work correctly from the first load
   */
  useEffect(() => {
    const init = () => {
      if (!isFullscreen) {
        showControlsWithTimer();
      }
    };
    // Prefer rAF to avoid arbitrary timing if available; fall back to INIT_DELAY.
    let raf1 = 0,
      raf2 = 0,
      tid: number | undefined;
    if (globalThis.requestAnimationFrame === undefined) {
      tid = globalThis.setTimeout(init, INIT_DELAY) as unknown as number;
      return () => {
        if (tid) clearTimeout(tid);
      };
    } else {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(init);
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
  }, []); // Run only once on mount

  /**
   * Get initial time from props or localStorage
   */
  const getInitialTime = useCallback((): number | undefined => {
    if (!autoSave || !storageKey) {
      return Number.isFinite(initialTime) && initialTime >= 0
        ? initialTime
        : undefined;
    }

    const saved = Number(
      localStorage.getItem(`${storageKey}-${src}`) || Number.NaN
    );
    const hasValidInitial = Number.isFinite(initialTime) && initialTime >= 0;
    const hasValidSaved = Number.isFinite(saved) && saved >= 0;

    if (hasValidInitial) return initialTime;
    if (hasValidSaved) return saved;
    return undefined;
  }, [autoSave, storageKey, src, initialTime]);

  /**
   * Load saved progress from localStorage
   */
  useEffect(() => {
    const start = getInitialTime();
    if (start !== undefined && videoRef.current) {
      videoRef.current.currentTime = start;
      setCurrentTime(start);
    }
  }, [getInitialTime]);

  /**
   * Save progress to localStorage periodically
   */
  const saveProgress = useCallback(
    (time: number) => {
      if (!autoSave || !storageKey) return;

      const now = Date.now();
      if (now - lastSaveTimeRef.current > 5000) {
        localStorage.setItem(`${storageKey}-${src}`, time.toString());
        lastSaveTimeRef.current = now;
      }
    },
    [autoSave, storageKey, src]
  );

  /**
   * Handle play/pause toggle
   */
  const togglePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    try {
      await video.play();
    } catch {
      // Playback prevented (e.g., autoplay policy); keep state unchanged.
    }
  }, []);

  /**
   * Handle volume change
   */
  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      const video = videoRef.current;
      if (!video) return;

      const volumeValue = newVolume / 100; // Convert 0-100 to 0-1
      video.volume = volumeValue;
      setVolume(volumeValue);

      // Auto mute/unmute based on volume
      const shouldMute = volumeValue === 0;
      const shouldUnmute = volumeValue > 0 && isMuted;

      if (shouldMute) {
        video.muted = true;
        setIsMuted(true);
      } else if (shouldUnmute) {
        video.muted = false;
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  /**
   * Handle mute toggle
   */
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      // Unmute: restore volume or set to 50% if it was 0
      const restoreVolume = volume > 0 ? volume : 0.5;
      video.volume = restoreVolume;
      video.muted = false;
      setVolume(restoreVolume);
      setIsMuted(false);
    } else {
      // Mute: set volume to 0 and mute
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  /**
   * Handle video seek
   */
  const handleSeek = useCallback((newTime: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
    }
  }, []);

  /**
   * Detect if running on Safari iOS
   */
  const isSafariIOS = useCallback((): boolean => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isWebKit = /WebKit/.test(ua);
    const isNotChrome = !/CriOS|Chrome/.test(ua);
    return isIOS && isWebKit && isNotChrome;
  }, []);

  /**
   * Handle fullscreen toggle
   */
  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    const container = video?.parentElement;
    if (!video || !container) return;

    // Safari iOS requires using webkitEnterFullscreen on video element
    if (isSafariIOS()) {
      // Type assertion for Safari-specific API
      const videoElement = video as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
        webkitDisplayingFullscreen?: boolean;
      };

      if (!isFullscreen && videoElement.webkitEnterFullscreen) {
        videoElement.webkitEnterFullscreen();
      } else if (isFullscreen && videoElement.webkitExitFullscreen) {
        videoElement.webkitExitFullscreen();
      }
    } else if (!isFullscreen && container.requestFullscreen) {
      // Standard fullscreen API for other browsers
      container.requestFullscreen();
    } else if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, [isFullscreen, isSafariIOS]);

  /**
   * Handle playback speed change
   */
  const handleSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSpeedMenu(false);
    }
  }, []);

  /**
   * Toggle speed menu visibility
   */
  const toggleSpeedMenu = useCallback(() => {
    setShowSpeedMenu(!showSpeedMenu);
  }, [showSpeedMenu]);

  /**
   * Toggle captions visibility
   */
  const toggleCaptions = useCallback(() => {
    if (
      !trackRef.current?.track ||
      !subtitles ||
      subtitlesValidation !== 'valid'
    )
      return;

    const newShowCaptions = !showCaptions;
    setShowCaptions(newShowCaptions);

    // Control track mode programmatically - we already validated subtitles above
    trackRef.current.track.mode = newShowCaptions ? 'showing' : 'hidden';
  }, [showCaptions, subtitles, subtitlesValidation]);

  /**
   * Check video completion and fire callback
   */
  const checkVideoCompletion = useCallback(
    (progressPercent: number) => {
      if (progressPercent >= 95 && !hasCompleted) {
        setHasCompleted(true);
        onVideoComplete?.();
      }
    },
    [hasCompleted, onVideoComplete]
  );

  /**
   * Handle time update
   */
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    setCurrentTime(current);

    // Save progress periodically
    saveProgress(current);

    // Fire callbacks
    onTimeUpdate?.(current);

    if (duration > 0) {
      const progressPercent = (current / duration) * 100;
      onProgress?.(progressPercent);
      checkVideoCompletion(progressPercent);
    }
  }, [duration, saveProgress, onTimeUpdate, onProgress, checkVideoCompletion]);

  /**
   * Handle loaded metadata
   */
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  /**
   * Validate subtitles URL before showing the button
   */
  useEffect(() => {
    const controller = new AbortController();

    const validateSubtitles = async () => {
      // If no subtitles, mark as idle
      if (!subtitles) {
        setSubtitlesValidation('idle');
        return;
      }

      // Start validation
      setSubtitlesValidation('validating');

      try {
        // Check if it's a data URL (inline VTT)
        if (subtitles.startsWith('data:')) {
          setSubtitlesValidation('valid');
          return;
        }

        // Fetch the subtitles file to validate it
        const response = await fetch(subtitles, {
          method: 'HEAD',
          signal: controller.signal,
        });

        if (response.ok) {
          // Optionally check content type
          const contentType = response.headers.get('content-type');
          const isValidType =
            !contentType ||
            contentType.includes('text/vtt') ||
            contentType.includes('text/plain') ||
            contentType.includes('application/octet-stream');

          if (isValidType) {
            setSubtitlesValidation('valid');
          } else {
            setSubtitlesValidation('invalid');
            console.warn(
              `Subtitles URL has invalid content type: ${contentType}`
            );
          }
        } else {
          setSubtitlesValidation('invalid');
          console.warn(
            `Subtitles URL returned status: ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        // Ignore AbortError - it's expected when cleaning up
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.warn('Subtitles URL validation failed:', error);
        setSubtitlesValidation('invalid');
      }
    };

    validateSubtitles();

    // Cleanup: abort ongoing fetch to prevent stale updates
    return () => {
      controller.abort();
    };
  }, [subtitles]);

  /**
   * Initialize track mode when track is available
   */
  useEffect(() => {
    if (trackRef.current?.track) {
      // Set initial mode based on showCaptions state and subtitle availability
      trackRef.current.track.mode =
        showCaptions && subtitles && subtitlesValidation === 'valid'
          ? 'showing'
          : 'hidden';
    }
  }, [subtitles, showCaptions, subtitlesValidation]);

  /**
   * Handle visibility change and blur to pause video when losing focus
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    const handleBlur = () => {
      if (isPlaying && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    globalThis.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      globalThis.removeEventListener('blur', handleBlur);
      // Clean up timers on unmount
      clearControlsTimeout();
    };
  }, [isPlaying, clearControlsTimeout]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  /**
   * Get responsive icon size based on screen size
   */
  const getIconSize = useCallback(() => {
    if (isTinyMobile) return 18;
    if (isUltraSmallMobile) return 20;
    return 24;
  }, [isTinyMobile, isUltraSmallMobile]);

  /**
   * Get responsive padding classes for controls
   */
  const getControlsPadding = useCallback(() => {
    if (isTinyMobile) return 'px-2 pb-2 pt-1';
    if (isUltraSmallMobile) return 'px-3 pb-3 pt-1';
    return 'px-4 pb-4';
  }, [isTinyMobile, isUltraSmallMobile]);

  /**
   * Get responsive gap classes for controls
   */
  const getControlsGap = useCallback(() => {
    if (isTinyMobile) return 'gap-1';
    if (isUltraSmallMobile) return 'gap-2';
    return 'gap-4';
  }, [isTinyMobile, isUltraSmallMobile]);

  /**
   * Get responsive padding for progress bar
   */
  const getProgressBarPadding = useCallback(() => {
    if (isTinyMobile) return 'px-2 pb-1';
    if (isUltraSmallMobile) return 'px-3 pb-1';
    return 'px-4 pb-2';
  }, [isTinyMobile, isUltraSmallMobile]);

  /**
   * Get responsive positioning classes for center play button
   */
  const getCenterPlayButtonPosition = useCallback(() => {
    if (isTinyMobile) return 'items-center justify-center -translate-y-12';
    if (isUltraSmallMobile) return 'items-center justify-center -translate-y-8';
    return 'items-center justify-center';
  }, [isTinyMobile, isUltraSmallMobile]);

  /**
   * Calculate top controls opacity based on state
   */
  const getTopControlsOpacity = useCallback(() => {
    return showControls ? 'opacity-100' : 'opacity-0';
  }, [showControls]);

  /**
   * Calculate bottom controls opacity based on state
   */
  const getBottomControlsOpacity = useCallback(() => {
    return showControls ? 'opacity-100' : 'opacity-0';
  }, [showControls]);

  /**
   * Seek video backward
   */
  const seekBackward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  }, []);

  /**
   * Seek video forward
   */
  const seekForward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  }, []);

  /**
   * Increase volume
   */
  const increaseVolume = useCallback(() => {
    handleVolumeChange(Math.min(100, volume * 100 + 10));
  }, [handleVolumeChange, volume]);

  /**
   * Decrease volume
   */
  const decreaseVolume = useCallback(() => {
    handleVolumeChange(Math.max(0, volume * 100 - 10));
  }, [handleVolumeChange, volume]);

  /**
   * Handle video element keyboard events
   */
  const handleVideoKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!e.key) return;

      // Prevent bubbling to parent handlers to avoid double toggles
      e.stopPropagation();
      showControlsWithTimer();

      // Map of key handlers for better maintainability and reduced complexity
      const keyHandlers: Record<string, () => void | Promise<void>> = {
        ' ': togglePlayPause,
        Enter: togglePlayPause,
        ArrowLeft: seekBackward,
        ArrowRight: seekForward,
        ArrowUp: increaseVolume,
        ArrowDown: decreaseVolume,
        m: toggleMute,
        M: toggleMute,
        f: toggleFullscreen,
        F: toggleFullscreen,
      };

      const handler = keyHandlers[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    [
      showControlsWithTimer,
      togglePlayPause,
      seekBackward,
      seekForward,
      increaseVolume,
      decreaseVolume,
      toggleMute,
      toggleFullscreen,
    ]
  );

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Integrated Header */}
      {(title || subtitleText) && (
        <div className="bg-subject-1 px-8 py-4 flex items-end justify-between min-h-20">
          <div className="flex flex-col gap-1">
            {title && (
              <Text
                as="h2"
                size="lg"
                weight="bold"
                color="text-text-900"
                className="leading-5 tracking-wide"
              >
                {title}
              </Text>
            )}
            {subtitleText && (
              <Text
                as="p"
                size="sm"
                weight="normal"
                color="text-text-600"
                className="leading-5"
              >
                {subtitleText}
              </Text>
            )}
          </div>

          {/* Download Button */}
          {showDownloadButton && downloadContent && (
            <DownloadButton
              content={downloadContent}
              lessonTitle={title}
              onDownloadStart={onDownloadStart}
              onDownloadComplete={onDownloadComplete}
              onDownloadError={onDownloadError}
              className="flex-shrink-0"
            />
          )}
        </div>
      )}

      {/* Video Container */}
      <section
        className={cn(
          'relative w-full bg-background overflow-hidden group',
          'rounded-b-xl',
          // Hide cursor when controls are hidden and video is playing
          isPlaying && !showControls
            ? 'cursor-none group-hover:cursor-default'
            : 'cursor-default'
        )}
        aria-label={title ? `Video player: ${title}` : 'Video player'}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain analytica-video"
          controlsList="nodownload"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlayPause}
          onKeyDown={handleVideoKeyDown}
          tabIndex={0}
          aria-label={title ? `Video: ${title}` : 'Video player'}
        >
          <track
            ref={trackRef}
            kind="captions"
            src={
              subtitles && subtitlesValidation === 'valid'
                ? subtitles
                : 'data:text/vtt;charset=utf-8,WEBVTT'
            }
            srcLang="pt-br"
            label={
              subtitles && subtitlesValidation === 'valid'
                ? 'Legendas em Português'
                : 'Sem legendas disponíveis'
            }
            default={false}
          />
        </video>

        {/* Center Play Button */}
        {!isPlaying && (
          <div
            className={cn(
              'absolute inset-0 flex bg-black/30 transition-opacity',
              getCenterPlayButtonPosition()
            )}
          >
            <IconButton
              icon={<Play size={32} weight="regular" className="ml-1" />}
              onClick={togglePlayPause}
              aria-label="Play video"
              className="!bg-transparent !text-white !w-auto !h-auto hover:!bg-transparent hover:!text-gray-200"
            />
          </div>
        )}

        {/* Top Controls */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity',
            getTopControlsOpacity()
          )}
        >
          <div className="flex justify-start">
            <IconButton
              icon={
                isFullscreen ? (
                  <ArrowsInSimple size={24} />
                ) : (
                  <ArrowsOutSimple size={24} />
                )
              }
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="!bg-transparent !text-white hover:!bg-white/20"
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity',
            getBottomControlsOpacity()
          )}
        >
          {/* Progress Bar */}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            progressPercentage={progressPercentage}
            onSeek={handleSeek}
            className={getProgressBarPadding()}
          />

          {/* Control Buttons */}
          <div
            className={cn(
              'flex items-center justify-between',
              getControlsPadding()
            )}
          >
            {/* Left Controls */}
            <div className={cn('flex items-center', getControlsGap())}>
              {/* Play/Pause */}
              <IconButton
                icon={
                  isPlaying ? (
                    <Pause size={getIconSize()} />
                  ) : (
                    <Play size={getIconSize()} />
                  )
                }
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="!bg-transparent !text-white hover:!bg-white/20"
              />

              {/* Volume */}
              <VolumeControls
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={handleVolumeChange}
                onToggleMute={toggleMute}
                iconSize={getIconSize()}
                showSlider={!isUltraSmallMobile}
              />

              {/* Captions - Only show after validation is complete and valid */}
              {subtitles && subtitlesValidation === 'valid' && (
                <IconButton
                  icon={<ClosedCaptioning size={getIconSize()} />}
                  onClick={toggleCaptions}
                  aria-label={showCaptions ? 'Hide captions' : 'Show captions'}
                  className={cn(
                    '!bg-transparent hover:!bg-white/20',
                    showCaptions ? '!text-primary-400' : '!text-white'
                  )}
                />
              )}

              {/* Time Display */}
              <Text size="sm" weight="medium" color="text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              {/* Speed Control */}
              <SpeedMenu
                showSpeedMenu={showSpeedMenu}
                playbackRate={playbackRate}
                onToggleMenu={toggleSpeedMenu}
                onSpeedChange={handleSpeedChange}
                iconSize={getIconSize()}
                isTinyMobile={isTinyMobile}
                isFullscreen={isFullscreen}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideoPlayer;
