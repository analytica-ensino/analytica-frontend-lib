import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ChooseActivityModelModal } from './ChooseActivityModelModal';
import type { BaseApiClient } from '../../types/api';
import type {
  ActivityModelTableItem,
  ActivityModelsApiResponse,
} from '../../types/activitiesHistory';
import { ActivityDraftType } from '../../types/activitiesHistory';
import type { ActivityData } from '../ActivityCreate/ActivityCreate.types';
import { ActivityType } from '../ActivityCreate/ActivityCreate.types';
import type { TableParams } from '../TableProvider/TableProvider';

// Mock do Modal
jest.mock('../../index', () => ({
  Modal: ({
    isOpen,
    title,
    size,
    footer,
    children,
  }: {
    isOpen: boolean;
    title: string;
    size: string;
    footer: React.ReactNode;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-size">{size}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null,
  Button: ({
    children,
    variant,
    onClick,
  }: {
    children: React.ReactNode;
    variant: string;
    onClick: () => void;
  }) => (
    <button data-testid={`button-${variant}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock do ActivityModelsList
jest.mock('./components/ActivityModelsList', () => ({
  ActivityModelsList: ({
    models,
    loading,
    onParamsChange,
    onRowClick,
  }: {
    models: ActivityModelTableItem[];
    loading: boolean;
    onParamsChange: (params: TableParams) => void;
    onRowClick: (model: ActivityModelTableItem) => void;
  }) => (
    <div data-testid="activity-models-list">
      <div data-testid="list-loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="list-models-count">{models.length}</div>
      {models.map((model) => (
        <div
          key={model.id}
          data-testid={`model-${model.id}`}
          onClick={() => onRowClick(model)}
        >
          {model.title}
        </div>
      ))}
      <button
        data-testid="trigger-params-change"
        onClick={() => onParamsChange({ page: 1, limit: 10 })}
      >
        Change Params
      </button>
    </div>
  ),
}));

// Mock do ActivityModelDetails
jest.mock('./components/ActivityModelDetails', () => ({
  ActivityModelDetails: ({
    activityDetails,
    loading,
  }: {
    activityDetails: ActivityData | null;
    loading: boolean;
  }) => (
    <div data-testid="activity-model-details">
      <div data-testid="details-loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="details-title">
        {activityDetails?.title || 'no-title'}
      </div>
    </div>
  ),
}));

// Mock do dayjs
jest.mock('dayjs', () => {
  const mockDayjs = (date?: string) => ({
    format: (format: string) => {
      if (format === 'DD/MM/YYYY') return '01/01/2024';
      return date || '';
    },
  });
  return mockDayjs;
});

describe('ChooseActivityModelModal', () => {
  const mockModelsResponse: ActivityModelsApiResponse = {
    message: 'Success',
    data: {
      activityDrafts: [
        {
          id: 'model-1',
          type: ActivityDraftType.MODELO,
          title: 'Model 1',
          creatorUserInstitutionId: 'user-1',
          subjectId: 's1',
          subject: {
            id: 's1',
            name: 'Mathematics',
            icon: 'Calculator',
            color: '#FF5733',
          },
          filters: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'model-2',
          type: ActivityDraftType.MODELO,
          title: 'Model 2',
          creatorUserInstitutionId: 'user-1',
          subjectId: 's2',
          subject: {
            id: 's2',
            name: 'Portuguese',
            icon: 'BookOpen',
            color: '#3357FF',
          },
          filters: null,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ],
      total: 2,
    },
  };

  const mockActivityDetails: ActivityData = {
    id: 'model-1',
    type: ActivityType.MODELO,
    title: 'Model 1 Details',
    subjectId: 's1',
    filters: {},
    questionIds: ['q1', 'q2'],
    selectedQuestions: [],
  };

  const mockApiClient: BaseApiClient = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSelectModel: jest.fn(),
    apiClient: mockApiClient,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockApiClient.get as jest.Mock).mockResolvedValue({
      data: mockModelsResponse,
    });
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<ChooseActivityModelModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });
    });

    it('should render with correct title for list view', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
          'Adicionar atividade'
        );
      });
    });

    it('should render with correct size', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('modal-size')).toHaveTextContent('xl');
      });
    });

    it('should render ActivityModelsList initially', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('activity-models-list')).toBeInTheDocument();
      });
    });
  });

  describe('initial data fetch', () => {
    it('should fetch models when modal opens', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/activity-drafts', {
          params: {
            page: 1,
            limit: 10,
            type: 'MODELO',
          },
        });
      });
    });

    it('should display fetched models', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('list-models-count')).toHaveTextContent('2');
        expect(screen.getByTestId('model-model-1')).toBeInTheDocument();
        expect(screen.getByTestId('model-model-2')).toBeInTheDocument();
      });
    });

    it('should handle API error gracefully', async () => {
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      );
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('list-models-count')).toHaveTextContent('0');
      });

      consoleError.mockRestore();
    });
  });

  describe('list view', () => {
    it('should show cancel button in footer', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('button-outline')).toHaveTextContent(
          'Cancelar'
        );
      });
    });

    it('should call onClose when cancel button is clicked', async () => {
      const onClose = jest.fn();
      render(<ChooseActivityModelModal {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        const cancelButton = screen.getByTestId('button-outline');
        fireEvent.click(cancelButton);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should refetch models when params change', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      const triggerButton = screen.getByTestId('trigger-params-change');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('row click and details view', () => {
    it('should fetch details when row is clicked', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: mockActivityDetails });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('model-model-1'));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/activity-drafts/model-1'
        );
      });
    });

    it('should switch to details view after clicking row', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: mockActivityDetails });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('model-model-1'));

      await waitFor(() => {
        expect(
          screen.getByTestId('activity-model-details')
        ).toBeInTheDocument();
      });
    });

    it('should show activity title in modal title when in details view', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: mockActivityDetails });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('model-model-1'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
          'Model 1 Details'
        );
      });
    });

    it('should handle API response with nested data property', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: { data: mockActivityDetails } });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('model-model-1'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('details-title')).toHaveTextContent(
          'Model 1 Details'
        );
      });
    });

    it('should handle error when fetching details', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockRejectedValueOnce(new Error('Details API Error'));

      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('model-model-1'));

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/activity-drafts/model-1'
        );
      });

      // Should remain in list view when there's an error fetching details
      await waitFor(() => {
        expect(screen.getByTestId('activity-models-list')).toBeInTheDocument();
        expect(
          screen.queryByTestId('activity-model-details')
        ).not.toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('details view footer', () => {
    beforeEach(async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: mockActivityDetails });
    });

    it('should show cancel and confirm buttons in details view', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('model-model-1'));
      });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
        expect(screen.getByText('Adicionar atividade')).toBeInTheDocument();
      });
    });

    it('should close modal when cancel is clicked in details view', async () => {
      const onClose = jest.fn();
      render(<ChooseActivityModelModal {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('model-model-1'));
      });

      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancelar');
        fireEvent.click(cancelButtons[0]);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectModel when confirm is clicked', async () => {
      const onSelectModel = jest.fn();
      render(
        <ChooseActivityModelModal
          {...defaultProps}
          onSelectModel={onSelectModel}
        />
      );

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('model-model-1'));
      });

      await waitFor(() => {
        const confirmButton = screen.getByText('Adicionar atividade');
        fireEvent.click(confirmButton);
      });

      expect(onSelectModel).toHaveBeenCalledTimes(1);
      expect(onSelectModel).toHaveBeenCalledWith({
        id: 'model-1',
        title: 'Model 1',
        savedAt: '01/01/2024',
        subject: mockModelsResponse.data.activityDrafts[0].subject,
        subjectId: 's1',
        type: ActivityDraftType.MODELO,
      });
    });

    it('should not call onSelectModel if no model is selected', async () => {
      const onSelectModel = jest.fn();
      render(
        <ChooseActivityModelModal
          {...defaultProps}
          onSelectModel={onSelectModel}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      // No model selected, confirm button should not be available in list view
      expect(screen.queryByTestId('button-solid')).not.toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    it('should show loading state while fetching models', async () => {
      let resolvePromise: (value: { data: ActivityModelsApiResponse }) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (mockApiClient.get as jest.Mock).mockReturnValueOnce(promise);

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('list-loading')).toHaveTextContent('loading');
      });

      resolvePromise!({ data: mockModelsResponse });

      await waitFor(() => {
        expect(screen.getByTestId('list-loading')).toHaveTextContent('loaded');
      });
    });

    it('should complete loading after details are fetched', async () => {
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: mockActivityDetails });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('model-model-1'));

      // Should eventually show the details view with loaded state
      await waitFor(() => {
        expect(
          screen.getByTestId('activity-model-details')
        ).toBeInTheDocument();
        expect(screen.getByTestId('details-loading')).toHaveTextContent(
          'loaded'
        );
      });
    });
  });

  describe('modal state reset', () => {
    it('should reset state when modal is opened', async () => {
      const { rerender } = render(
        <ChooseActivityModelModal {...defaultProps} isOpen={false} />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      rerender(<ChooseActivityModelModal {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('activity-models-list')).toBeInTheDocument();
      });
    });

    it('should refetch models when modal reopens', async () => {
      const { rerender } = render(
        <ChooseActivityModelModal {...defaultProps} isOpen={true} />
      );

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      rerender(<ChooseActivityModelModal {...defaultProps} isOpen={false} />);
      rerender(<ChooseActivityModelModal {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('data transformation', () => {
    it('should transform model with title', async () => {
      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toHaveTextContent(
          'Model 1'
        );
      });
    });

    it('should handle model without title', async () => {
      const responseWithoutTitle: ActivityModelsApiResponse = {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              ...mockModelsResponse.data.activityDrafts[0],
              title: null,
            },
          ],
          total: 1,
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: responseWithoutTitle,
      });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toHaveTextContent(
          'Sem título'
        );
      });
    });

    it('should handle model without subject', async () => {
      const responseWithoutSubject: ActivityModelsApiResponse = {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              ...mockModelsResponse.data.activityDrafts[0],
              subject: null,
              subjectId: null,
            },
          ],
          total: 1,
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: responseWithoutSubject,
      });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toBeInTheDocument();
      });
    });

    it('should handle model with RASCUNHO type', async () => {
      const responseWithRascunhoType: ActivityModelsApiResponse = {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              ...mockModelsResponse.data.activityDrafts[0],
              type: ActivityDraftType.RASCUNHO,
            },
          ],
          total: 1,
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: responseWithRascunhoType,
      });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toBeInTheDocument();
      });
    });

    it('should use subjectId from model when subject is null', async () => {
      const responseWithSubjectIdOnly: ActivityModelsApiResponse = {
        message: 'Success',
        data: {
          activityDrafts: [
            {
              ...mockModelsResponse.data.activityDrafts[0],
              subject: null,
              subjectId: 'fallback-subject-id',
            },
          ],
          total: 1,
        },
      };

      (mockApiClient.get as jest.Mock).mockResolvedValueOnce({
        data: responseWithSubjectIdOnly,
      });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('model-model-1')).toBeInTheDocument();
      });
    });
  });

  describe('search functionality', () => {
    it('should pass search parameter to API', async () => {
      // Update mock to capture params with search
      const mockGet = jest.fn().mockResolvedValue({ data: mockModelsResponse });
      const apiClientWithSearch = {
        ...mockApiClient,
        get: mockGet,
      };

      render(
        <ChooseActivityModelModal
          {...defaultProps}
          apiClient={apiClientWithSearch}
        />
      );

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/activity-drafts', {
          params: expect.objectContaining({
            page: 1,
            limit: 10,
            type: 'MODELO',
          }),
        });
      });
    });
  });

  describe('cancel details view', () => {
    it('should close modal and reset state when cancel is clicked in details view', async () => {
      const onClose = jest.fn();
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: mockActivityDetails });

      render(<ChooseActivityModelModal {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('model-model-1'));
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('activity-model-details')
        ).toBeInTheDocument();
      });

      // Click cancel button in details view
      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirm selection reset', () => {
    it('should reset state after confirming selection', async () => {
      const onSelectModel = jest.fn();
      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: mockActivityDetails });

      render(
        <ChooseActivityModelModal
          {...defaultProps}
          onSelectModel={onSelectModel}
        />
      );

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('model-model-1'));
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('activity-model-details')
        ).toBeInTheDocument();
      });

      // Click confirm button
      const confirmButton = screen.getByText('Adicionar atividade');
      fireEvent.click(confirmButton);

      expect(onSelectModel).toHaveBeenCalledTimes(1);
    });
  });

  describe('fallback title in details view', () => {
    it('should show fallback title when activity details has no title', async () => {
      const detailsWithoutTitle = {
        ...mockActivityDetails,
        title: undefined,
      };

      (mockApiClient.get as jest.Mock)
        .mockResolvedValueOnce({ data: mockModelsResponse })
        .mockResolvedValueOnce({ data: detailsWithoutTitle });

      render(<ChooseActivityModelModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('model-model-1'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('modal-title')).toHaveTextContent(
          'Detalhes da atividade'
        );
      });
    });
  });
});
