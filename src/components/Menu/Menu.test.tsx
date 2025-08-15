import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {
  internalCheckScroll,
  internalScroll,
  Menu,
  MenuContent,
  MenuItem,
  MenuItemIcon,
  MenuOverflow,
  Breadcrumb,
} from './Menu';
import { House } from 'phosphor-react';

describe('Menu Component', () => {
  describe('Default Value (Uncontrolled)', () => {
    it('sets default value on mount', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      expect(screen.getByText('Home')).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenCalledWith('home');
    });

    it('invalid menu item variant', () => {
      render(
        <Menu defaultValue="home">
          {/* @ts-expect-error testing invalid variant */}
          <MenuItem value="home" variant="invalid" data-testid="menuitem">
            Home
          </MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      expect(screen.getByTestId('menuitem')).toHaveClass('[&>svg]:size-6');
    });

    it('does not override controlled value', () => {
      const handleChange = jest.fn();

      render(
        <Menu
          defaultValue="home"
          value="dashboard"
          onValueChange={handleChange}
        >
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
          <MenuItem value="dashboard">
            <MenuItemIcon icon={<House />} data-testid="icon" />
          </MenuItem>
        </Menu>
      );

      expect(screen.getByText('Dashboard')).toHaveClass('bg-primary-50');
      expect(screen.getByTestId('icon')).toHaveClass(
        '[&>svg]:w-[17px] [&>svg]:h-[17px]'
      );
      expect(handleChange).toHaveBeenCalledWith('dashboard');
    });

    it('prevents focus on mouse down', () => {
      render(
        <Menu defaultValue="home">
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      const dashboardItem = screen.getByText('Dashboard');

      fireEvent.mouseDown(dashboardItem);
      fireEvent.click(dashboardItem);

      expect(document.activeElement).not.toBe(dashboardItem);
    });
  });

  describe('Breadcrumb Variant', () => {
    it('renders items with data-variant', () => {
      render(
        <Menu defaultValue="home" value="dashboard" onValueChange={jest.fn()}>
          <MenuItem value="home" variant="breadcrumb">
            Home
          </MenuItem>
          <MenuItem value="dashboard" variant="breadcrumb">
            Dashboard
          </MenuItem>
        </Menu>
      );

      const items = screen.getAllByRole('menuitem');
      expect(
        items.some((item) => item.getAttribute('data-variant') === 'breadcrumb')
      ).toBe(true);
    });

    it('updates value on breadcrumb click', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard" variant="breadcrumb">
            Dashboard
          </MenuItem>
        </Menu>
      );

      fireEvent.click(screen.getByText('Dashboard'));
      expect(screen.getByText('Dashboard')).toHaveClass('border-b-0 font-bold');
      expect(handleChange).toHaveBeenLastCalledWith('dashboard');
    });
  });

  describe('User Interaction', () => {
    it('updates value on item click', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home" variant="breadcrumb">
            Home
          </MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      fireEvent.click(screen.getByText('Dashboard'));
      expect(screen.getByText('Dashboard')).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenLastCalledWith('dashboard');

      fireEvent.click(screen.getByText('Home'));
      expect(screen.getByText('Home')).toHaveClass('border-b-0 font-bold');
      expect(handleChange).toHaveBeenLastCalledWith('home');
    });

    it('ignores click when item is disabled', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard" disabled>
            Dashboard
          </MenuItem>
        </Menu>
      );

      fireEvent.click(screen.getByText('Dashboard'));
      expect(handleChange).not.toHaveBeenCalledWith('dashboard');
    });

    it('updates value on Enter key press', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      const dashboardItem = screen.getByText('Dashboard');
      dashboardItem.focus();
      fireEvent.keyDown(dashboardItem, { key: 'Enter' });

      expect(dashboardItem).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenLastCalledWith('dashboard');
    });

    it('updates value on Space key press', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home" variant="breadcrumb">
            Home
          </MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      const dashboardItem = screen.getByText('Dashboard');
      dashboardItem.focus();
      fireEvent.keyDown(dashboardItem, { key: ' ' });
      expect(dashboardItem).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenLastCalledWith('dashboard');

      const homeItem = screen.getByText('Home');
      homeItem.focus();
      fireEvent.keyDown(homeItem, { key: ' ' });
      expect(handleChange).toHaveBeenLastCalledWith('home');
    });
  });

  describe('Controlled Mode', () => {
    it('reflects controlled value prop', () => {
      const { rerender } = render(
        <Menu defaultValue="home" value="dashboard">
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      expect(screen.getByText('Dashboard')).toHaveClass('bg-primary-50');

      rerender(
        <Menu defaultValue="home" value="home">
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      expect(screen.getByText('Home')).toHaveClass('bg-primary-50');
    });
  });

  describe('MenuSeparator', () => {
    it('renders separator with correct class', () => {
      render(
        <Menu
          defaultValue="home"
          variant="breadcrumb"
          onValueChange={jest.fn()}
        >
          <MenuItem value="home" variant="breadcrumb" separator>
            Home
          </MenuItem>
          <MenuItem value="dashboard" variant="breadcrumb">
            Dashboard
          </MenuItem>
        </Menu>
      );

      expect(screen.getByTestId('separator')).toHaveClass('text-text-600');
    });
  });
});

