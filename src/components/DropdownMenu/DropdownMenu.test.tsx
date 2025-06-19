import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import DropdownMenu, {
  DropdownMenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  ProfileMenuTrigger,
  ProfileMenuHeader,
  ProfileMenuSection,
  ProfileMenuFooter,
} from './DropdownMenu';

describe('DropdownMenu', () => {
  it('renders children', () => {
    render(
      <DropdownMenu>
        <div>Child</div>
      </DropdownMenu>
    );
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('toggles open state with trigger', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>Menu Content</MenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('calls consumer onClick handler when trigger is clicked', () => {
    const consumerOnClick = jest.fn();

    render(
      <DropdownMenu>
        <ProfileMenuTrigger onClick={consumerOnClick} />
        <MenuContent>Menu Content</MenuContent>
      </DropdownMenu>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(consumerOnClick).toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('calls onOpenChange in controlled mode', () => {
    const handleOpenChange = jest.fn();
    render(
      <DropdownMenu open={false} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Toggle'));
    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it('closes on Escape', async () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <MenuContent>Menu Content</MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    );
  });

  it('closes on outside click', async () => {
    render(
      <div>
        <DropdownMenu>
          <ProfileMenuTrigger data-testid="trigger" />
          <MenuContent>Menu Content</MenuContent>
        </DropdownMenu>
        <button data-testid="outside">Outside</button>
      </div>
    );

    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    );
  });

  it('keyboard navigation ArrowDown/ArrowUp', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Toggle'));
    const firstItem = screen.getByText('Item 1');
    firstItem.focus();

    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowDown' });
    });
    expect(screen.getByText('Item 2')).toHaveFocus();

    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowUp' });
    });
    expect(screen.getByText('Item 1')).toHaveFocus();
  });

  it('throws error if trigger used outside DropdownMenu', () => {
    expect(() =>
      render(<DropdownMenuTrigger>Fail</DropdownMenuTrigger>)
    ).toThrow('DropdownMenuTrigger must be used within a DropdownMenu');
  });
});

describe('MenuContent', () => {
  it('handles visibility transition', async () => {
    const { rerender } = render(
      <DropdownMenu open>
        <MenuContent>Menu</MenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Menu')).toBeVisible();

    rerender(
      <DropdownMenu open={false}>
        <MenuContent>Menu</MenuContent>
      </DropdownMenu>
    );

    await waitFor(() => {
      expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    });
  });

  it('applies alignment and side classes', () => {
    render(
      <DropdownMenu open>
        <MenuContent align="center" side="top">
          Menu
        </MenuContent>
      </DropdownMenu>
    );
    expect(screen.getByRole('menu').className).toMatch(/bottom-full/);
    expect(screen.getByRole('menu').className).toMatch(/-translate-x-1\/2/);
  });
});

describe('MenuItem', () => {
  it('click works', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem onClick={onClick}>Item</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Item'));
    expect(onClick).toHaveBeenCalled();
  });

  it('disabled click is prevented', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem disabled onClick={onClick}>
            Item
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Item'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('handles keyboard Enter and Space', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem onClick={onClick}>Item</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const item = screen.getByText('Item');
    act(() => {
      fireEvent.keyDown(item, { key: 'Enter' });
    });
    expect(onClick).toHaveBeenCalled();

    act(() => {
      fireEvent.keyDown(item, { key: ' ' });
    });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe('MenuLabel and MenuSeparator', () => {
  it('renders MenuLabel', () => {
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuLabel inset>Label</MenuLabel>
        </MenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('renders MenuSeparator', () => {
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuSeparator data-testid="separator" />
        </MenuContent>
      </DropdownMenu>
    );
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });
});

describe('Profile components', () => {
  it('ProfileMenuTrigger toggles menu', () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <MenuContent>Profile Menu</MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('throws error if ProfileMenuTrigger outside context', () => {
    expect(() => render(<ProfileMenuTrigger />)).toThrow();
  });

  it('ProfileMenuHeader renders name and email', () => {
    render(
      <DropdownMenu open>
        <MenuContent>
          <ProfileMenuHeader name="John Doe" email="john@example.com" />
        </MenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('ProfileMenuSection renders children', () => {
    render(
      <DropdownMenu open>
        <MenuContent>
          <ProfileMenuSection>Section Content</ProfileMenuSection>
        </MenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });

  it('ProfileMenuFooter click works', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <ProfileMenuFooter onClick={onClick} />
        </MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Sair'));
    expect(onClick).toHaveBeenCalled();
  });

  it('ProfileMenuFooter disabled prevents click', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <ProfileMenuFooter onClick={onClick} disabled />
        </MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Sair'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('MenuItem - variant profile', () => {
  it('renders with profile variant class and data attribute', () => {
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem variant="profile">Profile Item</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const item = screen.getByText('Profile Item');
    expect(item).toHaveAttribute('data-variant', 'profile');
    expect(item.className).toMatch(/justify-between/);
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem variant="profile" onClick={onClick}>
            Profile Item
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Profile Item'));
    expect(onClick).toHaveBeenCalled();
  });

  it('prevents click when disabled', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem variant="profile" disabled onClick={onClick}>
            Profile Item
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Profile Item'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick on Enter key', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem variant="profile" onClick={onClick}>
            Profile Item
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const item = screen.getByText('Profile Item');
    item.focus();
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('calls onClick on Space key', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem variant="profile" onClick={onClick}>
            Profile Item
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const item = screen.getByText('Profile Item');
    item.focus();
    fireEvent.keyDown(item, { key: ' ' });
    expect(onClick).toHaveBeenCalled();
  });

  it('does not trigger onClick with keyboard if disabled', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu open>
        <MenuContent>
          <MenuItem variant="profile" disabled onClick={onClick}>
            Profile Item
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const item = screen.getByText('Profile Item');
    item.focus();
    fireEvent.keyDown(item, { key: 'Enter' });
    fireEvent.keyDown(item, { key: ' ' });
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('MenuContent direction and positioning', () => {
  it('renders with default position (bottom, start) classes and styles', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>Content</MenuContent>
      </DropdownMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute top-full left-0');
    expect(menu).toHaveStyle({ marginTop: 4 });
  });

  it('renders with side "top" and align "end"', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent side="top" align="end" sideOffset={10}>
          Content
        </MenuContent>
      </DropdownMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute bottom-full right-0');
    expect(menu).toHaveStyle({ marginBottom: 10 });
  });

  it('renders with side "right" and align "center"', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent side="right" align="center" sideOffset={8}>
          Content
        </MenuContent>
      </DropdownMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute top-full left-1/2');
    expect(menu.className).toContain('-translate-x-1/2');
    expect(menu).toHaveStyle({ marginLeft: 8 });
  });

  it('renders with side "left" and align "start"', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent side="left" align="start" sideOffset={12}>
          Content
        </MenuContent>
      </DropdownMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute top-full left-0');
    expect(menu).toHaveStyle({ marginRight: 12 });
  });

  it('calls consumer onClick handler when trigger is clicked', () => {
    const consumerOnClick = jest.fn();

    render(
      <DropdownMenu>
        <ProfileMenuTrigger onClick={consumerOnClick} />
        <MenuContent>Menu Content</MenuContent>
      </DropdownMenu>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(consumerOnClick).toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('navigates through items with ArrowDown', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>
          <MenuItem variant="profile">Item 1</MenuItem>
          <MenuItem variant="profile">Item 2</MenuItem>
          <MenuItem variant="profile">Item 3</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(items[1]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(items[2]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(items[0]).toHaveFocus();
  });

  it('navigates through items with ArrowUp', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>
          <MenuItem variant="profile">Item 1</MenuItem>
          <MenuItem variant="profile">Item 2</MenuItem>
          <MenuItem variant="profile">Item 3</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(items[2]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(items[1]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(items[0]).toHaveFocus();
  });

  it('starts from first item when no item is focused and ArrowDown is pressed', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>
          <MenuItem variant="profile">Item 1</MenuItem>
          <MenuItem variant="profile">Item 2</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    expect(document.activeElement).not.toHaveAttribute('role', 'menuitem');

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('starts from last item when no item is focused and ArrowUp is pressed', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>
          <MenuItem variant="profile">Item 1</MenuItem>
          <MenuItem variant="profile">Item 2</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    expect(document.activeElement).not.toHaveAttribute('role', 'menuitem');

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    const items = screen.getAllByRole('menuitem');
    expect(items[items.length - 1]).toHaveFocus();
  });

  it('ignores disabled items in navigation', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>
          <MenuItem variant="profile">Item 1</MenuItem>
          <MenuItem variant="profile" disabled>
            Disabled Item
          </MenuItem>
          <MenuItem variant="profile">Item 2</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(items[2]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(items[0]).toHaveFocus();
  });

  it('does nothing when there are no enabled items', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>
          <MenuItem variant="profile" disabled>
            Disabled 1
          </MenuItem>
          <MenuItem variant="profile" disabled>
            Disabled 2
          </MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const initialFocus = document.activeElement;

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(initialFocus);

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(initialFocus);
  });

  it('prevents default behavior for ArrowDown/ArrowUp', () => {
    render(
      <DropdownMenu open>
        <ProfileMenuTrigger />
        <MenuContent>
          <MenuItem variant="profile">Item 1</MenuItem>
          <MenuItem variant="profile">Item 2</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const items = screen.getAllByRole('menuitem');
    items[0].focus();

    const spy = jest.spyOn(Event.prototype, 'preventDefault');

    fireEvent.keyDown(document, { key: 'ArrowDown' });

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});

describe('DropdownMenuTrigger additional coverage', () => {
  it('calls passed onClick handler', () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger onClick={onClick}>Trigger</DropdownMenuTrigger>
        <MenuContent>Content</MenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('passes additional props to button', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="custom-trigger" id="test-id">
          Trigger
        </DropdownMenuTrigger>
      </DropdownMenu>
    );

    const button = screen.getByTestId('custom-trigger');
    expect(button).toHaveAttribute('id', 'test-id');
  });
});

describe('MenuLabel additional coverage', () => {
  it('applies custom className when provided', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <MenuContent>
          <MenuLabel className="custom-class">Label</MenuLabel>
        </MenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('group')).toHaveClass('custom-class');
  });

  it('does not apply inset class when inset is false', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <MenuContent>
          <MenuLabel inset={false}>Label</MenuLabel>
        </MenuContent>
      </DropdownMenu>
    );

    const group = screen.getByRole('group');
    expect(group).not.toHaveClass('pl-8');
  });
});

describe('Class constants usage', () => {
  it('uses ITEM_SIZE_CLASSES', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem size="small">Small</MenuItem>
          <MenuItem size="medium">Medium</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveClass('text-sm');
    expect(items[1]).toHaveClass('text-md');
  });

  it('uses SIDE_CLASSES and ALIGN_CLASSES', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <MenuContent side="top" align="end">
          Content
        </MenuContent>
      </DropdownMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('bottom-full');
    expect(menu).toHaveClass('right-0');
  });
});
