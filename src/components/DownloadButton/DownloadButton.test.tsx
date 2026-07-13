import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DownloadButton, {
  DownloadButtonProps,
  DownloadContent,
} from './DownloadButton';

// Mock fetch globally
(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

const mockFetch = (globalThis as unknown as { fetch: jest.Mock }).fetch;

type GlobalWithPicker = {
  showDirectoryPicker?: jest.Mock;
};

const globalWithPicker = globalThis as GlobalWithPicker;

/** Records what each streamed file received, keyed by filename. */
interface WrittenFiles {
  [filename: string]: number;
}

/**
 * Install a fake directory handle, standing in for the folder the user picks.
 *
 * @param written - Map that accumulates bytes written per filename
 * @returns The mock createWritable factory, to assert on aborts
 */
const mockDirectoryPicker = (written: WrittenFiles) => {
  const abort = jest.fn().mockResolvedValue(undefined);

  globalWithPicker.showDirectoryPicker = jest.fn().mockResolvedValue({
    getFileHandle: (filename: string) =>
      Promise.resolve({
        createWritable: () =>
          Promise.resolve({
            write: (chunk: Uint8Array) => {
              written[filename] = (written[filename] ?? 0) + chunk.length;
              return Promise.resolve();
            },
            close: () => Promise.resolve(),
            abort,
          }),
      }),
  });

  return { abort };
};

/**
 * Stub HEAD (size probe) and GET (streamed body) for every asset.
 *
 * @param bytesPerFile - Size reported and streamed per asset
 * @param failUrlPart - Substring of a URL whose GET should fail
 */
const mockAssetResponses = (bytesPerFile = 4, failUrlPart?: string) => {
  mockFetch.mockImplementation((url: string, init?: { method?: string }) => {
    if (init?.method === 'HEAD') {
      return Promise.resolve({
        ok: true,
        headers: { get: () => String(bytesPerFile) },
      });
    }

    if (failUrlPart && url.includes(failUrlPart)) {
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
    delete globalWithPicker.showDirectoryPicker;
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
    render(
      <DownloadButton content={{ urlVideo: 'https://example.com/video.mp4' }} />
    );

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
    render(<DownloadButton {...defaultProps} className="custom-class" />);

    expect(screen.getByRole('button').parentElement).toHaveClass(
      'custom-class'
    );
  });

  it('should handle partial content correctly', () => {
    render(
      <DownloadButton
        content={{
          urlVideo: 'https://example.com/video.mp4',
          urlPodcast: 'https://example.com/podcast.mp3',
        }}
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Baixar conteúdo da aula (2 arquivos)'
    );
  });

  describe('streaming to a folder', () => {
    it('should stream every asset to the folder the user picked', async () => {
      const written: WrittenFiles = {};
      mockDirectoryPicker(written);
      mockAssetResponses(10);

      const onDownloadComplete = jest.fn();

      render(
        <DownloadButton
          {...defaultProps}
          onDownloadComplete={onDownloadComplete}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(onDownloadComplete).toHaveBeenCalledTimes(4));

      // Every asset — including the board frames, which used to be dropped when
      // the whole lesson was buffered in memory to build a zip.
      expect(written).toEqual({
        'test-lesson-video.mp4': 10,
        'test-lesson-podcast.mp3': 10,
        'test-lesson-quadro-inicial.jpg': 10,
        'test-lesson-quadro-final.jpg': 10,
      });
    });

    it('should never buffer a whole file: bytes go straight to disk', async () => {
      const written: WrittenFiles = {};
      mockDirectoryPicker(written);
      mockAssetResponses(10);

      const onDownloadComplete = jest.fn();

      render(
        <DownloadButton
          content={{ urlVideo: 'https://example.com/video.mp4' }}
          lessonTitle="Test Lesson"
          onDownloadComplete={onDownloadComplete}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(onDownloadComplete).toHaveBeenCalled());

      // A Blob would mean the file was held in memory — the exact failure that
      // dropped assets queued behind a ~900MB video.
      expect(written['test-lesson-video.mp4']).toBe(10);
    });

    it('should keep the other assets when one of them fails', async () => {
      const written: WrittenFiles = {};
      const { abort } = mockDirectoryPicker(written);
      mockAssetResponses(10, 'podcast');

      const onDownloadError = jest.fn();
      const onDownloadComplete = jest.fn();

      render(
        <DownloadButton
          {...defaultProps}
          onDownloadError={onDownloadError}
          onDownloadComplete={onDownloadComplete}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(onDownloadComplete).toHaveBeenCalledTimes(3));

      expect(onDownloadError).toHaveBeenCalledWith(
        'podcast',
        expect.any(Error)
      );
      expect(Object.keys(written)).not.toContain('test-lesson-podcast.mp3');
      expect(written['test-lesson-quadro-final.jpg']).toBe(10);
      expect(abort).not.toHaveBeenCalled();
    });

    it('should report an error when no asset could be downloaded', async () => {
      const written: WrittenFiles = {};
      mockDirectoryPicker(written);
      mockFetch.mockImplementation(
        (_url: string, init?: { method?: string }) =>
          init?.method === 'HEAD'
            ? Promise.resolve({ ok: true, headers: { get: () => '10' } })
            : Promise.resolve({ ok: false, status: 500, statusText: 'Error' })
      );

      const onDownloadError = jest.fn();

      render(
        <DownloadButton {...defaultProps} onDownloadError={onDownloadError} />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() =>
        expect(onDownloadError).toHaveBeenCalledWith('aula', expect.any(Error))
      );
    });

    it('should fall back to file-count progress without content-length', async () => {
      const written: WrittenFiles = {};
      mockDirectoryPicker(written);
      mockFetch.mockImplementation(
        (_url: string, init?: { method?: string }) => {
          if (init?.method === 'HEAD') {
            // No content-length: the component must not divide by zero.
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
                  return Promise.resolve({
                    done: false,
                    value: new Uint8Array(10),
                  });
                },
              }),
            },
          });
        }
      );

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

    it('should abort quietly when the user dismisses the folder picker', async () => {
      globalWithPicker.showDirectoryPicker = jest
        .fn()
        .mockRejectedValue(new Error('AbortError'));

      const onDownloadError = jest.fn();
      const onDownloadStart = jest.fn();

      render(
        <DownloadButton
          {...defaultProps}
          onDownloadError={onDownloadError}
          onDownloadStart={onDownloadStart}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() =>
        expect(globalWithPicker.showDirectoryPicker).toHaveBeenCalled()
      );

      // Dismissing the picker is not an error — nothing is reported, nothing runs.
      expect(onDownloadError).not.toHaveBeenCalled();
      expect(onDownloadStart).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show the progress modal while downloading', async () => {
      // Hold the first write open so the modal can be observed mid-download.
      let releaseWrite: () => void = () => {};
      const firstWrite = new Promise<void>((resolve) => {
        releaseWrite = resolve;
      });
      let held = false;

      globalWithPicker.showDirectoryPicker = jest.fn().mockResolvedValue({
        getFileHandle: () =>
          Promise.resolve({
            createWritable: () =>
              Promise.resolve({
                write: async () => {
                  if (!held) {
                    held = true;
                    await firstWrite;
                  }
                },
                close: () => Promise.resolve(),
              }),
          }),
      });
      mockAssetResponses(10);

      render(<DownloadButton {...defaultProps} />);

      fireEvent.click(screen.getByRole('button'));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      // ProgressModal renders the message twice: visible, plus an sr-only <h2>.
      expect(
        screen.getAllByText('Baixando conteúdo da aula...').length
      ).toBeGreaterThan(0);

      releaseWrite();

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
    });
  });

  describe('fallback for browsers without the File System Access API', () => {
    it('should let the browser download each asset', async () => {
      const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click');
      const onDownloadComplete = jest.fn();

      render(
        <DownloadButton
          {...defaultProps}
          onDownloadComplete={onDownloadComplete}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(onDownloadComplete).toHaveBeenCalledTimes(4), {
        timeout: 10000,
      });

      // The browser streams each file itself, so memory is never a concern here.
      expect(clickSpy).toHaveBeenCalledTimes(4);
      expect(mockFetch).not.toHaveBeenCalled();

      clickSpy.mockRestore();
    });
  });

  it('should not download when already downloading', () => {
    const written: WrittenFiles = {};
    mockDirectoryPicker(written);
    mockAssetResponses(10);

    render(<DownloadButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockDirectoryPicker).toBeDefined();
  });
});
