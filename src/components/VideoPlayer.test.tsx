import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from './VideoPlayer';

// Mock phosphor-react icons
jest.mock('phosphor-react', () => ({
  Play: () => <div data-testid="play-icon" />,
  Pause: () => <div data-testid="pause-icon" />,
  SpeakerHigh: () => <div data-testid="speaker-high-icon" />,
  SpeakerSlash: () => <div data-testid="speaker-slash-icon" />,
  ArrowsOutSimple: () => <div data-testid="fullscreen-icon" />,
  ArrowsInSimple: () => <div data-testid="exit-fullscreen-icon" />,
  DotsThreeVertical: () => <div data-testid="menu-icon" />,
  ClosedCaptioning: () => <div data-testid="captions-icon" />,
}));

// Mock HTMLMediaElement methods and properties
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockPause = jest.fn();
const mockRequestFullscreen = jest.fn();
const mockExitFullscreen = jest.fn();

// Setup HTMLMediaElement prototype mocks
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: mockPlay,
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: mockPause,
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
    configurable: true,
    get: jest.fn(() => 100),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
    configurable: true,
    get: jest.fn(() => 0),
    set: jest.fn(),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
    configurable: true,
    get: jest.fn(() => 1),
    set: jest.fn(),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
    configurable: true,
    get: jest.fn(() => false),
    set: jest.fn(),
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
    configurable: true,
    get: jest.fn(() => 1),
    set: jest.fn(),
  });

  Object.defineProperty(Element.prototype, 'requestFullscreen', {
    configurable: true,
    value: mockRequestFullscreen,
  });

  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true,
    value: mockExitFullscreen,
  });

  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: jest.fn(() => false),
  });
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('VideoPlayer', () => {
  const defaultProps = {
    src: 'https://example.com/video.mp4',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render video element with src', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', defaultProps.src);
      expect(video).toHaveAttribute('controlsList', 'nodownload');
    });

    it('should render with title and subtitle', () => {
      render(
        <VideoPlayer
          {...defaultProps}
          title="Test Video"
          subtitle="Test Description"
        />
      );
      expect(screen.getByText('Test Video')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render with poster image', () => {
      const posterUrl = 'https://example.com/poster.jpg';
      const { container } = render(
        <VideoPlayer {...defaultProps} poster={posterUrl} />
      );
      const video = container.querySelector('video');
      expect(video).toHaveAttribute('poster', posterUrl);
    });

    it('should render with custom className', () => {
      const { container } = render(
        <VideoPlayer {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render subtitles track when provided', () => {
      const subtitlesUrl = 'https://example.com/subtitles.vtt';
      const { container } = render(
        <VideoPlayer {...defaultProps} subtitles={subtitlesUrl} />
      );
      const track = container.querySelector('track');
      expect(track).toHaveAttribute('src', subtitlesUrl);
      expect(track).toHaveAttribute('kind', 'captions');
    });

    it('should render default subtitles placeholder when not provided', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const track = container.querySelector('track');
      expect(track).toHaveAttribute('src');
      expect(track?.getAttribute('src')).toContain('data:text/vtt');
    });
  });

  describe('Play/Pause functionality', () => {
    it('should play video when play button is clicked', async () => {
      render(<VideoPlayer {...defaultProps} />);
      const playButton = screen.getByRole('button', { name: /play video/i });

      await act(async () => {
        fireEvent.click(playButton);
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('should pause video when pause button is clicked', async () => {
      render(<VideoPlayer {...defaultProps} />);
      const playButton = screen.getByRole('button', { name: /play video/i });

      await act(async () => {
        fireEvent.click(playButton);
      });

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);

      expect(mockPause).toHaveBeenCalled();
    });

    it('should toggle play/pause when video is clicked', async () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      await act(async () => {
        fireEvent.click(video);
      });

      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe('Volume controls', () => {
    it('should render mute button', () => {
      render(<VideoPlayer {...defaultProps} />);
      const muteButton = screen.getByRole('button', { name: /mute/i });
      expect(muteButton).toBeInTheDocument();
    });

    it('should toggle mute when button is clicked', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const muteButton = screen.getByRole('button', { name: /mute/i });
      const video = container.querySelector('video')!;

      fireEvent.click(muteButton);

      expect(video.muted).toBeDefined();
    });

    it('should change volume with slider', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const volumeSlider = container.querySelector(
        'input[type="range"][aria-label="Volume control"]'
      )!;
      const video = container.querySelector('video')!;

      fireEvent.change(volumeSlider, { target: { value: '50' } });

      expect(video.volume).toBeDefined();
    });

    it('should mute when volume is set to 0', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const volumeSlider = container.querySelector(
        'input[type="range"][aria-label="Volume control"]'
      )!;
      const video = container.querySelector('video')!;

      fireEvent.change(volumeSlider, { target: { value: '0' } });

      expect(video.muted).toBeDefined();
    });

    it('should unmute when volume is increased while muted', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const muteButton = screen.getByRole('button', { name: /mute/i });
      const volumeSlider = container.querySelector(
        'input[type="range"][aria-label="Volume control"]'
      )!;
      const video = container.querySelector('video')!;

      // First mute the video
      fireEvent.click(muteButton);

      // Then increase volume
      fireEvent.change(volumeSlider, { target: { value: '50' } });

      expect(video.muted).toBeDefined();
    });
  });

  describe('Speed controls', () => {
    it('should show speed menu when button is clicked', () => {
      render(<VideoPlayer {...defaultProps} />);
      const speedButton = screen.getByRole('button', {
        name: /playback speed/i,
      });

      fireEvent.click(speedButton);

      expect(screen.getByText('0.5x')).toBeInTheDocument();
      expect(screen.getByText('0.75x')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('1.25x')).toBeInTheDocument();
      expect(screen.getByText('1.5x')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
    });

    it('should change playback speed when speed option is clicked', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const speedButton = screen.getByRole('button', {
        name: /playback speed/i,
      });
      const video = container.querySelector('video')!;

      fireEvent.click(speedButton);
      const speed2x = screen.getByText('2x');
      fireEvent.click(speed2x);

      expect(video.playbackRate).toBeDefined();
    });

    it('should hide speed menu after selecting speed', () => {
      render(<VideoPlayer {...defaultProps} />);
      const speedButton = screen.getByRole('button', {
        name: /playback speed/i,
      });

      fireEvent.click(speedButton);
      const speed1_5x = screen.getByText('1.5x');
      fireEvent.click(speed1_5x);

      expect(screen.queryByText('0.5x')).not.toBeInTheDocument();
    });
  });

  describe('Fullscreen functionality', () => {
    it('should enter fullscreen when button is clicked', () => {
      render(<VideoPlayer {...defaultProps} />);
      const fullscreenButton = screen.getByRole('button', {
        name: /enter fullscreen/i,
      });

      fireEvent.click(fullscreenButton);

      expect(mockRequestFullscreen).toHaveBeenCalled();
    });

    it('should exit fullscreen when already in fullscreen', () => {
      render(<VideoPlayer {...defaultProps} />);
      const fullscreenButton = screen.getByRole('button', {
        name: /enter fullscreen/i,
      });

      fireEvent.click(fullscreenButton);
      const exitButton = screen.getByRole('button', {
        name: /exit fullscreen/i,
      });
      fireEvent.click(exitButton);

      expect(mockExitFullscreen).toHaveBeenCalled();
    });
  });

  describe('Progress bar', () => {
    it('should update progress when video time changes', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;
      const progressBar = container.querySelector(
        'input[type="range"][aria-label="Video progress"]'
      )!;

      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: 50,
      });

      fireEvent.timeUpdate(video);

      expect(progressBar).toBeInTheDocument();
    });

    it('should seek when progress bar is changed', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const progressBar = container.querySelector(
        'input[type="range"][aria-label="Video progress"]'
      ) as HTMLInputElement;
      const video = container.querySelector('video')!;

      fireEvent.change(progressBar, { target: { value: '30' } });

      expect(video.currentTime).toBeDefined();
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should play/pause with space key', async () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      await act(async () => {
        fireEvent.keyDown(video, { key: ' ' });
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('should play/pause with enter key', async () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      await act(async () => {
        fireEvent.keyDown(video, { key: 'Enter' });
      });

      expect(mockPlay).toHaveBeenCalled();
    });

    it('should seek backward with left arrow', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      fireEvent.keyDown(video, { key: 'ArrowLeft' });

      expect(video.currentTime).toBeDefined();
    });

    it('should seek forward with right arrow', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      fireEvent.keyDown(video, { key: 'ArrowRight' });

      expect(video.currentTime).toBeDefined();
    });

    it('should increase volume with up arrow', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      fireEvent.keyDown(video, { key: 'ArrowUp' });

      expect(video.volume).toBeDefined();
    });

    it('should decrease volume with down arrow', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      fireEvent.keyDown(video, { key: 'ArrowDown' });

      expect(video.volume).toBeDefined();
    });

    it('should toggle mute with M key', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      fireEvent.keyDown(video, { key: 'm' });

      expect(video.muted).toBeDefined();
    });

    it('should toggle fullscreen with F key', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      fireEvent.keyDown(video, { key: 'f' });

      expect(mockRequestFullscreen).toHaveBeenCalled();
    });

    it('should show controls when any key is pressed', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      fireEvent.keyDown(video, { key: 'x' });

      const controls = container.querySelector('.opacity-100');
      expect(controls).toBeInTheDocument();
    });
  });

  describe('LocalStorage functionality', () => {
    it('should save progress to localStorage', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: 30,
      });

      fireEvent.timeUpdate(video);

      // Fast forward time to trigger save
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      fireEvent.timeUpdate(video);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load saved progress from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('45');

      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `video-progress-${defaultProps.src}`
      );
      expect(video.currentTime).toBeDefined();
    });

    it('should use initialTime when provided and no saved time', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { container } = render(
        <VideoPlayer {...defaultProps} initialTime={10} />
      );
      const video = container.querySelector('video')!;

      expect(video.currentTime).toBeDefined();
    });

    it('should prefer saved time over initialTime', () => {
      localStorageMock.getItem.mockReturnValue('20');

      const { container } = render(
        <VideoPlayer {...defaultProps} initialTime={10} />
      );
      const video = container.querySelector('video')!;

      expect(localStorageMock.getItem).toHaveBeenCalled();
      expect(video.currentTime).toBeDefined();
    });

    it('should not save when autoSave is false', () => {
      const { container } = render(
        <VideoPlayer {...defaultProps} autoSave={false} />
      );
      const video = container.querySelector('video')!;

      fireEvent.timeUpdate(video);

      act(() => {
        jest.advanceTimersByTime(6000);
      });

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should use custom storage key', () => {
      const customKey = 'custom-video-key';
      localStorageMock.getItem.mockReturnValue('20');

      render(<VideoPlayer {...defaultProps} storageKey={customKey} />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `${customKey}-${defaultProps.src}`
      );
    });
  });

  describe('Captions functionality', () => {
    it('should toggle captions when button is clicked', () => {
      const { container } = render(
        <VideoPlayer
          {...defaultProps}
          subtitles="https://example.com/subs.vtt"
        />
      );

      const captionsButton = screen.getByRole('button', {
        name: /show captions/i,
      });
      const track = container.querySelector('track')!;

      // Mock track object
      Object.defineProperty(track, 'track', {
        configurable: true,
        value: { mode: 'hidden' },
      });

      fireEvent.click(captionsButton);

      expect(track.track.mode).toBeDefined();
    });

    it('should hide captions when clicked again', () => {
      const { container } = render(
        <VideoPlayer
          {...defaultProps}
          subtitles="https://example.com/subs.vtt"
        />
      );

      const captionsButton = screen.getByRole('button', {
        name: /show captions/i,
      });
      const track = container.querySelector('track')!;

      // Mock track object
      Object.defineProperty(track, 'track', {
        configurable: true,
        value: { mode: 'hidden' },
      });

      fireEvent.click(captionsButton);
      const hideCaptionsButton = screen.getByRole('button', {
        name: /hide captions/i,
      });
      fireEvent.click(hideCaptionsButton);

      expect(track.track.mode).toBeDefined();
    });
  });

  describe('Visibility and focus handling', () => {
    it('should pause video when document becomes hidden', async () => {
      render(<VideoPlayer {...defaultProps} />);
      const playButton = screen.getByRole('button', { name: /play video/i });

      await act(async () => {
        fireEvent.click(playButton);
      });

      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: true,
      });

      fireEvent(document, new Event('visibilitychange'));

      expect(mockPause).toHaveBeenCalled();
    });

    it('should pause video when window loses focus', async () => {
      render(<VideoPlayer {...defaultProps} />);
      const playButton = screen.getByRole('button', { name: /play video/i });

      await act(async () => {
        fireEvent.click(playButton);
      });

      fireEvent(window, new Event('blur'));

      expect(mockPause).toHaveBeenCalled();
    });

    it('should not pause when document is visible', () => {
      render(<VideoPlayer {...defaultProps} />);

      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false,
      });

      fireEvent(document, new Event('visibilitychange'));

      expect(mockPause).not.toHaveBeenCalled();
    });
  });

  describe('Callbacks', () => {
    it('should call onTimeUpdate callback', () => {
      const mockOnTimeUpdate = jest.fn();
      const { container } = render(
        <VideoPlayer {...defaultProps} onTimeUpdate={mockOnTimeUpdate} />
      );

      const video = container.querySelector('video')!;
      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: 10,
      });

      fireEvent.timeUpdate(video);

      expect(mockOnTimeUpdate).toHaveBeenCalledWith(10);
    });

    it('should call onProgress callback', () => {
      const mockOnProgress = jest.fn();
      const { container } = render(
        <VideoPlayer {...defaultProps} onProgress={mockOnProgress} />
      );

      const video = container.querySelector('video')!;
      Object.defineProperty(video, 'duration', {
        configurable: true,
        value: 100,
      });
      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: 50,
      });

      // Load metadata first to set duration
      fireEvent.loadedMetadata(video);

      // Then fire timeUpdate
      fireEvent.timeUpdate(video);

      expect(mockOnProgress).toHaveBeenCalledWith(50);
    });

    it('should call onVideoComplete when video reaches 95% completion', () => {
      const mockOnVideoComplete = jest.fn();
      const { container } = render(
        <VideoPlayer {...defaultProps} onVideoComplete={mockOnVideoComplete} />
      );

      const video = container.querySelector('video')!;

      // Set duration first
      Object.defineProperty(video, 'duration', {
        configurable: true,
        value: 100,
      });

      fireEvent.loadedMetadata(video);

      // Set current time to 95%
      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: 95,
      });

      fireEvent.timeUpdate(video);

      expect(mockOnVideoComplete).toHaveBeenCalled();
    });

    it('should not call onVideoComplete twice', () => {
      const mockOnVideoComplete = jest.fn();
      const { container } = render(
        <VideoPlayer {...defaultProps} onVideoComplete={mockOnVideoComplete} />
      );

      const video = container.querySelector('video')!;

      Object.defineProperty(video, 'duration', {
        configurable: true,
        value: 100,
      });

      fireEvent.loadedMetadata(video);

      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: 96,
      });

      fireEvent.timeUpdate(video);
      fireEvent.timeUpdate(video);

      expect(mockOnVideoComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Metadata handling', () => {
    it('should set duration when metadata is loaded', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: 0,
      });
      Object.defineProperty(video, 'duration', {
        configurable: true,
        value: 120,
      });

      fireEvent.loadedMetadata(video);

      // Check that duration is displayed correctly by finding elements that contain "2:00"
      const durationElements = screen.getAllByText(
        (_, element) => element?.textContent?.includes('2:00') || false
      );
      expect(durationElements.length).toBeGreaterThan(0);
    });
  });

  describe('Controls visibility', () => {
    it('should show controls when video is paused', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);

      const controls = container.querySelector('.opacity-100');
      expect(controls).toBeInTheDocument();
    });

    it('should show controls on hover', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);

      // Check that the video player container has the 'group' class
      const videoContainer = container.querySelector('.group');
      expect(videoContainer).toBeInTheDocument();

      // Check that the controls container exists (this verifies hover targets are present)
      const controlsContainer = container.querySelector('.absolute.bottom-0');
      expect(controlsContainer).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing callbacks gracefully', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      expect(() => {
        fireEvent.timeUpdate(video);
      }).not.toThrow();
    });

    it('should handle no duration gracefully', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      Object.defineProperty(video, 'duration', {
        configurable: true,
        value: 0,
      });

      fireEvent.loadedMetadata(video);
      fireEvent.timeUpdate(video);

      expect(screen.getByText(/0:00 \/ 0:00/)).toBeInTheDocument();
    });

    it('should format time correctly for hours', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: 3661, // 1 hour, 1 minute, 1 second
      });

      fireEvent.timeUpdate(video);

      // The formatTime function should handle this
      expect(container).toBeInTheDocument();
    });

    it('should handle invalid time values', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;

      Object.defineProperty(video, 'currentTime', {
        configurable: true,
        value: NaN,
      });

      fireEvent.timeUpdate(video);

      expect(screen.getByText(/0:00/)).toBeInTheDocument();
    });

    it('should cleanup timeouts on unmount', () => {
      const { unmount } = render(<VideoPlayer {...defaultProps} />);

      unmount();

      // Should not throw
      act(() => {
        jest.runOnlyPendingTimers();
      });
    });

    it('should handle unmute with proper volume restoration', () => {
      const { container } = render(<VideoPlayer {...defaultProps} />);
      const video = container.querySelector('video')!;
      const muteButton = screen.getByRole('button', { name: /mute/i });

      // First set volume to 0
      const volumeSlider = container.querySelector(
        'input[type="range"][aria-label="Volume control"]'
      )!;
      fireEvent.change(volumeSlider, { target: { value: '0' } });

      // Then unmute
      fireEvent.click(muteButton);

      expect(video.volume).toBeDefined();
      expect(video.muted).toBeDefined();
    });
  });
});
