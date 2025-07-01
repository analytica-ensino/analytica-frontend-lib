import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select, {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  getLabelAsNode,
  createSelectStore,
} from './Select';
import React, { ComponentProps } from 'react';

describe('Select component', () => {
  const setup = (props?: Partial<ComponentProps<typeof Select>>) => {
    return render(
      <Select {...props}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3" disabled>
            Option 3
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  it('should render without errors', () => {
    setup();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render with label', () => {
    setup({ label: 'Select a fruit' });
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();
    expect(screen.getByLabelText('Select a fruit')).toBeInTheDocument();
  });

  it('should render with helper text', () => {
    setup({ helperText: 'Choose your preferred option' });
    expect(
      screen.getByText('Choose your preferred option')
    ).toBeInTheDocument();
  });

  it('should render with error message', () => {
    setup({ errorMessage: 'This field is required' });
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    // Should have warning icon
    const errorElement = screen
      .getByText('This field is required')
      .closest('p');
    expect(errorElement).toHaveClass('text-indicator-error');
  });

  it('should render with all text elements', () => {
    setup({
      label: 'Category',
      helperText: 'Select a category for your item',
      errorMessage: 'Please select a valid category',
    });

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(
      screen.getByText('Select a category for your item')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Please select a valid category')
    ).toBeInTheDocument();
  });

  it('should have correct size classes', () => {
    // Test each size individually to avoid conflicts
    const testSize = (
      size: 'small' | 'medium' | 'large' | 'extra-large',
      expectedClasses: string[]
    ) => {
      const { unmount } = render(
        <Select size={size}>
          <SelectTrigger data-testid={`${size}-trigger`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId(`${size}-trigger`);
      expectedClasses.forEach((className) => {
        expect(trigger).toHaveClass(className);
      });

      unmount();
    };

    testSize('small', ['h-8', 'px-2', 'py-1']);
    testSize('medium', ['h-9', 'px-3', 'py-2']);
    testSize('large', ['h-10', 'px-4', 'py-3']);
    testSize('extra-large', ['h-12', 'px-5', 'py-4']);
  });

  it('should generate and use unique ID', () => {
    setup({ label: 'Test Label' });
    const label = screen.getByText('Test Label');
    const button = screen.getByRole('button');

    const htmlFor = label.getAttribute('for');
    const buttonId = button.getAttribute('id');

    expect(htmlFor).toBeTruthy();
    expect(buttonId).toBeTruthy();
    expect(htmlFor).toBe(buttonId);
  });

  it('should use provided ID', () => {
    setup({ id: 'custom-select-id', label: 'Test Label' });
    const button = screen.getByRole('button');
    const label = screen.getByText('Test Label');

    expect(button).toHaveAttribute('id', 'custom-select-id');
    expect(label).toHaveAttribute('for', 'custom-select-id');
  });

  it('should close when clicking outside', async () => {
    setup();
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('should select an item and show correct label', async () => {
    setup();
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Option 2'));
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should not select a disabled item', async () => {
    setup();
    expect(screen.queryByDisplayValue('Option 3')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Option 3'));
    expect(screen.queryByText('Option 3')).toHaveClass('pointer-events-none');
    expect(screen.queryByDisplayValue('Option 3')).not.toBeInTheDocument();
  });

  it('should invalid select', async () => {
    render(
      <Select value="option1">
        <SelectTrigger invalid>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(/border-indicator-error/);
  });

  it('should disabled select', async () => {
    render(
      <Select value="option1">
        <SelectTrigger disabled>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(
      /cursor-not-allowed text-text-400 pointer-events-none opacity-50/
    );
  });

  it('should support controlled mode', async () => {
    const onValueChange = jest.fn();
    render(
      <Select value="option1" onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Option 2'));

    expect(onValueChange).toHaveBeenCalledWith('option2');
  });

  it('should show placeholder if no value is selected', () => {
    render(
      <Select defaultValue="">
        <SelectTrigger>
          <SelectValue placeholder="Select something" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Select something')).toBeInTheDocument();
  });

  it('should apply variant and size classes', () => {
    render(
      <Select size="large">
        <SelectTrigger variant="underlined">Trigger</SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(/border-b/);
  });

  it('should apply content alignment and side', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="center" side="top">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    const content = screen.getByText('Option 1').closest('div')?.parentElement;

    expect(content?.className).toMatch(/bottom-full/);
    expect(content?.className).toMatch(/-translate-x-1\/2/);
  });

  it('should pre-select defaultValue', () => {
    render(
      <Select defaultValue="option1">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should call custom onClick handler on SelectItem', async () => {
    const customOnClick = jest.fn();

    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" onClick={customOnClick}>
            Option 1
          </SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Option 1'));

    expect(customOnClick).toHaveBeenCalled();
  });

  it('should test all SelectContent positioning combinations', async () => {
    const sides = ['top', 'right', 'bottom', 'left'] as const;
    const aligns = ['start', 'center', 'end'] as const;

    for (const side of sides) {
      for (const align of aligns) {
        const { unmount } = render(
          <Select>
            <SelectTrigger data-testid={`trigger-${side}-${align}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side={side} align={align}>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        );

        await userEvent.click(screen.getByTestId(`trigger-${side}-${align}`));
        const content = screen
          .getByText('Option 1')
          .closest('div')?.parentElement;
        expect(content).toBeInTheDocument();

        unmount();
      }
    }
  });

  it('should handle SelectItem with custom className', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" className="custom-class">
            Option 1
          </SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    const item = screen.getByText('Option 1');
    expect(item).toHaveClass('custom-class');
  });

  it('should handle SelectContent with custom className', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="custom-content-class">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    const content = screen.getByText('Option 1').closest('div')?.parentElement;
    expect(content).toHaveClass('custom-content-class');
  });

  it('should handle SelectTrigger with custom className', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger-class">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('custom-trigger-class');
  });

  it('should set correct tabIndex for disabled SelectItem', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" disabled>
            Disabled Option
          </SelectItem>
          <SelectItem value="option2">Enabled Option</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));

    const disabledItem = screen.getByText('Disabled Option');
    const enabledItem = screen.getByText('Enabled Option');

    expect(disabledItem).toHaveAttribute('tabindex', '-1');
    expect(enabledItem).toHaveAttribute('tabindex', '0');
  });

  it('should use default size when not specified', () => {
    render(
      <Select>
        <SelectTrigger data-testid="default-size-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId('default-size-trigger');
    // Should use small size as default (h-8, px-2, py-1) based on Select component default
    expect(trigger).toHaveClass('h-8', 'px-2', 'py-1');
  });

  it('should use SelectTrigger default size when used without Select context', () => {
    // Manually create store to test SelectTrigger independently
    const store = createSelectStore();

    render(
      <SelectTrigger store={store} data-testid="standalone-trigger">
        <SelectValue store={store} />
      </SelectTrigger>
    );

    const trigger = screen.getByTestId('standalone-trigger');
    // Should use medium size as default (h-9, px-3, py-2) based on SelectTrigger component default
    expect(trigger).toHaveClass('h-9', 'px-3', 'py-2');
  });

  it('should call onValueChange only when user selects item, not on re-render', () => {
    const mockOnValueChange = jest.fn();

    const { rerender } = render(
      <Select onValueChange={mockOnValueChange} value="initial">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    // Initial render should not call onValueChange
    expect(mockOnValueChange).not.toHaveBeenCalled();

    // Re-render with same value should not call onValueChange
    rerender(
      <Select onValueChange={mockOnValueChange} value="initial">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(mockOnValueChange).not.toHaveBeenCalled();

    // Re-render with different value should not call onValueChange
    rerender(
      <Select onValueChange={mockOnValueChange} value="option1">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(mockOnValueChange).not.toHaveBeenCalled();

    // Open select and click an item - this should call onValueChange
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Option 2'));

    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    expect(mockOnValueChange).toHaveBeenCalledWith('option2');
  });
});

describe('Select keyboard navigation', () => {
  it('navigates through items with ArrowDown', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(items[1]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(items[2]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(items[0]).toHaveFocus();
  });

  it('navigates through items with ArrowUp', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(items[2]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(items[1]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(items[0]).toHaveFocus();
  });

  it('starts from first item when no item is focused and ArrowDown is pressed', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    expect(document.activeElement).not.toHaveAttribute('role', 'menuitem');

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('starts from last item when no item is focused and ArrowUp is pressed', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    expect(document.activeElement).not.toHaveAttribute('role', 'menuitem');

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    const items = screen.getAllByRole('menuitem');
    expect(items[items.length - 1]).toHaveFocus();
  });

  it('prevents default behavior for ArrowDown/ArrowUp', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));
    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    const spy = jest.spyOn(Event.prototype, 'preventDefault');

    fireEvent.keyDown(document, { key: 'ArrowDown' });

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});

describe('Select event navigation', () => {
  it('selects item when Enter key is pressed', async () => {
    const onValueChange = jest.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));

    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    fireEvent.keyDown(items[0], { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith('option1');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('selects item when Space key is pressed', async () => {
    const onValueChange = jest.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('button'));

    const items = screen.getAllByRole('menuitem');
    items[1].focus();

    fireEvent.keyDown(items[1], { key: ' ' });

    expect(onValueChange).toHaveBeenCalledWith('option2');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('Select label finding behavior', () => {
  it('should correctly find and display label for defaultValue', () => {
    render(
      <Select defaultValue="option1">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should handle nested SelectItems when finding label', () => {
    render(
      <Select defaultValue="nested-option">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <div>
            <SelectItem value="nested-option">Nested Option</SelectItem>
          </div>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Nested Option')).toBeInTheDocument();
  });

  it('should handle fragments when finding label', () => {
    render(
      <Select defaultValue="fragment-option">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <>
            <SelectItem value="fragment-option">Fragment Option</SelectItem>
          </>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Fragment Option')).toBeInTheDocument();
  });

  it('should show placeholder when no matching label is found', () => {
    render(
      <Select defaultValue="non-existent">
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Select...')).toBeInTheDocument();
  });
});

describe('useSelectStore', () => {
  it('should throw error when store is missing', () => {
    const originalUseSelectStore =
      jest.requireActual('./Select').useSelectStore;

    jest.spyOn(React, 'useRef').mockReturnValue({ current: null });

    expect(() => {
      renderHook(() => originalUseSelectStore(undefined));
    }).toThrow('Component must be used within a Select (store is missing)');

    jest.restoreAllMocks();
  });
});

describe('getLabelAsNode', () => {
  it('returns the string directly when children is a string', () => {
    const result = getLabelAsNode('Banana');
    expect(result).toBe('Banana');
  });

  it('returns the number directly when children is a number', () => {
    const result = getLabelAsNode(123);
    expect(result).toBe(123);
  });

  it('renders a single React element', () => {
    const result = getLabelAsNode(<span>Item</span>);
    render(<>{result}</>);
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('renders multiple children wrapped in a fragment', () => {
    const children = ['First', <span key="2">Second</span>, 'Third'];
    const result = getLabelAsNode(children);
    render(<>{result}</>);
    expect(
      screen.getByText((content) => content.includes('First'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Second'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Third'))
    ).toBeInTheDocument();
  });

  it('renders nested elements correctly', () => {
    const nestedChildren = (
      <>
        Hello <strong>World</strong>!
      </>
    );
    const result = getLabelAsNode(nestedChildren);
    render(result);
    expect(
      screen.getByText((content) => content.includes('Hello'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('World'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('!'))
    ).toBeInTheDocument();
  });
});

describe('SelectTrigger invalid + variant classes', () => {
  const setup = (
    variant: 'outlined' | 'underlined' | 'rounded' = 'outlined'
  ) => {
    render(
      <Select>
        <SelectTrigger invalid variant={variant}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  it('applies border-b-2 when invalid and variant is underlined', () => {
    setup('underlined');
    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(/border-b-2/);
    expect(trigger.className).toMatch(/border-indicator-error/);
    expect(trigger.className).toMatch(/text-text-600/);
  });

  it('applies border-2 when invalid and variant is outlined', () => {
    setup('outlined');
    const trigger = screen.getByRole('button');
    expect(trigger.className).toMatch(/border-2/);
    expect(trigger.className).toMatch(/border-indicator-error/);
    expect(trigger.className).toMatch(/text-text-600/);
  });
});
