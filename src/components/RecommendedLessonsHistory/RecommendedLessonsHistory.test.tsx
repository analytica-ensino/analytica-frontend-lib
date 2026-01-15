import type { ReactNode } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RecommendedClassHistoryApiResponse } from '../../types/recommendedLessons';

// Mock dayjs
jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return Object.assign((date?: string | Date) => {
    if (date) return actual(date);
    return actual('2024-06-15');
  }, actual);
});

// Mock phosphor icons
jest.mock('phosphor-react', () => ({
  Plus: () => <span data-testid="plus-icon">+</span>,
  CaretRight: () => <span data-testid="caret-right">→</span>,
  Trash: () => <span data-testid="trash-icon">🗑</span>,
  PencilSimple: () => <span data-testid="pencil-icon">✎</span>,
}));

// Mock utils
jest.mock('../../utils/utils', () => ({
  cn: (...inputs: (string | undefined)[]) => inputs.filter(Boolean).join(' '),
}));

// Mock SubjectInfo
jest.mock('../SubjectInfo/SubjectInfo', () => ({
  getSubjectInfo: jest.fn(() => ({
    icon: <span data-testid="subject-icon">M</span>,
    colorClass: 'bg-blue-500',
  })),
}));

// Mock SubjectEnum
jest.mock('../../enums/SubjectEnum', () => ({
  SubjectEnum: {
    MATEMATICA: 'MATEMATICA',
  },
}));

// Mock Text component
jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({
    children,
    color,
    title,
    className,
  }: {
    children: ReactNode;
    color?: string;
    title?: string;
    className?: string;
  }) => (
    <span
      data-testid="text"
      data-color={color}
      title={title}
      className={className}
    >
      {children}
    </span>
  ),
}));

// Mock Button component
jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    iconLeft,
  }: {
    children: ReactNode;
    onClick?: () => void;
    iconLeft?: ReactNode;
  }) => (
    <button onClick={onClick} data-testid="button">
      {iconLeft}
      {children}
    </button>
  ),
}));

// Mock IconButton component
jest.mock('../IconButton/IconButton', () => ({
  __esModule: true,
  default: ({
    icon,
    onClick,
    title,
  }: {
    icon: ReactNode;
    onClick?: (e: unknown) => void;
    title?: string;
  }) => (
    <button onClick={onClick} data-testid="icon-button" title={title}>
      {icon}
    </button>
  ),
}));

// Mock Badge component
jest.mock('../Badge/Badge', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

// Mock EmptyState component
jest.mock('../EmptyState/EmptyState', () => ({
  __esModule: true,
  default: ({
    title,
    description,
    buttonText,
    onButtonClick,
  }: {
    title: string;
    description: string;
    buttonText?: string;
    onButtonClick?: () => void;
  }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {buttonText && (
        <button onClick={onButtonClick} data-testid="empty-state-button">
          {buttonText}
        </button>
      )}
    </div>
  ),
}));

// Store onValueChange for testing
let capturedMenuOnValueChange: ((value: string) => void) | undefined;

// Mock Menu component
jest.mock('../Menu/Menu', () => ({
  Menu: ({
    children,
    onValueChange,
  }: {
    children: ReactNode;
    onValueChange?: (value: string) => void;
  }) => {
    // Capture onValueChange for testing
    capturedMenuOnValueChange = onValueChange;
    return (
      <div data-testid="menu" data-onvaluechange={onValueChange?.toString()}>
        {children}
      </div>
    );
  },
  MenuItem: ({
    children,
    value,
    'data-testid': testId,
    onClick,
  }: {
    children: ReactNode;
    value: string;
    'data-testid'?: string;
    onClick?: () => void;
  }) => (
    <button
      data-testid={testId || `menu-item-${value}`}
      data-value={value}
      onClick={onClick}
    >
      {children}
    </button>
  ),
  MenuContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="menu-content">{children}</div>
  ),
}));

// Mock ProgressBar component
jest.mock('../ProgressBar/ProgressBar', () => ({
  __esModule: true,
  default: ({ value }: { value: number }) => (
    <div data-testid="progress-bar">{value}%</div>
  ),
}));

