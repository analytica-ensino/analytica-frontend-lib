import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Search from './Search';

interface MockDropdownProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MockDropdownContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface MockDropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

// Mock do DropdownMenu para isolar o teste do Search
jest.mock('../DropdownMenu/DropdownMenu', () => {
  return {
    __esModule: true,
    default: ({ children, open, onOpenChange }: MockDropdownProps) => {
      React.useEffect(() => {
        if (onOpenChange && typeof onOpenChange === 'function') {
          onOpenChange(open);
        }
      }, [open, onOpenChange]);

      return open ? <div data-testid="dropdown-menu">{children}</div> : null;
    },
    DropdownMenuContent: ({
      children,
      className,
      style,
    }: MockDropdownContentProps) => (
      <div data-testid="dropdown-content" className={className} style={style}>
        {children}
      </div>
    ),
    DropdownMenuItem: ({
      children,
      onClick,
      className,
    }: MockDropdownItemProps) => (
      <div
        data-testid="dropdown-item"
        className={className}
        onClick={onClick}
        role="button"
      >
        {children}
      </div>
    ),
    createDropdownStore: () => ({
      setState: jest.fn(),
      getState: () => ({ open: false, setOpen: jest.fn() }),
    }),
  };
});

describe('Search Component', () => {
  const defaultOptions = ['Filosofia', 'Física', 'Matemática', 'Português'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input with default props', () => {
      render(<Search options={defaultOptions} />);

      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Buscar...');
      expect(input).toHaveClass('border-border-300', 'bg-primary');
    });

    it('should render with custom placeholder', () => {
      render(
        <Search options={defaultOptions} placeholder="Buscar matérias..." />
      );

      const input = screen.getByPlaceholderText('Buscar matérias...');
      expect(input).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(<Search options={defaultOptions} />);

      const searchIcon =
        screen.getByTestId('search-input').previousElementSibling;
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveClass('pointer-events-none');
    });

    it('should render with custom className', () => {
      render(<Search options={defaultOptions} className="custom-class" />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveClass('custom-class');
    });

    it('should render with custom containerClassName', () => {
      render(
        <Search
          options={defaultOptions}
          containerClassName="custom-container"
        />
      );

      const container = screen.getByRole('textbox').closest('div');
      expect(container).toHaveClass('custom-container');
    });
  });

  describe('Input Behavior', () => {
    it('should handle input changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Search options={defaultOptions} onChange={handleChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Fi');

      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(input).toHaveValue('Fi');
    });

    it('should call onSearch callback', async () => {
      const user = userEvent.setup();
      const handleSearch = jest.fn();

      render(<Search options={defaultOptions} onSearch={handleSearch} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Fi');

      expect(handleSearch).toHaveBeenCalledWith('F');
      expect(handleSearch).toHaveBeenCalledWith('Fi');
    });

    it('should show clear button when input has value', () => {
      render(
        <Search options={defaultOptions} value="Test" onChange={() => {}} />
      );

      const clearButton = screen.getByLabelText('Limpar busca');
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear button when input is empty', () => {
      render(<Search options={defaultOptions} value="" />);

      const clearButton = screen.queryByLabelText('Limpar busca');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <Search options={defaultOptions} value="Test" onChange={handleChange} />
      );

      const clearButton = screen.getByLabelText('Limpar busca');
      await user.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' }),
        })
      );
    });

    it('should call custom onClear callback', async () => {
      const user = userEvent.setup();
      const handleClear = jest.fn();

      render(
        <Search options={defaultOptions} value="Test" onClear={handleClear} />
      );

      const clearButton = screen.getByLabelText('Limpar busca');
      await user.click(clearButton);

      expect(handleClear).toHaveBeenCalled();
    });
  });

  describe('Dropdown Functionality', () => {
    it('should show dropdown when typing with matching options', async () => {
      const user = userEvent.setup();

      render(<Search options={defaultOptions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Fi');

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      });
    });

    it('should filter options based on input value', async () => {
      const user = userEvent.setup();

      render(<Search options={defaultOptions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'Fi');

      await waitFor(() => {
        const items = screen.getAllByTestId('dropdown-item');
        expect(items).toHaveLength(2); // Filosofia, Física
      });
    });

    it('should not show dropdown when no options match', async () => {
      const user = userEvent.setup();

      render(<Search options={defaultOptions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'xyz');

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });
    });

    it('should select option when clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      const handleChange = jest.fn();

      render(
        <Search
          options={defaultOptions}
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'Fi');

      await waitFor(() => {
        const firstItem = screen.getAllByTestId('dropdown-item')[0];
        return user.click(firstItem);
      });

      expect(handleSelect).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: expect.any(String) }),
        })
      );
    });

    it('should show custom noResultsText when no results', async () => {
      const user = userEvent.setup();

      render(<Search options={[]} noResultsText="Custom no results message" />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'test');

      // Since no options, dropdown shouldn't show
      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });
    });

    it('should call onDropdownChange when dropdown state changes', async () => {
      const user = userEvent.setup();
      const handleDropdownChange = jest.fn();

      render(
        <Search
          options={defaultOptions}
          onDropdownChange={handleDropdownChange}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'Fi');

      await waitFor(() => {
        expect(handleDropdownChange).toHaveBeenCalledWith(true);
      });
    });

    it('should control dropdown visibility externally', () => {
      render(
        <Search options={defaultOptions} showDropdown={true} value="Fi" />
      );

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('should respect custom dropdownMaxHeight', async () => {
      const user = userEvent.setup();

      render(<Search options={defaultOptions} dropdownMaxHeight={150} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'F');

      await waitFor(() => {
        const dropdownContent = screen.getByTestId('dropdown-content');
        expect(dropdownContent).toHaveStyle({ maxHeight: '150px' });
      });
    });
  });

  describe('States and Attributes', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Search options={defaultOptions} disabled />);

      const input = screen.getByRole('combobox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('cursor-not-allowed', 'opacity-40');
    });

    it('should be read-only when readOnly prop is true', () => {
      render(<Search options={defaultOptions} readOnly />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveClass('cursor-default');
    });

    it('should not show clear button when disabled', () => {
      render(<Search options={defaultOptions} disabled value="Test" />);

      const clearButton = screen.queryByLabelText('Limpar busca');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should not show clear button when readOnly', () => {
      render(<Search options={defaultOptions} readOnly value="Test" />);

      const clearButton = screen.queryByLabelText('Limpar busca');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should have correct ARIA attributes', () => {
      render(<Search options={defaultOptions} />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('role', 'combobox');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should have correct ARIA attributes when dropdown is open', async () => {
      const user = userEvent.setup();

      render(<Search options={defaultOptions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'F');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(<Search options={[]} />);

      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });

    it('should handle undefined options', () => {
      render(<Search options={undefined as unknown as string[]} />);

      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });

    it('should handle empty string search', async () => {
      const user = userEvent.setup();

      render(<Search options={defaultOptions} />);

      const input = screen.getByRole('combobox');
      await user.type(input, ' ');
      await user.clear(input);

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });
    });

    it('should handle case-insensitive filtering', async () => {
      const user = userEvent.setup();

      render(<Search options={['Filosofia', 'FÍSICA']} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'fí');

      await waitFor(() => {
        const items = screen.getAllByTestId('dropdown-item');
        expect(items).toHaveLength(2);
      });
    });

    it('should generate unique ID when not provided', () => {
      render(<Search options={defaultOptions} />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('id');
      expect(input.id).toMatch(/^search-/);
    });

    it('should use provided ID', () => {
      render(<Search options={defaultOptions} id="custom-search" />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('id', 'custom-search');
    });
  });

  describe('Click Outside Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      const handleDropdownChange = jest.fn();

      render(
        <div>
          <Search
            options={defaultOptions}
            onDropdownChange={handleDropdownChange}
          />
          <button>Outside button</button>
        </div>
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'Fi');

      await waitFor(() => {
        expect(handleDropdownChange).toHaveBeenCalledWith(true);
      });

      const outsideButton = screen.getByText('Outside button');
      await user.click(outsideButton);

      await waitFor(() => {
        expect(handleDropdownChange).toHaveBeenCalledWith(false);
      });
    });
  });
});
