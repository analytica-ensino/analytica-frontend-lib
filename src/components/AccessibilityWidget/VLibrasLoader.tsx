import { useEffect } from 'react';
import { useAccessibilityStore } from '../../store/accessibilityStore';

const SCRIPT_ID = 'a11y-vlibras-script';
const SCRIPT_URL = 'https://vlibras.gov.br/app/vlibras-plugin.js';
const APP_URL = 'https://vlibras.gov.br/app';
const WRAPPER_ID = 'a11y-vlibras-wrapper';

interface VLibrasGlobal {
  Widget: new (appUrl: string) => unknown;
}

/**
 * Carrega e ativa o widget oficial de Libras do governo brasileiro
 * (gov.br/vlibras) sob demanda. Estratégia:
 *
 * - Quando `librasEnabled === true`:
 *   1. Injeta o esqueleto DOM esperado pelo VLibras (`<div vw>` etc.)
 *      no `<body>` (precisa estar no body, não dentro do React tree).
 *   2. Carrega o script oficial uma única vez (cacheado por id).
 *   3. Instancia `new window.VLibras.Widget(...)` para inicializar o
 *      avatar e os assets 3D.
 *
 * - Quando `librasEnabled === false`:
 *   - Remove o esqueleto DOM. O script permanece em cache (já carregado)
 *     para reativações rápidas.
 *
 * O script é pesado (~MBs de avatares 3D), por isso só carregamos quando
 * o usuário clica para ativar — fluxo opt-in.
 */
export default function VLibrasLoader() {
  const enabled = useAccessibilityStore((s) => s.librasEnabled);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (!enabled) {
      removeWrapper();
      return;
    }

    injectWrapper();
    loadScript()
      .then(() => {
        const VLibras = (globalThis as unknown as { VLibras?: VLibrasGlobal })
          .VLibras;
        if (!VLibras?.Widget) return;

        // ATENÇÃO: o construtor do VLibras Widget registra a lógica de
        // inicialização DENTRO de `window.onload = () => {...}`. Como
        // nesta integração o widget é ativado depois da página já ter
        // carregado, o evento `load` já disparou e o handler nunca
        // executa sozinho. Capturamos o handler que o construtor
        // instalou e chamamos manualmente para popular o DOM (avatar,
        // botão de acesso, painel) imediatamente.
        const previousOnload = globalThis.onload;
        // O `void` é intencional: a instanciação importa pelos efeitos
        // colaterais (o construtor registra `window.onload` com a lógica
        // de inicialização do widget), não pelo retorno. Sem essa marcação,
        // SonarQube classifica como "useless object instantiation" (bug).
        void new VLibras.Widget(APP_URL);
        const installed = globalThis.onload;
        if (typeof installed === 'function' && installed !== previousOnload) {
          // `onload` espera tipo Window — usamos `as` porque o construtor
          // do VLibras só lê `event.target` (que ignoramos) e não toca em
          // propriedades específicas do Window.
          (installed as (this: Window, ev: Event) => unknown).call(
            globalThis as unknown as Window,
            new Event('load')
          );
        }

        // Após popular o DOM, abre direto o painel do VLibras — caso
        // contrário o usuário precisaria clicar duas vezes (nosso FAB
        // + botão de acesso do VLibras). Aguarda um frame para garantir
        // que o handler de click do botão já foi anexado pelo plugin.
        requestAnimationFrame(() => {
          const accessButton =
            document.querySelector<HTMLElement>('[vw-access-button]');
          accessButton?.click();
        });
      })
      .catch(() => {
        // Falha de rede ou bloqueio: desabilita silenciosamente o estado
        // para o usuário não ficar preso achando que vai funcionar.
        useAccessibilityStore.getState().setLibrasEnabled(false);
      });

    return () => {
      // Não removemos o wrapper aqui: a remoção real fica no ramo
      // `!enabled` acima. Manter aqui causaria flicker em re-renders.
    };
  }, [enabled]);

  return null;
}

const injectWrapper = () => {
  if (document.getElementById(WRAPPER_ID)) return;

  const wrapper = document.createElement('div');
  wrapper.id = WRAPPER_ID;
  wrapper.setAttribute('vw', '');
  wrapper.className = 'enabled';

  const accessButton = document.createElement('div');
  accessButton.setAttribute('vw-access-button', '');
  accessButton.className = 'active';
  wrapper.appendChild(accessButton);

  const pluginWrapper = document.createElement('div');
  pluginWrapper.setAttribute('vw-plugin-wrapper', '');
  const top = document.createElement('div');
  top.className = 'vw-plugin-top-wrapper';
  pluginWrapper.appendChild(top);
  wrapper.appendChild(pluginWrapper);

  document.body.appendChild(wrapper);
};

const removeWrapper = () => {
  document.getElementById(WRAPPER_ID)?.remove();
};

const loadScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(SCRIPT_ID)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Falha ao carregar o script do VLibras'));
    document.head.appendChild(script);
  });
};

export const __testing = {
  SCRIPT_ID,
  SCRIPT_URL,
  WRAPPER_ID,
  injectWrapper,
  removeWrapper,
};
