/**
 * Invariante de impressão dos modais de relatório, em um lugar só.
 *
 * PARA QUE SERVE. Quando um modal é a região de impressão — `js-print-region` no
 * `<dialog>` mais `body.printing-modal` —, o `print.css` revela o `<dialog>`
 * INTEIRO e esconde o resto da página. Quem mora dentro dele sai no papel, e
 * nada mais o esconde. Controle de tela (botão, seletor, busca, paginação) não é
 * conteúdo de relatório e precisa de `data-print-hide`.
 *
 * POR QUE UM INVARIANTE, E NÃO UMA ASSERÇÃO POR CONTROLE. Durante esta feature
 * três controles foram descobertos assim, um de cada vez e cada um por um
 * acidente diferente: o botão "Baixar relatório" da barra de ações, o "X" do
 * `Modal` base e o botão de voltar da cascata. Cada descoberta virou uma
 * asserção nomeada — que só pega o controle que alguém já sabia existir. Esta
 * função pega o PRÓXIMO: um controle acrescentado a qualquer componente que os
 * modais compõem quebra o teste sem depender de ninguém lembrar de marcá-lo.
 *
 * COMO ELE RECEBE O DOM. Lê do `document` já renderizado, e não renderiza nada
 * por conta própria. É o que permite chamá-lo em QUALQUER ponto do teste — em
 * particular DEPOIS de navegar para dentro de uma cascata, que é o único estado
 * em que o botão de voltar existe. Um helper que renderizasse precisaria receber
 * o elemento e, junto, saber navegar até o nível certo de cada modal; os seis
 * têm formas de montagem diferentes (dado por prop, hook mockado, dois e três
 * níveis) e nenhuma assinatura comum cobriria as seis.
 */

/**
 * O `<dialog>` que a impressão de modal isolado deixa passar.
 *
 * Mesmo seletor que o `print.css` usa. A marca vem do `ReportDetailModal`, que a
 * põe no `<dialog>` do `Modal` base.
 */
const PRINT_REGION_SELECTOR = 'dialog.js-print-region';

/**
 * O que conta como controle.
 *
 * VARRE ALÉM DE `<button>` de propósito. A versão original desta asserção, no
 * `EssayStudentDetailsModal`, olhava só botões — e isso é suficiente ali por
 * acidente: aquele modal não tem tabela. Os modais com tabela paginada compõem o
 * `TablePagination`, que desenha um `<select aria-label="Items por página">` ao
 * lado dos dois botões de navegação, e o `TableProvider` com `enableSearch`
 * desenha um `<input>`. Uma varredura só de botões daria verde com o seletor de
 * página cru no meio do PDF.
 *
 * `a[href]` e não `a`: uma âncora sem `href` não navega e não é controle.
 * `input` cobre também os de tipo `checkbox` e `radio` que uma tabela com
 * seleção de linha traria.
 */
const CONTROL_SELECTOR = 'button, a[href], input, select, textarea';

/** Marca que o `print.css` usa para tirar um elemento do papel. */
const PRINT_HIDE_SELECTOR = '[data-print-hide]';

/**
 * Um rótulo legível para o controle, usado só na mensagem de falha.
 *
 * Sem isto a falha diz "esperava 1, recebeu 0" e não diz QUAL controle ficou sem
 * marca — que é justamente a informação que o achado precisa carregar.
 */
function describeControl(control: HTMLElement): string {
  const tag = control.tagName.toLowerCase();
  const label =
    control.getAttribute('aria-label') ??
    control.dataset.testid ??
    control.textContent?.trim();

  return label ? `<${tag}> "${label}"` : `<${tag}>`;
}

