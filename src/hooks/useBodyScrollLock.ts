import { useEffect } from 'react';

/**
 * Trava o scroll do `body` enquanto um modal está aberto, com contagem de
 * referências compartilhada entre TODOS os modais da lib.
 *
 * O primeiro modal a travar salva os estilos originais do `body`, aplica
 * `overflow: hidden`, compensa o sumiço da scrollbar com `padding-right` e cria
 * um overlay (`#modal-scrollbar-overlay`) cobrindo essa faixa com a cor do
 * backdrop. Modais abertos ao mesmo tempo apenas incrementam o contador; só
 * quando o ÚLTIMO fecha os estilos originais são restaurados — assim fechar um
 * modal não devolve o scroll do body enquanto outro continua aberto.
 */
const SCROLLBAR_OVERLAY_ID = 'modal-scrollbar-overlay';

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

const applyLock = () => {
  // Mede a scrollbar antes de esconder o overflow.
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  originalOverflow = document.body.style.overflow;
  originalPaddingRight = document.body.style.paddingRight;

  document.body.style.overflow = 'hidden';

  // Compensa a scrollbar que some pra não deslocar o layout.
  if (scrollbarWidth > 0) {
    // Soma à padding-right JÁ existente (inline ou de folha de estilo) em vez de
    // substituí-la — senão o espaçamento original do body seria descartado. O
    // valor inline original fica salvo em `originalPaddingRight` pra restaurar.
    const currentPaddingRight =
      Number.parseFloat(window.getComputedStyle(document.body).paddingRight) ||
      0;
    document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;

    const overlay = document.createElement('div');
    overlay.id = SCROLLBAR_OVERLAY_ID;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: ${scrollbarWidth}px;
      height: 100vh;
      background-color: rgb(0 0 0 / 0.6);
      z-index: 40;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
  }
};

const releaseLock = () => {
  document.body.style.overflow = originalOverflow;
  document.body.style.paddingRight = originalPaddingRight;

  const overlay = document.getElementById(SCROLLBAR_OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
};

/**
 * @param locked - Trava o scroll enquanto `true`. Normalmente `isOpen`.
 */
export const useBodyScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;

    if (lockCount === 0) applyLock();
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) releaseLock();
    };
  }, [locked]);
};
