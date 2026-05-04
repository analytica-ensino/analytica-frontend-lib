import { render, screen } from '@testing-library/react';
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
    expect(panel.className).toMatch(/right-6/);
    expect(panel.className).not.toMatch(/left-6/);
  });

  it('anchors to the left edge when position is left', () => {
    render(
      <AccessibilityPanel isOpen onClose={() => undefined} position="left" />
    );
    const panel = screen.getByTestId('accessibility-panel');
    expect(panel.className).toMatch(/left-6/);
    expect(panel.className).not.toMatch(/right-6/);
  });

  it('renders all sections when open', () => {
    renderPanel();
    expect(screen.getByText('Contraste')).toBeInTheDocument();
    expect(screen.getByText('Saturação')).toBeInTheDocument();
    expect(screen.getByText('Tamanho da fonte')).toBeInTheDocument();
    expect(screen.getByText('Espaçamento entre letras')).toBeInTheDocument();
    expect(screen.getByText('Espaçamento entre linhas')).toBeInTheDocument();
    expect(screen.getByText('Destacar links e botões')).toBeInTheDocument();
    expect(screen.getByText('Pausar animações')).toBeInTheDocument();
    expect(screen.getByText('Cursor aumentado')).toBeInTheDocument();
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

  it('updates contrast mode when an option is selected', async () => {
    renderPanel();
    const highRadio = screen.getByRole('radio', { name: 'Alto' });
    await userEvent.click(highRadio);
    expect(useAccessibilityStore.getState().contrastMode).toBe('high');
  });

  it('updates saturation mode when an option is selected', async () => {
    renderPanel();
    const grayscaleRadio = screen.getByRole('radio', {
      name: /tons de cinza/i,
    });
    await userEvent.click(grayscaleRadio);
    expect(useAccessibilityStore.getState().saturationMode).toBe('grayscale');
  });

  it('toggles boolean preferences via switches', async () => {
    renderPanel();

    await userEvent.click(screen.getByTestId('a11y-toggle-highlight-links'));
    expect(useAccessibilityStore.getState().highlightLinks).toBe(true);

    await userEvent.click(screen.getByTestId('a11y-toggle-pause-animations'));
    expect(useAccessibilityStore.getState().pauseAnimations).toBe(true);

    await userEvent.click(screen.getByTestId('a11y-toggle-big-cursor'));
    expect(useAccessibilityStore.getState().bigCursor).toBe(true);
  });

  it('resets all preferences when "Redefinir" is clicked', async () => {
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
