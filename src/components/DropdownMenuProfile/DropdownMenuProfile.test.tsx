import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropdownProfileMenu from './DropdownMenuProfile';
import {
  ProfileMenuTrigger,
  ProfileMenuContent,
  ProfileMenuItem,
  ProfileMenuHeader,
  ProfileMenuSeparator,
  ProfileMenuSection,
  ProfileMenuFooter,
} from './DropdownMenuProfile';

describe('DropdownProfileMenu component', () => {
  describe('Trigger behavior', () => {
    it('opens and closes on trigger click (uncontrolled)', async () => {
      render(
        <DropdownProfileMenu>
          <ProfileMenuTrigger />
          <ProfileMenuContent>Menu Content</ProfileMenuContent>
        </DropdownProfileMenu>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.click(trigger);
      await waitFor(() =>
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      );
    });

    it('updates internal state when uncontrolled and no onOpenChange', () => {
      render(
        <DropdownProfileMenu>
          <ProfileMenuTrigger />
        </DropdownProfileMenu>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('calls onOpenChange in controlled mode', () => {
      const onOpenChange = jest.fn();
      render(
        <DropdownProfileMenu open={false} onOpenChange={onOpenChange}>
          <ProfileMenuTrigger />
        </DropdownProfileMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('throws error when used outside of DropdownProfileMenu', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => render(<ProfileMenuTrigger />)).toThrowError(
        'DropdownMenuTrigger must be used within a DropdownProfileMenu'
      );

      consoleError.mockRestore();
    });
  });

  describe('Open/close control', () => {
    it('calls onOpenChange when state changes (uncontrolled with callback)', () => {
      const handleOpenChange = jest.fn();

      render(
        <DropdownProfileMenu onOpenChange={handleOpenChange}>
          <ProfileMenuTrigger />
          <ProfileMenuContent>Content</ProfileMenuContent>
        </DropdownProfileMenu>
      );

      const trigger = screen.getByRole('button');

      fireEvent.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      fireEvent.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(false);

      expect(handleOpenChange).toHaveBeenCalledTimes(2);
    });

    it('closes on Escape key press', async () => {
      render(
        <DropdownProfileMenu>
          <ProfileMenuTrigger />
          <ProfileMenuContent>Menu Content</ProfileMenuContent>
        </DropdownProfileMenu>
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
        <DropdownProfileMenu>
          <ProfileMenuTrigger />
          <ProfileMenuContent>Content</ProfileMenuContent>
        </DropdownProfileMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('closes on outside click', async () => {
      render(
        <div>
          <DropdownProfileMenu>
            <ProfileMenuTrigger data-testid="trigger" />
            <ProfileMenuContent>Menu Content</ProfileMenuContent>
          </DropdownProfileMenu>
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
        <DropdownProfileMenu>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuItem>Inside Item</ProfileMenuItem>
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const insideItem = screen.getByRole('menu-profile-settings-itens');
      fireEvent.mouseDown(insideItem);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('renders open state correctly when open prop is true', () => {
      render(
        <DropdownProfileMenu open>
          <ProfileMenuTrigger />
          <ProfileMenuContent>Menu Content</ProfileMenuContent>
        </DropdownProfileMenu>
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('ProfileMenuItem behavior', () => {
    it('renders ProfileMenuItem with correct roles and triggers onClick', () => {
      const handleClick = jest.fn();
      render(
        <DropdownProfileMenu>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuItem onClick={handleClick}>Item 1</ProfileMenuItem>
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menu-profile-settings-itens');
      expect(item).toHaveTextContent('Item 1');
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalled();
    });

    it('prevents click and keydown on disabled ProfileMenuItem', () => {
      const handleClick = jest.fn();

      render(
        <DropdownProfileMenu open>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuItem disabled onClick={handleClick}>
              Disabled Item
            </ProfileMenuItem>
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      const item = screen.getByRole('menu-profile-settings-itens');
      expect(item).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(item);
      fireEvent.keyDown(item, { key: 'Enter' });
      fireEvent.keyDown(item, { key: 'ArrowDown' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard interaction (Enter) on ProfileMenuItem', () => {
      const handleClick = jest.fn();
      render(
        <DropdownProfileMenu>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuItem onClick={handleClick}>Item 1</ProfileMenuItem>
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menu-profile-settings-itens');
      fireEvent.keyDown(item, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('applies inset and size props to ProfileMenuItem', () => {
      render(
        <DropdownProfileMenu>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuItem inset size="medium">
              Inset Item
            </ProfileMenuItem>
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menu-profile-settings-itens');
      expect(item).toHaveClass('pl-8');
      expect(item).toHaveClass('text-md');
    });
  });

  describe('ProfileMenuHeader behavior', () => {
    it('renders ProfileMenuHeader with correct content', () => {
      render(
        <DropdownProfileMenu open>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuHeader email="ana@gmail.com" name="Ana Paula" />
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      expect(screen.getByRole('ProfileMenuHeader')).toBeInTheDocument();
      expect(screen.getByText('Ana Paula')).toBeInTheDocument();
      expect(screen.getByText('ana@gmail.com')).toBeInTheDocument();
    });
  });

  describe('ProfileMenuSection behavior', () => {
    it('renders ProfileMenuSection with children', () => {
      render(
        <DropdownProfileMenu open>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuSection>
              <ProfileMenuItem>Item 1</ProfileMenuItem>
            </ProfileMenuSection>
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      const section = screen.getByRole('ProfileMenuHeader');
      expect(section).toBeInTheDocument();
      expect(section).toHaveTextContent('Item 1');
    });
  });

  describe('ProfileMenuFooter behavior', () => {
    it('renders ProfileMenuFooter with SignOut button', () => {
      render(
        <DropdownProfileMenu open>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuFooter />
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      const button = screen.getByRole('button', { name: 'Sair' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Sair');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('ProfileMenuSeparator behavior', () => {
    it('renders ProfileMenuSeparator', () => {
      render(
        <DropdownProfileMenu open>
          <ProfileMenuTrigger />
          <ProfileMenuContent>
            <ProfileMenuSeparator data-testid="separator" />
            <ProfileMenuItem>Item</ProfileMenuItem>
          </ProfileMenuContent>
        </DropdownProfileMenu>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });
  });
});

describe('ProfileMenuContent direction and positioning', () => {
  it('renders with default position (bottom, start) classes and styles', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent>Content</ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute top-full left-0');
    expect(menu).toHaveStyle({ marginTop: 4 });
  });

  it('renders with side "top" and align "end"', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent side="top" align="end" sideOffset={10}>
          Content
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute bottom-full right-0');
    expect(menu).toHaveStyle({ marginBottom: 10 });
  });

  it('renders with side "right" and align "center"', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent side="right" align="center" sideOffset={8}>
          Content
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute top-full left-1/2');
    expect(menu.className).toContain('-translate-x-1/2');
    expect(menu).toHaveStyle({ marginLeft: 8 });
  });

  it('renders with side "left" and align "start"', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent side="left" align="start" sideOffset={12}>
          Content
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute top-full left-0');
    expect(menu).toHaveStyle({ marginRight: 12 });
  });

  it('calls consumer onClick handler when trigger is clicked', () => {
    const consumerOnClick = jest.fn();

    render(
      <DropdownProfileMenu>
        <ProfileMenuTrigger onClick={consumerOnClick} />
        <ProfileMenuContent>Menu Content</ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(consumerOnClick).toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('navigates through items with ArrowDown', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent>
          <ProfileMenuItem>Item 1</ProfileMenuItem>
          <ProfileMenuItem>Item 2</ProfileMenuItem>
          <ProfileMenuItem>Item 3</ProfileMenuItem>
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const items = screen.getAllByRole('menu-profile-settings-itens');
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
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent>
          <ProfileMenuItem>Item 1</ProfileMenuItem>
          <ProfileMenuItem>Item 2</ProfileMenuItem>
          <ProfileMenuItem>Item 3</ProfileMenuItem>
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const items = screen.getAllByRole('menu-profile-settings-itens');
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
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent>
          <ProfileMenuItem>Item 1</ProfileMenuItem>
          <ProfileMenuItem>Item 2</ProfileMenuItem>
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    expect(document.activeElement).not.toHaveAttribute(
      'role',
      'menu-profile-settings-itens'
    );

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getAllByRole('menu-profile-settings-itens')[0]).toHaveFocus();
  });

  it('starts from last item when no item is focused and ArrowUp is pressed', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent>
          <ProfileMenuItem>Item 1</ProfileMenuItem>
          <ProfileMenuItem>Item 2</ProfileMenuItem>
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    expect(document.activeElement).not.toHaveAttribute(
      'role',
      'menu-profile-settings-itens'
    );

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    const items = screen.getAllByRole('menu-profile-settings-itens');
    expect(items[items.length - 1]).toHaveFocus();
  });

  it('ignores disabled items in navigation', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent>
          <ProfileMenuItem>Item 1</ProfileMenuItem>
          <ProfileMenuItem disabled>Disabled Item</ProfileMenuItem>
          <ProfileMenuItem>Item 2</ProfileMenuItem>
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const items = screen.getAllByRole('menu-profile-settings-itens');
    items[0].focus();

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(items[2]).toHaveFocus();

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(items[0]).toHaveFocus();
  });

  it('does nothing when there are no enabled items', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent>
          <ProfileMenuItem disabled>Disabled 1</ProfileMenuItem>
          <ProfileMenuItem disabled>Disabled 2</ProfileMenuItem>
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const initialFocus = document.activeElement;

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(initialFocus);

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(initialFocus);
  });

  it('prevents default behavior for ArrowDown/ArrowUp', () => {
    render(
      <DropdownProfileMenu open>
        <ProfileMenuTrigger />
        <ProfileMenuContent>
          <ProfileMenuItem>Item 1</ProfileMenuItem>
          <ProfileMenuItem>Item 2</ProfileMenuItem>
        </ProfileMenuContent>
      </DropdownProfileMenu>
    );

    const items = screen.getAllByRole('menu-profile-settings-itens');
    items[0].focus();

    const spy = jest.spyOn(Event.prototype, 'preventDefault');

    fireEvent.keyDown(document, { key: 'ArrowDown' });

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
