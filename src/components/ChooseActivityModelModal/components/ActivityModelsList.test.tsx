import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ActivityModelsList } from './ActivityModelsList';
import type {
  ActivityModelTableItem,
  SubjectData,
} from '../../../types/activitiesHistory';
import { ActivityType } from '../../ActivityCreate/ActivityCreate.types';
import type { TableParams } from '../../TableProvider/TableProvider';

// Mock do TableProvider
jest.mock('../../../index', () => ({
  TableProvider: ({
    data,
    headers,
    loading,
    enableSearch,
    enablePagination,
    enableRowClick,
    searchPlaceholder,
    onParamsChange,
    onRowClick,
    rowKey,
  }: {
    data: ActivityModelTableItem[];
    headers: {
      key: string;
      label: string;
      sortable?: boolean;
      render?: (value: unknown) => React.ReactNode;
    }[];
    loading: boolean;
    enableSearch: boolean;
    enablePagination: boolean;
    enableRowClick: boolean;
    searchPlaceholder: string;
    onParamsChange: (params: TableParams) => void;
    onRowClick: (row: ActivityModelTableItem) => void;
    rowKey: string;
  }) => (
    <div data-testid="table-provider">
      <div data-testid="table-loading">
        {loading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid="table-enable-search">{enableSearch ? 'yes' : 'no'}</div>
      <div data-testid="table-enable-pagination">
        {enablePagination ? 'yes' : 'no'}
      </div>
      <div data-testid="table-enable-row-click">
        {enableRowClick ? 'yes' : 'no'}
      </div>
      <div data-testid="table-search-placeholder">{searchPlaceholder}</div>
      <div data-testid="table-row-key">{rowKey}</div>
      <div data-testid="table-headers-count">{headers.length}</div>
      {data.map((row) => (
        <div
          key={row[rowKey] as string}
          data-testid={`table-row-${row[rowKey]}`}
          onClick={() => onRowClick(row)}
        >
          {row.title}
          <div data-testid={`subject-count-${row[rowKey]}`}>
            {(row.subjects as unknown[])?.length ?? 0}
          </div>
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
  IconRender: ({
    iconName,
    size,
    color,
  }: {
    iconName: string;
    size: number;
    color: string;
  }) => (
    <span
      data-testid="icon-render"
      data-icon-name={iconName}
      data-size={size}
      data-color={color}
    />
  ),
  Text: ({
    children,
    size,
    color,
    className,
  }: {
    children: React.ReactNode;
    size?: string;
    color?: string;
    className?: string;
  }) => (
    <span
      data-testid="text"
      data-size={size}
      data-color={color}
      className={className}
    >
      {children}
    </span>
  ),
  TruncatedText: ({
    children,
    size,
    color,
    className,
  }: {
    children: React.ReactNode;
    size?: string;
    color?: string;
    className?: string;
  }) => (
    <span
      data-testid="truncated-text"
      data-size={size}
      data-color={color}
      className={className}
    >
      {children}
    </span>
  ),
}));

// Mock do createModelsTableColumnsBase
jest.mock('../../shared/ModelsTabBase/createModelsTableColumnsBase', () => ({
  createModelsTableColumnsBase: jest.fn(() => [
    { key: 'title', label: 'Título', sortable: true },
    { key: 'savedAt', label: 'Salvo em', sortable: true },
    { key: 'subjects', label: 'Componente curricular', sortable: false },
    { key: 'actions', label: 'Ações' },
  ]),
}));

describe('ActivityModelsList', () => {
  const mockSubject1: SubjectData = {
    id: 's1',
    name: 'Mathematics',
    icon: 'Calculator',
    color: '#FF5733',
  };

  const mockSubject2: SubjectData = {
    id: 's2',
    name: 'Portuguese',
    icon: 'BookOpen',
    color: '#3357FF',
  };

  const mockModels: ActivityModelTableItem[] = [
    {
      id: 'model-1',
      type: ActivityType.MODELO,
      title: 'Model 1',
      savedAt: '2024-01-01T00:00:00Z',
      subjects: [mockSubject1],
      subjectId: 's1',
    },
    {
      id: 'model-2',
      type: ActivityType.MODELO,
      title: 'Model 2',
      savedAt: '2024-01-02T00:00:00Z',
      subjects: [mockSubject2],
      subjectId: 's2',
    },
    {
      id: 'model-3',
      type: ActivityType.MODELO,
      title: 'Model 3',
      savedAt: '2024-01-03T00:00:00Z',
      subjects: [],
      subjectId: null,
    },
  ];

  const defaultProps = {
    models: mockModels,
    loading: false,
    onParamsChange: jest.fn(),
    onRowClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render TableProvider with correct configuration', () => {
      render(<ActivityModelsList {...defaultProps} />);

      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
      expect(screen.getByTestId('table-enable-search')).toHaveTextContent(
        'yes'
      );
      expect(screen.getByTestId('table-enable-pagination')).toHaveTextContent(
        'yes'
      );
      expect(screen.getByTestId('table-enable-row-click')).toHaveTextContent(
        'yes'
      );
      expect(screen.getByTestId('table-search-placeholder')).toHaveTextContent(
        'Buscar modelo'
      );
      expect(screen.getByTestId('table-row-key')).toHaveTextContent('id');
    });

    it('should render with loading state', () => {
      render(<ActivityModelsList {...defaultProps} loading={true} />);

      expect(screen.getByTestId('table-loading')).toHaveTextContent('loading');
    });

    it('should render with empty models array', () => {
      render(<ActivityModelsList {...defaultProps} models={[]} />);

      expect(screen.getByTestId('table-provider')).toBeInTheDocument();
      expect(screen.queryByTestId('table-row-model-1')).not.toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onRowClick when a row is clicked', () => {
      const onRowClick = jest.fn();
      render(<ActivityModelsList {...defaultProps} onRowClick={onRowClick} />);

      const row = screen.getByTestId('table-row-model-1');
      fireEvent.click(row);

      expect(onRowClick).toHaveBeenCalledWith(mockModels[0]);
    });

    it('should call onParamsChange when params change', () => {
      const onParamsChange = jest.fn();
      render(
        <ActivityModelsList {...defaultProps} onParamsChange={onParamsChange} />
      );

      const button = screen.getByTestId('trigger-params-change');
      fireEvent.click(button);

      expect(onParamsChange).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('columns', () => {
    it('drops the actions column and keeps the rest of the base columns', () => {
      render(
        <ActivityModelsList
          models={mockModels}
          loading={false}
          onParamsChange={jest.fn()}
          onRowClick={jest.fn()}
        />
      );

      // The base config has 4 columns; this list renders it without actions.
      expect(screen.getByTestId('table-headers-count')).toHaveTextContent('3');
    });

    it("passes each model's subjects straight through to the table", () => {
      render(
        <ActivityModelsList
          models={mockModels}
          loading={false}
          onParamsChange={jest.fn()}
          onRowClick={jest.fn()}
        />
      );

      expect(screen.getByTestId('subject-count-model-1')).toHaveTextContent(
        '1'
      );
    });
  });
});
