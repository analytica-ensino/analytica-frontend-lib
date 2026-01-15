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
          {/* Render subject column */}
          {headers.find((h) => h.key === 'subject')?.render && (
            <div data-testid={`subject-cell-${row[rowKey]}`}>
              {headers.find((h) => h.key === 'subject')!.render!(row.subject)}
            </div>
          )}
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
}));

// Mock do createModelsTableColumnsBase
jest.mock('../../shared/ModelsTabBase/createModelsTableColumnsBase', () => ({
  createModelsTableColumnsBase: jest.fn(() => [
    { key: 'title', label: 'Título', sortable: true },
    { key: 'savedAt', label: 'Salvo em', sortable: true },
    { key: 'subject', label: 'Matéria', sortable: true },
    { key: 'actions', label: 'Ações' },
  ]),
}));

describe('ActivityModelsList', () => {
  const mockSubject1: SubjectData = {
    id: 's1',
    subjectName: 'Mathematics',
    subjectIcon: 'Calculator',
    subjectColor: '#FF5733',
  };

  const mockSubject2: SubjectData = {
    id: 's2',
    subjectName: 'Portuguese',
    subjectIcon: 'BookOpen',
    subjectColor: '#3357FF',
  };

  const mockModels: ActivityModelTableItem[] = [
    {
      id: 'model-1',
      type: ActivityType.MODELO,
      title: 'Model 1',
      savedAt: '2024-01-01T00:00:00Z',
      subject: mockSubject1,
      subjectId: 's1',
    },
    {
      id: 'model-2',
      type: ActivityType.MODELO,
      title: 'Model 2',
      savedAt: '2024-01-02T00:00:00Z',
      subject: mockSubject2,
      subjectId: 's2',
    },
    {
      id: 'model-3',
      type: ActivityType.MODELO,
      title: 'Model 3',
      savedAt: '2024-01-03T00:00:00Z',
      subject: null,
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

  describe('subject column render function', () => {
    it('should render "-" when subject is null', () => {
      const modelsWithNullSubject: ActivityModelTableItem[] = [
        {
          id: 'model-null',
          type: ActivityType.MODELO,
          title: 'Model with null subject',
          savedAt: '2024-01-01T00:00:00Z',
          subject: null,
          subjectId: null,
        },
      ];

      render(
        <ActivityModelsList {...defaultProps} models={modelsWithNullSubject} />
      );

      const subjectCell = screen.getByTestId('subject-cell-model-null');
      expect(subjectCell).toBeInTheDocument();

      const textElement = subjectCell.querySelector('[data-testid="text"]');
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveAttribute('data-size', 'sm');
      expect(textElement).toHaveAttribute('data-color', 'text-text-400');
      expect(textElement?.textContent).toBe('-');
    });

    it('should render "-" for all models with null subject', () => {
      const modelsAllNull: ActivityModelTableItem[] = [
        {
          id: 'model-1',
          type: ActivityType.MODELO,
          title: 'Model 1',
          savedAt: '2024-01-01T00:00:00Z',
          subject: null,
          subjectId: null,
        },
        {
          id: 'model-2',
          type: ActivityType.MODELO,
          title: 'Model 2',
          savedAt: '2024-01-02T00:00:00Z',
          subject: null,
          subjectId: null,
        },
        {
          id: 'model-3',
          type: ActivityType.MODELO,
          title: 'Model 3',
          savedAt: '2024-01-03T00:00:00Z',
          subject: null,
          subjectId: null,
        },
      ];

      render(<ActivityModelsList {...defaultProps} models={modelsAllNull} />);

      modelsAllNull.forEach((model) => {
        const subjectCell = screen.getByTestId(`subject-cell-${model.id}`);
        const textElement = subjectCell.querySelector('[data-testid="text"]');
        expect(textElement?.textContent).toBe('-');
        expect(textElement).toHaveAttribute('data-color', 'text-text-400');
      });
    });

    it('should render "-" when subject is explicitly null', () => {
      const modelWithExplicitNull: ActivityModelTableItem[] = [
        {
          id: 'explicit-null',
          type: ActivityType.MODELO,
          title: 'Explicit null',
          savedAt: '2024-01-01T00:00:00Z',
          subject: null,
          subjectId: null,
        },
      ];

      render(
        <ActivityModelsList {...defaultProps} models={modelWithExplicitNull} />
      );

      const subjectCell = screen.getByTestId('subject-cell-explicit-null');
      const textElement = subjectCell.querySelector('[data-testid="text"]');

      expect(textElement).toBeInTheDocument();
      expect(textElement?.textContent).toBe('-');
      expect(textElement).toHaveAttribute('data-size', 'sm');
      expect(textElement).toHaveAttribute('data-color', 'text-text-400');
    });

    it('should render "-" when subject is undefined', () => {
      const modelWithUndefinedSubject: ActivityModelTableItem[] = [
        {
          id: 'undefined-subject',
          type: ActivityType.MODELO,
          title: 'Undefined subject',
          savedAt: '2024-01-01T00:00:00Z',
          subject: undefined as unknown as SubjectData | null,
          subjectId: null,
        },
      ];

      render(
        <ActivityModelsList
          {...defaultProps}
          models={modelWithUndefinedSubject}
        />
      );

      const subjectCell = screen.getByTestId('subject-cell-undefined-subject');
      const textElement = subjectCell.querySelector('[data-testid="text"]');

      expect(textElement).toBeInTheDocument();
      expect(textElement?.textContent).toBe('-');
    });

    it('should render subject with icon when subject is provided', () => {
      const modelsWithSubject: ActivityModelTableItem[] = [
        {
          id: 'model-with-subject',
          type: ActivityType.MODELO,
          title: 'Model with subject',
          savedAt: '2024-01-01T00:00:00Z',
          subject: mockSubject1,
          subjectId: 's1',
        },
      ];

      render(
        <ActivityModelsList {...defaultProps} models={modelsWithSubject} />
      );

      const subjectCell = screen.getByTestId('subject-cell-model-with-subject');
      expect(subjectCell).toBeInTheDocument();

      // Check container with title attribute
      const subjectContainer = subjectCell.querySelector('[title]');
      expect(subjectContainer).toBeInTheDocument();
      expect(subjectContainer).toHaveAttribute(
        'title',
        mockSubject1.subjectName
      );

      // Check icon container with background color
      const iconContainer = subjectCell.querySelector(
        '.w-\\[21px\\].h-\\[21px\\]'
      );
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveStyle({
        backgroundColor: mockSubject1.subjectColor,
      });
      expect(iconContainer?.className).toContain('rounded-sm');
      expect(iconContainer?.className).toContain('text-text-950');

      // Check icon
      const icon = subjectCell.querySelector('[data-testid="icon-render"]');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icon-name', mockSubject1.subjectIcon);
      expect(icon).toHaveAttribute('data-size', '17');
      expect(icon).toHaveAttribute('data-color', 'currentColor');

      // Check text
      const text = subjectCell.querySelector('[data-testid="text"]');
      expect(text).toBeInTheDocument();
      expect(text).toHaveAttribute('data-size', 'sm');
      expect(text?.className).toContain('truncate');
      expect(text?.textContent).toBe(mockSubject1.subjectName);
    });

    it('should render different subjects with different colors and icons', () => {
      const modelsWithDifferentSubjects: ActivityModelTableItem[] = [
        {
          id: 'math',
          type: ActivityType.MODELO,
          title: 'Math Model',
          savedAt: '2024-01-01T00:00:00Z',
          subject: mockSubject1,
          subjectId: 's1',
        },
        {
          id: 'port',
          type: ActivityType.MODELO,
          title: 'Portuguese Model',
          savedAt: '2024-01-02T00:00:00Z',
          subject: mockSubject2,
          subjectId: 's2',
        },
      ];

      render(
        <ActivityModelsList
          {...defaultProps}
          models={modelsWithDifferentSubjects}
        />
      );

      // Check first subject (Math)
      const mathCell = screen.getByTestId('subject-cell-math');
      const mathIconContainer = mathCell.querySelector('.w-\\[21px\\]');
      expect(mathIconContainer).toHaveStyle({
        backgroundColor: mockSubject1.subjectColor,
      });
      const mathIcon = mathCell.querySelector('[data-icon-name]');
      expect(mathIcon).toHaveAttribute(
        'data-icon-name',
        mockSubject1.subjectIcon
      );
      const mathText = mathCell.querySelector('[data-testid="text"]');
      expect(mathText?.textContent).toBe(mockSubject1.subjectName);

      // Check second subject (Portuguese)
      const portCell = screen.getByTestId('subject-cell-port');
      const portIconContainer = portCell.querySelector('.w-\\[21px\\]');
      expect(portIconContainer).toHaveStyle({
        backgroundColor: mockSubject2.subjectColor,
      });
      const portIcon = portCell.querySelector('[data-icon-name]');
      expect(portIcon).toHaveAttribute(
        'data-icon-name',
        mockSubject2.subjectIcon
      );
      const portText = portCell.querySelector('[data-testid="text"]');
      expect(portText?.textContent).toBe(mockSubject2.subjectName);
    });

    it('should render mixed subjects (some null, some with value)', () => {
      const mixedModels: ActivityModelTableItem[] = [
        {
          id: 'with-subject',
          type: ActivityType.MODELO,
          title: 'With Subject',
          savedAt: '2024-01-01T00:00:00Z',
          subject: mockSubject1,
          subjectId: 's1',
        },
        {
          id: 'without-subject',
          type: ActivityType.MODELO,
          title: 'Without Subject',
          savedAt: '2024-01-02T00:00:00Z',
          subject: null,
          subjectId: null,
        },
      ];

      render(<ActivityModelsList {...defaultProps} models={mixedModels} />);

      // Check model with subject
      const withSubjectCell = screen.getByTestId('subject-cell-with-subject');
      const icon = withSubjectCell.querySelector('[data-icon-name]');
      expect(icon).toBeInTheDocument();
      const text = withSubjectCell.querySelector('[data-testid="text"]');
      expect(text?.textContent).toBe(mockSubject1.subjectName);

      // Check model without subject
      const withoutSubjectCell = screen.getByTestId(
        'subject-cell-without-subject'
      );
      const dashText = withoutSubjectCell.querySelector('[data-testid="text"]');
      expect(dashText?.textContent).toBe('-');
      expect(dashText).toHaveAttribute('data-color', 'text-text-400');
    });

    it('should have correct CSS classes for subject container', () => {
      const modelsWithSubject: ActivityModelTableItem[] = [
        {
          id: 'css-test',
          type: ActivityType.MODELO,
          title: 'CSS Test',
          savedAt: '2024-01-01T00:00:00Z',
          subject: mockSubject1,
          subjectId: 's1',
        },
      ];

      render(
        <ActivityModelsList {...defaultProps} models={modelsWithSubject} />
      );

      const subjectCell = screen.getByTestId('subject-cell-css-test');

      // Check main container classes
      const wrapper = subjectCell.querySelector('.flex.items-center.gap-2');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.className).toContain('flex');
      expect(wrapper?.className).toContain('items-center');
      expect(wrapper?.className).toContain('gap-2');

      // Check icon wrapper classes
      const iconWrapper = subjectCell.querySelector(
        '.w-\\[21px\\].h-\\[21px\\]'
      );
      expect(iconWrapper?.className).toContain('w-[21px]');
      expect(iconWrapper?.className).toContain('h-[21px]');
      expect(iconWrapper?.className).toContain('flex');
      expect(iconWrapper?.className).toContain('items-center');
      expect(iconWrapper?.className).toContain('justify-center');
      expect(iconWrapper?.className).toContain('rounded-sm');
      expect(iconWrapper?.className).toContain('text-text-950');
      expect(iconWrapper?.className).toContain('shrink-0');
    });

    it('should truncate long subject names', () => {
      const longSubject: SubjectData = {
        id: 'long',
        subjectName:
          'This is a very long subject name that should be truncated',
        subjectIcon: 'BookOpen',
        subjectColor: '#FF5733',
      };

      const modelsWithLongName: ActivityModelTableItem[] = [
        {
          id: 'long-name',
          type: ActivityType.MODELO,
          title: 'Long Name Test',
          savedAt: '2024-01-01T00:00:00Z',
          subject: longSubject,
          subjectId: 'long',
        },
      ];

      render(
        <ActivityModelsList {...defaultProps} models={modelsWithLongName} />
      );

      const subjectCell = screen.getByTestId('subject-cell-long-name');
      const text = subjectCell.querySelector('[data-testid="text"]');

      expect(text?.className).toContain('truncate');
      expect(text?.textContent).toBe(longSubject.subjectName);
    });
  });
});
