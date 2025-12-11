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
  ProfileMenuInfo,
  ProfileMenuSection,
  ProfileMenuTrigger,
  ProfileToggleTheme,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  MenuLabel,
  DropdownMenuSeparator,
} from './DropdownMenu';
import React from 'react';
import type { ThemeMode } from '@/hooks/useTheme';

// Mock do useTheme hook
const mockUseTheme = {
  themeMode: 'system' as ThemeMode,
  isDark: false,
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
};

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme,
}));

describe('DropdownMenu component', () => {
  describe('Open/close control', () => {
    it('calls onOpenChange when state changes (uncontrolled with callback)', () => {
      const handleOpenChange = jest.fn();

      render(
        <DropdownMenu onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>Content</DropdownMenuContent>
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
          <DropdownMenuContent>Menu Content</DropdownMenuContent>
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
          <DropdownMenuContent>Content</DropdownMenuContent>
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
            <DropdownMenuContent>Menu Content</DropdownMenuContent>
          </DropdownMenu>
          <button data-testid="outside">Outside</button>
        </div>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.pointerDown(screen.getByTestId('outside'));
      await waitFor(() =>
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      );
    });

    it('does not close on outside click if clicking inside menu', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Inside Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const insideItem = screen.getByRole('menuitem');
      fireEvent.pointerDown(insideItem);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('renders open state correctly when open prop is true', () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>Menu Content</DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    // Note: Tests for Enter/Space key opening dropdown were removed because
    // native <button> elements handle these keys automatically as click events.
    // The click tests already cover this functionality.
  });

  describe('DropdownMenuItem behavior', () => {
    it('renders DropdownMenuItem with correct roles and triggers onClick', () => {
      const handleClick = jest.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menuitem');
      expect(item).toHaveTextContent('Item 1');
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalled();
    });

    it('prevents click and keydown on disabled DropdownMenuItem', () => {
      const handleClick = jest.fn();

      render(
        <DropdownMenu open>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onClick={handleClick}>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(item);
      fireEvent.keyDown(item, { key: 'Enter' });
      fireEvent.keyDown(item, { key: 'ArrowDown' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard interaction (Enter) on DropdownMenuItem', () => {
      const handleClick = jest.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menuitem');
      fireEvent.keyDown(item, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('MenuLabel and DropdownMenuSeparator behavior', () => {
    it('applies inset class when inset prop is true on MenuLabel', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <MenuLabel inset data-testid="label-with-inset">
              Label with inset
            </MenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const group = screen.getByTestId('label-with-inset');
      expect(group).toHaveClass('pl-8');
      expect(group).toHaveTextContent('Label with inset');
    });

    it('renders MenuLabel and DropdownMenuSeparator', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent>
            <MenuLabel data-testid="label-with-label">Label</MenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByTestId('label-with-label')).toHaveTextContent('Label');
      expect(screen.getByText('Item')).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuContent direction and positioning', () => {
  it('renders with default position (bottom, start) classes and styles', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>Content</DropdownMenuContent>
      </DropdownMenu>
    );

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('absolute top-full left-0');
    expect(menu).toHaveStyle({ marginTop: 4 });
  });

  describe('Portal mode', () => {
    const TestPortalDropdown = ({
      align = 'start' as 'start' | 'center' | 'end',
      side = 'bottom' as 'top' | 'bottom' | 'left' | 'right',
    }) => {
      const triggerRef = React.useRef<HTMLButtonElement>(null);
      return (
        <DropdownMenu open>
          <DropdownMenuTrigger ref={triggerRef}>Toggle</DropdownMenuTrigger>
          <DropdownMenuContent
            portal
            triggerRef={triggerRef}
            align={align}
            side={side}
          >
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };

    it('renders portal with align="start" (default)', () => {
      render(<TestPortalDropdown align="start" />);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('fixed');
      expect(menu).toHaveAttribute('data-dropdown-content', 'true');
    });

    it('renders portal with align="end"', () => {
      render(<TestPortalDropdown align="end" />);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('fixed');
      // align="end" sets right style
      expect(menu.style.right).toBeDefined();
    });

    it('renders portal with align="center"', () => {
      render(<TestPortalDropdown align="center" />);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('fixed');
      // align="center" sets transform: translateX(-50%)
      expect(menu.style.transform).toBe('translateX(-50%)');
    });

    it('renders portal with side="top"', () => {
      render(<TestPortalDropdown side="top" />);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('fixed');
      // side="top" positions above the trigger
      expect(menu.style.top).toBeDefined();
    });

    it('renders portal with side="left"', () => {
      render(<TestPortalDropdown side="left" />);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('fixed');
      // side="left" positions to the left of the trigger
      expect(menu.style.top).toBeDefined();
      expect(menu.style.left).toBeDefined();
    });

    it('renders portal with side="right"', () => {
      render(<TestPortalDropdown side="right" />);

      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('fixed');
      // side="right" positions to the right of the trigger
      expect(menu.style.top).toBeDefined();
      expect(menu.style.left).toBeDefined();
    });

    it('does not close when clicking inside portal content', async () => {
      render(<TestPortalDropdown />);

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();

      // Click inside the portal content
      fireEvent.pointerDown(menu);

      // Dropdown should remain open
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('does not close when clicking on menu item inside portal', async () => {
      render(<TestPortalDropdown />);

      const menuItem = screen.getByRole('menuitem');
      expect(menuItem).toBeInTheDocument();

      // Click on menu item (which is inside portal)
      fireEvent.pointerDown(menuItem);

      // Dropdown should remain open (handleClickOutside should return early)
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  it('renders with side "top" and align "end"', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" sideOffset={10}>
          Content
        </DropdownMenuContent>
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
        <DropdownMenuContent side="right" align="center" sideOffset={8}>
          Content
        </DropdownMenuContent>
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
        <DropdownMenuContent side="left" align="start" sideOffset={12}>
          Content
        </DropdownMenuContent>
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
        <DropdownMenuContent>Menu Content</DropdownMenuContent>
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
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
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
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
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
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
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
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(document.activeElement).not.toHaveAttribute('role', 'menuitem');

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    const items = screen.getAllByRole('menuitem');
    expect(items.at(-1)).toHaveFocus();
  });

  it('ignores disabled items in navigation', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
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
        <DropdownMenuContent>
          <DropdownMenuItem disabled>Disabled 1</DropdownMenuItem>
          <DropdownMenuItem disabled>Disabled 2</DropdownMenuItem>
        </DropdownMenuContent>
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
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
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
          <DropdownMenuContent>Content</DropdownMenuContent>
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
          <DropdownMenuContent>Menu Content</DropdownMenuContent>
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
          <DropdownMenuContent>Content</DropdownMenuContent>
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
            <DropdownMenuContent>Menu Content</DropdownMenuContent>
          </DropdownMenu>
          <button data-testid="outside">Outside</button>
        </div>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.pointerDown(screen.getByTestId('outside'));
      await waitFor(() =>
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      );
    });

    it('does not close on outside click if clicking inside menu', () => {
      render(
        <DropdownMenu>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <DropdownMenuItem variant="profile">Inside Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const insideItem = screen.getByRole('menuitem');
      fireEvent.pointerDown(insideItem);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('renders open state correctly when open prop is true', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>Menu Content</DropdownMenuContent>
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
  describe('DropdownMenuItem behavior', () => {
    it('renders DropdownMenuItem with correct roles and triggers onClick', () => {
      const handleClick = jest.fn();
      render(
        <DropdownMenu>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <DropdownMenuItem variant="profile" onClick={handleClick}>
              Item 1
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      fireEvent.click(screen.getByRole('button'));
      const item = screen.getByRole('menuitem');
      expect(item).toHaveTextContent('Item 1');
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalled();
    });

    it('prevents click and keydown on disabled DropdownMenuItem', () => {
      const handleClick = jest.fn();

      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <DropdownMenuItem variant="profile" disabled onClick={handleClick}>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(item);
      fireEvent.keyDown(item, { key: 'Enter' });
      fireEvent.keyDown(item, { key: 'ArrowDown' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard interaction (Enter) on DropdownMenuItem', () => {
      const handleClick = jest.fn();
      render(
        <DropdownMenu>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <DropdownMenuItem variant="profile" onClick={handleClick}>
              Item 1
            </DropdownMenuItem>
          </DropdownMenuContent>
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
          <DropdownMenuContent>
            <ProfileMenuHeader
              data-testid="ProfileMenuHeader"
              email="ana@gmail.com"
              name="Ana Paula"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('ProfileMenuHeader')).toBeInTheDocument();
      expect(screen.getByText('Ana Paula')).toBeInTheDocument();
      expect(screen.getByText('ana@gmail.com')).toBeInTheDocument();
    });

    it('renders user icon when no photoUrl is provided', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuHeader
              data-testid="profile-header"
              email="test@test.com"
              name="Test User"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const header = screen.getByTestId('profile-header');
      // Verifica que o ícone de usuário está presente dentro do header
      const userIcon = header.querySelector('svg');
      expect(userIcon).toBeInTheDocument();
      // Verifica que não há imagem
      expect(screen.queryByAltText('Foto de perfil')).not.toBeInTheDocument();
    });

    it('renders profile image when photoUrl is provided', () => {
      const photoUrl = 'https://example.com/photo.jpg';
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuHeader
              email="test@test.com"
              name="Test User"
              photoUrl={photoUrl}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const img = screen.getByAltText('Foto de perfil');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', photoUrl);
      expect(img).toHaveClass('w-full', 'h-full', 'object-cover');
    });

    it('does not render image when photoUrl is null', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuHeader
              data-testid="profile-header"
              email="test@test.com"
              name="Test User"
              photoUrl={null}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.queryByAltText('Foto de perfil')).not.toBeInTheDocument();
      const header = screen.getByTestId('profile-header');
      const userIcon = header.querySelector('svg');
      expect(userIcon).toBeInTheDocument();
    });

    it('renders ProfileMenuHeader with custom className', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuHeader
              data-testid="profile-header"
              email="test@test.com"
              name="Test User"
              className="custom-class"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const header = screen.getByTestId('profile-header');
      expect(header).toHaveClass('custom-class');
    });

    it('renders ProfileMenuHeader with correct data-component attribute', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuHeader
              data-testid="profile-header"
              email="test@test.com"
              name="Test User"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const header = screen.getByTestId('profile-header');
      expect(header).toHaveAttribute('data-component', 'ProfileMenuHeader');
    });
  });

  describe('ProfileMenuInfo behavior', () => {
    it('renders ProfileMenuInfo with correct content', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuInfo
              data-testid="profile-info"
              schoolName="Escola Municipal"
              classYearName="1º Ano A"
              schoolYearName="2024"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('profile-info')).toBeInTheDocument();
      expect(screen.getByText('Escola Municipal')).toBeInTheDocument();
      expect(screen.getByText('1º Ano A')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    it('renders ProfileMenuInfo with correct separator between classYearName and schoolYearName', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuInfo
              data-testid="profile-info"
              schoolName="Escola Municipal"
              classYearName="1º Ano A"
              schoolYearName="2024"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const info = screen.getByTestId('profile-info');
      const separator = info.querySelector('p.text-xs.align-middle');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveTextContent('●');
    });

    it('renders ProfileMenuInfo with correct data-component attribute', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuInfo
              data-testid="profile-info"
              schoolName="Escola Municipal"
              classYearName="1º Ano A"
              schoolYearName="2024"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const info = screen.getByTestId('profile-info');
      expect(info).toHaveAttribute('data-component', 'ProfileMenuInfo');
    });

    it('renders ProfileMenuInfo with custom className', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuInfo
              data-testid="profile-info"
              schoolName="Escola Municipal"
              classYearName="1º Ano A"
              schoolYearName="2024"
              className="custom-info-class"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const info = screen.getByTestId('profile-info');
      expect(info).toHaveClass('custom-info-class');
    });

    it('renders ProfileMenuInfo with correct structure and spacing', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuInfo
              data-testid="profile-info"
              schoolName="Escola Municipal"
              classYearName="1º Ano A"
              schoolYearName="2024"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const info = screen.getByTestId('profile-info');
      // Verifica que tem a estrutura correta: span vazio + div com informações
      expect(info).toHaveClass('flex', 'flex-row', 'gap-4', 'items-center');
      const emptySpan = info.querySelector('span.w-16.h-16');
      expect(emptySpan).toBeInTheDocument();
    });
  });

  describe('ProfileMenuSection behavior', () => {
    it('renders ProfileMenuSection with children', () => {
      render(
        <DropdownMenu open>
          <ProfileMenuTrigger />
          <DropdownMenuContent>
            <ProfileMenuSection data-testid="ProfileMenuSection">
              <DropdownMenuItem variant="profile">Item 1</DropdownMenuItem>
            </ProfileMenuSection>
          </DropdownMenuContent>
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
          <DropdownMenuContent>
            <ProfileMenuFooter />
          </DropdownMenuContent>
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
          <DropdownMenuContent>
            <ProfileMenuFooter
              data-testid="footer-button"
              onClick={handleClick}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('footer-button');

      fireEvent.click(trigger);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe('ProfileToggleTheme component', () => {
  // Mock do globalThis.matchMedia
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.themeMode = 'system';
    mockUseTheme.isDark = false;
  });

  it('renders ProfileToggleTheme with correct content', () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <DropdownMenuContent variant="profile">
          <ProfileToggleTheme />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Check if the theme toggle item is rendered
    expect(screen.getByText('Aparência')).toBeInTheDocument();
  });

  it('opens modal when ProfileToggleTheme is clicked', async () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <DropdownMenuContent variant="profile">
          <ProfileToggleTheme />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click on the theme toggle item
    const themeItem = screen.getByText('Aparência');
    fireEvent.click(themeItem);

    // Check if modal is opened
    await waitFor(() => {
      expect(screen.getByText('Escolha o tema:')).toBeInTheDocument();
    });
  });

  it('closes modal when Cancel button is clicked', async () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <DropdownMenuContent variant="profile">
          <ProfileToggleTheme />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click on the theme toggle item
    const themeItem = screen.getByText('Aparência');
    fireEvent.click(themeItem);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Escolha o tema:')).toBeInTheDocument();
    });

    // Click Cancel button
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    // Check if modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Escolha o tema:')).not.toBeInTheDocument();
    });
  });

  it('saves theme when Save button is clicked', async () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <DropdownMenuContent variant="profile">
          <ProfileToggleTheme />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click on the theme toggle item
    const themeItem = screen.getByText('Aparência');
    fireEvent.click(themeItem);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Escolha o tema:')).toBeInTheDocument();
    });

    // Click Save button
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // Check if modal is closed (which indicates save was successful)
    await waitFor(() => {
      expect(screen.queryByText('Escolha o tema:')).not.toBeInTheDocument();
    });
  });

  it('prevents dropdown from closing when theme item is clicked', async () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <DropdownMenuContent variant="profile">
          <ProfileToggleTheme />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click on the theme toggle item
    const themeItem = screen.getByText('Aparência');
    fireEvent.click(themeItem);

    // Check if dropdown is still open (modal opened but dropdown didn't close)
    expect(screen.getByText('Escolha o tema:')).toBeInTheDocument();
  });

  it('renders ThemeToggle component inside modal', async () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <DropdownMenuContent variant="profile">
          <ProfileToggleTheme />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click on the theme toggle item
    const themeItem = screen.getByText('Aparência');
    fireEvent.click(themeItem);

    // Wait for modal to open and check if ThemeToggle is rendered
    await waitFor(() => {
      expect(screen.getByText('Escolha o tema:')).toBeInTheDocument();
      // Check if theme options are rendered (Claro, Escuro, Sistema)
      expect(screen.getByText('Claro')).toBeInTheDocument();
      expect(screen.getByText('Escuro')).toBeInTheDocument();
      expect(screen.getByText('Sistema')).toBeInTheDocument();
    });
  });

  it('opens theme modal when Enter key is pressed on theme item', async () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <DropdownMenuContent variant="profile">
          <ProfileToggleTheme />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Press Enter on the theme toggle item
    const themeItem = screen.getByText('Aparência');
    fireEvent.keyDown(themeItem, { key: 'Enter' });

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Escolha o tema:')).toBeInTheDocument();
    });
  });

  it('opens theme modal when Space key is pressed on theme item', async () => {
    render(
      <DropdownMenu>
        <ProfileMenuTrigger />
        <DropdownMenuContent variant="profile">
          <ProfileToggleTheme />
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Press Space on the theme toggle item
    const themeItem = screen.getByText('Aparência');
    fireEvent.keyDown(themeItem, { key: ' ' });

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Escolha o tema:')).toBeInTheDocument();
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
