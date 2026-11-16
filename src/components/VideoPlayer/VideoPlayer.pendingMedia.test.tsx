import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from './VideoPlayer';

const getVideo = (container: HTMLElement) =>
  container.querySelector('video') as HTMLVideoElement;

const clickPlay = () =>
  act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir' }));
  });

/**
 * A play pressed while the element still holds the previous media must wait
 * for the new one: playing right away would start the old video, and loading
 * the new one would drop the play.
 */
describe('VideoPlayer: play pressed while the media is on its way', () => {
  let play: jest.SpyInstance;
  let pause: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    play = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    pause = jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);
    jest
      .spyOn(HTMLMediaElement.prototype, 'duration', 'get')
      .mockReturnValue(100);
  });

  afterEach(() => jest.restoreAllMocks());

  it('waits for the media the page is about to swap in', async () => {
    const { container, rerender } = render(
      <VideoPlayer src="a.mp4" storageKey="lesson-a" mediaPending />
    );

    await clickPlay();

    expect(play).not.toHaveBeenCalled();
    // The student sees their play taken.
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();

    rerender(<VideoPlayer src="b.mp4" storageKey="lesson-b" />);
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
    await act(async () => {
      fireEvent.loadedMetadata(getVideo(container));
    });

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('waits while the new HLS source attaches to the element', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'readyState', 'get')
      .mockReturnValue(4);
    const { container } = render(
      <VideoPlayer src="a.mp4" storageKey="lesson-a" />
    );
    const video = getVideo(container);
    // `src` already gone, the previous media still loaded.
    video.removeAttribute('src');

    await clickPlay();
    expect(play).not.toHaveBeenCalled();

    video.setAttribute('src', 'blob:next');
    await act(async () => {
      fireEvent.loadedMetadata(video);
    });

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('pressing it again before the media loads cancels it', async () => {
    const { container, rerender } = render(
      <VideoPlayer src="a.mp4" storageKey="lesson-a" mediaPending />
    );

    await clickPlay();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    });
    rerender(<VideoPlayer src="b.mp4" storageKey="lesson-b" />);
    await act(async () => {
      fireEvent.loadedMetadata(getVideo(container));
    });

    expect(play).not.toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Reproduzir' })
    ).toBeInTheDocument();
  });

  it('takes the place of the autoplay: one play, not a play and a pause', async () => {
    const { container, rerender } = render(
      <VideoPlayer src="a.mp4" storageKey="lesson-a" mediaPending />
    );

    await clickPlay();
    rerender(<VideoPlayer src="b.mp4" storageKey="lesson-b" autoPlay />);
    await act(async () => {
      fireEvent.loadedMetadata(getVideo(container));
      fireEvent.loadedMetadata(getVideo(container));
    });

    expect(play).toHaveBeenCalledTimes(1);
    expect(pause).not.toHaveBeenCalled();
  });

  it('still pauses the video that is playing', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'paused', 'get')
      .mockReturnValue(false);
    const { container } = render(
      <VideoPlayer src="a.mp4" storageKey="lesson-a" mediaPending />
    );
    act(() => {
      fireEvent.play(getVideo(container));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    });

    expect(pause).toHaveBeenCalledTimes(1);
    expect(play).not.toHaveBeenCalled();
  });

  it('plays right away when nothing is on its way', async () => {
    render(<VideoPlayer src="a.mp4" storageKey="lesson-a" />);

    await clickPlay();

    expect(play).toHaveBeenCalledTimes(1);
  });
});
