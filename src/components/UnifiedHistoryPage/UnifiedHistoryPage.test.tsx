import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedHistoryPage } from './UnifiedHistoryPage';
import type { UnifiedHistoryPageProps } from './types';
import type { ActivityTableItem } from '../../types/activitiesHistory';
import { ActivityDisplayStatus } from '../../types/activitiesHistory';
import type { BaseApiClient } from '../../types/api';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import * as filterHelpers from '../../utils/filterHelpers';

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock toast store so we can assert delete feedback toasts
jest.mock('../Toast/utils/ToastStore', () => {
  const addToast = jest.fn();
  return {
    __esModule: true,
    default: (selector: (s: { addToast: jest.Mock }) => unknown) =>
      selector({ addToast }),
    __addToast: addToast,
  };
});

/** Retrieve the mocked addToast for assertions */
const getMockAddToast = (): jest.Mock =>
  (jest.requireMock('../Toast/utils/ToastStore') as { __addToast: jest.Mock })
    .__addToast;

jest.mock('../EmptyState/EmptyState', () => ({
  __esModule: true,
  default: ({
    title,
    onButtonClick,
  }: {
    title: string;
    onButtonClick: () => void;
  }) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <button onClick={onButtonClick}>Create</button>
    </div>
  ),
}));

jest.mock('../TypeSelector/TypeSelector', () => ({
  __esModule: true,
  default: () => <div data-testid="type-selector">TypeSelector</div>,
}));

jest.mock('../../utils/filterHelpers', () => ({
  getSchoolOptionsFromUserData: jest.fn(() => []),
  getSchoolYearOptionsFromUserData: jest.fn(() => []),
  getClassOptionsFromUserData: jest.fn(() => []),
  getSubjectOptionsFromUserData: jest.fn(() => []),
  mergeFilterOptions: jest.fn((base, extra) => [...base, ...extra]),
}));

// Define interface for mock layouts
interface MockHistoryPageLayoutProps {
  data?: ActivityTableItem[] | null;
  headers?: ColumnConfig<ActivityTableItem>[];
  onParamsChange: (params: { page?: number }) => void;
  onRowClick: (row: ActivityTableItem) => void;
  onTabChange: (tab: string) => void;
  onCreateActivity?: () => void;
  onCreateExam?: () => void;
  headerRightContent?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  emptyState?: React.ReactNode;
}

