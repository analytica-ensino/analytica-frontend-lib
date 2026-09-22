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
 * o PageContainer ainda consome 32px de `px-4`. Numa linha só, abaixo de ~823px
 * o rótulo do botão quebra em duas linhas e a busca colapsa. Por isso, abaixo de
 * `lg` a busca ocupa a primeira linha inteira (`basis-full`) e o
 * `justify-between` joga ação e filtro para as pontas da segunda. De `lg` para
 * cima, `ml-auto` reagrupa filtro e busca à direita e tudo volta a uma linha.
 *
 * A ordem do DOM acompanha a visual do desktop — ação, filtro, busca. No
 * responsivo ela diverge da ordem visual de propósito: inverter resolveria o
 * mobile e criaria o mesmo descompasso no desktop, onde navegação por teclado é
 * mais comum.
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
    <div className="order-2 lg:order-1">{action}</div>
    {filters && <div className="order-3 lg:order-2 lg:ml-auto">{filters}</div>}
    {search && (
      <div className="order-1 basis-full lg:order-3 lg:basis-auto">
        {search}
      </div>
    )}
  </div>
);

export default TableHeaderRow;
