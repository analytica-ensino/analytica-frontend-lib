import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { WebSpeechProvider } from '../components/AccessibilityWidget/tts/WebSpeechProvider';
import type {
  TTSProvider,
  TTSVoice,
} from '../components/AccessibilityWidget/tts/types';

export interface UseTTSReturn {
  /** Indica se a síntese de voz está disponível neste navegador */
  isSupported: boolean;
  /** Vozes carregadas do provider (resolvidas após o primeiro mount) */
  voices: TTSVoice[];
  /**
   * Indica se há ao menos uma voz pt-BR/pt disponível. Útil para
   * mostrar aviso quando o usuário do SO não tem vozes em português.
   */
  hasPortugueseVoice: boolean;
  /** Lê o texto informado, respeitando rate/voiceId do store. */
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

/**
 * Hook que liga o `TTSProvider` (default: `WebSpeechProvider`) ao store
 * de acessibilidade — propaga eventos do provider para `ttsStatus` e
 * fornece comandos `speak/pause/resume/stop` que já aplicam as
 * preferências persistidas (`ttsRate`, `ttsVoiceId`).
 *
 * Aceita um provider custom para casos de TTS via backend (Azure,
 * Google etc.) sem alterar a UI.
 */
export const useTTS = (providerOverride?: TTSProvider | null): UseTTSReturn => {
  const setTTSStatus = useAccessibilityStore((s) => s.setTTSStatus);
  const ttsRate = useAccessibilityStore((s) => s.ttsRate);
  const ttsVoiceId = useAccessibilityStore((s) => s.ttsVoiceId);

  // Garante uma única instância do provider durante o ciclo de vida do hook.
  const provider = useMemo<TTSProvider>(
    () => providerOverride ?? new WebSpeechProvider(),
    [providerOverride]
  );

  const [voices, setVoices] = useState<TTSVoice[]>([]);

  // Mantemos as preferências em refs para que callbacks de eventos
  // (onstart/onend) leiam sempre o valor mais recente sem precisar
  // recriar o handler — evita resetar a fala quando o usuário ajusta
  // a velocidade no painel.
  const rateRef = useRef(ttsRate);
  const voiceIdRef = useRef(ttsVoiceId);
  rateRef.current = ttsRate;
  voiceIdRef.current = ttsVoiceId;

  /**
   * Marca se ESTA instância de `useTTS` foi quem iniciou a fala atual.
   *
   * Necessário porque vários componentes podem chamar `useTTS()`
   * independentemente (TTSController, TTSSection) e cada um cria seu
   * próprio `WebSpeechProvider`, mas todos compartilham o mesmo
   * `window.speechSynthesis` global. O `cancel()` é global — então,
   * sem essa guarda, o cleanup de uma instância (ex.: TTSSection
   * desmontando ao fechar o painel) cancelaria fala iniciada por outra
   * (ex.: click-to-read em andamento no TTSController).
   */
  const isActiveSpeakerRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    if (provider.isSupported()) {
      provider
        .getVoices()
        .then((list) => {
          if (mounted) setVoices(list);
        })
        .catch(() => undefined);
    }
    return () => {
      mounted = false;
      // Só interrompe a síntese se foi essa instância que a iniciou.
      // Caso contrário, deixa o synth global em paz — outras instâncias
      // podem estar usando.
      if (isActiveSpeakerRef.current) {
        provider.stop();
        setTTSStatus('idle');
        isActiveSpeakerRef.current = false;
      }
    };
  }, [provider, setTTSStatus]);

  const hasPortugueseVoice = voices.some((v) =>
    v.lang.toLowerCase().startsWith('pt')
  );

  /**
   * IMPORTANTE: as funções abaixo são memoizadas com `useCallback` porque
   * são frequentemente passadas para `useEffect` deps em consumidores
   * (TTSController, etc.). Sem memoização, as referências mudam a cada
   * render e disparam cleanups indesejados — incluindo o `stop()` que
   * cancela a fala recém-iniciada (sintoma: ícone de áudio acende na aba
   * do browser mas você não ouve nada).
   */
  const speak = useCallback(
    (text: string) => {
      isActiveSpeakerRef.current = true;
      provider.speak(
        text,
        {
          rate: rateRef.current,
          voiceId: voiceIdRef.current ?? undefined,
          // Não fixamos `lang: 'pt-BR'` aqui — em sistemas sem voz pt-BR
          // instalada, o browser fica tentando achar uma e nunca emite
          // áudio. O provider usa o `voice.lang` quando há voz escolhida.
        },
        {
          onStart: () => setTTSStatus('speaking'),
          onEnd: () => {
            isActiveSpeakerRef.current = false;
            setTTSStatus('idle');
          },
          onPause: () => setTTSStatus('paused'),
          onResume: () => setTTSStatus('speaking'),
          onError: () => {
            isActiveSpeakerRef.current = false;
            setTTSStatus('idle');
          },
        }
      );
    },
    [provider, setTTSStatus]
  );

  const pause = useCallback(() => {
    provider.pause();
    setTTSStatus('paused');
  }, [provider, setTTSStatus]);

  const resume = useCallback(() => {
    provider.resume();
    setTTSStatus('speaking');
  }, [provider, setTTSStatus]);

  const stop = useCallback(() => {
    isActiveSpeakerRef.current = false;
    provider.stop();
    setTTSStatus('idle');
  }, [provider, setTTSStatus]);

  return {
    isSupported: provider.isSupported(),
    voices,
    hasPortugueseVoice,
    speak,
    pause,
    resume,
    stop,
  };
};
