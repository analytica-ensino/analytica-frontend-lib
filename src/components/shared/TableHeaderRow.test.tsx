import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { TableHeaderRow } from './TableHeaderRow';

/**
 * Renderiza o header e devolve a linha e cada slot já elevado ao elemento que
 * carrega as classes de posicionamento — o filho direto da linha.
 */
const renderHeader = (
  props: Partial<Parameters<typeof TableHeaderRow>[0]> = {}
) => {
  render(
    <TableHeaderRow
      action={<button>Criar modelo</button>}
      filters={<button>Filtros</button>}
      search={<input placeholder="Buscar" />}
      {...props}
    />
  );
  const actionSlot = screen.getByRole('button', { name: 'Criar modelo' })
    .parentElement as HTMLElement;
  return {
    row: actionSlot.parentElement as HTMLElement,
    actionSlot,
  };
};

describe('TableHeaderRow', () => {
  it('should render the three slots as direct children of the row', () => {
    const { row, actionSlot } = renderHeader();

    expect(row).toHaveClass('flex', 'flex-wrap', 'justify-between');
    expect(row.children).toHaveLength(3);
    expect(row.children[0]).toBe(actionSlot);
  });

  it('should keep the DOM order of the desktop layout: action, filters, search', () => {
    const { row } = renderHeader();

    // No responsivo quem reordena é a classe `order-*`, não o DOM — a ordem de
    // leitura e de foco continua a do desktop.
    expect(row.textContent).toBe('Criar modeloFiltros');
    expect(row.children[2].querySelector('input')).toBeInTheDocument();
  });

  it('should give the search its own line below lg and inline it from lg up', () => {
    const { row } = renderHeader();

    expect(row.children[2]).toHaveClass('order-1', 'basis-full');
    expect(row.children[2]).toHaveClass('lg:order-3', 'lg:basis-auto');
  });

  it('should push action and filters to the row edges below lg', () => {
    const { row, actionSlot } = renderHeader();

    expect(actionSlot).toHaveClass('order-2', 'lg:order-1');
    // `ml-auto` só entra a partir de lg: é ele que reagrupa filtro e busca à
    // direita quando tudo volta para uma linha.
    expect(row.children[1]).toHaveClass('order-3', 'lg:order-2', 'lg:ml-auto');
  });

  it('should render only the action when there is no search or filter', () => {
    const { row, actionSlot } = renderHeader({
      filters: undefined,
      search: undefined,
    });

    // Divs vazias ocupariam as pontas do `justify-between` e deslocariam a ação.
    expect(row.children).toHaveLength(1);
    expect(row.children[0]).toBe(actionSlot);
  });

  it('should render the search slot when there is no filter', () => {
    const { row } = renderHeader({ filters: undefined });

    expect(row.children).toHaveLength(2);
    expect(row.children[1]).toHaveClass('basis-full');
  });
});
