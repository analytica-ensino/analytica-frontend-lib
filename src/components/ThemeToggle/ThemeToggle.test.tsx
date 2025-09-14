import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

// Mock do useTheme hook
const mockUseTheme = {
  themeMode: 'system' as 'light' | 'dark' | 'system',
  isDark: false,
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
};

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme,
}));

// Mock do SelectionButton
jest.mock('../SelectionButton/SelectionButton', () => {
  return function MockSelectionButton({
    label,
    selected,
    onClick,
    className,
  }: {
    label: string;
    selected: boolean;
    onClick: () => void;
    className: string;
  }) {
    return (
      <button
        onClick={onClick}
        className={className}
        data-selected={selected}
        data-testid={`theme-${label.toLowerCase()}`}
      >
        {label}
      </button>
    );
  };
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.themeMode = 'system';
    mockUseTheme.isDark = false;
  });

  describe('Default variant', () => {
    it('renders theme options correctly', () => {
      render(<ThemeToggle />);

      expect(screen.getByTestId('theme-claro')).toBeInTheDocument();
      expect(screen.getByTestId('theme-escuro')).toBeInTheDocument();
      expect(screen.getByTestId('theme-sistema')).toBeInTheDocument();
    });

    it('shows system theme as selected by default', () => {
      render(<ThemeToggle />);

      const systemButton = screen.getByTestId('theme-sistema');
      expect(systemButton).toHaveAttribute('data-selected', 'true');
    });

    it('calls setTheme when theme option is clicked', () => {
      render(<ThemeToggle />);

      const lightButton = screen.getByTestId('theme-claro');
      fireEvent.click(lightButton);

      expect(mockUseTheme.setTheme).toHaveBeenCalledWith('light');
    });

    it('does not show save button in default variant', () => {
      render(<ThemeToggle />);

      expect(screen.queryByText('Salvar Tema')).not.toBeInTheDocument();
    });
  });

  describe('With-save variant', () => {
    const mockHandleToogle = jest.fn();

    beforeEach(() => {
      mockHandleToogle.mockClear();
    });

    it('renders theme options without save button', () => {
      render(
        <ThemeToggle variant="with-save" handleToogle={mockHandleToogle} />
      );

      expect(screen.getByTestId('theme-claro')).toBeInTheDocument();
      expect(screen.getByTestId('theme-escuro')).toBeInTheDocument();
      expect(screen.getByTestId('theme-sistema')).toBeInTheDocument();
      expect(screen.queryByText('Salvar Tema')).not.toBeInTheDocument();
    });

    it('updates temp theme and calls handleToogle when option is clicked', () => {
      render(
        <ThemeToggle variant="with-save" handleToogle={mockHandleToogle} />
      );

      const lightButton = screen.getByTestId('theme-claro');
      fireEvent.click(lightButton);

      // Should not call setTheme immediately
      expect(mockUseTheme.setTheme).not.toHaveBeenCalled();
      // Should call handleToogle
      expect(mockHandleToogle).toHaveBeenCalledWith('light');

      // Light button should be selected
      expect(lightButton).toHaveAttribute('data-selected', 'true');
    });

    it('updates temp theme when external theme changes', () => {
      const { rerender } = render(
        <ThemeToggle variant="with-save" handleToogle={mockHandleToogle} />
      );

      // Change external theme
      mockUseTheme.themeMode = 'dark';
      rerender(
        <ThemeToggle variant="with-save" handleToogle={mockHandleToogle} />
      );

      const darkButton = screen.getByTestId('theme-escuro');
      expect(darkButton).toHaveAttribute('data-selected', 'true');
    });

    it('handles multiple theme selections', () => {
      render(
        <ThemeToggle variant="with-save" handleToogle={mockHandleToogle} />
      );

      // Select light theme
      const lightButton = screen.getByTestId('theme-claro');
      fireEvent.click(lightButton);
      expect(lightButton).toHaveAttribute('data-selected', 'true');
      expect(mockHandleToogle).toHaveBeenCalledWith('light');

      // Select dark theme
      const darkButton = screen.getByTestId('theme-escuro');
      fireEvent.click(darkButton);
      expect(darkButton).toHaveAttribute('data-selected', 'true');
      expect(lightButton).toHaveAttribute('data-selected', 'false');
      expect(mockHandleToogle).toHaveBeenCalledWith('dark');
    });
  });

  describe('Props handling', () => {
    it('works without handleToogle prop in with-save variant', () => {
      render(<ThemeToggle variant="with-save" />);

      const lightButton = screen.getByTestId('theme-claro');
      fireEvent.click(lightButton);

      // Should not throw error and should update temp theme
      expect(lightButton).toHaveAttribute('data-selected', 'true');
      expect(mockUseTheme.setTheme).not.toHaveBeenCalled();
    });

    it('defaults to default variant when no variant prop is provided', () => {
      render(<ThemeToggle />);

      expect(screen.queryByText('Salvar Tema')).not.toBeInTheDocument();
    });
  });

  describe('Theme mode changes', () => {
    it('updates selected theme when themeMode changes externally', () => {
      const { rerender } = render(<ThemeToggle />);

      // Initial state - system selected
      expect(screen.getByTestId('theme-sistema')).toHaveAttribute(
        'data-selected',
        'true'
      );

      // Change to light theme externally
      mockUseTheme.themeMode = 'light';
      rerender(<ThemeToggle />);

      expect(screen.getByTestId('theme-claro')).toHaveAttribute(
        'data-selected',
        'true'
      );
      expect(screen.getByTestId('theme-sistema')).toHaveAttribute(
        'data-selected',
        'false'
      );
    });

    it('updates temp theme in with-save variant when themeMode changes', () => {
      const { rerender } = render(
        <ThemeToggle variant="with-save" handleToogle={jest.fn()} />
      );

      // Change to dark theme externally
      mockUseTheme.themeMode = 'dark';
      rerender(<ThemeToggle variant="with-save" handleToogle={jest.fn()} />);

      expect(screen.getByTestId('theme-escuro')).toHaveAttribute(
        'data-selected',
        'true'
      );
    });
  });
});
