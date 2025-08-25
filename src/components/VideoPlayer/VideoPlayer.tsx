import {
  useRef,
  useState,
  useEffect,
  useCallback,
  MouseEvent,
  KeyboardEvent,
} from 'react';
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

// Constants for timeout durations
const CONTROLS_HIDE_TIMEOUT = 3000; // 3 seconds for normal control hiding
const LEAVE_HIDE_TIMEOUT = 1000; // 1 second when mouse leaves the video area

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
}

/**
 * Format seconds to MM:SS display format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
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
}: ProgressBarProps) => (
  <div className="px-4 pb-2">
    <input
      type="range"
      min={0}
      max={duration || 100}
      value={currentTime}
      onChange={(e) => onSeek(parseFloat(e.target.value))}
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
}

/**
 * Volume controls subcomponent
 */
const VolumeControls = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlsProps) => (
  <div className="flex items-center gap-2">
    <IconButton
      icon={isMuted ? <SpeakerSlash size={24} /> : <SpeakerHigh size={24} />}
      onClick={onToggleMute}
      aria-label={isMuted ? 'Unmute' : 'Mute'}
      className="!bg-transparent !text-white hover:!bg-white/20"
    />

    <input
      type="range"
      min={0}
      max={100}
      value={Math.round(volume * 100)}
      onChange={(e) => onVolumeChange(parseInt(e.target.value))}
      className="w-20 h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label="Volume control"
      style={{
        background: `linear-gradient(to right, var(--color-primary-700) ${volume * 100}%, var(--color-secondary-300) ${volume * 100}%)`,
      }}
    />
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
}

/**
 * Speed menu subcomponent
 */
const SpeedMenu = ({
  showSpeedMenu,
  playbackRate,
  onToggleMenu,
  onSpeedChange,
}: SpeedMenuProps) => (
  <div className="relative">
    <IconButton
      icon={<DotsThreeVertical size={24} />}
      onClick={onToggleMenu}
      aria-label="Playback speed"
      className="!bg-transparent !text-white hover:!bg-white/20"
    />
    {showSpeedMenu && (
      <div className="absolute bottom-12 right-0 bg-black/90 rounded-lg p-2 min-w-20">
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-white/20 transition-colors ${
              playbackRate === speed ? 'text-primary-400' : 'text-white'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    )}
  </div>
);

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
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);

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
  const mouseMoveTimeoutRef = useRef<number | null>(null);

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
   * Clear mouse move timeout
   */
  const clearMouseMoveTimeout = useCallback(() => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
      mouseMoveTimeoutRef.current = null;
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
        controlsTimeoutRef.current = window.setTimeout(() => {
          setShowControls(false);
        }, CONTROLS_HIDE_TIMEOUT);
      }
    } else {
      // In normal mode, always set a timer to hide controls
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_TIMEOUT);
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
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, LEAVE_HIDE_TIMEOUT);
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
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      // Show controls when entering fullscreen, hide after timeout if playing
      if (isCurrentlyFullscreen) {
        showControlsWithTimer();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [showControlsWithTimer]);

  /**
   * Initialize controls behavior on component mount
   * This ensures controls work correctly from the first load
   */
  useEffect(() => {
    // Use a small delay to ensure proper initialization after all other effects
    const initTimer = setTimeout(() => {
      if (!isFullscreen) {
        showControlsWithTimer();
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
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

    const saved = Number(localStorage.getItem(`${storageKey}-${src}`) || NaN);
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
   * Handle fullscreen toggle
   */
  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen && container.requestFullscreen) {
      container.requestFullscreen();
    } else if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

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
    if (!trackRef.current?.track || !subtitles) return;

    const newShowCaptions = !showCaptions;
    setShowCaptions(newShowCaptions);

    // Control track mode programmatically - only show if subtitles are available
    trackRef.current.track.mode =
      newShowCaptions && subtitles ? 'showing' : 'hidden';
  }, [showCaptions, subtitles]);

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
   * Initialize track mode when track is available
   */
  useEffect(() => {
    if (trackRef.current?.track) {
      // Set initial mode based on showCaptions state and subtitle availability
      trackRef.current.track.mode =
        showCaptions && subtitles ? 'showing' : 'hidden';
    }
  }, [subtitles, showCaptions]);

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
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      // Clean up timers on unmount
      clearControlsTimeout();
      clearMouseMoveTimeout();
    };
  }, [isPlaying, clearControlsTimeout, clearMouseMoveTimeout]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

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
   * Handle video element keyboard events
   */
  const handleVideoKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key) {
        // Prevent bubbling to parent handlers to avoid double toggles
        e.stopPropagation();
        showControlsWithTimer();
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime -= 10;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime += 10;
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(100, volume * 100 + 10));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume * 100 - 10));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    },
    [
      showControlsWithTimer,
      togglePlayPause,
      handleVolumeChange,
      volume,
      toggleMute,
      toggleFullscreen,
    ]
  );

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Integrated Header */}
      {(title || subtitleText) && (
        <div className="bg-subject-1 rounded-t-xl px-8 py-4 flex items-end justify-between min-h-20">
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
        </div>
      )}

      {/* Video Container */}
      <section
        className={cn(
          'relative w-full bg-background overflow-hidden group',
          title || subtitleText ? 'rounded-b-xl' : 'rounded-xl',
          // Hide cursor when controls are hidden and video is playing
          isPlaying && !showControls
            ? 'cursor-none group-hover:cursor-default'
            : 'cursor-default'
        )}
        aria-label={title ? `Video player: ${title}` : 'Video player'}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          controlsList="nodownload"
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
            src={subtitles || 'data:text/vtt;charset=utf-8,WEBVTT'}
            srcLang="pt-br"
            label={
              subtitles ? 'Legendas em Português' : 'Sem legendas disponíveis'
            }
            default={false}
          />
        </video>

        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
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
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between px-4 pb-4">
            {/* Left Controls */}
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <IconButton
                icon={isPlaying ? <Pause size={24} /> : <Play size={24} />}
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
              />

              {/* Captions */}
              {subtitles && (
                <IconButton
                  icon={<ClosedCaptioning size={24} />}
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
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideoPlayer;
