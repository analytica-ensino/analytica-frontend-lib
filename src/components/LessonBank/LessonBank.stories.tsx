import type { Story } from '@ladle/react';
import { useState } from 'react';
import { LessonBank } from './LessonBank';
import type { BaseApiClient } from '../../types/api';
import type {
  Lesson,
  LessonsListResponse,
  LessonsPagination,
} from '../../types/lessons';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';

/**
 * Mock lessons data with video, podcast and board images information
 */
const mockLessons: (Lesson & {
  videoSrc?: string;
  videoPoster?: string;
  videoSubtitles?: string;
  podcastSrc?: string;
  podcastTitle?: string;
  boardImages?: WhiteboardImage[];
})[] = [
  {
    id: 'lesson-1',
    title: 'Introdução à Álgebra Linear',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Introdução+à+Álgebra+Linear',
    videoSubtitles:
      'data:text/vtt;charset=utf-8,WEBVTT%0A%0A00%3A00%3A00.000%20--%3E%2000%3A00%3A05.000%0AIntrodução%20à%20Álgebra%20Linear%0A%0A00%3A00%3A05.000%20--%3E%2000%3A00%3A10.000%0ANeste%20vídeo%20vamos%20aprender%20os%20conceitos%20básicos.',
    podcastSrc: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    podcastTitle: 'Podcast: Introdução à Álgebra Linear',
    boardImages: [
      {
        id: 'board-1-1',
        imageUrl: 'https://picsum.photos/seed/board1/450/180',
        title: 'Quadro 1 - Introdução',
      },
      {
        id: 'board-1-2',
        imageUrl: 'https://picsum.photos/seed/board2/450/180',
        title: 'Quadro 2 - Conceitos Básicos',
      },
      {
        id: 'board-1-3',
        imageUrl: 'https://picsum.photos/seed/board3/450/180',
        title: 'Quadro 3 - Exemplos Práticos',
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Fotossíntese: Processo e Importância',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/00A651/FFFFFF?text=Fotossíntese',
    podcastSrc: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    podcastTitle: 'Podcast: Fotossíntese e seus Processos',
    boardImages: [
      {
        id: 'board-2-1',
        imageUrl: 'https://picsum.photos/seed/board4/450/180',
        title: 'Quadro 1 - Processo de Fotossíntese',
      },
      {
        id: 'board-2-2',
        imageUrl: 'https://picsum.photos/seed/board5/450/180',
        title: 'Quadro 2 - Estrutura das Folhas',
      },
    ],
  },
  {
    id: 'lesson-3',
    title: 'Revolução Francesa e seus Impactos',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/6366F1/FFFFFF?text=Revolução+Francesa',
  },
  {
    id: 'lesson-4',
    title: 'Equações do Segundo Grau',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Equações+do+Segundo+Grau',
  },
  {
    id: 'lesson-5',
    title: 'Sistema Circulatório Humano',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/22C55E/FFFFFF?text=Sistema+Circulatório',
  },
  {
    id: 'lesson-6',
    title: 'Geografia do Brasil: Regiões e Clima',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/F59E0B/FFFFFF?text=Geografia+do+Brasil',
  },
  {
    id: 'lesson-7',
    title: 'Literatura Brasileira: Modernismo',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/00A651/FFFFFF?text=Literatura+Brasileira',
  },
  {
    id: 'lesson-8',
    title: 'Química Orgânica: Hidrocarbonetos',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/EF4444/FFFFFF?text=Química+Orgânica',
  },
];

/**
 * Create mock API client for stories
 */
const createMockApiClient = (
  lessons: Lesson[] = mockLessons,
  delay: number = 500,
  shouldError: boolean = false,
  hasNext: boolean = false
): BaseApiClient => {
  return {
    get: async () => {
      throw new Error('GET not implemented in mock');
    },
    post: async <T,>(url: string, body?: Record<string, unknown>) => {
      if (shouldError) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        throw new Error('Erro ao carregar aulas');
      }

      if (url === '/lessons/list') {
        await new Promise((resolve) => setTimeout(resolve, delay));

        const page = (body?.page as number) || 1;
        const limit = (body?.limit as number) || 20;

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedLessons = lessons.slice(startIndex, endIndex);

        const pagination: LessonsPagination = {
          page,
          limit,
          total: lessons.length,
          totalPages: Math.ceil(lessons.length / limit),
          hasNext: hasNext || endIndex < lessons.length,
          hasPrev: page > 1,
        };

        const response: LessonsListResponse = {
          message: 'Success',
          data: {
            lessons: paginatedLessons,
            pagination,
          },
        };

        return { data: response as T };
      }

      return { data: {} as T };
    },
    patch: async () => {
      throw new Error('PATCH not implemented in mock');
    },
    delete: async () => {
      throw new Error('DELETE not implemented in mock');
    },
  } as BaseApiClient;
};

/**
 * Default story - shows the component with sample lessons
 */
export const Default: Story = () => {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank apiClient={createMockApiClient()} />
    </div>
  );
};
Default.meta = {
  name: 'Default',
};

