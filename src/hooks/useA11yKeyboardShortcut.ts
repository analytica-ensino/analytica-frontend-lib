import { useEffect } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';

/**
 * Registra o atalho `Alt+A` para abrir/fechar o painel de
 * acessibilidade. Não interfere quando o foco está em campo de
 * texto/edição para evitar conflitos com o usuário digitando.
 *
 * Habilitar/desabilitar é controlado pela preferência
 * `keyboardShortcut` do store.
 */
export const useA11yKeyboardShortcut = () => {
  const enabled = useAccessibilityStore((s) => s.keyboardShortcut);
  const togglePanel = useAccessibilityStore((s) => s.togglePanel);

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (!event.altKey || event.key.toLowerCase() !== 'a') return;

      // Não ativa se o usuário estiver digitando em algum campo
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      event.preventDefault();
      togglePanel();
    };

    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  }, [enabled, togglePanel]);
};
