import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import {
  ModelsTabBase,
  type ModelsTabBaseProps,
  type ModelsTabConfig,
  type UseModelsReturn,
} from './ModelsTabBase';
import type { BaseModelItem } from './createModelsTableColumnsBase';
import type { FilterConfig } from '../../Filter';
import type {
  TableParams,
  ColumnConfig,
} from '../../TableProvider/TableProvider';

// Mock dependencies
jest.mock('../../TableProvider/TableProvider', () => ({
  TableProvider: ({
    children,
    loading,
    emptyState,
    data,
  }: {
    children: (props: {
      controls: React.ReactNode;
      table: React.ReactNode;
      pagination: React.ReactNode;
    }) => React.ReactNode;
    loading: boolean;
    emptyState: { component: React.ReactNode };
    data: unknown[];
  }) => {
    if (loading) {
      return <div data-testid="loading">Loading...</div>;
    }
    if (data.length === 0) {
      return <div data-testid="empty-state">{emptyState.component}</div>;
    }
    return (
      <div data-testid="table-provider">
        {children({
          controls: <div data-testid="controls">Controls</div>,
          table: <div data-testid="table">Table</div>,
          pagination: <div data-testid="pagination">Pagination</div>,
        })}
      </div>
    );
  },
}));

jest.mock('../../EmptyState/EmptyState', () => ({
  __esModule: true,
  default: ({
    title,
    onButtonClick,
  }: {
    title: string;
    onButtonClick: () => void;
  }) => (
    <div data-testid="empty-state-component">
      <span>{title}</span>
      <button onClick={onButtonClick}>Create</button>
    </div>
  ),
}));

jest.mock('../../AlertDialog/AlertDialog', () => ({
  AlertDialog: ({
    isOpen,
    title,
    onSubmit,
    onCancel,
  }: {
    isOpen: boolean;
    title: string;
    onSubmit: () => void;
    onCancel: () => void;
  }) =>
    isOpen ? (
      <div data-testid="alert-dialog">
        <span>{title}</span>
        <button onClick={onSubmit} data-testid="confirm-delete">
          Confirm
        </button>
        <button onClick={onCancel} data-testid="cancel-delete">
          Cancel
        </button>
      </div>
    ) : null,
}));

