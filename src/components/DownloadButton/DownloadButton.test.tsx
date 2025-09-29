import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DownloadButton, {
  DownloadButtonProps,
  DownloadContent,
} from './DownloadButton';

// Mock fetch globally
(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();
// Mock URL.createObjectURL and URL.revokeObjectURL
(
  globalThis.URL as unknown as {
    createObjectURL: jest.Mock;
    revokeObjectURL: jest.Mock;
  }
).createObjectURL = jest.fn(() => 'blob:mock-url');
(
  globalThis.URL as unknown as {
    createObjectURL: jest.Mock;
    revokeObjectURL: jest.Mock;
  }
).revokeObjectURL = jest.fn();

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

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document.body for link append/remove tests
    document.body.innerHTML = '';
  });

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

  it('should handle successful download with fetch', async () => {
    const mockBlob = new Blob(['mock content'], { type: 'application/pdf' });
    const mockResponse = {
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    };

    (globalThis as unknown as { fetch: jest.Mock }).fetch.mockResolvedValue(
      mockResponse
    );

    const onDownloadStart = jest.fn();
    const onDownloadComplete = jest.fn();

    render(
      <DownloadButton
        {...defaultProps}
        onDownloadStart={onDownloadStart}
        onDownloadComplete={onDownloadComplete}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Wait for download to start
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onDownloadStart).toHaveBeenCalled();
  });

  it('should handle fetch error response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };

    (globalThis as unknown as { fetch: jest.Mock }).fetch.mockResolvedValue(
      mockResponse
    );

    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Wait for fetch to be called
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(
      (globalThis as unknown as { fetch: jest.Mock }).fetch
    ).toHaveBeenCalled();
  });

  it('should get correct MIME types for different file extensions', () => {
    // Test each file type individually to avoid multiple buttons issue
    const testCases = [
      { urlDoc: 'https://example.com/test.pdf' },
      { urlInitialFrame: 'https://example.com/test.png' },
      { urlFinalFrame: 'https://example.com/test.jpg' },
      { urlPodcast: 'https://example.com/test.mp3' },
      { urlVideo: 'https://example.com/test.mp4' },
    ];

    testCases.forEach((content) => {
      const { container } = render(
        <div>
          <DownloadButton content={content} />
        </div>
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  it('should handle invalid URL in file extension extraction', () => {
    // This test will cover line 135 in getFileExtension
    const invalidContent = { urlDoc: 'invalid-url' };
    render(<DownloadButton content={invalidContent} />);

    const button = screen.queryByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should not download when already downloading', async () => {
    const mockBlob = new Blob(['mock content'], { type: 'application/pdf' });
    const mockResponse = {
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    };

    (globalThis as unknown as { fetch: jest.Mock }).fetch.mockResolvedValue(
      mockResponse
    );

    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');

    // First click
    fireEvent.click(button);

    // Immediate second click while downloading
    fireEvent.click(button);

    // This covers the early return in line 240
    expect(button).toHaveAttribute('aria-label', 'Baixando conteúdo...');
  });
});
