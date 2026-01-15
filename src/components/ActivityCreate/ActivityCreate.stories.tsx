import type { Story } from '@ladle/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { CreateActivity } from './ActivityCreate';
import type { BaseApiClient } from '../../types/api';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { Question } from '../../types/questions';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../../types/questions';
import { Toaster } from '../..';

// Helper function to create mock API client with custom question types
const createMockApiClient = (
  questionTypes: string[],
  onSaveActivity?: (method: string, url: string, payload: unknown) => void
) => {
  return {
    get: async (url: string) => {
      if (url === '/questions/exam-institutions') {
        return {
          data: {
            data: [
              {
                questionBankName: 'ENEM',
                questionBankYearId: '1',
                year: '2023',
                questionsCount: 100,
              },
              {
                questionBankName: 'FUVEST',
                questionBankYearId: '2',
                year: '2023',
                questionsCount: 50,
              },
            ],
          },
        };
      }

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
            ],
          },
        };
      }

      // Intercept question types endpoint
      if (url.startsWith('/institutions/') && url.endsWith('/question-types')) {
        return {
          data: {
            data: {
              questionTypes: questionTypes,
            },
          },
        };
      }

      // Mock school endpoint
      if (url === '/school') {
        return {
          data: {
            message: 'Escolas obtidas com sucesso',
            data: {
              schools: [
                {
                  id: 'school-1',
                  institutionId: 'institution-1',
                  document: '12345678000188',
                  stateRegistration: '123456789',
                  companyName: 'Escola BNCC Unificada LTDA',
                  phone: '(11) 8765-4321',
                  email: 'escola@institutobncc.edu.br',
                  active: true,
                  street: 'Avenida dos Estudantes',
                  streetNumber: '456',
                  neighborhood: 'Vila Educação',
                  complement: 'Prédio Principal',
                  city: 'São Paulo',
                  state: 'SP',
                  zipCode: '01234-890',
                  trailId: 'trail-1',
                  createdAt: '2025-12-12T19:16:24.380Z',
                  updatedAt: '2025-12-12T19:16:24.380Z',
                },
              ],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          },
        };
      }

      // Mock schoolYear endpoint
      if (url === '/schoolYear') {
        return {
          data: {
            message: 'Anos letivos obtidos com sucesso',
            data: {
              schoolYears: [
                {
                  id: 'year-1',
                  name: 'Ensino Fundamental',
                  institutionId: 'institution-1',
                  schoolId: 'school-1',
                  createdAt: '2025-12-12T19:16:25.981Z',
                  updatedAt: '2025-12-12T19:16:25.981Z',
                },
              ],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            },
          },
        };
      }

      // Mock classes endpoint
      if (url === '/classes') {
        return {
          data: {
            message: 'Classes obtidas com sucesso',
            data: {
              classes: [
                {
                  id: 'class-1',
                  name: 'A',
                  shift: 'Manhã',
                  institutionId: 'institution-1',
                  schoolId: 'school-1',
                  schoolYearId: 'year-1',
                  createdAt: '2025-12-12T19:16:28.544Z',
                  updatedAt: '2025-12-12T19:16:28.544Z',
                },
              ],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              },
            },
          },
        };
      }

      // Mock students endpoint
      if (url === '/students?page=1&limit=100' || url.startsWith('/students')) {
        return {
          data: {
            message: 'Estudantes obtidos com sucesso',
            data: {
              students: [
                {
                  id: 'student-1',
                  email: 'aluno1@exemplo-dev.com.br',
                  name: 'Aluno Exemplo 1',
                  active: true,
                  createdAt: '2025-12-12T19:17:48.702Z',
                  updatedAt: '2025-12-12T19:17:48.702Z',
                  userInstitutionId: 'ui-1',
                  institutionId: 'institution-1',
                  schoolId: 'school-1',
                  schoolYearId: 'year-1',
                  classId: 'class-1',
                  profileId: 'profile-1',
                },
                {
                  id: 'student-2',
                  email: 'aluno2@exemplo-dev.com.br',
                  name: 'Aluno Exemplo 2',
                  active: true,
                  createdAt: '2025-12-12T19:17:48.702Z',
                  updatedAt: '2025-12-12T19:17:48.702Z',
                  userInstitutionId: 'ui-2',
                  institutionId: 'institution-1',
                  schoolId: 'school-1',
                  schoolYearId: 'year-1',
                  classId: 'class-1',
                  profileId: 'profile-1',
                },
              ],
              pagination: {
                page: 1,
                limit: 100,
                total: 2,
                totalPages: 1,
              },
            },
          },
        };
      }

      return { data: { data: { questionTypes: [] } } };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: async (url: string, _body: any) => {
      // Handle /activities POST
      if (url === '/activities') {
        if (onSaveActivity) {
          onSaveActivity('POST', url, _body);
        }
        return {
          data: {
            message: 'Activity created successfully',
            data: { id: `activity-${Date.now()}` },
          },
        };
      }

      // Handle /activities/send-to-students POST
      if (url === '/activities/send-to-students') {
        if (onSaveActivity) {
          onSaveActivity('POST', url, _body);
        }
        return {
          data: {
            message: 'Activity sent to students successfully',
            data: { success: true },
          },
        };
      }

      // Handle activity-drafts POST
      if (url === '/activity-drafts') {
        if (onSaveActivity) {
          onSaveActivity('POST', url, _body);
        }
        const payload = _body as {
          type?: 'RASCUNHO' | 'MODELO';
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
                id: `new-draft-${Date.now()}`,
                type: payload.type || 'RASCUNHO',
                title: payload.title || '',
                creatorUserInstitutionId: 'mock-institution-id',
                subjectId: payload.subjectId || '',
                filters: payload.filters || {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              questionsLinked: payload.questionIds?.length || 0,
            },
          },
        };
      }

      if (url === '/questions/list') {
        const mockQuestions: Question[] = [
          {
            id: 'question-1',
            statement: 'Qual é a raiz quadrada de 16?',
            description: null,
            questionType: QUESTION_TYPE.ALTERNATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
            questionBankYearId: 'year-1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
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
              },
            ],
            options: [
              { id: 'opt-1', option: '2' },
              { id: 'opt-2', option: '4' },
              { id: 'opt-3', option: '6' },
              { id: 'opt-4', option: '8' },
            ],
          },
          {
            id: 'question-2',
            statement: 'Qual é a capital do Brasil?',
            description: null,
            questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.FACIL,
            questionBankYearId: 'year-1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [
              {
                subject: {
                  id: 'portugues',
                  name: 'Português',
                  color: '#00a651',
                  icon: 'ChatPT',
                },
              },
            ],
            options: [
              { id: 'opt-1', option: 'São Paulo' },
              { id: 'opt-2', option: 'Rio de Janeiro' },
              { id: 'opt-3', option: 'Brasília' },
              { id: 'opt-4', option: 'Belo Horizonte' },
            ],
          },
        ];

        return {
          data: {
            message: 'Success',
            data: {
              questions: mockQuestions,
              pagination: {
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
              },
            },
          },
        };
      }

      if (url === '/knowledge/topics') {
        return {
          data: {
            data: [
              { id: 'tema-1', name: 'Álgebra' },
              { id: 'tema-2', name: 'Geometria' },
            ],
          },
        };
      }

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

      if (url === '/questions/by-ids') {
        const mockQuestionsByIds: Question[] = [
          {
            id: 'initial-question-1',
            statement: 'Qual é a fórmula da área de um círculo?',
            description: null,
            questionType: QUESTION_TYPE.ALTERNATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
            questionBankYearId: 'year-1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [
              {
                subject: {
                  id: 'matematica',
                  name: 'Matemática',
                  color: '#0066b8',
                  icon: 'MathOperations',
                },
                topic: {
                  id: 'tema-2',
                  name: 'Geometria',
                },
              },
            ],
            options: [
              { id: 'opt-1', option: 'πr²' },
              { id: 'opt-2', option: '2πr' },
              { id: 'opt-3', option: 'πd' },
              { id: 'opt-4', option: 'r²' },
            ],
          },
          {
            id: 'initial-question-2',
            statement: 'Quem escreveu "Dom Casmurro"?',
            description: null,
            questionType: QUESTION_TYPE.ALTERNATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.FACIL,
            questionBankYearId: 'year-1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [
              {
                subject: {
                  id: 'portugues',
                  name: 'Português',
                  color: '#00a651',
                  icon: 'ChatPT',
                },
                topic: {
                  id: 'tema-3',
                  name: 'Literatura Brasileira',
                },
              },
            ],
            options: [
              { id: 'opt-1', option: 'Machado de Assis' },
              { id: 'opt-2', option: 'José de Alencar' },
              { id: 'opt-3', option: 'Clarice Lispector' },
              { id: 'opt-4', option: 'Carlos Drummond de Andrade' },
            ],
          },
          {
            id: 'initial-question-3',
            statement:
              'Explique o processo de independência do Brasil em 1822.',
            description: null,
            questionType: QUESTION_TYPE.DISSERTATIVA,
            status: QUESTION_STATUS_ENUM.APROVADO,
            difficultyLevel: DIFFICULTY_LEVEL_ENUM.DIFICIL,
            questionBankYearId: 'year-1',
            solutionExplanation: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            knowledgeMatrix: [
              {
                subject: {
                  id: 'historia',
                  name: 'História',
                  color: '#6366f1',
                  icon: 'CastleTurret',
                },
                topic: {
                  id: 'tema-4',
                  name: 'Brasil Império',
                },
              },
            ],
            options: [],
          },
        ];

        return {
          data: {
            message: 'Success',
            data: {
              questions: mockQuestionsByIds,
            },
          },
        };
      }

      return { data: { data: [] } };
    },
    patch: async (url: string, body: unknown) => {
      if (onSaveActivity) {
        onSaveActivity('PATCH', url, body);
      }
      const payload = body as {
        type?: 'RASCUNHO' | 'MODELO';
        title?: string;
        subjectId?: string;
        filters?: unknown;
        questionIds?: string[];
      };
      const draftId = url.split('/').pop() || 'draft-id';
      return {
        data: {
          message: 'Activity draft updated successfully',
          data: {
            draft: {
              id: draftId,
              type: payload.type || 'RASCUNHO',
              title: payload.title || '',
              creatorUserInstitutionId: 'mock-institution-id',
              subjectId: payload.subjectId || '',
              filters: payload.filters || {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            questionsLinked: payload.questionIds?.length || 0,
          },
        },
      };
    },
    delete: async () => ({ data: {} }),
  } as BaseApiClient;
};

