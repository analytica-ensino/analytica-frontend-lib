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
import { useAudioSpectrum } from '../../hooks/useAudioSpectrum';

/** Estado de reprodução do mixer. */
export type AudioMixerStatus = 'playing' | 'paused' | 'stopped';

/** Métodos imperativos expostos via `ref` — pra um botão externo dirigir o player. */
export interface AudioMixerPapoleHandle {
  /** Toca / continua de onde parou. */
  play: () => void;
  /** Pausa mantendo a posição. */
  pause: () => void;
  /** Para e volta ao início (00:00:00). */
  stop: () => void;
}

export interface AudioMixerPapoleProps {
  /** URL (ou blob URL) do áudio. */
  src?: string;
  /**
   * Alternativa a `src`: um arquivo/blob. Vira um object URL same-origin
   * internamente (criado/revogado pelo componente) — dispensa `crossOrigin`.
   */
  file?: File | Blob;
  /**
   * Controle declarativo de reprodução (pra um botão externo dirigir):
   * `'playing'` (toca/continua), `'paused'` (pausa mantendo a posição) ou
   * `'stopped'` (para e volta ao 00:00:00). Se **omitido**, use `autoPlay`
   * e/ou o `ref` imperativo (`play`/`pause`/`stop`).
   */
  status?: AudioMixerStatus;
  /**
   * Toca sozinho, sem interação. Tenta tocar ao carregar; se o navegador
   * bloquear (política de autoplay exige um gesto), começa no primeiro
   * clique/tecla na página. Ignorado quando `status` é controlado.
   */
  autoPlay?: boolean;
  /** Repete o áudio em loop. */
  loop?: boolean;
  /** Mostra o tempo (`HH:MM:SS`) à direita das barras. Sobe conforme toca. */
  showTime?: boolean;
  /** Número de barras do equalizador. Default: 13. */
  barCount?: number;
  /**
   * `crossOrigin` do `<audio>`. Necessário (`"anonymous"`) apenas p/ `src` de
   * **outra origem** — e o servidor precisa mandar CORS, senão o Web Audio
   * **muta** o áudio. `file` (same-origin) dispensa.
   */
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  /**
   * Reporta o estado real de reprodução (útil pra um botão externo trocar o
   * ícone play/pause). Dispara no play, pause, stop e fim do áudio.
   */
  onPlayingChange?: (playing: boolean) => void;
  /** Chamado quando o áudio termina (o tempo é resetado p/ 0). */
  onEnded?: () => void;
  /** Classes extras no container. */
  className?: string;
}

// Faixa de altura (px) das barras enquanto reagem ao áudio.
const PAPOLE_MIXER_MIN_H = 8;
const PAPOLE_MIXER_MAX_H = 56;

// Barras de repouso: altura (px) em onda simétrica suave (mais alta no meio) e
// um `id` estável por posição pra usar como `key` (a lista é fixa e nunca
// reordena, mas as alturas se repetem, então não servem de chave).
const buildRestBars = (count: number): { id: string; height: number }[] =>
  Array.from({ length: count }, (_, index) => {
    const t = count > 1 ? index / (count - 1) : 0.5;
    return {
      id: `bar-${index}`,
      height: Math.round(14 + Math.sin(Math.PI * t) * 26), // ~14..40
    };
  });

/**
 * Equalizador/"mixer" Papolê: barras verdes que **reagem a um áudio** (via `src`
 * ou `file`) enquanto ele toca, com um tempo `HH:MM:SS` opcional (`showTime`) que
 * sobe conforme o áudio anda.
 *
 * Reprodução pode ser dirigida por um **botão externo** de duas formas:
 * - **declarativa**: prop `status` (`'playing' | 'paused' | 'stopped'`);
 * - **imperativa**: `ref` com `play()` / `pause()` / `stop()`.
 *
 * A reação usa Web Audio (`useAudioSpectrum`). Áudio de **outra origem sem CORS**
 * fica mudo ao passar pelo analyser — prefira `file`/blob (same-origin) ou
 * `crossOrigin="anonymous"` + servidor com CORS.
 */
export const AudioMixerPapole = forwardRef<
  AudioMixerPapoleHandle,
  AudioMixerPapoleProps
>(
  (
    {
      src,
      file,
      status,
      autoPlay = false,
      loop = false,
      showTime = false,
      barCount = 13,
      crossOrigin,
      onPlayingChange,
      onEnded,
      className,
    },
    ref
  ) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
    // Estado real de reprodução (reflete play/pause de qualquer origem).
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

    const restBars = useMemo(() => buildRestBars(barCount), [barCount]);
    const resolvedSrc = objectUrl ?? src;

    // Ações de reprodução (estáveis) — usadas pelo ref e pelo controle via `status`.
    const play = useCallback(() => {
      audioRef.current?.play().catch(() => {});
    }, []);

    const pause = useCallback(() => {
      audioRef.current?.pause();
    }, []);

    const stop = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      setCurrentTime(0);
    }, []);

    useImperativeHandle(ref, () => ({ play, pause, stop }), [
      play,
      pause,
      stop,
    ]);

    // `file` → object URL same-origin (criado/revogado aqui).
    useEffect(() => {
      if (!file) {
        setObjectUrl(undefined);
        return;
      }
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }, [file]);

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

    useAudioSpectrum(audioRef, playing, { barCount, onFrame: drawSpectrum });

    // Ao pausar/parar, restaura as barras de repouso.
    useEffect(() => {
      if (playing) return;
      restBars.forEach((restBar, i) => {
        const bar = barRefs.current[i];
        if (bar) bar.style.height = `${restBar.height}px`;
      });
    }, [playing, restBars]);

    // Controle declarativo: sincroniza o áudio com a prop `status`.
    useEffect(() => {
      if (status === undefined) return;
      if (status === 'playing') play();
      else if (status === 'paused') pause();
      else stop();
    }, [status, resolvedSrc, play, pause, stop]);

    // Autoplay robusto (só quando `status` NÃO é controlado): tenta tocar ao
    // carregar; se o navegador bloquear (exige gesto), começa no 1º clique/tecla.
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio || !autoPlay || status !== undefined || !resolvedSrc) return;
      const tryPlay = () => {
        audio.play().catch(() => {});
      };
      tryPlay();
      window.addEventListener('pointerdown', tryPlay, { once: true });
      window.addEventListener('keydown', tryPlay, { once: true });
      return () => {
        window.removeEventListener('pointerdown', tryPlay);
        window.removeEventListener('keydown', tryPlay);
      };
    }, [autoPlay, status, resolvedSrc]);

    const handlePlay = () => {
      setPlaying(true);
      onPlayingChange?.(true);
    };

    const handlePause = () => {
      setPlaying(false);
      onPlayingChange?.(false);
    };

    const handleEnded = () => {
      setPlaying(false);
      onPlayingChange?.(false);
      setCurrentTime(0);
      onEnded?.();
    };

    return (
      <div
        className={cn(
          'font-quicksand inline-flex items-center gap-4',
          className
        )}
      >
        <audio
          ref={audioRef}
          src={resolvedSrc}
          crossOrigin={crossOrigin}
          loop={loop}
          preload="metadata"
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={
            showTime
              ? () => setCurrentTime(audioRef.current?.currentTime ?? 0)
              : undefined
          }
          onEnded={handleEnded}
        >
          <track kind="captions" />
        </audio>

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
            {formatTimeSpent(currentTime)}
          </span>
        )}
      </div>
    );
  }
);
AudioMixerPapole.displayName = 'AudioMixerPapole';
