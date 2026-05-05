import { useMemo, type ReactElement } from 'react';
import {
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  StopIcon,
} from '@phosphor-icons/react';
import Button from '../Button/Button';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { useTTS } from '../../hooks/useTTS';

const TTS_SEGMENTED: { value: 'off' | 'click-to-read'; label: string }[] = [
  { value: 'off', label: 'Desligado' },
  { value: 'click-to-read', label: 'Clique para ler' },
];

const RATE_OPTIONS = [
  { value: '0.75', label: 'Lento' },
  { value: '1', label: 'Normal' },
  { value: '1.25', label: 'Rápido' },
  { value: '1.5', label: 'Muito rápido' },
];

export interface TTSSectionProps {
  /** Reaproveita o componente de segmented do painel principal */
  Segmented: <T extends string | number>(props: {
    value: T;
    options: { value: T; label: string }[];
    ariaLabel: string;
    onChange: (value: T) => void;
  }) => ReactElement;
}

/**
 * Bloco de controles do leitor de texto dentro do painel.
 * Exibe estado da síntese, seletor de voz, velocidade e botões
 * de play/pause/stop conforme o status atual.
 */
export default function TTSSection({ Segmented }: Readonly<TTSSectionProps>) {
  const ttsMode = useAccessibilityStore((s) => s.ttsMode);
  const ttsStatus = useAccessibilityStore((s) => s.ttsStatus);
  const ttsRate = useAccessibilityStore((s) => s.ttsRate);
  const ttsVoiceId = useAccessibilityStore((s) => s.ttsVoiceId);
  const setTTSMode = useAccessibilityStore((s) => s.setTTSMode);
  const setTTSRate = useAccessibilityStore((s) => s.setTTSRate);
  const setTTSVoiceId = useAccessibilityStore((s) => s.setTTSVoiceId);

  const {
    isSupported,
    voices,
    hasPortugueseVoice,
    speak,
    pause,
    resume,
    stop,
  } = useTTS();

  // Preferimos vozes em português; demais ficam ao final.
  const sortedVoices = useMemo(() => {
    return [...voices].sort((a, b) => {
      const aPt = a.lang.toLowerCase().startsWith('pt') ? 0 : 1;
      const bPt = b.lang.toLowerCase().startsWith('pt') ? 0 : 1;
      if (aPt !== bPt) return aPt - bPt;
      return a.name.localeCompare(b.name);
    });
  }, [voices]);

  if (!isSupported) {
    return (
      <Text size="2xs" className="text-text-600">
        Síntese de voz não está disponível neste navegador.
      </Text>
    );
  }

  const handleReadSelection = () => {
    const selection = globalThis.getSelection?.()?.toString().trim();
    if (selection) speak(selection);
  };

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        ariaLabel="Modo do leitor de texto"
        value={ttsMode === 'read-selection' ? 'off' : ttsMode}
        options={TTS_SEGMENTED}
        onChange={(v) => setTTSMode(v as 'off' | 'click-to-read')}
      />

      {!hasPortugueseVoice && (
        <Text size="2xs" className="text-warning-700">
          Nenhuma voz em português foi encontrada no seu sistema. A leitura será
          feita com a voz padrão disponível.
        </Text>
      )}

      <div className="flex flex-col gap-1">
        <Text size="2xs" className="text-text-700">
          Voz
        </Text>
        <select
          value={ttsVoiceId ?? ''}
          onChange={(e) => setTTSVoiceId(e.target.value || null)}
          aria-label="Voz da síntese de fala"
          data-testid="a11y-tts-voice-select"
          className={cn(
            'w-full rounded-md border border-background-300 bg-background',
            'px-2 py-1.5 text-sm text-text-900',
            'focus:outline-none focus:ring-2 focus:ring-info-500'
          )}
        >
          <option value="">Padrão do navegador</option>
          {sortedVoices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.lang}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <Text size="2xs" className="text-text-700">
          Velocidade
        </Text>
        <Segmented
          ariaLabel="Velocidade da fala"
          value={String(ttsRate)}
          options={RATE_OPTIONS}
          onChange={(v) => setTTSRate(Number(v))}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          action="secondary"
          size="small"
          iconLeft={
            <SpeakerHighIcon size={14} weight="bold" aria-hidden="true" />
          }
          onClick={handleReadSelection}
          data-testid="a11y-tts-read-selection"
        >
          Ler seleção
        </Button>

        {ttsStatus === 'speaking' && (
          <Button
            variant="outline"
            action="secondary"
            size="small"
            iconLeft={<PauseIcon size={14} weight="bold" aria-hidden="true" />}
            onClick={pause}
            data-testid="a11y-tts-pause"
          >
            Pausar
          </Button>
        )}

        {ttsStatus === 'paused' && (
          <Button
            variant="outline"
            action="secondary"
            size="small"
            iconLeft={<PlayIcon size={14} weight="bold" aria-hidden="true" />}
            onClick={resume}
            data-testid="a11y-tts-resume"
          >
            Retomar
          </Button>
        )}

        {ttsStatus !== 'idle' && (
          <Button
            variant="outline"
            action="negative"
            size="small"
            iconLeft={<StopIcon size={14} weight="bold" aria-hidden="true" />}
            onClick={stop}
            data-testid="a11y-tts-stop"
            className="ml-auto"
          >
            Parar
          </Button>
        )}
      </div>
    </div>
  );
}
