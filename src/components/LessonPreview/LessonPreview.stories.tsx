import type { Story } from '@ladle/react';
import { useState, useCallback, useMemo } from 'react';
import { LessonPreview, type PreviewLesson } from './LessonPreview';
import type { Lesson } from '../../types/lessons';
import type { WhiteboardImage } from '../Whiteboard/Whiteboard';
import type { BaseApiClient } from '../../types/api';
import type {
  ActivityModelResponse,
  ActivityModelsApiResponse,
  ActivityModelTableItem,
} from '../../types/activitiesHistory';
import { ActivityDraftType } from '../../types/activitiesHistory';
import type { ActivityData } from '../ActivityCreate/ActivityCreate.types';
import { ActivityType } from '../ActivityCreate/ActivityCreate.types';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../../types/questions';

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
];

// Mock activity models
const mockModelsResponse: ActivityModelResponse[] = [
  {
    id: '1',
    type: ActivityDraftType.MODELO,
    title: 'Atividade de Álgebra Linear',
    creatorUserInstitutionId: 'creator-1',
    subjectId: 'math-1',
    subject: {
      id: 'math-1',
      name: 'Matemática',
      icon: 'MathOperations',
      color: '#2271C4',
    },
    filters: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    type: ActivityDraftType.MODELO,
    title: 'Atividade de Fotossíntese',
    creatorUserInstitutionId: 'creator-1',
    subjectId: 'bio-1',
    subject: {
      id: 'bio-1',
      name: 'Biologia',
      icon: 'Microscope',
      color: '#00A651',
    },
    filters: null,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

// Mock activity details with questions
const mockActivityDetails: Record<string, ActivityData> = {
  '1': {
    id: '1',
    type: ActivityType.MODELO,
    title: 'Atividade de Álgebra Linear',
    subjectId: 'math-1',
    filters: {},
    questionIds: ['q1', 'q2'],
    selectedQuestions: [
      {
        id: 'q1',
        statement:
          'Qual é o resultado da multiplicação de matrizes A(2x2) e B(2x2)?',
        description: null,
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        status: QUESTION_STATUS_ENUM.APROVADO,
        difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
        questionBankYearId: 'qby-1',
        solutionExplanation: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        knowledgeMatrix: [
          {
            subject: {
              id: 'math-1',
              name: 'Matemática',
              color: '#2271C4',
              icon: 'MathOperations',
            },
            topic: {
              id: 't1',
              name: 'Álgebra Linear',
            },
          },
        ],
        options: [
          { id: 'opt1', option: 'Uma matriz 2x2', correct: true },
          { id: 'opt2', option: 'Uma matriz 4x4', correct: false },
          { id: 'opt3', option: 'Um vetor', correct: false },
          { id: 'opt4', option: 'Um escalar', correct: false },
        ],
      },
      {
        id: 'q2',
        statement: 'O que é um vetor unitário?',
        description: null,
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        status: QUESTION_STATUS_ENUM.APROVADO,
        difficultyLevel: DIFFICULTY_LEVEL_ENUM.FACIL,
        questionBankYearId: 'qby-1',
        solutionExplanation: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        knowledgeMatrix: [
          {
            subject: {
              id: 'math-1',
              name: 'Matemática',
              color: '#2271C4',
              icon: 'MathOperations',
            },
            topic: {
              id: 't1',
              name: 'Álgebra Linear',
            },
          },
        ],
        options: [
          { id: 'opt5', option: 'Um vetor com magnitude 1', correct: true },
          {
            id: 'opt6',
            option: 'Um vetor com componentes iguais',
            correct: false,
          },
          { id: 'opt7', option: 'Um vetor nulo', correct: false },
          { id: 'opt8', option: 'Um vetor perpendicular', correct: false },
        ],
      },
    ],
  },
  '2': {
    id: '2',
    type: ActivityType.MODELO,
    title: 'Atividade de Fotossíntese',
    subjectId: 'bio-1',
    filters: {},
    questionIds: ['q3', 'q4'],
    selectedQuestions: [
      {
        id: 'q3',
        statement: 'Qual é o principal pigmento responsável pela fotossíntese?',
        description: null,
        questionType: QUESTION_TYPE.ALTERNATIVA,
        status: QUESTION_STATUS_ENUM.APROVADO,
        difficultyLevel: DIFFICULTY_LEVEL_ENUM.FACIL,
        questionBankYearId: 'qby-1',
        solutionExplanation: null,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        knowledgeMatrix: [
          {
            subject: {
              id: 'bio-1',
              name: 'Biologia',
              color: '#00A651',
              icon: 'Microscope',
            },
            topic: {
              id: 't2',
              name: 'Fotossíntese',
            },
          },
        ],
        options: [
          { id: 'opt9', option: 'Clorofila', correct: true },
          { id: 'opt10', option: 'Caroteno', correct: false },
          { id: 'opt11', option: 'Xantofila', correct: false },
          { id: 'opt12', option: 'Hemoglobina', correct: false },
        ],
      },
      {
        id: 'q4',
        statement: 'Quais são os produtos da fotossíntese?',
        description: null,
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
        status: QUESTION_STATUS_ENUM.APROVADO,
        difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
        questionBankYearId: 'qby-1',
        solutionExplanation: null,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        knowledgeMatrix: [
          {
            subject: {
              id: 'bio-1',
              name: 'Biologia',
              color: '#00A651',
              icon: 'Microscope',
            },
            topic: {
              id: 't2',
              name: 'Fotossíntese',
            },
          },
        ],
        options: [
          { id: 'opt13', option: 'Glicose', correct: true },
          { id: 'opt14', option: 'Oxigênio', correct: true },
          { id: 'opt15', option: 'Dióxido de carbono', correct: false },
          { id: 'opt16', option: 'Água', correct: false },
        ],
      },
    ],
  },
};

/**
 * Create mock API client
 */
const createMockApiClient = (delay: number = 500): BaseApiClient => ({
  get: async <T,>(
    url: string,
    config?: { params?: Record<string, unknown> }
  ) => {
    if (url === '/activity-drafts') {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const params = config?.params || {};
      const page = (params.page as number) || 1;
      const limit = (params.limit as number) || 10;
      const search = (params.search as string) || '';

      let filteredModels = [...mockModelsResponse];

      if (search) {
        const searchLower = search.toLowerCase();
        filteredModels = filteredModels.filter(
          (model) => model.title?.toLowerCase().includes(searchLower) || false
        );
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedModels = filteredModels.slice(startIndex, endIndex);

      const response: ActivityModelsApiResponse = {
        message: 'Success',
        data: {
          activityDrafts: paginatedModels,
          total: filteredModels.length,
        },
      };

      return { data: response as T };
    }

    // Intercept /activity-drafts/:id endpoint
    if (url.startsWith('/activity-drafts/')) {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const activityId = url.split('/').pop();
      const activityData = activityId ? mockActivityDetails[activityId] : null;

      if (activityData) {
        return { data: { data: activityData } as T };
      }

      throw new Error(`Activity not found: ${activityId}`);
    }

    throw new Error(`Unknown endpoint: ${url}`);
  },
  post: async () => {
    throw new Error('POST not implemented in mock');
  },
  patch: async () => {
    throw new Error('PATCH not implemented in mock');
  },
  delete: async () => {
    throw new Error('DELETE not implemented in mock');
  },
});

export const Default: Story = () => {
  const lessons: PreviewLesson[] = [
    {
      id: 'lesson-1',
      title: 'Introdução à Álgebra Linear',
    },
    {
      id: 'lesson-2',
      title: 'Fotossíntese: Processo e Importância',
    },
    {
      id: 'lesson-3',
      title: 'Revolução Francesa e seus Impactos',
    },
  ];

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        apiClient={createMockApiClient()}
        onRemoveAll={() => console.log('Remover tudo')}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithVideoPlayer: Story = () => {
  const lessons: PreviewLesson[] = mockLessons.slice(0, 3);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        apiClient={createMockApiClient()}
        onRemoveAll={() => console.log('Remover tudo')}
        onVideoTimeUpdate={(lessonId, time) =>
          console.log(`Lesson ${lessonId} time: ${time}`)
        }
        onVideoComplete={(lessonId) =>
          console.log(`Lesson ${lessonId} completed`)
        }
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithVideoPlayerAndPodcast: Story = () => {
  const lessons: PreviewLesson[] = [
    mockLessons[0], // Has video, podcast, and board images
    mockLessons[1], // Has video, podcast, and board images
  ];

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        apiClient={createMockApiClient()}
        onRemoveAll={() => console.log('Remover tudo')}
        onPodcastEnded={async (lessonId) => {
          console.log(`Podcast ended for lesson ${lessonId}`);
        }}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithReorder: Story = () => {
  const initialLessons: PreviewLesson[] = mockLessons.slice(0, 4);

  const [lessons, setLessons] = useState<PreviewLesson[]>(initialLessons);

  const handleReorder = useCallback((ordered: PreviewLesson[]) => {
    setLessons(ordered);
    console.log(
      'Reordered:',
      ordered.map(({ id, position }) => ({ id, position }))
    );
  }, []);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        apiClient={createMockApiClient()}
        onRemoveAll={() => console.log('Remover tudo')}
        onReorder={handleReorder}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithRemoveLesson: Story = () => {
  const initialLessons: PreviewLesson[] = mockLessons.slice(0, 4);

  const [lessons, setLessons] = useState<PreviewLesson[]>(initialLessons);

  const handleRemoveLesson = useCallback((lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    console.log('Removed lesson:', lessonId);
  }, []);

  const handleRemoveAll = useCallback(() => {
    setLessons([]);
    console.log('Removed all lessons');
  }, []);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        apiClient={createMockApiClient()}
        onRemoveLesson={handleRemoveLesson}
        onRemoveAll={handleRemoveAll}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const SingleLesson: Story = () => {
  const lessons: PreviewLesson[] = [mockLessons[0]];

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        apiClient={createMockApiClient()}
        onRemoveAll={() => console.log('Remover tudo')}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const Empty: Story = () => {
  return (
    <div className="p-6">
      <LessonPreview
        lessons={[]}
        apiClient={createMockApiClient()}
        onRemoveAll={() => console.log('Remover tudo')}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const CustomTitle: Story = () => {
  const lessons: PreviewLesson[] = mockLessons.slice(0, 3);

  return (
    <div className="p-6">
      <LessonPreview
        title="Aulas Selecionadas"
        lessons={lessons}
        apiClient={createMockApiClient()}
        onRemoveAll={() => console.log('Remover tudo')}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithCallbacks: Story = () => {
  const lessons: PreviewLesson[] = mockLessons.slice(0, 2);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        apiClient={createMockApiClient()}
        onRemoveAll={() => console.log('Remover tudo')}
        onVideoTimeUpdate={(lessonId, time) =>
          console.log(`Video time update: ${lessonId} at ${time}s`)
        }
        onVideoComplete={(lessonId) =>
          console.log(`Video completed: ${lessonId}`)
        }
        onPodcastEnded={async (lessonId) => {
          console.log(`Podcast ended: ${lessonId}`);
        }}
        getInitialTimestamp={(lessonId) => {
          console.log(`Getting initial timestamp for: ${lessonId}`);
          return 0;
        }}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};

export const WithActivitySelection: Story = () => {
  const apiClient = useMemo(() => createMockApiClient(500), []);
  const lessons: PreviewLesson[] = mockLessons.slice(0, 2);

  return (
    <div className="p-6">
      <LessonPreview
        lessons={lessons}
        apiClient={apiClient}
        onRemoveAll={() => console.log('Remover tudo')}
        onActivitySelected={(model: ActivityModelTableItem) => {
          console.log('Activity selected:', model);
        }}
        onCreateNewActivity={() => {
          console.log('Create new activity clicked');
        }}
        onEditActivity={(activity: ActivityModelTableItem) => {
          console.log('Edit activity clicked:', activity);
        }}
        onPositionsChange={(ordered) =>
          console.log(
            'Posições',
            ordered.map(({ id, position }) => ({ id, position }))
          )
        }
      />
    </div>
  );
};
