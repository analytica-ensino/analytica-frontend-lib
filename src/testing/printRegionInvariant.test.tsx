import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { expectPrintRegionControlsHidden } from './printRegionInvariant';

/**
 * Testes do próprio invariante.
 *
 * Existem porque `expectPrintRegionControlsHidden` é o que sustenta a asserção
 * de impressão dos SEIS modais de detalhe: um helper de teste frouxo daria seis
 * testes verdes sem verificar nada. Cada caso abaixo é um jeito de ele ficar
 * frouxo.
 *
 * O DOM aqui é montado à mão, sem nenhum dos modais, para o helper ser exercido
 * isolado das mudanças deles.
 */

/** Uma região de impressão mínima, com os controles que o caso quer testar. */
function PrintRegion({ children }: { readonly children?: ReactNode }) {
  return <dialog className="js-print-region">{children}</dialog>;
}

describe('expectPrintRegionControlsHidden', () => {
  it('passa quando todo controle está sob data-print-hide', () => {
    render(
      <PrintRegion>
        <div data-print-hide>
          <button>Baixar relatório</button>
        </div>
        <button data-print-hide aria-label="Fechar modal" />
        <p>Conteúdo do relatório</p>
      </PrintRegion>
    );

    expect(() => expectPrintRegionControlsHidden(2)).not.toThrow();
  });

  it('morde quando alguém acrescenta um botão sem marca', () => {
    render(
      <PrintRegion>
        <button data-print-hide aria-label="Fechar modal" />
        {/* O controle novo, que ninguém lembrou de marcar. */}
        <button aria-label="Exportar tudo" />
      </PrintRegion>
    );

    // A contagem de escondidos BATE (o "X" está marcado); quem faz falhar é o
    // controle novo, que sai no papel sem ter sido declarado.
    expect(() => expectPrintRegionControlsHidden(1)).toThrow(/Exportar tudo/);
  });

  it('morde no <select> de itens por página, que uma varredura só de botões perderia', () => {
    render(
      <PrintRegion>
        <button data-print-hide aria-label="Fechar modal" />
        <select aria-label="Items por página">
          <option>10</option>
        </select>
      </PrintRegion>
    );

    expect(() => expectPrintRegionControlsHidden(1)).toThrow(
      /Items por página/
    );
  });

  it('morde no <input> de busca de uma tabela', () => {
    render(
      <PrintRegion>
        <button data-print-hide aria-label="Fechar modal" />
        <input aria-label="Buscar" />
      </PrintRegion>
    );

    expect(() => expectPrintRegionControlsHidden(1)).toThrow(/Buscar/);
  });

  it('morde no link que sairia impresso', () => {
    render(
      <PrintRegion>
        <button data-print-hide aria-label="Fechar modal" />
        <a href="/relatorios">Ver todos</a>
      </PrintRegion>
    );

    expect(() => expectPrintRegionControlsHidden(1)).toThrow(/Ver todos/);
  });

  it('aceita a marca em qualquer ancestral, não só no pai imediato', () => {
    render(
      <PrintRegion>
        <div data-print-hide>
          <div className="w-full">
            <span>
              <button aria-label="Próxima página" />
            </span>
          </div>
        </div>
      </PrintRegion>
    );

    expect(() => expectPrintRegionControlsHidden(1)).not.toThrow();
  });

  it('não conta controle que esteja fora da região de impressão', () => {
    render(
      <div>
        <button aria-label="Controle da página, fora do dialog" />
        <PrintRegion>
          <button data-print-hide aria-label="Fechar modal" />
        </PrintRegion>
      </div>
    );

    expect(() => expectPrintRegionControlsHidden(1)).not.toThrow();
  });

  it('falha quando a contagem esperada não bate, mesmo com tudo marcado', () => {
    render(
      <PrintRegion>
        <button data-print-hide aria-label="Fechar modal" />
        <button data-print-hide aria-label="Voltar" />
      </PrintRegion>
    );

    // A contagem é o que impede o laço de passar vazio, e também avisa quando um
    // controle novo aparece já marcado.
    expect(() => expectPrintRegionControlsHidden(1)).toThrow();
  });

  it('falha quando o <dialog> perdeu a marca de região de impressão', () => {
    render(
      <dialog>
        <button data-print-hide aria-label="Fechar modal" />
      </dialog>
    );

    // Sem `js-print-region` o PDF sairia com a página inteira; o helper não pode
    // dar verde por não encontrar nada.
    expect(() => expectPrintRegionControlsHidden(1)).toThrow();
  });

  it('não dá verde vazio quando a região não tem controle nenhum', () => {
    render(
      <PrintRegion>
        <p>Só conteúdo</p>
      </PrintRegion>
    );

    expect(() => expectPrintRegionControlsHidden(2)).toThrow();
  });

  describe('controles declarados como impressos', () => {
    /**
     * O caso do `StudentPerformanceDetailsModal`: o cabeçalho do acordeão é um
     * `<button>` cujo texto é o nome da atividade, então ele SAI no papel.
     */
    const Accordions = () => (
      <PrintRegion>
        <button data-print-hide aria-label="Fechar modal" />
        <button aria-expanded="false">Atividade de Biologia</button>
        <button aria-expanded="false">Atividade de Química</button>
      </PrintRegion>
    );

    it('aceita os que casam com o seletor declarado', () => {
      render(<Accordions />);

      expect(() =>
        expectPrintRegionControlsHidden(1, {
          selector: '[aria-expanded]',
          count: 2,
        })
      ).not.toThrow();
    });

    it('ainda morde num controle novo que não case com o seletor', () => {
      render(
        <PrintRegion>
          <button data-print-hide aria-label="Fechar modal" />
          <button aria-expanded="false">Atividade de Biologia</button>
          {/* Controle de verdade, sem marca e sem ser disclosure. */}
          <button aria-label="Exportar tudo" />
        </PrintRegion>
      );

      expect(() =>
        expectPrintRegionControlsHidden(1, {
          selector: '[aria-expanded]',
          count: 1,
        })
      ).toThrow(/Exportar tudo/);
    });

    it('a contagem impede o seletor de virar passe livre', () => {
      render(<Accordions />);

      // Um terceiro acordeão apareceu; a declaração diz dois.
      expect(() =>
        expectPrintRegionControlsHidden(1, {
          selector: '[aria-expanded]',
          count: 1,
        })
      ).toThrow();
    });

    it('sem declaração, nenhum controle pode sair no papel', () => {
      render(<Accordions />);

      expect(() => expectPrintRegionControlsHidden(1)).toThrow(
        /Atividade de Biologia/
      );
    });
  });
});