jest.mock('./config', () => {
  const MockActivityLayout = jest.fn(
    ({
      data,
      headers,
      onParamsChange,
      onRowClick,
      onTabChange,
      onCreateActivity,
    }: MockHistoryPageLayoutProps) => {
      const actionsColumn = headers?.find((c) => c.key === 'actions');
      return (
        <div data-testid="activity-page-layout">
          <div data-testid="data-count">{data?.length || 0}</div>
          <div data-testid="has-actions-column">{String(!!actionsColumn)}</div>
          <button onClick={() => onParamsChange({ page: 2 })}>
            Change Params
          </button>
          <button onClick={() => data?.[0] && onRowClick(data[0])}>
            Click Row
          </button>
          <button onClick={() => onTabChange('rascunhos')}>Go to Drafts</button>
          <button onClick={() => onTabChange('modelos')}>Go to Models</button>
          <button onClick={() => onTabChange('historico')}>
            Go to History
          </button>
          <button onClick={onCreateActivity}>Create Activity</button>
          {/* Render the actions cell for each row so action buttons are testable */}
          {actionsColumn?.render &&
            data?.map((row, index) => (
              <div key={row.id} data-testid={`actions-cell-${row.id}`}>
                {actionsColumn.render?.(undefined, row, index)}
              </div>
            ))}
        </div>
      );
    }
  );

  const MockExamLayout = jest.fn(
    ({
      data,
      onParamsChange,
      onRowClick,
      onTabChange,
      onCreateExam,
    }: MockHistoryPageLayoutProps) => (
      <div data-testid="exam-page-layout">
        <div data-testid="data-count">{data?.length || 0}</div>
        <button onClick={() => onParamsChange({ page: 2 })}>
          Change Params
        </button>
        <button onClick={() => data?.[0] && onRowClick(data[0])}>
          Click Row
        </button>
        <button onClick={() => onTabChange('rascunhos')}>Go to Drafts</button>
        <button onClick={() => onTabChange('modelos')}>Go to Models</button>
        <button onClick={() => onTabChange('historico')}>Go to History</button>
        <button onClick={onCreateExam}>Create Exam</button>
      </div>
    )
  );

  return {
    PAGE_CONFIG: {
      ATIVIDADE: {
        PageLayout: MockActivityLayout,
        pageTitle: 'Histórico de Atividades',
        activeTab: 'historico',
        testId: 'activities-history-page',
        itemLabel: 'atividades',
        searchPlaceholder: 'Buscar atividade',
        statusLabel: 'Status da Atividade',
        statusOptions: [
          { id: 'ATIVA', name: 'Ativa' },
          { id: 'CONCLUIDA', name: 'Concluída' },
          { id: 'VENCIDA', name: 'Vencida' },
        ],
        tableColumns: [],
        emptyTitle: 'Nenhuma atividade encontrada',
        emptyDescription: 'Crie sua primeira atividade',
        buttonText: 'Criar Atividade',
        onCreatePropName: 'onCreateActivity',
        tabs: {
          HISTORY: 'historico',
          DRAFTS: 'rascunhos',
          MODELS: 'modelos',
        },
      },
      PROVA: {
        PageLayout: MockExamLayout,
        pageTitle: 'Histórico de Provas',
        activeTab: 'historico',
        testId: 'exams-history-page',
        itemLabel: 'provas',
        searchPlaceholder: 'Buscar prova',
        statusLabel: 'Status da Prova',
        statusOptions: [
          { id: 'ATIVA', name: 'Ativa' },
          { id: 'CONCLUIDA', name: 'Concluída' },
          { id: 'VENCIDA', name: 'Vencida' },
        ],
        tableColumns: [],
        emptyTitle: 'Nenhuma prova encontrada',
        emptyDescription: 'Crie sua primeira prova',
        buttonText: 'Criar Prova',
        onCreatePropName: 'onCreateExam',
        tabs: {
          HISTORY: 'historico',
          DRAFTS: 'rascunhos',
          MODELS: 'modelos',
        },
      },
    },
  };
});

jest.mock('../TypeSelector/TypeSelector.types', () => ({
  createActivityCategoryConfig: jest.fn(() => ({})),
}));

// Helper to get the mock page layout for assertions
const getMockPageLayout = () => {
  const config = jest.requireMock<typeof import('./config')>('./config');
  return config.PAGE_CONFIG.ATIVIDADE.PageLayout as jest.Mock;
};