jest.mock('../../Toast/utils/Toaster', () => ({
  __esModule: true,
  default: () => <div data-testid="toaster" />,
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock('../../ActivitiesHistory/components/ErrorDisplay', () => ({
  ErrorDisplay: ({ error }: { error: string }) => (
    <div data-testid="error-display">{error}</div>
  ),
}));

/**
 * Test model item
 */
interface TestModelItem extends BaseModelItem {
  subjectId?: string | null;
}

/**
 * Test filters type
 */
interface TestFilters {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Test API response type
 */
interface TestApiResponse {
  data: {
    items: TestModelItem[];
    total: number;
  };
}

const mockModels: TestModelItem[] = [
  { id: '1', title: 'Model 1', subject: 'Math', savedAt: '01/01/2024' },
  { id: '2', title: 'Model 2', subject: 'Physics', savedAt: '02/01/2024' },
];

const mockConfig: ModelsTabConfig = {
  entityName: 'model',
  entityNamePlural: 'models',
  testId: 'test-models-tab',
  emptyStateTitle: 'Create models',
  emptyStateDescription: 'Save models to reuse',
  searchPlaceholder: 'Search models',
};

const mockColumns: ColumnConfig<TestModelItem>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'subject', label: 'Subject', sortable: true },
];

const mockFilters: FilterConfig[] = [
  {
    key: 'content',
    label: 'Content',
    categories: [],
  },
];

/**
 * Create a mock hook factory
 */
const createMockUseModels = (
  returnValue: Partial<UseModelsReturn<TestModelItem>>
) => {
  const defaultReturn: UseModelsReturn<TestModelItem> = {
    models: [],
    loading: false,
    error: null,
    pagination: { total: 0, totalPages: 0 },
    fetchModels: jest.fn(),
    deleteModel: jest.fn().mockResolvedValue(true),
    ...returnValue,
  };
  return jest.fn(() => () => defaultReturn);
};

/**
 * Create default props for testing
 */
const createDefaultProps = (
  overrides: Partial<
    ModelsTabBaseProps<TestModelItem, TestFilters, TestApiResponse, unknown>
  > = {}
): ModelsTabBaseProps<TestModelItem, TestFilters, TestApiResponse, unknown> => {
  const mockFetchModels = jest.fn().mockResolvedValue({
    data: { items: mockModels, total: 2 },
  });
  const mockDeleteModel = jest.fn().mockResolvedValue(undefined);

  return {
    fetchModels: mockFetchModels,
    deleteModel: mockDeleteModel,
    onCreateModel: jest.fn(),
    config: mockConfig,
    createTableColumns: jest.fn(() => mockColumns),
    createFiltersConfig: jest.fn(() => mockFilters),
    buildFiltersFromParams: jest.fn((params: TableParams) => ({
      page: params.page,
      limit: params.limit,
    })),
    createUseModels: createMockUseModels({ models: mockModels }),
    ...overrides,
  };
};

/**
 * Helper to render table cells for mock TableProvider
 */
const renderTableCells = (
  data: TestModelItem[],
  headers: ColumnConfig<TestModelItem>[]
) =>
  data.flatMap((item, idx) =>
    headers.map((header) => (
      <div key={`${item.id}-${header.key}`}>
        {header.render?.(item[header.key as keyof TestModelItem], item, idx)}
      </div>
    ))
  );

describe('ModelsTabBase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with correct testId', () => {
      const props = createDefaultProps();
      render(<ModelsTabBase {...props} />);
      expect(screen.getByTestId('test-models-tab')).toBeInTheDocument();
    });

    it('should render Toaster component', () => {
      const props = createDefaultProps();
      render(<ModelsTabBase {...props} />);
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });

    it('should render create button', () => {
      const props = createDefaultProps();
      render(<ModelsTabBase {...props} />);
      expect(
        screen.getByRole('button', { name: /criar modelo/i })
      ).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading state', () => {
      const props = createDefaultProps({
        createUseModels: createMockUseModels({ loading: true, models: [] }),
      });
      render(<ModelsTabBase {...props} />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error display when there is an error', () => {
      const props = createDefaultProps({
        createUseModels: createMockUseModels({
          error: 'Test error message',
          models: [],
        }),
      });
      render(<ModelsTabBase {...props} />);
      expect(screen.getByTestId('error-display')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty state when no models', () => {
      const props = createDefaultProps({
        createUseModels: createMockUseModels({ models: [] }),
      });
      render(<ModelsTabBase {...props} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should call onCreateModel from empty state button', () => {
      const onCreateModel = jest.fn();
      const props = createDefaultProps({
        onCreateModel,
        createUseModels: createMockUseModels({ models: [] }),
      });
      render(<ModelsTabBase {...props} />);
      fireEvent.click(screen.getByText('Create'));
      expect(onCreateModel).toHaveBeenCalled();
    });
  });

  describe('create button', () => {
    it('should call onCreateModel when create button is clicked', () => {
      const onCreateModel = jest.fn();
      const props = createDefaultProps({ onCreateModel });
      render(<ModelsTabBase {...props} />);
      fireEvent.click(screen.getByRole('button', { name: /criar modelo/i }));
      expect(onCreateModel).toHaveBeenCalled();
    });
  });

  describe('delete functionality', () => {
    // Helper component for delete button - reduces nesting
    const DeleteButton = ({
      row,
      onDelete,
    }: {
      row: TestModelItem;
      onDelete: (row: TestModelItem) => void;
    }) => (
      <button onClick={() => onDelete(row)} data-testid={`delete-${row.id}`}>
        Delete
      </button>
    );

    // Shared helper for creating columns with delete action
    const createTableColumnsWithDelete: ModelsTabBaseProps<
      TestModelItem,
      TestFilters,
      TestApiResponse,
      unknown
    >['createTableColumns'] = (_map, _send, _edit, onDelete) => [
      {
        key: 'actions',
        label: '',
        sortable: false,
        render: (_value: unknown, row: TestModelItem) => (
          <DeleteButton row={row} onDelete={onDelete} />
        ),
      },
    ];

    // Helper to setup TableProvider mock that renders actual columns
    const setupTableProviderWithColumns = () => {
      const original = jest.requireMock(
        '../../TableProvider/TableProvider'
      ).TableProvider;

      const TableProviderWithColumns = ({
        children,
        data,
        headers,
      }: {
        children: (props: {
          controls: React.ReactNode;
          table: React.ReactNode;
          pagination: React.ReactNode;
        }) => React.ReactNode;
        data: TestModelItem[];
        headers: ColumnConfig<TestModelItem>[];
      }) => (
        <div data-testid="table-provider">
          {children({
            controls: <div>Controls</div>,
            table: (
              <div data-testid="table">{renderTableCells(data, headers)}</div>
            ),
            pagination: <div>Pagination</div>,
          })}
        </div>
      );

      jest.requireMock('../../TableProvider/TableProvider').TableProvider =
        TableProviderWithColumns;

      return () => {
        jest.requireMock('../../TableProvider/TableProvider').TableProvider =
          original;
      };
    };

    it('should handle delete cancel', async () => {
      const deleteModelMock = jest.fn().mockResolvedValue(true);
      const mockUseModels = createMockUseModels({
        models: mockModels,
        deleteModel: deleteModelMock,
        fetchModels: jest.fn(),
      });

      const restore = setupTableProviderWithColumns();

      const props = createDefaultProps({
        createUseModels: mockUseModels,
        createTableColumns: createTableColumnsWithDelete,
      });

      render(<ModelsTabBase {...props} />);

      fireEvent.click(screen.getByTestId('delete-1'));

      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('cancel-delete'));

      await waitFor(() => {
        expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();
      });

      restore();
    });

    it('should call deleteModel on confirm', async () => {
      const deleteModelMock = jest.fn().mockResolvedValue(true);
      const mockUseModels = createMockUseModels({
        models: mockModels,
        deleteModel: deleteModelMock,
        fetchModels: jest.fn(),
      });

      const restore = setupTableProviderWithColumns();

      const props = createDefaultProps({
        createUseModels: mockUseModels,
        createTableColumns: createTableColumnsWithDelete,
      });

      render(<ModelsTabBase {...props} />);

      fireEvent.click(screen.getByTestId('delete-1'));

      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('confirm-delete'));
      });

      expect(deleteModelMock).toHaveBeenCalledWith('1');

      restore();
    });
  });

  describe('optional callbacks', () => {
    it('should pass onSend to createTableColumns when provided', () => {
      const onSend = jest.fn();
      const createTableColumns = jest.fn(() => mockColumns);
      const props = createDefaultProps({
        onSend,
        createTableColumns,
      });
      render(<ModelsTabBase {...props} />);
      expect(createTableColumns).toHaveBeenCalledWith(
        undefined, // mapSubjectNameToEnum
        onSend,
        undefined, // onEditModel
        expect.any(Function) // handleDeleteClick
      );
    });

    it('should pass onEditModel to createTableColumns when provided', () => {
      const onEditModel = jest.fn();
      const createTableColumns = jest.fn(() => mockColumns);
      const props = createDefaultProps({
        onEditModel,
        createTableColumns,
      });
      render(<ModelsTabBase {...props} />);
      expect(createTableColumns).toHaveBeenCalledWith(
        undefined, // mapSubjectNameToEnum
        undefined, // onSend
        onEditModel,
        expect.any(Function) // handleDeleteClick
      );
    });

    it('should pass mapSubjectNameToEnum to createTableColumns when provided', () => {
      const mapFn = jest.fn();
      const createTableColumns = jest.fn(() => mockColumns);
      const props = createDefaultProps({
        mapSubjectNameToEnum: mapFn,
        createTableColumns,
      });
      render(<ModelsTabBase {...props} />);
      expect(createTableColumns).toHaveBeenCalledWith(
        mapFn,
        undefined, // onSend
        undefined, // onEditModel
        expect.any(Function) // handleDeleteClick
      );
    });
  });
});
