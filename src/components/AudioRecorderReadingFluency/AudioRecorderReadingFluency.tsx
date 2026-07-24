import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn, formatTimeSpent } from '../../utils/utils';
import { useStreamSpectrum } from '../../hooks/useStreamSpectrum';
import { ButtonPapole } from '../Button/Button';
import { MicIconPapole, StopIconPapole } from '../PapoleIcons';

/** Métodos imperativos expostos via `ref` — pra dirigir a gravação externamente. */
export interface AudioRecorderPapoleHandle {
  /** Pede o microfone e começa a gravar (resolve quando o mic é concedido). */
  start: () => Promise<void>;
  /** Para de gravar, desliga o mic e emite o áudio via `onRecordingComplete`. */
  stop: () => void;
}

export interface AudioRecorderPapoleProps {
  /** Número de barras do equalizador. Default: 13. */
  barCount?: number;
  /** Mostra o tempo decorrido (`HH:MM:SS`) enquanto grava. */
  showTime?: boolean;
  /** Rótulo do botão quando parado. Default: "Gravar". */
  startLabel?: string;
  /** Rótulo do botão enquanto grava. Default: "Parar". */
  stopLabel?: string;
  /**
   * `mimeType` passado ao `MediaRecorder` (ex.: `'audio/webm'`). Se omitido, o
   * navegador escolhe.
   */
  mimeType?: string;
  /** Esconde o botão embutido (pra dirigir só via `ref`). */
  hideButton?: boolean;
  /** Reporta início/fim da gravação (útil pra sincronizar UI externa). */
  onRecordingChange?: (recording: boolean) => void;
  /**
   * Recebe o áudio gravado ao parar: o `Blob` e um object URL pronto pra tocar.
   * **O consumidor é dono do `url`** — lembre de `URL.revokeObjectURL(url)`
   * quando não precisar mais.
   */
  onRecordingComplete?: (blob: Blob, url: string) => void;
  /** Falha ao acessar o microfone (permissão negada, sem device, etc.). */
  onError?: (error: unknown) => void;
  /** Classes extras no container. */
  className?: string;
}

// Faixa de altura (px) das barras enquanto reagem ao áudio.
const PAPOLE_MIXER_MIN_H = 8;
const PAPOLE_MIXER_MAX_H = 56;

// Barras de repouso: altura (px) em onda simétrica suave (mais alta no meio) e
// um `id` estável por posição pra usar como `key`.
const buildRestBars = (count: number): { id: string; height: number }[] =>
  Array.from({ length: count }, (_, index) => {
    const t = count > 1 ? index / (count - 1) : 0.5;
    return {
      id: `bar-${index}`,
      height: Math.round(14 + Math.sin(Math.PI * t) * 26), // ~14..40
    };
  });

/**
 * Gravador Papolê: as mesmas barras verdes do `AudioMixerPapole`, mas reagindo
 * **ao microfone ao vivo** (não a um áudio pronto). Um `ButtonPapole` alterna
 * entre "Gravar" e "Parar"; enquanto grava, as barras acompanham a fala e (com
 * `showTime`) o tempo sobe. Ao parar, o áudio capturado volta em
 * `onRecordingComplete(blob, url)` — pronto pra tocar no `AudioPlaybackModalPapole`.
 *
 * Também dá pra dirigir por um botão externo via `ref` (`start()`/`stop()`) +
 * `hideButton`. Usa `getUserMedia` (permissão do navegador) e Web Audio pra
 * visualização — o analyser não é roteado pro alto-falante (sem eco do mic).
 */
export const AudioRecorderPapole = forwardRef<
  AudioRecorderPapoleHandle,
  AudioRecorderPapoleProps
