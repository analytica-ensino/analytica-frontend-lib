import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock HTMLMediaElement methods
const mockPlay = jest.fn().mockResolvedValue(undefined);
const mockPause = jest.fn();

Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: mockPlay,
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: mockPause,
});

// Mock fullscreen API
const mockRequestFullscreen = jest.fn();
Object.defineProperty(Element.prototype, 'requestFullscreen', {
  configurable: true,
  value: mockRequestFullscreen,
});

Object.defineProperty(document, 'exitFullscreen', {
  configurable: true,
  value: jest.fn(),
});

// Mock DOM methods for download functionality
const mockLink = {
  href: '',
  download: '',
  click: jest.fn(),
} as unknown as HTMLAnchorElement;

const createElementSpy = jest.spyOn(document, 'createElement');
const appendChildSpy = jest.spyOn(document.body, 'appendChild');
const removeChildSpy = jest.spyOn(document.body, 'removeChild');

describe('VideoPlayer', () => {
  const defaultProps = {
    src: 'https://example.com/video.mp4',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createElementSpy.mockReturnValue(mockLink);
    appendChildSpy.mockImplementation(() => mockLink);
    removeChildSpy.mockImplementation(() => mockLink);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render video element with src', () => {
      render(<VideoPlayer {...defaultProps} />);
      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', defaultProps.src);
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
      render(<VideoPlayer {...defaultProps} poster={posterUrl} />);
      const video = document.querySelector('video');
      expect(video).toHaveAttribute('poster', posterUrl);
    });

    it('should render speed control button', () => {
      render(<VideoPlayer {...defaultProps} />);
      const speedButton = screen.getByRole('button', {
        name: /playback speed/i,
      });
      expect(speedButton).toBeInTheDocument();
    });
  });

  describe('Play/Pause functionality', () => {
    it('should play video when play button is clicked', () => {
      render(<VideoPlayer {...defaultProps} />);
      const playButton = screen.getByRole('button', { name: /play video/i });
      fireEvent.click(playButton);
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    it('should pause video when pause button is clicked', () => {
      render(<VideoPlayer {...defaultProps} />);

      // First click to play
      const playButton = screen.getByRole('button', { name: /play video/i });
      fireEvent.click(playButton);

      // Second click to pause
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);
      expect(mockPause).toHaveBeenCalledTimes(1);
    });

    it('should toggle play/pause when video is clicked', () => {
      render(<VideoPlayer {...defaultProps} />);
      const video = document.querySelector('video');

      fireEvent.click(video!);
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });
  });

  describe('Volume controls', () => {
    it('should render mute button', () => {
      render(<VideoPlayer {...defaultProps} />);
      const muteButton = screen.getByRole('button', { name: /mute/i });
      expect(muteButton).toBeInTheDocument();
    });
  });

  describe('Fullscreen functionality', () => {
    it('should enter fullscreen when fullscreen button is clicked', () => {
      render(<VideoPlayer {...defaultProps} />);
      const fullscreenButton = screen.getByRole('button', {
        name: /enter fullscreen/i,
      });
      fireEvent.click(fullscreenButton);
      expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);
    });
  });

  describe('Speed controls', () => {
    it('should show speed menu when menu button is clicked', () => {
      render(<VideoPlayer {...defaultProps} />);
      const menuButton = screen.getByRole('button', {
        name: /playback speed/i,
      });
      fireEvent.click(menuButton);
      expect(screen.getByText('0.5x')).toBeInTheDocument();
      expect(screen.getByText('1x')).toBeInTheDocument();
      expect(screen.getByText('1.5x')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
    });
  });

  describe('Visibility and focus handling', () => {
    it('should pause video when document becomes hidden', () => {
      render(<VideoPlayer {...defaultProps} />);
      const playButton = screen.getByRole('button', { name: /play video/i });
      fireEvent.click(playButton);

      // Simulate document becoming hidden
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true,
      });

      fireEvent(document, new Event('visibilitychange'));
      expect(mockPause).toHaveBeenCalled();
    });

    it('should pause video when window loses focus', () => {
      render(<VideoPlayer {...defaultProps} />);
      const playButton = screen.getByRole('button', { name: /play video/i });
      fireEvent.click(playButton);

      fireEvent(window, new Event('blur'));
      expect(mockPause).toHaveBeenCalled();
    });
  });

  describe('Callbacks', () => {
    it('should call onVideoComplete when video reaches 95% completion', () => {
      const mockOnVideoComplete = jest.fn();
      render(
        <VideoPlayer {...defaultProps} onVideoComplete={mockOnVideoComplete} />
      );

      const video = document.querySelector('video');
      if (video) {
        Object.defineProperty(video, 'duration', { value: 100 });
        Object.defineProperty(video, 'currentTime', { value: 95 });
        fireEvent.timeUpdate(video);
      }

      expect(mockOnVideoComplete).toHaveBeenCalled();
    });
  });
});
