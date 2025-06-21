import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { Menu, MenuItem } from './Menu';

describe('Menu component', () => {
  describe('Default value behavior', () => {
    it('sets default value on mount (uncontrolled)', () => {
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
        <Menu defaultValue="home" value="dashboard" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      expect(screen.getByText('Dashboard')).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenCalledWith('dashboard');
    });
  });

  describe('User interaction', () => {
    it('updates value on item click (uncontrolled)', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      const dashboardItem = screen.getByText('Dashboard');
      fireEvent.click(dashboardItem);

      expect(dashboardItem).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenLastCalledWith('dashboard');
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

      // Continua com "home" selecionado
      expect(screen.getByText('Home')).toHaveClass('bg-primary-50');
      expect(handleChange).not.toHaveBeenCalledWith('dashboard');
    });

    it('updates on keyboard Enter', () => {
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

    it('updates on keyboard Space', () => {
      const handleChange = jest.fn();

      render(
        <Menu defaultValue="home" onValueChange={handleChange}>
          <MenuItem value="home">Home</MenuItem>
          <MenuItem value="dashboard">Dashboard</MenuItem>
        </Menu>
      );

      const dashboardItem = screen.getByText('Dashboard');
      dashboardItem.focus();
      fireEvent.keyDown(dashboardItem, { key: ' ' });

      expect(dashboardItem).toHaveClass('bg-primary-50');
      expect(handleChange).toHaveBeenLastCalledWith('dashboard');
    });
  });

  describe('Controlled mode', () => {
    it('always reflects external value prop (controlled)', () => {
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
});

describe('useMenuMenuStore', () => {
  it('should throw error when store is missing', () => {
    const originalUseMenuStore =
      jest.requireActual('./Menu').useMenuStore;

    jest.spyOn(React, 'useRef').mockReturnValue({ current: null });

    expect(() => {
      renderHook(() => originalUseMenuStore(undefined));
    }).toThrow(
      'Component must be used within a Menu (store is missing)'
    );

    jest.restoreAllMocks();
  });
});