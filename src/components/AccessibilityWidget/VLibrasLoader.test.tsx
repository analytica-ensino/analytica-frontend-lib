/* eslint-disable no-undef -- DOM types (FrameRequestCallback, HTMLScriptElement)
   são reconhecidas pelo TypeScript mas não pelo `globals.browser` do ESLint. */
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VLibrasLoader, { __testing } from './VLibrasLoader';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../../store/accessibilityStore';

const { SCRIPT_ID, WRAPPER_ID } = __testing;

describe('VLibrasLoader', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
      ttsStatus: 'idle',
    });
    document.getElementById(WRAPPER_ID)?.remove();
    document.getElementById(SCRIPT_ID)?.remove();
    delete (globalThis as unknown as { VLibras?: unknown }).VLibras;
  });

  it('does not inject DOM nor script when librasEnabled is false', () => {
    render(<VLibrasLoader />);
    expect(document.getElementById(WRAPPER_ID)).not.toBeInTheDocument();
    expect(document.getElementById(SCRIPT_ID)).not.toBeInTheDocument();
  });

  it('injects the wrapper DOM and the script when librasEnabled becomes true', () => {
    render(<VLibrasLoader />);

    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });

    const wrapper = document.getElementById(WRAPPER_ID);
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector('[vw-access-button]')).toBeInTheDocument();
    expect(wrapper?.querySelector('[vw-plugin-wrapper]')).toBeInTheDocument();

    const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement;
    expect(script).toBeInTheDocument();
    expect(script.src).toContain('vlibras.gov.br');
  });

  it('hides (does not remove) the wrapper when librasEnabled returns to false', () => {
    render(<VLibrasLoader />);

    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });
    const wrapper = document.getElementById(WRAPPER_ID);
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.style.display).toBe('');

    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(false);
    });
    // The skeleton stays in the DOM (just hidden) so the plugin's orphan
    // resize listener never runs `.closest()` on a null [vp]/[vw] node.
    expect(document.getElementById(WRAPPER_ID)).toBeInTheDocument();
    expect(document.getElementById(WRAPPER_ID)?.style.display).toBe('none');
  });

  it('re-shows the same wrapper on reactivation without recreating it', () => {
    render(<VLibrasLoader />);

    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });
    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(false);
    });
    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });

    const wrappers = document.querySelectorAll(`#${WRAPPER_ID}`);
    expect(wrappers.length).toBe(1);
    expect(document.getElementById(WRAPPER_ID)?.style.display).toBe('');
  });

  it('does not duplicate the script on repeated activations', () => {
    render(<VLibrasLoader />);

    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });
    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(false);
    });
    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });

    const scripts = document.querySelectorAll(`#${SCRIPT_ID}`);
    expect(scripts.length).toBe(1);
  });

  it('does not duplicate the wrapper if injected twice', () => {
    render(<VLibrasLoader />);

    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });
    // Re-trigger render same state
    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });

    const wrappers = document.querySelectorAll(`#${WRAPPER_ID}`);
    expect(wrappers.length).toBe(1);
  });

  describe('VLibras Widget initialization', () => {
    let originalRAF: typeof requestAnimationFrame;
    let widgetCalls: string[] = [];

    beforeEach(() => {
      widgetCalls = [];
      // Stubs simples de rAF síncrono pra exercitar o caminho de auto-open
      originalRAF = globalThis.requestAnimationFrame;
      globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      }) as typeof requestAnimationFrame;
    });

    afterEach(() => {
      globalThis.requestAnimationFrame = originalRAF;
      // Mantemos `globalThis.onload` limpa entre testes
      globalThis.onload = null;
    });

    /**
     * Simula a chegada do script do VLibras no `<head>`: dispara o
     * `onload` do `<script>` injetado e popula `window.VLibras` com um
     * construtor falso que registra `window.onload` (mesmo padrão do
     * plugin real).
     */
    const fakeScriptArrival = (
      onWidgetConstruct?: (appUrl: string) => void
    ) => {
      (globalThis as unknown as { VLibras: { Widget: unknown } }).VLibras = {
        Widget: function (this: unknown, appUrl: string) {
          widgetCalls.push(appUrl);
          onWidgetConstruct?.(appUrl);
          // Imita o plugin: registra onload com a "lógica de inicialização"
          globalThis.onload = () => {
            // Simula popular o access-button quando o handler executa
            const btn = document.querySelector('[vw-access-button]');
            if (btn) (btn as HTMLElement).dataset.populated = 'true';
          };
        },
      };
      const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement;
      script?.onload?.(new Event('load'));
    };

    it('calls VLibras.Widget with the official app URL', async () => {
      render(<VLibrasLoader />);
      act(() => {
        useAccessibilityStore.getState().setLibrasEnabled(true);
      });
      fakeScriptArrival();
      await Promise.resolve();
      expect(widgetCalls).toEqual(['https://vlibras.gov.br/app']);
    });

    it('manually triggers the onload handler so the widget populates the DOM', async () => {
      render(<VLibrasLoader />);
      act(() => {
        useAccessibilityStore.getState().setLibrasEnabled(true);
      });
      fakeScriptArrival();
      await Promise.resolve();

      const accessBtn = document.querySelector(
        '[vw-access-button]'
      ) as HTMLElement;
      expect(accessBtn?.dataset.populated).toBe('true');
    });

    it('clicks the native access-button to auto-open the panel', async () => {
      const clickSpy = jest.fn();
      render(<VLibrasLoader />);
      act(() => {
        useAccessibilityStore.getState().setLibrasEnabled(true);
      });

      const accessBtn = document.querySelector(
        '[vw-access-button]'
      ) as HTMLElement;
      accessBtn.addEventListener('click', clickSpy);

      fakeScriptArrival();
      await Promise.resolve();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('reverts librasEnabled to false when the script fails to load', async () => {
      render(<VLibrasLoader />);
      act(() => {
        useAccessibilityStore.getState().setLibrasEnabled(true);
      });

      const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement;
      script.onerror?.(new Event('error'));

      // Aguarda o catch resolver
      await new Promise((r) => setTimeout(r, 0));
      expect(useAccessibilityStore.getState().librasEnabled).toBe(false);
    });
  });
});
