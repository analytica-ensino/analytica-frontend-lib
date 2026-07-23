import { createRef } from 'react';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  AudioMixerPapole,
  type AudioMixerPapoleHandle,
} from './AudioMixerPapole';
import { useAudioSpectrum } from '../../hooks/useAudioSpectrum';
import { formatTimeSpent } from '../../utils/utils';

/**
 * The spectrum hook drives Web Audio (AudioContext), which jsdom doesn't
 * implement. We mock it so we can (a) assert how the component wires it up and
 * (b) capture the `onFrame` callback to drive `drawSpectrum` manually.
 */
jest.mock('../../hooks/useAudioSpectrum', () => ({
  useAudioSpectrum: jest.fn(),
}));

const mockUseAudioSpectrum = useAudioSpectrum as jest.Mock;

/**
 * The last `onFrame` handed to useAudioSpectrum — it's stable (useCallback([]))
 * so any recorded call exposes the same function.
 */
const getOnFrame = (): ((values: number[]) => void) =>
  mockUseAudioSpectrum.mock.calls[0][2].onFrame;

const getAudio = (container: HTMLElement): HTMLAudioElement =>
  container.querySelector('audio') as HTMLAudioElement;

const getBars = (container: HTMLElement): HTMLSpanElement[] =>
  Array.from(
    container.querySelector('[aria-hidden="true"]')?.children ?? []
  ) as HTMLSpanElement[];

let playMock: jest.Mock;
let pauseMock: jest.Mock;
let currentTimeValue: number;
let createObjectURLMock: jest.Mock;
let revokeObjectURLMock: jest.Mock;

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeEach(() => {
  playMock = jest.fn().mockResolvedValue(undefined);
  pauseMock = jest.fn();
  currentTimeValue = 0;

  // jsdom stubs media playback with "Not implemented" — replace play/pause and
  // make currentTime a real settable property.
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: playMock,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: pauseMock,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
    configurable: true,
    get: () => currentTimeValue,
    set: (value: number) => {
      currentTimeValue = value;
    },
  });

  createObjectURLMock = jest.fn(() => 'blob:mock-audio-url');
  revokeObjectURLMock = jest.fn();
  URL.createObjectURL = createObjectURLMock;
  URL.revokeObjectURL = revokeObjectURLMock;

  mockUseAudioSpectrum.mockReset();
});

afterEach(() => {
  cleanup();
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
  jest.clearAllMocks();
});

