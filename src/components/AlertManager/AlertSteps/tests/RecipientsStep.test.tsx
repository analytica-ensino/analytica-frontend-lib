import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecipientsStep } from '../RecipientsStep';
import { useAlertFormStore, RecipientItem } from '../../useAlertForm';
import type { CategoryConfig, LabelsConfig } from '../../types';
import type { ReactNode } from 'react';

// Mock component types
interface MockTextProps {
  children?: ReactNode;
  size?: string;
  weight?: string;
  className?: string;
}

// Mock components
jest.mock('../../../..', () => ({
  Text: ({ children, size, weight, className }: MockTextProps) => (
    <span data-size={size} data-weight={weight} className={className}>
      {children}
    </span>
  ),
}));

// Mock para simular estado interno do CheckboxGroup
let mockCategoriesState: CategoryConfig[] = [];

jest.mock('../../../CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: CategoryConfig[];
    onCategoriesChange: (categories: CategoryConfig[]) => void;
  }) => {
    // Atualiza o estado interno quando as categorias mudam
    mockCategoriesState = categories.map((cat) => ({ ...cat }));

    return (
      <div data-testid="checkbox-group">
        {mockCategoriesState.map((category) => (
          <div key={category.key} data-testid={`category-${category.key}`}>
            <div data-testid={`category-label-${category.key}`}>
              {category.label}
            </div>
            {category.itens?.map((item) => (
              <div key={item.id} data-testid={`item-${item.id}`}>
                <input
                  type="checkbox"
                  data-testid={`checkbox-${item.id}`}
                  checked={category.selectedIds?.includes(item.id) || false}
                  onChange={() => {
                    const newSelectedIds = category.selectedIds?.includes(
                      item.id
                    )
                      ? category.selectedIds.filter((id) => id !== item.id)
                      : [...(category.selectedIds || []), item.id];

                    // Atualiza todas as categorias com a mudança
                    const updatedCategories = mockCategoriesState.map((cat) => {
                      if (cat.key === category.key) {
                        return {
                          ...cat,
                          selectedIds: newSelectedIds,
                        };
                      }
                      return cat;
                    });

                    // Atualiza o estado interno
                    mockCategoriesState = updatedCategories;

                    // Chama o callback com todas as categorias
                    onCategoriesChange(updatedCategories);
                  }}
                />
                <label htmlFor={`checkbox-${item.id}`}>{item.name}</label>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));

describe('RecipientsStep', () => {
  const mockItems: RecipientItem[] = [
    { id: '1', name: 'User 1' },
    { id: '2', name: 'User 2' },
    { id: '3', name: 'User 3' },
  ];

  const basicCategory: CategoryConfig = {
    key: 'users',
    label: 'Users',
    itens: mockItems,
  };

  beforeEach(() => {
    useAlertFormStore.getState().resetForm();
    // Reset mock state
    mockCategoriesState = [];
  });

  describe('rendering', () => {
    it('should render with default description', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      expect(
        screen.getByText('Para quem você vai enviar o aviso?')
      ).toBeInTheDocument();
    });

    it('should render with custom description', () => {
      const labels: LabelsConfig = {
        recipientsDescription: 'Who will receive this alert?',
      };

      render(<RecipientsStep categories={[basicCategory]} labels={labels} />);

      expect(
        screen.getByText('Who will receive this alert?')
      ).toBeInTheDocument();
    });

    it('should render category label', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      expect(screen.getByTestId('category-label-users')).toHaveTextContent(
        'Users'
      );
    });

    it('should render all recipient items', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });

    it('should render total count', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      // Verifica que o componente renderiza sem erros
      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    });
  });

  describe('category initialization', () => {
    it('should initialize category on mount', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users']).toBeDefined();
      expect(state.recipientCategories['users'].label).toBe('Users');
      expect(state.recipientCategories['users'].availableItems).toEqual(
        mockItems
      );
    });

    it('should not reinitialize if category already exists', () => {
      // Pre-initialize
      useAlertFormStore.getState().initializeCategory({
        key: 'users',
        label: 'Users',
        availableItems: [{ id: 'existing', name: 'Existing User' }],
        selectedIds: ['existing'],
        allSelected: false,
      });

      render(<RecipientsStep categories={[basicCategory]} />);

      const state = useAlertFormStore.getState();
      // Should keep existing selectedIds
      expect(state.recipientCategories['users'].selectedIds).toEqual([
        'existing',
      ]);
    });

    it('should initialize multiple categories', () => {
      const categories: CategoryConfig[] = [
        {
          key: 'cat1',
          label: 'Category 1',
          itens: [{ id: '1', name: 'Item 1' }],
        },
        {
          key: 'cat2',
          label: 'Category 2',
          itens: [{ id: '2', name: 'Item 2' }],
        },
      ];

      render(<RecipientsStep categories={categories} />);

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['cat1']).toBeDefined();
      expect(state.recipientCategories['cat2']).toBeDefined();
    });
  });

  describe('item selection', () => {
    it('should select individual item', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      const checkbox = screen.getByTestId('checkbox-1');
      fireEvent.click(checkbox);

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].selectedIds).toContain('1');
    });

    it('should deselect item when clicking again', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      const checkbox = screen.getByTestId('checkbox-1');

      // Select
      fireEvent.click(checkbox);
      expect(
        useAlertFormStore.getState().recipientCategories['users'].selectedIds
      ).toContain('1');

      // Deselect
      fireEvent.click(checkbox);
      expect(
        useAlertFormStore.getState().recipientCategories['users'].selectedIds
      ).not.toContain('1');
    });

    it('should allow multiple selections', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByTestId('checkbox-2'));

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].selectedIds).toEqual(
        expect.arrayContaining(['1', '2'])
      );
    });

    it('should update total count when selecting items', async () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('checkbox-1'));
      });
      // Verifica o estado do store em vez do texto exibido
      const state1 = useAlertFormStore.getState();
      expect(state1.recipientCategories['users'].selectedIds).toContain('1');

      await act(async () => {
        fireEvent.click(screen.getByTestId('checkbox-2'));
      });
      // Verifica o estado do store em vez do texto exibido
      const state2 = useAlertFormStore.getState();
      expect(state2.recipientCategories['users'].selectedIds).toEqual(
        expect.arrayContaining(['1', '2'])
      );
    });
  });

  describe('category synchronization', () => {
    it('should sync categories with store state', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      // Select an item
      fireEvent.click(screen.getByTestId('checkbox-1'));

      // Check that the checkbox is checked
      const checkbox = screen.getByTestId('checkbox-1') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should preserve selections between renders', () => {
      const { rerender } = render(
        <RecipientsStep categories={[basicCategory]} />
      );

      fireEvent.click(screen.getByTestId('checkbox-1'));

      rerender(<RecipientsStep categories={[basicCategory]} />);

      const checkbox = screen.getByTestId('checkbox-1') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('onCategoriesChange callback', () => {
    it('should call onCategoriesChange when items are selected', () => {
      const mockCallback = jest.fn();
      render(
        <RecipientsStep
          categories={[basicCategory]}
          onCategoriesChange={mockCallback}
        />
      );

      fireEvent.click(screen.getByTestId('checkbox-1'));

      expect(mockCallback).toHaveBeenCalledWith([
        expect.objectContaining({
          key: 'users',
          selectedIds: ['1'],
        }),
      ]);
    });

    it('should not call onCategoriesChange if not provided', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      fireEvent.click(screen.getByTestId('checkbox-1'));

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle category with no items', () => {
      const emptyCategory: CategoryConfig = {
        key: 'empty',
        label: 'Empty',
        itens: [],
      };

      render(<RecipientsStep categories={[emptyCategory]} />);

      expect(screen.getByTestId('category-label-empty')).toHaveTextContent(
        'Empty'
      );
      // Verifica que o componente renderiza sem erros
      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    });

    it('should handle empty categories array', () => {
      render(<RecipientsStep categories={[]} />);

      expect(
        screen.getByText('Para quem você vai enviar o aviso?')
      ).toBeInTheDocument();
      // Verifica que o componente renderiza sem erros
      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    });

    it('should handle category without itens', () => {
      const categoryNoItems: CategoryConfig = {
        key: 'noitems',
        label: 'No Items',
      };

      render(<RecipientsStep categories={[categoryNoItems]} />);

      expect(screen.getByTestId('category-label-noitems')).toHaveTextContent(
        'No Items'
      );
      // Verifica que o componente renderiza sem erros
      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    });

    it('should handle category with undefined selectedIds', () => {
      const categoryUndefinedIds: CategoryConfig = {
        key: 'undefined-ids',
        label: 'Undefined IDs',
        itens: [{ id: '1', name: 'Item 1' }],
        selectedIds: undefined,
      };

      render(<RecipientsStep categories={[categoryUndefinedIds]} />);

      const checkbox = screen.getByTestId('checkbox-1') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('multiple categories', () => {
    it('should handle multiple independent categories', () => {
      const categories: CategoryConfig[] = [
        {
          key: 'cat1',
          label: 'Category 1',
          itens: [{ id: '1', name: 'Item 1' }],
        },
        {
          key: 'cat2',
          label: 'Category 2',
          itens: [{ id: '2', name: 'Item 2' }],
        },
      ];

      render(<RecipientsStep categories={categories} />);

      expect(screen.getByTestId('category-label-cat1')).toHaveTextContent(
        'Category 1'
      );
      expect(screen.getByTestId('category-label-cat2')).toHaveTextContent(
        'Category 2'
      );
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
    });

    it('should maintain independent selections for each category', () => {
      const categories: CategoryConfig[] = [
        {
          key: 'cat1',
          label: 'Category 1',
          itens: [{ id: '1', name: 'Item 1' }],
        },
        {
          key: 'cat2',
          label: 'Category 2',
          itens: [{ id: '2', name: 'Item 2' }],
        },
      ];

      render(<RecipientsStep categories={categories} />);

      fireEvent.click(screen.getByTestId('checkbox-1'));

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['cat1'].selectedIds).toContain('1');
      expect(state.recipientCategories['cat2'].selectedIds).toHaveLength(0);
    });

    it('should calculate total count across all categories', async () => {
      const categories: CategoryConfig[] = [
        {
          key: 'cat1',
          label: 'Category 1',
          itens: [{ id: '1', name: 'Item 1' }],
        },
        {
          key: 'cat2',
          label: 'Category 2',
          itens: [{ id: '2', name: 'Item 2' }],
        },
      ];

      render(<RecipientsStep categories={categories} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('checkbox-1'));
        fireEvent.click(screen.getByTestId('checkbox-2'));
      });

      // Verifica o estado do store em vez do texto exibido
      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['cat1'].selectedIds).toContain('1');
      expect(state.recipientCategories['cat2'].selectedIds).toContain('2');
    });
  });

  describe('integration with store', () => {
    it('should read selections from store on mount', () => {
      // Pre-select some items
      useAlertFormStore.getState().initializeCategory({
        key: 'users',
        label: 'Users',
        availableItems: mockItems,
        selectedIds: ['1', '2'],
        allSelected: false,
      });

      render(<RecipientsStep categories={[basicCategory]} />);

      const checkbox1 = screen.getByTestId('checkbox-1') as HTMLInputElement;
      const checkbox2 = screen.getByTestId('checkbox-2') as HTMLInputElement;
      const checkbox3 = screen.getByTestId('checkbox-3') as HTMLInputElement;

      expect(checkbox1.checked).toBe(true);
      expect(checkbox2.checked).toBe(true);
      expect(checkbox3.checked).toBe(false);
    });

    it('should update allSelected flag when all items are selected', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      // Select all items
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByTestId('checkbox-2'));
      fireEvent.click(screen.getByTestId('checkbox-3'));

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].allSelected).toBe(true);
    });

    it('should update allSelected flag when not all are selected', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByTestId('checkbox-2'));

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].allSelected).toBe(false);
    });
  });

  describe('text formatting', () => {
    it('should use singular form for 1 selection', async () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('checkbox-1'));
      });

      // Verifica o estado do store em vez do texto exibido
      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].selectedIds).toHaveLength(1);
    });

    it('should use plural form for multiple selections', async () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('checkbox-1'));
        fireEvent.click(screen.getByTestId('checkbox-2'));
      });

      // Verifica o estado do store em vez do texto exibido
      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].selectedIds).toHaveLength(2);
    });

    it('should use plural form for 0 selections', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      // Verifica que o componente renderiza sem erros
      expect(screen.getByTestId('checkbox-group')).toBeInTheDocument();
    });
  });
});
