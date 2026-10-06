import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb (RecommendedLessonDetails)', () => {
  const items = [
    { label: 'Início', path: '/' },
    { label: 'Aulas recomendadas', path: '/aulas-recomendadas' },
    { label: 'Detalhes', path: '/detalhes' },
  ];

  it('renderiza uma trilha nomeada em lista ordenada', () => {
    render(<Breadcrumb items={items} />);

    const nav = screen.getByRole('navigation', {
      name: 'Trilha de navegação',
    });
    const list = within(nav).getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('marca o último item como página atual, sem ser uma ação', () => {
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Detalhes')).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      screen.queryByRole('button', { name: 'Detalhes' })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('esconde os separadores da árvore de acessibilidade', () => {
    const { container } = render(<Breadcrumb items={items} />);

    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(2);
    icons.forEach((icon) =>
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    );
  });

  it('chama onItemClick com o caminho do item anterior', () => {
    const onItemClick = jest.fn();
    render(<Breadcrumb items={items} onItemClick={onItemClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Aulas recomendadas' }));

    expect(onItemClick).toHaveBeenCalledWith('/aulas-recomendadas');
  });

  it('não quebra sem onItemClick e renderiza item sem caminho como texto', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Sem link' }, { label: 'Com link', path: '/x' }]}
      />
    );

    expect(screen.getByText('Sem link')).not.toHaveAttribute('aria-current');
    expect(
      screen.queryByRole('button', { name: 'Sem link' })
    ).not.toBeInTheDocument();
  });

  it('não quebra ao clicar sem onItemClick', () => {
    render(<Breadcrumb items={items} />);

    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Início' }))
    ).not.toThrow();
  });
});