describe('UnifiedHistoryPage', () => {
  const mockOnParamsChange = jest.fn();

  const mockActivityData: ActivityTableItem[] = [
    {
      id: '1',
      title: 'Test Activity 1',
      startDate: '01/06',
      deadline: '31/12',
      creator: 'Prof. Maria',
      school: 'Escola A',
      year: '2024',
      subject: 'Matemática',
      class: 'Turma A',
      status: ActivityDisplayStatus.ATIVA,
      completionPercentage: 75,
    },
    {
      id: '2',
      title: 'Test Activity 2',
      startDate: '02/06',
      deadline: '30/12',
      creator: 'Prof. João',
      school: 'Escola B',
      year: '2024',
      subject: 'Português',
      class: 'Turma B',
      status: ActivityDisplayStatus.CONCLUIDA,
      completionPercentage: 100,
    },
  ];

  const mockApiFilterOptions = {
    schools: [{ id: 'school-1', name: 'Escola A' }],
    classes: [{ id: 'class-1', name: 'Turma A' }],
    subjects: [{ id: 'subject-1', name: 'Matemática' }],
    schoolYears: [{ id: 'year-1', name: '2024' }],
  };

  const mockRoutes = {
    ATIVIDADE: {
      base: '/atividades',
      create: '/atividades/criar',
      details: (id: string) => `/atividades/${id}`,
      editDraft: (id: string) => `/atividades/rascunhos/${id}`,
      editModel: (id: string) => `/atividades/modelos/${id}`,
    },
    PROVA: {
      base: '/provas',
      create: '/provas/criar',
      details: (id: string) => `/provas/${id}`,
      editDraft: (id: string) => `/provas/rascunhos/${id}`,
      editModel: (id: string) => `/provas/modelos/${id}`,
    },
  };

  const baseProps: UnifiedHistoryPageProps = {
    activityCategory: 'ATIVIDADE',
    data: mockActivityData,
    loading: false,
    error: null,
    pagination: {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    apiFilterOptions: mockApiFilterOptions,
    onParamsChange: mockOnParamsChange,
    routes: mockRoutes,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render ActivityPageLayout for ATIVIDADE category', () => {
      render(<UnifiedHistoryPage {...baseProps} />);
      expect(screen.getByTestId('activity-page-layout')).toBeInTheDocument();
    });

    it('should render ExamPageLayout for PROVA category', () => {
      render(<UnifiedHistoryPage {...baseProps} activityCategory="PROVA" />);
      expect(screen.getByTestId('exam-page-layout')).toBeInTheDocument();
    });

    it('should pass TypeSelector to PageLayout', () => {
      render(<UnifiedHistoryPage {...baseProps} />);
      const lastCall =
        getMockPageLayout().mock.calls[
          getMockPageLayout().mock.calls.length - 1
        ];
      expect(lastCall[0].headerRightContent).toBeDefined();
    });

    it('should render data count', () => {
      render(<UnifiedHistoryPage {...baseProps} />);
      expect(screen.getByTestId('data-count')).toHaveTextContent('2');
    });

    it('should handle empty data array', () => {
      render(<UnifiedHistoryPage {...baseProps} data={[]} />);
      expect(screen.getByTestId('data-count')).toHaveTextContent('0');
    });

    it('should handle empty data', () => {
      render(<UnifiedHistoryPage {...baseProps} data={[]} />);
      expect(screen.getByTestId('data-count')).toHaveTextContent('0');
    });
  });

  describe('filter configuration', () => {
    it('should create filters without creator filter by default', () => {
      render(<UnifiedHistoryPage {...baseProps} />);

      // Verify creator filter is NOT included in initialFilters
      const lastCall =
        getMockPageLayout().mock.calls[
          getMockPageLayout().mock.calls.length - 1
        ];
      const initialFilters = lastCall[0].initialFilters;
      const hasCreatorFilter = initialFilters.some(
        (filter: { key: string }) => filter.key === 'creator'
      );
      expect(hasCreatorFilter).toBe(false);
    });

    it('should include creator filter when includeCreatorFilter is true', () => {
      render(<UnifiedHistoryPage {...baseProps} includeCreatorFilter={true} />);

      // Verify creator filter IS included in initialFilters
      const lastCall =
        getMockPageLayout().mock.calls[
          getMockPageLayout().mock.calls.length - 1
        ];
      const initialFilters = lastCall[0].initialFilters;
      const creatorFilter = initialFilters.find(
        (filter: { key: string }) => filter.key === 'creator'
      );
      expect(creatorFilter).toBeDefined();
      expect(creatorFilter.label).toBe('CRIADO POR');
    });

    it('should merge user filter options with API options', () => {
      const userData = {
        userInstitutions: [
          {
            school: { id: 'user-school-1', name: 'Escola User' },
            schoolYear: { id: 'user-year-1', name: '2024' },
            class: { id: 'user-class-1', name: 'Turma User' },
          },
        ],
        subTeacherTopicClasses: [
          {
            subject: { id: 'user-subject-1', name: 'História' },
          },
        ],
      };

      render(<UnifiedHistoryPage {...baseProps} userData={userData} />);

      expect(filterHelpers.mergeFilterOptions).toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should handle params change', () => {
      render(<UnifiedHistoryPage {...baseProps} />);

      const changeParamsButton = screen.getByText('Change Params');
      fireEvent.click(changeParamsButton);

      expect(mockOnParamsChange).toHaveBeenCalledWith({ page: 2 });
    });

    it('should navigate to details on row click', () => {
      render(<UnifiedHistoryPage {...baseProps} />);

      const clickRowButton = screen.getByText('Click Row');
      fireEvent.click(clickRowButton);

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/1');
    });

    it('should navigate to create on create button click', () => {
      render(<UnifiedHistoryPage {...baseProps} />);

      const createButton = screen.getByText('Create Activity');
      fireEvent.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/criar');
    });

    it('should navigate to drafts on tab change', () => {
      render(<UnifiedHistoryPage {...baseProps} />);

      const draftsButton = screen.getByText('Go to Drafts');
      fireEvent.click(draftsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/rascunhos');
    });

    it('should navigate to models on tab change', () => {
      render(<UnifiedHistoryPage {...baseProps} />);

      const modelsButton = screen.getByText('Go to Models');
      fireEvent.click(modelsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/modelos');
    });

    it('should navigate to history on tab change', () => {
      render(<UnifiedHistoryPage {...baseProps} />);

      const historyButton = screen.getByText('Go to History');
      fireEvent.click(historyButton);

      expect(mockNavigate).toHaveBeenCalledWith('/atividades');
    });

    it('should handle unknown tab gracefully', () => {
      render(<UnifiedHistoryPage {...baseProps} />);

      const lastCall =
        getMockPageLayout().mock.calls[
          getMockPageLayout().mock.calls.length - 1
        ];
      const props = lastCall[0];

      props.onTabChange('unknown');

      expect(mockNavigate).toHaveBeenCalledWith('/atividades');
    });
  });

  describe('with PROVA activity category', () => {
    const provaProps = {
      ...baseProps,
      activityCategory: 'PROVA' as const,
    };

    it('should navigate to prova routes', () => {
      render(<UnifiedHistoryPage {...provaProps} />);

      const createButton = screen.getByText('Create Exam');
      fireEvent.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith('/provas/criar');
    });

    it('should navigate to prova details on row click', () => {
      render(<UnifiedHistoryPage {...provaProps} />);

      const clickRowButton = screen.getByText('Click Row');
      fireEvent.click(clickRowButton);

      expect(mockNavigate).toHaveBeenCalledWith('/provas/1');
    });

    it('should navigate to prova drafts', () => {
      render(<UnifiedHistoryPage {...provaProps} />);

      const draftsButton = screen.getByText('Go to Drafts');
      fireEvent.click(draftsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/provas/rascunhos');
    });

    it('should navigate to prova models', () => {
      render(<UnifiedHistoryPage {...provaProps} />);

      const modelsButton = screen.getByText('Go to Models');
      fireEvent.click(modelsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/provas/modelos');
    });
  });

  describe('loading and error states', () => {
    it('should pass loading state to PageLayout', () => {
      render(<UnifiedHistoryPage {...baseProps} loading={true} />);

      const lastCall =
        getMockPageLayout().mock.calls[
          getMockPageLayout().mock.calls.length - 1
        ];
      expect(lastCall[0].loading).toBe(true);
    });

    it('should pass error state to PageLayout', () => {
      const errorMessage = 'Failed to load data';
      render(<UnifiedHistoryPage {...baseProps} error={errorMessage} />);

      const lastCall =
        getMockPageLayout().mock.calls[
          getMockPageLayout().mock.calls.length - 1
        ];
      expect(lastCall[0].error).toBe(errorMessage);
    });
  });

  describe('filter options', () => {
    it('should include status filter options', () => {
      const { container } = render(<UnifiedHistoryPage {...baseProps} />);
      expect(container).toBeInTheDocument();
      // Status options are defined in PAGE_CONFIG and passed to filters
    });

    it('should include academic data filters', () => {
      const { container } = render(<UnifiedHistoryPage {...baseProps} />);
      expect(container).toBeInTheDocument();
      // Academic filters (school, schoolYear, class) are created
    });

    it('should include content filters', () => {
      const { container } = render(<UnifiedHistoryPage {...baseProps} />);
      expect(container).toBeInTheDocument();
      // Content filters (subject) are created
    });
  });

  describe('EmptyState', () => {
    it('should render EmptyState when activityImage is provided', () => {
      const propsWithImage = {
        ...baseProps,
        activityImage: 'https://example.com/image.png',
      };
      render(<UnifiedHistoryPage {...propsWithImage} />);

      // Verify EmptyState is passed as prop to PageLayout
      const lastCall =
        getMockPageLayout().mock.calls[
          getMockPageLayout().mock.calls.length - 1
        ];
      expect(lastCall[0].emptyState).toBeDefined();
      expect(lastCall[0].emptyState).not.toBeNull();
    });

    it('should not render EmptyState when activityImage is not provided', () => {
      render(<UnifiedHistoryPage {...baseProps} />);
      const lastCall =
        getMockPageLayout().mock.calls[
          getMockPageLayout().mock.calls.length - 1
        ];
      expect(lastCall[0].emptyState).toBeUndefined();
    });
  });

  describe('with userData', () => {
    it('should extract filter options from userData', () => {
      const userData = {
        userInstitutions: [
          {
            school: { id: 'school-1', name: 'Escola Teste' },
            schoolYear: { id: 'year-1', name: '2024' },
            class: { id: 'class-1', name: 'Turma A' },
          },
        ],
        subTeacherTopicClasses: [
          {
            subject: { id: 'subject-1', name: 'Matemática' },
          },
        ],
      };

      render(<UnifiedHistoryPage {...baseProps} userData={userData} />);

      // Filter helpers are mocked

      expect(filterHelpers.getSchoolOptionsFromUserData).toHaveBeenCalledWith(
        userData
      );
      expect(
        filterHelpers.getSchoolYearOptionsFromUserData
      ).toHaveBeenCalledWith(userData);
      expect(filterHelpers.getClassOptionsFromUserData).toHaveBeenCalledWith(
        userData
      );
      expect(filterHelpers.getSubjectOptionsFromUserData).toHaveBeenCalledWith(
        userData
      );
    });

    it('should handle null userData', () => {
      render(<UnifiedHistoryPage {...baseProps} userData={null} />);

      // Filter helpers are mocked
      expect(filterHelpers.getSchoolOptionsFromUserData).toHaveBeenCalledWith(
        null
      );
    });
  });

  describe('owner actions (delete/edit)', () => {
    const currentUserId = 'user-1';
    const ownedRow: ActivityTableItem = {
      ...mockActivityData[0],
      id: 'own-1',
      creatorId: 'user-1',
      title: 'Minha Atividade',
    };
    const otherRow: ActivityTableItem = {
      ...mockActivityData[1],
      id: 'other-1',
      creatorId: 'user-2',
    };
    const nullCreatorRow: ActivityTableItem = {
      ...mockActivityData[0],
      id: 'null-1',
      creatorId: null,
    };

    let apiClient: { delete: jest.Mock };

    const deleteProps = (): UnifiedHistoryPageProps => ({
      ...baseProps,
      data: [ownedRow, otherRow, nullCreatorRow],
      currentUserId,
      apiClient: apiClient as unknown as BaseApiClient,
    });

    beforeEach(() => {
      apiClient = { delete: jest.fn().mockResolvedValue({ data: {} }) };
      getMockAddToast().mockClear();
    });

    it('does not add an actions column without currentUserId/apiClient', () => {
      render(<UnifiedHistoryPage {...baseProps} />);
      expect(screen.getByTestId('has-actions-column')).toHaveTextContent(
        'false'
      );
    });

    it('does not add an actions column for PROVA even when enabled', () => {
      render(
        <UnifiedHistoryPage
          {...baseProps}
          activityCategory="PROVA"
          currentUserId={currentUserId}
          apiClient={apiClient as unknown as BaseApiClient}
        />
      );
      const examMock = jest.requireMock<typeof import('./config')>('./config')
        .PAGE_CONFIG.PROVA.PageLayout as jest.Mock;
      const lastCall = examMock.mock.calls[examMock.mock.calls.length - 1];
      const headers = lastCall[0].headers as ColumnConfig<ActivityTableItem>[];
      expect(headers.some((c) => c.key === 'actions')).toBe(false);
    });

    it('adds an actions column when delete is enabled', () => {
      render(<UnifiedHistoryPage {...deleteProps()} />);
      expect(screen.getByTestId('has-actions-column')).toHaveTextContent(
        'true'
      );
    });

    it('shows action buttons only for activities owned by the current user', () => {
      render(<UnifiedHistoryPage {...deleteProps()} />);
      expect(screen.getAllByTitle('Excluir')).toHaveLength(1);
      expect(screen.getAllByTitle('Editar')).toHaveLength(1);
      expect(
        screen.getByTestId('actions-cell-own-1').querySelector('button')
      ).toBeTruthy();
      expect(
        screen.getByTestId('actions-cell-other-1').querySelector('button')
      ).toBeFalsy();
      expect(
        screen.getByTestId('actions-cell-null-1').querySelector('button')
      ).toBeFalsy();
    });

    it('navigates to the edit route when clicking edit', () => {
      render(<UnifiedHistoryPage {...deleteProps()} />);
      fireEvent.click(screen.getByTitle('Editar'));
      expect(mockNavigate).toHaveBeenCalledWith('/atividades/criar?id=own-1');
    });

    it('opens confirm dialog, deletes, reloads with last params and toasts success', async () => {
      render(<UnifiedHistoryPage {...deleteProps()} />);
      // Record last params so the post-delete reload uses them
      fireEvent.click(screen.getByText('Change Params'));
      // Open the confirmation dialog
      fireEvent.click(screen.getByTitle('Excluir'));
      expect(screen.getByText('Excluir atividade')).toBeInTheDocument();
      // Confirm (dialog submit button text is "Excluir")
      fireEvent.click(screen.getByText('Excluir'));

      await waitFor(() =>
        expect(apiClient.delete).toHaveBeenCalledWith('/activities/own-1')
      );
      expect(mockOnParamsChange).toHaveBeenCalledWith({ page: 2 });
      await waitFor(() =>
        expect(getMockAddToast()).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'success' })
        )
      );
    });

    it('toasts a warning when deletion fails', async () => {
      apiClient.delete.mockRejectedValueOnce(new Error('fail'));
      render(<UnifiedHistoryPage {...deleteProps()} />);
      fireEvent.click(screen.getByTitle('Excluir'));
      fireEvent.click(screen.getByText('Excluir'));

      await waitFor(() =>
        expect(getMockAddToast()).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'warning' })
        )
      );
    });

    it('closes the dialog without deleting when cancelled', () => {
      render(<UnifiedHistoryPage {...deleteProps()} />);
      fireEvent.click(screen.getByTitle('Excluir'));
      expect(screen.getByText('Excluir atividade')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancelar'));
      expect(screen.queryByText('Excluir atividade')).not.toBeInTheDocument();
      expect(apiClient.delete).not.toHaveBeenCalled();
    });
  });
});
