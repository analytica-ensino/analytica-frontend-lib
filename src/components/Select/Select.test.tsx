import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select, {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectValue,
} from './Select';
import { ComponentProps } from 'react';

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
          <SelectSeparator />
          <SelectItem value="option3" disabled>
            Option 3
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  it('should open and close content on trigger click', async () => {
    setup();
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
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

  it('should disabled select', async () => {
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
    expect(trigger.className).toMatch(/border-b-2/); // Variant class
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

  it('should throw error if SelectTrigger used outside Select', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<SelectTrigger>Trigger</SelectTrigger>)).toThrow(
      /must be used within a Select/
    );
    errorSpy.mockRestore();
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

    // Test wrap-around
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

  // it('ignores disabled items in navigation', async () => {
  //   render(
  //     <Select>
  //       <SelectTrigger>
  //         <SelectValue />
  //       </SelectTrigger>
  //       <SelectContent>
  //         <SelectItem value="option1">Option 1</SelectItem>
  //         <SelectItem value="option2" disabled>
  //           Disabled Option
  //         </SelectItem>
  //         <SelectItem value="option3">Option 3</SelectItem>
  //       </SelectContent>
  //     </Select>
  //   );

  //   await userEvent.click(screen.getByRole('button'));
  //   const items = screen.getAllByRole('menuitem');
  //   items[0].focus();

  //   fireEvent.keyDown(document, { key: 'ArrowDown' });
  //   // Pula o item desabilitado (índice 1) e vai direto para o item 2
  //   expect(items[2]).toHaveFocus();

  //   fireEvent.keyDown(document, { key: 'ArrowUp' });
  //   // Volta para o primeiro item, pulando o desabilitado
  //   expect(items[0]).toHaveFocus();
  // });

  // it('does nothing when there are no enabled items', async () => {
  //   render(
  //     <Select>
  //       <SelectTrigger>
  //         <SelectValue />
  //       </SelectTrigger>
  //       <SelectContent>
  //         <SelectItem value="option1" disabled>
  //           Disabled Option 1
  //         </SelectItem>
  //         <SelectItem value="option2" disabled>
  //           Disabled Option 2
  //         </SelectItem>
  //       </SelectContent>
  //     </Select>
  //   );

  //   await userEvent.click(screen.getByRole('button'));
  //   // O foco deve permanecer no trigger quando todos os itens estão desabilitados
  //   const trigger = screen.getByRole('button');
  //   expect(document.activeElement).toBe(trigger);

  //   fireEvent.keyDown(document, { key: 'ArrowDown' });
  //   expect(document.activeElement).toBe(trigger);

  //   fireEvent.keyDown(document, { key: 'ArrowUp' });
  //   expect(document.activeElement).toBe(trigger);
  // });

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

    // Abre o select
    await userEvent.click(screen.getByRole('button'));

    // Foca no primeiro item
    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    // Pressiona Enter
    fireEvent.keyDown(items[0], { key: 'Enter' });

    // Verifica se o item foi selecionado
    expect(onValueChange).toHaveBeenCalledWith('option1');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(); // Deve fechar
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

    // Abre o select
    await userEvent.click(screen.getByRole('button'));

    // Foca no segundo item
    const items = screen.getAllByRole('menuitem');
    items[1].focus();

    // Pressiona Espaço
    fireEvent.keyDown(items[1], { key: ' ' });

    // Verifica se o item foi selecionado
    expect(onValueChange).toHaveBeenCalledWith('option2');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(); // Deve fechar
  });

  it('does not select disabled item when Enter is pressed', async () => {
    const onValueChange = jest.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" disabled>
            Disabled Option
          </SelectItem>
        </SelectContent>
      </Select>
    );

    // Abre o select
    await userEvent.click(screen.getByRole('button'));

    // Foca no item desabilitado
    const item = screen.getByRole('menuitem');
    item.focus();

    // Pressiona Enter
    fireEvent.keyDown(item, { key: 'Enter' });

    // Verifica que não houve mudança
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument(); // Deve permanecer aberto
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

  it('should show value when label is not a string', () => {
    render(
      <Select defaultValue="complex-option">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="complex-option">
            <span>Complex Option</span>
          </SelectItem>
        </SelectContent>
      </Select>
    );

    // Mostra o valor pois o children não é string
    expect(screen.getByText('complex-option')).toBeInTheDocument();
  });
});
