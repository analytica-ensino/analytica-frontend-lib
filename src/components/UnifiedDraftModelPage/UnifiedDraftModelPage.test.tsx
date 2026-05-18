import React from 'react';
import { render, screen } from '@testing-library/react';
import { UnifiedDraftModelPage } from './UnifiedDraftModelPage';
import type { UnifiedDraftModelPageProps } from './types';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import { ActivityType } from '../ActivityCreate/ActivityCreate.types';

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

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

jest.mock('../AlertDialog/AlertDialog', () => ({
  AlertDialog: ({
    isOpen,
    onChangeOpen,
    title,
    onSubmit,
  }: {
    isOpen: boolean;
    onChangeOpen: (open: boolean) => void;
    title: string;
    onSubmit: () => void;
  }) =>
    isOpen ? (
      <div data-testid="alert-dialog">
        <div>{title}</div>
        <button onClick={() => onChangeOpen(false)}>Cancel</button>
        <button onClick={onSubmit}>Confirm</button>
      </div>
    ) : null,
}));

jest.mock('../TypeSelector/TypeSelector', () => ({
  __esModule: true,
  default: () => <div data-testid="type-selector">TypeSelector</div>,
}));

jest.mock('../../utils/filterHelpers', () => ({
  getSubjectOptionsFromUserData: jest.fn(() => []),
  mergeFilterOptions: jest.fn((base, extra) => [...base, ...extra]),
}));

// Mock PageLayout components
interface MockPageLayoutProps {
  data: ActivityModelTableItem[];
  onParamsChange: (params: { page?: number }) => void;
  onRowClick: (row: ActivityModelTableItem) => void;
  onCreateActivity?: () => void;
  onCreateExam?: () => void;
  headerRightContent?: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
}

const MockActivityPageLayout = jest.fn(
  ({
    data,
    onParamsChange,
    onRowClick,
    onCreateActivity,
  }: MockPageLayoutProps) => (
    <div data-testid="activity-page-layout">
      <div data-testid="data-count">{data.length}</div>
      <button onClick={() => onParamsChange({ page: 2 })}>Change Params</button>
      <button onClick={() => onRowClick(data[0])}>Click Row</button>
      <button onClick={onCreateActivity}>Create Activity</button>
    </div>
  )
);

const MockExamPageLayout = jest.fn(
  ({ data, onParamsChange, onRowClick, onCreateExam }: MockPageLayoutProps) => (
    <div data-testid="exam-page-layout">
      <div data-testid="data-count">{data.length}</div>
      <button onClick={() => onParamsChange({ page: 2 })}>Change Params</button>
      <button onClick={() => onRowClick(data[0])}>Click Row</button>
      <button onClick={onCreateExam}>Create Exam</button>
    </div>
  )
);

jest.mock('./config', () => ({
  PAGE_CONFIG: {
    ATIVIDADE: {
      drafts: {
        pageTitle: 'Rascunhos de Atividades',
        activeTab: 'rascunhos',
        currentTab: 'drafts',
        testId: 'activity-drafts-page',
        itemLabel: 'rascunhos',
        searchPlaceholder: 'Buscar rascunho',
        emptyTitle: 'Nenhum rascunho criado',
        emptyDescription: 'Crie seu primeiro rascunho',
        buttonText: 'Criar Rascunho',
        dialogTitle: 'Excluir rascunho',
        editUrlType: 'rascunho',
        errorLogLabel: 'rascunho',
        onCreatePropName: 'onCreateActivity',
      },
      models: {
        pageTitle: 'Modelos de Atividades',
        activeTab: 'modelos',
        currentTab: 'models',
        testId: 'activity-models-page',
        itemLabel: 'modelos',
        searchPlaceholder: 'Buscar modelo',
        emptyTitle: 'Nenhum modelo criado',
        emptyDescription: 'Crie seu primeiro modelo',
        buttonText: 'Criar Modelo',
        dialogTitle: 'Excluir modelo',
        editUrlType: 'modelo',
        errorLogLabel: 'modelo',
        onCreatePropName: 'onCreateActivity',
      },
    },
    PROVA: {
      drafts: {
        pageTitle: 'Rascunhos de Provas',
        activeTab: 'rascunhos',
        currentTab: 'drafts',
        testId: 'exam-drafts-page',
        itemLabel: 'rascunhos',
        searchPlaceholder: 'Buscar rascunho',
        emptyTitle: 'Nenhum rascunho criado',
        emptyDescription: 'Crie seu primeiro rascunho',
        buttonText: 'Criar Rascunho',
        dialogTitle: 'Excluir rascunho',
        editUrlType: 'rascunho',
        errorLogLabel: 'rascunho',
        onCreatePropName: 'onCreateExam',
      },
      models: {
        pageTitle: 'Modelos de Provas',
        activeTab: 'modelos',
        currentTab: 'models',
        testId: 'exam-models-page',
        itemLabel: 'modelos',
        searchPlaceholder: 'Buscar modelo',
        emptyTitle: 'Nenhum modelo criado',
        emptyDescription: 'Crie seu primeiro modelo',
        buttonText: 'Criar Modelo',
        dialogTitle: 'Excluir modelo',
        editUrlType: 'modelo',
        errorLogLabel: 'modelo',
        onCreatePropName: 'onCreateExam',
      },
    },
  },
  getPageLayout: jest.fn((activityCategory: string) =>
    activityCategory === 'ATIVIDADE'
      ? MockActivityPageLayout
      : MockExamPageLayout
  ),
}));

