/**
 * Constantes de posicionamento compartilhadas entre os FABs do widget
 * (`AccessibilityFab` e `LibrasFab`). Centralizadas aqui para evitar
 * que mudanças de gap/lateral precisem ser replicadas em cada FAB.
 */

export type FabPosition = 'right' | 'left';

/**
 * Alinhamento vertical do FAB. Quando o widget renderiza só um botão
 * (sem Libras), `center` deixa-o no meio da viewport. Quando há também
 * o LibrasFab empilhado abaixo, o de acessibilidade fica `above-center`
 * e o Libras fica `below-center` — formando um par grudado no meio.
 */
export type FabVerticalAlign = 'center' | 'above-center' | 'below-center';

export const FAB_POSITION_CLASSES: Record<FabPosition, string> = {
  right: 'right-0 rounded-l-lg',
  left: 'left-0 rounded-r-lg',
};

export const FAB_VERTICAL_ALIGN_CLASSES: Record<FabVerticalAlign, string> = {
  center: 'top-1/2 -translate-y-1/2',
  // Pares empilhados (acessibilidade + Libras) com gap mínimo entre si,
  // como no widget do HandTalk. Cada FAB tem 40px (h-10).
  'above-center': 'top-[calc(50%-1px)] -translate-y-full',
  'below-center': 'top-[calc(50%+1px)]',
};

/** Tooltip aparece do lado oposto à borda em que o FAB está colado. */
export const FAB_TOOLTIP_POSITION: Record<FabPosition, 'left' | 'right'> = {
  right: 'left',
  left: 'right',
};
