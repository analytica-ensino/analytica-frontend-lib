import type { Story } from '@ladle/react';
import { CreateActivity } from './ActivityCreate';
import type { BaseApiClient } from '../../types/api';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { Question } from '../../types/questions';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../../types/questions';

// Helper function to create mock API client with custom question types
const createMockApiClient = (questionTypes: string[]) => {
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
    patch: async () => ({ data: {} }),
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
