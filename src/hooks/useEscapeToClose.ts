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
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [enabled, onClose]);
};
