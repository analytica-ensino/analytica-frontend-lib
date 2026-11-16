import { fireEvent, render, screen } from '@testing-library/react';
import {
  EbookReaderControls,
  type EbookReaderControlsProps,
} from './EbookReaderControls';

const TOC = [
  { label: 'O caso', target: 'caso' },
  { label: 'Como se lê um gibi', target: 'gibi' },
];

const renderControls = (props: Partial<EbookReaderControlsProps> = {}) => {
  const handlers = {
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onGoTo: jest.fn(),
    onToggleLayout: jest.fn(),
    onToggleFullscreen: jest.fn(),
  };
  render(
    <EbookReaderControls
      showPaging
      pageLabel="1–2 de 24"
      canGoBack
      canGoForward
      toc={TOC}
      canToggleLayout
      isBookLayout
      canFullscreen
      isFullscreen={false}
      {...handlers}
      {...props}
    />
  );
  return handlers;
};

describe('EbookReaderControls', () => {
  describe('page turning', () => {
    it('turns pages back and forth around the counter', () => {
      const { onPrevious, onNext } = renderControls();

      expect(screen.getByTestId('ebook-reader-page-label')).toHaveTextContent(
        '1–2 de 24'
      );
      fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
      fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

      expect(onPrevious).toHaveBeenCalled();
      expect(onNext).toHaveBeenCalled();
    });

    it('cannot go before the cover or after the back cover', () => {
      renderControls({ canGoBack: false, canGoForward: false });

      expect(
        screen.getByRole('button', { name: 'Página anterior' })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Próxima página' })
      ).toBeDisabled();
    });

    it('is not shown in scroll', () => {
      renderControls({ showPaging: false });

      expect(
        screen.queryByRole('button', { name: 'Próxima página' })
      ).toBeNull();
    });
  });

  describe('contents', () => {
    it('lists the chapters, marks the one being read and goes to the chosen one', () => {
      const { onGoTo } = renderControls({ activeTocTarget: 'caso' });

      fireEvent.click(screen.getByRole('button', { name: 'Sumário' }));

      expect(screen.getByRole('menuitem', { name: 'O caso' })).toHaveAttribute(
        'aria-current',
        'true'
      );
      fireEvent.click(
        screen.getByRole('menuitem', { name: 'Como se lê um gibi' })
      );
      expect(onGoTo).toHaveBeenCalledWith('gibi');
    });

    it('is not offered when the book has no contents', () => {
      renderControls({ toc: [] });

      expect(screen.queryByRole('button', { name: 'Sumário' })).toBeNull();
    });
  });

  describe('book or scroll', () => {
    it('offers scroll in the book', () => {
      const { onToggleLayout } = renderControls();

      fireEvent.click(screen.getByRole('button', { name: 'Ler em rolagem' }));

      expect(onToggleLayout).toHaveBeenCalled();
    });

    it('offers the book back in scroll', () => {
      renderControls({ isBookLayout: false });

      expect(
        screen.getByRole('button', { name: 'Voltar ao modo livro' })
      ).toBeInTheDocument();
    });

    it('is not offered for a scroll-only material', () => {
      renderControls({ canToggleLayout: false });

      expect(
        screen.queryByRole('button', { name: 'Ler em rolagem' })
      ).toBeNull();
    });
  });

  describe('full screen', () => {
    it('enters full screen', () => {
      const { onToggleFullscreen } = renderControls();
      const button = screen.getByRole('button', { name: 'Tela cheia' });

      expect(button).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(button);
      expect(onToggleFullscreen).toHaveBeenCalled();
    });

    it('leaves full screen', () => {
      renderControls({ isFullscreen: true });

      expect(
        screen.getByRole('button', { name: 'Sair da tela cheia' })
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('is not offered where the browser does not allow it', () => {
      renderControls({ canFullscreen: false });

      expect(screen.queryByRole('button', { name: 'Tela cheia' })).toBeNull();
    });
  });

  it('shows extra controls before the round buttons', () => {
    renderControls({ extra: <button type="button">Ouvir</button> });

    expect(screen.getByRole('button', { name: 'Ouvir' })).toBeInTheDocument();
  });
});