describe('useMenuStore Hook', () => {
  it('throws error when used outside a Menu', () => {
    const originalUseMenuStore = jest.requireActual('./Menu').useMenuStore;
    jest.spyOn(React, 'useRef').mockReturnValue({ current: null });

    expect(() => {
      renderHook(() => originalUseMenuStore(undefined));
    }).toThrow('MenuItem must be inside Menu');

    jest.restoreAllMocks();
  });
});

describe('Breadcrumb Component', () => {
  it('renders parent and current page correctly', () => {
    const onBackClick = jest.fn();

    render(
      <Breadcrumb
        parentPageName="Home"
        currentPage="Dashboard"
        onBackClick={onBackClick}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('calls onBackClick when parent page is clicked', () => {
    const onBackClick = jest.fn();

    render(
      <Breadcrumb
        parentPageName="Home"
        currentPage="Dashboard"
        onBackClick={onBackClick}
      />
    );

    fireEvent.click(screen.getByText('Home'));
    expect(onBackClick).toHaveBeenCalledTimes(1);
  });

  it('current page is not clickable', () => {
    const onBackClick = jest.fn();

    render(
      <Breadcrumb
        parentPageName="Home"
        currentPage="Dashboard"
        onBackClick={onBackClick}
      />
    );

    const currentPageItem = screen.getByText('Dashboard');
    expect(
      currentPageItem.closest('[aria-disabled="true"]')
    ).toBeInTheDocument();
    expect(currentPageItem.closest('li')).toHaveClass('text-text-950');
    expect(currentPageItem.closest('li')).toHaveClass('font-bold');
  });

  it('parent page has correct styles', () => {
    const onBackClick = jest.fn();

    render(
      <Breadcrumb
        parentPageName="Products"
        currentPage="Details"
        onBackClick={onBackClick}
      />
    );

    const parentItem = screen.getByText('Products').closest('li');
    expect(parentItem).toHaveClass('text-text-600');
    expect(parentItem).toHaveClass('underline');
    expect(parentItem).toHaveClass('cursor-pointer');
    expect(parentItem).toHaveClass('hover:text-text-950');
  });

  it('shows separator between items', () => {
    const onBackClick = jest.fn();

    render(
      <Breadcrumb
        parentPageName="Home"
        currentPage="Dashboard"
        onBackClick={onBackClick}
      />
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('text-text-600');
  });

  it('applies custom className', () => {
    const onBackClick = jest.fn();

    render(
      <Breadcrumb
        parentPageName="Home"
        currentPage="Dashboard"
        onBackClick={onBackClick}
        className="custom-class"
      />
    );

    const breadcrumb = document.querySelector('.custom-class');
    expect(breadcrumb).toBeInTheDocument();
  });

  it('forwards additional props', () => {
    const onBackClick = jest.fn();

    const { container } = render(
      <Breadcrumb
        parentPageName="Home"
        currentPage="Dashboard"
        onBackClick={onBackClick}
        data-testid="breadcrumb-test"
      />
    );

    const breadcrumb = container.querySelector(
      '[data-testid="breadcrumb-test"]'
    );
    expect(breadcrumb).toBeInTheDocument();
  });

  it('handles long page names', () => {
    const onBackClick = jest.fn();
    const longParentName =
      'Very Long Parent Page Name That Should Still Render';
    const longCurrentName = 'Another Very Long Current Page Name';

    render(
      <Breadcrumb
        parentPageName={longParentName}
        currentPage={longCurrentName}
        onBackClick={onBackClick}
      />
    );

    expect(screen.getByText(longParentName)).toBeInTheDocument();
    expect(screen.getByText(longCurrentName)).toBeInTheDocument();
  });

  it('onBackClick callback updates when prop changes', () => {
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    const { rerender } = render(
      <Breadcrumb
        parentPageName="Home"
        currentPage="Dashboard"
        onBackClick={firstCallback}
      />
    );

    fireEvent.click(screen.getByText('Home'));
    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(0);

    rerender(
      <Breadcrumb
        parentPageName="Home"
        currentPage="Dashboard"
        onBackClick={secondCallback}
      />
    );

    fireEvent.click(screen.getByText('Home'));
    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});

describe('MenuItem TabIndex', () => {
  it('has tabIndex -1 when disabled', () => {
    render(
      <Menu defaultValue="home">
        <MenuItem value="home" variant="breadcrumb" disabled>
          Home
        </MenuItem>
      </Menu>
    );

    expect(screen.getByRole('menuitem', { name: 'Home' })).toHaveAttribute(
      'tabindex',
      '-1'
    );
  });

  it('has tabIndex 0 when enabled', () => {
    render(
      <Menu defaultValue="home">
        <MenuItem value="home" variant="breadcrumb">
          Home
        </MenuItem>
      </Menu>
    );

    expect(screen.getByRole('menuitem', { name: 'Home' })).toHaveAttribute(
      'tabindex',
      '0'
    );
  });
});

describe('MenuContent', () => {
  it('renders with default variant', () => {
    render(
      <Menu defaultValue="home">
        <MenuContent data-testid="menu-content">
          <MenuItem value="home">Home</MenuItem>
        </MenuContent>
      </Menu>
    );

    const menuContent = screen.getByTestId('menu-content');
    expect(menuContent).toHaveClass('w-full flex flex-row items-center gap-2');
    expect(menuContent).not.toHaveClass('overflow-x-auto scroll-smooth');
  });

  it('renders with breadcrumb variant', () => {
    render(
      <Menu defaultValue="home">
        <MenuContent variant="breadcrumb" data-testid="menu-content">
          <MenuItem value="home">Home</MenuItem>
        </MenuContent>
      </Menu>
    );

    const menuContent = screen.getByTestId('menu-content');
    expect(menuContent).toHaveClass('w-full flex flex-row items-center gap-2');
    expect(menuContent).not.toHaveClass('overflow-x-auto scroll-smooth');
  });

  it('applies custom className', () => {
    render(
      <Menu defaultValue="home">
        <MenuContent className="custom-class" data-testid="menu-content">
          <MenuItem value="home">Home</MenuItem>
        </MenuContent>
      </Menu>
    );

    const menuContent = screen.getByTestId('menu-content');
    expect(menuContent).toHaveClass('custom-class');
  });
});

describe('MenuOverflow', () => {
  const mockChildren = (
    <>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </>
  );

  beforeEach(() => {
    window.HTMLElement.prototype.scrollBy = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<MenuOverflow defaultValue="item1">{mockChildren}</MenuOverflow>);
    expect(screen.getByTestId('menu-overflow-wrapper')).toBeInTheDocument();
  });

  describe('Scroll Function', () => {
    it('calls scrollBy with positive value when direction is right', () => {
      render(<MenuOverflow defaultValue="item1">{mockChildren}</MenuOverflow>);
      const container = screen
        .getByTestId('menu-overflow-wrapper')
        .querySelector('ul');
      if (container) {
        Object.defineProperty(container, 'scrollWidth', { value: 1000 });
        Object.defineProperty(container, 'clientWidth', { value: 500 });
        Object.defineProperty(container, 'scrollLeft', { value: 0 });
        Object.defineProperty(container, 'scrollBy', { value: jest.fn() });

        fireEvent.scroll(container);
        fireEvent.click(screen.getByTestId('scroll-right-button'));

        expect(container.scrollBy).toHaveBeenCalledWith({
          left: 150,
          behavior: 'smooth',
        });
      }
    });

    it('calls scrollBy with negative value when direction is left', () => {
      render(<MenuOverflow defaultValue="item1">{mockChildren}</MenuOverflow>);
      const container = screen
        .getByTestId('menu-overflow-wrapper')
        .querySelector('ul');
      if (container) {
        Object.defineProperty(container, 'scrollLeft', { value: 200 });
        Object.defineProperty(container, 'scrollBy', { value: jest.fn() });

        fireEvent.scroll(container);
        fireEvent.click(screen.getByTestId('scroll-left-button'));

        expect(container.scrollBy).toHaveBeenCalledWith({
          left: -150,
          behavior: 'smooth',
        });
      }
    });
  });

  describe('Button Visibility', () => {
    it('shows right button when overflow exists', () => {
      render(<MenuOverflow defaultValue="item1">{mockChildren}</MenuOverflow>);
      const container = screen
        .getByTestId('menu-overflow-wrapper')
        .querySelector('ul');
      if (container) {
        Object.defineProperty(container, 'scrollWidth', { value: 1000 });
        Object.defineProperty(container, 'clientWidth', { value: 500 });
        Object.defineProperty(container, 'scrollLeft', { value: 0 });

        fireEvent.scroll(container);
        expect(screen.getByTestId('scroll-right-button')).toBeInTheDocument();
        expect(
          screen.queryByTestId('scroll-left-button')
        ).not.toBeInTheDocument();
      }
    });

    it('shows left button when scrolled right', () => {
      render(<MenuOverflow defaultValue="item1">{mockChildren}</MenuOverflow>);
      const container = screen
        .getByTestId('menu-overflow-wrapper')
        .querySelector('ul');
      if (container) {
        Object.defineProperty(container, 'scrollLeft', { value: 200 });

        fireEvent.scroll(container);
        expect(screen.getByTestId('scroll-left-button')).toBeInTheDocument();
      }
    });

    it('hides both buttons when no overflow', () => {
      render(<MenuOverflow defaultValue="item1">{mockChildren}</MenuOverflow>);
      const container = screen
        .getByTestId('menu-overflow-wrapper')
        .querySelector('ul');
      if (container) {
        Object.defineProperty(container, 'scrollWidth', { value: 500 });
        Object.defineProperty(container, 'clientWidth', { value: 500 });

        fireEvent.scroll(container);
        expect(
          screen.queryByTestId('scroll-left-button')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('scroll-right-button')
        ).not.toBeInTheDocument();
      }
    });
  });

  describe('Event Listeners', () => {
    it('adds and removes listeners on mount/unmount', () => {
      const addWindowListener = jest.spyOn(window, 'addEventListener');
      const removeWindowListener = jest.spyOn(window, 'removeEventListener');
      const addContainerListener = jest.spyOn(
        HTMLElement.prototype,
        'addEventListener'
      );
      const removeContainerListener = jest.spyOn(
        HTMLElement.prototype,
        'removeEventListener'
      );

      const { unmount } = render(
        <MenuOverflow defaultValue="item1">{mockChildren}</MenuOverflow>
      );

      expect(addWindowListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
      expect(addContainerListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );

      unmount();

      expect(removeWindowListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
      expect(removeContainerListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });
  });

  describe('internalCheckScroll', () => {
    it('does nothing when container is null', () => {
      const setShowLeftArrow = jest.fn();
      const setShowRightArrow = jest.fn();

      expect(() =>
        internalCheckScroll(null, setShowLeftArrow, setShowRightArrow)
      ).not.toThrow();
      expect(setShowLeftArrow).not.toHaveBeenCalled();
      expect(setShowRightArrow).not.toHaveBeenCalled();
    });
  });

  describe('internalScroll', () => {
    it('does nothing when container is null', () => {
      expect(() => internalScroll(null, 'left')).not.toThrow();
    });
  });

  describe('injectStore', () => {
    it('handles non-element children', () => {
      render(
        <Menu defaultValue="home">
          <MenuContent>
            <MenuItem value="home">Home</MenuItem>
            {'text node'}
            {null}
            {undefined}
          </MenuContent>
        </Menu>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('handles nested children with store injection', () => {
      render(
        <Menu defaultValue="home">
          <MenuContent>
            <div>
              <MenuItem value="home">Home</MenuItem>
            </div>
          </MenuContent>
        </Menu>
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
