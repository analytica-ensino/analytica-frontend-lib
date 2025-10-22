import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableCaption,
  useTableSort,
} from './Table';

describe('Table Components', () => {
  describe('Table', () => {
    it('renders with correct wrapper classes (default variant)', () => {
      render(<Table data-testid="table" />);
      const tableWrapper = screen.getByTestId('table').parentElement;
      expect(tableWrapper).toHaveClass('border');
      expect(tableWrapper).toHaveClass('border-border-200');
      expect(tableWrapper).toHaveClass('rounded-xl');
      expect(tableWrapper).toHaveClass('relative');
      expect(tableWrapper).toHaveClass('w-full');
      expect(tableWrapper).toHaveClass('overflow-x-auto');
    });

    it('renders borderless variant without border', () => {
      render(<Table variant="borderless" data-testid="table" />);
      const tableWrapper = screen.getByTestId('table').parentElement;
      expect(tableWrapper).not.toHaveClass('border');
      expect(tableWrapper).not.toHaveClass('rounded-xl');
      expect(tableWrapper).toHaveClass('relative');
      expect(tableWrapper).toHaveClass('w-full');
      expect(tableWrapper).toHaveClass('overflow-x-auto');
    });

    it('passes through className prop', () => {
      render(<Table className="custom-class" data-testid="table" />);
      expect(screen.getByTestId('table')).toHaveClass('custom-class');
      expect(screen.getByTestId('table')).toHaveClass('w-full');
      expect(screen.getByTestId('table')).toHaveClass('caption-bottom');
      expect(screen.getByTestId('table')).toHaveClass('text-sm');
    });
  });

  describe('TableHeader', () => {
    it('removes border from first row', () => {
      render(
        <Table>
          <TableHeader data-testid="header">
            <TableRow>
              <TableHead>Test</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByTestId('header')).toHaveClass(
        '[&_tr:first-child]:border-0'
      );
    });
  });

  describe('TableBody', () => {
    it('has correct border styling for last row', () => {
      render(
        <Table>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('body')).toHaveClass(
        '[&_tr:last-child]:border-border-200'
      );
    });
  });

  describe('TableRow', () => {
    it('has default state styling', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('row')).toHaveClass('border');
      expect(screen.getByTestId('row')).toHaveClass('border-border-200');
      expect(screen.getByTestId('row')).toHaveClass('hover:bg-muted/50');
      expect(screen.getByTestId('row')).toHaveClass('transition-colors');
    });

    it('has selected state styling', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row" state="selected">
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('row')).toHaveClass('border-b-2');
      expect(screen.getByTestId('row')).toHaveClass('border-indicator-primary');
    });

    it('has invalid state styling', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row" state="invalid">
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('row')).toHaveClass('border-b-2');
      expect(screen.getByTestId('row')).toHaveClass('border-indicator-error');
    });

    it('has disabled state styling', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row" state="disabled">
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('row')).toHaveClass('border-b');
      expect(screen.getByTestId('row')).toHaveClass('border-border-100');
      expect(screen.getByTestId('row')).toHaveClass('bg-background-50');
      expect(screen.getByTestId('row')).toHaveClass('opacity-50');
      expect(screen.getByTestId('row')).toHaveClass('cursor-not-allowed');
      expect(screen.getByTestId('row')).not.toHaveClass('hover:bg-muted/50');
      expect(screen.getByTestId('row')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('has clickable styling when clickable prop is true', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row" clickable>
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('row')).toHaveClass('cursor-pointer');
    });

    it('calls onClick when clickable row is clicked', () => {
      const handleClick = jest.fn();
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row" clickable onClick={handleClick}>
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      fireEvent.click(screen.getByTestId('row'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not have cursor pointer when disabled', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row" clickable state="disabled">
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('row')).not.toHaveClass('cursor-pointer');
    });
  });

  describe('TableHead', () => {
    it('has correct styling', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Test</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByTestId('head')).toHaveClass('h-10');
      expect(screen.getByTestId('head')).toHaveClass('px-6');
      expect(screen.getByTestId('head')).toHaveClass('py-3.5');
      expect(screen.getByTestId('head')).toHaveClass('text-left');
      expect(screen.getByTestId('head')).toHaveClass('align-middle');
      expect(screen.getByTestId('head')).toHaveClass('font-bold');
      expect(screen.getByTestId('head')).toHaveClass('text-base');
      expect(screen.getByTestId('head')).toHaveClass('text-text-800');
      expect(screen.getByTestId('head')).toHaveClass('tracking-[0.2px]');
      expect(screen.getByTestId('head')).toHaveClass('leading-none');
      expect(screen.getByTestId('head')).toHaveClass('whitespace-nowrap');
    });

    it('is sortable by default', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Name</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByTestId('head')).toHaveClass('cursor-pointer');
      expect(screen.getByTestId('head')).toHaveClass('select-none');
    });

    it('can be non-sortable', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head" sortable={false}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByTestId('head')).not.toHaveClass('cursor-pointer');
    });

    it('calls onSort when clicked and sortable', () => {
      const handleSort = jest.fn();
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head" onSort={handleSort}>
                Name
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      fireEvent.click(screen.getByTestId('head'));
      expect(handleSort).toHaveBeenCalledTimes(1);
    });

    it('does not call onSort when non-sortable', () => {
      const handleSort = jest.fn();
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head" sortable={false} onSort={handleSort}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      fireEvent.click(screen.getByTestId('head'));
      expect(handleSort).not.toHaveBeenCalled();
    });

    it('shows ascending icon when sortDirection is asc', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head" sortDirection="asc">
                Name
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByTestId('head')).toBeInTheDocument();
    });

    it('shows descending icon when sortDirection is desc', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head" sortDirection="desc">
                Name
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByTestId('head')).toBeInTheDocument();
    });
  });

  describe('TableCell', () => {
    it('has correct padding and text styling', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('cell')).toHaveClass('p-2');
      expect(screen.getByTestId('cell')).toHaveClass('px-6');
      expect(screen.getByTestId('cell')).toHaveClass('py-3.5');
      expect(screen.getByTestId('cell')).toHaveClass('align-middle');
      expect(screen.getByTestId('cell')).toHaveClass('text-base');
      expect(screen.getByTestId('cell')).toHaveClass('font-normal');
      expect(screen.getByTestId('cell')).toHaveClass('text-text-800');
      expect(screen.getByTestId('cell')).toHaveClass('leading-[150%]');
      expect(screen.getByTestId('cell')).toHaveClass('tracking-normal');
      expect(screen.getByTestId('cell')).toHaveClass('whitespace-nowrap');
    });
  });

  describe('TableFooter', () => {
    it('has correct styling', () => {
      render(
        <Table>
          <TableFooter data-testid="footer">
            <TableRow>
              <TableCell>Test</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      expect(screen.getByTestId('footer')).toHaveClass('border-t');
      expect(screen.getByTestId('footer')).toHaveClass('bg-background-50');
      expect(screen.getByTestId('footer')).toHaveClass('border-border-200');
      expect(screen.getByTestId('footer')).toHaveClass('font-medium');
      expect(screen.getByTestId('footer')).toHaveClass('px-6');
      expect(screen.getByTestId('footer')).toHaveClass('py-3.5');
      expect(screen.getByTestId('footer')).toHaveClass(
        '[&>tr]:last:border-b-0'
      );
    });
  });

  describe('TableCaption', () => {
    it('has correct styling', () => {
      render(
        <Table>
          <TableCaption data-testid="caption">Test</TableCaption>
        </Table>
      );
      expect(screen.getByTestId('caption')).toHaveClass('border-t');
      expect(screen.getByTestId('caption')).toHaveClass('text-text-800');
      expect(screen.getByTestId('caption')).toHaveClass('text-sm');
      expect(screen.getByTestId('caption')).toHaveClass('px-6');
      expect(screen.getByTestId('caption')).toHaveClass('py-3.5');
    });
  });

  describe('Integration', () => {
    it('renders complete table structure correctly', () => {
      render(
        <Table data-testid="table">
          <TableCaption>Test Caption</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
            <TableRow state="selected">
              <TableCell>Selected Row</TableCell>
            </TableRow>
            <TableRow state="invalid">
              <TableCell>Invalid Row</TableCell>
            </TableRow>
            <TableRow state="disabled">
              <TableCell>Disabled Row</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByTestId('table')).toBeInTheDocument();
      expect(screen.getByText('Test Caption')).toBeInTheDocument();
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Selected Row')).toBeInTheDocument();
      expect(screen.getByText('Invalid Row')).toBeInTheDocument();
      expect(screen.getByText('Disabled Row')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('useTableSort hook', () => {
    const testData = [
      { id: 1, name: 'Charlie', age: 30, city: 'New York' },
      { id: 2, name: 'Alice', age: 25, city: 'Los Angeles' },
      { id: 3, name: 'Bob', age: 35, city: 'Chicago' },
    ];

    it('returns original data when no sort is applied', () => {
      const { result } = renderHook(() => useTableSort(testData));
      expect(result.current.sortedData).toEqual(testData);
      expect(result.current.sortColumn).toBeNull();
      expect(result.current.sortDirection).toBeNull();
    });

    it('sorts data in ascending order when handleSort is called', () => {
      const { result } = renderHook(() => useTableSort(testData));

      act(() => {
        result.current.handleSort('name');
      });

      expect(result.current.sortColumn).toBe('name');
      expect(result.current.sortDirection).toBe('asc');
      expect(result.current.sortedData[0].name).toBe('Alice');
      expect(result.current.sortedData[1].name).toBe('Bob');
      expect(result.current.sortedData[2].name).toBe('Charlie');
    });

    it('sorts data in descending order when handleSort is called twice', () => {
      const { result } = renderHook(() => useTableSort(testData));

      act(() => {
        result.current.handleSort('name');
      });

      act(() => {
        result.current.handleSort('name');
      });

      expect(result.current.sortColumn).toBe('name');
      expect(result.current.sortDirection).toBe('desc');
      expect(result.current.sortedData[0].name).toBe('Charlie');
      expect(result.current.sortedData[1].name).toBe('Bob');
      expect(result.current.sortedData[2].name).toBe('Alice');
    });

    it('clears sort when handleSort is called three times', () => {
      const { result } = renderHook(() => useTableSort(testData));

      act(() => {
        result.current.handleSort('name');
      });

      act(() => {
        result.current.handleSort('name');
      });

      act(() => {
        result.current.handleSort('name');
      });

      expect(result.current.sortColumn).toBeNull();
      expect(result.current.sortDirection).toBeNull();
      expect(result.current.sortedData).toEqual(testData);
    });

    it('sorts numeric data correctly', () => {
      const { result } = renderHook(() => useTableSort(testData));

      act(() => {
        result.current.handleSort('age');
      });

      expect(result.current.sortedData[0].age).toBe(25);
      expect(result.current.sortedData[1].age).toBe(30);
      expect(result.current.sortedData[2].age).toBe(35);
    });

    it('switches to new column when different column is sorted', () => {
      const { result } = renderHook(() => useTableSort(testData));

      act(() => {
        result.current.handleSort('name');
      });

      expect(result.current.sortColumn).toBe('name');

      act(() => {
        result.current.handleSort('age');
      });

      expect(result.current.sortColumn).toBe('age');
      expect(result.current.sortDirection).toBe('asc');
      expect(result.current.sortedData[0].age).toBe(25);
    });

    it('handles non-string and non-number values gracefully', () => {
      const dataWithMixedTypes = [
        { id: 1, value: true, name: 'A' },
        { id: 2, value: null, name: 'B' },
        { id: 3, value: undefined, name: 'C' },
      ];

      const { result } = renderHook(() => useTableSort(dataWithMixedTypes));

      act(() => {
        result.current.handleSort('value');
      });

      // Should not crash and maintain order (return 0 for unsupported types)
      expect(result.current.sortedData).toHaveLength(3);
      expect(result.current.sortColumn).toBe('value');
      expect(result.current.sortDirection).toBe('asc');
    });

    describe('URL synchronization', () => {
      beforeEach(() => {
        // Mock window.location and history
        delete (window as { location?: Location }).location;
        window.location = {
          href: 'http://localhost:3000/',
          search: '',
        } as Location;

        window.history.replaceState = jest.fn();
      });

      it('does not read URL params when syncWithUrl is false', () => {
        window.location.search = '?sortBy=name&sort=ASC';
        const { result } = renderHook(() => useTableSort(testData));

        expect(result.current.sortColumn).toBeNull();
        expect(result.current.sortDirection).toBeNull();
      });

      it('reads URL params on initialization when syncWithUrl is true', () => {
        window.location.search = '?sortBy=name&sort=ASC';
        const { result } = renderHook(() =>
          useTableSort(testData, { syncWithUrl: true })
        );

        expect(result.current.sortColumn).toBe('name');
        expect(result.current.sortDirection).toBe('asc');
        expect(result.current.sortedData[0].name).toBe('Alice');
      });

      it('reads DESC sort direction from URL', () => {
        window.location.search = '?sortBy=age&sort=DESC';
        const { result } = renderHook(() =>
          useTableSort(testData, { syncWithUrl: true })
        );

        expect(result.current.sortColumn).toBe('age');
        expect(result.current.sortDirection).toBe('desc');
        expect(result.current.sortedData[0].age).toBe(35);
      });

      it('ignores invalid sort direction in URL', () => {
        window.location.search = '?sortBy=name&sort=INVALID';
        const { result } = renderHook(() =>
          useTableSort(testData, { syncWithUrl: true })
        );

        expect(result.current.sortColumn).toBeNull();
        expect(result.current.sortDirection).toBeNull();
      });

      it('updates URL when sort changes', () => {
        const { result } = renderHook(() =>
          useTableSort(testData, { syncWithUrl: true })
        );

        act(() => {
          result.current.handleSort('name');
        });

        // Wait for useEffect to run
        expect(window.history.replaceState).toHaveBeenCalled();
        const calls = (window.history.replaceState as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        const url = lastCall[2];
        expect(url).toContain('sortBy=name');
        expect(url).toContain('sort=ASC');
      });

      it('updates URL to DESC on second click', () => {
        const { result } = renderHook(() =>
          useTableSort(testData, { syncWithUrl: true })
        );

        act(() => {
          result.current.handleSort('name');
        });

        act(() => {
          result.current.handleSort('name');
        });

        const calls = (window.history.replaceState as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        const url = lastCall[2];
        expect(url).toContain('sortBy=name');
        expect(url).toContain('sort=DESC');
      });

      it('removes URL params when sort is cleared', () => {
        const { result } = renderHook(() =>
          useTableSort(testData, { syncWithUrl: true })
        );

        // First click: ASC
        act(() => {
          result.current.handleSort('name');
        });

        // Second click: DESC
        act(() => {
          result.current.handleSort('name');
        });

        // Third click: clear sort
        act(() => {
          result.current.handleSort('name');
        });

        const calls = (window.history.replaceState as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        const url = lastCall[2];
        expect(url).not.toContain('sortBy=');
        expect(url).not.toContain('sort=');
      });

      it('preserves other URL params when updating sort params', () => {
        // Create a proper URL object with query params
        const testUrl = new URL('http://localhost:3000/?page=2&filter=active');
        window.location = testUrl as unknown as Location;

        const { result } = renderHook(() =>
          useTableSort(testData, { syncWithUrl: true })
        );

        act(() => {
          result.current.handleSort('name');
        });

        const calls = (window.history.replaceState as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        const url = lastCall[2];
        expect(url).toContain('page=2');
        expect(url).toContain('filter=active');
        expect(url).toContain('sortBy=name');
        expect(url).toContain('sort=ASC');
      });

      it('does not update URL when syncWithUrl is false', () => {
        const { result } = renderHook(() => useTableSort(testData));

        act(() => {
          result.current.handleSort('name');
        });

        expect(window.history.replaceState).not.toHaveBeenCalled();
      });
    });
  });
});
