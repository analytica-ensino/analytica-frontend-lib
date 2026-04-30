import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { SimuladosSubjectMenu } from './SimuladosSubjectMenu';
import type { SimulatedSubjectItem, SimulatedSubjectsApiClient } from './types';

jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('../IconRender/IconRender', () => ({
  __esModule: true,
  default: ({ iconName }: { iconName: string }) => (
    <span data-testid={`icon-${iconName}`}>icon</span>
  ),
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('../Menu/Menu', () => ({
  MenuOverflow: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange?: (value: string) => void;
  }) => (
    <div data-testid="menu-overflow" data-value={value}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const childValue = (child.props as { value: string }).value;
        const childLabel = (child.props as { children: React.ReactNode }).children;
        return (
          <button type="button" onClick={() => onValueChange?.(childValue)}>
            {childLabel}
          </button>
        );
      })}
    </div>
  ),
  MenuItem: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <span>{children}</span>,
}));

const mockFetchSubjects = jest.fn();
let mockHookState: {
  subjects: SimulatedSubjectItem[];
  loading: boolean;
};

jest.mock('./useSimulatedSubjects', () => ({
  useSimulatedSubjects: () => ({
    ...mockHookState,
    error: null,
    fetchSubjects: mockFetchSubjects,
    reset: jest.fn(),
  }),
}));

function createMockApi(): SimulatedSubjectsApiClient {
  return {
    get: jest.fn(),
  };
}

describe('SimuladosSubjectMenu', () => {
  const onSubjectChange = jest.fn();
  const api = createMockApi();

  beforeEach(() => {
    jest.clearAllMocks();
    mockHookState = {
      loading: false,
      subjects: [
        {
          id: 'math',
          name: 'Matematica',
          color: '#22C55E',
          icon: 'calculator',
        },
        {
          id: 'lang',
          name: 'Linguagens',
          color: '#3B82F6',
          icon: 'book-open',
        },
      ],
    };
  });

  it('renders default label and "Todos" option', () => {
    render(
      <SimuladosSubjectMenu
        api={api}
        areaKnowledgeId={null}
        selectedSubjectId={null}
        onSubjectChange={onSubjectChange}
      />
    );

    expect(screen.getByText('Disciplina')).toBeInTheDocument();
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Matematica')).toBeInTheDocument();
  });

  it('calls fetchSubjects on mount and areaKnowledgeId changes', () => {
    const { rerender } = render(
      <SimuladosSubjectMenu
        api={api}
        areaKnowledgeId={null}
        selectedSubjectId={null}
        onSubjectChange={onSubjectChange}
      />
    );

    expect(mockFetchSubjects).toHaveBeenCalledWith(null);

    rerender(
      <SimuladosSubjectMenu
        api={api}
        areaKnowledgeId="area-1"
        selectedSubjectId={null}
        onSubjectChange={onSubjectChange}
      />
    );

    expect(mockFetchSubjects).toHaveBeenLastCalledWith('area-1');
  });

  it('uses "all" as effective value when selectedSubjectId is null', () => {
    render(
      <SimuladosSubjectMenu
        api={api}
        areaKnowledgeId={null}
        selectedSubjectId={null}
        onSubjectChange={onSubjectChange}
      />
    );

    expect(screen.getByTestId('menu-overflow')).toHaveAttribute('data-value', 'all');
  });

  it('calls onSubjectChange when a subject is selected', () => {
    render(
      <SimuladosSubjectMenu
        api={api}
        areaKnowledgeId={null}
        selectedSubjectId="all"
        onSubjectChange={onSubjectChange}
      />
    );

    fireEvent.click(screen.getByText('Matematica'));

    expect(onSubjectChange).toHaveBeenCalledWith('math');
  });

  it('applies loading style when external loading is true', () => {
    const { container } = render(
      <SimuladosSubjectMenu
        api={api}
        areaKnowledgeId={null}
        selectedSubjectId="all"
        onSubjectChange={onSubjectChange}
        loading={true}
      />
    );

    expect(container.querySelector('.opacity-50')).toBeInTheDocument();
  });
});
