import type { Story } from '@ladle/react';
import { useState } from 'react';
import Button from '../Button/Button';
import { SimuladosContentDetailsModal } from './SimuladosContentDetailsModal';
import type {
  ContentDetailsApiClient,
  ContentDetailsApiResponse,
  ContentDetailsData,
} from './types';

function createMockData(
  contentName: string = 'Leitura e interpretação'
): ContentDetailsData {
  return {
    content: {
      id: 'content-1',
      name: contentName,
      bnccCode: 'EM13LP01',
      subject: { id: 'subject-1', name: 'Linguagens' },
      questionsCount: 18,
      studentsCount: 36,
    },
    counters: {
      aboveAverage: 12,
      atAverage: 14,
      belowAverage: 10,
    },
    students: {
      data: [
        {
          studentId: 's1',
          institutionId: 'i1',
          userInstitutionId: 'u1',
          name: 'Maria Souza',
          school: 'Colégio Central',
          schoolYear: '3',
          class: 'A',
          average: 72,
          performance: 72,
        },
        {
          studentId: 's2',
          institutionId: 'i1',
          userInstitutionId: 'u2',
          name: 'João Pereira',
          school: 'Colégio Central',
          schoolYear: '3',
          class: 'A',
          average: 58,
          performance: 58,
        },
      ],
      page: 1,
      limit: 10,
      total: 2,
    },
  };
}

function createSuccessApi(
  delay: number = 500,
  contentName?: string
): ContentDetailsApiClient {
  return {
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const response: ContentDetailsApiResponse = {
        message: 'ok',
        data: createMockData(contentName),
      };
      return { data: response as T };
    },
  };
}

function createErrorApi(delay: number = 500): ContentDetailsApiClient {
  return {
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));
      throw new Error('Erro ao carregar detalhes do conteúdo');
    },
  };
}

function createEmptyApi(delay: number = 500): ContentDetailsApiClient {
  return {
    post: async function <T>(): Promise<{ data: T }> {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const response: ContentDetailsApiResponse = {
        message: 'ok',
        data: {
          ...createMockData(),
          students: { data: [], page: 1, limit: 10, total: 0 },
        },
      };
      return { data: response as T };
    },
  };
}

function BaseModalStory({
  buttonLabel,
  api,
}: {
  buttonLabel: string;
  api: ContentDetailsApiClient;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{buttonLabel}</Button>
      <SimuladosContentDetailsModal
        api={api}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activityFilters={{ types: ['SIMULADO'] }}
        contentId="content-1"
        contentName="Habilidade fallback"
        period="1_MONTH"
        filters={{ schoolIds: ['school-1'], classIds: ['class-1'] }}
      />
    </>
  );
}

export const Default: Story = () => (
  <BaseModalStory
    buttonLabel="Abrir detalhes de conteúdo"
    api={createSuccessApi()}
  />
);

export const LoadingState: Story = () => (
  <BaseModalStory
    buttonLabel="Abrir com carregamento lento"
    api={createSuccessApi(3000)}
  />
);

export const ErrorState: Story = () => (
  <BaseModalStory buttonLabel="Abrir com erro" api={createErrorApi()} />
);

export const EmptyStudents: Story = () => (
  <BaseModalStory buttonLabel="Abrir sem estudantes" api={createEmptyApi()} />
);
