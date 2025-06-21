import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { Menu, MenuItem, MenuSeparator } from './Menu';

describe('Menu component', () => {
  describe('Default value behavior (Uncontrolled)', () => {
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

    it('does not override controlled value with defaultValue', () => {
      const handleChange = jest.fn();

      render(
        <Menu
          defaultValue="home"
          value="dashboard"
          onValueChange={handleChange}
        >
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      expect(screen.getByText('Dashboard')).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenCalledWith('dashboard');
    });
  });

  describe('Variant: Breadcrumb', () => {
    it('renders breadcrumb variant items with data-variant', () => {
      const handleChange = jest.fn();

      render(
        <Menu
          defaultValue="home"
          value="dashboard"
          onValueChange={handleChange}
        >
          <MenuItem value="home" variant="breadcrumb">
            Home
          </MenuItem>
          <MenuItem value="dashboard" variant="breadcrumb">
            Dashboard
          </MenuItem>
        </Menu>
      );

      const menuItems = screen.getAllByRole('menuitem');
      const breadcrumbItem = menuItems.find(
        (item) => item.getAttribute('data-variant') === 'breadcrumb'
      );
      expect(breadcrumbItem).toBeInTheDocument();
    });

    it('updates value on click in breadcrumb item', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard" variant="breadcrumb">
            Dashboard
          </MenuItem>
        </Menu>
      );

      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);

      expect(dashboardItem).toHaveClass('border-b-primary-950');
      expect(handleChange).toHaveBeenLastCalledWith('dashboard');
    });
  });

  describe('User interaction', () => {
    it('updates value on click', () => {
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
      fireEvent.click(dashboardItem);
      expect(dashboardItem).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenLastCalledWith('dashboard');

      const homeItem = screen.getByText('Home');
      fireEvent.click(homeItem);
      expect(homeItem).toHaveClass('border-b-primary-950');
      expect(handleChange).toHaveBeenLastCalledWith('home');
    });

    it('ignores clicks if item is disabled', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard" disabled>
            Dashboard
          </MenuItem>
        </Menu>
      );

      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);

      expect(screen.getByText('Home')).toHaveClass('bg-primary-50');
      expect(handleChange).not.toHaveBeenCalledWith('dashboard');
    });

    it('updates value on Enter key', () => {
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

    it('updates value on Space key', () => {
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
      expect(homeItem).toHaveClass('border-b-primary-950');
      expect(handleChange).toHaveBeenLastCalledWith('home');
    });
  });

  describe('Controlled mode', () => {
    it('always reflects controlled value prop', () => {
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
      const handleChange = jest.fn();

      render(
        <Menu
          defaultValue="home"
          onValueChange={handleChange}
          variant="breadcrumb"
        >
          <MenuItem value="home" variant="breadcrumb">
            Home
          </MenuItem>
          <MenuSeparator data-testid="separator" />
          <MenuItem value="dashboard" variant="breadcrumb">
            Dashboard
          </MenuItem>
        </Menu>
      );

      expect(screen.getByTestId('separator')).toHaveClass('text-text-600');
    });
  });
});

describe('useMenuStore hook', () => {
  it('throws error when used outside a Menu', () => {
    const originalUseMenuStore = jest.requireActual('./Menu').useMenuStore;
    jest.spyOn(React, 'useRef').mockReturnValue({ current: null });

    expect(() => {
      renderHook(() => originalUseMenuStore(undefined));
    }).toThrow('Component must be used within a Menu (store is missing)');

    jest.restoreAllMocks();
  });
});

describe('MenuItem tabIndex behavior', () => {
  it('has tabIndex -1 when disabled', () => {
    render(
      <Menu defaultValue="home">
        <MenuItem value="home" variant="breadcrumb" disabled>
          Home
        </MenuItem>
      </Menu>
    );

    const item = screen.getByRole('menuitem', { name: 'Home' });
    expect(item).toHaveAttribute('tabindex', '-1');
  });

  it('has tabIndex 0 when enabled', () => {
    render(
      <Menu defaultValue="home">
        <MenuItem value="home" variant="breadcrumb">
          Home
        </MenuItem>
      </Menu>
    );

    const item = screen.getByRole('menuitem', { name: 'Home' });
    expect(item).toHaveAttribute('tabindex', '0');
  });
});
