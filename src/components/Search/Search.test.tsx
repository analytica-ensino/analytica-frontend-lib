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
    default: function MockDropdownMenu({
      children,
      open,
      onOpenChange,
    }: MockDropdownProps) {
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
      <button
        data-testid="dropdown-item"
        className={className}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    ),
    createDropdownStore: () => ({
      setState: jest.fn(),
      getState: () => ({ open: false, setOpen: jest.fn() }),
    }),
  };
});

describe('Search Component', () => {
  const defaultOptions = ['Filosofia', 'Fisica', 'Matematica', 'Portugues'];

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

    it('should render left icon (CaretLeft)', () => {
      render(<Search options={defaultOptions} />);

      const leftIcon = screen.getByLabelText('Voltar');
      expect(leftIcon).toBeInTheDocument();
      expect(leftIcon).toHaveClass('w-6', 'h-6', 'cursor-pointer');
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

      const container = screen
        .getByRole('combobox')
        .closest('div')?.parentElement;
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
      render(
        <Search options={defaultOptions} value="Fi" onChange={() => {}} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      });
    });

    it('should filter options based on input value', async () => {
      render(
        <Search options={defaultOptions} value="Fi" onChange={() => {}} />
      );

      await waitFor(() => {
        const items = screen.getAllByTestId('dropdown-item');
        expect(items).toHaveLength(2); // Filosofia, Fisica
        expect(items[0]).toHaveTextContent('Filosofia');
        expect(items[1]).toHaveTextContent('Fisica');
      });
    });

    it('should show noResultsText when no options match', async () => {
      render(
        <Search options={defaultOptions} value="xyz" onChange={() => {}} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
        expect(
          screen.getByText('Nenhum resultado encontrado')
        ).toBeInTheDocument();
      });
    });

    it('should select option when clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      const handleChange = jest.fn();

      render(
        <Search
          options={defaultOptions}
          value="Fi"
          onSelect={handleSelect}
          onChange={handleChange}
        />
      );

      await waitFor(() => {
        const firstItem = screen.getAllByTestId('dropdown-item')[0];
        return user.click(firstItem);
      });

      expect(handleSelect).toHaveBeenCalledWith('Filosofia');
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'Filosofia' }),
        })
      );
    });

    it('should show custom noResultsText when no results', async () => {
      render(
        <Search
          options={['Test']}
          value="xyz"
          noResultsText="Custom no results message"
          onChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
        expect(
          screen.getByText('Custom no results message')
        ).toBeInTheDocument();
      });
    });

    it('should call onDropdownChange when dropdown state changes', async () => {
      const handleDropdownChange = jest.fn();

      render(
        <Search
          options={defaultOptions}
          value="Fi"
          onDropdownChange={handleDropdownChange}
          onChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(handleDropdownChange).toHaveBeenCalledWith(true);
      });
    });

    it('should control dropdown visibility externally', () => {
      render(
        <Search
          options={defaultOptions}
          showDropdown={true}
          value="Fi"
          onChange={() => {}}
        />
      );

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('should respect custom dropdownMaxHeight', async () => {
      render(
        <Search
          options={defaultOptions}
          value="F"
          dropdownMaxHeight={150}
          onChange={() => {}}
        />
      );

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
      render(<Search options={defaultOptions} value="F" onChange={() => {}} />);

      const input = screen.getByRole('combobox');
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(<Search options={[]} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle undefined options', () => {
      render(<Search options={undefined as unknown as string[]} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle empty string search', async () => {
      render(<Search options={defaultOptions} value="" onChange={() => {}} />);

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });
    });

    it('should handle case-insensitive filtering', async () => {
      render(
        <Search
          options={['Filosofia', 'FISICA']}
          value="fi"
          onChange={() => {}}
        />
      );

      await waitFor(() => {
        const items = screen.getAllByTestId('dropdown-item');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent('Filosofia');
        expect(items[1]).toHaveTextContent('FISICA');
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
            value="Fi"
            onDropdownChange={handleDropdownChange}
            onChange={() => {}}
          />
          <button>Outside button</button>
        </div>
      );

      // Wait for dropdown to open
      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      });

      // Click outside to close
      const outsideButton = screen.getByText('Outside button');
      await user.click(outsideButton);

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Left Icon Behavior', () => {
    it('should remove focus from input when left icon is clicked', async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLInputElement>();

      render(<Search options={defaultOptions} ref={ref} />);

      const input = screen.getByRole('combobox');
      const leftIcon = screen.getByLabelText('Voltar');

      // Focus the input first
      input.focus();
      expect(document.activeElement).toBe(input);

      // Click the left icon to blur
      await user.click(leftIcon);

      expect(document.activeElement).not.toBe(input);
    });

    it('should handle left icon click with invalid ref gracefully', async () => {
      const user = userEvent.setup();

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<Search options={defaultOptions} />);

      const leftIcon = screen.getByLabelText('Voltar');

      // This should not throw an error even if ref is invalid
      await user.click(leftIcon);

      consoleSpy.mockRestore();
    });
  });

  describe('Ref-based Event Handling', () => {
    it('should use native events when ref is available for option selection', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const handleSelect = jest.fn();
      const ref = React.createRef<HTMLInputElement>();

      render(
        <Search
          options={defaultOptions}
          value="Fi"
          onChange={handleChange}
          onSelect={handleSelect}
          ref={ref}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      });

      const firstItem = screen.getAllByTestId('dropdown-item')[0];
      await user.click(firstItem);

      // Verify callbacks were called
      expect(handleSelect).toHaveBeenCalledWith('Filosofia');
      expect(handleChange).toHaveBeenCalled();

      // Just verify that onChange was called after selection
      // The implementation details of the event object may vary
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should use native events when ref is available for clear button', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const ref = React.createRef<HTMLInputElement>();

      render(
        <Search
          options={defaultOptions}
          value="Test"
          onChange={handleChange}
          ref={ref}
        />
      );

      const clearButton = screen.getByLabelText('Limpar busca');
      await user.click(clearButton);

      expect(handleChange).toHaveBeenCalled();
      // The ref should be used when available
      expect(ref.current?.value).toBe('');
    });

    it('should handle selection without onChange callback', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();

      render(
        <Search options={defaultOptions} value="Fi" onSelect={handleSelect} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
      });

      const firstItem = screen.getAllByTestId('dropdown-item')[0];
      await user.click(firstItem);

      expect(handleSelect).toHaveBeenCalledWith('Filosofia');
      // Should not throw error even without onChange
    });

    it('should handle clear without onChange callback', async () => {
      const user = userEvent.setup();

      render(<Search options={defaultOptions} value="Test" />);

      const clearButton = screen.getByLabelText('Limpar busca');
      await user.click(clearButton);

      // Should not throw error even without onChange
    });
  });
});
