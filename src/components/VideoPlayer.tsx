import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SpeakerHigh,
  SpeakerSlash,
  ArrowsOutSimple,
  ArrowsInSimple,
  DotsThreeVertical,
} from 'phosphor-react';
import { cn } from '../utils/utils';
import IconButton from './IconButton/IconButton';
import Text from './Text/Text';
import IconRender from './IconRender/IconRender';
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './DropdownMenu/DropdownMenu';

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
  /** Callback fired when video is downloaded */
  onDownload?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show download button */
  showDownload?: boolean;
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
  onDownload,
  className,
  showDownload = true,
  autoSave = true,
  storageKey = 'video-progress',
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [hasCompleted, setHasCompleted] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const lastSaveTimeRef = useRef(0);

  /**
   * Load saved progress from localStorage
   */
  useEffect(() => {
    if (!autoSave || !storageKey) return;

    const savedTime = localStorage.getItem(`${storageKey}-${src}`);
    if (savedTime && videoRef.current) {
      const time = parseFloat(savedTime);
      videoRef.current.currentTime = initialTime || time;
      setCurrentTime(initialTime || time);
    } else if (initialTime && videoRef.current) {
      videoRef.current.currentTime = initialTime;
      setCurrentTime(initialTime);
    }
  }, [src, storageKey, autoSave, initialTime]);

  /**
   * Save progress to localStorage periodically
   */
  const saveProgress = useCallback(() => {
    if (!autoSave || !storageKey) return;

    const now = Date.now();
    if (now - lastSaveTimeRef.current > 5000) {
      localStorage.setItem(`${storageKey}-${src}`, currentTime.toString());
      lastSaveTimeRef.current = now;
    }
  }, [autoSave, storageKey, src, currentTime]);

  /**
   * Handle play/pause toggle
   */
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  /**
   * Handle mute toggle
   */
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  /**
   * Handle fullscreen toggle
   */
  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  /**
   * Handle video download
   */
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'video';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload?.();
  }, [src, title, onDownload]);

  /**
   * Handle playback speed change
   */
  const handleSpeedChange = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  /**
   * Handle time update
   */
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Save progress periodically
    saveProgress();

    // Fire callbacks
    onTimeUpdate?.(current);

    if (duration > 0) {
      const progressPercent = (current / duration) * 100;
      onProgress?.(progressPercent);

      // Check for completion (>95% watched)
      if (progressPercent >= 95 && !hasCompleted) {
        setHasCompleted(true);
        onVideoComplete?.();
      }
    }
  }, [
    duration,
    saveProgress,
    onTimeUpdate,
    onProgress,
    onVideoComplete,
    hasCompleted,
  ]);

  /**
   * Handle loaded metadata
   */
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  }, []);

  /**
   * Handle controls visibility
   */
  const handleMouseMove = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Integrated Header */}
      {(title || subtitleText) && (
        <div className="bg-subject-1 rounded-t-xl px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {title && (
              <Text as="h2" size="lg" weight="bold" color="text-text-900">
                {title}
              </Text>
            )}
            {subtitleText && (
              <Text as="p" size="sm" weight="normal" color="text-text-600">
                {subtitleText}
              </Text>
            )}
          </div>
          {showDownload && (
            <button
              className="cursor-pointer hover:opacity-70 transition-opacity bg-transparent border-none p-0"
              onClick={handleDownload}
              aria-label="Download video"
            >
              <IconRender iconName="DownloadSimple" size={24} color="#404040" />
            </button>
          )}
        </div>
      )}

      {/* Video Container */}
      <div
        className={cn(
          'relative w-full bg-background overflow-hidden group',
          title || subtitleText ? 'rounded-b-xl' : 'rounded-xl'
        )}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlayPause}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePlayPause();
            }
          }}
          tabIndex={0}
          aria-label={title ? `Video: ${title}` : 'Video player'}
        >
          <track
            kind="captions"
            src={
              subtitles ||
              'data:text/vtt;charset=utf-8,WEBVTT%0A%0ANOTE%20No%20captions%20available'
            }
            srcLang="en"
            label={subtitles ? 'Subtitles' : 'No captions available'}
            default={!!subtitles}
          />
        </video>

        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
              <IconButton
                icon={<Play size={32} weight="fill" className="ml-1" />}
                onClick={togglePlayPause}
                aria-label="Play video"
                className="!bg-transparent !text-neutral-900 !w-auto !h-auto hover:!bg-transparent"
              />
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="ml-auto block">
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
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.currentTime = newTime;
                }
              }}
              className="w-full h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer slider:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Video progress"
              style={{
                background: `linear-gradient(to right, #2563eb ${progressPercentage}%, #525252 ${progressPercentage}%)`,
              }}
            />
          </div>

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
              <IconButton
                icon={
                  isMuted ? (
                    <SpeakerSlash size={24} />
                  ) : (
                    <SpeakerHigh size={24} />
                  )
                }
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="!bg-transparent !text-white hover:!bg-white/20"
              />

              {/* Time Display */}
              <Text size="sm" weight="medium" color="text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Speed Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="!bg-transparent !text-white hover:!bg-white/20 p-2 rounded-lg"
                  aria-label="Playback speed"
                >
                  <DotsThreeVertical size={24} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-neutral-800 border-neutral-700">
                  {[0.5, 1, 1.5, 2].map((speed) => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={cn(
                        'text-white hover:bg-white/20 focus:bg-white/20',
                        playbackSpeed === speed && 'bg-white/10'
                      )}
                    >
                      {speed}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