describe('AudioMixerPapole', () => {
  describe('rendering', () => {
    it('renders the default number of bars (13)', () => {
      const { container } = render(<AudioMixerPapole src="audio.mp3" />);
      expect(getBars(container)).toHaveLength(13);
    });

    it('renders a custom number of bars', () => {
      const { container } = render(
        <AudioMixerPapole src="audio.mp3" barCount={7} />
      );
      expect(getBars(container)).toHaveLength(7);
    });

    it('centers the single bar when barCount is 1', () => {
      const { container } = render(
        <AudioMixerPapole src="audio.mp3" barCount={1} />
      );
      const bars = getBars(container);
      expect(bars).toHaveLength(1);
      // With a single bar t falls back to 0.5 → 40px.
      expect(bars[0].style.height).toBe('40px');
    });

    it('builds a symmetric rest wave (taller in the middle)', () => {
      const { container } = render(<AudioMixerPapole src="audio.mp3" />);
      const bars = getBars(container);
      // t=0 → 14px on the edges, t=0.5 → 40px in the middle bar.
      expect(bars[0].style.height).toBe('14px');
      expect(bars[6].style.height).toBe('40px');
    });

    it('applies extra className to the container', () => {
      const { container } = render(
        <AudioMixerPapole src="audio.mp3" className="my-class" />
      );
      expect(container.firstChild).toHaveClass('my-class');
    });

    it('does not render the time by default', () => {
      render(<AudioMixerPapole src="audio.mp3" />);
      expect(screen.queryByText(formatTimeSpent(0))).not.toBeInTheDocument();
    });

    it('renders the time (00:00:00) when showTime is set', () => {
      render(<AudioMixerPapole src="audio.mp3" showTime />);
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('reflects src, loop and crossOrigin on the audio element', () => {
      const { container } = render(
        <AudioMixerPapole src="audio.mp3" loop crossOrigin="anonymous" />
      );
      const audio = getAudio(container);
      expect(audio.getAttribute('src')).toBe('audio.mp3');
      expect(audio.loop).toBe(true);
      expect(audio.getAttribute('crossorigin')).toBe('anonymous');
    });
  });

  describe('useAudioSpectrum wiring', () => {
    it('passes the current playing state and barCount', () => {
      const { container } = render(
        <AudioMixerPapole src="audio.mp3" barCount={9} />
      );

      expect(mockUseAudioSpectrum).toHaveBeenLastCalledWith(
        expect.anything(),
        false,
        expect.objectContaining({ barCount: 9, onFrame: expect.any(Function) })
      );

      fireEvent.play(getAudio(container));

      expect(mockUseAudioSpectrum).toHaveBeenLastCalledWith(
        expect.anything(),
        true,
        expect.objectContaining({ barCount: 9 })
      );
    });

    it('writes spectrum values to the bar heights via onFrame', () => {
      const { container } = render(<AudioMixerPapole src="audio.mp3" />);
      // Play so the rest-height effect stops overwriting the bars.
      fireEvent.play(getAudio(container));

      const values = Array.from({ length: 13 }, () => 0);
      values[0] = 1; // 8 + 1 * 48 = 56px
      values[1] = 0; // 8 + 0 * 48 = 8px
      values[2] = 0.5; // 8 + 0.5 * 48 = 32px

      act(() => {
        getOnFrame()(values);
      });

      const bars = getBars(container);
      expect(bars[0].style.height).toBe('56px');
      expect(bars[1].style.height).toBe('8px');
      expect(bars[2].style.height).toBe('32px');
    });

    it('restores the rest heights when playback stops', () => {
      const { container } = render(<AudioMixerPapole src="audio.mp3" />);
      fireEvent.play(getAudio(container));

      act(() => {
        getOnFrame()(Array.from({ length: 13 }, () => 1));
      });
      expect(getBars(container)[0].style.height).toBe('56px');

      fireEvent.pause(getAudio(container));

      // Back to the resting wave.
      expect(getBars(container)[0].style.height).toBe('14px');
    });
  });

  describe('imperative ref', () => {
    it('play() plays the audio', () => {
      const ref = createRef<AudioMixerPapoleHandle>();
      render(<AudioMixerPapole ref={ref} src="audio.mp3" />);

      act(() => ref.current?.play());

      expect(playMock).toHaveBeenCalledTimes(1);
    });

    it('pause() pauses the audio', () => {
      const ref = createRef<AudioMixerPapoleHandle>();
      render(<AudioMixerPapole ref={ref} src="audio.mp3" />);

      act(() => ref.current?.pause());

      expect(pauseMock).toHaveBeenCalledTimes(1);
    });

    it('stop() pauses, rewinds to 0 and resets the displayed time', () => {
      const ref = createRef<AudioMixerPapoleHandle>();
      const { container } = render(
        <AudioMixerPapole ref={ref} src="audio.mp3" showTime />
      );

      // Advance the displayed time first.
      currentTimeValue = 75;
      fireEvent.timeUpdate(getAudio(container));
      expect(screen.getByText('00:01:15')).toBeInTheDocument();

      act(() => ref.current?.stop());

      expect(pauseMock).toHaveBeenCalledTimes(1);
      expect(currentTimeValue).toBe(0);
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });
  });

  describe('declarative status control', () => {
    it('plays when status is "playing"', () => {
      render(<AudioMixerPapole src="audio.mp3" status="playing" />);
      expect(playMock).toHaveBeenCalledTimes(1);
    });

    it('pauses when status is "paused"', () => {
      render(<AudioMixerPapole src="audio.mp3" status="paused" />);
      expect(pauseMock).toHaveBeenCalledTimes(1);
      expect(playMock).not.toHaveBeenCalled();
    });

    it('stops (pause + rewind) when status is "stopped"', () => {
      currentTimeValue = 30;
      render(<AudioMixerPapole src="audio.mp3" status="stopped" />);
      expect(pauseMock).toHaveBeenCalledTimes(1);
      expect(currentTimeValue).toBe(0);
    });

    it('reacts to status transitions across re-renders', () => {
      const { rerender } = render(
        <AudioMixerPapole src="audio.mp3" status="playing" />
      );
      expect(playMock).toHaveBeenCalledTimes(1);

      rerender(<AudioMixerPapole src="audio.mp3" status="paused" />);
      expect(pauseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('autoPlay', () => {
    it('tries to play on mount when uncontrolled', () => {
      render(<AudioMixerPapole src="audio.mp3" autoPlay />);
      expect(playMock).toHaveBeenCalledTimes(1);
    });

    it('retries on the first user gesture when autoplay is blocked', () => {
      render(<AudioMixerPapole src="audio.mp3" autoPlay />);
      expect(playMock).toHaveBeenCalledTimes(1);

      act(() => {
        window.dispatchEvent(new Event('pointerdown'));
      });
      expect(playMock).toHaveBeenCalledTimes(2);

      // The listener is registered with { once: true } — no further retries.
      act(() => {
        window.dispatchEvent(new Event('pointerdown'));
      });
      expect(playMock).toHaveBeenCalledTimes(2);
    });

    it('is ignored while status is controlled', () => {
      render(
        <AudioMixerPapole src="audio.mp3" autoPlay status="paused" />
      );
      expect(playMock).not.toHaveBeenCalled();
      expect(pauseMock).toHaveBeenCalled();
    });

    it('does not autoplay without a source', () => {
      render(<AudioMixerPapole autoPlay />);
      expect(playMock).not.toHaveBeenCalled();
    });
  });

  describe('playback callbacks', () => {
    it('reports playing=true on play', () => {
      const onPlayingChange = jest.fn();
      const { container } = render(
        <AudioMixerPapole src="audio.mp3" onPlayingChange={onPlayingChange} />
      );

      fireEvent.play(getAudio(container));

      expect(onPlayingChange).toHaveBeenLastCalledWith(true);
    });

    it('reports playing=false on pause', () => {
      const onPlayingChange = jest.fn();
      const { container } = render(
        <AudioMixerPapole src="audio.mp3" onPlayingChange={onPlayingChange} />
      );

      fireEvent.pause(getAudio(container));

      expect(onPlayingChange).toHaveBeenLastCalledWith(false);
    });

    it('reports stop and calls onEnded when the audio ends', () => {
      const onPlayingChange = jest.fn();
      const onEnded = jest.fn();
      const { container } = render(
        <AudioMixerPapole
          src="audio.mp3"
          showTime
          onPlayingChange={onPlayingChange}
          onEnded={onEnded}
        />
      );

      currentTimeValue = 42;
      fireEvent.timeUpdate(getAudio(container));
      expect(screen.getByText('00:00:42')).toBeInTheDocument();

      fireEvent.ended(getAudio(container));

      expect(onPlayingChange).toHaveBeenLastCalledWith(false);
      expect(onEnded).toHaveBeenCalledTimes(1);
      // Time is reset to zero on end.
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('updates the displayed time on timeupdate when showTime is set', () => {
      const { container } = render(
        <AudioMixerPapole src="audio.mp3" showTime />
      );

      currentTimeValue = 3661; // 01:01:01
      fireEvent.timeUpdate(getAudio(container));

      expect(screen.getByText('01:01:01')).toBeInTheDocument();
    });
  });

  describe('file source', () => {
    it('creates a same-origin object URL and uses it as src', () => {
      const file = new Blob(['audio-bytes'], { type: 'audio/webm' });
      const { container } = render(<AudioMixerPapole file={file} />);

      expect(createObjectURLMock).toHaveBeenCalledWith(file);
      expect(getAudio(container).getAttribute('src')).toBe('blob:mock-audio-url');
    });

    it('revokes the object URL on unmount', () => {
      const file = new Blob(['audio-bytes'], { type: 'audio/webm' });
      const { unmount } = render(<AudioMixerPapole file={file} />);

      unmount();

      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-audio-url');
    });
  });
});
