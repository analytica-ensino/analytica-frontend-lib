import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TTSController from './TTSController';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../../store/accessibilityStore';

const speakMock = jest.fn();
const stopMock = jest.fn();
let isSupportedReturn = true;

// Mocka o useTTS para isolar o TTSController do provider real.
jest.mock('../../hooks/useTTS', () => ({
  useTTS: () => ({
    isSupported: isSupportedReturn,
    voices: [],
    hasPortugueseVoice: false,
    speak: speakMock,
    pause: jest.fn(),
    resume: jest.fn(),
    stop: stopMock,
  }),
}));

describe('TTSController', () => {
  beforeEach(() => {
    speakMock.mockClear();
    stopMock.mockClear();
    isSupportedReturn = true;
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
      ttsStatus: 'idle',
    });
  });

  afterEach(() => {
    document
      .querySelectorAll('.a11y-tts-target')
      .forEach((el) => el.classList.remove('a11y-tts-target'));
  });

  it('renders nothing visible (returns null)', () => {
    const { container } = render(<TTSController />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not attach click handler when ttsMode is off', () => {
    render(<TTSController />);
    const target = document.createElement('p');
    target.innerText = 'qualquer texto';
    document.body.appendChild(target);

    act(() => {
      target.click();
    });

    expect(speakMock).not.toHaveBeenCalled();
    target.remove();
  });

  it('reads element text on click when ttsMode is click-to-read', () => {
    useAccessibilityStore.setState({ ttsMode: 'click-to-read' });
    render(<TTSController />);

    const p = document.createElement('p');
    p.innerText = 'olá leitor';
    document.body.appendChild(p);

    act(() => {
      p.click();
    });

    expect(speakMock).toHaveBeenCalledWith('olá leitor');
    expect(p.classList.contains('a11y-tts-target')).toBe(true);
    p.remove();
  });

  it('prefers aria-label over innerText when present', () => {
    useAccessibilityStore.setState({ ttsMode: 'click-to-read' });
    render(<TTSController />);

    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Fechar diálogo');
    btn.innerText = 'X';
    document.body.appendChild(btn);

    act(() => {
      btn.click();
    });

    expect(speakMock).toHaveBeenCalledWith('Fechar diálogo');
    btn.remove();
  });

  it('ignores clicks inside the widget shield', () => {
    useAccessibilityStore.setState({ ttsMode: 'click-to-read' });
    render(<TTSController />);

    const wrapper = document.createElement('div');
    wrapper.className = 'a11y-widget-shield';
    const child = document.createElement('button');
    child.innerText = 'Botão do widget';
    wrapper.appendChild(child);
    document.body.appendChild(wrapper);

    act(() => {
      child.click();
    });

    expect(speakMock).not.toHaveBeenCalled();
    wrapper.remove();
  });

  it('removes the highlight class when ttsStatus returns to idle', () => {
    useAccessibilityStore.setState({ ttsMode: 'click-to-read' });
    render(<TTSController />);

    const p = document.createElement('p');
    p.innerText = 'texto';
    document.body.appendChild(p);

    act(() => {
      p.click();
    });
    expect(p.classList.contains('a11y-tts-target')).toBe(true);

    act(() => {
      useAccessibilityStore.getState().setTTSStatus('speaking');
    });
    act(() => {
      useAccessibilityStore.getState().setTTSStatus('idle');
    });
    expect(p.classList.contains('a11y-tts-target')).toBe(false);
    p.remove();
  });

  it('stops in-progress speech when ttsMode leaves click-to-read', () => {
    useAccessibilityStore.setState({ ttsMode: 'click-to-read' });
    render(<TTSController />);

    const p = document.createElement('p');
    p.innerText = 'texto';
    document.body.appendChild(p);

    act(() => {
      p.click();
    });
    expect(speakMock).toHaveBeenCalled();

    // Usuário desliga o modo — fala em andamento deve ser interrompida
    act(() => {
      useAccessibilityStore.getState().setTTSMode('off');
    });
    expect(stopMock).toHaveBeenCalled();
    p.remove();
  });

  it('does not attach the click handler when synthesis is unsupported', () => {
    isSupportedReturn = false;
    useAccessibilityStore.setState({ ttsMode: 'click-to-read' });
    render(<TTSController />);

    const p = document.createElement('p');
    p.innerText = 'texto';
    document.body.appendChild(p);

    act(() => {
      p.click();
    });
    expect(speakMock).not.toHaveBeenCalled();
    p.remove();
  });
});
