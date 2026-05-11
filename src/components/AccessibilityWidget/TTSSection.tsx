import { useMemo, type ReactElement, type ReactNode } from 'react';
import { PauseIcon, PlayIcon, StopIcon } from '@phosphor-icons/react';
import Button from '../Button/Button';
import Text from '../Text/Text';
import Select, {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../Select/Select';
import AccessibilityToggleRow from './AccessibilityToggleRow';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { useTTS } from '../../hooks/useTTS';

/**
 * Opções de velocidade da fala. O `preview` mostra o valor numérico
 * dentro do botão (1.0, 1.25, etc.) e o `label` aparece como caption
 * abaixo. Valores escolhidos para casarem com o que o Web Speech API
 * aceita (0.5–2.0) — `0.75` foi mantido para "Lento" em vez de algo
 * mais agressivo porque vozes nativas ficam ininteligíveis abaixo disso.
 */
const RATE_OPTIONS: {
  value: string;
  label: string;
  preview: ReactNode;
}[] = [
  { value: '0.75', label: 'Lento', preview: '0.75' },
  { value: '1', label: 'Normal', preview: '1.0' },
  { value: '1.25', label: 'Rápido', preview: '1.25' },
  { value: '2', label: 'Muito rápido', preview: '2.0' },
];

export interface TTSSectionProps {
  /** Componente de segmented com preview visual + label abaixo */
  PreviewSegmented: <T extends string | number>(props: {
    value: T;
    options: { value: T; label: string; preview: ReactNode }[];
    ariaLabel: string;
    onChange: (value: T) => void;
  }) => ReactElement;
}

/**
 * Bloco de controles do leitor de texto dentro do painel.
 * Estrutura segue o design do Figma:
 *  1. "Texto para voz" — toggle que ativa/desativa o modo click-to-read
 *  2. "Voz" — seletor de voz
 *  3. "Velocidade" — PreviewSegmented com valor numérico
 */
export default function TTSSection({
  PreviewSegmented,
}: Readonly<TTSSectionProps>) {
  const ttsMode = useAccessibilityStore((s) => s.ttsMode);
  const ttsStatus = useAccessibilityStore((s) => s.ttsStatus);
  const ttsRate = useAccessibilityStore((s) => s.ttsRate);
  const ttsVoiceId = useAccessibilityStore((s) => s.ttsVoiceId);
  const setTTSMode = useAccessibilityStore((s) => s.setTTSMode);
  const setTTSRate = useAccessibilityStore((s) => s.setTTSRate);
  const setTTSVoiceId = useAccessibilityStore((s) => s.setTTSVoiceId);

  const { isSupported, voices, hasPortugueseVoice, pause, resume, stop } =
    useTTS();

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

  const isClickToReadOn = ttsMode === 'click-to-read';

  return (
    <div className="flex flex-col gap-6">
      {/* Texto para voz: toggle row */}
      <div className="flex flex-col gap-2">
        <Text
          size="xs"
          weight="medium"
          className="uppercase leading-none text-text-600"
        >
          Texto para voz
        </Text>
        <AccessibilityToggleRow
          label="Ative a leitura e clique no texto para ouvir"
          rowTestId="a11y-tts-mode-toggle"
          checked={isClickToReadOn}
          onChange={() => setTTSMode(isClickToReadOn ? 'off' : 'click-to-read')}
        />
      </div>

      {!hasPortugueseVoice && (
        <Text size="2xs" className="text-warning-700">
          Nenhuma voz em português foi encontrada no seu sistema. A leitura será
          feita com a voz padrão disponível.
        </Text>
      )}

      {/* Voz: pill select */}
      <div className="flex flex-col gap-2">
        <Text
          size="xs"
          weight="medium"
          className="uppercase leading-none text-text-600"
        >
          Voz
        </Text>
        <Select
          size="small"
          value={ttsVoiceId ?? ''}
          onValueChange={(value) => setTTSVoiceId(value || null)}
        >
          <SelectTrigger
            variant="rounded"
            aria-label="Voz da síntese de fala"
            data-testid="a11y-tts-voice-select"
          >
            <SelectValue placeholder="Padrão do navegador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Padrão do navegador</SelectItem>
            {sortedVoices.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name} — {v.lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Velocidade: preview segmented com valor numérico no botão */}
      <div className="flex flex-col gap-2">
        <Text
          size="xs"
          weight="medium"
          className="uppercase leading-none text-text-600"
        >
          Velocidade
        </Text>
        <PreviewSegmented
          ariaLabel="Velocidade da fala"
          value={String(ttsRate)}
          options={RATE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
            preview: (
              <span className="text-base font-bold leading-none">
                {opt.preview}
              </span>
            ),
          }))}
          onChange={(v) => setTTSRate(Number(v))}
        />
      </div>

      {/* Ações: pause/resume/stop conforme status — só visíveis durante a fala */}
      {ttsStatus !== 'idle' && (
        <div className="flex items-center gap-2">
          {ttsStatus === 'speaking' && (
            <Button
              variant="outline"
              action="secondary"
              size="small"
              iconLeft={
                <PauseIcon size={14} weight="bold" aria-hidden="true" />
              }
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
        </div>
      )}
    </div>
  );
}
