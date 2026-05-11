import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AccessibilityPanel from './AccessibilityPanel';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../../store/accessibilityStore';

const renderPanel = (overrides: Partial<{ onClose: () => void }> = {}) => {
  const onClose = overrides.onClose ?? jest.fn();
  const utils = render(<AccessibilityPanel isOpen onClose={onClose} />);
  return { ...utils, onClose };
};

/**
 * Cada seção do painel é um accordion colapsado por padrão; expande
 * clicando no header (`a11y-section-*`). Helper para os testes que
 * precisam interagir com controls dentro de uma seção específica.
 */
const expandSection = async (testId: string) => {
  await userEvent.click(screen.getByTestId(testId));
};

describe('AccessibilityPanel', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
    });
  });

  it('does not render when closed', () => {
    render(<AccessibilityPanel isOpen={false} onClose={() => undefined} />);
    expect(screen.queryByTestId('accessibility-panel')).not.toBeInTheDocument();
  });

  it('anchors to the right edge by default', () => {
    renderPanel();
    const panel = screen.getByTestId('accessibility-panel');
    expect(panel.className).toMatch(/right-10/);
    expect(panel.className).not.toMatch(/left-10/);
  });

  it('anchors to the left edge when position is left', () => {
    render(
      <AccessibilityPanel isOpen onClose={() => undefined} position="left" />
    );
    const panel = screen.getByTestId('accessibility-panel');
    expect(panel.className).toMatch(/left-10/);
    expect(panel.className).not.toMatch(/right-10/);
  });

  it('renders the 6 collapsible accordion sections', () => {
    renderPanel();
    expect(screen.getByText('Visão')).toBeInTheDocument();
    expect(screen.getByText('Leitura')).toBeInTheDocument();
    expect(screen.getByText('Leitor de texto')).toBeInTheDocument();
    expect(screen.getByText('Animação')).toBeInTheDocument();
    expect(screen.getByText('Navegação')).toBeInTheDocument();
    expect(screen.getByText('Atalho de teclado')).toBeInTheDocument();
  });

  it('keeps controls hidden until the section is expanded', async () => {
    renderPanel();
    expect(
      screen.queryByRole('radio', { name: 'Alto' })
    ).not.toBeInTheDocument();

    await expandSection('a11y-section-vision');
    expect(screen.getByRole('radio', { name: 'Alto' })).toBeInTheDocument();
  });

  it('calls onClose when the X button is clicked', async () => {
    const { onClose } = renderPanel();
    await userEvent.click(
      screen.getByRole('button', { name: /fechar opções de acessibilidade/i })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', async () => {
    const { onClose } = renderPanel();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('updates contrast mode when an option is selected (Visão section)', async () => {
    renderPanel();
    await expandSection('a11y-section-vision');
    await userEvent.click(screen.getByRole('radio', { name: 'Alto' }));
    expect(useAccessibilityStore.getState().contrastMode).toBe('high');
  });

  it('updates saturation mode when an option is selected (Visão section)', async () => {
    renderPanel();
    await expandSection('a11y-section-vision');
    await userEvent.click(
      screen.getByRole('radio', { name: /tons de cinza/i })
    );
    expect(useAccessibilityStore.getState().saturationMode).toBe('grayscale');
  });

  it('toggles "Destacar links e botões" inside Navegação section', async () => {
    renderPanel();
    await expandSection('a11y-section-navigation');
    await userEvent.click(screen.getByTestId('a11y-toggle-highlight-links'));
    expect(useAccessibilityStore.getState().highlightLinks).toBe(true);
  });

  it('toggles "Pausar animações" inside Animação section', async () => {
    renderPanel();
    await expandSection('a11y-section-animation');
    await userEvent.click(screen.getByTestId('a11y-toggle-pause-animations'));
    expect(useAccessibilityStore.getState().pauseAnimations).toBe(true);
  });

  it('toggles "Cursor aumentado" inside Navegação section', async () => {
    renderPanel();
    await expandSection('a11y-section-navigation');
    await userEvent.click(screen.getByTestId('a11y-toggle-big-cursor'));
    expect(useAccessibilityStore.getState().bigCursor).toBe(true);
  });

  it('toggles "Fonte para dislexia" inside Leitura section', async () => {
    renderPanel();
    await expandSection('a11y-section-reading');
    await userEvent.click(screen.getByTestId('a11y-toggle-dyslexia-font'));
    expect(useAccessibilityStore.getState().dyslexiaFont).toBe(true);
  });

  it('updates font size when a PreviewSegmented option is selected', async () => {
    renderPanel();
    await expandSection('a11y-section-reading');
    const fontGroup = screen.getByRole('radiogroup', {
      name: 'Tamanho da fonte',
    });
    await userEvent.click(
      within(fontGroup).getByRole('radio', { name: 'Grande' })
    );
    expect(useAccessibilityStore.getState().fontSize).toBe(3);
  });

  it('updates letter and line spacing via their PreviewSegmented groups', async () => {
    renderPanel();
    await expandSection('a11y-section-reading');

    const letterGroup = screen.getByRole('radiogroup', {
      name: 'Espaçamento entre letras',
    });
    await userEvent.click(
      within(letterGroup).getByRole('radio', { name: 'Médio' })
    );
    expect(useAccessibilityStore.getState().letterSpacing).toBe(2);

    const lineGroup = screen.getByRole('radiogroup', {
      name: 'Espaçamento entre linhas',
    });
    await userEvent.click(
      within(lineGroup).getByRole('radio', { name: 'Pequeno' })
    );
    expect(useAccessibilityStore.getState().lineSpacing).toBe(1);
  });

  it('toggles a row via the Enter key (Animação section)', async () => {
    renderPanel();
    await expandSection('a11y-section-animation');
    const row = screen.getByRole('switch', {
      name: /pausar animações para conforto visual/i,
    });
    row.focus();
    await userEvent.keyboard('{Enter}');
    expect(useAccessibilityStore.getState().pauseAnimations).toBe(true);
  });

  it('toggles the dyslexia row via the Space key', async () => {
    renderPanel();
    await expandSection('a11y-section-reading');
    const row = screen.getByRole('switch', {
      name: /trocar para comic sans ms/i,
    });
    row.focus();
    await userEvent.keyboard(' ');
    expect(useAccessibilityStore.getState().dyslexiaFont).toBe(true);
  });

  it('toggles the Alt+A shortcut inside Atalho de teclado section', async () => {
    renderPanel();
    await expandSection('a11y-section-shortcut');
    await userEvent.click(screen.getByTestId('a11y-toggle-keyboard-shortcut'));
    expect(useAccessibilityStore.getState().keyboardShortcut).toBe(false);
  });

  it('resets all preferences when "Redefinir ajustes" is clicked', async () => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      contrastMode: 'high',
      fontSize: 3,
      highlightLinks: true,
      bigCursor: true,
      isPanelOpen: true,
    });

    renderPanel();
    await userEvent.click(screen.getByTestId('a11y-reset'));

    const state = useAccessibilityStore.getState();
    expect(state.contrastMode).toBe('normal');
    expect(state.fontSize).toBe(0);
    expect(state.highlightLinks).toBe(false);
    expect(state.bigCursor).toBe(false);
  });
});
