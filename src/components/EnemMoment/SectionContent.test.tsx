import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SectionContent } from './SectionContent';

const renderSection = (loading: boolean, error: string | null) =>
  render(
    <SectionContent loading={loading} error={error} minHeight="min-h-[320px]">
      <p>Conteúdo da seção</p>
    </SectionContent>
  );

describe('SectionContent', () => {
  it('shows its content once loaded', () => {
    renderSection(false, null);

    expect(screen.getByText('Conteúdo da seção')).toBeInTheDocument();
  });

  it('holds the section’s height with a skeleton while it loads', () => {
    const { container } = renderSection(true, null);

    expect(screen.queryByText('Conteúdo da seção')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('min-h-[320px]');
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('prefers the skeleton to an error while a new request runs', () => {
    renderSection(true, 'Erro ao carregar.');

    expect(screen.queryByText('Erro ao carregar.')).not.toBeInTheDocument();
  });

  it('shows the message in a card of the same height when it fails', () => {
    renderSection(false, 'Erro ao carregar.');

    const message = screen.getByText('Erro ao carregar.');
    expect(message).toHaveClass('text-text-500');
    expect(message.parentElement).toHaveClass(
      'min-h-[320px]',
      'rounded-xl',
      'border-border-50'
    );
    expect(screen.queryByText('Conteúdo da seção')).not.toBeInTheDocument();
  });
});
