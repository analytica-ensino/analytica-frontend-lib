import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecipientsStep } from '../RecipientsStep';
import { useAlertFormStore, RecipientItem } from '../../useAlertForm';
import type { CategoryConfig, LabelsConfig } from '../../types';
import type { ReactNode, ChangeEvent } from 'react';

// Mock component types
interface MockTextProps {
  children?: ReactNode;
  size?: string;
  weight?: string;
  className?: string;
}

interface MockCheckBoxProps {
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}

interface MockAccordionGroupProps {
  children?: ReactNode;
  type?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface MockCardAccordationProps {
  children?: ReactNode;
  value?: string;
  disabled?: boolean;
  className?: string;
  trigger?: ReactNode;
}

interface MockBadgeProps {
  children?: ReactNode;
  variant?: string;
  action?: string;
}

// Mock components
jest.mock('../../../..', () => ({
  Text: ({ children, size, weight, className }: MockTextProps) => (
    <span data-size={size} data-weight={weight} className={className}>
      {children}
    </span>
  ),
  CheckBox: ({ checked, disabled, onChange, id }: MockCheckBoxProps) => (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      data-testid={id ? `checkbox-${id}` : 'checkbox'}
      id={id}
    />
  ),
  AccordionGroup: ({
    children,
    value,
    onValueChange,
  }: MockAccordionGroupProps) => (
    <div data-testid="accordion-group" data-value={value}>
      <div onClick={() => onValueChange?.('test-key')}>{children}</div>
    </div>
  ),
  CardAccordation: ({
    children,
    value,
    disabled,
    trigger,
  }: MockCardAccordationProps) => (
    <div
      data-testid={`accordion-${value}`}
      data-disabled={disabled}
      data-value={value}
    >
      <div data-testid={`trigger-${value}`}>{trigger}</div>
      {!disabled && <div data-testid={`content-${value}`}>{children}</div>}
    </div>
  ),
  Badge: ({ children, variant, action }: MockBadgeProps) => (
    <span data-variant={variant} data-action={action}>
      {children}
    </span>
  ),
  Divider: () => <hr data-testid="divider" />,
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' '),
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

      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should render all recipient items', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('User 3')).toBeInTheDocument();
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
  });

