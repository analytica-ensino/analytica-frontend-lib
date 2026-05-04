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

    await userEvent.click(screen.getByRole('radio', { name: 'Alto' }));
    expect(
      document.documentElement.classList.contains('a11y-contrast-high')
    ).toBe(true);

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
});