/**
 * Loading state - shows the component in loading state
 */
export const Loading: Story = () => {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank apiClient={createMockApiClient([], 2000)} />
    </div>
  );
};
Loading.meta = {
  name: 'Loading State',
};

/**
 * Error state - shows the component when API fails
 */
export const ErrorState: Story = () => {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank apiClient={createMockApiClient([], 500, true)} />
    </div>
  );
};
ErrorState.meta = {
  name: 'Error State',
};

/**
 * Empty state - shows the component when no lessons are found
 */
export const Empty: Story = () => {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank apiClient={createMockApiClient([])} />
    </div>
  );
};
Empty.meta = {
  name: 'Empty State',
};

/**
 * With added lessons - shows the component with some lessons already added
 */
export const WithAddedLessons: Story = () => {
  const [addedLessonIds, setAddedLessonIds] = useState<string[]>([
    'lesson-1',
    'lesson-3',
  ]);

  const handleAddLesson = (lesson: Lesson) => {
    console.log('Lesson added:', lesson);
    setAddedLessonIds((prev) => [...prev, lesson.id]);
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank
        apiClient={createMockApiClient()}
        onAddLesson={handleAddLesson}
        addedLessonIds={addedLessonIds}
      />
    </div>
  );
};
WithAddedLessons.meta = {
  name: 'With Added Lessons',
};

/**
 * With onAddLesson callback - shows the component with add lesson functionality
 */
export const WithOnAddLesson: Story = () => {
  const handleAddLesson = (lesson: Lesson) => {
    console.log('Lesson added:', lesson);
    alert(`Aula "${lesson.title}" adicionada com sucesso!`);
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank
        apiClient={createMockApiClient()}
        onAddLesson={handleAddLesson}
      />
    </div>
  );
};
WithOnAddLesson.meta = {
  name: 'With Add Lesson Callback',
};

/**
 * With many lessons - shows the component with many lessons for infinite scroll
 */
export const WithManyLessons: Story = () => {
  const manyLessons: Lesson[] = Array.from({ length: 50 }, (_, i) => ({
    id: `lesson-${i + 1}`,
    title: `Aula ${i + 1}: Tópico de Estudo ${i + 1}`,
  }));

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank
        apiClient={createMockApiClient(manyLessons, 500, false, true)}
      />
    </div>
  );
};
WithManyLessons.meta = {
  name: 'With Many Lessons (Infinite Scroll)',
};

/**
 * Single lesson - shows the component with only one lesson
 */
export const SingleLesson: Story = () => {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank apiClient={createMockApiClient([mockLessons[0]])} />
    </div>
  );
};
SingleLesson.meta = {
  name: 'Single Lesson',
};

/**
 * With custom className - shows the component with custom styling
 */
export const WithCustomClassName: Story = () => {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank
        apiClient={createMockApiClient()}
        className="border-2 border-primary-500 rounded-lg"
      />
    </div>
  );
};
WithCustomClassName.meta = {
  name: 'With Custom ClassName',
};

/**
 * Interactive - shows the component with all interactions working
 */
export const Interactive: Story = () => {
  const [addedLessonIds, setAddedLessonIds] = useState<string[]>([]);

  const handleAddLesson = (lesson: Lesson) => {
    console.log('Lesson added:', lesson);
    setAddedLessonIds((prev) => {
      if (prev.includes(lesson.id)) {
        return prev;
      }
      return [...prev, lesson.id];
    });
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          Aulas Adicionadas: {addedLessonIds.length}
        </p>
        {addedLessonIds.length > 0 && (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
            IDs: {addedLessonIds.join(', ')}
          </p>
        )}
      </div>
      <LessonBank
        apiClient={createMockApiClient()}
        onAddLesson={handleAddLesson}
        addedLessonIds={addedLessonIds}
      />
    </div>
  );
};
Interactive.meta = {
  name: 'Interactive (Full Functionality)',
};

/**
 * With VideoPlayer - shows the component with video player in modal
 */
