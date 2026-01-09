import React from 'react';
import { render, screen } from '@testing-library/react';
import { SendModalError } from '../components/SendModalError';

describe('SendModalError', () => {
  it('should render nothing when error is undefined', () => {
    const { container } = render(<SendModalError />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when error is empty string', () => {
    const { container } = render(<SendModalError error="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render error message when error is provided', () => {
    render(<SendModalError error="Este é um erro de teste" />);
    expect(screen.getByText('Este é um erro de teste')).toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<SendModalError error="Erro" />);
    const errorElement = screen.getByText('Erro').closest('p');
    expect(errorElement).toHaveClass('flex', 'items-center', 'gap-1', 'mt-1');
  });

  it('should render with testId when provided', () => {
    render(<SendModalError error="Erro" testId="custom-error-id" />);
    expect(screen.getByTestId('custom-error-id')).toBeInTheDocument();
  });

  it('should render warning icon', () => {
    render(<SendModalError error="Erro com ícone" />);
    // The WarningCircleIcon from phosphor-react renders as an SVG
    const errorElement = screen.getByText('Erro com ícone').closest('p');
    expect(errorElement?.querySelector('svg')).toBeInTheDocument();
  });
});
