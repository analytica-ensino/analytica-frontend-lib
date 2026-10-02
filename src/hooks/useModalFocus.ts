import { RefObject, useEffect } from 'react';

/**
 * Elementos que entram no ciclo de Tab dentro do modal. O seletor já descarta
 * os desabilitados e quem tem `tabindex="-1"`.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((element) => element.getAttribute('aria-hidden') !== 'true');

/**
 * Tags que não renderizam nada. Marcá-las como inertes não muda
 * comportamento nenhum, só sujaria o DOM de quem for inspecionar.
 */
const NON_RENDERED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'LINK',
  'META',
  'TEMPLATE',
  'NOSCRIPT',
  'TITLE',
  'BASE',
]);

type HiddenElement = {
  element: Element;
  previousAriaHidden: string | null;
};

/**
 * Tira do caminho tudo que não é o modal: sobe do diálogo até o `<body>` e, em
 * cada nível, marca os IRMÃOS do caminho com `inert` + `aria-hidden="true"`.
 * Os ancestrais do diálogo nunca são marcados — fossem, o próprio modal (e o
 * backdrop, que precisa receber clique) iriam junto.
 *
 * `inert` tira do ciclo de Tab, do clique e da árvore de acessibilidade;
 * `aria-hidden` repete a última parte para os leitores de tela que ainda não
 * tratam `inert`. Juntos são o que faz a navegação ficar REALMENTE presa no
 * modal: o trap de Tab daqui só cobre o teclado, enquanto o cursor virtual do
 * VoiceOver (VO + setas) anda pelo DOM inteiro e ignora onde está o foco.
 * `aria-modal="true"` sozinho não dá conta — é justamente o que o VoiceOver
 * costuma deixar passar.
 *
 * O que é montado DEPOIS da abertura não é marcado, de propósito: `Select`,
 * `DropdownMenu` e afins renderizam em portais no `document.body` e precisam
 * continuar utilizáveis dentro do modal (o trap de Tab também sai do caminho
 * nesse caso). Em troca, um portal que já estava aberto quando o modal abriu
 * fica inerte — o esperado, já que ele pertence à página de trás.
 *
 * @returns Função que devolve os atributos exatamente como estavam.
 */
const hideOutside = (container: HTMLElement) => {
  const hidden: HiddenElement[] = [];

  let node: HTMLElement | null = container;

  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;

    for (const sibling of Array.from(parent.children)) {
      if (sibling === node) continue;
      if (NON_RENDERED_TAGS.has(sibling.tagName)) continue;
      // Quem JÁ está inert foi marcado pela aplicação (ou por um modal de
      // baixo que ainda não fechou): não é nosso para mexer, e portanto nem
      // para devolver no fechamento.
      if (sibling.hasAttribute('inert')) continue;

      hidden.push({
        element: sibling,
        previousAriaHidden: sibling.getAttribute('aria-hidden'),
      });

      sibling.setAttribute('inert', '');
      sibling.setAttribute('aria-hidden', 'true');
    }

    node = parent;
  }

  return () => {
    for (const { element, previousAriaHidden } of hidden) {
      element.removeAttribute('inert');

      if (previousAriaHidden === null) {
        element.removeAttribute('aria-hidden');
      } else {
        element.setAttribute('aria-hidden', previousAriaHidden);
      }
    }
  };
};

/**
 * Pilha dos modais abertos, compartilhada por TODOS os modais da lib (mesma
 * ideia do contador do `useBodyScrollLock`).
 *
 * Só o modal do topo mantém o resto da página inerte. Sem isso, dois modais
 * irmãos abertos ao mesmo tempo marcariam um ao outro — cada um é "o lado de
 * fora" do outro — e a página inteira, modais inclusive, ficaria inerte.
 */
const openModals: HTMLElement[] = [];
let releaseInert: (() => void) | null = null;

/**
 * Desfaz a marcação vigente e reaplica a partir do modal do topo. Chamado nas
 * duas pontas: ao abrir um modal (ele assume) e ao fechar (o de baixo retoma,
 * ou a página volta ao normal quando não sobra nenhum).
 */
const applyTopmostInert = () => {
  releaseInert?.();
  releaseInert = null;

  const topmost = openModals.at(-1);
  if (topmost) {
    releaseInert = hideOutside(topmost);
  }
};

