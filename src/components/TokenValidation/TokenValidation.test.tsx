import { render, screen } from '@testing-library/react';
import TokenValidation from './TokenValidation';

describe('TokenValidation', () => {
  it('should render with default content', () => {
    render(<TokenValidation />);

    expect(screen.getByText('Validando acesso...')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Por favor, aguarde enquanto verificamos suas credenciais.'
      )
    ).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    const customTitle = 'Custom Validation Title';
    const customDescription = 'Custom validation description';

    render(
      <TokenValidation title={customTitle} description={customDescription} />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('should render logo when logoSrc is provided', () => {
    const logoSrc = '/test-logo.png';
    const logoAlt = 'Test Logo';

    render(<TokenValidation logoSrc={logoSrc} logoAlt={logoAlt} />);

    const logo = screen.getByAltText(logoAlt);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', logoSrc);
  });

  it('should not render logo when logoSrc is not provided', () => {
    render(<TokenValidation />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should use default logoAlt when not provided', () => {
    const logoSrc = '/test-logo.png';

    render(<TokenValidation logoSrc={logoSrc} />);

    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(<TokenValidation className={customClass} />);

    expect(container.firstChild).toHaveClass(customClass);
  });

  it('should render spinning loader icon', () => {
    const { container } = render(<TokenValidation />);

    const spinningIcon = container.querySelector('.animate-spin');
    expect(spinningIcon).toBeInTheDocument();
  });

  it('should have proper background styling', () => {
    const { container } = render(<TokenValidation />);

    expect(container.firstChild).toHaveClass('bg-primary-800');
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('should render card container with proper styling', () => {
    const { container } = render(<TokenValidation />);

    const card = container.querySelector('.bg-background');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('shadow-lg');
  });
});
