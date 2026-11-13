import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer, { type VideoEndControls } from './VideoPlayer';

const getVideo = (container: HTMLElement) =>
  container.querySelector('video') as HTMLVideoElement;

describe('VideoPlayer: end of video', () => {
  let play: jest.SpyInstance;
  let pause: jest.SpyInstance;
  let setCurrentTime: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    play = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    pause = jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);
    setCurrentTime = jest
      .spyOn(HTMLMediaElement.prototype, 'currentTime', 'set')
      .mockImplementation(() => undefined);
    jest
      .spyOn(HTMLMediaElement.prototype, 'duration', 'get')
      .mockReturnValue(100);
  });

  afterEach(() => jest.restoreAllMocks());

  const endAndGetControls = (container: HTMLElement, onEnded: jest.Mock) => {
    fireEvent.ended(getVideo(container));
    return onEnded.mock.calls[0][0] as VideoEndControls;
  };

  it('provides the actions when the video ends', () => {
    const onEnded = jest.fn();
    const { container } = render(<VideoPlayer src="a.mp4" onEnded={onEnded} />);

    const controls = endAndGetControls(container, onEnded);

    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(controls.replay).toEqual(expect.any(Function));
  });

  it('does not fail without an onEnded consumer', () => {
    const { container } = render(<VideoPlayer src="a.mp4" />);

    expect(() => fireEvent.ended(getVideo(container))).not.toThrow();
  });

  it('rewind goes back to 0:00 and does not play', () => {
    const onEnded = jest.fn();
    const { container } = render(<VideoPlayer src="a.mp4" onEnded={onEnded} />);

    act(() => endAndGetControls(container, onEnded).rewind());

    expect(pause).toHaveBeenCalled();
    expect(setCurrentTime).toHaveBeenCalledWith(0);
    expect(play).not.toHaveBeenCalled();
  });

  it('replay goes back to 0:00 and plays again', async () => {
    const onEnded = jest.fn();
    const { container } = render(<VideoPlayer src="a.mp4" onEnded={onEnded} />);

    await act(async () => endAndGetControls(container, onEnded).replay());

    expect(setCurrentTime).toHaveBeenCalledWith(0);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('blocked replay keeps the play button visible', async () => {
    play.mockRejectedValue(new Error('NotAllowedError'));
    const onEnded = jest.fn();
    const { container } = render(<VideoPlayer src="a.mp4" onEnded={onEnded} />);

    await act(async () => endAndGetControls(container, onEnded).replay());

    expect(
      screen.getByRole('button', { name: 'Reproduzir vídeo' })
    ).toBeInTheDocument();
  });

  it('autoPlay tries only once per media', async () => {
    const { container } = render(<VideoPlayer src="a.mp4" autoPlay />);

    await act(async () => {
      fireEvent.loadedMetadata(getVideo(container));
      fireEvent.loadedMetadata(getVideo(container));
    });

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('blocked autoPlay keeps the play button visible', async () => {
    play.mockRejectedValue(new Error('NotAllowedError'));
    const { container } = render(<VideoPlayer src="a.mp4" autoPlay />);

    await act(async () => {
      fireEvent.loadedMetadata(getVideo(container));
    });

    expect(
      screen.getByRole('button', { name: 'Reproduzir vídeo' })
    ).toBeInTheDocument();
  });

  it('does not start on its own without autoPlay', () => {
    const { container } = render(<VideoPlayer src="a.mp4" />);

    fireEvent.loadedMetadata(getVideo(container));

    expect(play).not.toHaveBeenCalled();
  });

  it('renders the overlay inside the player', () => {
    const { container } = render(
      <VideoPlayer src="a.mp4" overlay={<div>contagem</div>} />
    );

    expect(container.querySelector('section')).toContainElement(
      screen.getByText('contagem')
    );
  });

  describe('autoplay with the tab hidden', () => {
    const setHidden = (hidden: boolean) =>
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => hidden,
      });
    const setPictureInPicture = (element: Element | null) =>
      Object.defineProperty(document, 'pictureInPictureElement', {
        configurable: true,
        get: () => element,
      });

    afterEach(() => {
      setHidden(false);
      setPictureInPicture(null);
    });

    it('waits for the tab to come back before playing', async () => {
      setHidden(true);
      const { container } = render(<VideoPlayer src="a.mp4" autoPlay />);

      await act(async () => {
        fireEvent.loadedMetadata(getVideo(container));
      });
      expect(play).not.toHaveBeenCalled();

      setHidden(false);
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(play).toHaveBeenCalledTimes(1);

      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(play).toHaveBeenCalledTimes(1);
    });

    it('plays right away in picture-in-picture', async () => {
      setHidden(true);
      const { container } = render(<VideoPlayer src="a.mp4" autoPlay />);
      setPictureInPicture(getVideo(container));

      await act(async () => {
        fireEvent.loadedMetadata(getVideo(container));
      });

      expect(play).toHaveBeenCalledTimes(1);
    });

    it('does not restart a video the student already started', async () => {
      setHidden(true);
      const { container } = render(<VideoPlayer src="a.mp4" autoPlay />);
      await act(async () => {
        fireEvent.loadedMetadata(getVideo(container));
        fireEvent.play(getVideo(container));
      });

      setHidden(false);
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(play).not.toHaveBeenCalled();
    });
  });

  it('swapping the media keeps the element and resets the playback state', async () => {
    const { container, rerender } = render(
      <VideoPlayer src="a.mp4" storageKey="lesson-a" />
    );
    const video = getVideo(container);
    act(() => {
      fireEvent.play(video);
    });
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();

    rerender(<VideoPlayer src="b.mp4" storageKey="lesson-b" autoPlay />);

    expect(getVideo(container)).toBe(video);
    expect(
      screen.getByRole('button', { name: 'Reproduzir' })
    ).toBeInTheDocument();
    await act(async () => {
      fireEvent.loadedMetadata(video);
    });
    expect(play).toHaveBeenCalledTimes(1);
  });
});
