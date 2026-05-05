/* eslint-disable no-undef -- DOM lib types (SpeechSynthesis, SpeechSynthesisVoice)
   são reconhecidas pelo TypeScript mas não pelo `globals.browser` do ESLint. */
import type {
  TTSProvider,
  TTSProviderEvents,
  TTSSpeakOptions,
  TTSVoice,
} from './types';

/**
 * Provider default usando a Web Speech API (`window.speechSynthesis`).
 *
 * Notas de compatibilidade:
 * - Disponível em Chrome, Edge, Firefox, Safari e iOS, mas a qualidade
 *   das vozes varia muito por SO.
 * - Em Safari/iOS, `getVoices()` é assíncrono — voltamos vazio na
 *   primeira chamada e populamos no evento `voiceschanged`. O método
 *   `getVoices()` deste provider já trata isso retornando uma `Promise`.
 * - Em alguns SOs não há voz pt-BR pré-instalada — chamadores devem
 *   exibir um aviso quando `getVoices()` não retornar voz nesse idioma.
 */
export class WebSpeechProvider implements TTSProvider {
  private readonly synth: SpeechSynthesis | null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor(synth: SpeechSynthesis | null = getSynth()) {
    this.synth = synth;
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  async getVoices(): Promise<TTSVoice[]> {
    if (!this.synth) return [];

    const synth = this.synth;
    const collect = (): TTSVoice[] =>
      synth.getVoices().map((v) => ({
        id: v.voiceURI,
        name: v.name,
        lang: v.lang,
        isLocal: v.localService,
      }));

    const initial = collect();
    if (initial.length > 0) return initial;

    // Safari/iOS: vozes carregam de forma assíncrona via 'voiceschanged'.
    return new Promise<TTSVoice[]>((resolve) => {
      const onChange = () => {
        synth.removeEventListener('voiceschanged', onChange);
        resolve(collect());
      };
      synth.addEventListener('voiceschanged', onChange);
      // Fallback: timeout para ambientes que nunca disparam o evento.
      setTimeout(() => {
        synth.removeEventListener('voiceschanged', onChange);
        resolve(collect());
      }, 1500);
    });
  }

  speak(
    text: string,
    options: TTSSpeakOptions = {},
    events: TTSProviderEvents = {}
  ): void {
    if (!this.synth) {
      events.onError?.('Síntese de voz não disponível neste navegador.');
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;

    // Cancela qualquer fala em andamento (evita fila acumulando).
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;

    // Resolução de voz/idioma:
    // 1. Se o usuário escolheu uma voz, usa ela e o `lang` dela
    //    (para evitar mismatch — voz en-US com utterance.lang='pt-BR'
    //    causa silêncio em alguns browsers).
    // 2. Se não escolheu mas pediu um lang específico via options,
    //    procuramos uma voz que cubra esse lang. Se não houver,
    //    deixamos `lang` em branco para o browser usar a voz default.
    const allVoices = this.synth.getVoices();
    let chosenVoice: SpeechSynthesisVoice | undefined;
    if (options.voiceId) {
      chosenVoice = allVoices.find((v) => v.voiceURI === options.voiceId);
    } else if (options.lang) {
      chosenVoice = allVoices.find((v) =>
        v.lang.toLowerCase().startsWith(options.lang!.toLowerCase())
      );
    }
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    }

    utterance.onstart = () => events.onStart?.();
    utterance.onend = () => {
      this.currentUtterance = null;
      events.onEnd?.();
    };
    utterance.onpause = () => events.onPause?.();
    utterance.onresume = () => events.onResume?.();
    utterance.onerror = (event) => {
      this.currentUtterance = null;
      events.onError?.(event.error || 'Erro desconhecido na síntese.');
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause(): void {
    this.synth?.pause();
  }

  resume(): void {
    this.synth?.resume();
  }

  stop(): void {
    this.synth?.cancel();
    this.currentUtterance = null;
  }
}

const getSynth = (): SpeechSynthesis | null => {
  if (typeof globalThis === 'undefined') return null;
  const synth = (globalThis as unknown as { speechSynthesis?: SpeechSynthesis })
    .speechSynthesis;
  return synth ?? null;
};
