// Mocks need to be defined before importing the component (barrel imports).
jest.mock('../ActivityFilters/ActivityFilters', () => ({
  ActivityFilters: () => null,
}));

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { LessonBank } from './LessonBank';
import type { BaseApiClient } from '../../types/api';
import type {
  Lesson,
  LessonsListResponse,
  LessonsPagination,
} from '../../types/lessons';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';

// Mock components
jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    variant,
    action,
    size,
    iconLeft,
    className,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    action?: string;
    size?: string;
    iconLeft?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
      data-variant={variant}
      data-action={action}
      data-size={size}
      className={className}
      {...props}
    >
      {iconLeft && <span data-testid="button-icon-left">{iconLeft}</span>}
      {children}
    </button>
  ),
}));

jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    children,
    isOpen,
    onClose,
    title,
    size,
    hideCloseButton,
    footer,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size?: string;
    hideCloseButton?: boolean;
    footer?: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal" data-size={size}>
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        {!hideCloseButton && (
          <button onClick={onClose} data-testid="modal-close">
            Close
          </button>
        )}
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    ) : null,
}));

jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    size,
    weight,
    className,
  }: {
    children: React.ReactNode;
    size?: string;
    weight?: string;
    className?: string;
  }) => (
    <span
      data-testid="text"
      data-size={size}
      data-weight={weight}
      className={className}
    >
      {children}
    </span>
  ),
}));

jest.mock('../Skeleton/Skeleton', () => ({
  __esModule: true,
  SkeletonText: ({ lines }: { lines: number }) => (
    <div data-testid="skeleton-text" data-lines={lines}>
      Loading...
    </div>
  ),
}));

jest.mock('../VideoPlayer/VideoPlayer', () => ({
  __esModule: true,
  default: ({
    src,
    poster,
    subtitles,
    onTimeUpdate,
    onVideoComplete,
    initialTime,
    className,
    autoSave,
    storageKey,
  }: {
    src: string;
    poster?: string;
    subtitles?: string;
    onTimeUpdate?: (seconds: number) => void;
    onVideoComplete?: () => void;
    initialTime?: number;
    className?: string;
    autoSave?: boolean;
    storageKey?: string;
  }) => (
    <div
      data-testid="video-player"
      data-src={src}
      data-poster={poster}
      data-subtitles={subtitles}
      data-initial-time={initialTime}
      data-auto-save={autoSave}
      data-storage-key={storageKey}
      className={className}
    >
      <button
        onClick={() => onTimeUpdate?.(30)}
        data-testid="video-time-update"
      >
        Update Time
      </button>
      <button onClick={() => onVideoComplete?.()} data-testid="video-complete">
        Complete
      </button>
    </div>
  ),
}));

jest.mock('../Alert/Alert', () => ({
  __esModule: true,
  default: ({
    action,
    variant,
    description,
    className,
  }: {
    action?: string;
    variant?: string;
    description: string;
    className?: string;
  }) => (
    <div
      data-testid="alert"
      data-action={action}
      data-variant={variant}
      className={className}
    >
      {description}
    </div>
  ),
}));

jest.mock('../Card/Card', () => ({
  __esModule: true,
  CardAudio: ({
    src,
    title,
    onEnded,
  }: {
    src: string;
    title?: string;
    onEnded?: () => void;
  }) => (
    <div data-testid="card-audio" data-src={src} data-title={title}>
      <button onClick={onEnded} data-testid="audio-ended">
        End Audio
      </button>
    </div>
  ),
}));

