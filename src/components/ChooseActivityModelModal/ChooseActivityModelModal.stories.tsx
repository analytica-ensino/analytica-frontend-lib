import type { Story } from '@ladle/react';
import { useState, useMemo } from 'react';
import { ChooseActivityModelModal } from './ChooseActivityModelModal';
import Button from '../Button/Button';
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

// Mock data - ActivityModelResponse format (as returned by API)
const mockModelsResponse: ActivityModelResponse[] = [
  {
    id: '1',
    type: ActivityDraftType.MODELO,
    title: 'Explorando a Fotossíntese: Atividade Prática de Campo',
    creatorUserInstitutionId: 'creator-1',
    subjectId: 'bio-1',
    subject: {
      id: 'bio-1',
      subjectName: 'Biologia',
      subjectIcon: 'Microscope',
      subjectColor: '#E8F5E9',
    },
    filters: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    type: ActivityDraftType.MODELO,
    title: 'Estudo dos Ecossistemas: Criando um Terrário',
    creatorUserInstitutionId: 'creator-1',
    subjectId: 'bio-1',
    subject: {
      id: 'bio-1',
      subjectName: 'Biologia',
      subjectIcon: 'Microscope',
      subjectColor: '#E8F5E9',
    },
    filters: null,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    type: ActivityDraftType.MODELO,
    title: 'Análise de pinturas: Observação ao Microscópio',
    creatorUserInstitutionId: 'creator-1',
    subjectId: 'art-1',
    subject: {
      id: 'art-1',
      subjectName: 'Artes',
      subjectIcon: 'Palette',
      subjectColor: '#FCE4EC',
    },
    filters: null,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    type: ActivityDraftType.MODELO,
    title: 'Experimento de Genética: Cruzamento de Plantas',
    creatorUserInstitutionId: 'creator-1',
    subjectId: 'bio-1',
    subject: {
      id: 'bio-1',
      subjectName: 'Biologia',
      subjectIcon: 'Microscope',
      subjectColor: '#E8F5E9',
    },
    filters: null,
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
];

// Mock activity details with questions
const mockActivityDetails: Record<string, ActivityData> = {
  '1': {
    id: '1',
    type: ActivityType.MODELO,
    title: 'Explorando a Fotossíntese: Atividade Prática de Campo',
    subjectId: 'bio-1',
    filters: {},
    questionIds: ['q1', 'q2', 'q3'],
    selectedQuestions: [
      {
        id: 'q1',
        statement:
          'Um grupo de cientistas está estudando o comportamento de uma população de bactérias em um laboratório. Eles observaram que a população dobra a cada 3 horas. Se inicialmente havia 100 bactérias, quantas bactérias haverá após 12 horas?',
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
              id: 'bio-1',
              name: 'Biologia',
              color: '#E8F5E9',
              icon: 'Microscope',
            },
            topic: {
              id: 't1',
              name: 'Fotossíntese',
            },
          },
        ],
        options: [
          { id: 'opt1', option: '400 bactérias', correct: false },
          { id: 'opt2', option: '800 bactérias', correct: false },
          { id: 'opt3', option: '1600 bactérias', correct: true },
          { id: 'opt4', option: '3200 bactérias', correct: false },
        ],
      },
      {
        id: 'q2',
        statement:
          'Qual é o processo pelo qual as plantas convertem luz solar em energia química?',
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
              id: 'bio-1',
              name: 'Biologia',
              color: '#E8F5E9',
              icon: 'Microscope',
            },
            topic: {
              id: 't1',
              name: 'Fotossíntese',
            },
          },
        ],
        options: [
          { id: 'opt5', option: 'Respiração', correct: false },
          { id: 'opt6', option: 'Fotossíntese', correct: true },
          { id: 'opt7', option: 'Digestão', correct: false },
          { id: 'opt8', option: 'Fermentação', correct: false },
        ],
      },
      {
        id: 'q3',
        statement: 'Quais são os produtos finais da fotossíntese?',
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
              id: 'bio-1',
              name: 'Biologia',
              color: '#E8F5E9',
              icon: 'Microscope',
            },
            topic: {
              id: 't1',
              name: 'Fotossíntese',
            },
          },
        ],
        options: [
          { id: 'opt9', option: 'Glicose e oxigênio', correct: true },
          { id: 'opt10', option: 'Água e dióxido de carbono', correct: false },
          { id: 'opt11', option: 'Proteínas e lipídios', correct: false },
          { id: 'opt12', option: 'Aminoácidos e vitaminas', correct: false },
        ],
      },
    ],
  },
  '2': {
    id: '2',
    type: ActivityType.MODELO,
    title: 'Estudo dos Ecossistemas: Criando um Terrário',
    subjectId: 'bio-1',
    filters: {},
    questionIds: ['q4', 'q5'],
    selectedQuestions: [
      {
        id: 'q4',
        statement: 'O que é um ecossistema?',
        description: null,
        questionType: QUESTION_TYPE.MULTIPLA_ESCOLHA,
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
              color: '#E8F5E9',
              icon: 'Microscope',
            },
            topic: {
              id: 't2',
              name: 'Ecossistemas',
            },
          },
        ],
        options: [
          {
            id: 'opt13',
            option:
              'Um conjunto de seres vivos e o ambiente em que vivem, interagindo entre si',
            correct: true,
          },
          {
            id: 'opt14',
            option: 'Apenas os animais de uma região',
            correct: false,
          },
          {
            id: 'opt15',
            option: 'Somente as plantas de um local',
            correct: false,
          },
          {
            id: 'opt16',
            option: 'O clima de uma área específica',
            correct: false,
          },
        ],
      },
      {
        id: 'q5',
        statement: 'Qual é a função dos decompositores em um ecossistema?',
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
              color: '#E8F5E9',
              icon: 'Microscope',
            },
            topic: {
              id: 't2',
              name: 'Ecossistemas',
            },
          },
        ],
        options: [
          { id: 'opt17', option: 'Produzir energia', correct: false },
          { id: 'opt18', option: 'Decompor matéria orgânica', correct: true },
          { id: 'opt19', option: 'Caçar outros animais', correct: false },
          { id: 'opt20', option: 'Realizar fotossíntese', correct: false },
        ],
      },
    ],
  },
};

