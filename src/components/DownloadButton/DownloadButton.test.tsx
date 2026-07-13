import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JSZip from 'jszip';
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

const mockFetch = (globalThis as unknown as { fetch: jest.Mock }).fetch;

/**
 * Stub a HEAD (size probe) and a GET (body stream) for every asset URL.
 *
 * The component streams the body via `getReader()`, so the GET response has to
 * expose one, otherwise it silently takes the no-body fallback path.
 */
const mockAssetResponses = (bytesPerFile = 4) => {
  mockFetch.mockImplementation((_url: string, init?: { method?: string }) => {
    if (init?.method === 'HEAD') {
      return Promise.resolve({
        ok: true,
        headers: { get: () => String(bytesPerFile) },
      });
    }

    let done = false;
    return Promise.resolve({
      ok: true,
      body: {
        getReader: () => ({
          read: () => {
            if (done) return Promise.resolve({ done: true, value: undefined });
            done = true;
            return Promise.resolve({
              done: false,
              value: new Uint8Array(bytesPerFile),
            });
          },
        }),
      },
    });
  });
};

describe('DownloadButton', () => {
  const mockContent: DownloadContent = {
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
    document.body.innerHTML = '';
  });

  it('should render download button when content is available', () => {
    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute(
      'aria-label',
      'Baixar conteúdo da aula (4 arquivos)'
    );
  });

  it('should not render when no valid content is available', () => {
    render(<DownloadButton content={{}} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should not render when content URLs are empty strings', () => {
    const emptyContent: DownloadContent = {
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
      urlVideo: 'https://example.com/video.mp4',
    };
    render(<DownloadButton content={singleContent} />);

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Baixar conteúdo da aula (1 arquivo)'
    );
  });

  it('should be disabled when disabled prop is true', () => {
    render(<DownloadButton {...defaultProps} disabled={true} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-download-button';
    render(<DownloadButton {...defaultProps} className={customClass} />);

    expect(screen.getByRole('button').parentElement).toHaveClass(customClass);
  });

  it('should handle partial content correctly', () => {
    const partialContent: DownloadContent = {
      urlVideo: 'https://example.com/video.mp4',
      urlPodcast: 'https://example.com/podcast.mp3',
    };

    render(<DownloadButton content={partialContent} />);

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Baixar conteúdo da aula (2 arquivos)'
    );
  });

  it('should bundle every asset into a single zip saved with one click', async () => {
    mockAssetResponses();

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click');
    const zipSpy = jest.spyOn(JSZip.prototype, 'file');

    const onDownloadComplete = jest.fn();

    render(
      <DownloadButton
        {...defaultProps}
        onDownloadComplete={onDownloadComplete}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onDownloadComplete).toHaveBeenCalledTimes(4));

    // Every asset lands inside the zip...
    const zippedNames = zipSpy.mock.calls.map(([name]) => name);
    expect(zippedNames).toEqual([
      'test-lesson-video.mp4',
      'test-lesson-podcast.mp3',
      'test-lesson-quadro-inicial.jpg',
      'test-lesson-quadro-final.jpg',
    ]);

    // ...and the browser is only ever asked to save one file: the zip itself.
    // Firing several downloads in a row is exactly what browsers block.
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));

    clickSpy.mockRestore();
    zipSpy.mockRestore();
  });

  it('should show the progress modal while downloading', async () => {
    mockAssetResponses();

    render(<DownloadButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    // ProgressModal renders the message twice: visible, plus an sr-only <h2>.
    expect(
      screen.getAllByText('Baixando conteúdo da aula...').length
    ).toBeGreaterThan(0);

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('should still zip the remaining assets when one of them fails', async () => {
    mockFetch.mockImplementation((url: string, init?: { method?: string }) => {
      if (init?.method === 'HEAD') {
        return Promise.resolve({
          ok: true,
          headers: { get: () => '4' },
        });
      }
      if (url.includes('podcast')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });
      }

      let done = false;
      return Promise.resolve({
        ok: true,
        body: {
          getReader: () => ({
            read: () => {
              if (done)
                return Promise.resolve({ done: true, value: undefined });
              done = true;
              return Promise.resolve({ done: false, value: new Uint8Array(4) });
            },
          }),
        },
      });
    });

    const onDownloadError = jest.fn();
    const onDownloadComplete = jest.fn();
    const zipSpy = jest.spyOn(JSZip.prototype, 'file');

    render(
      <DownloadButton
        {...defaultProps}
        onDownloadError={onDownloadError}
        onDownloadComplete={onDownloadComplete}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onDownloadComplete).toHaveBeenCalledTimes(3));

    expect(onDownloadError).toHaveBeenCalledWith('podcast', expect.any(Error));
    expect(zipSpy.mock.calls.map(([name]) => name)).not.toContain(
      'test-lesson-podcast.mp3'
    );

    zipSpy.mockRestore();
  });

  it('should report an error when no asset could be downloaded', async () => {
    mockFetch.mockImplementation((_url: string, init?: { method?: string }) => {
      if (init?.method === 'HEAD') {
        return Promise.resolve({ ok: true, headers: { get: () => '4' } });
      }
      return Promise.resolve({ ok: false, status: 500, statusText: 'Error' });
    });

    const onDownloadError = jest.fn();

    render(
      <DownloadButton {...defaultProps} onDownloadError={onDownloadError} />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(onDownloadError).toHaveBeenCalledWith('aula', expect.any(Error))
    );
  });

  it('should fall back to file-count progress when content-length is missing', async () => {
    mockFetch.mockImplementation((_url: string, init?: { method?: string }) => {
      if (init?.method === 'HEAD') {
        // No content-length header: the component must not divide by zero.
        return Promise.resolve({ ok: true, headers: { get: () => null } });
      }

      let done = false;
      return Promise.resolve({
        ok: true,
        body: {
          getReader: () => ({
            read: () => {
              if (done)
                return Promise.resolve({ done: true, value: undefined });
              done = true;
              return Promise.resolve({ done: false, value: new Uint8Array(4) });
            },
          }),
        },
      });
    });

    const onDownloadComplete = jest.fn();

    render(
      <DownloadButton
        {...defaultProps}
        onDownloadComplete={onDownloadComplete}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onDownloadComplete).toHaveBeenCalledTimes(4));
  });

  it('should not download when already downloading', () => {
    mockAssetResponses();

    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-label', 'Baixando conteúdo...');
  });
});
