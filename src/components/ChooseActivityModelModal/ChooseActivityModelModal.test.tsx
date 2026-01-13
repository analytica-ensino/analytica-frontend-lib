import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChooseActivityModelModal } from './ChooseActivityModelModal';
import type {
  ActivityModelTableItem,
  ActivityModelFilters,
  ActivityModelsApiResponse,
} from '../../types/activitiesHistory';

// Mock data
const mockModels: Array<ActivityModelTableItem & { type?: string }> = [
  {
    id: '1',
    title: 'Test Activity 1',
    savedAt: '01/01/2024',
    subject: 'Biologia',
    subjectId: 'bio-1',
    type: 'PROVA',
  },
  {
    id: '2',
    title: 'Test Activity 2',
    savedAt: '02/01/2024',
    subject: 'Artes',
    subjectId: 'art-1',
    type: 'TRABALHO',
  },
];

const mockFetchActivityModels = jest.fn(
  async (
    filters?: ActivityModelFilters
  ): Promise<ActivityModelsApiResponse> => {
    return {
      message: 'Success',
      data: {
        activityDrafts: mockModels as ActivityModelTableItem[],
        total: mockModels.length,
      },
    };
  }
);

describe('ChooseActivityModelModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSelectModel: jest.fn(),
    fetchActivityModels: mockFetchActivityModels,
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

    expect(
      screen.queryByText('Adicionar atividade')
    ).not.toBeInTheDocument();
  });

  it('should call fetchActivityModels when modal opens', async () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetchActivityModels).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
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

  it('should disable select button when no model is selected', async () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    await waitFor(() => {
      const selectButton = screen.getByText('Selecionar');
      expect(selectButton).toBeDisabled();
    });
  });

  it('should enable select button when a model is selected', async () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Activity 1')).toBeInTheDocument();
    });

    const row = screen.getByText('Test Activity 1').closest('tr');
    if (row) {
      await userEvent.click(row);
    }

    await waitFor(() => {
      const selectButton = screen.getByText('Selecionar');
      expect(selectButton).not.toBeDisabled();
    });
  });

  it('should call onSelectModel when select button is clicked', async () => {
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
      const selectButton = screen.getByText('Selecionar');
      expect(selectButton).not.toBeDisabled();
    });

    const selectButton = screen.getByText('Selecionar');
    await userEvent.click(selectButton);

    expect(onSelectModel).toHaveBeenCalledWith(mockModels[0]);
  });

  it('should filter models when search is used', async () => {
    render(<ChooseActivityModelModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Activity 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar modelo');
    await userEvent.type(searchInput, 'Activity 1');

    await waitFor(() => {
      expect(mockFetchActivityModels).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Activity 1',
        })
      );
    });
  });
});