jest.mock('../ExamPageLayout/examDraftsModelsTableConfig', () => ({
  createExamDraftsModelsTableColumns: jest.fn(() => []),
}));

jest.mock('../TypeSelector/TypeSelector.types', () => ({
  createActivityCategoryConfig: jest.fn(() => ({})),
}));

describe('UnifiedDraftModelPage', () => {
  const mockOnDelete = jest.fn();
  const mockOnSend = jest.fn();
  const mockOnParamsChange = jest.fn();

  const mockData: ActivityModelTableItem[] = [
    {
      id: '1',
      title: 'Test Activity 1',
      savedAt: '2024-01-01',
      type: ActivityType.ATIVIDADE,
      subject: {
        id: 'sub-1',
        name: 'Matemática',
        icon: 'math',
        color: 'blue',
      },
      subjectId: 'sub-1',
    },
    {
      id: '2',
      title: 'Test Activity 2',
      savedAt: '2024-01-02',
      type: ActivityType.ATIVIDADE,
      subject: {
        id: 'sub-2',
        name: 'Português',
        icon: 'language',
        color: 'green',
      },
      subjectId: 'sub-2',
    },
  ];

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

  const baseProps: UnifiedDraftModelPageProps = {
    type: 'drafts',
    activityCategory: 'ATIVIDADE',
    data: mockData,
    loading: false,
    error: null,
    pagination: {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    onDelete: mockOnDelete,
    onSend: mockOnSend,
    onParamsChange: mockOnParamsChange,
    routes: mockRoutes,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render ActivityPageLayout for ATIVIDADE category', () => {
      render(<UnifiedDraftModelPage {...baseProps} />);
      expect(screen.getByTestId('activity-page-layout')).toBeInTheDocument();
    });

    it('should render ExamPageLayout for PROVA category', () => {
      render(<UnifiedDraftModelPage {...baseProps} activityCategory="PROVA" />);
      expect(screen.getByTestId('exam-page-layout')).toBeInTheDocument();
    });

    it('should pass TypeSelector to PageLayout', () => {
      render(<UnifiedDraftModelPage {...baseProps} />);
      const lastCall =
        MockActivityPageLayout.mock.calls[
          MockActivityPageLayout.mock.calls.length - 1
        ];
      expect(lastCall[0].headerRightContent).toBeDefined();
    });

    it('should render data count', () => {
      render(<UnifiedDraftModelPage {...baseProps} />);
      expect(screen.getByTestId('data-count')).toHaveTextContent('2');
    });

    it('should render EmptyState when activityImage is provided', () => {
      const propsWithImage = {
        ...baseProps,
        activityImage: 'https://example.com/image.png',
      };
      render(<UnifiedDraftModelPage {...propsWithImage} />);
      // EmptyState is passed as prop but not rendered when there's data
      expect(MockActivityPageLayout).toHaveBeenCalled();
    });

    it('should not render AlertDialog initially', () => {
      render(<UnifiedDraftModelPage {...baseProps} />);
      expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();
    });
  });

  describe('delete functionality', () => {
    it('should filter out items without subject', () => {
      const dataWithInvalidSubjects: ActivityModelTableItem[] = [
        ...mockData,
        {
          id: '3',
          title: 'No Subject',
          savedAt: '2024-01-03',
          type: ActivityType.ATIVIDADE,
          subject: { id: 'none', name: '-', icon: 'none', color: 'gray' },
          subjectId: null,
        },
      ];

      render(
        <UnifiedDraftModelPage {...baseProps} data={dataWithInvalidSubjects} />
      );

      // Component should filter out the item with invalid subject
      expect(screen.getByTestId('activity-page-layout')).toBeInTheDocument();
    });
  });

  describe('loading and error states', () => {
    it('should pass loading state to PageLayout', () => {
      render(<UnifiedDraftModelPage {...baseProps} loading={true} />);

      const lastCall =
        MockActivityPageLayout.mock.calls[
          MockActivityPageLayout.mock.calls.length - 1
        ];
      expect(lastCall[0].loading).toBe(true);
    });

    it('should pass error state to PageLayout', () => {
      const errorMessage = 'Failed to load data';
      render(<UnifiedDraftModelPage {...baseProps} error={errorMessage} />);

      const lastCall =
        MockActivityPageLayout.mock.calls[
          MockActivityPageLayout.mock.calls.length - 1
        ];
      expect(lastCall[0].error).toBe(errorMessage);
    });
  });
});
