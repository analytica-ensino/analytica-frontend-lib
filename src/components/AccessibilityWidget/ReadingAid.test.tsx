import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadingAid from './ReadingAid';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../../store/accessibilityStore';

const fireMouseMove = (clientY: number) => {
  act(() => {
    document.dispatchEvent(
      new MouseEvent('mousemove', { clientY, bubbles: true })
    );
    // requestAnimationFrame só dispara em next frame; em jsdom isso é
    // aproximado por setTimeout. Forçamos avanço com flushPromises.
  });
};

describe('ReadingAid', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
    });
  });

  it('renders nothing when readingAid is none', () => {
    render(<ReadingAid />);
    expect(screen.queryByTestId('a11y-reading-ruler')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('a11y-reading-mask-top')
    ).not.toBeInTheDocument();
  });

  it('renders the ruler after a mousemove when readingAid is ruler', async () => {
    useAccessibilityStore.setState({ readingAid: 'ruler' });
    render(<ReadingAid />);

    fireMouseMove(300);
    // dois rAF (interno + render) antes do elemento aparecer
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    expect(screen.getByTestId('a11y-reading-ruler')).toBeInTheDocument();
  });

  it('renders the mask after a mousemove when readingAid is mask', async () => {
    useAccessibilityStore.setState({ readingAid: 'mask' });
    render(<ReadingAid />);

    fireMouseMove(400);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    expect(screen.getByTestId('a11y-reading-mask-top')).toBeInTheDocument();
    expect(screen.getByTestId('a11y-reading-mask-bottom')).toBeInTheDocument();
  });

  it('detaches the listener and unmounts when readingAid returns to none', async () => {
    useAccessibilityStore.setState({ readingAid: 'ruler' });
    render(<ReadingAid />);

    fireMouseMove(300);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(screen.getByTestId('a11y-reading-ruler')).toBeInTheDocument();

    act(() => {
      useAccessibilityStore.getState().setReadingAid('none');
    });
    expect(screen.queryByTestId('a11y-reading-ruler')).not.toBeInTheDocument();
  });
});