  describe('select all functionality', () => {
    it('should toggle all items when clicking category checkbox', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      const trigger = screen.getByTestId('trigger-users');
      const categoryCheckbox = trigger.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;

      // Select all
      if (categoryCheckbox) {
        fireEvent.click(categoryCheckbox);
      }

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].selectedIds).toHaveLength(3);
      expect(state.recipientCategories['users'].allSelected).toBe(true);
    });

    it('should deselect all when all are selected', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      const trigger = screen.getByTestId('trigger-users');
      const categoryCheckbox = trigger.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;

      if (categoryCheckbox) {
        // Select all
        fireEvent.click(categoryCheckbox);

        // Deselect all
        fireEvent.click(categoryCheckbox);
      }

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].selectedIds).toHaveLength(0);
      expect(state.recipientCategories['users'].allSelected).toBe(false);
    });
  });

  describe('selection counter', () => {
    it('should show 0 selected initially', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      expect(screen.getByText('0 de 3 selecionados')).toBeInTheDocument();
    });

    it('should show singular form for 1 selection', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      fireEvent.click(screen.getByTestId('checkbox-1'));

      expect(screen.getByText('1 de 3 selecionado')).toBeInTheDocument();
    });

    it('should show plural form for multiple selections', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByTestId('checkbox-2'));

      expect(screen.getByText('2 de 3 selecionados')).toBeInTheDocument();
    });
  });

  describe('dependent categories', () => {
    it('should disable child category when parent has no selection', () => {
      const parentItems: RecipientItem[] = [{ id: 'p1', name: 'Parent 1' }];
      const childItems: RecipientItem[] = [
        { id: 'c1', name: 'Child 1', parentId: 'p1' },
      ];

      const categories: CategoryConfig[] = [
        { key: 'parent', label: 'Parent', itens: parentItems },
        {
          key: 'child',
          label: 'Child',
          itens: childItems,
          dependsOn: ['parent'],
        },
      ];

      render(<RecipientsStep categories={categories} />);

      const childAccordion = screen.getByTestId('accordion-child');
      expect(childAccordion).toHaveAttribute('data-disabled', 'true');
    });

    it('should enable child category when parent is selected', () => {
      const parentItems: RecipientItem[] = [{ id: 'p1', name: 'Parent 1' }];
      const childItems: RecipientItem[] = [
        { id: 'c1', name: 'Child 1', parentId: 'p1' },
      ];

      const categories: CategoryConfig[] = [
        { key: 'parent', label: 'Parent', itens: parentItems },
        {
          key: 'child',
          label: 'Child',
          itens: childItems,
          dependsOn: ['parent'],
        },
      ];

      render(<RecipientsStep categories={categories} />);

      // Select parent
      fireEvent.click(screen.getByTestId('checkbox-p1'));

      const childAccordion = screen.getByTestId('accordion-child');
      expect(childAccordion).toHaveAttribute('data-disabled', 'false');
    });

    it('should show only child items matching selected parents', () => {
      const parentItems: RecipientItem[] = [
        { id: 'p1', name: 'Parent 1' },
        { id: 'p2', name: 'Parent 2' },
      ];
      const childItems: RecipientItem[] = [
        { id: 'c1', name: 'Child of P1', parentId: 'p1' },
        { id: 'c2', name: 'Child of P2', parentId: 'p2' },
        { id: 'c3', name: 'Another Child of P1', parentId: 'p1' },
      ];

      const categories: CategoryConfig[] = [
        { key: 'parent', label: 'Parent', itens: parentItems },
        {
          key: 'child',
          label: 'Child',
          itens: childItems,
          dependsOn: ['parent'],
        },
      ];

      render(<RecipientsStep categories={categories} />);

      // Select only parent 1
      fireEvent.click(screen.getByTestId('checkbox-p1'));

      // Should show only children of p1
      expect(screen.getByText('Child of P1')).toBeInTheDocument();
      expect(screen.getByText('Another Child of P1')).toBeInTheDocument();
      expect(screen.queryByText('Child of P2')).not.toBeInTheDocument();
    });
  });

  describe('checkbox states', () => {
    it('should show category checkbox as unchecked when no items selected', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      const trigger = screen.getByTestId('trigger-users');
      const categoryCheckbox = trigger.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;

      expect(categoryCheckbox?.checked).toBe(false);
    });

    it('should show category checkbox as checked when items are selected', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      // Select one item
      fireEvent.click(screen.getByTestId('checkbox-1'));

      const trigger = screen.getByTestId('trigger-users');
      const categoryCheckbox = trigger.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;

      expect(categoryCheckbox?.checked).toBe(true);
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

      expect(screen.getByText('Empty')).toBeInTheDocument();
      expect(screen.getByText('0 de 0 selecionados')).toBeInTheDocument();
    });

    it('should handle empty categories array', () => {
      render(<RecipientsStep categories={[]} />);

      expect(
        screen.getByText('Para quem você vai enviar o aviso?')
      ).toBeInTheDocument();
    });

    it('should handle category without itens', () => {
      const categoryNoItems: CategoryConfig = {
        key: 'noitems',
        label: 'No Items',
      };

      render(<RecipientsStep categories={[categoryNoItems]} />);

      expect(screen.getByText('No Items')).toBeInTheDocument();
      expect(screen.getByText('0 de 0 selecionados')).toBeInTheDocument();
    });
  });

  describe('selection count updates', () => {
    it('should update count when selecting items', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      expect(screen.getByText('0 de 3 selecionados')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('checkbox-1'));
      expect(screen.getByText('1 de 3 selecionado')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('checkbox-2'));
      expect(screen.getByText('2 de 3 selecionados')).toBeInTheDocument();
    });

    it('should update count when deselecting items', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      // Select all
      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByTestId('checkbox-2'));
      fireEvent.click(screen.getByTestId('checkbox-3'));

      expect(screen.getByText('3 de 3 selecionados')).toBeInTheDocument();

      // Deselect one
      fireEvent.click(screen.getByTestId('checkbox-1'));
      expect(screen.getByText('2 de 3 selecionados')).toBeInTheDocument();
    });
  });

  describe('allSelected flag', () => {
    it('should set allSelected to true when all items are selected individually', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByTestId('checkbox-2'));
      fireEvent.click(screen.getByTestId('checkbox-3'));

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].allSelected).toBe(true);
    });

    it('should set allSelected to false when not all are selected', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      fireEvent.click(screen.getByTestId('checkbox-1'));
      fireEvent.click(screen.getByTestId('checkbox-2'));

      const state = useAlertFormStore.getState();
      expect(state.recipientCategories['users'].allSelected).toBe(false);
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

      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
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
  });

  describe('integration with store', () => {
    it('should preserve selections between renders', () => {
      const { rerender } = render(
        <RecipientsStep categories={[basicCategory]} />
      );

      fireEvent.click(screen.getByTestId('checkbox-1'));

      rerender(<RecipientsStep categories={[basicCategory]} />);

      const checkbox = screen.getByTestId('checkbox-1') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

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
  });

  describe('accordion interaction', () => {
    it('should render accordion group', () => {
      render(<RecipientsStep categories={[basicCategory]} />);

      expect(screen.getByTestId('accordion-group')).toBeInTheDocument();
    });

    it('should render dividers', () => {
      const categories: CategoryConfig[] = [
        { key: 'cat1', label: 'Cat 1', itens: [] },
        { key: 'cat2', label: 'Cat 2', itens: [] },
      ];

      render(<RecipientsStep categories={categories} />);

      const dividers = screen.queryAllByTestId('divider');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });
});