jest.mock('../Whiteboard/Whiteboard', () => ({
  __esModule: true,
  default: ({
    images,
    showDownload,
    imagesPerRow,
    className,
  }: {
    images: WhiteboardImage[];
    showDownload?: boolean;
    imagesPerRow?: number;
    className?: string;
  }) => (
    <div
      data-testid="whiteboard"
      data-show-download={showDownload}
      data-images-per-row={imagesPerRow}
      className={className}
    >
      {images.map((img) => (
        <div key={img.id} data-testid={`whiteboard-image-${img.id}`}>
          {img.title}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('phosphor-react', () => ({
  Book: ({ size }: { size?: number }) => (
    <span data-testid="book-icon" data-size={size}>
      Book
    </span>
  ),
  Plus: () => <span data-testid="plus-icon">Plus</span>,
}));

jest.mock('@phosphor-icons/react', () => ({
  Video: () => <span data-testid="video-icon">Video</span>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock IntersectionObserver
(globalThis as { IntersectionObserver: unknown }).IntersectionObserver = jest
  .fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .mockImplementation((callback: any) => {
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      trigger: (entries: IntersectionObserverEntry[]) => {
        callback(entries, {} as IntersectionObserver);
      },
    };
  }) as unknown as typeof IntersectionObserver;

describe('LessonBank', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLessons: Lesson[] = [
    {
      id: 'lesson-1',
      title: 'Introdução à Álgebra Linear',
      videoSrc: 'https://example.com/video1.mp4',
      videoPoster: 'https://example.com/poster1.jpg',
      videoSubtitles: 'https://example.com/subtitles1.vtt',
      podcastSrc: 'https://example.com/podcast1.mp3',
      podcastTitle: 'Podcast: Introdução à Álgebra Linear',
      boardImages: [
        {
          id: 'board-1',
          imageUrl: 'https://example.com/board1.jpg',
          title: 'Quadro 1',
        },
      ],
    },
    {
      id: 'lesson-2',
      title: 'Fotossíntese: Processo e Importância',
      videoSrc: 'https://example.com/video2.mp4',
    },
    {
      id: 'lesson-3',
      title: 'Revolução Francesa e seus Impactos',
    },
  ];

  const mockPagination: LessonsPagination = {
    page: 1,
    limit: 20,
    total: 3,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  const createMockApiClient = (
    lessons: Lesson[] = mockLessons,
    pagination: LessonsPagination = mockPagination,
    delay = 0,
    shouldError = false
  ): BaseApiClient => {
    return {
      get: jest.fn(),
      post: jest
        .fn()
        .mockImplementation(
          async <T,>(url: string, body?: Record<string, unknown>) => {
            if (delay > 0) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }

            if (shouldError) {
              throw new Error('API Error');
            }

            if (url === '/lessons/list') {
              const page = (body?.page as number) || 1;
              const limit = (body?.limit as number) || 20;
              const startIndex = (page - 1) * limit;
              const endIndex = startIndex + limit;
              const paginatedLessons = lessons.slice(startIndex, endIndex);

              const response: LessonsListResponse = {
                message: 'Success',
                data: {
                  lessons: paginatedLessons,
                  pagination: {
                    ...pagination,
                    page,
                    limit,
                    total: lessons.length,
                    totalPages: Math.ceil(lessons.length / limit),
                    hasNext: endIndex < lessons.length,
                    hasPrev: page > 1,
                  },
                },
              };

              return { data: response as T };
            }

            return { data: {} as T };
          }
        ),
      patch: jest.fn(),
      delete: jest.fn(),
    } as BaseApiClient;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText('Banco de Aulas')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Introdução à Álgebra Linear')
      ).toBeInTheDocument();
    });

    it('should render with custom className', async () => {
      const apiClient = createMockApiClient();
      const { container } = render(
        <LessonBank apiClient={apiClient} className="custom-class" />
      );

      await waitFor(() => {
        expect(container.querySelector('.custom-class')).toBeInTheDocument();
      });
    });

    it('should display total lessons count', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText('3 aulas total')).toBeInTheDocument();
      });
    });

    it('should display singular form for one lesson', async () => {
      const singleLesson = [mockLessons[0]];
      const apiClient = createMockApiClient(singleLesson, {
        ...mockPagination,
        total: 1,
      });
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText('1 aula total')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      const apiClient = createMockApiClient([], mockPagination, 100);
      render(<LessonBank apiClient={apiClient} />);

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
      expect(screen.getAllByTestId('skeleton-text').length).toBeGreaterThan(0);
    });

    it('should show loading more state when loading additional pages', async () => {
      const paginationWithNext = {
        ...mockPagination,
        hasNext: true,
      };
      const apiClient = createMockApiClient(mockLessons, paginationWithNext);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should display error message when API fails', async () => {
      const apiClient = createMockApiClient([], mockPagination, 0, true);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar aulas/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no lessons are found', async () => {
      const apiClient = createMockApiClient([]);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Nenhuma aula encontrada.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Lesson Cards', () => {
    it('should render lesson cards with title and buttons', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render Assistir and Adicionar à aula buttons for each lesson', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        const assistirButtons = screen.getAllByText('Assistir');
        const adicionarButtons = screen.getAllByText('Adicionar à aula');

        expect(assistirButtons.length).toBe(mockLessons.length);
        expect(adicionarButtons.length).toBe(mockLessons.length);
      });
    });
  });

  describe('Add Lesson Functionality', () => {
    it('should call onAddLesson when clicking Adicionar à aula button', async () => {
      const apiClient = createMockApiClient();
      const onAddLesson = jest.fn();
      render(<LessonBank apiClient={apiClient} onAddLesson={onAddLesson} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const buttons = screen.getAllByText('Adicionar à aula');
      fireEvent.click(buttons[0]);

      expect(onAddLesson).toHaveBeenCalledTimes(1);
      expect(onAddLesson).toHaveBeenCalledWith(mockLessons[0]);
    });

    it('should filter out already added lessons', async () => {
      const apiClient = createMockApiClient();
      render(
        <LessonBank
          apiClient={apiClient}
          addedLessonIds={['lesson-1', 'lesson-2']}
        />
      );

      await waitFor(() => {
        expect(
          screen.queryByText('Introdução à Álgebra Linear')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Fotossíntese: Processo e Importância')
        ).not.toBeInTheDocument();
        expect(
          screen.getByText('Revolução Francesa e seus Impactos')
        ).toBeInTheDocument();
      });
    });

    it('should not reload list when adding a lesson', async () => {
      const apiClient = createMockApiClient();
      const onAddLesson = jest.fn();
      const { rerender } = render(
        <LessonBank apiClient={apiClient} onAddLesson={onAddLesson} />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const postCallCount = (apiClient.post as jest.Mock).mock.calls.length;

      const buttons = screen.getAllByText('Adicionar à aula');
      fireEvent.click(buttons[0]);

      // Update addedLessonIds
      rerender(
        <LessonBank
          apiClient={apiClient}
          onAddLesson={onAddLesson}
          addedLessonIds={['lesson-1']}
        />
      );

      // Should not have made additional API calls
      expect((apiClient.post as jest.Mock).mock.calls.length).toBe(
        postCallCount
      );
    });
  });

  describe('Watch Modal', () => {
    it('should open modal when clicking Assistir button', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const buttons = screen.getAllByText('Assistir');
      fireEvent.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
          'Introdução à Álgebra Linear'
        );
      });
    });

    it('should close modal when clicking Cancelar button', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByText('Cancelar');
      const cancelButton = cancelButtons.find((btn) =>
        btn.closest('[data-testid="modal-footer"]')
      );
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });

    it('should call onAddLesson when clicking Adicionar à aula in modal', async () => {
      const apiClient = createMockApiClient();
      const onAddLesson = jest.fn();
      render(<LessonBank apiClient={apiClient} onAddLesson={onAddLesson} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const adicionarButtons = screen.getAllByText('Adicionar à aula');
      const modalButton = adicionarButtons.find((btn) =>
        btn.closest('[data-testid="modal-footer"]')
      );
      if (modalButton) {
        fireEvent.click(modalButton);
      }

      expect(onAddLesson).toHaveBeenCalledWith(mockLessons[0]);
    });
  });

  describe('VideoPlayer in Modal', () => {
    it('should render VideoPlayer when lesson has video', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
        expect(screen.getByTestId('video-player')).toHaveAttribute(
          'data-src',
          'https://example.com/video1.mp4'
        );
      });
    });

    it('should not render VideoPlayer when lesson has no video', async () => {
      const lessonWithoutVideo = [
        {
          id: 'lesson-no-video',
          title: 'Aula sem Vídeo',
        },
      ];
      const apiClient = createMockApiClient(lessonWithoutVideo);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText('Aula sem Vídeo')).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
        expect(
          screen.getByText('Vídeo não disponível para esta aula.')
        ).toBeInTheDocument();
      });
    });

    it('should call onVideoTimeUpdate when video time updates', async () => {
      const apiClient = createMockApiClient();
      const onVideoTimeUpdate = jest.fn();
      render(
        <LessonBank
          apiClient={apiClient}
          onVideoTimeUpdate={onVideoTimeUpdate}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
      });

      const timeUpdateButton = screen.getByTestId('video-time-update');
      fireEvent.click(timeUpdateButton);

      expect(onVideoTimeUpdate).toHaveBeenCalledWith('lesson-1', 30);
    });

    it('should call onVideoComplete when video completes', async () => {
      const apiClient = createMockApiClient();
      const onVideoComplete = jest.fn();
      render(
        <LessonBank apiClient={apiClient} onVideoComplete={onVideoComplete} />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
      });

      const completeButton = screen.getByTestId('video-complete');
      fireEvent.click(completeButton);

      expect(onVideoComplete).toHaveBeenCalledWith('lesson-1');
    });

    it('should use getInitialTimestamp when provided', async () => {
      const apiClient = createMockApiClient();
      const getInitialTimestamp = jest.fn().mockReturnValue(120);
      render(
        <LessonBank
          apiClient={apiClient}
          getInitialTimestamp={getInitialTimestamp}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
        expect(getInitialTimestamp).toHaveBeenCalledWith('lesson-1');
        expect(screen.getByTestId('video-player')).toHaveAttribute(
          'data-initial-time',
          '120'
        );
      });
    });

    it('should use localStorage as fallback for initial timestamp', async () => {
      localStorageMock.setItem('lesson-lesson-1', '60');
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
        expect(screen.getByTestId('video-player')).toHaveAttribute(
          'data-initial-time',
          '60'
        );
      });
    });
  });

  describe('Trail Route Context', () => {
    it('should use lessonId from trail route when isFromTrailRoute is true', async () => {
      const apiClient = createMockApiClient();
      const onVideoTimeUpdate = jest.fn();
      render(
        <LessonBank
          apiClient={apiClient}
          isFromTrailRoute={true}
          lessonId="trail-lesson-1"
          onVideoTimeUpdate={onVideoTimeUpdate}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
      });

      const timeUpdateButton = screen.getByTestId('video-time-update');
      fireEvent.click(timeUpdateButton);

      expect(onVideoTimeUpdate).toHaveBeenCalledWith('trail-lesson-1', 30);
    });
  });

  describe('Alert in Modal', () => {
    it('should render Alert with info message in modal', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
        expect(screen.getByTestId('alert')).toHaveAttribute(
          'data-action',
          'info'
        );
        expect(
          screen.getByText(
            'Cada aula inclui questionários automáticos para o aluno praticar o conteúdo.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('CardAudio in Modal', () => {
    it('should render CardAudio when lesson has podcast', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('card-audio')).toBeInTheDocument();
        expect(screen.getByTestId('card-audio')).toHaveAttribute(
          'data-src',
          'https://example.com/podcast1.mp3'
        );
        expect(
          screen.getByText('Podcast: Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });
    });

    it('should not render CardAudio when lesson has no podcast', async () => {
      const lessonWithoutPodcast = [
        {
          id: 'lesson-no-podcast',
          title: 'Aula sem Podcast',
          videoSrc: 'https://example.com/video.mp4',
        },
      ];
      const apiClient = createMockApiClient(lessonWithoutPodcast);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText('Aula sem Podcast')).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.queryByTestId('card-audio')).not.toBeInTheDocument();
      });
    });

    it('should call onPodcastEnded when podcast ends', async () => {
      const apiClient = createMockApiClient();
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      render(
        <LessonBank apiClient={apiClient} onPodcastEnded={onPodcastEnded} />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('card-audio')).toBeInTheDocument();
      });

      const audioEndedButton = screen.getByTestId('audio-ended');
      fireEvent.click(audioEndedButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledWith('lesson-1');
      });
    });

    it('should not call onPodcastEnded twice for the same lesson', async () => {
      const apiClient = createMockApiClient();
      const onPodcastEnded = jest.fn().mockResolvedValue(undefined);
      render(
        <LessonBank apiClient={apiClient} onPodcastEnded={onPodcastEnded} />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('card-audio')).toBeInTheDocument();
      });

      const audioEndedButton = screen.getByTestId('audio-ended');
      fireEvent.click(audioEndedButton);
      fireEvent.click(audioEndedButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledTimes(1);
      });
    });

    it('should revert flag if onPodcastEnded fails', async () => {
      const apiClient = createMockApiClient();
      const onPodcastEnded = jest.fn().mockRejectedValue(new Error('Failed'));
      render(
        <LessonBank apiClient={apiClient} onPodcastEnded={onPodcastEnded} />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('card-audio')).toBeInTheDocument();
      });

      const audioEndedButton = screen.getByTestId('audio-ended');
      fireEvent.click(audioEndedButton);

      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalled();
      });

      // Should be able to call again after failure
      fireEvent.click(audioEndedButton);
      await waitFor(() => {
        expect(onPodcastEnded).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Whiteboard in Modal', () => {
    it('should render Whiteboard when lesson has board images', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Quadros da aula')).toBeInTheDocument();
        expect(screen.getByTestId('whiteboard')).toBeInTheDocument();
        expect(
          screen.getByTestId('whiteboard-image-board-1')
        ).toBeInTheDocument();
      });
    });

    it('should not render Whiteboard when lesson has no board images', async () => {
      const lessonWithoutBoards = [
        {
          id: 'lesson-no-boards',
          title: 'Aula sem Quadros',
          videoSrc: 'https://example.com/video.mp4',
        },
      ];
      const apiClient = createMockApiClient(lessonWithoutBoards);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText('Aula sem Quadros')).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Quadros da aula')).not.toBeInTheDocument();
      });
    });

    it('should render multiple board images', async () => {
      const lessonWithMultipleBoards = [
        {
          id: 'lesson-multiple-boards',
          title: 'Aula com Múltiplos Quadros',
          videoSrc: 'https://example.com/video.mp4',
          boardImages: [
            {
              id: 'board-1',
              imageUrl: 'https://example.com/board1.jpg',
              title: 'Quadro 1',
            },
            {
              id: 'board-2',
              imageUrl: 'https://example.com/board2.jpg',
              title: 'Quadro 2',
            },
            {
              id: 'board-3',
              imageUrl: 'https://example.com/board3.jpg',
              title: 'Quadro 3',
            },
          ],
        },
      ];
      const apiClient = createMockApiClient(lessonWithMultipleBoards);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Aula com Múltiplos Quadros')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByTestId('whiteboard-image-board-1')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('whiteboard-image-board-2')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('whiteboard-image-board-3')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Filters', () => {
    it('should send filters in API request', async () => {
      const apiClient = createMockApiClient();
      const filters = {
        subjectId: ['matematica'],
        topicIds: ['algebra'],
        subtopicIds: ['equacoes'],
        contentIds: ['equacoes-primeiro-grau'],
        selectedIds: ['lesson-1', 'lesson-2'],
      };

      render(<LessonBank apiClient={apiClient} filters={filters} />);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/lessons/list',
          expect.objectContaining({
            page: 1,
            limit: 20,
            filters: {
              subjectId: ['matematica'],
              topicIds: ['algebra'],
              subtopicIds: ['equacoes'],
              contentIds: ['equacoes-primeiro-grau'],
              selectedIds: ['lesson-1', 'lesson-2'],
            },
          })
        );
      });
    });

    it('should not send empty filters in API request', async () => {
      const apiClient = createMockApiClient();
      const filters = {
        subjectId: [],
        topicIds: [],
      };

      render(<LessonBank apiClient={apiClient} filters={filters} />);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/lessons/list',
          expect.objectContaining({
            page: 1,
            limit: 20,
          })
        );

        const callArgs = (apiClient.post as jest.Mock).mock
          .calls[0][1] as Record<string, unknown>;
        expect(callArgs.filters).toBeUndefined();
      });
    });

    it('should reload lessons when filters change', async () => {
      const apiClient = createMockApiClient();
      const { rerender } = render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalled();
      });

      const initialCallCount = (apiClient.post as jest.Mock).mock.calls.length;

      rerender(
        <LessonBank
          apiClient={apiClient}
          filters={{ subjectId: ['matematica'] }}
        />
      );

      await waitFor(() => {
        expect((apiClient.post as jest.Mock).mock.calls.length).toBeGreaterThan(
          initialCallCount
        );
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('should load more lessons when scrolling to bottom', async () => {
      const manyLessons = Array.from({ length: 25 }, (_, i) => ({
        id: `lesson-${i + 1}`,
        title: `Aula ${i + 1}`,
      }));

      const paginationWithNext = {
        ...mockPagination,
        total: 25,
        hasNext: true,
      };

      const apiClient = createMockApiClient(manyLessons, paginationWithNext);
      render(<LessonBank apiClient={apiClient} />);

      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByText('Aula 1')).toBeInTheDocument();
      });

      // Wait for loading to finish and observer target to be available
      await waitFor(
        () => {
          const observerTarget = document.querySelector('[class*="h-4"]');
          expect(observerTarget).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Verify IntersectionObserver was called
      expect(IntersectionObserver).toHaveBeenCalled();

      // Get the initial call count
      const initialCallCount = (apiClient.post as jest.Mock).mock.calls.length;

      // Wait for component state to be stable (loading = false, loadingMore = false)
      // The IntersectionObserver callback checks these states before calling loadMore
      await waitFor(
        async () => {
          // Wait a bit to ensure state is stable
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Get the most recent observer instance (in case it was recreated)
          const mockCalls = (IntersectionObserver as jest.Mock).mock.results;
          expect(mockCalls.length).toBeGreaterThan(0);

          const observerInstance = mockCalls[mockCalls.length - 1].value;
          const observerTarget = document.querySelector('[class*="h-4"]');

          expect(observerInstance).toBeDefined();
          expect(observerTarget).toBeInTheDocument();

          // Trigger the intersection observer callback
          const mockEntry = {
            isIntersecting: true,
            target: observerTarget,
          } as IntersectionObserverEntry;

          await act(async () => {
            observerInstance.trigger([mockEntry]);
          });
        },
        { timeout: 2000 }
      );

      // Wait for the API call to be made
      await waitFor(
        () => {
          expect(
            (apiClient.post as jest.Mock).mock.calls.length
          ).toBeGreaterThan(initialCallCount);
        },
        { timeout: 3000 }
      );
    });

    it('should not load more when hasNext is false', async () => {
      const apiClient = createMockApiClient(mockLessons, {
        ...mockPagination,
        hasNext: false,
      });
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const initialCallCount = (apiClient.post as jest.Mock).mock.calls.length;

      // Verify IntersectionObserver was called
      expect(IntersectionObserver).toHaveBeenCalled();

      // Get the observer instance
      const observerInstance = (IntersectionObserver as jest.Mock).mock
        .results[0].value;

      // Simulate intersection
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const observerTarget = document.querySelector('[class*="h-4"]');
      if (observerTarget) {
        const mockEntry = {
          isIntersecting: true,
          target: observerTarget,
        } as IntersectionObserverEntry;

        await act(async () => {
          observerInstance.trigger([mockEntry]);
        });
      }

      // Should not have made additional calls
      expect((apiClient.post as jest.Mock).mock.calls.length).toBe(
        initialCallCount
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle lesson without any media content', async () => {
      const lessonWithoutMedia = [
        {
          id: 'lesson-no-media',
          title: 'Aula sem Mídia',
        },
      ];
      const apiClient = createMockApiClient(lessonWithoutMedia);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText('Aula sem Mídia')).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText('Vídeo não disponível para esta aula.')
        ).toBeInTheDocument();
      });
    });

    it('should handle lesson with only video', async () => {
      const lessonWithOnlyVideo = [
        {
          id: 'lesson-video-only',
          title: 'Aula só com Vídeo',
          videoSrc: 'https://example.com/video.mp4',
        },
      ];
      const apiClient = createMockApiClient(lessonWithOnlyVideo);
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(screen.getByText('Aula só com Vídeo')).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
        expect(screen.queryByTestId('card-audio')).not.toBeInTheDocument();
        expect(screen.queryByText('Quadros da aula')).not.toBeInTheDocument();
      });
    });

    it('should handle onAddLesson being undefined', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const buttons = screen.getAllByText('Adicionar à aula');
      // Should not throw error
      expect(() => fireEvent.click(buttons[0])).not.toThrow();
    });

    it('should handle modal close without selected lesson', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByText('Cancelar');
      const cancelButton = cancelButtons.find((btn) =>
        btn.closest('[data-testid="modal-footer"]')
      );
      if (cancelButton) {
        expect(() => fireEvent.click(cancelButton)).not.toThrow();
      }
    });
  });

  describe('Component Integration', () => {
    it('should render all components together in modal', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
        expect(screen.getByTestId('alert')).toBeInTheDocument();
        expect(screen.getByTestId('card-audio')).toBeInTheDocument();
        expect(screen.getByTestId('whiteboard')).toBeInTheDocument();
      });
    });

    it('should maintain state when switching between lessons', async () => {
      const apiClient = createMockApiClient();
      render(<LessonBank apiClient={apiClient} />);

      await waitFor(() => {
        expect(
          screen.getByText('Introdução à Álgebra Linear')
        ).toBeInTheDocument();
      });

      // Open first lesson modal
      const assistirButtons = screen.getAllByText('Assistir');
      fireEvent.click(assistirButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
          'Introdução à Álgebra Linear'
        );
      });

      // Close modal
      const cancelButtons = screen.getAllByText('Cancelar');
      const cancelButton = cancelButtons.find((btn) =>
        btn.closest('[data-testid="modal-footer"]')
      );
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });

      // Open second lesson modal
      fireEvent.click(assistirButtons[1]);

      await waitFor(() => {
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
          'Fotossíntese: Processo e Importância'
        );
      });
    });
  });
});
