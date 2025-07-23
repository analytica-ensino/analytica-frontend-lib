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

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(customButtonText);
  });

  it('should call onButtonClick when button is clicked', () => {
    const mockOnClick = jest.fn();

    render(<NotFound onButtonClick={mockOnClick} />);

    const button = screen.getByRole('button');
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

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Voltar');
  });

  it('should handle custom error type without customErrorCode', () => {
    render(<NotFound errorType="custom" />);

    expect(screen.getByText('ERROR')).toBeInTheDocument();
    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado.')).toBeInTheDocument();
  });

  it('should handle custom error type with empty customErrorCode', () => {
    render(<NotFound errorType="custom" customErrorCode="" />);

    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  it('should handle custom error type with whitespace-only customErrorCode', () => {
    render(<NotFound errorType="custom" customErrorCode="   " />);

    expect(screen.getByText('ERROR')).toBeInTheDocument();
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

    const button = screen.getByRole('button');

    fireEvent.click(button, { preventDefault });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<NotFound onButtonClick={() => {}} />);

    // Check main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute(
      'aria-labelledby',
      'error-title'
    );
    expect(screen.getByRole('main')).toHaveAttribute(
      'aria-describedby',
      'error-description'
    );

    // Check heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute(
      'id',
      'error-title'
    );

    // Check error description
    expect(
      screen.getByText(
        'Oops! A página que você está procurando não existe ou foi removida.'
      )
    ).toHaveAttribute('id', 'error-description');

    // Check navigation
    expect(
      screen.getByRole('navigation', { name: 'Navegação de erro' })
    ).toBeInTheDocument();

    // Check button accessibility
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'error-description');
    expect(button).toHaveAttribute('aria-label');
  });

  it('should have accessible error code display', () => {
    render(<NotFound errorType="404" />);

    const errorCodeElement = screen.getByLabelText('Código de erro: 404');
    expect(errorCodeElement).toBeInTheDocument();
    expect(errorCodeElement).toHaveAttribute('role', 'img');
  });

  it('should have proper section labeling for custom error', () => {
    render(<NotFound errorType="custom" customErrorCode="403" />);

    expect(screen.getByLabelText('Erro 403')).toBeInTheDocument();
  });

  it('should maintain accessibility without button', () => {
    render(<NotFound />);

    // Main landmark should still be present
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Heading should still be accessible
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // Navigation should not be present when no button
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
