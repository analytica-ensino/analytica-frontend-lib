import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ActivityApiStatus,
  ActivityDraftType,
} from '../../types/activitiesHistory';
import type {
  ActivitiesHistoryApiResponse,
  ActivityModelsApiResponse,
} from '../../types/activitiesHistory';

// Mock ActivityFilters component to avoid QUESTION_TYPE issues
jest.mock('../ActivityFilters/ActivityFilters', () => ({
  ActivityFilters: () => <div data-testid="activity-filters-mock" />,
  ActivityFiltersPopover: () => (
    <div data-testid="activity-filters-popover-mock" />
  ),
}));

// Import after mocks are set up
import { ActivitiesHistory } from './ActivitiesHistory';
import type { ActivitiesHistoryProps } from './ActivitiesHistory';

// Mock the Toast hook
const mockAddToast = jest.fn();
jest.mock('../Toast/utils/Toaster', () => ({
  __esModule: true,
  default: () => <div data-testid="toaster" />,
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock SubjectInfo
jest.mock('../SubjectInfo/SubjectInfo', () => ({
  getSubjectInfo: () => ({
    colorClass: 'bg-blue-100',
    icon: <span>📚</span>,
  }),
}));

describe('ActivitiesHistory', () => {
  const mockFetchActivitiesHistory = jest.fn<
    Promise<ActivitiesHistoryApiResponse>,
    []
  >();
  const mockFetchActivityModels = jest.fn<
    Promise<ActivityModelsApiResponse>,
    []
  >();
  const mockDeleteActivityModel = jest.fn<Promise<void>, [string]>();
  const mockOnCreateActivity = jest.fn();
  const mockOnCreateModel = jest.fn();
  const mockOnRowClick = jest.fn();
  const mockOnSendActivity = jest.fn();
  const mockOnEditModel = jest.fn();

  const defaultProps: ActivitiesHistoryProps = {
    fetchActivitiesHistory: mockFetchActivitiesHistory,
    fetchActivityModels: mockFetchActivityModels,
    deleteActivityModel: mockDeleteActivityModel,
    onCreateActivity: mockOnCreateActivity,
    onCreateModel: mockOnCreateModel,
    onRowClick: mockOnRowClick,
    onSendActivity: mockOnSendActivity,
    onEditModel: mockOnEditModel,
    emptyStateImage: '/empty.png',
    noSearchImage: '/no-search.png',
  };

  const validActivitiesResponse: ActivitiesHistoryApiResponse = {
    message: 'Success',
    data: {
      activities: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Activity',
          startDate: '2024-06-01',
          finalDate: '2024-12-31',
          status: ActivityApiStatus.A_VENCER,
          completionPercentage: 75,
          subjectId: '123e4567-e89b-12d3-a456-426614174001',
          schoolName: 'Escola Teste',
          year: '2024',
          className: 'Turma A',
          subjectName: 'Matemática',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  };

  const validModelsResponse: ActivityModelsApiResponse = {
    message: 'Success',
    data: {
      activityDrafts: [
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          type: ActivityDraftType.MODELO,
          title: 'Test Model',
          creatorUserInstitutionId: '123e4567-e89b-12d3-a456-426614174003',
          subjectId: '123e4567-e89b-12d3-a456-426614174001',
          filters: null,
          createdAt: '2024-06-01T10:00:00Z',
          updatedAt: '2024-06-15T14:30:00Z',
        },
      ],
      total: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchActivitiesHistory.mockResolvedValue(validActivitiesResponse);
    mockFetchActivityModels.mockResolvedValue(validModelsResponse);
    mockDeleteActivityModel.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render with history tab active by default', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('activities-history')).toBeInTheDocument();
      });

      expect(screen.getByText('Histórico de atividades')).toBeInTheDocument();
    });

    it('should render page title correctly', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Histórico de atividades')).toBeInTheDocument();
      });
    });

    it('should render tabs menu', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('menu-item-history')).toBeInTheDocument();
        expect(screen.getByTestId('menu-item-drafts')).toBeInTheDocument();
        expect(screen.getByTestId('menu-item-models')).toBeInTheDocument();
      });
    });

    it('should render create activity button', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /criar atividade/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Tab navigation', () => {
    it('should switch to drafts tab', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('menu-item-drafts')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('menu-item-drafts'));

      await waitFor(() => {
        expect(
          screen.getByText('Rascunhos em desenvolvimento')
        ).toBeInTheDocument();
      });
    });

    it('should switch to models tab', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('menu-item-models')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('menu-item-models'));

      await waitFor(() => {
        expect(screen.getByText('Modelos de atividades')).toBeInTheDocument();
      });
    });

    it('should change page title on tab change', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Histórico de atividades')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('menu-item-models'));

      await waitFor(() => {
        expect(screen.getByText('Modelos de atividades')).toBeInTheDocument();
      });
    });
  });

  describe('History tab', () => {
    it('should call onCreateActivity when button clicked', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /criar atividade/i });
        expect(btn).toBeInTheDocument();
      });

      const createBtn = screen.getByRole('button', {
        name: /criar atividade/i,
      });
      fireEvent.click(createBtn);

      expect(mockOnCreateActivity).toHaveBeenCalled();
    });

    it('should call fetchActivitiesHistory on mount', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetchActivitiesHistory).toHaveBeenCalled();
      });
    });
  });

  describe('Models tab', () => {
    it('should call onCreateModel when button clicked', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      fireEvent.click(screen.getByTestId('menu-item-models'));

      await waitFor(() => {
        expect(screen.getByTestId('activity-models-tab')).toBeInTheDocument();
      });

      const createModelButtons = screen.getAllByRole('button', {
        name: /criar modelo/i,
      });
      fireEvent.click(createModelButtons[0]);

      expect(mockOnCreateModel).toHaveBeenCalled();
    });

    it('should call fetchActivityModels when models tab is active', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      fireEvent.click(screen.getByTestId('menu-item-models'));

      await waitFor(() => {
        expect(mockFetchActivityModels).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    it('should display error state for history tab', async () => {
      mockFetchActivitiesHistory.mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('Erro ao carregar histórico de atividades')
        ).toBeInTheDocument();
      });
    });

    it('should display error state for models tab', async () => {
      mockFetchActivityModels.mockRejectedValue(new Error('Network error'));

      render(<ActivitiesHistory {...defaultProps} />);

      fireEvent.click(screen.getByTestId('menu-item-models'));

      await waitFor(
        () => {
          expect(
            screen.getByText('Erro ao carregar modelos de atividades')
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('User filter data', () => {
    it('should pass userFilterData to component', async () => {
      const userFilterData = {
        schools: [
          { id: 'school-1', name: 'Escola 1' },
          { id: 'school-2', name: 'Escola 2' },
        ],
        subjects: [
          { id: 'subject-1', name: 'Matemática' },
          { id: 'subject-2', name: 'Português' },
        ],
      };

      render(
        <ActivitiesHistory {...defaultProps} userFilterData={userFilterData} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('activities-history')).toBeInTheDocument();
      });
    });
  });

  describe('Subjects map', () => {
    it('should pass subjectsMap to component', async () => {
      const subjectsMap = new Map([
        ['subject-1', 'Matemática'],
        ['subject-2', 'Português'],
      ]);

      render(<ActivitiesHistory {...defaultProps} subjectsMap={subjectsMap} />);

      await waitFor(() => {
        expect(screen.getByTestId('activities-history')).toBeInTheDocument();
      });
    });
  });

  describe('Status display', () => {
    it('should display activities with correct status mapping', async () => {
      const responseWithAllStatuses: ActivitiesHistoryApiResponse = {
        message: 'Success',
        data: {
          activities: [
            {
              id: '1',
              title: 'Activity 1',
              startDate: '2024-01-01',
              finalDate: '2024-12-31',
              status: ActivityApiStatus.A_VENCER,
              completionPercentage: 50,
              subjectId: 'sub-1',
              schoolName: 'School',
              year: '2024',
              className: 'Class',
              subjectName: 'Math',
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      };

      mockFetchActivitiesHistory.mockResolvedValue(responseWithAllStatuses);

      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetchActivitiesHistory).toHaveBeenCalled();
      });
    });
  });

  describe('Drafts tab', () => {
    it('should show development message in drafts tab', async () => {
      render(<ActivitiesHistory {...defaultProps} />);

      fireEvent.click(screen.getByTestId('menu-item-drafts'));

      await waitFor(() => {
        expect(
          screen.getByText('Rascunhos em desenvolvimento')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Optional callbacks', () => {
    it('should render without onSendActivity', async () => {
      const propsWithoutSend = {
        ...defaultProps,
        onSendActivity: undefined,
      };

      render(<ActivitiesHistory {...propsWithoutSend} />);

      await waitFor(() => {
        expect(screen.getByTestId('activities-history')).toBeInTheDocument();
      });
    });

    it('should render without onEditModel', async () => {
      const propsWithoutEdit = {
        ...defaultProps,
        onEditModel: undefined,
      };

      render(<ActivitiesHistory {...propsWithoutEdit} />);

      await waitFor(() => {
        expect(screen.getByTestId('activities-history')).toBeInTheDocument();
      });
    });

    it('should render without mapSubjectNameToEnum', async () => {
      const propsWithoutMap = {
        ...defaultProps,
        mapSubjectNameToEnum: undefined,
      };

      render(<ActivitiesHistory {...propsWithoutMap} />);

      await waitFor(() => {
        expect(screen.getByTestId('activities-history')).toBeInTheDocument();
      });
    });
  });

  describe('Empty states', () => {
    it('should show empty state when no activities', async () => {
      const emptyResponse: ActivitiesHistoryApiResponse = {
        message: 'Success',
        data: {
          activities: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };

      mockFetchActivitiesHistory.mockResolvedValue(emptyResponse);

      render(<ActivitiesHistory {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('Incentive sua turma ao aprendizado')
        ).toBeInTheDocument();
      });
    });

    it('should show empty state when no models', async () => {
      const emptyModelsResponse: ActivityModelsApiResponse = {
        message: 'Success',
        data: {
          activityDrafts: [],
          total: 0,
        },
      };

      mockFetchActivityModels.mockResolvedValue(emptyModelsResponse);

      render(<ActivitiesHistory {...defaultProps} />);

      fireEvent.click(screen.getByTestId('menu-item-models'));

      await waitFor(() => {
        expect(
          screen.getByText('Crie modelos para agilizar suas atividades')
        ).toBeInTheDocument();
      });
    });
  });
});
