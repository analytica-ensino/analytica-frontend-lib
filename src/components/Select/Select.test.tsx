import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select, {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  getLabelAsNode,
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
