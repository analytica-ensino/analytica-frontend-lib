import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DownloadButton, {
  DownloadButtonProps,
  DownloadContent,
} from './DownloadButton';

describe('DownloadButton', () => {
  const mockContent: DownloadContent = {
    urlDoc: 'https://example.com/document.pdf',
    urlInitialFrame: 'https://example.com/initial.jpg',
    urlFinalFrame: 'https://example.com/final.jpg',
    urlPodcast: 'https://example.com/podcast.mp3',
    urlVideo: 'https://example.com/video.mp4',
  };

  const defaultProps: DownloadButtonProps = {
    content: mockContent,
    lessonTitle: 'Test Lesson',
  };

  it('should render download button when content is available', () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute(
      'aria-label',
      'Baixar conteúdo da aula (5 arquivos)'
    );
  });

  it('should not render when no valid content is available', () => {
    const emptyContent: DownloadContent = {};
    render(<DownloadButton content={emptyContent} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should not render when content URLs are empty strings', () => {
    const emptyContent: DownloadContent = {
      urlDoc: '',
      urlInitialFrame: '   ',
      urlFinalFrame: 'undefined',
      urlPodcast: 'null',
      urlVideo: '',
    };
    render(<DownloadButton content={emptyContent} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should show correct aria-label for single file', () => {
    const singleContent: DownloadContent = {
      urlDoc: 'https://example.com/document.pdf',
    };
    render(<DownloadButton content={singleContent} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      'Baixar conteúdo da aula (1 arquivo)'
    );
  });

  it('should be disabled when disabled prop is true', () => {
    render(<DownloadButton {...defaultProps} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show loading state during download', () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Check if aria-label changes to loading state
    expect(button).toHaveAttribute('aria-label', 'Baixando conteúdo...');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-download-button';
    render(<DownloadButton {...defaultProps} className={customClass} />);

    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('should handle partial content correctly', () => {
    const partialContent: DownloadContent = {
      urlDoc: 'https://example.com/document.pdf',
      urlVideo: 'https://example.com/video.mp4',
      // Other URLs are undefined
    };

    render(<DownloadButton content={partialContent} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      'Baixar conteúdo da aula (2 arquivos)'
    );
  });

  it('should use default lesson title when not provided', () => {
    const propsWithoutTitle = { ...defaultProps };
    delete propsWithoutTitle.lessonTitle;

    render(<DownloadButton {...propsWithoutTitle} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should have correct accessibility attributes', () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).not.toHaveAttribute('aria-hidden');
  });
});
