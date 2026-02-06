import { render, screen, fireEvent } from '@testing-library/react';
import RestrictedAccess from './RestrictedAccess';

describe('RestrictedAccess', () => {
  it('should render with default content', () => {
    render(<RestrictedAccess />);

    expect(screen.getByText('Área Restrita')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Este é um painel administrativo. Faça login para acessar o sistema.'
      )
    ).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    const customTitle = 'Custom Title';
    const customDescription = 'Custom description text';

    render(
      <RestrictedAccess title={customTitle} description={customDescription} />
    );

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('should render logo when logoSrc is provided', () => {
    const logoSrc = '/test-logo.png';
    const logoAlt = 'Test Logo';

    render(<RestrictedAccess logoSrc={logoSrc} logoAlt={logoAlt} />);

    const logo = screen.getByAltText(logoAlt);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', logoSrc);
  });

  it('should not render logo when logoSrc is not provided', () => {
    render(<RestrictedAccess />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render footer text when provided', () => {
    const footerText = 'Footer Text';

    render(<RestrictedAccess footerText={footerText} />);

    expect(screen.getByText(footerText)).toBeInTheDocument();
  });

  it('should not render footer text when not provided', () => {
    const { container } = render(<RestrictedAccess />);

    // The footer text element should not exist
    const footerElements = container.querySelectorAll('.text-primary-200');
    expect(footerElements.length).toBe(0);
  });

  it('should render button with custom text when onLoginClick is provided', () => {
    const mockOnClick = jest.fn();
    const customButtonText = 'Custom Login';

    render(
      <RestrictedAccess
        onLoginClick={mockOnClick}
        buttonText={customButtonText}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(customButtonText);
  });

  it('should render button with default text when buttonText is not provided', () => {
    const mockOnClick = jest.fn();

    render(<RestrictedAccess onLoginClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Fazer Login');
  });

  it('should call onLoginClick when button is clicked', () => {
    const mockOnClick = jest.fn();

    render(<RestrictedAccess onLoginClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should redirect to loginUrl when provided and button is clicked', () => {
    const loginUrl = 'https://example.com/login';
    const originalLocation = globalThis.location;

    // Mock globalThis.location
    const mockLocation = { href: '' };
    Object.defineProperty(globalThis, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    render(<RestrictedAccess loginUrl={loginUrl} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockLocation.href).toBe(loginUrl);

    // Restore original location
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('should prefer onLoginClick over loginUrl when both are provided', () => {
    const mockOnClick = jest.fn();
    const loginUrl = 'https://example.com/login';
    const originalLocation = globalThis.location;

    const mockLocation = { href: '' };
    Object.defineProperty(globalThis, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    render(<RestrictedAccess onLoginClick={mockOnClick} loginUrl={loginUrl} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockLocation.href).toBe(''); // Should not redirect

    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('should not render button when neither onLoginClick nor loginUrl is provided', () => {
    render(<RestrictedAccess />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(<RestrictedAccess className={customClass} />);

    expect(container.firstChild).toHaveClass(customClass);
  });

  it('should use default logoAlt when not provided', () => {
    const logoSrc = '/test-logo.png';

    render(<RestrictedAccess logoSrc={logoSrc} />);

    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });
});
