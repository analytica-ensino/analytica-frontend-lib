import type { Story } from '@ladle/react';
import { useState } from 'react';
import { CreateActivity } from './ActivityCreate';
import type { BaseApiClient } from '../../types/api';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { Question } from '../../types/questions';
import type { ActivityData } from './ActivityCreate';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../../types/questions';

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

      return { data: { data: { questionTypes: [] } } };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: async (url: string, _body: any) => {
      // Handle activity-drafts POST
      if (url === '/activity-drafts' && onSaveActivity) {
        onSaveActivity('POST', url, _body);
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
    <CreateActivity
      apiClient={mockApiClientThreeTypes}
      institutionId="institution-1"
      isDark={false}
    />
  );
};

WithoutInitialQuestions.storyName = 'Without Initial Questions';

export const WithInitialQuestions: Story = () => {
  return (
    <CreateActivity
      apiClient={mockApiClientAllTypes}
      institutionId="institution-1"
      isDark={false}
      initialQuestionIds={[
        'initial-question-1',
        'initial-question-2',
        'initial-question-3',
      ]}
    />
  );
};

WithInitialQuestions.storyName = 'With Initial Questions';

export const WithActivity: Story = () => {
  const mockActivity: ActivityData = {
    id: 'activity-123',
    type: 'RASCUNHO',
    title: 'Rascunho - Matemática',
    subjectId: 'matematica',
    filters: {
      questionTypes: ['ALTERNATIVA', 'DISSERTATIVA'],
      questionBanks: [],
      subjects: ['matematica'],
      topics: ['tema-1'],
      subtopics: [],
      contents: [],
    },
    questionIds: [
      'initial-question-1',
      'initial-question-2',
      'initial-question-3',
    ],
    selectedQuestions: [
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
  const initialActivity: ActivityData = {
    id: 'activity-123',
    type: 'RASCUNHO',
    title: 'Rascunho - Matemática',
    subjectId: 'matematica',
    filters: {
      questionTypes: ['ALTERNATIVA', 'DISSERTATIVA'],
      questionBanks: [],
      subjects: ['matematica'],
      topics: ['tema-1'],
      subtopics: [],
      contents: [],
    },
    questionIds: [
      'initial-question-1',
      'initial-question-2',
      'initial-question-3',
    ],
    selectedQuestions: [
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

  const [currentActivity, setCurrentActivity] =
    useState<ActivityData>(initialActivity);

  const handleActivityChange = (updatedActivity: ActivityData) => {
    console.log('🔄 Activity atualizado via onActivityChange:');
    console.log(updatedActivity);
    setCurrentActivity(updatedActivity);
  };

  const handleSaveActivity = (
    method: string,
    url: string,
    payload: unknown
  ) => {
    console.log('🔄 Envio do Activity para o Backend:');
    console.log('Method:', method);
    console.log('URL:', url);
    console.log('Payload:', payload);
  };

  const handleLogCurrentActivity = () => {
    console.log('📋 Activity Atual:');
    console.log(currentActivity);
  };

  const mockApiClient = createMockApiClient(
    [
      'ALTERNATIVA',
      'DISSERTATIVA',
      'MULTIPLA_ESCOLHA',
      'VERDADEIRO_FALSO',
      'LIGAR_PONTOS',
      'PREENCHER',
      'IMAGEM',
    ],
    handleSaveActivity
  );

  return (
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
        <button
          onClick={handleLogCurrentActivity}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0066b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Log Activity Atual
        </button>
        {currentActivity && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            <strong>Activity Atual:</strong>
            <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(currentActivity, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <CreateActivity
        apiClient={mockApiClient}
        institutionId="institution-1"
        isDark={false}
        activity={currentActivity}
        onActivityChange={handleActivityChange}
      />
    </div>
  );
};

WithActivityDebug.storyName = 'With Activity Debug (Logs)';
