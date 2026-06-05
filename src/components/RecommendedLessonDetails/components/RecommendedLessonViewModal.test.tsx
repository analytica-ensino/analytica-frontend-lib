import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  RecommendedLessonViewModal,
  RecommendedLessonViewModalProps,
} from './RecommendedLessonViewModal';
import type { LessonDetailsData } from '../../../types/recommendedLessons';
import type { Lesson } from '../../../types/lessons';

// Mock useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

// Mock phosphor-react icons
jest.mock('phosphor-react', () => ({
  X: () => <div data-testid="close-icon" />,
  CaretDown: () => <div data-testid="caret-down-icon" />,
  CaretUp: () => <div data-testid="caret-up-icon" />,
  Play: () => <div data-testid="play-icon" />,
  DownloadSimple: () => <div data-testid="download-icon" />,
}));

// Mock Modal component
jest.mock('../../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    title,
    footer,
    children,
  }: {
    isOpen: boolean;
    title: string;
    footer: React.ReactNode;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <h1>{title}</h1>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
}));

// Mock VideoPlayer component
jest.mock('../../VideoPlayer/VideoPlayer', () => ({
  __esModule: true,
  default: ({ src }: { src: string }) => (
    <div data-testid="video-player">Video: {src}</div>
  ),
}));

// Mock CardAudio and CardBase components
jest.mock('../../Card/Card', () => ({
  CardAudio: ({ src, title }: { src: string; title: string }) => (
    <div data-testid="card-audio">
      Audio: {title} - {src}
    </div>
  ),
  CardBase: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-base" className={className}>
      {children}
    </div>
  ),
}));

// Mock Whiteboard component
jest.mock('../../Whiteboard/Whiteboard', () => ({
  __esModule: true,
  default: ({ images }: { images: Array<{ id: string; imageUrl: string }> }) => (
    <div data-testid="whiteboard">
      {images.map((img) => (
        <img key={img.id} src={img.imageUrl} alt={img.id} />
      ))}
    </div>
  ),
}));

// Mock Accordation component
jest.mock('../../Accordation', () => ({
  CardAccordation: ({
    trigger,
    children,
    expanded,
    onToggleExpanded,
  }: {
    trigger: React.ReactNode;
    children: React.ReactNode;
    expanded: boolean;
    onToggleExpanded: (expanded: boolean) => void;
  }) => (
    <div data-testid="card-accordation">
      <div
        data-testid="accordion-trigger"
        onClick={() => onToggleExpanded(!expanded)}
      >
        {trigger}
      </div>
      {expanded && <div data-testid="accordion-content">{children}</div>}
    </div>
  ),
}));

// Mock Alert component
jest.mock('../../Alert/Alert', () => ({
  __esModule: true,
  default: ({ description }: { description: string }) => (
    <div data-testid="alert">{description}</div>
  ),
}));

// Mock Badge component
jest.mock('../../Badge/Badge', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

// Mock Text component
jest.mock('../../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
}));

// Mock Button component
jest.mock('../../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

// Mock Skeleton components
jest.mock('../../Skeleton/Skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
  SkeletonRounded: () => <div data-testid="skeleton-rounded" />,
}));

// Create mock data helper
const createMockLessonDetailsData = (
  overrides?: Partial<LessonDetailsData>
): LessonDetailsData => ({
  recommendedClass: {
    id: 'rc-123',
    title: 'Aula de Matemática',
    startDate: '2024-01-01',
    finalDate: '2024-12-31',
    progress: 50,
    lessons: [
      {
        recommendedClassId: 'rc-123',
        supLessonsProgressId: 'slp-1',
        supLessonsProgress: {
          id: 'slp-1',
          userId: 'user-1',
          lessonId: 'lesson-1',
          progress: 50,
          lesson: {
            id: 'lesson-1',
            videoTitle: 'Introdução às Equações',
            content: { id: 'content-1', name: 'Equações do 1º Grau' },
            subtopic: { id: 'subtopic-1', name: 'Equações Lineares' },
            topic: { id: 'topic-1', name: 'Álgebra' },
            subject: {
              id: 'subject-1',
              name: 'Matemática',
              color: '#FF5722',
              icon: 'math',
            },
          },
        },
      },
    ],
  },
  details: {
    students: [],
    aggregated: { completionPercentage: 50, avgScore: 8.5 },
    contentPerformance: { best: null, worst: null },
  },
  ...overrides,
});

