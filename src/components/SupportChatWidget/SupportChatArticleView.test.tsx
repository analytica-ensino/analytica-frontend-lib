import { act, fireEvent, render, screen } from '@testing-library/react';
import { SupportChatArticleView } from './SupportChatArticleView';
import type { SupportChatArticle } from '../../types/supportChat';

const article: SupportChatArticle = {
  id: 'art-1',
  title: 'Como gerar simulados',
  body: '<p>Texto do artigo</p><p><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Vídeo</a></p>',
  updatedAt: '2026-10-21T12:00:00.000Z',
};

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

class FakeIntersectionObserver {
  static last: FakeIntersectionObserver | null = null;
  callback: ObserverCallback;
  observe = jest.fn();
  disconnect = jest.fn();
  constructor(callback: ObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.last = this;
  }
}

const renderView = async (
  props: Partial<Parameters<typeof SupportChatArticleView>[0]> = {}
) => {
  const handlers = {
    loadArticle: jest.fn().mockResolvedValue(article),
    onToggleExpanded: jest.fn(),
    onBack: jest.fn(),
  };
  const utils = render(
    <SupportChatArticleView
      articleId="art-1"
      expanded={false}
      {...handlers}
      {...props}
    />
  );
  await act(async () => undefined);
  return { ...handlers, ...utils };
};

const headerTitle = () =>
  screen
    .getByTestId('support-chat-article')
    .querySelector('header span') as HTMLElement;

describe('SupportChatArticleView', () => {
  const original = (globalThis as { IntersectionObserver?: unknown })
    .IntersectionObserver;

  beforeEach(() => {
    FakeIntersectionObserver.last = null;
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      FakeIntersectionObserver;
  });
  afterEach(() => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      original;
  });

  it('shows the loaded article with its date and video player', async () => {
    const { loadArticle } = await renderView();
    expect(loadArticle).toHaveBeenCalledWith('art-1');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Como gerar simulados' })
    ).toBeInTheDocument();
    expect(screen.getByText('Atualizado em 21/10/2026')).toBeInTheDocument();
    expect(screen.getByText('Texto do artigo')).toBeInTheDocument();
    expect(screen.queryByText('Carregando…')).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-video-embed] iframe')?.getAttribute('src')
    ).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('shows the known title while loading and hides the date when unknown', async () => {
    let resolve: (value: SupportChatArticle) => void = () => undefined;
    const loadArticle = jest.fn(
      () =>
        new Promise<SupportChatArticle>((done) => {
          resolve = done;
        })
    );
    await renderView({ loadArticle, initialTitle: 'Título do chat' });
    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Título do chat' })
    ).toBeInTheDocument();

    await act(async () => resolve({ ...article, updatedAt: null }));
    expect(screen.queryByText(/Atualizado em/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Como gerar simulados' })
    ).toBeInTheDocument();
  });

  it('falls back to "Artigo" as title', async () => {
    await renderView({
      loadArticle: jest.fn(() => new Promise(() => undefined)),
    });
    expect(screen.getByRole('heading', { name: 'Artigo' })).toBeInTheDocument();
  });

  it('shows an error when the article does not load', async () => {
    await renderView({
      loadArticle: jest.fn().mockRejectedValue(new Error('404')),
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível abrir o artigo.'
    );
    expect(screen.queryByText('Carregando…')).not.toBeInTheDocument();
  });

  it('ignores a load that finishes after unmount', async () => {
    let resolve: (value: SupportChatArticle) => void = () => undefined;
    let reject: (error: Error) => void = () => undefined;
    const loadArticle = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<SupportChatArticle>((done) => {
            resolve = done;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise<SupportChatArticle>((_done, fail) => {
            reject = fail;
          })
      );
    const { rerender, unmount, onBack, onToggleExpanded } = await renderView({
      loadArticle,
    });
    rerender(
      <SupportChatArticleView
        articleId="art-2"
        expanded={false}
        loadArticle={loadArticle}
        onBack={onBack}
        onToggleExpanded={onToggleExpanded}
      />
    );
    await act(async () => resolve(article));
    expect(screen.queryByText('Texto do artigo')).not.toBeInTheDocument();
    unmount();
    await act(async () => reject(new Error('late')));
    expect(loadArticle).toHaveBeenCalledTimes(2);
  });

  it('wires back, expand/reduce and the new tab link', async () => {
    const { onBack, onToggleExpanded, rerender, loadArticle } =
      await renderView({ accentStyle: { backgroundColor: '#123456' } });
    expect(
      screen.queryByLabelText('Abrir em nova aba')
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('support-chat-article').querySelector('header')
    ).toHaveStyle({ backgroundColor: '#123456' });

    fireEvent.click(screen.getByLabelText('Voltar para a janela de mensagens'));
    expect(onBack).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText('Expandir artigo'));
    expect(onToggleExpanded).toHaveBeenCalledTimes(1);

    rerender(
      <SupportChatArticleView
        articleId="art-1"
        expanded
        loadArticle={loadArticle}
        onBack={onBack}
        onToggleExpanded={onToggleExpanded}
        externalUrl="/artigo/art-1"
      />
    );
    fireEvent.click(screen.getByLabelText('Reduzir artigo'));
    expect(onToggleExpanded).toHaveBeenCalledTimes(2);
    const external = screen.getByLabelText('Abrir em nova aba');
    expect(external).toHaveAttribute('href', '/artigo/art-1');
    expect(external).toHaveAttribute('target', '_blank');
  });

  it('shows the title in the header when the big title leaves the view', async () => {
    const { unmount } = await renderView();
    const observer = FakeIntersectionObserver.last!;
    expect(observer.observe).toHaveBeenCalledWith(
      screen.getByRole('heading', { level: 2 })
    );
    expect(headerTitle()).toHaveClass('opacity-0');
    expect(headerTitle()).toHaveAttribute('aria-hidden', 'true');

    act(() => observer.callback([{ isIntersecting: false }]));
    expect(headerTitle()).toHaveClass('opacity-100');
    expect(headerTitle()).not.toHaveAttribute('aria-hidden');

    act(() => observer.callback([{ isIntersecting: true }]));
    expect(headerTitle()).toHaveClass('opacity-0');

    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('works without IntersectionObserver', async () => {
    delete (globalThis as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    await renderView();
    expect(screen.getByText('Texto do artigo')).toBeInTheDocument();
    expect(headerTitle()).toHaveClass('opacity-0');
  });
});
