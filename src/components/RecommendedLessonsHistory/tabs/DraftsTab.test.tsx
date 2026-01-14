import { render, screen, waitFor } from '@testing-library/react';
import { GoalDraftsTab } from './DraftsTab';
import type { GoalModelsApiResponse } from '../../../types/recommendedLessons';

// Mock dependencies
jest.mock('../../shared/ModelsTabBase', () => ({
  ModelsTabBase: ({
    config,
    onCreateModel,
  }: {
    config: {
      testId: string;
      emptyStateTitle: string;
      searchPlaceholder: string;
    };
    onCreateModel: () => void;
  }) => (
    <div data-testid={config.testId}>
      <span data-testid="empty-state-title">{config.emptyStateTitle}</span>
      <span data-testid="search-placeholder">{config.searchPlaceholder}</span>
      <button onClick={onCreateModel} data-testid="create-button">
        Create
      </button>
    </div>
  ),
  createModelsTableColumnsBase: jest.fn(() => []),
}));

describe('GoalDraftsTab', () => {
  const mockFetchGoalDrafts = jest
    .fn<Promise<GoalModelsApiResponse>, []>()
    .mockResolvedValue({
      message: 'Success',
      data: { drafts: [], total: 0 },
    });

  const mockDeleteGoalDraft = jest.fn<Promise<void>, [string]>();
  const mockOnCreateDraft = jest.fn();
  const mockOnSendDraft = jest.fn();
  const mockOnEditDraft = jest.fn();

  const defaultProps = {
    fetchGoalDrafts: mockFetchGoalDrafts,
    deleteGoalDraft: mockDeleteGoalDraft,
    onCreateDraft: mockOnCreateDraft,
    onSendDraft: mockOnSendDraft,
    onEditDraft: mockOnEditDraft,
    emptyStateImage: '/test-image.png',
    noSearchImage: '/no-search.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with correct test id', () => {
    render(<GoalDraftsTab {...defaultProps} />);

    expect(screen.getByTestId('goal-drafts-tab')).toBeInTheDocument();
  });

  it('should render with correct empty state title', () => {
    render(<GoalDraftsTab {...defaultProps} />);

    expect(screen.getByTestId('empty-state-title')).toHaveTextContent(
      'Você não tem aulas recomendadas em rascunho'
    );
  });

  it('should render with correct search placeholder', () => {
    render(<GoalDraftsTab {...defaultProps} />);

    expect(screen.getByTestId('search-placeholder')).toHaveTextContent(
      'Buscar rascunho'
    );
  });

  it('should call onCreateDraft when create button is clicked', async () => {
    render(<GoalDraftsTab {...defaultProps} />);

    const createButton = screen.getByTestId('create-button');
    createButton.click();

    await waitFor(() => {
      expect(mockOnCreateDraft).toHaveBeenCalledTimes(1);
    });
  });

  it('should pass optional props correctly', () => {
    const subjectsMap = new Map([['subject-1', 'Matemática']]);
    const userFilterData = {
      schools: [],
      classes: [],
      subjects: [{ id: 'subject-1', name: 'Matemática' }],
    };

    render(
      <GoalDraftsTab
        {...defaultProps}
        subjectsMap={subjectsMap}
        userFilterData={userFilterData}
      />
    );

    expect(screen.getByTestId('goal-drafts-tab')).toBeInTheDocument();
  });

  it('should render without optional callbacks', () => {
    const propsWithoutOptionals = {
      fetchGoalDrafts: mockFetchGoalDrafts,
      deleteGoalDraft: mockDeleteGoalDraft,
      onCreateDraft: mockOnCreateDraft,
    };

    render(<GoalDraftsTab {...propsWithoutOptionals} />);

    expect(screen.getByTestId('goal-drafts-tab')).toBeInTheDocument();
  });
});
