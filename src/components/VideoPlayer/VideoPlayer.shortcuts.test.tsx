import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from './VideoPlayer';

describe('VideoPlayer: atalhos e modo cinema', () => {
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

  it('espaço toca com o foco fora do vídeo e não rola a página', () => {
    render(<VideoPlayer src="a.mp4" />);

    const notPrevented = key(document.body, { key: ' ' });

    expect(play).toHaveBeenCalledTimes(1);
    expect(notPrevented).toBe(false);
  });

  it('o espaço aciona o botão em foco, não o vídeo', () => {
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
  ])('ignora atalhos ao digitar em %s', (html) => {
    render(<VideoPlayer src="a.mp4" onToggleCinemaMode={jest.fn()} />);
    const field = appendTo(html);

    expect(key(field, { key: ' ' })).toBe(true);
    expect(key(field, { key: 'm' })).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }])(
    'não intercepta combinações %j',
    (modifier) => {
      render(<VideoPlayer src="a.mp4" />);

      expect(key(document.body, { key: 'f', ...modifier })).toBe(true);
      expect(key(document.body, { key: 'a', ...modifier })).toBe(true);
    }
  );

  it('deixa o evento chegar a atalhos globais', () => {
    const { container } = render(<VideoPlayer src="a.mp4" />);
    const globalListener = jest.fn();
    document.addEventListener('keydown', globalListener);

    key(container.querySelector('video') as Element, { key: 'x' });

    expect(globalListener).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', globalListener);
  });

  it('ignora atalhos atrás de um modal sem o player', () => {
    render(<VideoPlayer src="a.mp4" />);
    appendTo('<div aria-modal="true"></div>');

    expect(key(document.body, { key: ' ' })).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it('funciona com o player dentro do modal', () => {
    const modal = appendTo('<div aria-modal="true"></div>');
    render(<VideoPlayer src="a.mp4" />, { container: modal });

    key(document.body, { key: ' ' });

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('as setas seguem exigindo o foco no vídeo', () => {
    render(<VideoPlayer src="a.mp4" />);

    expect(key(document.body, { key: 'ArrowLeft' })).toBe(true);
  });

  it('segurar a tecla não alterna várias vezes', () => {
    render(<VideoPlayer src="a.mp4" />);

    key(document.body, { key: ' ', repeat: true });

    expect(play).not.toHaveBeenCalled();
  });

  it('o espaço não reinicia o vídeo durante a contagem', () => {
    render(<VideoPlayer src="a.mp4" overlay={<div>contagem</div>} />);

    key(document.body, { key: ' ' });

    expect(play).not.toHaveBeenCalled();
  });

  it('T e o botão acionam o modo cinema quando oferecido', () => {
    const onToggle = jest.fn();
    render(<VideoPlayer src="a.mp4" onToggleCinemaMode={onToggle} />);

    key(document.body, { key: 'T' });
    fireEvent.click(screen.getByRole('button', { name: 'Modo cinema' }));

    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(screen.getByTitle('Modo cinema (T)')).toBeInTheDocument();
  });

  it('indica quando o modo cinema está ativo', () => {
    render(
      <VideoPlayer src="a.mp4" isCinemaMode onToggleCinemaMode={jest.fn()} />
    );

    expect(
      screen.getByRole('button', { name: 'Sair do modo cinema' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('sem suporte da página, não há botão nem atalho T', () => {
    render(<VideoPlayer src="a.mp4" />);

    expect(key(document.body, { key: 't' })).toBe(true);
    expect(
      screen.queryByRole('button', { name: 'Modo cinema' })
    ).not.toBeInTheDocument();
  });
});
