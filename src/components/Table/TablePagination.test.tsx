import '@testing-library/jest-dom';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TablePagination from './TablePagination';

describe('TablePagination', () => {
  const defaultProps = {
    totalItems: 100,
    currentPage: 5,
    totalPages: 10,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<TablePagination {...defaultProps} />);

      expect(screen.getByText(/41 de 100 itens/)).toBeInTheDocument();
      expect(screen.getByText(/Página 5 de 10/)).toBeInTheDocument();
      expect(screen.getByLabelText('Página anterior')).toBeInTheDocument();
      expect(screen.getByLabelText('Próxima página')).toBeInTheDocument();
    });

    it('should render with all optional props', () => {
      const onItemsPerPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          itemsPerPageOptions={[5, 10, 20]}
          onItemsPerPageChange={onItemsPerPageChange}
          itemLabel="escolas"
          className="custom-class"
        />
      );

      expect(screen.getByText(/41 de 100 escolas/)).toBeInTheDocument();
      expect(screen.getByLabelText('Items por página')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <TablePagination {...defaultProps} className="custom-class" />
      );

      const paginationDiv = container.firstChild as HTMLElement;
      expect(paginationDiv).toHaveClass('custom-class');
    });
  });

  describe('Items count text', () => {
    it('should display correct start item for first page', () => {
      render(<TablePagination {...defaultProps} currentPage={1} />);

      expect(screen.getByText(/1 de 100 itens/)).toBeInTheDocument();
    });

    it('should display correct start item for middle page', () => {
      render(<TablePagination {...defaultProps} currentPage={5} />);

      expect(screen.getByText(/41 de 100 itens/)).toBeInTheDocument();
    });

    it('should display correct start item for last page', () => {
      render(<TablePagination {...defaultProps} currentPage={10} />);

      expect(screen.getByText(/91 de 100 itens/)).toBeInTheDocument();
    });

    it('should use default itemLabel when not provided', () => {
      render(<TablePagination {...defaultProps} />);

      expect(screen.getByText(/itens/)).toBeInTheDocument();
    });

    it('should use custom itemLabel', () => {
      render(<TablePagination {...defaultProps} itemLabel="alunos" />);

      expect(screen.getByText(/alunos/)).toBeInTheDocument();
    });
  });

  describe('Page info text', () => {
    it('should display correct page number on first page', () => {
      render(<TablePagination {...defaultProps} currentPage={1} />);

      expect(screen.getByText('Página 1 de 10')).toBeInTheDocument();
    });

    it('should display correct page number on middle page', () => {
      render(<TablePagination {...defaultProps} currentPage={5} />);

      expect(screen.getByText('Página 5 de 10')).toBeInTheDocument();
    });

    it('should display correct page number on last page', () => {
      render(<TablePagination {...defaultProps} currentPage={10} />);

      expect(screen.getByText('Página 10 de 10')).toBeInTheDocument();
    });
  });

  describe('Previous button', () => {
    it('should be disabled on first page', () => {
      render(<TablePagination {...defaultProps} currentPage={1} />);

      const previousButton = screen.getByLabelText('Página anterior');
      expect(previousButton).toBeDisabled();
      expect(previousButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should be enabled on middle page', () => {
      render(<TablePagination {...defaultProps} currentPage={5} />);

      const previousButton = screen.getByLabelText('Página anterior');
      expect(previousButton).not.toBeDisabled();
      expect(previousButton).not.toHaveClass('opacity-50');
    });

    it('should call onPageChange with currentPage - 1 when clicked', () => {
      const onPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          currentPage={5}
          onPageChange={onPageChange}
        />
      );

      const previousButton = screen.getByLabelText('Página anterior');
      fireEvent.click(previousButton);

      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should not call onPageChange when disabled and clicked', () => {
      const onPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          currentPage={1}
          onPageChange={onPageChange}
        />
      );

      const previousButton = screen.getByLabelText('Página anterior');
      fireEvent.click(previousButton);

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Next button', () => {
    it('should be disabled on last page', () => {
      render(<TablePagination {...defaultProps} currentPage={10} />);

      const nextButton = screen.getByLabelText('Próxima página');
      expect(nextButton).toBeDisabled();
      expect(nextButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should be enabled on middle page', () => {
      render(<TablePagination {...defaultProps} currentPage={5} />);

      const nextButton = screen.getByLabelText('Próxima página');
      expect(nextButton).not.toBeDisabled();
      expect(nextButton).not.toHaveClass('opacity-50');
    });

    it('should call onPageChange with currentPage + 1 when clicked', () => {
      const onPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          currentPage={5}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByLabelText('Próxima página');
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(6);
    });

    it('should not call onPageChange when disabled and clicked', () => {
      const onPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          currentPage={10}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByLabelText('Próxima página');
      fireEvent.click(nextButton);

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Items per page selector', () => {
    it('should not render when onItemsPerPageChange is not provided', () => {
      render(<TablePagination {...defaultProps} />);

      expect(
        screen.queryByLabelText('Items por página')
      ).not.toBeInTheDocument();
    });

    it('should render when onItemsPerPageChange is provided', () => {
      const onItemsPerPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      );

      expect(screen.getByLabelText('Items por página')).toBeInTheDocument();
    });

    it('should render with default options', () => {
      const onItemsPerPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      );

      const select = screen.getByLabelText('Items por página');
      const options = within(select).getAllByRole('option');
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent('10 itens');
      expect(options[1]).toHaveTextContent('20 itens');
      expect(options[2]).toHaveTextContent('50 itens');
      expect(options[3]).toHaveTextContent('100 itens');
    });

    it('should render with custom options', () => {
      const onItemsPerPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          itemsPerPageOptions={[5, 15, 25]}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      );

      const select = screen.getByLabelText('Items por página');
      const options = within(select).getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('5 itens');
      expect(options[1]).toHaveTextContent('15 itens');
      expect(options[2]).toHaveTextContent('25 itens');
    });

    it('should display current itemsPerPage value', () => {
      const onItemsPerPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          itemsPerPage={20}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      );

      const select = screen.getByLabelText('Items por página');
      expect(select).toHaveValue('20');
    });

    it('should call onItemsPerPageChange when changed', () => {
      const onItemsPerPageChange = jest.fn();
      render(
        <TablePagination
          {...defaultProps}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      );

      const select = screen.getByLabelText('Items por página');
      fireEvent.change(select, { target: { value: '50' } });

      expect(onItemsPerPageChange).toHaveBeenCalledTimes(1);
      expect(onItemsPerPageChange).toHaveBeenCalledWith(50);
    });
  });

  describe('Edge cases', () => {
    it('should handle single page correctly', () => {
      render(
        <TablePagination
          {...defaultProps}
          currentPage={1}
          totalPages={1}
          totalItems={5}
        />
      );

      expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Página anterior')).toBeDisabled();
      expect(screen.getByLabelText('Próxima página')).toBeDisabled();
    });

    it('should handle large numbers correctly', () => {
      render(
        <TablePagination
          {...defaultProps}
          totalItems={10000}
          currentPage={100}
          totalPages={1000}
        />
      );

      expect(screen.getByText(/991 de 10000 itens/)).toBeInTheDocument();
      expect(screen.getByText('Página 100 de 1000')).toBeInTheDocument();
    });

    it('should pass through additional HTML attributes', () => {
      const { container } = render(
        <TablePagination
          {...defaultProps}
          data-testid="pagination"
          aria-label="Table pagination"
        />
      );

      const paginationDiv = container.firstChild as HTMLElement;
      expect(paginationDiv).toHaveAttribute('data-testid', 'pagination');
      expect(paginationDiv).toHaveAttribute('aria-label', 'Table pagination');
    });
  });
});
