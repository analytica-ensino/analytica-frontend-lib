import { renderHook, act, waitFor } from '@testing-library/react';
import { useTTS } from './useTTS';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../store/accessibilityStore';
import type { TTSProvider } from '../components/AccessibilityWidget/tts/types';

const buildProvider = (overrides: Partial<TTSProvider> = {}): TTSProvider => ({
  isSupported: () => true,
  getVoices: async () => [
    { id: 'pt', name: 'Voz pt-BR', lang: 'pt-BR', isLocal: true },
    { id: 'en', name: 'Voice en-US', lang: 'en-US', isLocal: true },
  ],
  speak: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  stop: jest.fn(),
  ...overrides,
});

describe('useTTS', () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
      ttsStatus: 'idle',
    });
  });

  it('reports support and exposes voices from the provider', async () => {
    const provider = buildProvider();
    const { result } = renderHook(() => useTTS(provider));

    await waitFor(() => {
      expect(result.current.voices.length).toBe(2);
    });

    expect(result.current.isSupported).toBe(true);
    expect(result.current.hasPortugueseVoice).toBe(true);
  });

  it('flags absence of portuguese voice', async () => {
    const provider = buildProvider({
      getVoices: async () => [
        { id: 'en', name: 'Voice en-US', lang: 'en-US', isLocal: true },
      ],
    });
    const { result } = renderHook(() => useTTS(provider));
    await waitFor(() => {
      expect(result.current.voices.length).toBe(1);
    });
    expect(result.current.hasPortugueseVoice).toBe(false);
  });

  it('forwards rate and voiceId from the store on speak', async () => {
    const speak = jest.fn();
    const provider = buildProvider({ speak });
    const { result } = renderHook(() => useTTS(provider));

    act(() => {
      useAccessibilityStore.getState().setTTSRate(1.5);
      useAccessibilityStore.getState().setTTSVoiceId('pt');
    });

    act(() => {
      result.current.speak('olá mundo');
    });

    expect(speak).toHaveBeenCalledTimes(1);
    const [, options] = speak.mock.calls[0];
    expect(options.rate).toBe(1.5);
    expect(options.voiceId).toBe('pt');
    // O hook não força mais `lang` — quem manda é a voz escolhida.
    // Forçar lang fixo causa silêncio em sistemas sem voz pt-BR.
    expect(options.lang).toBeUndefined();
  });

  it('updates ttsStatus on provider events', async () => {
    let onStartFn: (() => void) | undefined;
    let onEndFn: (() => void) | undefined;
    const provider = buildProvider({
      speak: (_text, _opts, events) => {
        onStartFn = events?.onStart;
        onEndFn = events?.onEnd;
      },
    });
    const { result } = renderHook(() => useTTS(provider));

    act(() => {
      result.current.speak('olá');
    });
    act(() => {
      onStartFn?.();
    });
    expect(useAccessibilityStore.getState().ttsStatus).toBe('speaking');

    act(() => {
      onEndFn?.();
    });
    expect(useAccessibilityStore.getState().ttsStatus).toBe('idle');
  });

  it('does not call provider.stop on unmount when this instance never spoke', () => {
    const provider = buildProvider();
    const { unmount } = renderHook(() => useTTS(provider));
    unmount();
    expect(provider.stop).not.toHaveBeenCalled();
  });

  it('stops on unmount only when this instance was the active speaker', () => {
    const provider = buildProvider();
    const { result, unmount } = renderHook(() => useTTS(provider));

    act(() => {
      result.current.speak('olá');
    });
    unmount();
    expect(provider.stop).toHaveBeenCalled();
  });

  it('pause/resume/stop update store status and call provider', async () => {
    const provider = buildProvider();
    const { result } = renderHook(() => useTTS(provider));

    act(() => result.current.pause());
    expect(useAccessibilityStore.getState().ttsStatus).toBe('paused');
    expect(provider.pause).toHaveBeenCalled();

    act(() => result.current.resume());
    expect(useAccessibilityStore.getState().ttsStatus).toBe('speaking');
    expect(provider.resume).toHaveBeenCalled();

    act(() => result.current.stop());
    expect(useAccessibilityStore.getState().ttsStatus).toBe('idle');
    expect(provider.stop).toHaveBeenCalled();
  });
});
