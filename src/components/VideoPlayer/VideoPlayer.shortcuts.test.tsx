import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from './VideoPlayer';

describe('VideoPlayer: shortcuts and cinema mode', () => {
  let play: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    play = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  const key = (target: Element | Document, init: Record<string, unknown>) =>
    fireEvent.keyDown(target, init);

  const appendTo = (html: string, parent: Element = document.body) => {
    const host = document.createElement('div');
    host.innerHTML = html;
    parent.appendChild(host);
    return host.firstElementChild as HTMLElement;
  };

  it('space plays with focus outside the video and does not scroll the page', () => {
    render(<VideoPlayer src="a.mp4" />);

    const notPrevented = key(document.body, { key: ' ' });

    expect(play).toHaveBeenCalledTimes(1);
    expect(notPrevented).toBe(false);
  });

  it('space activates the focused button, not the video', () => {
    render(<VideoPlayer src="a.mp4" />);
    const button = appendTo('<button>ok</button>');
    const option = appendTo('<div role="radio">a</div>');

    expect(key(button, { key: ' ' })).toBe(true);
    expect(key(option, { key: ' ' })).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it.each([
    '<input type="text" />',
    '<textarea></textarea>',
    '<select></select>',
    '<div contenteditable="true"></div>',
  ])('ignores shortcuts while typing in %s', (html) => {
    render(<VideoPlayer src="a.mp4" onToggleCinemaMode={jest.fn()} />);
    const field = appendTo(html);

    expect(key(field, { key: ' ' })).toBe(true);
    expect(key(field, { key: 'm' })).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }])(
    'does not intercept %j combinations',
    (modifier) => {
      render(<VideoPlayer src="a.mp4" />);

      expect(key(document.body, { key: 'f', ...modifier })).toBe(true);
      expect(key(document.body, { key: 'a', ...modifier })).toBe(true);
    }
  );

  it('lets the event reach global shortcuts', () => {
    const { container } = render(<VideoPlayer src="a.mp4" />);
    const globalListener = jest.fn();
    document.addEventListener('keydown', globalListener);

    key(container.querySelector('video') as Element, { key: 'x' });

    expect(globalListener).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', globalListener);
  });

  it('ignores shortcuts behind a modal without the player', () => {
    render(<VideoPlayer src="a.mp4" />);
    appendTo('<div aria-modal="true"></div>');

    expect(key(document.body, { key: ' ' })).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it('works with the player inside the modal', () => {
    const modal = appendTo('<div aria-modal="true"></div>');
    render(<VideoPlayer src="a.mp4" />, { container: modal });

    key(document.body, { key: ' ' });

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('arrows still require focus on the video', () => {
    render(<VideoPlayer src="a.mp4" />);

    expect(key(document.body, { key: 'ArrowLeft' })).toBe(true);
  });

  it('holding the key does not toggle repeatedly', () => {
    render(<VideoPlayer src="a.mp4" />);

    key(document.body, { key: ' ', repeat: true });

    expect(play).not.toHaveBeenCalled();
  });

  it('space does not restart the video during the countdown', () => {
    render(<VideoPlayer src="a.mp4" overlay={<div>contagem</div>} />);

    key(document.body, { key: ' ' });

    expect(play).not.toHaveBeenCalled();
  });

  it('T and the button toggle cinema mode when offered', () => {
    const onToggle = jest.fn();
    render(<VideoPlayer src="a.mp4" onToggleCinemaMode={onToggle} />);

    key(document.body, { key: 'T' });
    fireEvent.click(screen.getByRole('button', { name: 'Modo cinema' }));

    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole('button', { name: 'Modo cinema' })
    ).toHaveAccessibleDescription('Modo cinema T');
  });

  it('indicates when cinema mode is active', () => {
    render(
      <VideoPlayer src="a.mp4" isCinemaMode onToggleCinemaMode={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Modo padrão' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('tooltips show the action and the shortcut key', () => {
    render(<VideoPlayer src="a.mp4" onToggleCinemaMode={jest.fn()} />);

    const kbds = Array.from(document.querySelectorAll('[role="tooltip"]')).map(
      (tip) => [
        tip.firstChild?.firstChild?.textContent,
        tip.querySelector('kbd')?.textContent,
      ]
    );

    expect(kbds).toEqual(
      expect.arrayContaining([
        ['Tocar', 'Espaço'],
        ['Mutar', 'M'],
        ['Velocidade de reprodução', undefined],
        ['Modo cinema', 'T'],
        ['Tela cheia', 'F'],
      ])
    );
  });

  it('C toggles subtitles when they exist', async () => {
    const track = { mode: 'hidden' };
    Object.defineProperty(HTMLTrackElement.prototype, 'track', {
      configurable: true,
      get: () => track,
    });
    render(<VideoPlayer src="a.mp4" subtitles="data:text/vtt,WEBVTT" />);

    const captions = await screen.findByRole('button', {
      name: 'Exibir legendas',
    });
    key(document.body, { key: 'c' });

    expect(captions).toHaveAttribute('aria-pressed', 'true');
    expect(track.mode).toBe('showing');

    key(document.body, { key: 'C' });
    expect(captions).toHaveAttribute('aria-pressed', 'false');
    delete (HTMLTrackElement.prototype as { track?: unknown }).track;
  });

  it('without subtitles, C does nothing', () => {
    render(<VideoPlayer src="a.mp4" />);

    expect(key(document.body, { key: 'c' })).toBe(true);
  });

  it('without page support, there is no button nor T shortcut', () => {
    render(<VideoPlayer src="a.mp4" />);

    expect(key(document.body, { key: 't' })).toBe(true);
    expect(
      screen.queryByRole('button', { name: 'Modo cinema' })
    ).not.toBeInTheDocument();
  });
});
