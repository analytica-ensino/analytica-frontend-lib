import {
  render,
  screen,
  fireEvent,
  waitFor,
  renderHook,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import DropdownMenu, {
  ProfileMenuFooter,
  ProfileMenuHeader,
  ProfileMenuSection,
  ProfileMenuTrigger,
} from './DropdownMenu';
import {
  DropdownMenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from './DropdownMenu';
import React from 'react';

describe('DropdownMenu component', () => {
  describe('Open/close control', () => {
    it('calls onOpenChange when state changes (uncontrolled with callback)', () => {
      const handleOpenChange = jest.fn();

      render(
        <DropdownMenu onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>Content</MenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button');

      fireEvent.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      fireEvent.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(false);

      expect(handleOpenChange).toHaveBeenCalledTimes(3);
    });

    it('closes on Escape key press', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
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

    it('ignores non-Escape key in handleEscape', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>Content</MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('closes on outside click', async () => {
      render(
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
            <MenuContent>Menu Content</MenuContent>
          </DropdownMenu>
          <button data-testid="outside">Outside</button>
        </div>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() =>
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      );
    });

    it('does not close on outside click if clicking inside menu', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>
            <MenuItem>Inside Item</MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const insideItem = screen.getByRole('menuitem');
      fireEvent.mouseDown(insideItem);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('renders open state correctly when open prop is true', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>Menu Content</MenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('MenuItem behavior', () => {
    it('renders MenuItem with correct roles and triggers onClick', () => {
      const handleClick = jest.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>
            <MenuItem onClick={handleClick}>Item 1</MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menuitem');
      expect(item).toHaveTextContent('Item 1');
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalled();
    });

    it('prevents click and keydown on disabled MenuItem', () => {
      const handleClick = jest.fn();

      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>
            <MenuItem disabled onClick={handleClick}>
              Disabled Item
            </MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(item);
      fireEvent.keyDown(item, { key: 'Enter' });
      fireEvent.keyDown(item, { key: 'ArrowDown' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard interaction (Enter) on MenuItem', () => {
      const handleClick = jest.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>
            <MenuItem onClick={handleClick}>Item 1</MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menuitem');
      fireEvent.keyDown(item, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('MenuLabel and MenuSeparator behavior', () => {
    it('applies inset class when inset prop is true on MenuLabel', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>
            <MenuLabel inset data-testid="label-with-inset">
              Label with inset
            </MenuLabel>
          </MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const group = screen.getByTestId('label-with-inset');
      expect(group).toHaveClass('pl-8');
      expect(group).toHaveTextContent('Label with inset');
    });

    it('renders MenuLabel and MenuSeparator', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <MenuContent>
            <MenuLabel data-testid="label-with-label">Label</MenuLabel>
            <MenuSeparator />
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByTestId('label-with-label')).toHaveTextContent('Label');
      expect(screen.getByText('Item')).toBeInTheDocument();
    });
  });
});

describe('MenuContent direction and positioning', () => {
  it('renders with default position (bottom, start) classes and styles', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
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
        <DropdownMenuTrigger onClick={consumerOnClick}>
          Trigger
        </DropdownMenuTrigger>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
        </MenuContent>
      </DropdownMenu>
    );

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

  it('navigates through items with ArrowUp', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>Item 1</MenuItem>
          <MenuItem disabled>Disabled Item</MenuItem>
          <MenuItem>Item 2</MenuItem>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem disabled>Disabled 1</MenuItem>
          <MenuItem disabled>Disabled 2</MenuItem>
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
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <MenuContent>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
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

describe('ProfileMenu component', () => {
  // Tlvz n seja necessáriop
  describe('Open/close control', () => {
    it('calls onOpenChange when state changes (uncontrolled with callback)', () => {
      const handleOpenChange = jest.fn();

      render(
        <DropdownMenu onOpenChange={handleOpenChange}>
          <ProfileMenuTrigger />
          <MenuContent>Content</MenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button');

      fireEvent.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      fireEvent.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(false);

      expect(handleOpenChange).toHaveBeenCalledTimes(3);
    });

    it('closes on Escape key press', async () => {
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

    it('ignores non-Escape key in handleEscape', async () => {
      render(
        <DropdownMenu>
          <ProfileMenuTrigger />
          <MenuContent>Content</MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(screen.getByRole('menu')).toBeInTheDocument();
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

    it('does not close on outside click if clicking inside menu', () => {
      render(
        <DropdownMenu>
          <ProfileMenuTrigger />
          <MenuContent>
            <MenuItem variant="profile">Inside Item</MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const insideItem = screen.getByRole('menuitem');
      fireEvent.mouseDown(insideItem);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('renders open state correctly when open prop is true', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <MenuContent>Menu Content</MenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  // Tlvz tbm n seja necessario
  describe('MenuItem behavior', () => {
    it('renders MenuItem with correct roles and triggers onClick', () => {
      const handleClick = jest.fn();
      render(
        <DropdownMenu>
          <ProfileMenuTrigger />
          <MenuContent>
            <MenuItem variant="profile" onClick={handleClick}>
              Item 1
            </MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menuitem');
      expect(item).toHaveTextContent('Item 1');
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalled();
    });

    it('prevents click and keydown on disabled MenuItem', () => {
      const handleClick = jest.fn();

      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <MenuContent>
            <MenuItem variant="profile" disabled onClick={handleClick}>
              Disabled Item
            </MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(item);
      fireEvent.keyDown(item, { key: 'Enter' });
      fireEvent.keyDown(item, { key: 'ArrowDown' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard interaction (Enter) on MenuItem', () => {
      const handleClick = jest.fn();
      render(
        <DropdownMenu>
          <ProfileMenuTrigger />
          <MenuContent>
            <MenuItem variant="profile" onClick={handleClick}>
              Item 1
            </MenuItem>
          </MenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menuitem');
      fireEvent.keyDown(item, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('ProfileMenuHeader behavior', () => {
    it('renders ProfileMenuHeader with correct content', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <MenuContent>
            <ProfileMenuHeader
              data-testid="ProfileMenuHeader"
              email="ana@gmail.com"
              name="Ana Paula"
            />
          </MenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('ProfileMenuHeader')).toBeInTheDocument();
      expect(screen.getByText('Ana Paula')).toBeInTheDocument();
      expect(screen.getByText('ana@gmail.com')).toBeInTheDocument();
    });
  });

  describe('ProfileMenuSection behavior', () => {
    it('renders ProfileMenuSection with children', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <MenuContent>
            <ProfileMenuSection data-testid="ProfileMenuSection">
              <MenuItem variant="profile">Item 1</MenuItem>
            </ProfileMenuSection>
          </MenuContent>
        </DropdownMenu>
      );

      const section = screen.getByTestId('ProfileMenuSection');
      expect(section).toBeInTheDocument();
      expect(section).toHaveTextContent('Item 1');
    });
  });

  describe('ProfileMenuFooter behavior', () => {
    it('renders ProfileMenuFooter with SignOut button', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <MenuContent>
            <ProfileMenuFooter />
          </MenuContent>
        </DropdownMenu>
      );

      const button = screen.getByRole('button', { name: 'Sair' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Sair');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('', () => {
      const handleClick = jest.fn();

      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <MenuContent>
            <ProfileMenuFooter
              data-testid="footer-button"
              onClick={handleClick}
            />
          </MenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('footer-button');

      fireEvent.click(trigger);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useDropdownMenuStore', () => {
  it('should throw error when store is missing', () => {
    const originalUseDropdownStore =
      jest.requireActual('./DropdownMenu').useDropdownStore;

    jest.spyOn(React, 'useRef').mockReturnValue({ current: null });

    expect(() => {
      renderHook(() => originalUseDropdownStore(undefined));
    }).toThrow(
      'Component must be used within a DropdownMenu (store is missing)'
    );

    jest.restoreAllMocks();
  });
});