/**
 * Dá conta do foco de um modal: leva o foco pra dentro quando ele abre, prende
 * a navegação lá dentro enquanto está aberto e devolve o foco pra quem o abriu
 * quando fecha.
 *
 * Os modais da lib usam `<dialog open>` em vez de `showModal()`, então o
 * navegador NÃO faz nada disso sozinho — não há top layer, e sem isto o leitor
 * de tela continua lendo a página atrás e o Tab escapa pro conteúdo que está
 * visualmente bloqueado pelo backdrop.
 *
 * O foco inicial vai pro próprio container (que precisa de `tabIndex={-1}`), e
 * não pro primeiro botão: como esses modais quase sempre são uma mensagem, cair
 * no "Fechar modal" faria o leitor anunciar só o botão e engolir o texto. No
 * container, ele anuncia título + papel de diálogo e o conteúdo fica legível a
 * partir do topo. Um `autoFocus` no conteúdo do modal tem prioridade e não é
 * sobrescrito.
 *
 * A navegação fica presa por duas vias complementares:
 *
 * 1. Tudo que está FORA do modal vira `inert` + `aria-hidden` (ver
 *    `hideOutside`). É o que tranca também o cursor virtual do VoiceOver, e o
 *    que impede o Tab de recomeçar do topo da página quando o foco cai no
 *    `<body>` (um clique no backdrop, por exemplo).
 * 2. O Tab é interceptado nas bordas do ciclo, para fechar o anel em vez de
 *    deixar o foco sair pela barra de endereços do navegador. Quando o foco
 *    está num portal (Select, DropdownMenu e afins renderizam em
 *    `document.body`, fora do container), o hook sai do caminho em vez de
 *    arrastar o foco de volta.
 *
 * @param enabled - Liga o gerenciamento. Normalmente `isOpen`.
 * @param containerRef - Ref do elemento do diálogo.
 */
export const useModalFocus = (
  enabled: boolean,
  containerRef: RefObject<HTMLElement | null>
) => {
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const activeOnOpen = document.activeElement as HTMLElement | null;

    // Se o foco JÁ está dentro do modal, quem mandou foi o consumidor (um
    // `autoFocus` num campo, por exemplo) e a escolha dele vale mais que o
    // padrão daqui. Nesse caso não há como saber quem abriu o modal, então
    // também não há o que devolver no fechamento.
    const focusWasOutside = !container.contains(activeOnOpen);
    const previouslyFocused = focusWasOutside ? activeOnOpen : null;

    // A ordem destes três passos importa, e cada um depende do anterior:
    //
    // 1. Guardar quem tinha o foco ACIMA, antes de qualquer `inert`. O
    //    navegador desfoca na hora um elemento que vira inerte, então depois
    //    disso `document.activeElement` já seria o `<body>` e não sobraria pra
    //    quem devolver o foco no fechamento.
    // 2. Marcar a página, abaixo — é o que garante que este modal esteja fora
    //    de qualquer região inerte. Um modal aberto sobre outro nasce DENTRO do
    //    `inert` aplicado pelo de baixo; focá-lo antes desta linha não surtiria
    //    efeito nenhum.
    // 3. Só então mover o foco.
    openModals.push(container);
    applyTopmostInert();

    if (focusWasOutside) {
      container.focus();
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const active = document.activeElement;
      if (!active || !container.contains(active)) return;

      const focusables = getFocusableElements(container);

      if (focusables.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusables[0];
      // O guard de lista vazia acima garante que existe um último elemento;
      // `.at()` só não consegue expressar isso no tipo.
      const last = focusables.at(-1) as HTMLElement;

      if (event.shiftKey) {
        // O container entra no ciclo pra que voltar do topo caia no fim, em vez
        // de sair do modal.
        if (active === first || active === container) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);

      // Devolver a página ANTES de devolver o foco: o gatilho que abriu o modal
      // mora lá fora, e `focus()` num elemento ainda inerte não faz nada.
      const index = openModals.indexOf(container);
      if (index !== -1) {
        openModals.splice(index, 1);
      }
      applyTopmostInert();

      // Só devolve o foco se quem abriu o modal ainda existe na página.
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [enabled, containerRef]);
};
