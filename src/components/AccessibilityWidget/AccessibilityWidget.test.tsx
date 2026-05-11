import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AccessibilityWidget from './AccessibilityWidget';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../../store/accessibilityStore';

describe('AccessibilityWidget', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
    });
    document.documentElement.className = '';
  });

  it('renders the FAB when the panel is closed', () => {
    render(<AccessibilityWidget />);
    expect(screen.getByTestId('accessibility-fab')).toBeInTheDocument();
    expect(screen.queryByTestId('accessibility-panel')).not.toBeInTheDocument();
  });

  it('opens the panel and hides the FAB when the FAB is clicked', async () => {
    render(<AccessibilityWidget />);
    await userEvent.click(screen.getByTestId('accessibility-fab'));

    expect(screen.queryByTestId('accessibility-fab')).not.toBeInTheDocument();
    expect(screen.getByTestId('accessibility-panel')).toBeInTheDocument();
  });

  it('closes the panel via the close button', async () => {
    useAccessibilityStore.setState({ isPanelOpen: true });
    render(<AccessibilityWidget />);

    await userEvent.click(
      screen.getByRole('button', { name: /fechar opções de acessibilidade/i })
    );
    expect(useAccessibilityStore.getState().isPanelOpen).toBe(false);
  });

  it('applies a11y classes to the document element when preferences change', async () => {
    render(<AccessibilityWidget />);
    await userEvent.click(screen.getByTestId('accessibility-fab'));

    // Sections viraram accordions colapsadas — precisa expandir antes
    await userEvent.click(screen.getByTestId('a11y-section-vision'));
    await userEvent.click(screen.getByRole('radio', { name: 'Alto' }));
    expect(
      document.documentElement.classList.contains('a11y-contrast-high')
    ).toBe(true);

    await userEvent.click(screen.getByTestId('a11y-section-navigation'));
    await userEvent.click(screen.getByTestId('a11y-toggle-big-cursor'));
    expect(document.documentElement.classList.contains('a11y-big-cursor')).toBe(
      true
    );
  });

  it('forwards the position prop to the FAB', () => {
    render(<AccessibilityWidget position="left" />);
    const fab = screen.getByTestId('accessibility-fab');
    expect(fab.className).toMatch(/left-0/);
  });

  describe('Libras integration', () => {
    afterEach(() => {
      // O VLibrasLoader injeta DOM no <body>; limpa entre os testes
      document.getElementById('a11y-vlibras-wrapper')?.remove();
      document.getElementById('a11y-vlibras-script')?.remove();
    });

    it('renders the LibrasFab by default', () => {
      render(<AccessibilityWidget />);
      expect(screen.getByTestId('libras-fab')).toBeInTheDocument();
    });

    it('hides the LibrasFab when showLibras is false', () => {
      render(<AccessibilityWidget showLibras={false} />);
      expect(screen.queryByTestId('libras-fab')).not.toBeInTheDocument();
    });

    it('first click on LibrasFab activates VLibras (sets librasEnabled)', async () => {
      render(<AccessibilityWidget />);
      expect(useAccessibilityStore.getState().librasEnabled).toBe(false);

      await userEvent.click(screen.getByTestId('libras-fab'));
      expect(useAccessibilityStore.getState().librasEnabled).toBe(true);
    });

    it('subsequent click delegates to the VLibras native access button', async () => {
      // Pré-condição: librasEnabled true e access-button presente no DOM
      useAccessibilityStore.setState({ librasEnabled: true });
      const accessBtn = document.createElement('div');
      accessBtn.setAttribute('vw-access-button', '');
      const accessClick = jest.fn();
      accessBtn.addEventListener('click', accessClick);
      document.body.appendChild(accessBtn);

      render(<AccessibilityWidget />);
      await userEvent.click(screen.getByTestId('libras-fab'));

      expect(accessClick).toHaveBeenCalled();
      // librasEnabled NÃO muda — só toggla via click no botão nativo
      expect(useAccessibilityStore.getState().librasEnabled).toBe(true);

      accessBtn.remove();
    });
  });
});
