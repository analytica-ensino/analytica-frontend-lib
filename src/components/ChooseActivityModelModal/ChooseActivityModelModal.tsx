import { useState, useMemo, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Modal, TableProvider, Button, IconRender, Text } from '../../index';
import { createModelsTableColumnsBase } from '../shared/ModelsTabBase/createModelsTableColumnsBase';
import type { BaseApiClient } from '../../types/api';
import type {
  ActivityModelTableItem,
  ActivityModelFilters,
  ActivityModelsApiResponse,
  ActivityModelResponse,
  SubjectData,
} from '../../types/activitiesHistory';
import { ActivityDraftType } from '../../types/activitiesHistory';
import type { SubjectEnum } from '../../enums/SubjectEnum';
import type { TableParams, ColumnConfig } from '../TableProvider/TableProvider';

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
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum?: (subjectName: string) => SubjectEnum | null;
}

/**
 * Modal for choosing an activity model from the list
 * Displays a table with activity models that can be selected
 */
export const ChooseActivityModelModal = ({
  isOpen,
  onClose,
  onSelectModel,
  apiClient,
  mapSubjectNameToEnum,
}: ChooseActivityModelModalProps) => {
  const [selectedModel, setSelectedModel] =
    useState<ActivityModelTableItem | null>(null);
  const [models, setModels] = useState<ActivityModelTableItem[]>([]);
  const [loading, setLoading] = useState(false);

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
      handleParamsChange({ page: 1, limit: 10 });
    }
  }, [isOpen, handleParamsChange]);

  const handleRowClick = useCallback((row: ActivityModelTableItem) => {
    setSelectedModel(row);
  }, []);

  const handleSelect = useCallback(() => {
    if (selectedModel) {
      onSelectModel(selectedModel);
      setSelectedModel(null);
    }
  }, [selectedModel, onSelectModel]);

  // Create table columns without actions column
  const tableColumns = useMemo<ColumnConfig<ActivityModelTableItem>[]>(() => {
    const baseColumns = createModelsTableColumnsBase<ActivityModelTableItem>(
      mapSubjectNameToEnum,
      undefined, // No send button
      undefined, // No edit button
      () => {}, // No delete button
      {
        sendButtonLabel: '',
        sendButtonAriaLabel: '',
        deleteButtonAriaLabel: '',
        editButtonAriaLabel: '',
      }
    );

    // Replace subject column to handle SubjectData object
    const columnsWithoutSubject = baseColumns.filter(
      (col) => col.key !== 'actions' && col.key !== 'subject'
    );

    return columnsWithoutSubject.concat([
      {
        key: 'subject',
        label: 'Matéria',
        sortable: true,
        className: 'max-w-[160px]',
        render: (value: unknown) => {
          const subject = value as SubjectData | null;
          if (!subject) {
            return (
              <Text size="sm" color="text-text-400">
                -
              </Text>
            );
          }

          return (
            <div
              className="flex items-center gap-2"
              title={subject.subjectName}
            >
              <span
                className="w-[21px] h-[21px] flex items-center justify-center rounded-sm text-text-950 shrink-0"
                style={{ backgroundColor: subject.subjectColor }}
              >
                <IconRender
                  iconName={subject.subjectIcon}
                  size={17}
                  color="currentColor"
                />
              </span>
              <Text size="sm" className="truncate">
                {subject.subjectName}
              </Text>
            </div>
          );
        },
      },
    ]);
  }, [mapSubjectNameToEnum]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar atividade"
      size="xl"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="solid"
            onClick={handleSelect}
            disabled={!selectedModel}
          >
            Selecionar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <TableProvider
          data={models}
          headers={tableColumns}
          loading={loading}
          enableSearch
          enablePagination
          enableRowClick
          searchPlaceholder="Buscar modelo"
          onParamsChange={handleParamsChange}
          onRowClick={handleRowClick}
          rowKey="id"
        />
      </div>
    </Modal>
  );
};
