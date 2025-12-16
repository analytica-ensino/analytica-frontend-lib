import type { Story } from '@ladle/react';
import { CreateActivity } from './CreateActivity';
import type { BaseApiClient } from '../../types/api';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';
import type { Question } from '../../types/questions';
import {
  DIFFICULTY_LEVEL_ENUM,
  QUESTION_STATUS_ENUM,
} from '../../types/questions';

// Mock apiClient used in stories to simulate API responses
const mockApiClient: BaseApiClient = {
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

    return { data: { data: { questionTypes: [] } } };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async (url: string, body: any) => {
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

    return { data: { data: [] } };
  },
  patch: async () => ({ data: {} }),
  delete: async () => ({ data: {} }),
};

export const Default: Story<typeof CreateActivity> = () => {
  return <CreateActivity apiClient={mockApiClient} />;
};

Default.storyName = 'Default';

export const WithInstitutionId: Story<typeof CreateActivity> = () => {
  return (
    <CreateActivity apiClient={mockApiClient} institutionId="institution-1" />
  );
};

WithInstitutionId.storyName = 'With Institution ID';

export const WithCallbacks: Story<typeof CreateActivity> = () => {
  return (
    <CreateActivity
      apiClient={mockApiClient}
      onBack={() => console.log('Back clicked')}
      onSaveDraft={() => console.log('Save draft clicked')}
      onSendActivity={() => console.log('Send activity clicked')}
      draftSavedAt="Rascunho salvo às 15:30"
    />
  );
};

WithCallbacks.storyName = 'With Callbacks';

export const FullExample: Story<typeof CreateActivity> = () => {
  return (
    <CreateActivity
      apiClient={mockApiClient}
      institutionId="institution-1"
      onBack={() => console.log('Back clicked')}
      onSaveDraft={() => console.log('Save draft clicked')}
      onSendActivity={() => console.log('Send activity clicked')}
      draftSavedAt="Rascunho salvo às 15:30"
    />
  );
};

FullExample.storyName = 'Full Example';