>(
  (
    {
      barCount = 13,
      showTime = false,
      startLabel = 'Gravar',
      stopLabel = 'Parar',
      mimeType,
      hideButton = false,
      onRecordingChange,
      onRecordingComplete,
      onError,
      className,
    },
    ref
  ) => {
    const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const [recording, setRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [elapsed, setElapsed] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const startTimeRef = useRef(0);

    const restBars = useMemo(() => buildRestBars(barCount), [barCount]);

    // Espelha o stream num ref só pra teardown no unmount (sem re-render).
    useEffect(() => {
      streamRef.current = stream;
    }, [stream]);

    // Escreve as alturas das barras direto no DOM (sem re-render a 60fps).
    const drawSpectrum = useCallback((values: number[]) => {
      for (let i = 0; i < values.length; i += 1) {
        const bar = barRefs.current[i];
        if (bar) {
          const height =
            PAPOLE_MIXER_MIN_H +
            values[i] * (PAPOLE_MIXER_MAX_H - PAPOLE_MIXER_MIN_H);
          bar.style.height = `${height}px`;
        }
      }
    }, []);

    useStreamSpectrum(stream, recording, { barCount, onFrame: drawSpectrum });

    // Ao parar, restaura as barras de repouso.
    useEffect(() => {
      if (recording) return;
      restBars.forEach((restBar, i) => {
        const bar = barRefs.current[i];
        if (bar) bar.style.height = `${restBar.height}px`;
      });
    }, [recording, restBars]);

    // Timer do tempo decorrido enquanto grava (só quando exibido).
    useEffect(() => {
      if (!recording || !showTime) return;
      const update = () =>
        setElapsed((performance.now() - startTimeRef.current) / 1000);
      update();
      const id = window.setInterval(update, 250);
      return () => clearInterval(id);
    }, [recording, showTime]);

    const stop = useCallback(() => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop(); // dispara onstop → monta o blob e chama onRecordingComplete
      }
      mediaRecorderRef.current = null;

      setStream((current) => {
        current?.getTracks().forEach((track) => track.stop());
        return null;
      });
      setRecording(false);
      onRecordingChange?.(false);
    }, [onRecordingChange]);

    const start = useCallback(async () => {
      // Ignora se já está gravando.
      if (mediaRecorderRef.current) return;

      const nav = typeof navigator !== 'undefined' ? navigator : undefined;
      if (!nav?.mediaDevices?.getUserMedia) {
        onError?.(new Error('getUserMedia indisponível neste ambiente'));
        return;
      }

      let micStream: MediaStream | null = null;
      try {
        micStream = await nav.mediaDevices.getUserMedia({ audio: true });

        const recorder = new MediaRecorder(
          micStream,
          mimeType ? { mimeType } : undefined
        );
        chunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });
          chunksRef.current = [];
          onRecordingComplete?.(blob, URL.createObjectURL(blob));
        };
        recorder.start();
        mediaRecorderRef.current = recorder;

        startTimeRef.current = performance.now();
        setElapsed(0);
        setStream(micStream);
        setRecording(true);
        onRecordingChange?.(true);
      } catch (error) {
        // Se algo falhou depois de abrir o mic, garante desligá-lo.
        micStream?.getTracks().forEach((track) => track.stop());
        onError?.(error);
      }
    }, [mimeType, onError, onRecordingChange, onRecordingComplete]);

    useImperativeHandle(ref, () => ({ start, stop }), [start, stop]);

    // Teardown no unmount: desliga mic/recorder sem emitir gravação truncada.
    useEffect(() => {
      return () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
          recorder.onstop = null;
          recorder.stop();
        }
        streamRef.current?.getTracks().forEach((track) => track.stop());
      };
    }, []);

    const toggle = () => {
      if (recording) stop();
      else void start();
    };

    return (
      <div
        className={cn(
          'font-quicksand inline-flex items-center gap-4',
          className
        )}
      >
        {/* Ponto pulsante indicando "gravando". */}
        {recording && (
          <span
            className="size-3 shrink-0 animate-pulse rounded-full bg-error-500"
            aria-hidden="true"
          />
        )}

        <div className="flex h-16 items-center gap-1" aria-hidden="true">
          {restBars.map((restBar, index) => (
            <span
              key={restBar.id}
              ref={(bar) => {
                barRefs.current[index] = bar;
              }}
              style={{ height: restBar.height }}
              className="w-1.5 rounded-full bg-secondary-500 transition-[height] duration-75 ease-out"
            />
          ))}
        </div>

        {showTime && (
          <span className="text-[16px] font-medium tabular-nums text-text-900">
            {formatTimeSpent(elapsed)}
          </span>
        )}

        {!hideButton && (
          <ButtonPapole
            type="button"
            size="medium"
            onClick={toggle}
            aria-pressed={recording}
            iconLeft={recording ? <StopIconPapole /> : <MicIconPapole />}
          >
            {recording ? stopLabel : startLabel}
          </ButtonPapole>
        )}
      </div>
    );
  }
);
AudioRecorderPapole.displayName = 'AudioRecorderPapole';
