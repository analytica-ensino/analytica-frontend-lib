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
 * Dá conta do foco de um modal: leva o foco pra dentro quando ele abre, prende
 * o Tab lá dentro enquanto está aberto e devolve o foco pra quem o abriu quando
 * fecha.
 *
 * Os modais da lib usam `<dialog open>` em vez de `showModal()`, então o
 * navegador NÃO faz nada disso sozinho — sem isso o leitor de tela continua
 * lendo a página atrás e o Tab escapa pro conteúdo que está visualmente
 * bloqueado pelo backdrop.
 *
 * O foco inicial vai pro próprio container (que precisa de `tabIndex={-1}`), e
 * não pro primeiro botão: como esses modais quase sempre são uma mensagem, cair
 * no "Fechar modal" faria o leitor anunciar só o botão e engolir o texto. No
 * container, ele anuncia título + papel de diálogo e o conteúdo fica legível a
 * partir do topo. Um `autoFocus` no conteúdo do modal tem prioridade e não é
 * sobrescrito.
 *
 * O Tab só é interceptado nas bordas do ciclo. Quando o foco está num portal
 * (Select, DropdownMenu e afins renderizam em `document.body`, fora do
 * container), o hook sai do caminho em vez de arrastar o foco de volta.
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
      const last = focusables[focusables.length - 1];

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

      // Só devolve o foco se quem abriu o modal ainda existe na página.
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [enabled, containerRef]);
};
