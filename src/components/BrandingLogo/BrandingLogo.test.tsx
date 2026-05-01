import { render, screen } from '@testing-library/react';
import { BrandingLogo } from './BrandingLogo';

const mockBranding = {
  theme: null as string | null,
  favicon: null as string | null,
  icon: null as string | null,
  mainLogo: null as string | null,
  internalLogo: null as string | null,
  loginImage: null as string | null,
};

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ branding: mockBranding }),
}));

describe('BrandingLogo', () => {
  beforeEach(() => {
    mockBranding.mainLogo = null;
    mockBranding.internalLogo = null;
  });

  it('renders the internal branding logo by default', () => {
    mockBranding.internalLogo = 'https://cdn.example.com/internal.png';

    render(<BrandingLogo />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/internal.png');
    expect(img).toHaveAttribute('alt', 'Logo da Instituição');
  });

  it('renders the main branding logo when variant is "main"', () => {
    mockBranding.mainLogo = 'https://cdn.example.com/main.png';

    render(<BrandingLogo variant="main" />);

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/main.png'
    );
  });

  it('renders the consumer-provided fallback when no branding logo is configured', () => {
    render(<BrandingLogo fallback="/local.png" />);

    expect(screen.getByRole('img')).toHaveAttribute('src', '/local.png');
  });

  it('renders the bundled Analytica logo when neither branding nor fallback is available', () => {
    render(<BrandingLogo />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBeTruthy();
  });

  it('forwards alt and other img props', () => {
    mockBranding.internalLogo = 'https://cdn.example.com/internal.png';

    render(
      <BrandingLogo
        alt="Custom alt"
        className="h-10 object-contain"
        data-testid="brand"
      />
    );

    const img = screen.getByTestId('brand');
    expect(img).toHaveAttribute('alt', 'Custom alt');
    expect(img).toHaveClass('h-10', 'object-contain');
  });
});