// Mock API client with only 3 question types
const mockApiClientThreeTypes = createMockApiClient([
  'ALTERNATIVA',
  'DISSERTATIVA',
  'MULTIPLA_ESCOLHA',
]);

// Mock API client with all question types
const mockApiClientAllTypes = createMockApiClient([
  'ALTERNATIVA',
  'DISSERTATIVA',
  'MULTIPLA_ESCOLHA',
  'VERDADEIRO_FALSO',
  'LIGAR_PONTOS',
  'PREENCHER',
  'IMAGEM',
]);

export const WithoutInitialQuestions: Story = () => {
  return (
    <BrowserRouter>
      <CreateActivity
        apiClient={mockApiClientThreeTypes}
        institutionId="institution-1"
        isDark={false}
      />
    </BrowserRouter>
  );
};

WithoutInitialQuestions.storyName = 'Without Initial Questions';

export const WithPreFilters: Story = () => {
  // Mock API client that returns a draft with pre-selected filters
  const mockApiClientWithPreFilters = {
    ...mockApiClientAllTypes,
    get: async (url: string) => {
      // Intercept activity-drafts/{id} to return draft with filters
      if (url.startsWith('/activity-drafts/')) {
        return {
          data: {
            data: {
              id: 'draft-with-prefilters',
              type: 'RASCUNHO',
              title: 'Atividade com filtros pré-selecionados',
              creatorUserInstitutionId: 'institution-1',
              subjectId: 'matematica',
              filters: {
                questionTypes: ['ALTERNATIVA', 'MULTIPLA_ESCOLHA'],
                questionBanks: ['1'],
                subjects: ['matematica'],
                topics: ['tema-1'],
                subtopics: ['subtema-1'],
                contents: ['assunto-1'],
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }
      // Delegate other GET requests to the original mock
      return mockApiClientAllTypes.get(url);
    },
  } as BaseApiClient;

  return (
    <MemoryRouter
      initialEntries={[
        '/criar-atividade?type=rascunho&id=draft-with-prefilters',
      ]}
    >
      <CreateActivity
        apiClient={mockApiClientWithPreFilters}
        institutionId="institution-1"
        isDark={false}
      />
    </MemoryRouter>
  );
};

WithPreFilters.storyName = 'With preFilters (pre-selected filters)';

export const WithInitialQuestions: Story = () => {
  return (
    <BrowserRouter>
      <CreateActivity
        apiClient={mockApiClientAllTypes}
        institutionId="institution-1"
        isDark={false}
      />
    </BrowserRouter>
  );
};

WithInitialQuestions.storyName = 'With Initial Questions';

export const WithActivity: Story = () => {
  return (
    <BrowserRouter>
      <CreateActivity
        apiClient={mockApiClientAllTypes}
        institutionId="institution-1"
        isDark={false}
      />
    </BrowserRouter>
  );
};

WithActivity.storyName = 'With Activity (Edit Mode)';

export const WithActivityDebug: Story = () => {
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
        <CreateActivity
          apiClient={createMockApiClient(
            [
              'ALTERNATIVA',
              'DISSERTATIVA',
              'MULTIPLA_ESCOLHA',
              'VERDADEIRO_FALSO',
              'LIGAR_PONTOS',
              'PREENCHER',
              'IMAGEM',
            ],
            (method: string, url: string, payload: unknown) => {
              console.log('🔄 Envio do Activity para o Backend:');
              console.log('Method:', method);
              console.log('URL:', url);
              console.log('Payload:', payload);
            }
          )}
          institutionId="institution-1"
          isDark={false}
        />
      </div>
    </BrowserRouter>
  );
};

WithActivityDebug.storyName = 'With Activity Debug (Logs)';

export const LoadingState: Story = () => {
  return (
    <BrowserRouter>
      <CreateActivity
        apiClient={mockApiClientAllTypes}
        institutionId="institution-1"
        isDark={false}
      />
    </BrowserRouter>
  );
};

LoadingState.storyName = 'Loading State (Skeleton)';

export const WithSaveError: Story = () => {
  const errorApiClient = {
    ...mockApiClientAllTypes,
    post: async (url: string, _body: unknown) => {
      if (url === '/activity-drafts') {
        throw new Error('Network error: Failed to save draft');
      }
      return mockApiClientAllTypes.post(
        url,
        _body as Record<string, unknown> | undefined
      );
    },
    patch: async (url: string, _body: unknown) => {
      if (url.startsWith('/activity-drafts/')) {
        throw new Error('Server error: Unable to update draft');
      }
      return mockApiClientAllTypes.patch(
        url,
        _body as Record<string, unknown> | undefined
      );
    },
  } as BaseApiClient;

  return (
    <BrowserRouter>
      <>
        <CreateActivity
          apiClient={errorApiClient}
          institutionId="institution-1"
          isDark={false}
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
      <CreateActivity
        apiClient={mockApiClientAllTypes}
        institutionId="institution-1"
        isDark={false}
        onBack={handleBack}
      />
    </BrowserRouter>
  );
};

WithBackNavigation.storyName = 'With Back Navigation';

/**
 * Story 1: Creating a new activity from recommended lesson (no existing draft)
 * User navigates from "criar-aula-recomendada" to create a new activity
 */
export const WithRecommendedLessonCreate: Story = () => {
  // Mock API client for creating new activity from recommended lesson
  const mockApiClientWithRecommendedLesson = {
    ...mockApiClientAllTypes,
    get: async (url: string) => {
      // Intercept recommended-lesson-draft endpoint
      if (url.startsWith('/recommended-lesson-draft/')) {
        return {
          data: {
            data: {
              id: '019ba10b-2a77-789e-802d-f8240ff4e0b4',
              type: 'RASCUNHO',
              title: 'Aula de Matemática - Números e Operações',
              description: 'Aula sobre números reais e operações básicas',
              creatorUserInstitutionId: '019b588f-faf8-7b85-9c85-2e08e8b03909',
              subjectId: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              filters: {
                subjects: ['019b588e-5a1d-7b64-954e-c84a81c7ca58'],
                topics: ['019b588e-5c4b-7e1f-a85f-1c78a8218f3a'],
                subtopics: ['019b588e-5e7d-7bff-8966-8ac59395f124'],
                contents: ['019b588e-60ad-7c90-b3a5-36f51aed6794'],
              },
              startDate: '2026-01-20T08:00:00.000Z',
              finalDate: '2026-01-20T10:00:00.000Z',
              createdAt: '2026-01-09T01:37:02.199Z',
              updatedAt: '2026-01-09T04:37:40.376Z',
              lessons: [
                {
                  lessonId: 'lesson-1',
                  name: 'Introdução aos Números Reais',
                  sequence: 1,
                },
                {
                  lessonId: 'lesson-2',
                  name: 'Operações com Números Reais',
                  sequence: 2,
                },
              ],
              creator: {
                id: '019b588f-faf8-7b85-9c85-2e08e8b03909',
                user: {
                  id: 'user-123',
                  name: 'Professor João Silva',
                },
              },
              subject: {
                id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
                name: 'Matemática',
              },
            },
          },
        };
      }
      // Delegate other GET requests to the original mock
      return mockApiClientAllTypes.get(url);
    },
  } as BaseApiClient;

  const handleAddActivityToLesson = (activityDraftId: string) => {
    console.log('Activity draft added to lesson:', activityDraftId);
    alert(`Atividade ${activityDraftId} adicionada à aula!`);
  };

  return (
    <MemoryRouter
      initialEntries={[
        '/criar-atividade?recommended-lesson-draft=019ba10b-2a77-789e-802d-f8240ff4e0b4&onFinish=criar-aula-recomendada/019ba10b-2a77-789e-802d-f8240ff4e0b4',
      ]}
    >
      <CreateActivity
        apiClient={mockApiClientWithRecommendedLesson}
        institutionId="institution-1"
        isDark={false}
        onAddActivityToLesson={handleAddActivityToLesson}
      />
    </MemoryRouter>
  );
};

WithRecommendedLessonCreate.storyName =
  'Recommended Lesson - Create New Activity';

/**
 * Story 2: Editing an existing activity draft from recommended lesson
 * User has an existing draft with pre-filters and selected questions
 */
export const WithRecommendedLessonEdit: Story = () => {
  // Mock questions that will be pre-selected in the activity draft
  const mockSelectedQuestions: Question[] = [
    {
      id: '019b588f-c6e9-7685-8681-75a23b6925ab',
      statement: 'Qual é a raiz quadrada de 144?',
      description: 'Questão alternativa sobre raiz quadrada',
      questionType: QUESTION_TYPE.ALTERNATIVA,
      status: QUESTION_STATUS_ENUM.APROVADO,
      difficultyLevel: DIFFICULTY_LEVEL_ENUM.FACIL,
      questionBankYearId: '019b588f-3d01-75a6-96a7-a7c18d11d10a',
      solutionExplanation: '√144 = 12',
      createdAt: '2025-12-25T23:49:02.278Z',
      updatedAt: '2025-12-25T23:49:02.278Z',
      knowledgeMatrix: [
        {
          subject: {
            id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
            name: 'Matemática',
            color: '#ff0000',
            icon: 'math',
          },
          topic: {
            id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
            name: 'Números e Operações',
          },
          subtopic: {
            id: '019b588e-5e7d-7bff-8966-8ac59395f124',
            name: 'Conjuntos Numéricos',
          },
          content: {
            id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
            name: 'Números Reais',
          },
        },
      ],
      options: [
        { id: '019b588f-ca43-70cd-adc9-85e47a28da92', option: '12' },
        { id: '019b588f-cb5e-7f8e-82c2-744a87fb0307', option: '14' },
        { id: '019b588f-cc83-7cb5-b50f-d0f698e9a201', option: '10' },
        { id: '019b588f-cd9e-718a-9b3e-483429b20217', option: '16' },
        { id: '019b588f-ceb8-79ef-9cd8-9c3ed36d2ed7', option: '8' },
      ],
    },
    {
      id: '019b588f-50b3-75e3-a6f8-c6d6e7d07e40',
      statement:
        'Discorra sobre a importância dos números reais na matemática e suas aplicações.',
      description: 'Questão dissertativa sobre números reais',
      questionType: QUESTION_TYPE.DISSERTATIVA,
      status: QUESTION_STATUS_ENUM.APROVADO,
      difficultyLevel: DIFFICULTY_LEVEL_ENUM.DIFICIL,
      questionBankYearId: '019b588f-3d01-75a6-96a7-a7bb7301d602',
      solutionExplanation:
        'Os números reais são fundamentais na matemática pois completam os números racionais incluindo os irracionais.',
      createdAt: '2025-12-25T23:49:02.278Z',
      updatedAt: '2025-12-25T23:49:02.278Z',
      knowledgeMatrix: [
        {
          subject: {
            id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
            name: 'Matemática',
            color: '#ff0000',
            icon: 'math',
          },
          topic: {
            id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
            name: 'Números e Operações',
          },
          subtopic: {
            id: '019b588e-5e7d-7bff-8966-8ac59395f124',
            name: 'Conjuntos Numéricos',
          },
          content: {
            id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
            name: 'Números Reais',
          },
        },
      ],
      options: [],
    },
    {
      id: '019b588f-4a1a-7cfd-83fa-8d29fa282b26',
      statement:
        'Explique o conceito de função quadrática e suas características principais.',
      description: 'Questão dissertativa sobre funções quadráticas',
      questionType: QUESTION_TYPE.DISSERTATIVA,
      status: QUESTION_STATUS_ENUM.APROVADO,
      difficultyLevel: DIFFICULTY_LEVEL_ENUM.MEDIO,
      questionBankYearId: '019b588f-3d01-75a6-96a7-a7cce2c585b5',
      solutionExplanation:
        'Uma função quadrática é uma função polinomial de segundo grau da forma f(x) = ax² + bx + c.',
      createdAt: '2025-12-25T23:49:02.278Z',
      updatedAt: '2025-12-25T23:49:02.278Z',
      knowledgeMatrix: [
        {
          subject: {
            id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
            name: 'Matemática',
            color: '#ff0000',
            icon: 'math',
          },
          topic: {
            id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
            name: 'Números e Operações',
          },
          subtopic: {
            id: '019b588e-5e7d-7bff-8966-8ac59395f124',
            name: 'Conjuntos Numéricos',
          },
          content: {
            id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
            name: 'Números Reais',
          },
        },
      ],
      options: [],
    },
  ];

  // Mock API client for editing existing activity draft
  const mockApiClientWithExistingDraft = {
    ...mockApiClientAllTypes,
    get: async (url: string) => {
      // Intercept activity-drafts/{id} to return existing draft with filters and questions
      if (url.startsWith('/activity-drafts/')) {
        return {
          data: {
            data: {
              id: '019ba10b-2a77-789e-802d-f8240ff4e0b4',
              type: 'MODELO',
              title: 'Modelo - Matemática',
              creatorUserInstitutionId: '019b588f-faf8-7b85-9c85-2e08e8b03909',
              subjectId: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              filters: {
                questionTypes: ['ALTERNATIVA', 'DISSERTATIVA'],
                questionBanks: [
                  'ANALYTICA',
                  'ENEM',
                  'UEL',
                  'UEM',
                  'UNICENTRO',
                  'UPFR',
                ],
                subjects: ['019b588e-5a1d-7b64-954e-c84a81c7ca58'],
                topics: ['019b588e-5c4b-7e1f-a85f-1c78a8218f3a'],
                subtopics: ['019b588e-5e7d-7bff-8966-8ac59395f124'],
                contents: ['019b588e-60ad-7c90-b3a5-36f51aed6794'],
              },
              createdAt: '2026-01-09T01:37:02.199Z',
              updatedAt: '2026-01-09T04:37:40.376Z',
              selectedQuestions: mockSelectedQuestions,
            },
          },
        };
      }

      // Intercept recommended-lesson-draft endpoint
      if (url.startsWith('/recommended-lesson-draft/')) {
        return {
          data: {
            data: {
              id: '019ba10b-lesson-draft-id',
              type: 'RASCUNHO',
              title: 'Aula de Matemática - Números e Operações',
              description: 'Aula completa sobre números reais e operações',
              creatorUserInstitutionId: '019b588f-faf8-7b85-9c85-2e08e8b03909',
              subjectId: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
              filters: {
                subjects: ['019b588e-5a1d-7b64-954e-c84a81c7ca58'],
                topics: ['019b588e-5c4b-7e1f-a85f-1c78a8218f3a'],
              },
              startDate: '2026-01-20T08:00:00.000Z',
              finalDate: '2026-01-20T10:00:00.000Z',
              createdAt: '2026-01-09T01:37:02.199Z',
              updatedAt: '2026-01-14T15:30:00.000Z',
              lessons: [
                {
                  lessonId: 'lesson-1',
                  name: 'Introdução aos Números Reais',
                  sequence: 1,
                },
                {
                  lessonId: 'lesson-2',
                  name: 'Operações com Números Reais',
                  sequence: 2,
                },
                {
                  lessonId: 'lesson-3',
                  name: 'Exercícios Práticos',
                  sequence: 3,
                },
              ],
              creator: {
                id: '019b588f-faf8-7b85-9c85-2e08e8b03909',
                user: {
                  id: 'user-123',
                  name: 'Professor João Silva',
                },
              },
              subject: {
                id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
                name: 'Matemática',
              },
            },
          },
        };
      }

      // Mock knowledge subjects with real IDs
      if (url === '/knowledge/subjects') {
        return {
          data: {
            data: [
              {
                id: '019b588e-5a1d-7b64-954e-c84a81c7ca58',
                name: 'Matemática',
                color: '#ff0000',
                icon: 'math',
              },
              {
                id: 'portugues-id',
                name: 'Português',
                color: '#00a651',
                icon: 'ChatPT',
              },
            ],
          },
        };
      }

      // Delegate other GET requests to the original mock
      return mockApiClientAllTypes.get(url);
    },
    post: async (url: string, _body: unknown) => {
      // Mock /knowledge/topics
      if (url === '/knowledge/topics') {
        return {
          data: {
            data: [
              {
                id: '019b588e-5c4b-7e1f-a85f-1c78a8218f3a',
                name: 'Números e Operações',
              },
              { id: 'tema-2', name: 'Geometria' },
              { id: 'tema-3', name: 'Álgebra' },
            ],
          },
        };
      }

      // Mock /knowledge/subtopics
      if (url === '/knowledge/subtopics') {
        return {
          data: {
            data: [
              {
                id: '019b588e-5e7d-7bff-8966-8ac59395f124',
                name: 'Conjuntos Numéricos',
              },
              { id: 'subtema-2', name: 'Números Inteiros' },
            ],
          },
        };
      }

      // Mock /knowledge/contents
      if (url === '/knowledge/contents') {
        return {
          data: {
            data: [
              {
                id: '019b588e-60ad-7c90-b3a5-36f51aed6794',
                name: 'Números Reais',
              },
              { id: 'assunto-2', name: 'Números Racionais' },
            ],
          },
        };
      }

      // Delegate other POST requests
      return mockApiClientAllTypes.post(
        url,
        _body as Record<string, unknown> | undefined
      );
    },
  } as BaseApiClient;

  const handleAddActivityToLesson = (activityDraftId: string) => {
    console.log('Activity draft updated and added to lesson:', activityDraftId);
    alert(
      `Atividade ${activityDraftId} atualizada e adicionada à aula! Redirecionando para criar-aula-recomendada...`
    );
  };

  return (
    <MemoryRouter
      initialEntries={[
        '/criar-atividade?type=modelo&id=019ba10b-2a77-789e-802d-f8240ff4e0b4&recommended-lesson-draft=019ba10b-lesson-draft-id&onFinish=criar-aula-recomendada/019ba10b-lesson-draft-id',
      ]}
    >
      <CreateActivity
        apiClient={mockApiClientWithExistingDraft}
        institutionId="institution-1"
        isDark={false}
        onAddActivityToLesson={handleAddActivityToLesson}
      />
    </MemoryRouter>
  );
};

WithRecommendedLessonEdit.storyName =
  'Recommended Lesson - Edit Existing Draft (with questions)';

/**
 * @deprecated Use WithRecommendedLessonCreate or WithRecommendedLessonEdit instead
 */
export const WithRecommendedLesson: Story = () => {
  // Mock API client that handles recommended-lesson-draft endpoint
  const mockApiClientWithRecommendedLesson = {
    ...mockApiClientAllTypes,
    get: async (url: string) => {
      // Intercept recommended-lesson-draft endpoint
      if (url.startsWith('/recommended-lesson-draft/')) {
        return {
          data: {
            data: {
              id: 'recommended-lesson-draft-123',
              title: 'Aula de Matemática - Álgebra',
              subjectId: 'matematica',
              activities: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }
      // Intercept recommended-lesson endpoint
      if (url.startsWith('/recommended-lesson/')) {
        return {
          data: {
            data: {
              id: 'recommended-lesson-456',
              title: 'Aula de Português - Literatura',
              subjectId: 'portugues',
              activities: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }
      // Delegate other GET requests to the original mock
      return mockApiClientAllTypes.get(url);
    },
  } as BaseApiClient;

  const handleAddActivityToLesson = (activityDraftId: string) => {
    console.log('Activity draft added to lesson:', activityDraftId);
    alert(`Atividade ${activityDraftId} adicionada à aula!`);
  };

  return (
    <MemoryRouter
      initialEntries={[
        '/criar-atividade?recommended-lesson-draft=recommended-lesson-draft-123&onFinish=criar-aula-recomendada/recommended-lesson-draft-123',
      ]}
    >
      <CreateActivity
        apiClient={mockApiClientWithRecommendedLesson}
        institutionId="institution-1"
        isDark={false}
        onAddActivityToLesson={handleAddActivityToLesson}
      />
    </MemoryRouter>
  );
};

WithRecommendedLesson.storyName =
  'With Recommended Lesson (from criar-aula-recomendada)';
