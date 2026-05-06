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

  it('removes the wrapper when librasEnabled returns to false', () => {
    render(<VLibrasLoader />);

    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(true);
    });
    expect(document.getElementById(WRAPPER_ID)).toBeInTheDocument();

    act(() => {
      useAccessibilityStore.getState().setLibrasEnabled(false);
    });
    expect(document.getElementById(WRAPPER_ID)).not.toBeInTheDocument();
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
});