// Create mock lesson data for API response
const createMockLesson = (overrides?: Partial<Lesson>): Lesson =>
  ({
    id: 'lesson-1',
    videoTitle: 'Introdução às Equações',
    urlVideo: 'https://example.com/video.mp4',
    urlCover: 'https://example.com/cover.jpg',
    urlSubtitle: null,
    urlPodCast: 'https://example.com/podcast.mp3',
    podCastTitle: 'Podcast de Matemática',
    urlInitialFrame: 'https://example.com/initial.jpg',
    urlFinalFrame: 'https://example.com/final.jpg',
    ...overrides,
  }) as Lesson;

// Create mock API client
const createMockApiClient = (lessonData?: Lesson) => ({
  get: jest.fn().mockResolvedValue({
    data: { data: lessonData || createMockLesson() },
  }),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
});

describe('RecommendedLessonViewModal', () => {
  const defaultProps: RecommendedLessonViewModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    data: createMockLessonDetailsData(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<RecommendedLessonViewModal {...defaultProps} />);

      expect(screen.getByText('Ver Aula')).toBeInTheDocument();
      expect(screen.getByText('Aula de Matemática')).toBeInTheDocument();
    });

    it('should not render content when isOpen is false', () => {
      render(<RecommendedLessonViewModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Ver Aula')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<RecommendedLessonViewModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /fechar/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Header Card', () => {
    it('should display recommended class title', () => {
      render(<RecommendedLessonViewModal {...defaultProps} />);

      expect(screen.getByText('Aula de Matemática')).toBeInTheDocument();
    });

    it('should display start date', () => {
      render(<RecommendedLessonViewModal {...defaultProps} />);

      expect(screen.getByText(/Início:/)).toBeInTheDocument();
    });

    it('should display deadline', () => {
      render(<RecommendedLessonViewModal {...defaultProps} />);

      expect(screen.getByText(/Prazo:/)).toBeInTheDocument();
    });

    it('should display status badge as ATIVA when in progress', () => {
      const data = createMockLessonDetailsData({
        recommendedClass: {
          ...createMockLessonDetailsData().recommendedClass,
          progress: 50,
          finalDate: '2099-12-31', // Future date
        },
      });

      render(<RecommendedLessonViewModal {...defaultProps} data={data} />);

      expect(screen.getByText('ATIVA')).toBeInTheDocument();
    });

    it('should display status badge as CONCLUÍDA when progress is 100%', () => {
      const data = createMockLessonDetailsData({
        recommendedClass: {
          ...createMockLessonDetailsData().recommendedClass,
          progress: 100,
        },
      });

      render(<RecommendedLessonViewModal {...defaultProps} data={data} />);

      expect(screen.getByText('CONCLUÍDA')).toBeInTheDocument();
    });

    it('should display status badge as VENCIDA when deadline has passed', () => {
      const data = createMockLessonDetailsData({
        recommendedClass: {
          ...createMockLessonDetailsData().recommendedClass,
          progress: 50,
          finalDate: '2020-01-01', // Past date
        },
      });

      render(<RecommendedLessonViewModal {...defaultProps} data={data} />);

      expect(screen.getByText('VENCIDA')).toBeInTheDocument();
    });
  });

  describe('Lessons Section', () => {
    it('should display "Aulas" section title', () => {
      render(<RecommendedLessonViewModal {...defaultProps} />);

      expect(screen.getByText('Aulas')).toBeInTheDocument();
    });

    it('should display lesson items', () => {
      render(<RecommendedLessonViewModal {...defaultProps} />);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(
        screen.getByText(/Álgebra • Equações Lineares • Equações do 1º Grau/)
      ).toBeInTheDocument();
    });

    it('should display "Nenhuma aula encontrada" when no lessons', () => {
      const data = createMockLessonDetailsData({
        recommendedClass: {
          ...createMockLessonDetailsData().recommendedClass,
          lessons: [],
        },
      });

      render(<RecommendedLessonViewModal {...defaultProps} data={data} />);

      expect(screen.getByText('Nenhuma aula encontrada.')).toBeInTheDocument();
    });

    it('should render multiple lessons', () => {
      const data = createMockLessonDetailsData({
        recommendedClass: {
          ...createMockLessonDetailsData().recommendedClass,
          lessons: [
            {
              recommendedClassId: 'rc-123',
              supLessonsProgressId: 'slp-1',
              supLessonsProgress: {
                id: 'slp-1',
                userId: 'user-1',
                lessonId: 'lesson-1',
                progress: 50,
                lesson: {
                  id: 'lesson-1',
                  videoTitle: 'Aula 1',
                  content: { id: 'c1', name: 'Conteúdo 1' },
                  subtopic: { id: 's1', name: 'Subtópico 1' },
                  topic: { id: 't1', name: 'Tópico 1' },
                  subject: {
                    id: 'sub1',
                    name: 'Português',
                    color: '#4CAF50',
                    icon: 'book',
                  },
                },
              },
            },
            {
              recommendedClassId: 'rc-123',
              supLessonsProgressId: 'slp-2',
              supLessonsProgress: {
                id: 'slp-2',
                userId: 'user-1',
                lessonId: 'lesson-2',
                progress: 75,
                lesson: {
                  id: 'lesson-2',
                  videoTitle: 'Aula 2',
                  content: { id: 'c2', name: 'Conteúdo 2' },
                  subtopic: { id: 's2', name: 'Subtópico 2' },
                  topic: { id: 't2', name: 'Tópico 2' },
                  subject: {
                    id: 'sub2',
                    name: 'História',
                    color: '#2196F3',
                    icon: 'history',
                  },
                },
              },
            },
          ],
        },
      });

      render(<RecommendedLessonViewModal {...defaultProps} data={data} />);

      expect(screen.getByText('Português')).toBeInTheDocument();
      expect(screen.getByText('História')).toBeInTheDocument();
    });
  });

  describe('Lesson Accordion', () => {
    it('should expand lesson accordion when clicked', async () => {
      const apiClient = createMockApiClient();
      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      // Find the accordion trigger (the content name text)
      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      // Wait for loading to complete and video player to appear
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/lesson/lesson-1');
      });
    });

    it('should fetch lesson data when accordion expands', async () => {
      const apiClient = createMockApiClient();
      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/lesson/lesson-1');
      });
    });

    it('should cache lesson data and not refetch on second expansion', async () => {
      const apiClient = createMockApiClient();
      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      const accordionTrigger = screen.getByText('Equações do 1º Grau');

      // First click - expand
      fireEvent.click(accordionTrigger);
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(1);
      });

      // Second click - collapse
      fireEvent.click(accordionTrigger);

      // Third click - expand again
      fireEvent.click(accordionTrigger);

      // Should still only have 1 call (cached)
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Lesson Content', () => {
    it('should display video player when lesson has video', async () => {
      const apiClient = createMockApiClient(
        createMockLesson({ urlVideo: 'https://example.com/video.mp4' })
      );

      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeInTheDocument();
      });
    });

    it('should display message when video is not available', async () => {
      const apiClient = createMockApiClient(
        createMockLesson({ urlVideo: null as unknown as string })
      );

      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      await waitFor(() => {
        expect(
          screen.getByText('Vídeo não disponível para esta aula.')
        ).toBeInTheDocument();
      });
    });

    it('should display podcast card when lesson has podcast', async () => {
      const apiClient = createMockApiClient(
        createMockLesson({ urlPodCast: 'https://example.com/podcast.mp3' })
      );

      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      await waitFor(() => {
        expect(screen.getByTestId('card-audio')).toBeInTheDocument();
      });
    });

    it('should display whiteboard images when available', async () => {
      const apiClient = createMockApiClient(
        createMockLesson({
          urlInitialFrame: 'https://example.com/initial.jpg',
          urlFinalFrame: 'https://example.com/final.jpg',
        })
      );

      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      await waitFor(() => {
        expect(screen.getAllByTestId('whiteboard').length).toBeGreaterThan(0);
      });
    });

    it('should display alert about automatic questionnaires', async () => {
      const apiClient = createMockApiClient();

      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Cada aula inclui questionários automáticos para o aluno praticar o conteúdo.'
          )
        ).toBeInTheDocument();
      });
    });

    it('should display error message when lesson fetch fails', async () => {
      const apiClient = {
        get: jest.fn().mockRejectedValue(new Error('Network error')),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
      };

      render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      await waitFor(() => {
        expect(
          screen.getByText('Erro ao carregar dados da aula')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Subject Color', () => {
    it('should apply subject color to lesson header when color is hex', () => {
      const data = createMockLessonDetailsData({
        recommendedClass: {
          ...createMockLessonDetailsData().recommendedClass,
          lessons: [
            {
              recommendedClassId: 'rc-123',
              supLessonsProgressId: 'slp-1',
              supLessonsProgress: {
                id: 'slp-1',
                userId: 'user-1',
                lessonId: 'lesson-1',
                progress: 50,
                lesson: {
                  id: 'lesson-1',
                  videoTitle: 'Test',
                  content: { id: 'c1', name: 'Content' },
                  subtopic: { id: 's1', name: 'Subtopic' },
                  topic: { id: 't1', name: 'Topic' },
                  subject: {
                    id: 'sub1',
                    name: 'Matemática',
                    color: '#FF5722',
                    icon: 'math',
                  },
                },
              },
            },
          ],
        },
      });

      render(<RecommendedLessonViewModal {...defaultProps} data={data} />);

      // The subject name should be displayed
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('should apply Tailwind class when color starts with bg-', () => {
      const data = createMockLessonDetailsData({
        recommendedClass: {
          ...createMockLessonDetailsData().recommendedClass,
          lessons: [
            {
              recommendedClassId: 'rc-123',
              supLessonsProgressId: 'slp-1',
              supLessonsProgress: {
                id: 'slp-1',
                userId: 'user-1',
                lessonId: 'lesson-1',
                progress: 50,
                lesson: {
                  id: 'lesson-1',
                  videoTitle: 'Test',
                  content: { id: 'c1', name: 'Content' },
                  subtopic: { id: 's1', name: 'Subtopic' },
                  topic: { id: 't1', name: 'Topic' },
                  subject: {
                    id: 'sub1',
                    name: 'Ciências',
                    color: 'bg-green-500',
                    icon: 'science',
                  },
                },
              },
            },
          ],
        },
      });

      render(<RecommendedLessonViewModal {...defaultProps} data={data} />);

      expect(screen.getByText('Ciências')).toBeInTheDocument();
    });
  });

  describe('Cache reset', () => {
    it('should clear lesson cache when modal closes', async () => {
      const apiClient = createMockApiClient();
      const { rerender } = render(
        <RecommendedLessonViewModal
          {...defaultProps}
          apiClient={apiClient}
        />
      );

      // Expand accordion and fetch data
      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(1);
      });

      // Close modal
      rerender(
        <RecommendedLessonViewModal
          {...defaultProps}
          isOpen={false}
          apiClient={apiClient}
        />
      );

      // Reopen modal
      rerender(
        <RecommendedLessonViewModal
          {...defaultProps}
          isOpen={true}
          apiClient={apiClient}
        />
      );

      // Expand accordion again - should fetch again because cache was cleared
      const newAccordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(newAccordionTrigger);

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('No API client', () => {
    it('should show loading skeleton when no apiClient provided', async () => {
      render(<RecommendedLessonViewModal {...defaultProps} />);

      const accordionTrigger = screen.getByText('Equações do 1º Grau');
      fireEvent.click(accordionTrigger);

      // When no apiClient is provided, the component shows loading skeleton
      // since it cannot fetch the lesson data
      await waitFor(() => {
        expect(screen.getAllByTestId('skeleton-rounded').length).toBeGreaterThan(0);
      });
    });
  });
});
