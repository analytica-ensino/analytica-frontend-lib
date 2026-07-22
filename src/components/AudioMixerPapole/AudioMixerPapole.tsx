import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn, formatTimeSpent } from '../../utils/utils';
import { useAudioSpectrum } from '../../hooks/useAudioSpectrum';

export interface AudioMixerPapoleProps {
  /** URL (ou blob URL) do áudio. */
  src?: string;
  /**
   * Alternativa a `src`: um arquivo/blob. Vira um object URL same-origin
   * internamente (criado/revogado pelo componente) — dispensa `crossOrigin`.
   */
  file?: File | Blob;
  /**
   * Controla play/pause. `true` → toca e as barras reagem; `false` → pausa e as
   * barras voltam ao repouso. Se **omitido** (`undefined`), o componente fica
   * "não-controlado" (use `autoPlay` ou os eventos nativos do áudio).
   */
  isPlaying?: boolean;
  /**
   * Toca sozinho, sem interação. Tenta tocar ao carregar; se o navegador
   * bloquear (política de autoplay exige um gesto), começa no primeiro
   * clique/tecla na página. Ignorado quando `isPlaying` é controlado.
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
  /** Chamado quando o áudio termina (o tempo é resetado p/ 0). */
  onEnded?: () => void;
  /** Classes extras no container. */
  className?: string;
}

// Faixa de altura (px) das barras enquanto reagem ao áudio.
const PAPOLE_MIXER_MIN_H = 8;
const PAPOLE_MIXER_MAX_H = 56;

// Alturas de repouso (px): onda simétrica suave (mais alta no meio).
const buildRestHeights = (count: number): number[] =>
  Array.from({ length: count }, (_, index) => {
    const t = count > 1 ? index / (count - 1) : 0.5;
    return Math.round(14 + Math.sin(Math.PI * t) * 26); // ~14..40
  });

/**
 * Equalizador/"mixer" Papolê: barras verdes que **reagem a um áudio** (via `src`
 * ou `file`) enquanto ele toca, com um tempo `HH:MM:SS` opcional (`showTime`) que
 * sobe conforme o áudio anda.
 *
 * A reação usa Web Audio (`useAudioSpectrum`). Áudio de **outra origem sem CORS**
 * fica mudo ao passar pelo analyser — prefira `file`/blob (same-origin) ou
 * `crossOrigin="anonymous"` + servidor com CORS.
 */
export const AudioMixerPapole = ({
  src,
  file,
  isPlaying,
  autoPlay = false,
  loop = false,
  showTime = false,
  barCount = 13,
  crossOrigin,
  onEnded,
  className,
}: AudioMixerPapoleProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Estado real de reprodução (reflete play/pause de qualquer origem).
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

  const restHeights = useMemo(() => buildRestHeights(barCount), [barCount]);
  const resolvedSrc = objectUrl ?? src;

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
    restHeights.forEach((height, i) => {
      const bar = barRefs.current[i];
      if (bar) bar.style.height = `${height}px`;
    });
  }, [playing, restHeights]);

  // Modo controlado: reage à prop `isPlaying`.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isPlaying === undefined) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, resolvedSrc]);

  // Autoplay robusto (não-controlado): tenta tocar ao carregar; se o navegador
  // bloquear (exige gesto), começa no primeiro clique/tecla na página.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !autoPlay || isPlaying !== undefined || !resolvedSrc) return;
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
  }, [autoPlay, isPlaying, resolvedSrc]);

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    onEnded?.();
  };

  return (
    <div
      className={cn('font-quicksand inline-flex items-center gap-4', className)}
    >
      <audio
        ref={audioRef}
        src={resolvedSrc}
        crossOrigin={crossOrigin}
        loop={loop}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
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
        {restHeights.map((height, index) => (
          <span
            key={index}
            ref={(bar) => {
              barRefs.current[index] = bar;
            }}
            style={{ height }}
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
};
AudioMixerPapole.displayName = 'AudioMixerPapole';
