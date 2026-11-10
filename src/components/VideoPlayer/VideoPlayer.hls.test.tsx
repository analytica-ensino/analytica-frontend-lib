import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from './VideoPlayer';
import { MockHls } from '../../testing/mockHlsJs';

jest.mock('hls.js', () => ({
  __esModule: true,
  default: jest.requireActual('../../testing/mockHlsJs').MockHls,
}));

const MP4 = 'https://cdn.example.com/lesson.mp4';
const LEVELS = [
  { height: 360, bitrate: 1 },
  { height: 720, bitrate: 2 },
];
const HLS = 'https://cdn.example.com/hls/lesson/master.m3u8';

/** jsdom does not play media: the test sets the time the element reports. */
const mockVideoTime = (video: HTMLVideoElement) => {
  const media = { currentTime: 0 };
  Object.defineProperty(video, 'currentTime', {
    configurable: true,
    get: () => media.currentTime,
    set: (value: number) => {
      media.currentTime = value;
    },
  });
  Object.defineProperty(video, 'duration', {
    configurable: true,
    get: () => 100,
  });
  return media;
};

const fire = (video: HTMLVideoElement, type: string) =>
  act(() => {
    video.dispatchEvent(new Event(type));
  });

beforeEach(() => {
  MockHls.reset();
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  jest
    .spyOn(HTMLMediaElement.prototype, 'play')
    .mockImplementation(() => Promise.resolve());
  jest
    .spyOn(globalThis.navigator, 'vendor', 'get')
    .mockReturnValue('Google Inc.');
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  delete (globalThis as { MediaSource?: unknown }).MediaSource;
});

describe('VideoPlayer with HLS', () => {
  it('plays src without a quality menu when there is no HLS', () => {
    const { container } = render(<VideoPlayer src={MP4} />);

    expect(container.querySelector('video')).toHaveAttribute('src', MP4);
    expect(screen.queryByRole('button', { name: 'Qualidade' })).toBeNull();
  });

  it('plays src when the browser cannot play HLS', async () => {
    const { container } = render(<VideoPlayer src={MP4} hlsSrc={HLS} />);

    await waitFor(() =>
      expect(container.querySelector('video')).toHaveAttribute('src', MP4)
    );
    expect(MockHls.instances).toHaveLength(0);
  });

  describe('with hls.js', () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, 'MediaSource', {
        configurable: true,
        writable: true,
        value: function MediaSource() {},
      });
    });

    const renderHlsPlayer = async (onTimeUpdate = jest.fn()) => {
      const view = render(
        <VideoPlayer src={MP4} hlsSrc={HLS} onTimeUpdate={onTimeUpdate} />
      );
      const video = view.container.querySelector('video') as HTMLVideoElement;
      const media = mockVideoTime(video);
      await waitFor(() => expect(MockHls.instances).toHaveLength(1));
      return { ...view, video, media, hls: MockHls.last, onTimeUpdate };
    };

    it('keeps the controls on screen while the quality menu is open', async () => {
      jest.useFakeTimers();
      const { container, hls } = await renderHlsPlayer();
      act(() => hls.parseManifest(LEVELS));
      const section = container.querySelector('section') as HTMLElement;
      const button = screen.getByRole('button', { name: 'Qualidade' });
      const controls = button.closest('.bottom-0') as HTMLElement;
      /** The pointer leaves the player, with no control holding focus. */
      const leavePlayer = () => {
        act(() => (document.activeElement as HTMLElement | null)?.blur());
        fireEvent.mouseLeave(section);
        act(() => {
          jest.advanceTimersByTime(1_500);
        });
      };

      fireEvent.mouseEnter(section);
      fireEvent.click(button);
      act(() => {
        jest.advanceTimersByTime(0);
      });
      leavePlayer();
      expect(screen.getByRole('menu', { name: 'Qualidade' })).toBeVisible();
      expect(controls).toHaveClass('opacity-100');

      // Closed, the controls hide as usual.
      fireEvent.mouseDown(document.body);
      fireEvent.mouseEnter(section);
      leavePlayer();
      expect(controls).toHaveClass('opacity-0');
    });

    it('leaves the source to hls.js and offers the quality menu', async () => {
      const { video, hls } = await renderHlsPlayer();

      expect(video).not.toHaveAttribute('src');
      expect(hls.attachMedia).toHaveBeenCalledWith(video);
      expect(screen.queryByRole('button', { name: 'Qualidade' })).toBeNull();

      act(() =>
        hls.parseManifest([
          { height: 360, bitrate: 1 },
          { height: 720, bitrate: 2 },
        ])
      );
      fireEvent.click(screen.getByRole('button', { name: 'Qualidade' }));
      fireEvent.click(screen.getByRole('menuitemradio', { name: '360p' }));

      expect(hls.currentLevel).toBe(0);
    });

    it('does not report time 0 while switching to the MP4', async () => {
      const { video, media, hls, onTimeUpdate } = await renderHlsPlayer();
      fire(video, 'loadedmetadata');
      media.currentTime = 20;
      fire(video, 'timeupdate');
      expect(onTimeUpdate).toHaveBeenLastCalledWith(20, 100);
      onTimeUpdate.mockClear();

      act(() => hls.fail(MockHls.ErrorTypes.NETWORK_ERROR, true));
      expect(video).toHaveAttribute('src', MP4);
      // Loading the MP4 resets the element to 0.
      media.currentTime = 0;
      fire(video, 'timeupdate');
      expect(onTimeUpdate).not.toHaveBeenCalled();

      fire(video, 'loadedmetadata');
      expect(media.currentTime).toBe(20);
      fire(video, 'seeked');
      fire(video, 'timeupdate');
      expect(onTimeUpdate).toHaveBeenCalledWith(20, 100);
    });
  });
});
