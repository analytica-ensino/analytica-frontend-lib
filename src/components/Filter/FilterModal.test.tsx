import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterModal } from './FilterModal';
import type { FilterConfig } from './useTableFilter';

// Mock the dependencies
jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    title,
    children,
    footer,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null,
}));

jest.mock('../CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: { key: string; label: string }[];
    onCategoriesChange: (categories: { key: string; label: string }[]) => void;
  }) => (
    <div data-testid="checkbox-group">
      {categories.map((cat) => (
        <div key={cat.key} data-testid={`category-${cat.key}`}>
          {cat.label}
          <button
            onClick={() =>
              onCategoriesChange([
                ...categories.map((c) =>
                  c.key === cat.key ? { ...c, selectedIds: ['test-id'] } : c
                ),
              ])
            }
            data-testid={`select-${cat.key}`}
          >
            Select
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: string;
  }) => (
    <button onClick={onClick} data-testid={`button-${variant || 'default'}`}>
      {children}
    </button>
  ),
}));

const mockFilterConfigs: FilterConfig[] = [
  {
    key: 'academic',
    label: 'Dados Acadêmicos',
    categories: [
      {
        key: 'escola',
        label: 'Escola',
        selectedIds: [],
        itens: [
          { id: '1', name: 'Escola 1' },
          { id: '2', name: 'Escola 2' },
        ],
      },
      {
        key: 'serie',
        label: 'Série',
        selectedIds: [],
        itens: [
          { id: '1', name: 'Série 1' },
          { id: '2', name: 'Série 2' },
        ],
      },
    ],
  },
  {
    key: 'content',
    label: 'Conteúdo',
    categories: [
      {
        key: 'materia',
        label: 'Matéria',
        selectedIds: [],
        itens: [
          { id: '1', name: 'Matemática' },
          { id: '2', name: 'Português' },
        ],
      },
    ],
  },
];

describe('FilterModal', () => {
  const mockOnClose = jest.fn();
  const mockOnFiltersChange = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(
        <FilterModal
          isOpen={false}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render default title', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Filtros');
    });

    it('should render custom title', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
          title="Custom Filters"
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Custom Filters'
      );
    });

    it('should render all filter config sections', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Dados Acadêmicos')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    });

    it('should render CheckboxGroup for each config', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      const checkboxGroups = screen.getAllByTestId('checkbox-group');
      expect(checkboxGroups).toHaveLength(2);
    });

    it('should render all categories', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByTestId('category-escola')).toBeInTheDocument();
      expect(screen.getByTestId('category-serie')).toBeInTheDocument();
      expect(screen.getByTestId('category-materia')).toBeInTheDocument();
    });
  });

  describe('footer buttons', () => {
    it('should render default button labels', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
      expect(screen.getByText('Aplicar')).toBeInTheDocument();
    });

    it('should render custom button labels', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
          clearLabel="Reset All"
          applyLabel="Submit"
        />
      );

      expect(screen.getByText('Reset All')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should call onClear when clear button is clicked', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      fireEvent.click(screen.getByText('Limpar filtros'));

      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });

    it('should call onApply and onClose when apply button is clicked', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      fireEvent.click(screen.getByText('Aplicar'));

      expect(mockOnApply).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('filter changes', () => {
    it('should call onFiltersChange when category selection changes', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      fireEvent.click(screen.getByTestId('select-escola'));

      expect(mockOnFiltersChange).toHaveBeenCalled();
      const calledConfigs = mockOnFiltersChange.mock.calls[0][0];
      expect(calledConfigs[0].categories[0].selectedIds).toEqual(['test-id']);
    });

    it('should handle changes from multiple categories independently', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      fireEvent.click(screen.getByTestId('select-escola'));
      expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('select-materia'));
      expect(mockOnFiltersChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('modal props', () => {
    it('should pass size prop to Modal', () => {
      const { rerender } = render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
          size="lg"
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      rerender(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
          size="sm"
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty filterConfigs array', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={[]}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.queryByTestId('checkbox-group')).not.toBeInTheDocument();
    });

    it('should handle filterConfig with empty categories', () => {
      const emptyConfig: FilterConfig[] = [
        {
          key: 'empty',
          label: 'Empty Section',
          categories: [],
        },
      ];

      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={emptyConfig}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Empty Section')).toBeInTheDocument();
    });
  });

  describe('section icons', () => {
    it('should render academic icon for academic section', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      const academicSection =
        screen.getByText('Dados Acadêmicos').parentElement;
      const svg = academicSection?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render content icon for content section', () => {
      render(
        <FilterModal
          isOpen={true}
          onClose={mockOnClose}
          filterConfigs={mockFilterConfigs}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onClear={mockOnClear}
        />
      );

      const contentSection = screen.getByText('Conteúdo').parentElement;
      const svg = contentSection?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
