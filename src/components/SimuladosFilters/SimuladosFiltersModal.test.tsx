import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { SimuladosFiltersModal } from './SimuladosFiltersModal';
import type { ApiClient, SimuladosFilters } from './types';

jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    title,
    children,
    footer,
  }: {
    isOpen: boolean;
    title: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null,
}));

jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock('../CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: Array<{ key: string; selectedIds?: string[] }>;
    onCategoriesChange: (
      categories: Array<{ key: string; selectedIds?: string[] }>
    ) => void;
  }) => (
    <div data-testid="checkbox-group">
      <span data-testid="categories-selected">
        {categories
          .map((cat) => `${cat.key}:${(cat.selectedIds ?? []).join(',')}`)
          .join('|')}
      </span>
      <button
        type="button"
        onClick={() =>
          onCategoriesChange([
            { key: 'school', selectedIds: ['school-1'] },
            { key: 'schoolYear', selectedIds: ['year-1'] },
            { key: 'class', selectedIds: ['class-1'] },
          ])
        }
      >
        update-categories
      </button>
    </div>
  ),
}));

jest.mock('./StudentsFilterSection', () => ({
  StudentsFilterSection: ({
    onSelectionChange,
  }: {
    onSelectionChange: (ids: string[]) => void;
  }) => (
    <div data-testid="students-filter-section">
      <button
        type="button"
        onClick={() => onSelectionChange(['student-1', 'student-2'])}
      >
        select-students
      </button>
    </div>
  ),
}));

const mockFetchStudents = jest.fn();
const mockClearStudents = jest.fn();
let mockUserAccessState: {
  schools: Array<{ id: string; name: string }>;
  schoolYears: Array<{ id: string; name: string; schoolId: string }>;
  classes: Array<{
    id: string;
    name: string;
    schoolId: string;
    schoolYearId: string;
  }>;
  isLoading: boolean;
};
let mockStudentsState: {
  groupedStudents: Array<{ key: string; label: string; students: unknown[] }>;
  isLoading: boolean;
};

jest.mock('./hooks', () => ({
  useUserAccessData: () => ({
    ...mockUserAccessState,
    error: null,
    refetch: jest.fn(),
  }),
  useStudentsFilter: () => ({
    ...mockStudentsState,
    students: [],
    error: null,
    fetchStudents: mockFetchStudents,
    clearStudents: mockClearStudents,
  }),
}));

function createMockApi(): ApiClient {
  return {
    get: jest.fn(),
    post: jest.fn(),
  };
}

describe('SimuladosFiltersModal', () => {
  const onClose = jest.fn();
  const onApply = jest.fn();
  const api = createMockApi();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserAccessState = {
      schools: [{ id: 'school-1', name: 'Escola 1' }],
      schoolYears: [{ id: 'year-1', name: '3 ano', schoolId: 'school-1' }],
      classes: [
        {
          id: 'class-1',
          name: 'A',
          schoolId: 'school-1',
          schoolYearId: 'year-1',
        },
      ],
      isLoading: false,
    };
    mockStudentsState = {
      groupedStudents: [],
      isLoading: false,
    };
  });

  it('renders default title and footer actions', () => {
    render(
      <SimuladosFiltersModal
        isOpen
        onClose={onClose}
        onApply={onApply}
        api={api}
      />
    );

    expect(screen.getByTestId('modal-title')).toHaveTextContent('Filtros');
    expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
    expect(screen.getByText('Aplicar')).toBeInTheDocument();
  });

  it('renders loading state when academic filters are loading', () => {
    mockUserAccessState.isLoading = true;

    render(
      <SimuladosFiltersModal
        isOpen
        onClose={onClose}
        onApply={onApply}
        api={api}
      />
    );

    expect(screen.getByText('Carregando filtros...')).toBeInTheDocument();
    expect(screen.queryByTestId('checkbox-group')).not.toBeInTheDocument();
  });

  it('fetches students when class filter is selected initially', () => {
    render(
      <SimuladosFiltersModal
        isOpen
        onClose={onClose}
        onApply={onApply}
        api={api}
        initialFilters={{ classIds: ['class-1'] }}
      />
    );

    expect(mockFetchStudents).toHaveBeenCalledWith({
      schoolIds: ['school-1'],
      schoolYearIds: [],
      classIds: ['class-1'],
    });
  });

  it('clears students when no class is selected', () => {
    render(
      <SimuladosFiltersModal
        isOpen
        onClose={onClose}
        onApply={onApply}
        api={api}
      />
    );

    expect(mockClearStudents).toHaveBeenCalled();
  });

  it('applies selected category/student filters and closes modal', () => {
    render(
      <SimuladosFiltersModal
        isOpen
        onClose={onClose}
        onApply={onApply}
        api={api}
      />
    );

    fireEvent.click(screen.getByText('update-categories'));
    fireEvent.click(screen.getByText('select-students'));
    fireEvent.click(screen.getByText('Aplicar'));

    const expected: SimuladosFilters = {
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
      studentsIds: ['student-1', 'student-2'],
    };

    expect(onApply).toHaveBeenCalledWith(expected);
    expect(onClose).toHaveBeenCalled();
  });

  it('clears selected filters and selected students on clear action', () => {
    render(
      <SimuladosFiltersModal
        isOpen
        onClose={onClose}
        onApply={onApply}
        api={api}
        initialFilters={{
          schoolIds: ['school-1'],
          schoolYearIds: ['year-1'],
          classIds: ['class-1'],
          studentsIds: ['student-1'],
        }}
      />
    );

    fireEvent.click(screen.getByText('Limpar filtros'));
    fireEvent.click(screen.getByText('Aplicar'));

    expect(onApply).toHaveBeenCalledWith({
      schoolIds: [],
      schoolYearIds: [],
      classIds: [],
      studentsIds: [],
    });
    expect(mockClearStudents).toHaveBeenCalled();
  });

  it('uses custom labels when provided', () => {
    render(
      <SimuladosFiltersModal
        isOpen
        onClose={onClose}
        onApply={onApply}
        api={api}
        labels={{
          title: 'Meus filtros',
          clearButton: 'Resetar',
          applyButton: 'Confirmar',
        }}
      />
    );

    expect(screen.getByTestId('modal-title')).toHaveTextContent('Meus filtros');
    expect(screen.getByText('Resetar')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });
});
