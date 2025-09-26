import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DownloadButton, {
  DownloadButtonProps,
  DownloadContent,
} from './DownloadButton';

// Mock DOM methods
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

// Mock URL constructor
Object.defineProperty(globalThis, 'URL', {
  value: jest.fn().mockImplementation((url: string) => ({
    pathname: url.includes('.pdf')
      ? '/test.pdf'
      : url.includes('.mp4')
        ? '/test.mp4'
        : '/test.jpg',
  })),
  writable: true,
});

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();

  // Mock document methods
  const mockElement = {
    href: '',
    download: '',
    target: '',
    rel: '',
    click: mockClick,
  };

  mockCreateElement.mockReturnValue(mockElement);

  Object.defineProperty(document, 'createElement', {
    value: mockCreateElement,
    writable: true,
  });

  Object.defineProperty(document.body, 'appendChild', {
    value: mockAppendChild,
    writable: true,
  });

  Object.defineProperty(document.body, 'removeChild', {
    value: mockRemoveChild,
    writable: true,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

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

  it('should call onDownloadStart and onDownloadComplete for each file', async () => {
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

    await waitFor(() => {
      expect(onDownloadStart).toHaveBeenCalledTimes(5);
      expect(onDownloadComplete).toHaveBeenCalledTimes(5);
    });

    // Check if all content types were called
    expect(onDownloadStart).toHaveBeenCalledWith('documento');
    expect(onDownloadStart).toHaveBeenCalledWith('quadro-inicial');
    expect(onDownloadStart).toHaveBeenCalledWith('quadro-final');
    expect(onDownloadStart).toHaveBeenCalledWith('podcast');
    expect(onDownloadStart).toHaveBeenCalledWith('video');
  });

  it('should call onDownloadError when download fails', async () => {
    const onDownloadError = jest.fn();

    // Mock createElement to throw an error
    mockCreateElement.mockImplementation(() => {
      throw new Error('Download failed');
    });

    render(
      <DownloadButton {...defaultProps} onDownloadError={onDownloadError} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(onDownloadError).toHaveBeenCalled();
    });
  });

  it('should create download links with correct attributes', async () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  it('should generate correct filenames based on content type and lesson title', async () => {
    const mockElement = {
      href: '',
      download: '',
      target: '',
      rel: '',
      click: mockClick,
    };

    mockCreateElement.mockReturnValue(mockElement);

    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockElement.download).toMatch(/test-lesson-/);
    });
  });

  it('should show loading state during download', async () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Check if aria-label changes to loading state
    expect(button).toHaveAttribute('aria-label', 'Baixando conteúdo...');

    await waitFor(() => {
      expect(button).toHaveAttribute(
        'aria-label',
        'Baixar conteúdo da aula (5 arquivos)'
      );
    });
  });

  it('should not start download when already downloading', async () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');

    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      // Should only create elements for one download session
      expect(mockCreateElement).toHaveBeenCalledTimes(5); // 5 files in mockContent
    });
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

  it('should sanitize lesson title for filename generation', async () => {
    const mockElement = {
      href: '',
      download: '',
      target: '',
      rel: '',
      click: mockClick,
    };

    mockCreateElement.mockReturnValue(mockElement);

    const specialCharTitle = 'Lesson With Special Ch@r$: Title!';
    render(<DownloadButton {...defaultProps} lessonTitle={specialCharTitle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockElement.download).toMatch(/lesson-with-special-chr-title/);
    });
  });

  it('should have correct accessibility attributes', () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).not.toHaveAttribute('aria-hidden');
  });

  it('should handle URL extraction for file extensions', async () => {
    const mockElement = {
      href: '',
      download: '',
      target: '',
      rel: '',
      click: mockClick,
    };

    mockCreateElement.mockReturnValue(mockElement);

    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      // Should set proper file extensions based on URL
      expect(mockElement.download).toMatch(/\.(pdf|jpg|mp3|mp4)$/);
    });
  });
});