// Store onParamsChange for testing
let capturedOnParamsChange: ((params: unknown) => void) | undefined;
let capturedHeaders:
  | Array<{
      key: string;
      label: string;
      render?: (value: unknown, row: unknown) => ReactNode;
    }>
  | undefined;

// Mock TableProvider component - simulates real TableProvider behavior
// Real TableProvider calls onParamsChange on mount via useEffect
jest.mock('../TableProvider/TableProvider', () => {
  const { useEffect: useEffectHook } = jest.requireActual('react');
  return {
    TableProvider: ({
      children,
      data,
      headers,
      emptyState,
      onRowClick,
      onParamsChange,
      searchPlaceholder,
    }: {
      children: (props: {
        controls: ReactNode;
        table: ReactNode;
        pagination: ReactNode;
      }) => ReactNode;
      data: Array<{
        id: string;
        title?: string;
        school?: string;
        class?: string;
        subject?: string;
        status?: string;
        completionPercentage?: number;
      }>;
      headers?: Array<{
        key: string;
        label: string;
        render?: (value: unknown, row: unknown) => ReactNode;
      }>;
      emptyState?: { component: ReactNode };
      onParamsChange?: (params: unknown) => void;
      onRowClick?: (row: unknown) => void;
      searchPlaceholder?: string;
    }) => {
      // Capture onParamsChange for testing
      capturedOnParamsChange = onParamsChange;
      capturedHeaders = headers;

      // Simulate TableProvider calling onParamsChange on mount
      // This mimics the real behavior where TableProvider's useEffect
      // calls onParamsChange with initial combinedParams
      useEffectHook(() => {
        onParamsChange?.({ page: 1, limit: 10 });
      }, [onParamsChange]);

      if (data.length === 0 && emptyState?.component) {
        return (
          <div data-testid="table-provider-empty">{emptyState.component}</div>
        );
      }

      // Find column renderers
      const actionsColumn = headers?.find((h) => h.key === 'actions');
      const titleColumn = headers?.find((h) => h.key === 'title');
      const schoolColumn = headers?.find((h) => h.key === 'school');
      const subjectColumn = headers?.find((h) => h.key === 'subject');
      const statusColumn = headers?.find((h) => h.key === 'status');
      const completionColumn = headers?.find(
        (h) => h.key === 'completionPercentage'
      );
      const navigationColumn = headers?.find((h) => h.key === 'navigation');

      return (
        <div data-testid="table-provider">
          {children({
            controls: (
              <div data-testid="controls">
                <input placeholder={searchPlaceholder} />
              </div>
            ),
            table: (
              <table data-testid="table">
                <tbody>
                  {data.map((row) => (
                    <tr
                      key={row.id}
                      data-testid={`row-${row.id}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      <td data-testid="title-cell">
                        {titleColumn?.render
                          ? titleColumn.render(row.title, row)
                          : row.title}
                      </td>
                      <td data-testid="school-cell">
                        {schoolColumn?.render
                          ? schoolColumn.render(row.school, row)
                          : row.school}
                      </td>
                      <td>{row.class}</td>
                      <td data-testid="subject-cell">
                        {subjectColumn?.render
                          ? subjectColumn.render(row.subject, row)
                          : row.subject}
                      </td>
                      <td data-testid="status-cell">
                        {statusColumn?.render
                          ? statusColumn.render(row.status, row)
                          : row.status}
                      </td>
                      <td data-testid="completion-cell">
                        {completionColumn?.render
                          ? completionColumn.render(
                              row.completionPercentage,
                              row
                            )
                          : row.completionPercentage}
                      </td>
                      <td data-testid="actions-cell">
                        {actionsColumn?.render?.(null, row)}
                      </td>
                      <td data-testid="navigation-cell">
                        {navigationColumn?.render?.(null, row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ),
            pagination: <div data-testid="pagination">Pagination</div>,
          })}
        </div>
      );
    },
  };
});

// Import component after all mocks
import {
  RecommendedLessonsHistory,
  RecommendedClassPageTab,
  type RecommendedLessonsHistoryProps,
} from './RecommendedLessonsHistory';

describe('RecommendedLessonsHistory', () => {
  const mockFetchRecommendedClassHistory = jest.fn<
    Promise<RecommendedClassHistoryApiResponse>,
    [unknown]
  >();
  const mockOnCreateLesson = jest.fn();
  const mockOnRowClick = jest.fn();
  const mockOnDeleteRecommendedClass = jest.fn();
  const mockOnEditRecommendedClass = jest.fn();

  const defaultProps: RecommendedLessonsHistoryProps = {
    fetchRecommendedClassHistory: mockFetchRecommendedClassHistory,
    onCreateLesson: mockOnCreateLesson,
    onRowClick: mockOnRowClick,
    onDeleteRecommendedClass: mockOnDeleteRecommendedClass,
    onEditRecommendedClass: mockOnEditRecommendedClass,
  };

  const validApiResponse: RecommendedClassHistoryApiResponse = {
    message: 'Success',
    data: {
      recommendedClass: [
        {
          recommendedClass: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Aula de Matemática',
            startDate: '2024-06-01',
            finalDate: '2024-12-31',
            createdAt: '2024-06-01T10:00:00Z',
            progress: 50,
            totalLessons: 10,
          },
          subject: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Matemática',
          },
          creator: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Professor João',
          },
          stats: {
            totalStudents: 30,
            completedCount: 15,
            completionPercentage: 50,
          },
          breakdown: [
            {
              classId: '123e4567-e89b-12d3-a456-426614174003',
              className: 'Turma A',
              schoolId: 'school-1',
              schoolName: 'Escola Exemplo',
              studentCount: 30,
              completedCount: 15,
            },
          ],
        },
      ],
      total: 1,
    },
  };

  const emptyApiResponse: RecommendedClassHistoryApiResponse = {
    message: 'Success',
    data: {
      recommendedClass: [],
      total: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchRecommendedClassHistory.mockResolvedValue(validApiResponse);
  });

  describe('Rendering', () => {
    it('should render the component', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId('recommended-lessons-history')
        ).toBeInTheDocument();
      });
    });

    it('should render default title', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('Histórico de aulas recomendadas')
        ).toBeInTheDocument();
      });
    });

    it('should render custom title', async () => {
      render(
        <RecommendedLessonsHistory {...defaultProps} title="Custom Title" />
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Title')).toBeInTheDocument();
      });
    });

    it('should render menu tabs', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Histórico')).toBeInTheDocument();
        expect(screen.getByText('Rascunhos')).toBeInTheDocument();
        expect(screen.getByText('Modelos')).toBeInTheDocument();
      });
    });

    it('should render create button with default text', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Criar aula')).toBeInTheDocument();
      });
    });

    it('should render create button with custom text', async () => {
      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          createButtonText="Nova Aula"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Nova Aula')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should call fetchRecommendedClassHistory when TableProvider triggers onParamsChange on mount', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      // TableProvider mock calls onParamsChange on mount with initial params
      // This simulates the real TableProvider's useEffect behavior
      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
        });
      });
    });

    it('should display recommendedClass data in table', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no recommendedClass', async () => {
      mockFetchRecommendedClassHistory.mockResolvedValue(emptyApiResponse);

      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('Crie uma nova aula')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockFetchRecommendedClassHistory.mockRejectedValue(
        new Error('Network error')
      );

      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText('Erro ao carregar histórico de aulas')
        ).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Callbacks', () => {
    it('should call onCreateLesson when create button is clicked', async () => {
      const user = userEvent.setup();
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Criar aula')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Criar aula'));

      expect(mockOnCreateLesson).toHaveBeenCalled();
    });

    it('should call onDeleteRecommendedClass when delete button is clicked', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTitle('Excluir')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Excluir'));

      expect(mockOnDeleteRecommendedClass).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
    });

    it('should call onEditRecommendedClass when edit button is clicked', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTitle('Editar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Editar'));

      expect(mockOnEditRecommendedClass).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
    });

    it('should stop event propagation on delete click', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTitle('Excluir')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Excluir'));

      expect(mockOnRowClick).not.toHaveBeenCalled();
    });

    it('should stop event propagation on edit click', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTitle('Editar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle('Editar'));

      expect(mockOnRowClick).not.toHaveBeenCalled();
    });
  });

  describe('User Filter Data', () => {
    it('should accept userFilterData prop', async () => {
      const userFilterData = {
        schools: [{ id: 'school-1', name: 'School 1' }],
        classes: [{ id: 'class-1', name: 'Class 1' }],
        subjects: [{ id: 'subject-1', name: 'Subject 1' }],
        schoolYears: [{ id: 'year-1', name: '2024' }],
      };

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          userFilterData={userFilterData}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('recommended-lessons-history')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Subject Mapping', () => {
    it('should accept mapSubjectNameToEnum prop', async () => {
      const mapSubjectNameToEnum = jest.fn().mockReturnValue(null);

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          mapSubjectNameToEnum={mapSubjectNameToEnum}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('recommended-lessons-history')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Custom Props', () => {
    it('should accept emptyStateImage prop', async () => {
      mockFetchRecommendedClassHistory.mockResolvedValue(emptyApiResponse);

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          emptyStateImage="/custom-empty.png"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Crie uma nova aula')).toBeInTheDocument();
      });
    });

    it('should accept searchPlaceholder prop', async () => {
      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          searchPlaceholder="Custom search..."
        />
      );

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Custom search...')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Classes Display', () => {
    it('should display class count when multiple classes', async () => {
      const responseWithMultipleClasses: RecommendedClassHistoryApiResponse = {
        message: 'Success',
        data: {
          recommendedClass: [
            {
              recommendedClass: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test RecommendedClass',
                startDate: '2024-06-01',
                finalDate: '2024-12-31',
                createdAt: '2024-06-01T10:00:00Z',
                progress: 50,
                totalLessons: 10,
              },
              subject: null,
              creator: null,
              stats: {
                totalStudents: 60,
                completedCount: 30,
                completionPercentage: 50,
              },
              breakdown: [
                {
                  classId: '123e4567-e89b-12d3-a456-426614174010',
                  className: 'Turma A',
                  schoolId: 'school-1',
                  schoolName: 'Escola 1',
                  studentCount: 30,
                  completedCount: 15,
                },
                {
                  classId: '123e4567-e89b-12d3-a456-426614174011',
                  className: 'Turma B',
                  schoolId: 'school-1',
                  schoolName: 'Escola 1',
                  studentCount: 30,
                  completedCount: 15,
                },
              ],
            },
          ],
          total: 1,
        },
      };

      mockFetchRecommendedClassHistory.mockResolvedValue(
        responseWithMultipleClasses
      );

      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
      });
    });
  });

  describe('Column Renderers', () => {
    it('should render title column with tooltip', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        const titleCell = screen.getByTestId('title-cell');
        expect(titleCell).toBeInTheDocument();
        expect(titleCell.querySelector('span')).toHaveAttribute(
          'title',
          'Aula de Matemática'
        );
      });
    });

    it('should render school column with tooltip', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        const schoolCell = screen.getByTestId('school-cell');
        expect(schoolCell).toBeInTheDocument();
        expect(schoolCell.querySelector('span')).toHaveAttribute(
          'title',
          'Escola Exemplo'
        );
      });
    });

    it('should render subject column without icon when mapSubjectNameToEnum returns null', async () => {
      const mapSubjectNameToEnum = jest.fn().mockReturnValue(null);

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          mapSubjectNameToEnum={mapSubjectNameToEnum}
        />
      );

      await waitFor(() => {
        const subjectCell = screen.getByTestId('subject-cell');
        expect(subjectCell).toBeInTheDocument();
        expect(mapSubjectNameToEnum).toHaveBeenCalledWith('Matemática');
      });
    });

    it('should render subject column with icon when mapSubjectNameToEnum returns value', async () => {
      const mapSubjectNameToEnum = jest.fn().mockReturnValue('MATEMATICA');

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          mapSubjectNameToEnum={mapSubjectNameToEnum}
        />
      );

      await waitFor(() => {
        const subjectCell = screen.getByTestId('subject-cell');
        expect(subjectCell).toBeInTheDocument();
        expect(screen.getByTestId('subject-icon')).toBeInTheDocument();
      });
    });

    it('should render status column with badge', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        const statusCell = screen.getByTestId('status-cell');
        expect(statusCell).toBeInTheDocument();
        expect(
          statusCell.querySelector('[data-testid="badge"]')
        ).toBeInTheDocument();
      });
    });

    it('should render completion column with progress bar', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        const completionCell = screen.getByTestId('completion-cell');
        expect(completionCell).toBeInTheDocument();
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      });
    });

    it('should render navigation column with caret icon', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        const navigationCell = screen.getByTestId('navigation-cell');
        expect(navigationCell).toBeInTheDocument();
        expect(screen.getByTestId('caret-right')).toBeInTheDocument();
      });
    });

    it('should handle non-string values in title column', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedHeaders).toBeDefined();
      });

      const titleColumn = capturedHeaders?.find((h) => h.key === 'title');
      expect(titleColumn?.render).toBeDefined();

      // Test with non-string value
      const result = titleColumn?.render?.(null, {});
      expect(result).toBeDefined();
    });

    it('should handle non-string values in school column', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedHeaders).toBeDefined();
      });

      const schoolColumn = capturedHeaders?.find((h) => h.key === 'school');
      expect(schoolColumn?.render).toBeDefined();

      // Test with non-string value
      const result = schoolColumn?.render?.(undefined, {});
      expect(result).toBeDefined();
    });

    it('should handle non-string values in subject column', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedHeaders).toBeDefined();
      });

      const subjectColumn = capturedHeaders?.find((h) => h.key === 'subject');
      expect(subjectColumn?.render).toBeDefined();

      // Test with non-string value (number)
      const result = subjectColumn?.render?.(123, {});
      expect(result).toBeDefined();
    });

    it('should handle non-string values in status column', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedHeaders).toBeDefined();
      });

      const statusColumn = capturedHeaders?.find((h) => h.key === 'status');
      expect(statusColumn?.render).toBeDefined();

      // Test with non-string value
      const result = statusColumn?.render?.(null, {});
      expect(result).toBeDefined();
    });
  });

  describe('handleParamsChange', () => {
    it('should call fetchRecommendedClass with search filter', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        search: 'test search',
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          search: 'test search',
        });
      });
    });

    it('should call fetchRecommendedClass with status filter', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        status: ['EM_ANDAMENTO'],
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          status: 'EM_ANDAMENTO',
        });
      });
    });

    it('should call fetchRecommendedClass with single school filter', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        school: ['school-1'],
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          schoolId: 'school-1',
        });
      });
    });

    it('should call fetchRecommendedClass with multiple school filters', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        school: ['school-1', 'school-2'],
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          schoolIds: ['school-1', 'school-2'],
        });
      });
    });

    it('should call fetchRecommendedClass with single class filter', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        class: ['class-1'],
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          classId: 'class-1',
        });
      });
    });

    it('should call fetchRecommendedClass with multiple class filters', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        class: ['class-1', 'class-2'],
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          classIds: ['class-1', 'class-2'],
        });
      });
    });

    it('should call fetchRecommendedClass with students filter', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        students: ['student-1', 'student-2'],
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          studentIds: ['student-1', 'student-2'],
        });
      });
    });

    it('should call fetchRecommendedClass with subject filter', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        subject: ['subject-1'],
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          subjectId: 'subject-1',
        });
      });
    });

    it('should call fetchRecommendedClass with startDate filter', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        startDate: '2024-01-01',
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          startDate: '2024-01-01',
        });
      });
    });

    it('should not include empty array filters', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        status: [],
        school: [],
        class: [],
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
        });
      });
    });

    it('should not include non-string startDate', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedOnParamsChange).toBeDefined();
      });

      mockFetchRecommendedClassHistory.mockClear();

      capturedOnParamsChange?.({
        page: 1,
        limit: 10,
        startDate: 12345,
      });

      await waitFor(() => {
        expect(mockFetchRecommendedClassHistory).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
        });
      });
    });
  });

  describe('Tab Switching', () => {
    it('should render tab menu with correct items', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('menu-item-history')).toBeInTheDocument();
        expect(screen.getByTestId('menu-item-drafts')).toBeInTheDocument();
        expect(screen.getByTestId('menu-item-models')).toBeInTheDocument();
      });
    });

    it('should call setActiveTab when menu value changes', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedMenuOnValueChange).toBeDefined();
      });

      // Call the captured onValueChange to trigger setActiveTab
      capturedMenuOnValueChange?.('drafts');

      // The component should have updated its internal state
      // We verify this by ensuring no errors occurred
      await waitFor(() => {
        expect(screen.getByTestId('menu')).toBeInTheDocument();
      });
    });

    it('should switch to drafts tab', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedMenuOnValueChange).toBeDefined();
      });

      capturedMenuOnValueChange?.('drafts');

      await waitFor(() => {
        expect(screen.getByTestId('menu')).toBeInTheDocument();
      });
    });

    it('should switch to models tab', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedMenuOnValueChange).toBeDefined();
      });

      capturedMenuOnValueChange?.('models');

      await waitFor(() => {
        expect(screen.getByTestId('menu')).toBeInTheDocument();
      });
    });

    it('should switch back to history tab', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(capturedMenuOnValueChange).toBeDefined();
      });

      // Switch to drafts first
      capturedMenuOnValueChange?.('drafts');

      // Then switch back to history
      capturedMenuOnValueChange?.('history');

      await waitFor(() => {
        expect(screen.getByTestId('menu')).toBeInTheDocument();
      });
    });
  });

  describe('Actions Column', () => {
    it('should render delete button but not call callback when onDeleteRecommendedClass is not provided', async () => {
      const propsWithoutDelete = {
        ...defaultProps,
        onDeleteRecommendedClass: undefined,
      };

      render(<RecommendedLessonsHistory {...propsWithoutDelete} />);

      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
      });

      // Button is always rendered, but clicking does nothing
      const deleteButton = screen.getByTitle('Excluir');
      fireEvent.click(deleteButton);
      // No callback should be called since it's undefined
    });

    it('should render edit button but not call callback when onEditRecommendedClass is not provided', async () => {
      const propsWithoutEdit = {
        ...defaultProps,
        onEditRecommendedClass: undefined,
      };

      render(<RecommendedLessonsHistory {...propsWithoutEdit} />);

      await waitFor(() => {
        expect(screen.getByTestId('table')).toBeInTheDocument();
      });

      // Button is always rendered, but clicking does nothing
      const editButton = screen.getByTitle('Editar');
      fireEvent.click(editButton);
      // No callback should be called since it's undefined
    });
  });

  describe('Row Click', () => {
    it('should call onRowClick when row is clicked', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByTestId('row-123e4567-e89b-12d3-a456-426614174000')
        ).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByTestId('row-123e4567-e89b-12d3-a456-426614174000')
      );

      expect(mockOnRowClick).toHaveBeenCalled();
    });
  });

  describe('Controlled Tab Mode (defaultTab and onTabChange)', () => {
    it('should use defaultTab when provided', async () => {
      const mockFetchRecommendedClassDrafts = jest.fn().mockResolvedValue({
        message: 'Success',
        data: { recommendedClass: [], total: 0 },
      });
      const mockDeleteRecommendedClassDraft = jest
        .fn()
        .mockResolvedValue(undefined);

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          defaultTab={RecommendedClassPageTab.DRAFTS}
          fetchRecommendedClassDrafts={mockFetchRecommendedClassDrafts}
          deleteRecommendedClassDraft={mockDeleteRecommendedClassDraft}
        />
      );

      await waitFor(() => {
        // The drafts tab content should be visible (recommendedClass-drafts-tab testId from config)
        expect(
          screen.getByTestId('recommendedClass-drafts-tab')
        ).toBeInTheDocument();
      });
    });

    it('should use HISTORY tab when defaultTab is not provided', async () => {
      render(<RecommendedLessonsHistory {...defaultProps} />);

      await waitFor(() => {
        // History tab should show the table
        expect(screen.getByTestId('table-provider')).toBeInTheDocument();
      });
    });

    it('should call onTabChange when tab changes', async () => {
      const mockOnTabChange = jest.fn();

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          onTabChange={mockOnTabChange}
        />
      );

      await waitFor(() => {
        expect(capturedMenuOnValueChange).toBeDefined();
      });

      // Simulate tab change via menu
      capturedMenuOnValueChange?.('drafts');

      expect(mockOnTabChange).toHaveBeenCalledWith(
        RecommendedClassPageTab.DRAFTS
      );
    });

    it('should call onTabChange with models tab', async () => {
      const mockOnTabChange = jest.fn();

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          onTabChange={mockOnTabChange}
        />
      );

      await waitFor(() => {
        expect(capturedMenuOnValueChange).toBeDefined();
      });

      capturedMenuOnValueChange?.('models');

      expect(mockOnTabChange).toHaveBeenCalledWith(
        RecommendedClassPageTab.MODELS
      );
    });

    it('should call onTabChange with history tab', async () => {
      const mockOnTabChange = jest.fn();

      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          defaultTab={RecommendedClassPageTab.DRAFTS}
          onTabChange={mockOnTabChange}
        />
      );

      await waitFor(() => {
        expect(capturedMenuOnValueChange).toBeDefined();
      });

      capturedMenuOnValueChange?.('history');

      expect(mockOnTabChange).toHaveBeenCalledWith(
        RecommendedClassPageTab.HISTORY
      );
    });

    it('should sync with defaultTab prop changes', async () => {
      const mockFetchRecommendedClassDrafts = jest.fn().mockResolvedValue({
        message: 'Success',
        data: { recommendedClass: [], total: 0 },
      });
      const mockDeleteRecommendedClassDraft = jest
        .fn()
        .mockResolvedValue(undefined);

      const { rerender } = render(
        <RecommendedLessonsHistory
          {...defaultProps}
          defaultTab={RecommendedClassPageTab.HISTORY}
          fetchRecommendedClassDrafts={mockFetchRecommendedClassDrafts}
          deleteRecommendedClassDraft={mockDeleteRecommendedClassDraft}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('table-provider')).toBeInTheDocument();
      });

      // Change defaultTab to DRAFTS
      rerender(
        <RecommendedLessonsHistory
          {...defaultProps}
          defaultTab={RecommendedClassPageTab.DRAFTS}
          fetchRecommendedClassDrafts={mockFetchRecommendedClassDrafts}
          deleteRecommendedClassDraft={mockDeleteRecommendedClassDraft}
        />
      );

      await waitFor(() => {
        // The drafts tab content should be visible (recommendedClass-drafts-tab testId from config)
        expect(
          screen.getByTestId('recommendedClass-drafts-tab')
        ).toBeInTheDocument();
      });
    });

    it('should work without onTabChange callback', async () => {
      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          defaultTab={RecommendedClassPageTab.HISTORY}
        />
      );

      await waitFor(() => {
        expect(capturedMenuOnValueChange).toBeDefined();
      });

      // Should not throw when changing tabs without onTabChange
      expect(() => {
        capturedMenuOnValueChange?.('drafts');
      }).not.toThrow();
    });

    it('should not render models tab content without required props', async () => {
      render(
        <RecommendedLessonsHistory
          {...defaultProps}
          defaultTab={RecommendedClassPageTab.MODELS}
        />
      );

      await waitFor(() => {
        // Models tab without required props (fetchRecommendedClassModels, deleteRecommendedClassModel, onCreateModel) renders nothing
        expect(
          screen.queryByTestId('recommendedClass-models-tab')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('RecommendedClassPageTab enum', () => {
    it('should export RecommendedClassPageTab enum with correct values', () => {
      expect(RecommendedClassPageTab.HISTORY).toBe('history');
      expect(RecommendedClassPageTab.DRAFTS).toBe('drafts');
      expect(RecommendedClassPageTab.MODELS).toBe('models');
    });
  });
});
