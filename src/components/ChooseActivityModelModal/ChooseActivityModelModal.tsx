import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Modal, Button } from '../../index';
import { ActivityModelsList } from './components/ActivityModelsList';
import { ActivityModelDetails } from './components/ActivityModelDetails';
import type { BaseApiClient } from '../../types/api';
import type {
  ActivityModelTableItem,
  ActivityModelFilters,
  ActivityModelsApiResponse,
  ActivityModelResponse,
} from '../../types/activitiesHistory';
import { ActivityDraftType } from '../../types/activitiesHistory';
import type { ActivityData } from '../ActivityCreate/ActivityCreate.types';
import type { TableParams } from '../TableProvider/TableProvider';

/**
 * Transform API response to table item format for ChooseActivityModelModal
 * @param model - Activity model from API response
 * @returns Formatted model for table display
 */
const transformActivityModelToTableItem = (
  model: ActivityModelResponse
): ActivityModelTableItem => {
  return {
    id: model.id,
    title: model.title || 'Sem título',
    savedAt: dayjs(model.createdAt).format('DD/MM/YYYY'),
    subject: model.subject || null,
    subjectId: model.subject?.id ?? model.subjectId,
  };
};

export interface ChooseActivityModelModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Callback when a model is selected */
  onSelectModel: (model: ActivityModelTableItem) => void;
  /** API client for making requests */
  apiClient: BaseApiClient;
}

/**
 * Modal for choosing an activity model from the list
 * Displays a table with activity models that can be selected
 */
type ModalView = 'list' | 'details';

export const ChooseActivityModelModal = ({
  isOpen,
  onClose,
  onSelectModel,
  apiClient,
}: ChooseActivityModelModalProps) => {
  const [currentView, setCurrentView] = useState<ModalView>('list');
  const [selectedModel, setSelectedModel] =
    useState<ActivityModelTableItem | null>(null);
  const [models, setModels] = useState<ActivityModelTableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activityDetails, setActivityDetails] = useState<ActivityData | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleParamsChange = useCallback(
    async (params: TableParams) => {
      setLoading(true);
      try {
        const filters: ActivityModelFilters = {
          page: params.page,
          limit: params.limit,
          search: params.search,
          type: ActivityDraftType.MODELO,
        };

        const response = await apiClient.get<ActivityModelsApiResponse>(
          '/activity-drafts',
          {
            params: filters as Record<string, unknown>,
          }
        );

        // Transform API response to table items
        const tableItems = response.data.data.activityDrafts.map(
          transformActivityModelToTableItem
        );

        setModels(tableItems);
      } catch (error) {
        console.error('Error fetching models:', error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    },
    [apiClient]
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedModel(null);
      setCurrentView('list');
      setActivityDetails(null);
      handleParamsChange({ page: 1, limit: 10 });
    }
  }, [isOpen, handleParamsChange]);

  const fetchActivityDetails = useCallback(
    async (activityId: string) => {
      setLoadingDetails(true);
      try {
        const response = await apiClient.get<
          { data: ActivityData } | ActivityData
        >(`/activity-drafts/${activityId}`);

        // Handle both response formats
        const data =
          'data' in response.data ? response.data.data : response.data;
        setActivityDetails(data);
        setCurrentView('details');
      } catch (error) {
        console.error('Error fetching activity details:', error);
        setActivityDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    },
    [apiClient]
  );

  const handleRowClick = useCallback(
    (row: ActivityModelTableItem) => {
      setSelectedModel(row);
      fetchActivityDetails(row.id);
    },
    [fetchActivityDetails]
  );

  const handleCancelDetails = useCallback(() => {
    // Fecha ambos os modais ao invés de voltar para a lista
    onClose();
    // Limpa o estado
    setCurrentView('list');
    setSelectedModel(null);
    setActivityDetails(null);
  }, [onClose]);

  const handleConfirmSelection = useCallback(() => {
    if (selectedModel) {
      onSelectModel(selectedModel);
      setSelectedModel(null);
      setActivityDetails(null);
      setCurrentView('list');
    }
  }, [selectedModel, onSelectModel]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        currentView === 'list'
          ? 'Adicionar atividade'
          : activityDetails?.title || 'Detalhes da atividade'
      }
      size="xl"
      footer={
        currentView === 'list' ? (
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancelDetails}>
              Cancelar
            </Button>
            <Button variant="solid" onClick={handleConfirmSelection}>
              Adicionar atividade
            </Button>
          </div>
        )
      }
    >
      {currentView === 'list' ? (
        <ActivityModelsList
          models={models}
          loading={loading}
          onParamsChange={handleParamsChange}
          onRowClick={handleRowClick}
        />
      ) : (
        <ActivityModelDetails
          activityDetails={activityDetails}
          loading={loadingDetails}
        />
      )}
    </Modal>
  );
};