/**
 * Controles que SAEM no papel de propósito.
 *
 * Existe por um caso real, achado ao aplicar este invariante ao
 * `StudentPerformanceDetailsModal`: as atividades são `CardAccordation`, e o
 * cabeçalho de cada acordeão é um `<button>` cujo TEXTO é o nome da atividade e
 * o placar. Marcá-lo com `data-print-hide` apagaria a lista de atividades do
 * PDF — o contrário do que o relatório precisa. Um botão de disclosure não é
 * controle descartável: ele carrega conteúdo.
 *
 * É declarado NO PONTO DA CHAMADA, e não embutido no seletor de controles, de
 * propósito. Uma regra global do tipo `button:not([aria-expanded])` é
 * exatamente a "regra local cega" que o `ReportDetailModal` documenta estar
 * sendo aposentada: ela daria passe livre a qualquer controle futuro que por
 * acaso tenha o atributo. Aqui cada modal diz, explicitamente e com contagem, o
 * que imprime — e um controle novo que não case com a declaração quebra o
 * teste.
 */
export interface PrintedControlsDeclaration {
  /** Seletor CSS dos controles que legitimamente saem no papel. */
  readonly selector: string;
  /** Quantos são. Obrigatório: sem ele o seletor viraria um passe livre. */
  readonly count: number;
}

/**
 * Exige que cada controle dentro da região impressa esteja sob `data-print-hide`
 * — salvo os que a chamada declarar explicitamente como impressos.
 *
 * @param expectedHiddenCount - Quantos controles a região deve ter sob
 *   `data-print-hide` neste estado. OBRIGATÓRIO, e não um opcional com padrão:
 *   sem ele a verificação passaria com zero controles, e um teste que não pode
 *   falhar é pior que nenhum. O número também documenta, no ponto da chamada,
 *   quais controles aquele estado da tela tem — e quebra quando alguém
 *   acrescenta um, mesmo que já venha marcado.
 * @param printed - Os controles que saem no papel de propósito. Ausente
 *   significa NENHUM: todo controle da região tem de estar escondido.
 *
 * @example
 * ```ts
 * render(<EssayStudentDetailsModal {...props} />);
 * // O "X" do Modal base e o "Baixar relatório" do ReportDetailModal.
 * expectPrintRegionControlsHidden(2);
 * ```
 *
 * @example
 * ```ts
 * render(<StudentPerformanceDetailsModal {...props} />);
 * // Os mesmos dois, mais dois cabeçalhos de acordeão que são conteúdo.
 * expectPrintRegionControlsHidden(2, {
 *   selector: '[aria-expanded]',
 *   count: 2,
 * });
 * ```
 */
export function expectPrintRegionControlsHidden(
  expectedHiddenCount: number,
  printed?: PrintedControlsDeclaration
): void {
  const region = document.querySelector(PRINT_REGION_SELECTOR);

  // Sem a região não há o que verificar, e o resto passaria vazio: um modal que
  // perdesse a marca `js-print-region` faria o PDF sair com a página inteira e
  // este teste continuaria verde.
  expect(region).not.toBeNull();

  // `HTMLElement` e não `Element`: todo seletor de `CONTROL_SELECTOR` é HTML
  // (button, a, input, select, textarea), e é o que dá acesso a `dataset` em
  // `describeControl`.
  const controls = Array.from(
    (region as Element).querySelectorAll<HTMLElement>(CONTROL_SELECTOR)
  );

  const hidden = controls.filter(
    (control) => control.closest(PRINT_HIDE_SELECTOR) !== null
  );
  const unhidden = controls.filter(
    (control) => control.closest(PRINT_HIDE_SELECTOR) === null
  );

  expect(hidden.map(describeControl)).toHaveLength(expectedHiddenCount);

  // Os que a chamada declarou como conteúdo. Comparado como LISTA de rótulos, e
  // não com um `for` de asserções: a falha nomeia de uma vez todo controle que
  // saiu no papel sem ser declarado, em vez de parar no primeiro.
  const declaredLabels = printed
    ? unhidden
        .filter((control) => control.matches(printed.selector))
        .map(describeControl)
    : [];

  expect(unhidden.map(describeControl)).toEqual(declaredLabels);
  expect(declaredLabels).toHaveLength(printed?.count ?? 0);
}
