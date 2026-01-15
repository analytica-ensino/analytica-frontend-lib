import type { Story } from '@ladle/react';
import {
  BrowserRouter,
  MemoryRouter,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { RecommendedLessonCreate } from './RecommendedLessonCreate';
import { CreateActivity } from '../ActivityCreate/ActivityCreate';
import type { BaseApiClient } from '../../types/api';
import type { Lesson } from '../../types/lessons';
import { Toaster } from '../..';
import { GoalDraftType } from './RecommendedLessonCreate.types';
import { ActivityDraftType } from '../../types/activitiesHistory';

// Mock lessons data with media properties
const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Introdução à Álgebra Linear',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/2271C4/FFFFFF?text=Introdução+à+Álgebra+Linear',
    podcastSrc: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    podcastTitle: 'Podcast: Introdução à Álgebra Linear',
    boardImages: [
      {
        id: 'board-1-1',
        imageUrl: 'https://picsum.photos/seed/board1/450/180',
        title: 'Quadro 1 - Introdução',
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Equações do Primeiro Grau',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/00A651/FFFFFF?text=Equações+do+Primeiro+Grau',
    podcastSrc: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    podcastTitle: 'Podcast: Equações do Primeiro Grau',
  },
  {
    id: 'lesson-3',
    title: 'Geometria Plana: Conceitos Básicos',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/6366F1/FFFFFF?text=Geometria+Plana',
    boardImages: [
      {
        id: 'board-3-1',
        imageUrl: 'https://picsum.photos/seed/board3/450/180',
        title: 'Quadro 1 - Formas Geométricas',
      },
      {
        id: 'board-3-2',
        imageUrl: 'https://picsum.photos/seed/board4/450/180',
        title: 'Quadro 2 - Cálculo de Áreas',
      },
    ],
  },
  {
    id: 'lesson-4',
    title: 'Literatura Brasileira: Machado de Assis',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/F59E0B/FFFFFF?text=Literatura+Brasileira',
    podcastSrc: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    podcastTitle: 'Podcast: Machado de Assis',
  },
  {
    id: 'lesson-5',
    title: 'História do Brasil: Período Colonial',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/EF4444/FFFFFF?text=História+do+Brasil',
  },
  {
    id: 'lesson-6',
    title: 'Física: Leis de Newton',
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPoster:
      'https://via.placeholder.com/800x450/8B5CF6/FFFFFF?text=Física',
    boardImages: [
      {
        id: 'board-6-1',
        imageUrl: 'https://picsum.photos/seed/board6/450/180',
        title: 'Quadro 1 - Leis de Newton',
      },
    ],
  },
];

// Helper function to check if ALL required filters are applied
// Lessons only appear when ALL filters are selected (subject, topic, subtopic, content)
const hasAllFiltersApplied = (filters?: {
  subjectId?: string[];
  topicIds?: string[];
  subtopicIds?: string[];
  contentIds?: string[];
  selectedIds?: string[];
}): boolean => {
  if (!filters) return false;
  // ALL filters must be filled for lessons to appear
  const hasSubject = filters.subjectId && filters.subjectId.length > 0;
  const hasTopic = filters.topicIds && filters.topicIds.length > 0;
  const hasSubtopic = filters.subtopicIds && filters.subtopicIds.length > 0;
  const hasContent = filters.contentIds && filters.contentIds.length > 0;

  return !!(hasSubject && hasTopic && hasSubtopic && hasContent);
};

// Helper function to create mock API client
const createMockApiClient = (
  onSave?: (method: string, url: string, payload: unknown) => void
) => {
  return {
    get: async (url: string) => {
      // Mock subjects endpoint
      if (url === '/subjects') {
        return {
          data: {
            message: 'Subjects fetched successfully',
            data: {
              subjects: [
                { id: 'matematica', name: 'Matemática' },
                { id: 'portugues', name: 'Português' },
                { id: 'historia', name: 'História' },
                { id: 'fisica', name: 'Física' },
              ],
            },
          },
        };
      }

      // Mock knowledge/subjects endpoint
      if (url === '/knowledge/subjects') {
        return {
          data: {
            data: [
              {
                id: 'matematica',
                name: 'Matemática',
                color: '#0066b8',
                icon: 'MathOperations',
              },
              {
                id: 'portugues',
                name: 'Português',
                color: '#00a651',
                icon: 'ChatPT',
              },
              {
                id: 'historia',
                name: 'História',
                color: '#6366f1',
                icon: 'CastleTurret',
              },
              {
                id: 'fisica',
                name: 'Física',
                color: '#8B5CF6',
                icon: 'Atom',
              },
            ],
          },
        };
      }

      // Mock school endpoint
      if (url === '/school') {
        return {
          data: {
            message: 'Schools fetched successfully',
            data: {
              schools: [
                {
                  id: 'school-1',
                  companyName: 'Escola BNCC Unificada LTDA',
                },
                {
                  id: 'school-2',
                  companyName: 'Colégio Estadual São Paulo',
                },
              ],
            },
          },
        };
      }

      // Mock schoolYear endpoint
      if (url === '/schoolYear') {
        return {
          data: {
            message: 'School years fetched successfully',
            data: {
              schoolYears: [
                {
                  id: 'year-1',
                  name: '6º Ano',
                  schoolId: 'school-1',
                },
                {
                  id: 'year-2',
                  name: '7º Ano',
                  schoolId: 'school-1',
                },
                {
                  id: 'year-3',
                  name: '8º Ano',
                  schoolId: 'school-2',
                },
              ],
            },
          },
        };
      }

      // Mock classes endpoint
      if (url === '/classes') {
        return {
          data: {
            message: 'Classes fetched successfully',
            data: {
              classes: [
                {
                  id: 'class-1',
                  name: 'Turma A',
                  schoolYearId: 'year-1',
                },
                {
                  id: 'class-2',
                  name: 'Turma B',
                  schoolYearId: 'year-1',
                },
                {
                  id: 'class-3',
                  name: 'Turma A',
                  schoolYearId: 'year-2',
                },
              ],
            },
          },
        };
      }

      // Mock students endpoint
      if (url.startsWith('/students')) {
        return {
          data: {
            message: 'Students fetched successfully',
            data: {
              students: [
                {
                  id: 'student-1',
                  name: 'João Silva',
                  classId: 'class-1',
                  userInstitutionId: 'ui-1',
                },
                {
                  id: 'student-2',
                  name: 'Maria Santos',
                  classId: 'class-1',
                  userInstitutionId: 'ui-2',
                },
                {
                  id: 'student-3',
                  name: 'Pedro Oliveira',
                  classId: 'class-2',
                  userInstitutionId: 'ui-3',
                },
                {
                  id: 'student-4',
                  name: 'Ana Costa',
                  classId: 'class-3',
                  userInstitutionId: 'ui-4',
                },
              ],
              pagination: {
                page: 1,
                limit: 100,
                total: 4,
                totalPages: 1,
              },
            },
          },
        };
      }

      // Mock GET /recommended-class/drafts/:id endpoint
      if (url.startsWith('/recommended-class/drafts/')) {
        const draftId = url.split('/').pop() || 'mock-draft-id';
        // Return draft with selectedLessons for preview
        // ALL filters must be filled for the draft to work correctly
        return {
          data: {
            data: {
              id: draftId,
              type: GoalDraftType.RASCUNHO,
              title: 'Aula Recomendada - Matemática',
              description: null,
              creatorUserInstitutionId: 'mock-institution-id',
              subjectId: 'matematica',
              filters: {
                subjects: ['matematica'],
                topics: ['tema-1'],
                subtopics: ['subtema-1'],
                contents: ['assunto-1'],
              },
              lessonIds: ['lesson-1', 'lesson-2', 'lesson-3'],
              // Include selectedLessons for preview
              selectedLessons: mockLessons.slice(0, 3),
              startDate: null,
              finalDate: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }

      // Mock GET /activity-drafts endpoint (for ChooseActivityModelModal)
      if (url === '/activity-drafts') {
        return {
          data: {
            message: 'Activity drafts fetched successfully',
            data: {
              activityDrafts: [
                {
                  id: 'activity-model-1',
                  type: ActivityDraftType.MODELO,
                  title: 'Atividade de Álgebra - Equações',
                  creatorUserInstitutionId: 'mock-institution-id',
                  subjectId: 'matematica',
                  subject: {
                    id: 'matematica',
                    subjectName: 'Matemática',
                    subjectIcon: 'MathOperations',
                    subjectColor: '#0066b8',
                  },
                  filters: {
                    questionTypes: ['multiple-choice'],
                    subjects: ['matematica'],
                    topics: ['tema-1'],
                  },
                  createdAt: '2024-01-15T10:00:00.000Z',
                  updatedAt: '2024-01-15T10:00:00.000Z',
                },
                {
                  id: 'activity-model-2',
                  type: ActivityDraftType.MODELO,
                  title: 'Atividade de Geometria - Formas',
                  creatorUserInstitutionId: 'mock-institution-id',
                  subjectId: 'matematica',
                  subject: {
                    id: 'matematica',
                    subjectName: 'Matemática',
                    subjectIcon: 'MathOperations',
                    subjectColor: '#0066b8',
                  },
                  filters: {
                    questionTypes: ['multiple-choice', 'open-ended'],
                    subjects: ['matematica'],
                    topics: ['tema-2'],
                  },
                  createdAt: '2024-01-14T14:30:00.000Z',
                  updatedAt: '2024-01-14T14:30:00.000Z',
                },
                {
                  id: 'activity-model-3',
                  type: ActivityDraftType.MODELO,
                  title: 'Atividade de Português - Interpretação',
                  creatorUserInstitutionId: 'mock-institution-id',
                  subjectId: 'portugues',
                  subject: {
                    id: 'portugues',
                    subjectName: 'Português',
                    subjectIcon: 'ChatPT',
                    subjectColor: '#00a651',
                  },
                  filters: {
                    questionTypes: ['open-ended'],
                    subjects: ['portugues'],
                    topics: ['literatura'],
                  },
                  createdAt: '2024-01-13T09:15:00.000Z',
                  updatedAt: '2024-01-13T09:15:00.000Z',
                },
                {
                  id: 'activity-model-4',
                  type: ActivityDraftType.MODELO,
                  title: 'Atividade de História - Brasil Colonial',
                  creatorUserInstitutionId: 'mock-institution-id',
                  subjectId: 'historia',
                  subject: {
                    id: 'historia',
                    subjectName: 'História',
                    subjectIcon: 'CastleTurret',
                    subjectColor: '#6366f1',
                  },
                  filters: {
                    questionTypes: ['multiple-choice'],
                    subjects: ['historia'],
                  },
                  createdAt: '2024-01-12T16:45:00.000Z',
                  updatedAt: '2024-01-12T16:45:00.000Z',
                },
                {
                  id: 'activity-model-5',
                  type: ActivityDraftType.MODELO,
                  title: 'Atividade de Física - Leis de Newton',
                  creatorUserInstitutionId: 'mock-institution-id',
                  subjectId: 'fisica',
                  subject: {
                    id: 'fisica',
                    subjectName: 'Física',
                    subjectIcon: 'Atom',
                    subjectColor: '#8B5CF6',
                  },
                  filters: {
                    questionTypes: ['multiple-choice', 'calculation'],
                    subjects: ['fisica'],
                  },
                  createdAt: '2024-01-11T11:20:00.000Z',
                  updatedAt: '2024-01-11T11:20:00.000Z',
                },
              ],
              total: 5,
            },
          },
        };
      }

      // Mock GET /activity-drafts/:id endpoint (for activity details)
      if (url.startsWith('/activity-drafts/')) {
        const activityId = url.split('/').pop() || 'activity-model-1';
        // Return ActivityData format with selectedQuestions array
        return {
          data: {
            data: {
              id: activityId,
              type: 'MODELO',
              title: 'Atividade de Álgebra - Equações',
              subjectId: 'matematica',
              filters: {
                questionTypes: ['MULTIPLA_ESCOLHA'],
                questionBanks: ['ANALYTICA'],
                subjects: ['matematica'],
                topics: ['tema-1'],
                subtopics: ['subtema-1'],
                contents: ['assunto-1'],
              },
              questionIds: ['question-1', 'question-2', 'question-3'],
              selectedQuestions: [
                {
                  id: 'question-1',
                  statement:
                    '<p>Resolva a equação do primeiro grau: <strong>2x + 5 = 15</strong></p>',
                  description: null,
                  questionType: 'MULTIPLA_ESCOLHA',
                  status: 'APROVADO',
                  difficultyLevel: 'FACIL',
                  questionBankYearId: 'qb-year-1',
                  solutionExplanation:
                    'Para resolver, isolamos x: 2x = 15 - 5, então 2x = 10, logo x = 5',
                  createdAt: '2024-01-10T10:00:00.000Z',
                  updatedAt: '2024-01-10T10:00:00.000Z',
                  knowledgeMatrix: [
                    {
                      subject: {
                        id: 'matematica',
                        name: 'Matemática',
                        color: '#0066b8',
                        icon: 'MathOperations',
                      },
                      topic: {
                        id: 'tema-1',
                        name: 'Álgebra',
                      },
                      subtopic: {
                        id: 'subtema-1',
                        name: 'Equações do 1º grau',
                      },
                    },
                  ],
                  options: [
                    { id: 'opt-1a', option: 'x = 5', correct: true },
                    { id: 'opt-1b', option: 'x = 10', correct: false },
                    { id: 'opt-1c', option: 'x = 7', correct: false },
                    { id: 'opt-1d', option: 'x = 3', correct: false },
                  ],
                },
                {
                  id: 'question-2',
                  statement:
                    '<p>Qual é o valor de <strong>x</strong> na equação <em>3x - 9 = 0</em>?</p>',
                  description: null,
                  questionType: 'MULTIPLA_ESCOLHA',
                  status: 'APROVADO',
                  difficultyLevel: 'FACIL',
                  questionBankYearId: 'qb-year-1',
                  solutionExplanation: 'Isolando x: 3x = 9, então x = 9/3 = 3',
                  createdAt: '2024-01-10T10:00:00.000Z',
                  updatedAt: '2024-01-10T10:00:00.000Z',
                  knowledgeMatrix: [
                    {
                      subject: {
                        id: 'matematica',
                        name: 'Matemática',
                        color: '#0066b8',
                        icon: 'MathOperations',
                      },
                      topic: {
                        id: 'tema-1',
                        name: 'Álgebra',
                      },
                      subtopic: {
                        id: 'subtema-1',
                        name: 'Equações do 1º grau',
                      },
                    },
                  ],
                  options: [
                    { id: 'opt-2a', option: 'x = 3', correct: true },
                    { id: 'opt-2b', option: 'x = 9', correct: false },
                    { id: 'opt-2c', option: 'x = -3', correct: false },
                    { id: 'opt-2d', option: 'x = 0', correct: false },
                  ],
                },
                {
                  id: 'question-3',
                  statement:
                    '<p>Se <strong>5x + 10 = 35</strong>, qual o valor de x?</p>',
                  description: null,
                  questionType: 'MULTIPLA_ESCOLHA',
                  status: 'APROVADO',
                  difficultyLevel: 'MEDIO',
                  questionBankYearId: 'qb-year-1',
                  solutionExplanation: '5x = 35 - 10 = 25, então x = 25/5 = 5',
                  createdAt: '2024-01-10T10:00:00.000Z',
                  updatedAt: '2024-01-10T10:00:00.000Z',
                  knowledgeMatrix: [
                    {
                      subject: {
                        id: 'matematica',
                        name: 'Matemática',
                        color: '#0066b8',
                        icon: 'MathOperations',
                      },
                      topic: {
                        id: 'tema-1',
                        name: 'Álgebra',
                      },
                      subtopic: {
                        id: 'subtema-1',
                        name: 'Equações do 1º grau',
                      },
                    },
                  ],
                  options: [
                    { id: 'opt-3a', option: 'x = 5', correct: true },
                    { id: 'opt-3b', option: 'x = 7', correct: false },
                    { id: 'opt-3c', option: 'x = 25', correct: false },
                    { id: 'opt-3d', option: 'x = 4', correct: false },
                  ],
                },
              ],
              updatedAt: '2024-01-15T10:00:00.000Z',
            },
          },
        };
      }

      return { data: { data: [] } };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: async (url: string, body: any) => {
      // Handle lessons/list POST
      // Only return lessons if filters are applied
      if (url === '/lessons/list') {
        const filters = body?.filters as
          | {
              subjectId?: string[];
              topicIds?: string[];
              subtopicIds?: string[];
              contentIds?: string[];
              selectedIds?: string[];
            }
          | undefined;

        // Return empty array if not ALL filters are applied
        if (!hasAllFiltersApplied(filters)) {
          return {
            data: {
              message: 'Lessons fetched successfully',
              data: {
                lessons: [],
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 0,
                  totalPages: 0,
                  hasNext: false,
                  hasPrev: false,
                },
              },
            },
          };
        }

        // Return mock lessons when filters are applied
        return {
          data: {
            message: 'Lessons fetched successfully',
            data: {
              lessons: mockLessons,
              pagination: {
                page: 1,
                limit: 20,
                total: mockLessons.length,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          },
        };
      }

      // Handle knowledge/topics POST
      if (url === '/knowledge/topics') {
        return {
          data: {
            data: [
              { id: 'tema-1', name: 'Álgebra' },
              { id: 'tema-2', name: 'Geometria' },
              { id: 'tema-3', name: 'Aritmética' },
            ],
          },
        };
      }

      // Handle knowledge/subtopics POST
      if (url === '/knowledge/subtopics') {
        return {
          data: {
            data: [
              { id: 'subtema-1', name: 'Equações do 1º grau' },
              { id: 'subtema-2', name: 'Equações do 2º grau' },
            ],
          },
        };
      }

      // Handle knowledge/contents POST
      if (url === '/knowledge/contents') {
        return {
          data: {
            data: [
              { id: 'assunto-1', name: 'Resolução de equações lineares' },
              { id: 'assunto-2', name: 'Sistemas de equações' },
            ],
          },
        };
      }

      // Handle recommended-class/drafts POST
      if (url === '/recommended-class/drafts') {
        if (onSave) {
          onSave('POST', url, body);
        }
        const payload = body as {
          type?: 'RASCUNHO' | 'MODELO';
          title?: string;
          subjectId?: string;
          filters?: unknown;
          lessonIds?: string[];
        };
        return {
          data: {
            message: 'Recommended lesson draft created successfully',
            data: {
              draft: {
                id: `new-draft-${Date.now()}`,
                type: payload.type || 'RASCUNHO',
                title: payload.title || '',
                description: null,
                creatorUserInstitutionId: 'mock-institution-id',
                subjectId: payload.subjectId || null,
                filters: payload.filters || {},
                startDate: null,
                finalDate: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              lessonsLinked: payload.lessonIds?.length || 0,
            },
          },
        };
      }

      // Handle recommended-class POST (create recommended lesson)
      if (url === '/recommended-class') {
        if (onSave) {
          onSave('POST', url, body);
        }
        return {
          data: {
            message: 'Recommended lesson created successfully',
            data: { id: `recommended-lesson-${Date.now()}` },
          },
        };
      }

      // Handle recommended-class/send-to-students POST
      if (url === '/recommended-class/send-to-students') {
        if (onSave) {
          onSave('POST', url, body);
        }
        return {
          data: {
            message: 'Recommended lesson sent to students successfully',
            data: { success: true },
          },
        };
      }

      return { data: { data: [] } };
    },
    patch: async (url: string, body: unknown) => {
      if (onSave) {
        onSave('PATCH', url, body);
      }
      const payload = body as {
        type?: 'RASCUNHO' | 'MODELO';
        title?: string;
        subjectId?: string;
        filters?: unknown;
        lessonIds?: string[];
      };
      const draftId = url.split('/').pop() || 'draft-id';
      return {
        data: {
          message: 'Recommended lesson draft updated successfully',
          data: {
            draft: {
              id: draftId,
              type: payload.type || 'RASCUNHO',
              title: payload.title || '',
              description: null,
              creatorUserInstitutionId: 'mock-institution-id',
              subjectId: payload.subjectId || null,
              filters: payload.filters || {},
              startDate: null,
              finalDate: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            lessonsLinked: payload.lessonIds?.length || 0,
          },
        },
      };
    },
    delete: async () => ({ data: {} }),
  } as BaseApiClient;
};

// Default mock API client
const mockApiClient = createMockApiClient();

export const WithoutInitialLessons: Story = () => {
  return (
    <BrowserRouter>
      <RecommendedLessonCreate
        apiClient={mockApiClient}
        institutionId="institution-1"
      />
    </BrowserRouter>
  );
};

WithoutInitialLessons.storyName = 'Without Initial Lessons';

export const WithPreFilters: Story = () => {
  // Pre-filters matching the backend format (same as ActivityCreate)
  // ALL filters must be filled for lessons to appear in the bank
  const preFilters = {
    subjects: ['matematica'],
    topics: ['tema-1'],
    subtopics: ['subtema-1'],
    contents: ['assunto-1'],
  };

  return (
    <BrowserRouter>
      <RecommendedLessonCreate
        apiClient={mockApiClient}
        institutionId="institution-1"
        preFilters={preFilters}
      />
    </BrowserRouter>
  );
};

WithPreFilters.storyName = 'With preFilters (all filters pre-selected)';

export const WithInitialLessons: Story = () => {
  return (
    <BrowserRouter>
      <RecommendedLessonCreate
        apiClient={mockApiClient}
        institutionId="institution-1"
      />
    </BrowserRouter>
  );
};

WithInitialLessons.storyName = 'With Initial Lessons';

export const WithLessonDebug: Story = () => {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Debug Panel
          </h3>
          <p style={{ fontSize: '12px', color: '#666' }}>
            O componente agora gerencia seu próprio estado interno. Use o
            console do navegador para ver os logs de salvamento.
          </p>
        </div>
        <RecommendedLessonCreate
          apiClient={createMockApiClient(
            (method: string, url: string, payload: unknown) => {
              console.log('🔄 Envio do RecommendedLesson para o Backend:');
              console.log('Method:', method);
              console.log('URL:', url);
              console.log('Payload:', payload);
            }
          )}
          institutionId="institution-1"
        />
      </div>
    </BrowserRouter>
  );
};

WithLessonDebug.storyName = 'With Lesson Debug (Logs)';

export const LoadingState: Story = () => {
  return (
    <BrowserRouter>
      <RecommendedLessonCreate
        apiClient={mockApiClient}
        institutionId="institution-1"
      />
    </BrowserRouter>
  );
};

LoadingState.storyName = 'Loading State (Skeleton)';

export const WithSaveError: Story = () => {
  const errorApiClient = {
    ...mockApiClient,
    post: async (url: string, _body: unknown) => {
      if (url === '/recommended-class/drafts') {
        throw new Error('Network error: Failed to save draft');
      }
      return mockApiClient.post(
        url,
        _body as Record<string, unknown> | undefined
      );
    },
    patch: async (url: string, _body: unknown) => {
      if (url.startsWith('/recommended-class/drafts/')) {
        throw new Error('Server error: Unable to update draft');
      }
      return mockApiClient.patch(
        url,
        _body as Record<string, unknown> | undefined
      );
    },
  } as BaseApiClient;

  return (
    <BrowserRouter>
      <>
        <RecommendedLessonCreate
          apiClient={errorApiClient}
          institutionId="institution-1"
        />
        <Toaster />
      </>
    </BrowserRouter>
  );
};

WithSaveError.storyName = 'With Save Error (Shows Toast)';

export const WithBackNavigation: Story = () => {
  const handleBack = () => {
    alert('Navigating back...');
  };

  return (
    <BrowserRouter>
      <RecommendedLessonCreate
        apiClient={mockApiClient}
        institutionId="institution-1"
        onBack={handleBack}
      />
    </BrowserRouter>
  );
};

WithBackNavigation.storyName = 'With Back Navigation';

export const WithCallbacks: Story = () => {
  const handleCreateRecommendedLesson = (
    recommendedLessonId: string,
    recommendedLessonData: unknown
  ) => {
    console.log('📚 Recommended Lesson Created:');
    console.log('ID:', recommendedLessonId);
    console.log('Data:', recommendedLessonData);
    alert(`Recommended lesson created with ID: ${recommendedLessonId}`);
  };

  const handleSaveModel = (response: unknown) => {
    console.log('💾 Model Saved:');
    console.log('Response:', response);
    alert('Model saved successfully!');
  };

  return (
    <BrowserRouter>
      <>
        <RecommendedLessonCreate
          apiClient={mockApiClient}
          institutionId="institution-1"
          onCreateRecommendedLesson={handleCreateRecommendedLesson}
          onSaveModel={handleSaveModel}
        />
        <Toaster />
      </>
    </BrowserRouter>
  );
};

WithCallbacks.storyName =
  'With Callbacks (onCreateRecommendedLesson, onSaveModel)';

/**
 * Story that simulates editing an existing draft with lessons already in the preview
 * Uses MemoryRouter to pass the ?id= parameter in the URL
 */
export const WithExistingDraft: Story = () => {
  return (
    <MemoryRouter
      initialEntries={[
        '/criar-aula-recomendada?type=rascunho&id=existing-draft-123',
      ]}
    >
      <>
        <RecommendedLessonCreate
          apiClient={mockApiClient}
          institutionId="institution-1"
        />
        <Toaster />
      </>
    </MemoryRouter>
  );
};

WithExistingDraft.storyName = 'With Existing Draft (Lessons in Preview)';

/**
 * Story that demonstrates the full navigation flow between RecommendedLessonCreate and CreateActivity
 * Uses Routes to simulate real navigation:
 * 1. Start at RecommendedLessonCreate with a draft
 * 2. Click "Adicionar atividade" to navigate to CreateActivity
 * 3. Click back or "Adicionar atividade" button in CreateActivity to return to RecommendedLessonCreate
 */
export const WithFullNavigationFlow: Story = () => {
  // Extended mock API client with ActivityCreate endpoints
  const baseMockClient = createMockApiClient();
  const fullMockApiClient = {
    ...baseMockClient,
    get: async (url: string) => {
      // Handle institution question types endpoint for ActivityFilters
      if (url.includes('/institutions/') && url.includes('/question-types')) {
        return {
          data: {
            message: 'Question types retrieved successfully',
            data: {
              questionTypes: [
                'MULTIPLA_ESCOLHA',
                'ALTERNATIVA',
                'DISSERTATIVA',
                'VERDADEIRO_OU_FALSO',
              ],
              isFiltered: false,
            },
          },
        };
      }

      // Handle questions/list endpoint for CreateActivity
      if (url === '/questions/list' || url.startsWith('/questions')) {
        return {
          data: {
            data: {
              questions: [
                {
                  id: 'question-1',
                  statement:
                    '<p>Resolva a equação: <strong>2x + 5 = 15</strong></p>',
                  questionType: 'MULTIPLA_ESCOLHA',
                  status: 'APROVADO',
                  difficultyLevel: 'FACIL',
                  knowledgeMatrix: [
                    {
                      subject: {
                        id: 'matematica',
                        name: 'Matemática',
                        color: '#0066b8',
                        icon: 'MathOperations',
                      },
                      topic: { id: 'tema-1', name: 'Álgebra' },
                      subtopic: {
                        id: 'subtema-1',
                        name: 'Equações do 1º grau',
                      },
                    },
                  ],
                  options: [
                    { id: 'opt-1a', option: 'x = 5', correct: true },
                    { id: 'opt-1b', option: 'x = 10', correct: false },
                  ],
                },
                {
                  id: 'question-2',
                  statement:
                    '<p>Qual é o valor de <strong>x</strong> na equação <em>3x - 9 = 0</em>?</p>',
                  questionType: 'MULTIPLA_ESCOLHA',
                  status: 'APROVADO',
                  difficultyLevel: 'FACIL',
                  knowledgeMatrix: [
                    {
                      subject: {
                        id: 'matematica',
                        name: 'Matemática',
                        color: '#0066b8',
                        icon: 'MathOperations',
                      },
                      topic: { id: 'tema-1', name: 'Álgebra' },
                      subtopic: {
                        id: 'subtema-1',
                        name: 'Equações do 1º grau',
                      },
                    },
                  ],
                  options: [
                    { id: 'opt-2a', option: 'x = 3', correct: true },
                    { id: 'opt-2b', option: 'x = 9', correct: false },
                  ],
                },
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 2,
                totalPages: 1,
              },
            },
          },
        };
      }

      // Delegate all other endpoints (including /activity-drafts and /activity-drafts/{id}) to base mock
      // The base mock already has proper selectedQuestions data
      return baseMockClient.get(url);
    },
    post: async (url: string, body: unknown) => {
      // Handle activity-drafts POST for CreateActivity
      if (url === '/activity-drafts') {
        const payload = body as {
          type?: string;
          title?: string;
          subjectId?: string;
          filters?: unknown;
          questionIds?: string[];
        };
        return {
          data: {
            message: 'Activity draft created successfully',
            data: {
              draft: {
                id: `activity-draft-${Date.now()}`,
                type: payload.type || 'RASCUNHO',
                title: payload.title || '',
                creatorUserInstitutionId: 'mock-institution-id',
                subjectId: payload.subjectId || null,
                filters: payload.filters || {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              questionsLinked: payload.questionIds?.length || 0,
            },
          },
        };
      }

      // Handle questions/list POST
      if (url === '/questions/list') {
        return {
          data: {
            data: {
              questions: [
                {
                  id: 'question-1',
                  statement:
                    '<p>Resolva a equação: <strong>2x + 5 = 15</strong></p>',
                  questionType: 'MULTIPLA_ESCOLHA',
                  status: 'APROVADO',
                  difficultyLevel: 'FACIL',
                  knowledgeMatrix: [
                    {
                      subject: {
                        id: 'matematica',
                        name: 'Matemática',
                        color: '#0066b8',
                        icon: 'MathOperations',
                      },
                      topic: { id: 'tema-1', name: 'Álgebra' },
                      subtopic: {
                        id: 'subtema-1',
                        name: 'Equações do 1º grau',
                      },
                    },
                  ],
                  options: [
                    { id: 'opt-1a', option: 'x = 5', correct: true },
                    { id: 'opt-1b', option: 'x = 10', correct: false },
                  ],
                },
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
              },
            },
          },
        };
      }

      // Delegate to base mock for other endpoints
      return baseMockClient.post(
        url,
        body as Record<string, unknown> | undefined
      );
    },
    patch: async (url: string, body: unknown) => {
      // Handle activity-drafts PATCH
      if (url.startsWith('/activity-drafts/')) {
        const draftId = url.split('/').pop() || 'activity-draft-id';
        const payload = body as {
          type?: string;
          title?: string;
          subjectId?: string;
          filters?: unknown;
          questionIds?: string[];
        };
        return {
          data: {
            message: 'Activity draft updated successfully',
            data: {
              draft: {
                id: draftId,
                type: payload.type || 'RASCUNHO',
                title: payload.title || '',
                creatorUserInstitutionId: 'mock-institution-id',
                subjectId: payload.subjectId || null,
                filters: payload.filters || {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              questionsLinked: payload.questionIds?.length || 0,
            },
          },
        };
      }

      // Delegate to base mock
      return baseMockClient.patch(
        url,
        body as Record<string, unknown> | undefined
      );
    },
    delete: async () => ({ data: {} }),
  } as BaseApiClient;

  // Wrapper component to use navigation hooks inside Router context
  const RecommendedLessonCreateWithNavigation = () => {
    const navigate = useNavigate();

    const handleRedirectToActivity = ({
      activityId,
      activityType,
      lessonId,
      lessonType,
    }: {
      activityId: string;
      activityType: string;
      lessonId: string;
      lessonType: string;
    }) => {
      // Build URL with all necessary parameters
      const params = new URLSearchParams();
      params.set('type', activityType.toLowerCase());
      params.set('id', activityId);
      params.set('recommended-lesson-draft', lessonId);
      params.set(
        'onFinish',
        `criar-aula-recomendada?type=${lessonType.toLowerCase()}&id=${lessonId}`
      );

      navigate(`/criar-atividade?${params.toString()}`);
    };

    return (
      <RecommendedLessonCreate
        apiClient={fullMockApiClient}
        institutionId="institution-1"
        onBack={() => console.log('Back from RecommendedLessonCreate')}
        onRedirectToActivity={handleRedirectToActivity}
      />
    );
  };

  return (
    <MemoryRouter
      initialEntries={[
        '/criar-aula-recomendada?type=rascunho&id=existing-draft-123',
      ]}
    >
      <Routes>
        {/* RecommendedLessonCreate route */}
        <Route
          path="/criar-aula-recomendada"
          element={<RecommendedLessonCreateWithNavigation />}
        />

        {/* CreateActivity route - accessed when clicking "Adicionar atividade" button in LessonPreview */}
        <Route
          path="/criar-atividade"
          element={
            <CreateActivity
              apiClient={fullMockApiClient}
              institutionId="institution-1"
              isDark={false}
              onBack={() => console.log('Back from CreateActivity')}
              onAddActivityToLesson={(activityDraftId) => {
                console.log('Activity added to lesson:', activityDraftId);
              }}
            />
          }
        />
      </Routes>
      <Toaster />
    </MemoryRouter>
  );
};

WithFullNavigationFlow.storyName =
  'With Full Navigation Flow (RecommendedLesson to CreateActivity)';
