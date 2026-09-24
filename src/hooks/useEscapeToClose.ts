import { useEffect } from 'react';

/**
 * Fecha um overlay (modal/dialog) ao pressionar Escape enquanto ele está aberto.
 *
 * Compartilhado pelos modais da lib pra evitar duplicar o mesmo `keydown`
 * listener em cada componente.
 *
 * @param enabled - Liga o listener. Normalmente `isOpen && closeOnEscape`.
 * @param onClose - Chamado quando o Escape é pressionado.
 */
export const useEscapeToClose = (enabled: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      // A popup inside the overlay (Select, DropdownMenu...) that already
      // handled this Escape marks it with preventDefault: only the popup
      // closes, the overlay stays open.
      if (event.key === 'Escape' && !event.defaultPrevented) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [enabled, onClose]);
};
