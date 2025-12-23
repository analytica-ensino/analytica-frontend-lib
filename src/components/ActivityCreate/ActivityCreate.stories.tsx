import type { Story } from '@ladle/react';
import { BrowserRouter } from 'react-router-dom';
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
    ],
  };

  return (
    <CreateActivity
      apiClient={mockApiClientAllTypes}
      institutionId="institution-1"
      isDark={false}
      activity={mockActivity}
    />
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
