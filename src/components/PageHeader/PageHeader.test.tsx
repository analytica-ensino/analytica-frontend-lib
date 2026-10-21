import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageHeader from './PageHeader';

describe('PageHeader', () => {
  it('renders the title as the page h1, lg and bold', () => {
    render(<PageHeader title="Simulados" />);

    const title = screen.getByRole('heading', { level: 1, name: 'Simulados' });
    expect(title).toHaveClass('text-lg', 'font-bold', 'text-text-950');
  });

  it('aligns the title by the base of a 64px row, 16px above the content', () => {
    render(<PageHeader title="Guia Enem" />);

    const row = screen.getByRole('heading', { level: 1 }).parentElement;
    expect(row).toHaveClass('min-h-16', 'mb-4', 'items-center', 'flex-row');
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(
      'sm:self-end',
      'sm:mt-0',
      'mt-4'
    );
  });

  it('renders what sits beside the title', () => {
    render(
      <PageHeader title="Desempenho">
        <button type="button">Visualização</button>
      </PageHeader>
    );

    expect(
      screen.getByRole('button', { name: 'Visualização' })
    ).toBeInTheDocument();
  });

  it('merges extra classes into the row', () => {
    render(<PageHeader title="Aulas" className="flex-wrap" />);

    expect(screen.getByRole('heading', { level: 1 }).parentElement).toHaveClass(
      'flex-wrap',
      'min-h-16'
    );
  });
});
