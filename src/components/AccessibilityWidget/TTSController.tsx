import { useEffect } from 'react';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { useTTS } from '../../hooks/useTTS';

const HIGHLIGHT_CLASS = 'a11y-tts-target';

/**
 * Controller invisível que conecta o `ttsMode` do store ao DOM:
 * - `click-to-read`: registra um listener global de clique. Ao clicar
 *   em qualquer elemento (exceto o próprio widget), lê seu texto.
 * - `read-selection`: lê o texto atualmente selecionado quando o store
 *   sinaliza (via `pendingReadSelection`). UI/atalho disparam isso.
 *
 * Aplica a classe `.a11y-tts-target` no elemento sendo lido para
 * destaque visual; remove ao terminar/parar.
 */
export default function TTSController() {
  const ttsMode = useAccessibilityStore((s) => s.ttsMode);
  const ttsStatus = useAccessibilityStore((s) => s.ttsStatus);
  const { speak, stop, isSupported } = useTTS();

  // Click-to-read: ouve cliques globais enquanto o modo está ativo
  useEffect(() => {
    if (!isSupported || ttsMode !== 'click-to-read') return;

    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Ignora cliques dentro do próprio widget
      if (target.closest('.a11y-widget-shield')) return;

      const text = extractReadableText(target);
      if (!text) return;

      event.preventDefault();
      event.stopPropagation();

      // Limpa highlight anterior e marca o novo alvo
      document
        .querySelectorAll(`.${HIGHLIGHT_CLASS}`)
        .forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
      target.classList.add(HIGHLIGHT_CLASS);

      speak(text);
    };

    // capture: true → pegamos o clique antes do handler do app/link
    document.addEventListener('click', handler, true);
    return () => {
      document.removeEventListener('click', handler, true);
      document
        .querySelectorAll(`.${HIGHLIGHT_CLASS}`)
        .forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
      // Interrompe qualquer fala em curso ao sair do modo. Sem isso,
      // desligar o "Clique para ler" deixaria a leitura terminando
      // sozinha, contrariando a expectativa do usuário.
      stop();
    };
  }, [isSupported, ttsMode, speak, stop]);

  // Quando a fala termina (ttsStatus volta a 'idle'), limpa highlight
  useEffect(() => {
    if (ttsStatus === 'idle') {
      document
        .querySelectorAll(`.${HIGHLIGHT_CLASS}`)
        .forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
    }
  }, [ttsStatus]);

  // Para qualquer fala em curso quando o componente desmonta
  useEffect(() => () => stop(), [stop]);

  return null;
}

/**
 * Extrai texto legível do elemento clicado. Prioriza:
 * 1. `aria-label` se presente
 * 2. `title`
 * 3. `innerText` truncado
 *
 * `innerText` (e não `textContent`) respeita estilos como `display: none`
 * e quebras de linha visuais — leitura mais natural.
 */
const extractReadableText = (el: HTMLElement): string => {
  const aria = el.getAttribute('aria-label')?.trim();
  if (aria) return aria;
  const title = el.getAttribute('title')?.trim();
  if (title) return title;
  const text = el.innerText?.trim() ?? '';
  // Limita comprimento para evitar leitura infinita ao clicar em
  // contêineres grandes (ex.: <main>). 600 chars ≈ 1min de fala.
  return text.length > 600 ? `${text.slice(0, 600)}...` : text;
};
