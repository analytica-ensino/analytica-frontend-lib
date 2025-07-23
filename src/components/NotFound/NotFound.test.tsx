import { render, screen, fireEvent } from '@testing-library/react';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('should render with default 404 content', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Oops! A página que você está procurando não existe ou foi removida.'
      )
    ).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    const customTitle = 'Custom Error Title';
    const customDescription = 'Custom error description';

    render(<NotFound title={customTitle} description={customDescription} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('should render 500 error type with default content', () => {
    render(<NotFound errorType="500" />);

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Erro interno do servidor')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Algo deu errado em nossos servidores. Tente novamente mais tarde.'
      )
    ).toBeInTheDocument();
  });

  it('should render custom error code', () => {
    render(<NotFound errorType="custom" customErrorCode="403" />);

    expect(screen.getByText('403')).toBeInTheDocument();
  });

  it('should render button with custom text when onButtonClick is provided', () => {
    const mockOnClick = jest.fn();
    const customButtonText = 'Custom Button';

    render(
      <NotFound onButtonClick={mockOnClick} buttonText={customButtonText} />
    );

    const button = screen.getByRole('button', { name: customButtonText });
    expect(button).toBeInTheDocument();
  });

  it('should call onButtonClick when button is clicked', () => {
    const mockOnClick = jest.fn();

    render(<NotFound onButtonClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Voltar' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should not render button when onButtonClick is not provided', () => {
    render(<NotFound />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(<NotFound className={customClass} />);

    expect(container.firstChild).toHaveClass(customClass);
  });

  it('should render with default button text when buttonText is not provided', () => {
    const mockOnClick = jest.fn();

    render(<NotFound onButtonClick={mockOnClick} />);

    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });

  it('should handle custom error type without customErrorCode', () => {
    render(<NotFound errorType="custom" />);

    expect(screen.getByText('custom')).toBeInTheDocument();
    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado.')).toBeInTheDocument();
  });

  it('should override default content with custom props', () => {
    const customTitle = 'Override Title';
    const customDescription = 'Override Description';

    render(
      <NotFound
        errorType="500"
        title={customTitle}
        description={customDescription}
      />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
    expect(
      screen.queryByText('Erro interno do servidor')
    ).not.toBeInTheDocument();
  });

  it('should prevent default behavior on button click', () => {
    const mockOnClick = jest.fn();
    const preventDefault = jest.fn();

    render(<NotFound onButtonClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: 'Voltar' });

    fireEvent.click(button, { preventDefault });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
