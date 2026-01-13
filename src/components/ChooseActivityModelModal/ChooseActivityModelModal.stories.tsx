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
import type { SubjectEnum } from '../../enums/SubjectEnum';

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
 * Modal with subject mapping
 */
export const WithSubjectMapping: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const apiClient = useMemo(() => createMockApiClient(500), []);

  const mapSubjectNameToEnum = (subjectName: string) => {
    const mapping: Record<string, SubjectEnum> = {
      Biologia: 'BIOLOGY' as SubjectEnum,
      Artes: 'ARTS' as SubjectEnum,
    };
    return mapping[subjectName] || null;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>

      <ChooseActivityModelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectModel={(model) => {
          console.log('Model selected:', model);
          setIsOpen(false);
        }}
        apiClient={apiClient}
        mapSubjectNameToEnum={mapSubjectNameToEnum}
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
