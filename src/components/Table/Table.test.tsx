import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Table from './Table';
import {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableCaption,
} from './Table';

describe('Table Components', () => {
  describe('Table', () => {
    it('renders with correct wrapper classes', () => {
      render(<Table data-testid="table" />);
      const tableWrapper = screen.getByTestId('table').parentElement;
      expect(tableWrapper).toHaveClass('border');
      expect(tableWrapper).toHaveClass('border-border-200');
      expect(tableWrapper).toHaveClass('rounded-xl');
      expect(tableWrapper).toHaveClass('relative');
      expect(tableWrapper).toHaveClass('w-full');
      expect(tableWrapper).toHaveClass('overflow-hidden');
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
    it('has top border and removes border from last row', () => {
      render(
        <Table>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell>Test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('body')).toHaveClass('border-t');
      expect(screen.getByTestId('body')).toHaveClass('border-border-200');
      expect(screen.getByTestId('body')).toHaveClass(
        '[&_tr:last-child]:border-0'
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
      expect(screen.getByTestId('row')).toHaveClass('border-b');
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
      expect(screen.getByTestId('head')).toHaveClass('bg-bg-secondary');
      expect(screen.getByTestId('head')).toHaveClass('bg-muted/50');
      expect(screen.getByTestId('head')).toHaveClass('text-left');
      expect(screen.getByTestId('head')).toHaveClass('align-middle');
      expect(screen.getByTestId('head')).toHaveClass('font-bold');
      expect(screen.getByTestId('head')).toHaveClass('text-text-800');
      expect(screen.getByTestId('head')).toHaveClass(
        '[&:has([role=checkbox])]:pr-0'
      );
      expect(screen.getByTestId('head')).toHaveClass(
        '[&>[role=checkbox]]:translate-y-[2px]'
      );
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
      expect(screen.getByTestId('cell')).toHaveClass('text-md');
      expect(screen.getByTestId('cell')).toHaveClass('text-text-800');
      expect(screen.getByTestId('cell')).toHaveClass(
        '[&:has([role=checkbox])]:pr-0'
      );
      expect(screen.getByTestId('cell')).toHaveClass(
        '[&>[role=checkbox]]:translate-y-[2px]'
      );
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
});