export const WithVideoPlayer: Story = () => {
  const handleVideoTimeUpdate = (lessonId: string, time: number) => {
    console.log(`Video time update for lesson ${lessonId}: ${time} seconds`);
  };

  const handleVideoComplete = (lessonId: string) => {
    console.log(`Video completed for lesson ${lessonId}`);
    alert(`Aula ${lessonId} concluída!`);
  };

  const handlePodcastEnded = async (lessonId: string) => {
    console.log(`Podcast ended for lesson ${lessonId}`);
    alert(`Podcast da aula ${lessonId} concluído!`);
  };

  const getInitialTimestamp = (id: string): number => {
    const saved = localStorage.getItem(`lesson-${id}`);
    if (saved) {
      const parsed = Number.parseFloat(saved);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return 0;
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank
        apiClient={createMockApiClient()}
        getInitialTimestamp={getInitialTimestamp}
        onVideoTimeUpdate={handleVideoTimeUpdate}
        onVideoComplete={handleVideoComplete}
        onPodcastEnded={handlePodcastEnded}
      />
    </div>
  );
};
WithVideoPlayer.meta = {
  name: 'With VideoPlayer',
};

/**
 * With VideoPlayer and Trail Route - shows video player with trail route context
 */
export const WithVideoPlayerTrailRoute: Story = () => {
  const handleVideoTimeUpdate = (lessonId: string, time: number) => {
    console.log(
      `Video time update for trail lesson ${lessonId}: ${time} seconds`
    );
  };

  const handleVideoComplete = (lessonId: string) => {
    console.log(`Video completed for trail lesson ${lessonId}`);
  };

  const getInitialTimestamp = (id: string): number => {
    const saved = localStorage.getItem(`lesson-${id}`);
    if (saved) {
      const parsed = Number.parseFloat(saved);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return 0;
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank
        apiClient={createMockApiClient()}
        isFromTrailRoute={true}
        lessonId="trail-lesson-1"
        getInitialTimestamp={getInitialTimestamp}
        onVideoTimeUpdate={handleVideoTimeUpdate}
        onVideoComplete={handleVideoComplete}
      />
    </div>
  );
};
WithVideoPlayerTrailRoute.meta = {
  name: 'With VideoPlayer (Trail Route)',
};

/**
 * With VideoPlayer and Subtitles - shows video player with subtitles
 */
export const WithVideoPlayerSubtitles: Story = () => {
  const lessonsWithSubtitles = [
    {
      ...mockLessons[0],
      videoSubtitles:
        'data:text/vtt;charset=utf-8,WEBVTT%0A%0A00%3A00%3A00.000%20--%3E%2000%3A00%3A05.000%0AIntrodução%20à%20Álgebra%20Linear%0A%0A00%3A00%3A05.000%20--%3E%2000%3A00%3A10.000%0ANeste%20vídeo%20vamos%20aprender%20os%20conceitos%20básicos%20de%20álgebra%20linear.%0A%0A00%3A00%3A10.000%20--%3E%2000%3A00%3A15.000%0AVamos%20começar%20com%20matrizes%20e%20vetores.',
    },
  ];

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank apiClient={createMockApiClient(lessonsWithSubtitles)} />
    </div>
  );
};
WithVideoPlayerSubtitles.meta = {
  name: 'With VideoPlayer (Subtitles)',
};

/**
 * With VideoPlayer No Video - shows modal when lesson has no video
 */
export const WithVideoPlayerNoVideo: Story = () => {
  const lessonsWithoutVideo = [
    {
      id: 'lesson-no-video',
      title: 'Aula sem Vídeo',
    },
  ];

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank apiClient={createMockApiClient(lessonsWithoutVideo)} />
    </div>
  );
};
WithVideoPlayerNoVideo.meta = {
  name: 'With VideoPlayer (No Video)',
};

/**
 * With VideoPlayer and Podcast - shows video player with podcast card
 */
export const WithVideoPlayerAndPodcast: Story = () => {
  const handleVideoTimeUpdate = (lessonId: string, time: number) => {
    console.log(`Video time update for lesson ${lessonId}: ${time} seconds`);
  };

  const handleVideoComplete = (lessonId: string) => {
    console.log(`Video completed for lesson ${lessonId}`);
  };

  const handlePodcastEnded = async (lessonId: string) => {
    console.log(`Podcast ended for lesson ${lessonId}`);
    alert(`Podcast da aula ${lessonId} concluído!`);
  };

  const getInitialTimestamp = (id: string): number => {
    const saved = localStorage.getItem(`lesson-${id}`);
    if (saved) {
      const parsed = Number.parseFloat(saved);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return 0;
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <LessonBank
        apiClient={createMockApiClient()}
        getInitialTimestamp={getInitialTimestamp}
        onVideoTimeUpdate={handleVideoTimeUpdate}
        onVideoComplete={handleVideoComplete}
        onPodcastEnded={handlePodcastEnded}
      />
    </div>
  );
};
WithVideoPlayerAndPodcast.meta = {
  name: 'With VideoPlayer and Podcast',
};
