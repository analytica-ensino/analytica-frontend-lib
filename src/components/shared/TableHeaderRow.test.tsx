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

  it('should lay out action, filters and search in that order', () => {
    const { row } = renderHeader();

    // Sem `order-*`: a ordem visual é a do DOM nos dois layouts, então leitura
    // e foco acompanham o que se vê.
    expect(row.textContent).toBe('Criar modeloFiltros');
    expect(row.children[2].querySelector('input')).toBeInTheDocument();
  });

  it('should drop the search to its own line below lg and inline it from lg up', () => {
    const { row } = renderHeader();

    // `lg:w-[488px]` mora no slot, não no campo: o `Search` do render prop vem em
    // `fullWidth`, então na linha própria ele ocupa 100% e de `lg` para cima é o
    // slot que devolve a largura fixa.
    expect(row.children[2]).toHaveClass(
      'basis-full',
      'lg:basis-auto',
      'lg:w-[488px]'
    );
    // A busca não carrega `order-*`: quem a desce é a quebra natural do
    // `flex-wrap`, já que ela ocupa a linha inteira.
    expect(row.children[2].className).not.toMatch(/(^|\s|:)order-/);
  });

  it('should keep action and filters at the row edges', () => {
    const { row, actionSlot } = renderHeader();

    expect(actionSlot.className).not.toMatch(/(^|\s|:)order-/);
    // `ml-auto` só entra a partir de lg: é ele que reagrupa filtro e busca à
    // direita quando tudo volta para uma linha. Abaixo disso quem separa ação e
    // filtro é o `justify-between`.
    expect(row.children[1]).toHaveClass('lg:ml-auto');
    expect(row.children[1].className).not.toMatch(/(^|\s)ml-auto/);
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
