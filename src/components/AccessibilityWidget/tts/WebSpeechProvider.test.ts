/* eslint-disable no-undef -- mesma limitação do source: tipos DOM
   (SpeechSynthesis, SpeechSynthesisVoice) só são vistos pelo TS. */
import { WebSpeechProvider } from './WebSpeechProvider';

class MockUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

const buildSynth = (
  voices: Partial<SpeechSynthesisVoice>[] = []
): SpeechSynthesis => {
  const listeners: Record<string, ((e: Event) => void)[]> = {};
  return {
    speak: jest.fn((utterance: MockUtterance) => {
      // Simula start/end imediatos
      utterance.onstart?.();
      utterance.onend?.();
    }),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: () => voices as SpeechSynthesisVoice[],
    addEventListener: (type: string, fn: (e: Event) => void) => {
      listeners[type] = [...(listeners[type] ?? []), fn];
    },
    removeEventListener: (type: string, fn: (e: Event) => void) => {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null,
    dispatchEvent: () => true,
  } as unknown as SpeechSynthesis;
};

describe('WebSpeechProvider', () => {
  let originalUtterance: typeof globalThis.SpeechSynthesisUtterance;

  beforeAll(() => {
    originalUtterance = globalThis.SpeechSynthesisUtterance;
    (
      globalThis as unknown as { SpeechSynthesisUtterance: unknown }
    ).SpeechSynthesisUtterance = MockUtterance;
  });

  afterAll(() => {
    (
      globalThis as unknown as { SpeechSynthesisUtterance: unknown }
    ).SpeechSynthesisUtterance = originalUtterance;
  });

  it('reports unsupported when synth is not available', () => {
    const provider = new WebSpeechProvider(null);
    expect(provider.isSupported()).toBe(false);
  });

  it('reports supported when synth is available', () => {
    const provider = new WebSpeechProvider(buildSynth());
    expect(provider.isSupported()).toBe(true);
  });

  it('returns the list of voices from the synth', async () => {
    const provider = new WebSpeechProvider(
      buildSynth([
        {
          voiceURI: 'v1',
          name: 'Voz pt-BR',
          lang: 'pt-BR',
          localService: true,
        },
        {
          voiceURI: 'v2',
          name: 'Voice en-US',
          lang: 'en-US',
          localService: false,
        },
      ])
    );
    const voices = await provider.getVoices();
    expect(voices).toEqual([
      { id: 'v1', name: 'Voz pt-BR', lang: 'pt-BR', isLocal: true },
      { id: 'v2', name: 'Voice en-US', lang: 'en-US', isLocal: false },
    ]);
  });

  it('cancels current speech and starts a new utterance with options', () => {
    const synth = buildSynth([
      { voiceURI: 'v1', name: 'Voz pt-BR', lang: 'pt-BR', localService: true },
    ]);
    const provider = new WebSpeechProvider(synth);
    const onStart = jest.fn();
    const onEnd = jest.fn();

    provider.speak('olá', { rate: 1.5, voiceId: 'v1' }, { onStart, onEnd });

    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.speak).toHaveBeenCalledTimes(1);
    const utterance = (synth.speak as jest.Mock).mock.calls[0][0];
    expect(utterance.text).toBe('olá');
    expect(utterance.rate).toBe(1.5);
    expect(onStart).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();
  });

  it('skips empty text', () => {
    const synth = buildSynth();
    const provider = new WebSpeechProvider(synth);
    provider.speak('   ');
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it('forwards pause/resume/stop to the synth', () => {
    const synth = buildSynth();
    const provider = new WebSpeechProvider(synth);
    provider.pause();
    provider.resume();
    provider.stop();
    expect(synth.pause).toHaveBeenCalled();
    expect(synth.resume).toHaveBeenCalled();
    expect(synth.cancel).toHaveBeenCalled();
  });

  it('reports error via onError when synth is missing', () => {
    const provider = new WebSpeechProvider(null);
    const onError = jest.fn();
    provider.speak('olá', undefined, { onError });
    expect(onError).toHaveBeenCalledWith(expect.any(String));
  });
});
