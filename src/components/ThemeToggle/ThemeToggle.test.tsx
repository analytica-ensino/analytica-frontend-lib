import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

// Mock do useTheme
const mockUseTheme = {
  themeMode: 'system',
  isDark: false,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
};

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => mockUseTheme,
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('variant simple', () => {
    it('should render simple toggle button', () => {
      render(<ThemeToggle variant="simple" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Escuro');
    });

    it('should call toggleTheme when clicked', () => {
      render(<ThemeToggle variant="simple" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockUseTheme.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should show correct icon and text based on theme', () => {
      mockUseTheme.isDark = true;
      render(<ThemeToggle variant="simple" />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Claro');
    });

    it('should hide icons when showIcons is false', () => {
      render(<ThemeToggle variant="simple" showIcons={false} />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveTextContent('☀️');
      expect(button).not.toHaveTextContent('🌙');
    });

    it('should hide labels when showLabels is false', () => {
      render(<ThemeToggle variant="simple" showLabels={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('☀️');
      expect(button).not.toHaveTextContent('Claro');
      expect(button).not.toHaveTextContent('Escuro');
    });

    it('should render custom children', () => {
      render(
        <ThemeToggle variant="simple">
          <span>Custom Toggle</span>
        </ThemeToggle>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Custom Toggle');
    });
  });

  describe('variant detailed', () => {
    it('should render detailed toggle with all options', () => {
      render(<ThemeToggle variant="detailed" />);

      expect(screen.getByText('Tema: Sistema')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /claro/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /escuro/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sistema/i })
      ).toBeInTheDocument();
    });

    it('should call setTheme with correct theme when buttons are clicked', () => {
      render(<ThemeToggle variant="detailed" />);

      fireEvent.click(screen.getByRole('button', { name: /claro/i }));
      expect(mockUseTheme.setTheme).toHaveBeenCalledWith('light');

      fireEvent.click(screen.getByRole('button', { name: /escuro/i }));
      expect(mockUseTheme.setTheme).toHaveBeenCalledWith('dark');

      fireEvent.click(screen.getByRole('button', { name: /sistema/i }));
      expect(mockUseTheme.setTheme).toHaveBeenCalledWith('system');
    });

    it('should show correct active state', () => {
      mockUseTheme.themeMode = 'dark';
      render(<ThemeToggle variant="detailed" />);

      const darkButton = screen.getByRole('button', { name: /escuro/i });
      expect(darkButton).toHaveClass('bg-primary-500');
    });
  });

  describe('variant buttons', () => {
    it('should render three separate buttons', () => {
      render(<ThemeToggle variant="buttons" />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      expect(
        screen.getByRole('button', { name: /claro/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /escuro/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sistema/i })
      ).toBeInTheDocument();
    });

    it('should call setTheme with correct theme when buttons are clicked', () => {
      render(<ThemeToggle variant="buttons" />);

      fireEvent.click(screen.getByRole('button', { name: /claro/i }));
      expect(mockUseTheme.setTheme).toHaveBeenCalledWith('light');

      fireEvent.click(screen.getByRole('button', { name: /escuro/i }));
      expect(mockUseTheme.setTheme).toHaveBeenCalledWith('dark');

      fireEvent.click(screen.getByRole('button', { name: /sistema/i }));
      expect(mockUseTheme.setTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('sizes', () => {
    it('should apply correct size classes', () => {
      const { rerender } = render(<ThemeToggle variant="simple" size="sm" />);
      expect(screen.getByRole('button')).toHaveClass('text-sm');

      rerender(<ThemeToggle variant="simple" size="md" />);
      expect(screen.getByRole('button')).toHaveClass('text-md');

      rerender(<ThemeToggle variant="simple" size="lg" />);
      expect(screen.getByRole('button')).toHaveClass('text-lg');
    });
  });

  describe('accessibility', () => {
    it('should be focusable', () => {
      render(<ThemeToggle variant="simple" />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should support keyboard navigation', () => {
      render(<ThemeToggle variant="buttons" />);

      const buttons = screen.getAllByRole('button');
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();
    });
  });

  describe('customization', () => {
    it('should apply custom className', () => {
      render(<ThemeToggle variant="simple" className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should pass through other props', () => {
      render(<ThemeToggle variant="simple" data-testid="theme-toggle" />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toBeInTheDocument();
    });
  });
});
