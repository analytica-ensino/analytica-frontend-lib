import type { ReactNode } from 'react';

/**
 * Props for TableHeaderRow
 */
export interface TableHeaderRowProps {
  /** Ação primária da tela — normalmente o botão de criar. */
  action: ReactNode;
  /** Botão de filtros, vindo do render prop do TableProvider. */
  filters?: ReactNode;
  /** Campo de busca, vindo do render prop do TableProvider. */
  search?: ReactNode;
}

/**
 * Linha de header das telas com tabela: ação primária à esquerda, filtro e
 * busca à direita.
 *
 * Os três juntos precisam de 791px (163 + 16 + 108 + 16 + 488), e abaixo de `lg`
 * o PageContainer ainda consome 16px de `px-4` de cada lado. Numa linha só,
 * abaixo de ~823px o rótulo do botão quebra em duas linhas e a busca colapsa.
 * Por isso a busca carrega `basis-full`: abaixo de `lg` ela desce sozinha para a
 * segunda linha, enquanto o `justify-between` mantém ação e filtro nas pontas da
 * primeira. De `lg` para cima, `basis-auto` a traz de volta e o `ml-auto`
 * reagrupa filtro e busca à direita, tudo numa linha.
 *
 * Os 488px moram aqui, no slot, não no campo: o `Search` do render prop vem em
 * `fullWidth`, então na linha própria ele ocupa 100% — da borda do botão de ação
 * até a borda do filtro, que é o que o design pede — e de `lg` para cima o
 * `lg:w-[488px]` do slot devolve a largura fixa.
 *
 * O reflow é só a quebra natural do `flex-wrap`, sem `order`: a ordem do DOM
 * bate com a ordem visual nos dois layouts, então leitura e foco acompanham o
 * que se vê.
 *
 * Os slots são condicionais porque uma tabela pode vir sem busca ou sem filtro;
 * divs vazias ocupariam as pontas do `justify-between` e deslocariam a ação.
 */
export const TableHeaderRow = ({
  action,
  filters,
  search,
}: TableHeaderRowProps) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>{action}</div>
    {filters && <div className="lg:ml-auto">{filters}</div>}
    {search && (
      <div className="basis-full lg:basis-auto lg:w-[488px]">{search}</div>
    )}
  </div>
);

export default TableHeaderRow;