/**
 * Create mock API client that intercepts /activity-drafts URL
 */
const createMockApiClient = (delay: number = 500): BaseApiClient => ({
  get: async <T,>(
    url: string,
    config?: { params?: Record<string, unknown> }
  ) => {
    // Intercept /activity-drafts endpoint
    if (url === '/activity-drafts') {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const params = config?.params || {};
      const page = (params.page as number) || 1;
      const limit = (params.limit as number) || 10;
      const search = (params.search as string) || '';

      let filteredModels = [...mockModelsResponse];

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredModels = filteredModels.filter(
          (model) => model.title?.toLowerCase().includes(searchLower) || false
        );
      }

      // Apply pagination
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

/**
 * Basic modal with activity models
 */
export const Basic: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<ActivityModelTableItem | null>(null);
  const apiClient = useMemo(() => createMockApiClient(500), []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>
        {selectedModel && (
          <div className="p-4 bg-background-50 rounded-lg">
            <p className="text-sm font-medium text-text-900">
              Modelo selecionado:
            </p>
            <p className="text-sm text-text-700">{selectedModel.title}</p>
          </div>
        )}
      </div>

      <ChooseActivityModelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectModel={(model) => {
          setSelectedModel(model);
          setIsOpen(false);
          console.log('Model selected:', model);
        }}
        apiClient={apiClient}
      />
    </div>
  );
};

/**
 * Modal with loading state
 */
export const Loading: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const apiClient = useMemo(() => createMockApiClient(2000), []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => setIsOpen(true)}>Abrir Modal (Loading)</Button>

      <ChooseActivityModelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectModel={(model) => {
          console.log('Model selected:', model);
          setIsOpen(false);
        }}
        apiClient={apiClient}
      />
    </div>
  );
};
