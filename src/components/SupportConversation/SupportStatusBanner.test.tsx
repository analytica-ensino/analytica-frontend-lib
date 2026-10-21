import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupportStatusBanner from './SupportStatusBanner';
import { SUPPORT_STATUS_BANNER_VARIANT } from '../../types/supportConversation';

describe('SupportStatusBanner', () => {
  it('shows the title and the description', () => {
    render(
      <SupportStatusBanner
        variant={SUPPORT_STATUS_BANNER_VARIANT.WAITING}
        title="Aguardando resposta do backoffice"
        description="Na fila há 17 min · transferido pela IA"
      />
    );

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Aguardando resposta do backoffice');
    expect(banner).toHaveTextContent('Na fila há 17 min · transferido pela IA');
    expect(banner).toHaveAttribute('data-variant', 'waiting');
    expect(banner).toHaveClass('bg-warning-50');
  });

  it.each([
    [SUPPORT_STATUS_BANNER_VARIANT.AI, 'bg-primary-50'],
    [SUPPORT_STATUS_BANNER_VARIANT.DONE, 'bg-success-50'],
    [SUPPORT_STATUS_BANNER_VARIANT.INFO, 'bg-background-50'],
  ])('paints the %s variant', (variant, className) => {
    render(<SupportStatusBanner variant={variant} title="Aviso" />);

    expect(screen.getByRole('status')).toHaveClass(className);
  });

  it('defaults to the info variant without description or action', () => {
    render(<SupportStatusBanner title="Aviso" />);

    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'info');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('runs the action', () => {
    const onClick = jest.fn();
    render(
      <SupportStatusBanner
        variant={SUPPORT_STATUS_BANNER_VARIANT.AI}
        title="O assistente virtual está atendendo."
        action={{ label: 'Responder como humano', onClick }}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Responder como humano' })
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('accepts a custom icon', () => {
    render(
      <SupportStatusBanner
        title="Aviso"
        icon={<span data-testid="custom-icon" />}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
