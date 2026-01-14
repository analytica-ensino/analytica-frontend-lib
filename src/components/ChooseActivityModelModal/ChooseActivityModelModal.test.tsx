import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChooseActivityModelModal } from './ChooseActivityModelModal';
import type { ActivityModelResponse } from '../../types/activitiesHistory';
import { ActivityDraftType } from '../../types/activitiesHistory';
import type { BaseApiClient } from '../../types/api';

// Mock data
const mockModels: ActivityModelResponse[] = [
  {
    id: '1',
    type: ActivityDraftType.MODELO,
    title: 'Test Activity 1',
    creatorUserInstitutionId: 'user-1',
    subjectId: 'bio-1',
    subject: {
      id: 'bio-1',
      subjectName: 'Biologia',
      subjectIcon: 'Microscope',
      subjectColor: '#00A651',
    },
    filters: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    type: ActivityDraftType.MODELO,
    title: 'Test Activity 2',
    creatorUserInstitutionId: 'user-1',
    subjectId: 'art-1',
    subject: {
      id: 'art-1',
      subjectName: 'Artes',
      subjectIcon: 'PaintBrush',
      subjectColor: '#FF6B6B',
    },
    filters: null,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const createMockApiClient = (): BaseApiClient => ({
  get: jest.fn().mockImplementation(async () => {
    return {
      data: {
        message: 'Success',
        data: {
          activityDrafts: mockModels,
          total: mockModels.length,
        },
      },
    };
  }) as BaseApiClient['get'],
  post: jest.fn() as BaseApiClient['post'],
  patch: jest.fn() as BaseApiClient['patch'],
  delete: jest.fn() as BaseApiClient['delete'],
});

describe('ChooseActivityModelModal', () => {
  const mockApiClient = createMockApiClient();
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSelectModel: jest.fn(),
    apiClient: mockApiClient,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    expect(screen.getByText('Adicionar atividade')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(<ChooseActivityModelModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Adicionar atividade')).not.toBeInTheDocument();
  });

  it('should call apiClient.get when modal opens', async () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activity-drafts',
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            limit: 10,
          }),
        })
      );
    });
  });

  it('should display activity models in table', async () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Activity 1')).toBeInTheDocument();
      expect(screen.getByText('Test Activity 2')).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button is clicked', async () => {
    const onClose = jest.fn();
    render(<ChooseActivityModelModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByText('Cancelar');
    await userEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should display activity models in table with clickable rows', async () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Activity 1')).toBeInTheDocument();
      expect(screen.getByText('Test Activity 2')).toBeInTheDocument();
    });

    const row = screen.getByText('Test Activity 1').closest('tr');
    expect(row).toBeInTheDocument();
  });

  it('should call onSelectModel when row is clicked', async () => {
    const onSelectModel = jest.fn();
    render(
      <ChooseActivityModelModal
        {...defaultProps}
        onSelectModel={onSelectModel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Activity 1')).toBeInTheDocument();
    });

    const row = screen.getByText('Test Activity 1').closest('tr');
    if (row) {
      await userEvent.click(row);
    }

    await waitFor(() => {
      expect(onSelectModel).toHaveBeenCalled();
    });
  });

  it('should filter models when search is used', async () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Activity 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar');
    await userEvent.type(searchInput, 'Activity 1');

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/activity-drafts',
        expect.objectContaining({
          params: expect.objectContaining({
            search: 'Activity 1',
          }),
        })
      );
    });
  });
});
