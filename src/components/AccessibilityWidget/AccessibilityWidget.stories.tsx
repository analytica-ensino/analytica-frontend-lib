import { useEffect } from 'react';
import type { Story } from '@ladle/react';
import AccessibilityWidget from './AccessibilityWidget';
import AccessibilityFab from './AccessibilityFab';
import AccessibilityPanel from './AccessibilityPanel';
import { useAccessibilityStore } from '../../store/accessibilityStore';

/**
 * Garante que os tokens da lib (`--color-info-600`, etc.) sejam
 * resolvidos durante a story. Sem `data-theme` válido, os botões
 * coloridos ficariam invisíveis (white-on-white).
 */
const useStoryTheme = () => {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'base-light');
    return () => {
      if (previous) root.setAttribute('data-theme', previous);
      else root.removeAttribute('data-theme');
    };
  }, []);
};

/**
 * Conteúdo de exemplo para validar visualmente os efeitos das
 * preferências (contraste, fonte, espaçamento, etc.).
 */
const SamplePage = () => (
  <article className="mx-auto max-w-2xl space-y-5 p-6">
    <h1 className="text-3xl font-bold text-text-900">
      Página de teste do widget de acessibilidade
    </h1>
    <p className="text-base text-text-700">
      Use os controles do botão flutuante para experimentar:{' '}
      <a href="#exemplo-1" className="text-info-600 underline">
        este link
      </a>
      ,{' '}
      <a href="#exemplo-2" className="text-info-600 underline">
        este outro link
      </a>{' '}
      e o <strong>texto em negrito</strong> devem ficar destacados quando você
      ativar &ldquo;Destacar links e botões&rdquo;.
    </p>
    <p className="text-base text-text-700">
      Suspendisse iaculis enim non magna ultrices, eget consectetur quam
      volutpat. Curabitur in dolor finibus pretium. Nulla facilisi. Pellentesque
      habitant morbi tristique senectus et netus.
    </p>
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="rounded-md bg-info-600 px-4 py-2 text-white"
      >
        Botão primário
      </button>
      <button
        type="button"
        className="rounded-md border border-text-300 bg-white px-4 py-2 text-text-900"
      >
        Botão secundário
      </button>
      <button
        type="button"
        className="rounded-md bg-error-500 px-4 py-2 text-white"
      >
        Botão vermelho (saturação)
      </button>
      <button
        type="button"
        className="rounded-md bg-success-500 px-4 py-2 text-white"
      >
        Botão verde (saturação)
      </button>
    </div>
    <ul className="list-disc space-y-1 pl-5 text-text-700">
      <li>Aumente o tamanho da fonte para ver este texto crescer</li>
      <li>Aumente o espaçamento entre linhas para ver as linhas separarem</li>
      <li>Ative tons de cinza para ver as cores sumirem</li>
      <li>Ative contraste invertido para inverter a página inteira</li>
    </ul>
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-md bg-error-100 p-4 text-error-800">Vermelho</div>
      <div className="rounded-md bg-success-100 p-4 text-success-800">
        Verde
      </div>
      <div className="rounded-md bg-info-100 p-4 text-info-800">Azul</div>
    </div>
  </article>
);

export const Default: Story = () => {
  useStoryTheme();
  return (
    <div className="min-h-screen bg-background">
      <SamplePage />
      <AccessibilityWidget />
    </div>
  );
};

export const Left: Story = () => {
  useStoryTheme();
  return (
    <div className="min-h-screen bg-background">
      <SamplePage />
      <AccessibilityWidget position="left" />
    </div>
  );
};

export const FabOnly: Story = () => {
  useStoryTheme();
  return (
    <div className="min-h-screen bg-background">
      <SamplePage />
      <AccessibilityFab onClick={() => undefined} />
    </div>
  );
};

export const PanelOpen: Story = () => {
  useStoryTheme();
  useAccessibilityStore.setState({ isPanelOpen: true });
  return (
    <div className="min-h-screen bg-background">
      <SamplePage />
      <AccessibilityPanel
        isOpen
        onClose={() => useAccessibilityStore.getState().closePanel()}
      />
    </div>
  );
};
