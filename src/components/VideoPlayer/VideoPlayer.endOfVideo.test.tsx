import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer, { type VideoEndControls } from './VideoPlayer';

const getVideo = (container: HTMLElement) =>
  container.querySelector('video') as HTMLVideoElement;

describe('VideoPlayer: fim do vídeo', () => {
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

  it('entrega as ações ao terminar o vídeo', () => {
    const onEnded = jest.fn();
    const { container } = render(<VideoPlayer src="a.mp4" onEnded={onEnded} />);

    const controls = endAndGetControls(container, onEnded);

    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(controls.replay).toEqual(expect.any(Function));
  });

  it('não falha sem consumidor de onEnded', () => {
    const { container } = render(<VideoPlayer src="a.mp4" />);

    expect(() => fireEvent.ended(getVideo(container))).not.toThrow();
  });

  it('rewind volta a 0:00 e não toca', () => {
    const onEnded = jest.fn();
    const { container } = render(<VideoPlayer src="a.mp4" onEnded={onEnded} />);

    act(() => endAndGetControls(container, onEnded).rewind());

    expect(pause).toHaveBeenCalled();
    expect(setCurrentTime).toHaveBeenCalledWith(0);
    expect(play).not.toHaveBeenCalled();
  });

  it('replay volta a 0:00 e toca de novo', async () => {
    const onEnded = jest.fn();
    const { container } = render(<VideoPlayer src="a.mp4" onEnded={onEnded} />);

    await act(async () => endAndGetControls(container, onEnded).replay());

    expect(setCurrentTime).toHaveBeenCalledWith(0);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('replay bloqueado mantém o botão de play visível', async () => {
    play.mockRejectedValue(new Error('NotAllowedError'));
    const onEnded = jest.fn();
    const { container } = render(<VideoPlayer src="a.mp4" onEnded={onEnded} />);

    await act(async () => endAndGetControls(container, onEnded).replay());

    expect(
      screen.getByRole('button', { name: 'Reproduzir vídeo' })
    ).toBeInTheDocument();
  });

  it('autoPlay tenta uma única vez por mídia', async () => {
    const { container } = render(<VideoPlayer src="a.mp4" autoPlay />);

    await act(async () => {
      fireEvent.loadedMetadata(getVideo(container));
      fireEvent.loadedMetadata(getVideo(container));
    });

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('autoPlay bloqueado mantém o botão de play visível', async () => {
    play.mockRejectedValue(new Error('NotAllowedError'));
    const { container } = render(<VideoPlayer src="a.mp4" autoPlay />);

    await act(async () => {
      fireEvent.loadedMetadata(getVideo(container));
    });

    expect(
      screen.getByRole('button', { name: 'Reproduzir vídeo' })
    ).toBeInTheDocument();
  });

  it('sem autoPlay não inicia sozinho', () => {
    const { container } = render(<VideoPlayer src="a.mp4" />);

    fireEvent.loadedMetadata(getVideo(container));

    expect(play).not.toHaveBeenCalled();
  });

  it('renderiza o overlay dentro do player', () => {
    const { container } = render(
      <VideoPlayer src="a.mp4" overlay={<div>contagem</div>} />
    );

    expect(container.querySelector('section')).toContainElement(
      screen.getByText('contagem')
    );
  });
});
